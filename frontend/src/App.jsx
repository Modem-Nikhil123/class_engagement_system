import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './stores/authStore';
import LoginForm from './components/auth/LoginForm';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import HodDashboard from './pages/HodDashboard';
import ProfilePage from './pages/ProfilePage';
import {Loader} from 'lucide-react'
import {Toaster} from 'react-hot-toast'
 
function App() {
  const { user, isCheckingAuth,checkAuth } = useAuthStore();

  useEffect(() => { 
    checkAuth();
  },[]);
 
  if(isCheckingAuth && !user) 
    {
      return(
        <div className='flex items-center justify-center h-screen'>
          <Loader className='size-10 animate-spin'/>
        </div>
      )
    }
  if(!user) 
    {
      return <>
     <LoginForm />;
     <Toaster
     position="top-center"
     reverseOrder={false}/>
    </>
    }
  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            user.role === 'teacher' ? (
              <Navigate to="/teacher" replace />
            ) : user.role === 'student' ? (
              <Navigate to="/student" replace />
            ) : user.role === 'super_admin' ? (
              <Navigate to="/super-admin" replace />
            ) : user.role === 'hod' ? (
              <Navigate to="/hod" replace />
            ) :  (
              <p>Unknown role</p>
            )

          }
        />
        
        <Route 
          path="/teacher" 
          element={
            user.role === 'teacher' ? (
              <TeacherDashboard />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        
        <Route 
          path="/student" 
          element={
            user.role === 'student' ? (
              <StudentDashboard />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
        
        <Route
          path="/super-admin"
          element={
            user.role === 'super_admin' ? (
              <SuperAdminDashboard />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/hod"
          element={
            user.role === 'hod' ? (
              <HodDashboard />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        
        <Route
          path="/profile"
          element={<ProfilePage />}
        />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
     <Toaster
     position="top-center"
     reverseOrder={false}/>
     </>
  );
}

export default App;