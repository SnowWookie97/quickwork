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
import Feedback from './Feedback.jsx'
import MyShifts from './MyShifts.jsx'
import Payments from './Payments.jsx'
import FAQ from './FAQ.jsx'
import Validation from './Validation.jsx'
import Blacklisted from './Blacklisted.jsx'
import MyProfile from './MyProfile.jsx'
import Ratings from './Ratings.jsx'
import Settings from './Settings.jsx'
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
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/my-shifts" element={<MyShifts />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/validation" element={<Validation />} />
        <Route path="/blacklisted" element={<Blacklisted />} />
        <Route path="/my-profile" element={<MyProfile />} />
        <Route path="/ratings" element={<Ratings />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
