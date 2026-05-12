import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Common/Header';

const LandingPage = () => {
    const navigate = useNavigate();

    const shippingOptions = [
        {
            code: 'SI',
            title: 'Sea Import',
            description: 'Import cargo via sea freight',
            icon: '🚢',
            route: '/shipping/sea?type=SI',
            color: '#0066cc'
        },
        {
            code: 'SE',
            title: 'Sea Export',
            description: 'Export cargo via sea freight',
            icon: '⛴️',
            route: '/shipping/sea?type=SE',
            color: '#003d82'
        },
        {
            code: 'SC',
            title: 'Sea Cross Trade',
            description: 'Cross-trade sea shipments',
            icon: '🌊',
            route: '/shipping/sea?type=SC',
            color: '#0052a3'
        },
        {
            code: 'AI',
            title: 'Air Import',
            description: 'Import cargo via air freight',
            icon: '✈️',
            route: '/shipping/air?type=AI',
            color: '#42b0d5'
        },
        {
            code: 'AE',
            title: 'Air Export',
            description: 'Export cargo via air freight',
            icon: '🛫',
            route: '/shipping/air?type=AE',
            color: '#2a9fc9'
        },
        {
            code: 'CL',
            title: 'Custom Logistics',
            description: 'Customized logistics solutions',
            icon: '📦',
            route: '/shipping/custom-logistics',
            color: '#28a745'
        }
    ];

    return (
        <div>
            <Header />
            <div className="page-container">
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <h1 className="page-title" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                            Welcome to FreightForward
                        </h1>
                        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)' }}>
                            Select your shipping service to get started
                        </p>
                    </div>

                    <div className="grid grid-3">
                        {shippingOptions.map((option) => (
                            <div
                                key={option.code}
                                className="card card-clickable"
                                onClick={() => navigate(option.route)}
                                style={{
                                    borderTop: `4px solid ${option.color}`,
                                    cursor: 'pointer'
                                }}
                            >
                                <div style={{ fontSize: '3rem', marginBottom: '1rem', textAlign: 'center' }}>
                                    {option.icon}
                                </div>
                                <h3 style={{ color: option.color, marginBottom: '0.5rem', fontSize: '1.5rem' }}>
                                    {option.title}
                                </h3>
                                <p style={{ color: 'var(--text-secondary)' }}>
                                    {option.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
