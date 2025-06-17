import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axiosConfig';
import { toast } from 'react-toastify';

const PredictionForm = ({ vehicleData }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    vehicle_no: vehicleData?.vehicle_no || '',
    mileage: '',
    engine_temperature: '',
    oil_level: '',
    tire_pressure: '',
    brake_condition: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const features = [
        parseFloat(formData.mileage),
        parseFloat(formData.engine_temperature),
        parseFloat(formData.oil_level),
        parseFloat(formData.tire_pressure),
        parseFloat(formData.brake_condition)
      ];

      const response = await axios.post('/predict', { features });
      
      // Save prediction history
      await axios.post('/api/vehicles/predictions', {
        vehicle_no: formData.vehicle_no,
        prediction_data: formData,
        prediction_result: response.data
      });

      toast.success('Maintenance prediction completed successfully!');
      
      // Show prediction results
      const { need_maintenance, maintenance_percentage, explanation } = response.data;
      toast.info(`Maintenance Need: ${need_maintenance ? 'Yes' : 'No'}\nProbability: ${maintenance_percentage.toFixed(2)}%\n${explanation}`);
      
      navigate('/vehicle-management');
    } catch (error) {
      toast.error('Error making prediction: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Predict Maintenance</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Vehicle Number</label>
          <input
            type="text"
            name="vehicle_no"
            value={formData.vehicle_no}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
            readOnly
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Mileage (km)</label>
          <input
            type="number"
            name="mileage"
            value={formData.mileage}
            onChange={handleChange}
            step="0.1"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Engine Temperature (°C)</label>
          <input
            type="number"
            name="engine_temperature"
            value={formData.engine_temperature}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Oil Level (%)</label>
          <input
            type="number"
            name="oil_level"
            value={formData.oil_level}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Tire Pressure (PSI)</label>
          <input
            type="number"
            name="tire_pressure"
            value={formData.tire_pressure}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Brake Condition (%)</label>
          <input
            type="number"
            name="brake_condition"
            value={formData.brake_condition}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/vehicle-management')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Predict
          </button>
        </div>
      </form>
    </div>
  );
};

export default PredictionForm;