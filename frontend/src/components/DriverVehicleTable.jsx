import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Car, User, Link } from 'lucide-react';

function DriverVehicleTable() {
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const driversRes = await axios.get('http://localhost:3003/api/drivers', { withCredentials: true });
      const vehiclesRes = await axios.get('http://localhost:3004/api/vehicles', { withCredentials: true });
      console.log(driversRes.data.drivers);
      setVehicles(vehiclesRes.data.data.vehicles);
      setDrivers(driversRes.data.drivers);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Driver and Vehicle Assignments</h2>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Drivers Column */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User size={20} />
              Drivers
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {drivers.map((driver) => (
                  <tr
                    key={driver._id}
                    className={assignments.some(a => a.driverId === driver._id) ? 'bg-green-50' : ''}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      {driver.firstName} {driver.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {driver.phoneNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {driver.vehicleAssigned ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Assigned
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          Unassigned
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vehicles Column */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Car size={20} />
              Vehicles
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vehicles.map((vehicle) => (
                  <tr
                    key={vehicle._id}
                    className={assignments.some(a => a.vehicleId === vehicle._id) ? 'bg-green-50' : ''}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      {vehicle.vehicleNo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {vehicle.ownerInfo.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {vehicle.driverAssigned ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Assigned
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          Unassigned
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DriverVehicleTable; 