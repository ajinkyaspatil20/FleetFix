from pymongo import MongoClient, ASCENDING, DESCENDING
from config import db

def init_database():
    try:
        # Create indexes for users collection
        db.users.create_index([('email', ASCENDING)], unique=True)

        # Create indexes for vehicles collection
        db.vehicles.create_index([('vehicle_no', ASCENDING)], unique=True)
        db.vehicles.create_index([('created_at', DESCENDING)])

        # Create indexes for prediction_history collection
        db.prediction_history.create_index([('vehicle_no', ASCENDING)])
        db.prediction_history.create_index([('created_at', DESCENDING)])

        # Create indexes for garages collection
        db.garages.create_index([('name', ASCENDING)])
        db.garages.create_index([('lat', ASCENDING), ('lng', ASCENDING)])

        # Add schema validation for users collection
        db.command({
            'collMod': 'users',
            'validator': {
                '$jsonSchema': {
                    'bsonType': 'object',
                    'required': ['email', 'name', 'password'],
                    'properties': {
                        'email': {'bsonType': 'string'},
                        'name': {'bsonType': 'string'},
                        'password': {'bsonType': 'string'}
                    }
                }
            }
        })

        # Add schema validation for vehicles collection
        db.command({
            'collMod': 'vehicles',
            'validator': {
                '$jsonSchema': {
                    'bsonType': 'object',
                    'required': ['vehicle_no', 'model_name', 'age', 'fcr', 'mileage'],
                    'properties': {
                        'vehicle_no': {'bsonType': 'string'},
                        'model_name': {'bsonType': 'string'},
                        'age': {'bsonType': 'int'},
                        'fcr': {'bsonType': 'double'},
                        'mileage': {'bsonType': 'double'},
                        'abs_status': {'bsonType': 'bool'},
                        'battery_status': {'bsonType': 'bool'},
                        'service_history': {'bsonType': 'array'}
                    }
                }
            }
        })

        print('✅ Database initialization completed successfully!')
        
    except Exception as e:
        print(f'❌ Error initializing database: {str(e)}')

if __name__ == '__main__':
    init_database()