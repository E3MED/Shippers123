import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Login from './components/Auth/Login';
import LandingPage from './components/Landing/LandingPage';
import SeaShipping from './components/Shipping/SeaShipping';
import AirShipping from './components/Shipping/AirShipping';
import CustomLogistics from './components/Shipping/CustomLogistics';
import Dashboard from './components/Dashboard/Dashboard';
import PricingPage from './components/Pricing/PricingPage';
import AdminPanel from './components/Admin/AdminPanel';
import './styles/global.css';

function App() {
    return (
        <AuthProvider>
            <Router basename={process.env.PUBLIC_URL}>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <LandingPage />
                            </ProtectedRoute>
                        }
                    />
                    
                    <Route
                        path="/shipping/sea"
                        element={
                            <ProtectedRoute>
                                <SeaShipping />
                            </ProtectedRoute>
                        }
                    />
                    
                    <Route
                        path="/shipping/air"
                        element={
                            <ProtectedRoute>
                                <AirShipping />
                            </ProtectedRoute>
                        }
                    />
                    
                    <Route
                        path="/shipping/custom-logistics"
                        element={
                            <ProtectedRoute>
                                <CustomLogistics />
                            </ProtectedRoute>
                        }
                    />
                    
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    
                    <Route
                        path="/pricing/:id"
                        element={
                            <ProtectedRoute>
                                <PricingPage />
                            </ProtectedRoute>
                        }
                    />
                    
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute requireAdmin={true}>
                                <AdminPanel />
                            </ProtectedRoute>
                        }
                    />
                    
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
