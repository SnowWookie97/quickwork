import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import RoleSelect from './RoleSelect.jsx'
import Login from './Login.jsx'
import Signup from './Signup.jsx'
import ForgotPassword from './ForgotPassword.jsx'
import ResetPassword from './ResetPassword.jsx'
import WorkerDashboard from './WorkerDashboard.jsx'
import BusinessDashboard from './BusinessDashboard.jsx'
import UnderConstruction from './UnderConstruction.jsx'
import ContactUs from './ContactUs.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/role" element={<RoleSelect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/worker/dashboard" element={<WorkerDashboard />} />
        <Route path="/business/dashboard" element={<BusinessDashboard />} />
        <Route path="/under-construction" element={<UnderConstruction />} />
        <Route path="/contact" element={<ContactUs />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
