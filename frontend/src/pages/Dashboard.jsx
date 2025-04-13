import React from 'react'
import VendorHierarchy from '../components/VendorHierarchy'
import VehiclesAndDrivers from '../components/VehiclesAndDrivers'
import DriverVehicleTable from '../components/DriverVehicleTable'

function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
          <div className="grid grid-cols-1 gap-6">
            <h1 className='text-2xl font-bold text-gray-900 mb-8'>Vendor Hierarchy</h1>
            <VendorHierarchy />
          </div>
          <div className="grid grid-cols-1 gap-6">
            <h1 className='text-2xl font-bold text-gray-900 mb-8'>Vehicles and Drivers</h1>
            <VehiclesAndDrivers />
          </div>
          <div className="grid grid-cols-1 gap-6">
            <h1 className='text-2xl font-bold text-gray-900 mb-8'>Driver and Vehicle Assignments</h1>
            <DriverVehicleTable/>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Dashboard 