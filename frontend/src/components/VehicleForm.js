import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const VehicleForm = () => {
  const [vehicleNo, setVehicleNo] = useState("");
  const [features, setFeatures] = useState(Array(19).fill("").map((_, index) => {
    // Set default values for specific parameters
    switch(index) {
      case 13: return "1500";  // RPM
      case 7: return "110";   // Tyre Pressure Front
      case 8: return "100";   // Tyre Pressure Rear
      case 5: return "95";    // Engine Temperature
      case 6: return "45";    // Oil Pressure
      case 11: return "90";   // Coolant Temperature
      default: return "";
    }
  }));
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [vehicles, setVehicles] = useState([]);
  const reportRef = useRef(null);

  const downloadPDF = async () => {
    if (reportRef.current) {
      const canvas = await html2canvas(reportRef.current);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('maintenance-prediction-report.pdf');
    }
  };

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authentication required");
          return;
        }
        const response = await axios.get("http://127.0.0.1:5000/api/vehicles", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (response.data && Array.isArray(response.data)) {
          setVehicles(response.data);
        } else {
          setError("Invalid vehicle data format");
        }
      } catch (err) {
        console.error("Failed to fetch vehicles:", err);
        setError("Failed to load vehicles: " + (err.response?.data?.message || err.message));
      }
    };
    fetchVehicles();
  }, []);

  // Input field definitions with their constraints
  const inputFields = [
    { 
      label: "Vehicle Number", 
      type: "select", 
      value: vehicleNo, 
      onChange: (e) => handleVehicleSelect(e.target.value), 
      required: true,
      options: [
        { value: "", label: "Select Vehicle" },
        ...vehicles.map(vehicle => ({
          value: vehicle.vehicle_no,
          label: `${vehicle.model_name} (${vehicle.vehicle_no})`
        }))
      ]
    },
    { label: "Age (0-18)", type: "number", min: 0, max: 18 },
    { label: "Odometer Reading", type: "number", min: 0 },
    { label: "Current Payload (tons, max 50)", type: "number", min: 0, max: 50 },
    { label: "Fuel Consumption Rate", type: "number", min: 0 },
    { label: "Mileage", type: "number", min: 0, step: "0.1" },
    { label: "Engine Temperature", type: "number" },
    { label: "Oil Pressure", type: "number", min: 0 },
    { label: "Tyre Pressure Front (psi)", type: "number", min: 0 },
    { label: "Tyre Pressure Rear (psi)", type: "number", min: 0 },
    { label: "ABS Status", type: "select", options: [
      { value: "1", label: "Functional" },
      { value: "0", label: "Faulty" }
    ]},
    { label: "Average Speed (km/h)", type: "number", min: 0 },
    { label: "Coolant Temperature", type: "number" },
    { label: "Battery Status", type: "select", options: [
      { value: "0", label: "High" },
      { value: "1", label: "Low" },
      { value: "2", label: "Medium" }
    ]},
    { label: "RPM", type: "number", min: 0 },
    { label: "Time Since Last Maintenance (days)", type: "number", min: 0 },
    { label: "Maintenance History", type: "number", min: 0 },
    { label: "Service History (count)", type: "number", min: 0 },
    { label: "Weather", type: "select", options: [
      { value: "0", label: "Humid" },
      { value: "1", label: "Rainy" },
      { value: "2", label: "Snowy" },
      { value: "3", label: "Sunny" }
    ]},
    { label: "Road Type", type: "select", options: [
      { value: "0", label: "City" },
      { value: "1", label: "Highway" },
      { value: "2", label: "Mountainous" },
      { value: "3", label: "Off road" }
    ]}
  ];

  // Handle feature input changes
  const handleFeatureChange = (index, value) => {
    const updatedFeatures = [...features];
    updatedFeatures[index] = value;
    setFeatures(updatedFeatures);
  };

  const handleVehicleSelect = (selectedVehicleNo) => {
    setVehicleNo(selectedVehicleNo);
    const selectedVehicleData = vehicles.find(v => v.vehicle_no === selectedVehicleNo);
    
    if (selectedVehicleData) {
      const updatedFeatures = [...features];
      updatedFeatures[0] = selectedVehicleData.age?.toString() || "";
      updatedFeatures[1] = "";
      updatedFeatures[2] = "";
      updatedFeatures[3] = selectedVehicleData.fcr?.toString() || "";
      updatedFeatures[4] = selectedVehicleData.mileage?.toString() || "";
      updatedFeatures[5] = "95";    // Engine Temperature
      updatedFeatures[6] = "45";    // Oil Pressure
      updatedFeatures[7] = "110";   // Tyre Pressure Front
      updatedFeatures[8] = "100";   // Tyre Pressure Rear
      updatedFeatures[9] = selectedVehicleData.abs_status?.toString() || "";
      updatedFeatures[10] = "";
      updatedFeatures[11] = "90";   // Coolant Temperature
      updatedFeatures[12] = selectedVehicleData.battery_status?.toString() || "";
      updatedFeatures[13] = "1500"; // RPM
      updatedFeatures[14] = "";
      updatedFeatures[15] = selectedVehicleData.service_history?.toString() || "";
      updatedFeatures[16] = "";
      updatedFeatures[17] = "";
      updatedFeatures[18] = "";
      setFeatures(updatedFeatures);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!vehicleNo.trim()) {
      setError("Vehicle number is required");
      return;
    }

    setLoading(true);
    setError("");
    setResponse(null);

    try {
      // Save prediction data
      const predictionData = {
        vehicle_no: vehicleNo,
        prediction_data: {
          age: features[0],
          odometer_reading: features[1],
          current_payload: features[2],
          fcr: features[3],
          mileage: features[4],
          engine_temperature: features[5],
          oil_pressure: features[6],
          tyre_pressure_front: features[7],
          tyre_pressure_rear: features[8],
          abs_status: features[9],
          avg_speed: features[10],
          coolant_temperature: features[11],
          battery_status: features[12],
          rpm: features[13],
          time_lastmaintenance: features[14],
          maintenance_history: features[15],
          service_history: features[16],
          weather: features[17],
          road_type: features[18]
        }
      };

      // Get prediction
      const res = await axios.post(
        "http://127.0.0.1:5000/predict",
        { features: features.map((f) => (f ? Number(f) : 0)) },
        { headers: { "Content-Type": "application/json" } }
      );

      // Save prediction result
      await axios.post(
        "http://127.0.0.1:5000/api/predictions",
        {
          ...predictionData,
          prediction_result: {
            need_maintenance: res.data.Maintenance_Need,
            maintenance_percentage: res.data.Need_Percentage,
            explanation: res.data.explanation
          }
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      setResponse(res.data);
    } catch (err) {
      console.error("Request Error:", err.response?.data || err.message);
      setError("Failed to get prediction. Please check your input and try again.");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gradient-to-br from-white to-gray-50 shadow-lg rounded-xl">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        <span className="text-blue-600">🚗</span> Vehicle Maintenance Prediction
      </h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {inputFields.map((field, index) => (
          <div key={index} className="flex flex-col space-y-2">
            <label className="block text-sm font-medium text-gray-700">{field.label}</label>
            {field.type === "select" ? (
              <select
                value={index === 0 ? vehicleNo : features[index - 1] || ""}
                onChange={(e) => index === 0 ? handleVehicleSelect(e.target.value) : handleFeatureChange(index - 1, e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                required
              >
                <option value="">Select {field.label}</option>
                {field.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={field.type}
                value={index === 0 ? vehicleNo : features[index - 1] || ""}
                onChange={(e) => index === 0 ? setVehicleNo(e.target.value) : handleFeatureChange(index - 1, e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
                min={field.min}
                max={field.max}
              />
            )}
          </div>
        ))}

        <div className="md:col-span-2">
          <button
            type="submit"
            className={`w-full p-3 rounded-md font-medium ${
            loading ? "bg-gray-500" : "bg-blue-600 hover:bg-blue-700"
          } text-white transition-colors duration-200`}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Predicting...
              </span>
            ) : (
              "Get Prediction"
            )}
          </button>
        </div>
      </form>

      {/* Error Message */}
      {error && <p className="text-red-500 mt-4">{error}</p>}

      {/* Prediction Results */}
      {response && (
        <div ref={reportRef} className="md:col-span-2 mt-8 p-6 bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-100 shadow-sm">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-blue-600">📊</span> Prediction Results
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="text-sm text-gray-600 mb-1">Maintenance Status</div>
              <div className="text-lg font-semibold flex items-center gap-2">
                <span className="text-blue-600">🛠</span>
                {response.Maintenance_Need ? (
                  <span className="text-red-600">Maintenance Required</span>
                ) : (
                  <span className="text-green-600">No Maintenance Needed</span>
                )}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="text-sm text-gray-600 mb-1">Maintenance Urgency</div>
              <div className="text-lg font-semibold">
                <span className="text-blue-600">📈</span>
                {response.Need_Percentage ? response.Need_Percentage.toFixed(2) : 0}%
              </div>
              <div className={`text-sm mt-1 ${response.Need_Percentage >= 75 ? 'text-red-600' : response.Need_Percentage >= 50 ? 'text-yellow-600' : 'text-green-600'}`}>
                {response.Need_Percentage >= 75 ? 'High Urgency' : response.Need_Percentage >= 50 ? 'Medium Urgency' : 'Low Urgency'}
              </div>
            </div>
          </div>

          {/* Explanation Display */}
          <div className="mt-6">
            <p className="font-bold flex items-center gap-2">
              <span>🔍</span> Analysis & Recommendations:
            </p>
            <ul className="list-disc ml-5 mt-2 space-y-2">
              {response.explanation.split("\n").map((point, idx) => (
                <li key={idx} className="text-gray-700">{point}</li>
              ))}
            </ul>
          </div>
          <button
            onClick={downloadPDF}
            className="mt-6 w-full p-3 rounded-md font-medium bg-green-600 hover:bg-green-700 text-white transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <span>📥</span> Download PDF Report
          </button>
        </div>
      )}
    </div>
  );
};

export default VehicleForm;
