from flask import Flask, request, jsonify
import joblib  # For loading ML models
import numpy as np
import pandas as pd  # For DataFrame handling
import google.generativeai as genai  # Gemini AI
import os  # For environment variables
from dotenv import load_dotenv  # Load .env file
from flask_cors import CORS  # ✅ Import CORS
from flask_bcrypt import Bcrypt  # ✅ Import Bcrypt for password hashing
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity  # ✅ Import JWT for authentication
from config import users_collection  # Import MongoDB collections from config

# Load environment variables from .env
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # ✅ Allow all origins

# Import blueprints after app initialization
from api.vehicle_routes import vehicle_bp
from api.garage_routes import garage_bp
from api.report_routes import report_bp

# Register blueprints
app.register_blueprint(vehicle_bp, url_prefix='/api')
app.register_blueprint(garage_bp, url_prefix='/api')
app.register_blueprint(report_bp, url_prefix='/api')

# Flask Security Configs
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "your_secret_key")  # Change in production
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# Load trained ML models safely
try:
    classifier = joblib.load("fclassifier.pkl")  # Classification model
    regressor = joblib.load("fregressor.pkl")  # Regression model
    scaler = joblib.load("fscaler.pkl")  # Feature scaler
except FileNotFoundError as e:
    raise FileNotFoundError(f"🚨 Model file missing: {e}")

# Get API Key securely
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("🚨 ERROR: Gemini API Key is missing! Check your .env file.")

# Configure Gemini AI API
genai.configure(api_key=api_key)

# Function to generate maintenance explanation using Gemini AI
def generate_explanation(features, maintenance_status):
    def generate_fallback_explanation(features, maintenance_status):
        # Component health scores (0-100)
        component_scores = {
            'engine': {
                'score': max(0, min(100, 100 - abs(features[5] - 90) - abs(features[6] - 70))),
                'status': '🟢' if features[5] < 100 and 60 < features[6] < 80 else '🔴',
                'details': {
                    'temperature': {'value': features[5], 'unit': '°C', 'optimal': '85-95'},
                    'oil_pressure': {'value': features[6], 'unit': 'psi', 'optimal': '60-80'}
                }
            },
            'tires': {
                'score': max(0, min(100, 100 - 5 * (abs(32.5 - features[7]) + abs(32.5 - features[8])))),
                'status': '🟢' if all([30 < features[7] < 35, 30 < features[8] < 35]) else '🔴',
                'details': {
                    'front': {'value': features[7], 'unit': 'psi', 'optimal': '30-35'},
                    'rear': {'value': features[8], 'unit': 'psi', 'optimal': '30-35'}
                }
            },
            'battery': {
                'score': 100 if features[12] == 1 else 30,
                'status': '🟢' if features[12] == 1 else '🔴',
                'details': {
                    'status': {'value': 'Healthy' if features[12] == 1 else 'Poor', 'optimal': 'Healthy'}
                }
            },
            'maintenance': {
                'score': max(0, min(100, 100 - (features[14] / 365) * 100)),
                'status': '🟢' if features[14] < 180 else '🔴',
                'details': {
                    'last_service': {'value': features[14], 'unit': 'days', 'optimal': '< 180'}
                }
            }
        }
        
        # Overall health score
        health_score = sum(c['score'] for c in component_scores.values()) / len(component_scores)
        
        # Urgency calculation with weighted factors
        base_urgency = 10 if not maintenance_status else 75
        urgency_factors = [
            1.2 if features[14] > 365 else 1.0,  # Time since maintenance
            1.15 if features[5] > 110 else 1.0,   # High temperature
            1.1 if features[6] < 40 else 1.0,     # Low oil pressure
            1.1 if min(features[7], features[8]) < 25 else 1.0  # Low tire pressure
        ]
        urgency_score = min(100, base_urgency * max(urgency_factors))

        # Generate enhanced explanation with charts
        return f"""📊 Vehicle Health Dashboard
{'=' * 50}

🔍 1. Component Health Analysis:
┌{'─' * 48}┐
│ Engine System {component_scores['engine']['status']}                              │
├{'─' * 48}┤
│ Temperature: {features[5]}°C ({component_scores['engine']['details']['temperature']['optimal']})     │
│ Oil Pressure: {features[6]} psi ({component_scores['engine']['details']['oil_pressure']['optimal']}) │
│ Health Score: {component_scores['engine']['score']:.1f}%                        │
└{'─' * 48}┘

┌{'─' * 48}┐
│ Tire System {component_scores['tires']['status']}                               │
├{'─' * 48}┤
│ Front: {features[7]} psi ({component_scores['tires']['details']['front']['optimal']})              │
│ Rear: {features[8]} psi ({component_scores['tires']['details']['rear']['optimal']})               │
│ Health Score: {component_scores['tires']['score']:.1f}%                        │
└{'─' * 48}┘

┌{'─' * 48}┐
│ Battery System {component_scores['battery']['status']}                           │
├{'─' * 48}┤
│ Status: {component_scores['battery']['details']['status']['value']}                               │
│ Health Score: {component_scores['battery']['score']:.1f}%                        │
└{'─' * 48}┘

📈 2. Overall Health Metrics:
┌{'─' * 48}┐
│ Vehicle Age: {features[0]} years                              │
│ Mileage: {features[4]} km/l                                  │
│ Last Service: {features[14]} days ago                         │
│ Overall Health: {health_score:.1f}%                           │
└{'─' * 48}┘

⚠️ 3. Maintenance Assessment:
┌{'─' * 48}┐
│ Status: {'🔴 MAINTENANCE REQUIRED' if maintenance_status else '🟢 NORMAL OPERATION'}              │
│ Urgency: {urgency_score:.1f}%                                │
└{'─' * 48}┘

🛠 4. Recommended Actions:
┌{'─' * 48}┐
{'│ ❗ Schedule immediate maintenance service' if maintenance_status else '│ ✓ Continue regular maintenance schedule'}           │
{'│ ❗ Focus on components with low health scores' if maintenance_status else '│ ✓ Monitor vehicle performance regularly'}          │
└{'─' * 48}┘"""

    prompt = f"""
    🚗 Vehicle Maintenance Prediction Report

    ▼ Vehicle Input Parameters:
    - Age: {features[0]} years (0–18)
    - Odometer Reading: {features[1]} km
    - Current Payload: {features[2]} tons (Max: 50)
    - Fuel Consumption Rate (FCR): {features[3]} L/100km
    - Mileage: {features[4]} km/l
    - Engine Temperature: {features[5]}°C
    - Oil Pressure: {features[6]} psi
    - Tyre Pressure (Front): {features[7]} psi
    - Tyre Pressure (Rear): {features[8]} psi
    - ABS Status: {'ON' if features[9] == 1 else 'OFF'}
    - Average Speed: {features[10]} km/h
    - Coolant Temperature: {features[11]}°C
    - Battery Status: {'Healthy' if features[12] == 1 else 'Unhealthy'}
    - RPM: {features[13]}
    - Time Since Last Maintenance: {features[14]} days
    - Maintenance History: {features[15]}
    - Service History Count: {features[16]}
    - Weather: {features[17]}
    - Road Type: {features[18]}

    ▼ Prediction Result:
    - Maintenance Required: {'Yes' if maintenance_status == 1 else 'No'}

    Please provide a concise and structured explanation of the vehicle's condition and maintenance recommendation in the following format:

    -----------------------------------------
    🔍 1. Vehicle Condition Analysis:
    - Provide a brief but clear analysis of the vehicle's current performance and reliability based on the input parameters.

    🛠 2. Identified Maintenance Issues:
    - List any issues or early warning signs detected through the sensor and usage data.

    ✅ 3. Recommended Maintenance Actions:
    - Suggest what type of service or maintenance is needed and the priority level.

    📊 4. Technical Breakdown:
    - Present a technical health score of the vehicle in percentage form (e.g., "Vehicle Health: 74%").

    ⚠️ 5. Urgency of Maintenance:
    - Estimate a maintenance urgency score (0 to 100%) based on severity and risk.
    - If Maintenance is "No", the urgency should be <15%.
    - If Maintenance is "Yes", urgency should be between 60% and 100%.
    -----------------------------------------

    ⚠️ Note: Ensure that the language is simple and clear enough for both technical and non-technical users.
    """

    try:
        model = genai.GenerativeModel("gemini-1.5-pro")
        response = model.generate_content(prompt)
        return response.text if hasattr(response, "text") else generate_fallback_explanation(features, maintenance_status)
    except Exception as e:
        print(f"Gemini API Error: {str(e)}")
        return generate_fallback_explanation(features, maintenance_status)


