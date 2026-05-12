import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Common/Header';

const CustomLogistics = () => {
    const navigate = useNavigate();

    return (
        <div>
            <Header />
            <div className="page-container">
                <div className="container">
                    <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '2rem' }}>
                            📦
                        </div>
                        <h1 style={{ fontSize: '2.5rem', color: 'var(--primary-color)', marginBottom: '1rem' }}>
                            Custom Logistics Solutions
                        </h1>
                        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                            For customized logistics solutions, please contact our sales team.
                        </p>
                        <div>
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="btn btn-primary btn-large"
                            >
                                Back to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomLogistics;
