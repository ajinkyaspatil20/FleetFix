from datetime import datetime

# Vehicle Schema for MongoDB
class Vehicle:
    def __init__(self, model_name, age, fcr, mileage, abs_status, battery_status, service_history, vehicle_no):
        self.vehicle_no = vehicle_no
        self.model_name = model_name
        self.age = age
        self.fcr = fcr  # Fuel Consumption Rate
        self.mileage = mileage
        self.abs_status = abs_status
        self.battery_status = battery_status
        self.service_history = service_history
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()

    def to_dict(self):
        return {
            "vehicle_no": self.vehicle_no,
            "model_name": self.model_name,
            "age": self.age,
            "fcr": self.fcr,
            "mileage": self.mileage,
            "abs_status": self.abs_status,
            "battery_status": self.battery_status,
            "service_history": self.service_history,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }

# Prediction History Schema for MongoDB
class PredictionHistory:
    def __init__(self, vehicle_no, prediction_data, prediction_result):
        self.vehicle_no = vehicle_no
        self.prediction_data = {
            "odometer_reading": prediction_data.get("odometer_reading"),
            "current_payload": prediction_data.get("current_payload"),
            "fcr": prediction_data.get("fcr"),
            "engine_temperature": prediction_data.get("engine_temperature"),
            "oil_pressure": prediction_data.get("oil_pressure"),
            "tyre_pressure_front": prediction_data.get("tyre_pressure_front"),
            "tyre_pressure_rear": prediction_data.get("tyre_pressure_rear"),
            "abs_status": prediction_data.get("abs_status"),
            "avg_speed": prediction_data.get("avg_speed"),
            "coolant_temperature": prediction_data.get("coolant_temperature"),
            "battery_status": prediction_data.get("battery_status"),
            "rpm": prediction_data.get("rpm"),
            "time_lastmaintenance": prediction_data.get("time_lastmaintenance"),
            "maintenance_history": prediction_data.get("maintenance_history"),
            "service_history": prediction_data.get("service_history"),
            "weather": prediction_data.get("weather"),
            "road_type": prediction_data.get("road_type")
        }
        self.prediction_result = prediction_result
        self.predicted_at = datetime.utcnow()

    def to_dict(self):
        return {
            "vehicle_no": self.vehicle_no,
            "prediction_data": self.prediction_data,
            "prediction_result": self.prediction_result,
            "predicted_at": self.predicted_at
        }