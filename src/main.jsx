import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import RoleSelect from './RoleSelect.jsx'
import Login from './Login.jsx'
import Signup from './Signup.jsx'
import WorkerDashboard from './WorkerDashboard.jsx'
import BusinessDashboard from './BusinessDashboard.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/role" element={<RoleSelect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/worker/dashboard" element={<WorkerDashboard />} />
        <Route path="/business/dashboard" element={<BusinessDashboard />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
