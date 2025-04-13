import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function Register() {
  const [formData, setFormData] = useState({
    // Common fields
    email: '',
    password: '',
    confirmPassword: '',
    
    // Vendor specific fields
    name: '',
    identity: '',
    location: {
      address: '',
      city: '',
      state: '',
      country: ''
    },
    contact: {
      phone: ''
    }
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleNestedInputChange = (e) => {
    const { name, value } = e.target
    const [parent, child] = name.split('.')
    
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [child]: value
      }
    }))
  }
  const navigate = useNavigate()
  const handleSubmit = async (e) => {
    e.preventDefault()
    const submissionData = {
      role: 'vendor',
      ...formData
    }
    console.log('Form submitted:', submissionData)
    
    // Here you would send the data to your backend
    try {
      const response = await axios.post('http://localhost:3001/api/auth/register', submissionData, {
        withCredentials: true
      })
      console.log('Registration successful:', response.data)
      // Navigate to vendor dashboard after successful registration
      navigate('/login')
    } catch (error) {
      console.error('Registration error:', error)
    } 
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Vendor Registration</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Common fields */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        
        {/* Vendor specific fields */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Vendor Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label htmlFor="identity" className="block text-sm font-medium text-gray-700">Vendor Identity</label>
          <input
            type="text"
            id="identity"
            name="identity"
            value={formData.identity}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label htmlFor="location.address" className="block text-sm font-medium text-gray-700">Address</label>
          <input
            type="text"
            id="location.address"
            name="location.address"
            value={formData.location.address}
            onChange={handleNestedInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="location.city" className="block text-sm font-medium text-gray-700">City</label>
            <input
              type="text"
              id="location.city"
              name="location.city"
              value={formData.location.city}
              onChange={handleNestedInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="location.state" className="block text-sm font-medium text-gray-700">State</label>
            <input
              type="text"
              id="location.state"
              name="location.state"
              value={formData.location.state}
              onChange={handleNestedInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="location.country" className="block text-sm font-medium text-gray-700">Country</label>
          <input
            type="text"
            id="location.country"
            name="location.country"
            value={formData.location.country}
            onChange={handleNestedInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label htmlFor="contact.phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
          <input
            type="text"
            id="contact.phone"
            name="contact.phone"
            value={formData.contact.phone}
            onChange={handleNestedInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Register as Vendor
        </button>
      </form>
    </div>
  )
}

export default Register 