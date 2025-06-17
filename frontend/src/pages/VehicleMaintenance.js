import React from 'react';
import Navbar from '../components/navbar';
import VehicleForm from '../components/VehicleForm';

const VehicleMaintenance = () => {
  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <VehicleForm />
      </div>
    </>
  );
};

export default VehicleMaintenance;