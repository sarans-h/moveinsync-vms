import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { RefreshCw, ZoomIn, ZoomOut, PlusCircle, Car, User, Plus, Link, X } from 'lucide-react';

function VehiclesAndDrivers() {
  const [permissions, setPermissions] = useState({
    vehicleOnboarding: false,
    driverOnboarding: false,
    assignVehicle: false
  });
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [driverData, setDriverData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    licenseNumber: '',
    licenseState: '',
    dateOfBirth: '',
    emergencyContact: {
      name: '',
      relationship: '',
      phoneNumber: ''
    }
  });
  const [vehicleData, setVehicleData] = useState({
    vehicleNo: '',
    ownerInfo: {
      name: '',
      phoneNo: ''
    }
  });

  useEffect(() => {
    fetchVendorPermissions();
    fetchUnassignedData();
  }, []);

  const fetchVendorPermissions = async () => {
    try {
      const userResponse = await axios.get('http://localhost:3002/api/vendors/verify', {
        withCredentials: true
      });
      const userId = userResponse.data.data.vendor._id;
    
      setPermissions(userResponse.data.data.vendor.permissions);
    } catch (error) {
      console.error('Error fetching vendor permissions:', error);
    }
  };

  const fetchUnassignedData = async () => {
    try {
      const [driversRes, vehiclesRes] = await Promise.all([
        axios.get('http://localhost:3003/api/drivers', { withCredentials: true }),
        axios.get('http://localhost:3004/api/vehicles', { withCredentials: true })
      ]);

      // Filter unassigned drivers and vehicles
      const unassignedDrivers = driversRes.data.drivers.filter(driver => !driver.vehicleAssigned);
      const unassignedVehicles = vehiclesRes.data.data.vehicles.filter(vehicle => !vehicle.driverAssigned);

      setDrivers(unassignedDrivers);
      setVehicles(unassignedVehicles);
    } catch (error) {
      console.error('Error fetching unassigned data:', error);
    }
  };

  const handleDriverSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3003/api/drivers', driverData, {
        withCredentials: true
      });
      setShowDriverModal(false);
      setDriverData({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        },
        licenseNumber: '',
        licenseState: '',
        dateOfBirth: '',
        emergencyContact: {
          name: '',
          relationship: '',
          phoneNumber: ''
        }
      });
    } catch (error) {
      console.error('Error onboarding driver:', error);
    }
  };

  const handleVehicleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3004/api/vehicles', vehicleData, {
        withCredentials: true
      });
      setShowVehicleModal(false);
      setVehicleData({
        vehicleNo: '',
        ownerInfo: {
          name: '',
          phoneNo: ''
        }
      });
    } catch (error) {
      console.error('Error onboarding vehicle:', error);
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3005/api/assignments', {
        driverId: selectedDriver,
        vehicleId: selectedVehicle
      }, {
        withCredentials: true
      });
      setShowAssignModal(false);
      setSelectedDriver('');
      setSelectedVehicle('');
      fetchUnassignedData(); // Refresh the unassigned data
    } catch (error) {
      console.error('Error assigning driver to vehicle:', error);
    }
  };

  const handleInputChange = (e, section) => {
    const { name, value } = e.target;
    if (section) {
      setDriverData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [name]: value
        }
      }));
    } else {
      setDriverData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleVehicleInputChange = (e, section) => {
    const { name, value } = e.target;
    if (section) {
      setVehicleData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [name]: value
        }
      }));
    } else {
      setVehicleData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Vehicles and Drivers Management</h1>
        <div className="flex gap-4">
          <button
            disabled={!permissions?.driverOnboarding}
            onClick={() => setShowDriverModal(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded ${
              permissions?.driverOnboarding
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Plus size={20} />
            Onboard Driver
          </button>
          <button
            disabled={!permissions?.vehicleOnboarding}
            onClick={() => setShowVehicleModal(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded ${
              permissions?.vehicleOnboarding
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Plus size={20} />
            Onboard Vehicle
          </button>
          <button
            disabled={!permissions?.assignVehicle}
            onClick={() => setShowAssignModal(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded ${
              permissions?.assignVehicle
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Link size={20} />
            Assign Driver
          </button>
          <button
            disabled={!permissions?.processPayments}
            className={`flex items-center gap-2 px-4 py-2 rounded ${
              permissions?.processPayments
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Link size={20} />
            Process Payment
          </button>
        </div>
      </div>

      {showDriverModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Onboard New Driver</h2>
              <button onClick={() => setShowDriverModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleDriverSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={driverData.firstName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={driverData.lastName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={driverData.phoneNumber}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={driverData.dateOfBirth}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    required
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-2">Address</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Street</label>
                    <input
                      type="text"
                      name="street"
                      value={driverData.address.street}
                      onChange={(e) => handleInputChange(e, 'address')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">City</label>
                    <input
                      type="text"
                      name="city"
                      value={driverData.address.city}
                      onChange={(e) => handleInputChange(e, 'address')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">State</label>
                    <input
                      type="text"
                      name="state"
                      value={driverData.address.state}
                      onChange={(e) => handleInputChange(e, 'address')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Zip Code</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={driverData.address.zipCode}
                      onChange={(e) => handleInputChange(e, 'address')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Country</label>
                    <input
                      type="text"
                      name="country"
                      value={driverData.address.country}
                      onChange={(e) => handleInputChange(e, 'address')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-2">License Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">License Number</label>
                    <input
                      type="text"
                      name="licenseNumber"
                      value={driverData.licenseNumber}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">License State</label>
                    <input
                      type="text"
                      name="licenseState"
                      value={driverData.licenseState}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-2">Emergency Contact</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={driverData.emergencyContact.name}
                      onChange={(e) => handleInputChange(e, 'emergencyContact')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Relationship</label>
                    <input
                      type="text"
                      name="relationship"
                      value={driverData.emergencyContact.relationship}
                      onChange={(e) => handleInputChange(e, 'emergencyContact')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={driverData.emergencyContact.phoneNumber}
                      onChange={(e) => handleInputChange(e, 'emergencyContact')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowDriverModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600"
                >
                  Onboard Driver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showVehicleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Onboard New Vehicle</h2>
              <button onClick={() => setShowVehicleModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleVehicleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Vehicle Number</label>
                <input
                  type="text"
                  name="vehicleNo"
                  value={vehicleData.vehicleNo}
                  onChange={handleVehicleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-2">Owner Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Owner Name</label>
                    <input
                      type="text"
                      name="name"
                      value={vehicleData.ownerInfo.name}
                      onChange={(e) => handleVehicleInputChange(e, 'ownerInfo')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Owner Phone Number</label>
                    <input
                      type="tel"
                      name="phoneNo"
                      value={vehicleData.ownerInfo.phoneNo}
                      onChange={(e) => handleVehicleInputChange(e, 'ownerInfo')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowVehicleModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600"
                >
                  Onboard Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Assign Driver to Vehicle</h2>
              <button onClick={() => setShowAssignModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Select Driver</label>
                <select
                  value={selectedDriver}
                  onChange={(e) => setSelectedDriver(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a driver</option>
                  {drivers.map((driver) => (
                    <option key={driver._id} value={driver._id}>
                      {driver.firstName} {driver.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Select Vehicle</label>
                <select
                  value={selectedVehicle}
                  onChange={(e) => setSelectedVehicle(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a vehicle</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle._id} value={vehicle._id}>
                      {vehicle.vehicleNo} - {vehicle.ownerInfo.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
                >
                  Assign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default VehiclesAndDrivers; 