from flask import Blueprint, jsonify, request
from models.garage import Garage
from config import garages_collection

garage_bp = Blueprint('garage_bp', __name__)

@garage_bp.route('/garages', methods=['GET'])
def get_garages():
    try:
        lat = request.args.get('lat', type=float)
        lng = request.args.get('lng', type=float)
        radius = request.args.get('radius', default=10, type=float)

        if not lat or not lng:
            garages = list(garages_collection.find({}))
        else:
            # Get all garages and filter by distance
            all_garages = list(garages_collection.find({}))
            garages = [garage for garage in all_garages 
                      if Garage.calculate_distance(lat, lng, garage['lat'], garage['lng']) <= radius]

        # Convert ObjectId to string for JSON serialization
        for garage in garages:
            garage['_id'] = str(garage['_id'])

        return jsonify({
            'status': 'success',
            'data': garages,
            'count': len(garages)
        })

    except Exception as e:
        return jsonify({
            'status': 'error',
            'error': str(e)
        }), 500

@garage_bp.route('/garages', methods=['POST'])
def add_garage():
    try:
        data = request.get_json()
        new_garage = Garage(
            name=data['name'],
            lat=data['lat'],
            lng=data['lng'],
            address=data['address'],
            contact=data['contact']
        )
        
        result = garages_collection.insert_one(new_garage.to_dict())
        new_garage_data = garages_collection.find_one({'_id': result.inserted_id})
        new_garage_data['_id'] = str(new_garage_data['_id'])

        return jsonify({
            'status': 'success',
            'data': new_garage_data
        }), 201

    except Exception as e:
        return jsonify({
            'status': 'error',
            'error': str(e)
        }), 400