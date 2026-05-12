import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <header className="header">
            <div className="container">
                <div className="header-content">
                    <Link to="/" className="logo">
                        🚢 FreightForward
                    </Link>
                    <nav className="nav">
                        <Link to="/dashboard" className="nav-link">Dashboard</Link>
                        <Link to="/pricing" className="nav-link">Pricing</Link>
                        {user.role === 'admin' && (
                            <Link to="/admin" className="nav-link">Admin</Link>
                        )}
                        <div style={{ borderLeft: '1px solid #ccc', height: '24px' }}></div>
                        <span style={{ color: 'var(--text-secondary)' }}>
                            {user.fullName} ({user.role})
                        </span>
                        <button onClick={handleLogout} className="btn btn-secondary">
                            Logout
                        </button>
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header;
