import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import StudentDashboard from './pages/StudentDashboard'
import TeacherDashboard from './pages/TeacherDashboard'
import PublicRegistration from './pages/PublicRegistration'
import OfficeBacDashboard from './pages/OfficeBacDashboard'
import PublicOfficeRegistration from './pages/PublicOfficeRegistration'
import JuryDeliberationDashboard from './pages/JuryDeliberationDashboard'

import { AuthProvider } from './contexts/AuthContext'

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/inscription-nationale" element={<PublicOfficeRegistration />} />
            <Route path="/register/class/:classId" element={<PublicRegistration />} />
            <Route path="/dashboard" element={<Navigate to="/dashboard/overview" replace />} />
            <Route path="/dashboard/:tab" element={<Dashboard />} />
            <Route path="/student/dashboard" element={<Navigate to="/student/dashboard/overview" replace />} />
            <Route path="/student/dashboard/:tab" element={<StudentDashboard />} />
            <Route path="/professeur/dashboard" element={<Navigate to="/professeur/dashboard/overview" replace />} />
            <Route path="/professeur/dashboard/:tab" element={<TeacherDashboard />} />
            <Route path="/office/dashboard" element={<Navigate to="/office/dashboard/overview" replace />} />
            <Route path="/office/dashboard/:tab" element={<OfficeBacDashboard />} />
            <Route path="/jury/dashboard" element={<JuryDeliberationDashboard />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App
