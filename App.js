import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './components/Register';
import StudentPortal from './pages/StudentPortal'; 
import Dashboard from './pages/Dashboard';           
import CodingEditor from './pages/CodeEditor';
import AssignedAssessments from './pages/AssignedAssessments'; 
// Pages import panra idathula idhai sethukonga
import ExamInterface from './pages/ExamInterface';        
import SubmissionList from './pages/SubmissionList';
import AdminDashboard from './pages/AdminDashboard';
import AddProblem from './pages/AddProblem';
import TeacherDashboard from './pages/TeacherDashboard';
import AssessmentForm from './pages/AssessmentForm';
import ProfilePage from './pages/Profile';
import './App.css';

const AdminLayout = ({ children }) => (
  <div className="app-layout">
    <div className="main-content">
      {children}
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Register />} />
        <Route path="/register" element={<Register />} />

        {/* STUDENT ROUTES */}
        <Route path="/student/dashboard" element={
          <ProtectedRoute roleRequired="STUDENT">
            <StudentPortal />
          </ProtectedRoute>
        } />
        
        <Route path="/student/practice" element={
          <ProtectedRoute roleRequired="STUDENT">
            <Dashboard />
          </ProtectedRoute>
        } />

        {/* Individual Problem Editor (Practice) */}
        <Route path="/editor/:id" element={
          <ProtectedRoute roleRequired="STUDENT">
            <CodingEditor />
          </ProtectedRoute>
        } />
  {/* PROFILE ROUTE - Common for ALL roles */}
<Route path="/profile" element={
  <ProtectedRoute roleRequired={["STUDENT", "TEACHER", "ADMIN"]}>
    <ProfilePage />
  </ProtectedRoute>
} />

        {/* 🔥 ASSIGNED ASSESSMENTS LIST */}
        <Route path="/student/assessments" element={
          <ProtectedRoute roleRequired="STUDENT">
            <AssignedAssessments />
          </ProtectedRoute>
        } />

 {/* 🔥 CORRECTED LINE */}
<Route path="/assessment/:id" element={
  <ProtectedRoute roleRequired="STUDENT">
    <ExamInterface /> 
  </ProtectedRoute>
} />
        <Route path="/submissions" element={
          <ProtectedRoute roleRequired="STUDENT">
            <SubmissionList />
          </ProtectedRoute>
        } />

        {/* TEACHER ROUTES */}
        <Route path="/teacher/dashboard" element={
          <ProtectedRoute roleRequired="TEACHER">
            <TeacherDashboard />
          </ProtectedRoute>
        } />

        <Route path="/teacher/create-assessment" element={
          <ProtectedRoute roleRequired="TEACHER">
            <AdminLayout><AssessmentForm /></AdminLayout>
          </ProtectedRoute>
        } />

        {/* SHARED ROUTES (ADMIN & TEACHER) */}
        <Route path="/admin/add-problem" element={
          <ProtectedRoute roleRequired="TEACHER">
             <AdminLayout><AddProblem /></AdminLayout>
          </ProtectedRoute>
        } />

        {/* ADMIN ROUTES */}
        <Route path="/admin" element={<ProtectedRoute roleRequired="ADMIN"><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />

        {/* Default Redirect */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;