# Home route
@app.route("/")
def home():
    return "🚀 Flask API is running with ML models and Gemini AI!"

# Prediction route
@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()
        if "features" not in data:
            return jsonify({"error": "Missing 'features' in request data"}), 400
        
        features = np.array(data["features"]).reshape(1, -1)
        print("🚨 Raw Input Features:", data["features"])

        # Scale features
        features_scaled = scaler.transform(features)
        print("📊 Scaled Features:", features_scaled)

        # Make predictions
        maintenance_status = classifier.predict(features_scaled)[0]
        maintenance_percentage = regressor.predict(features_scaled)[0]

        # Generate Gemini explanation
        explanation = generate_explanation(features[0].tolist(), maintenance_status)

        return jsonify({
            "Maintenance_Need": bool(maintenance_status),
            "Need_Percentage": float(maintenance_percentage),
            "explanation": explanation
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# 🔹 User Registration Route
@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    email = data.get("email")
    name = data.get("name")
    password = bcrypt.generate_password_hash(data.get("password")).decode("utf-8")

    if users_collection.find_one({"email": email}):
        return jsonify({"message": "User already exists"}), 400

    users_collection.insert_one({"email": email, "name": name, "password": password})
    return jsonify({"message": "User registered successfully"}), 201

# 🔹 User Login Route
@app.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        if not data:
            logger.error("No JSON data received in login request")
            return jsonify({"message": "Missing request data"}), 400

        email = data.get("email")
        password = data.get("password")
        if not email or not password:
            logger.error("Missing email or password in login request")
            return jsonify({"message": "Email and password are required"}), 400

        logger.info(f"Login attempt for email: {email}")
        user = users_collection.find_one({"email": email})
        logger.info(f"User found: {user is not None}")

        if not user:
            logger.warning(f"Login failed: User not found for email {email}")
            return jsonify({"message": "Invalid credentials"}), 401

        logger.info("Checking password...")
        password_match = bcrypt.check_password_hash(user["password"], password)
        logger.info(f"Password match: {password_match}")

        if password_match:
            access_token = create_access_token(identity=user["email"])
            logger.info(f"Login successful for user: {email}")
            return jsonify({"access_token": access_token, "name": user["name"]}), 200
        else:
            logger.warning(f"Login failed: Invalid password for user {email}")
            return jsonify({"message": "Invalid credentials"}), 401

    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return jsonify({"message": "An error occurred during login"}), 500

# 🔹 Protected Route (For Authenticated Users)
@app.route("/protected", methods=["GET"])
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    return jsonify({"message": f"Hello {current_user}, you are authorized!"}), 200

# Run Flask app securely
if __name__ == "__main__":
    debug_mode = os.getenv("FLASK_DEBUG", "False").lower() == "true"
    app.run(debug=debug_mode)
