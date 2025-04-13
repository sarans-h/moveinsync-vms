import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Register from './pages/Register'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import AdminLogin from './pages/AdminLogin' 
import AdminDashboard from './pages/AdminDashboard'
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/vendor/dashboard" element={<Dashboard />} />
            <Route path="/adminlogin" element={<AdminLogin/>} />
            <Route path="/admindashboard" element={<AdminDashboard/>} />
            <Route path="/" element={
              <div>
                <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
                  Fleet Management System
                </h1>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <p className="text-gray-600 text-center mb-6">
                    Welcome to the Fleet Management System
                  </p>
                  <div className="flex justify-center gap-4">
                  <div className="flex justify-center">
                    <Link 
                      to="/register" 
                      className="bg-blue-500 text-white py-2 px-6 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Register Now
                    </Link>
                  </div>
                  <div className="flex justify-center">
                    <Link 
                      to="/login" 
                      className="bg-blue-500 text-white py-2 px-6 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Vendor Login 
                    </Link>
                  </div>
                  <div className="flex justify-center">
                    <Link 
                      to="/adminlogin" 
                      className="bg-blue-500 text-white py-2 px-6 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Admin Login 
                    </Link>
                  </div>
                  </div>
                </div>
              </div>
            } />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App
