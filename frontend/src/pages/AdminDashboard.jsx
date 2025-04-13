import React, { useState } from 'react';
import axios from 'axios';

function Dashboard() {
  const [identity, setIdentity] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`http://localhost:3006/api/admin/entities?identity=${identity}`);
      setData(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            value={identity}
            onChange={(e) => setIdentity(e.target.value)}
            placeholder="Enter vendor identity"
            className="px-4 py-2 border rounded-lg flex-1"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {data && (
        <div className="space-y-8">
          {/* Vendor Section */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Vendor Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.vendor.map((vendor) => (
                <div key={vendor._id} className="border p-4 rounded">
                  <h3 className="font-medium">{vendor.name}</h3>
                  <p>Email: {vendor.email}</p>
                  <p>Level: {vendor.vendorLevel}</p>
                  <p>Identity: {vendor.identity}</p>
                  <p>Status: {vendor.isActive ? 'Active' : 'Inactive'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Drivers Section */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Drivers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.drivers.map((driver) => (
                <div key={driver._id} className="border p-4 rounded">
                  <h3 className="font-medium">{driver.firstName} {driver.lastName}</h3>
                  <p>Phone: {driver.phoneNumber}</p>
                  <p>License: {driver.licenseNumber}</p>
                  <p>Status: {driver.isActive ? 'Active' : 'Inactive'}</p>
                  <p className="text-blue-600 font-medium">Vendor Identity: {driver.vendorIdentity}</p>
                  <p>Address: {driver.address.street}, {driver.address.city}, {driver.address.state}</p>
                  <p>Emergency Contact: {driver.emergencyContact.name} ({driver.emergencyContact.relationship})</p>
                </div>
              ))}
            </div>
          </div>

          {/* Vehicles Section */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Vehicles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.vehicles.map((vehicle) => (
                <div key={vehicle._id} className="border p-4 rounded">
                  <h3 className="font-medium">Vehicle No: {vehicle.vehicleNo}</h3>
                  <p>Owner: {vehicle.ownerInfo.name}</p>
                  <p>Owner Phone: {vehicle.ownerInfo.phoneNo}</p>
                  <p>Status: {vehicle.status}</p>
                  <p>Active: {vehicle.isActive ? 'Yes' : 'No'}</p>
                  <p className="text-blue-600 font-medium">Vendor Identity: {vehicle.vendorIdentity}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard; 