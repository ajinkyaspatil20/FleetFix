import React, { useState, useEffect } from 'react';
import axios from '../utils/axiosConfig';
import { toast } from 'react-toastify';
import { Dialog, Transition } from '@headlessui/react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/navbar';

const VehicleManagement = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [formData, setFormData] = useState({
    model_name: '',
    age: '',
    fcr: '',
    mileage: '',
    abs_status: '',
    battery_status: '',
    service_history: '',
    vehicle_no: ''
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await axios.get('/api/vehicles');
      setVehicles(response.data);
    } catch (error) {
      toast.error('Failed to fetch vehicles');
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode && selectedVehicle) {
        const { _id, ...updateData } = formData;
        await axios.put(`/api/vehicles/${selectedVehicle.vehicle_no}`, updateData);
        toast.success('Vehicle updated successfully');
      } else {
        await axios.post('/api/vehicles', formData);
        toast.success('Vehicle added successfully');
      }
      setFormData({
        model_name: '',
        age: '',
        fcr: '',
        mileage: '',
        abs_status: '',
        battery_status: '',
        service_history: '',
        vehicle_no: ''
      });
      fetchVehicles();
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to add vehicle';
      console.error('Error adding vehicle:', error);
      toast.error(errorMessage);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">Vehicle Management</h1>
        <div className="space-x-4">
          <button
            onClick={() => setIsOpen(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add Vehicle
          </button>
          <button
            onClick={() => navigate('/vehicle-maintenance')}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Predict Maintenance
          </button>
        </div>
      </div>

      {/* Vehicle List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((vehicle) => (
              <div key={vehicle._id} className="border p-4 rounded-lg shadow relative group">
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      setSelectedVehicle(vehicle);
                      setFormData(vehicle);
                      setIsEditMode(true);
                      setIsOpen(true);
                    }}
                    className="bg-blue-500 text-white px-2 py-1 rounded mr-2 text-sm hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={async () => {
                      if (window.confirm('Are you sure you want to delete this vehicle?')) {
                        try {
                          await axios.delete(`/api/vehicles/${vehicle.vehicle_no}`);
                          toast.success('Vehicle deleted successfully');
                          fetchVehicles();
                        } catch (error) {
                          toast.error('Failed to delete vehicle');
                        }
                      }
                    }}
                    className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
                <h3 className="font-bold">{vehicle.model_name}</h3>
                <p>Vehicle No: {vehicle.vehicle_no}</p>
                <p>Age: {vehicle.age} years</p>
                <p>Mileage: {parseFloat(vehicle.mileage).toFixed(1)} km</p>
                <p>FCR: {vehicle.fcr}</p>
                <p>ABS Status: {vehicle.abs_status}</p>
                <p>Battery Status: {vehicle.battery_status}</p>
              </div>
            ))}
          </div>

      {/* Add Vehicle Modal */}
      <Transition appear show={isOpen} as={React.Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 overflow-y-auto"
          onClose={() => setIsOpen(false)}
        >
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-black/50" />
            </Transition.Child>

            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="inline-block w-full max-w-lg p-8 my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                <Dialog.Panel className="relative">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-0 right-0 p-2 text-gray-400 hover:text-gray-500"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <h2 className="text-2xl font-bold mb-6">{isEditMode ? 'Edit Vehicle' : 'Add New Vehicle'}</h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Model Name</label>
                      <input
                        type="text"
                        name="model_name"
                        value={formData.model_name}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md shadow-sm p-2.5 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Number</label>
                      <input
                        type="text"
                        name="vehicle_no"
                        value={formData.vehicle_no}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md shadow-sm p-2.5 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Age (years)</label>
                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md shadow-sm p-2.5 focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                        max="20"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">FCR</label>
                      <input
                        type="number"
                        name="fcr"
                        value={formData.fcr}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md shadow-sm p-2.5 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Mileage (km)</label>
                      <input
                        type="number"
                        name="mileage"
                        value={formData.mileage}
                        onChange={handleInputChange}
                        step="0.1"
                        className="w-full border border-gray-300 rounded-md shadow-sm p-2.5 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ABS Status</label>
                      <select
                        name="abs_status"
                        value={formData.abs_status}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md shadow-sm p-2.5 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Select ABS Status</option>
                        <option value="1">Functional</option>
                        <option value="0">Faulty</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Battery Status</label>
                      <select
                        name="battery_status"
                        value={formData.battery_status}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md shadow-sm p-2.5 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Select Battery Status</option>
                        <option value="0">High</option>
                        <option value="1">Low</option>
                        <option value="2">Medium</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Service History (count)</label>
                      <input
                        type="number"
                        name="service_history"
                        value={formData.service_history}
                        onChange={handleInputChange}
                        min="0"
                        className="w-full border border-gray-300 rounded-md shadow-sm p-2.5 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                      {isEditMode ? 'Update Vehicle' : 'Add Vehicle'}
                    </button>
                  </form>
                </Dialog.Panel>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>


      </div>
    </>
  );
};

export default VehicleManagement;