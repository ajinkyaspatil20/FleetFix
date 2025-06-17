from datetime import datetime

class Garage:
    def __init__(self, name, lat, lng, address, contact):
        self.name = name
        self.lat = lat
        self.lng = lng
        self.address = address
        self.contact = contact
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()

    def to_dict(self):
        return {
            'name': self.name,
            'lat': self.lat,
            'lng': self.lng,
            'address': self.address,
            'contact': self.contact,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }

    @staticmethod
    def calculate_distance(lat1, lng1, lat2, lng2):
        """Calculate distance between two points in kilometers"""
        from math import radians, sin, cos, sqrt, atan2

        R = 6371  # Earth's radius in kilometers

        lat1, lng1, lat2, lng2 = map(radians, [lat1, lng1, lat2, lng2])
        dlat = lat2 - lat1
        dlng = lng2 - lng1

        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlng/2)**2
        c = 2 * atan2(sqrt(a), sqrt(1-a))
        distance = R * c

        return distance