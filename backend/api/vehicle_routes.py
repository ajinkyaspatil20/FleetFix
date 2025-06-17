from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.vehicle import Vehicle, PredictionHistory
from datetime import datetime
from bson import ObjectId

vehicle_bp = Blueprint('vehicle', __name__)

# MongoDB collections
from config import vehicles_collection, prediction_history_collection

# Add new vehicle
@vehicle_bp.route('/vehicles', methods=['POST'])
@jwt_required()
def add_vehicle():
    try:
        data = request.get_json()
        # Validate required fields
        required_fields = ['vehicle_no', 'model_name', 'age', 'fcr', 'mileage']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400

        # Convert data types to match schema validation
        try:
            age = int(data['age'])
            fcr = float(data['fcr'])
            mileage = float(data['mileage'])
            abs_status = bool(int(data.get('abs_status', 0)))
            battery_status = bool(int(data.get('battery_status', 0)))
            service_history = data.get('service_history', [])
            if not isinstance(service_history, list):
                service_history = []
        except (ValueError, TypeError) as e:
            return jsonify({"error": "Invalid data types in request"}), 400

        vehicle = Vehicle(
            model_name=data.get('model_name'),
            age=age,
            fcr=fcr,
            mileage=mileage,
            abs_status=abs_status,
            battery_status=battery_status,
            service_history=service_history,
            vehicle_no=data.get('vehicle_no')
        )
        
        # Check if vehicle number already exists
        if vehicles_collection.find_one({"vehicle_no": vehicle.vehicle_no}):
            return jsonify({"error": "Vehicle number already exists"}), 400
            
        result = vehicles_collection.insert_one(vehicle.to_dict())
        return jsonify({"message": "Vehicle added successfully", "id": str(result.inserted_id)}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Get all vehicles
@vehicle_bp.route('/vehicles', methods=['GET'])
@jwt_required()
def get_vehicles():
    try:
        vehicles = list(vehicles_collection.find({}))
        # Convert ObjectId to string for JSON serialization
        for vehicle in vehicles:
            vehicle["_id"] = str(vehicle["_id"])
        return jsonify(vehicles), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Get vehicle by ID
@vehicle_bp.route('/vehicles/<vehicle_no>', methods=['GET'])
@jwt_required()
def get_vehicle(vehicle_no):
    try:
        vehicle = vehicles_collection.find_one({"vehicle_no": vehicle_no})
        if not vehicle:
            return jsonify({"error": "Vehicle not found"}), 404
        vehicle["_id"] = str(vehicle["_id"])
        return jsonify(vehicle), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Update vehicle
@vehicle_bp.route('/vehicles/<vehicle_no>', methods=['PUT'])
@jwt_required()
def update_vehicle(vehicle_no):
    try:
        data = request.get_json()
        data["updated_at"] = datetime.utcnow()
        
        result = vehicles_collection.update_one(
            {"vehicle_no": vehicle_no},
            {"$set": data}
        )
        
        if result.matched_count == 0:
            return jsonify({"error": "Vehicle not found"}), 404
            
        return jsonify({"message": "Vehicle updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Delete vehicle
@vehicle_bp.route('/vehicles/<vehicle_no>', methods=['DELETE'])
@jwt_required()
def delete_vehicle(vehicle_no):
    try:
        result = vehicles_collection.delete_one({"vehicle_no": vehicle_no})
        if result.deleted_count == 0:
            return jsonify({"error": "Vehicle not found"}), 404
        return jsonify({"message": "Vehicle deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Add prediction history
@vehicle_bp.route('/predictions', methods=['POST'])
@jwt_required()
def add_prediction():
    try:
        data = request.get_json()
        prediction_history = PredictionHistory(
            vehicle_no=data.get('vehicle_no'),
            prediction_data=data.get('prediction_data'),
            prediction_result=data.get('prediction_result')
        )
        
        result = prediction_history_collection.insert_one(prediction_history.to_dict())
        return jsonify({"message": "Prediction history added successfully", "id": str(result.inserted_id)}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Get prediction history for a vehicle
@vehicle_bp.route('/predictions/<vehicle_no>', methods=['GET'])
@jwt_required()
def get_prediction_history(vehicle_no):
    try:
        predictions = list(prediction_history_collection.find({"vehicle_no": vehicle_no}))
        for prediction in predictions:
            prediction["_id"] = str(prediction["_id"])
        return jsonify(predictions), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500