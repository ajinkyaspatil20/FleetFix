from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
import os
from dotenv import load_dotenv
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables from .env
load_dotenv()

# MongoDB Atlas Connection
try:
    mongo_uri = os.getenv("MONGO_URI")
    if not mongo_uri:
        raise ValueError("MONGO_URI environment variable is not set")

    client = MongoClient(
        mongo_uri,
        serverSelectionTimeoutMS=5000,  # Set timeout for server selection
        connectTimeoutMS=10000,  # Set timeout for initial connection
        socketTimeoutMS=30000,  # Set a 30-second timeout for socket operations
        connect=True,  # Make sure we connect immediately
        retryWrites=True,  # Enable retryable writes
        directConnection=False,  # Allow for DNS SRV resolution
        appName="vehicle_maintenance"  # Set application name for monitoring
    )
    
    # Verify connection is successful
    client.admin.command('ping')
    logger.info("Successfully connected to MongoDB")
    
    db = client["vehicle_maintenance"]
except (ConnectionFailure, ServerSelectionTimeoutError) as e:
    logger.error(f"Failed to connect to MongoDB: {str(e)}")
    raise
except ValueError as e:
    logger.error(str(e))
    raise

# Collections
users_collection = db["users"]
vehicles_collection = db["vehicles"]
prediction_history_collection = db["prediction_history"]
garages_collection = db["garages"]