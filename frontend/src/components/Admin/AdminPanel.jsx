import React, { useState, useEffect } from 'react';
import Header from '../Common/Header';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const AdminPanel = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [regions, setRegions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCreateUser, setShowCreateUser] = useState(false);
    const [newUser, setNewUser] = useState({
        fullName: '',
        username: '',
        password: '',
        email: '',
        role: 'user',
        regionId: '',
        initials: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [usersRes, regionsRes] = await Promise.all([
                api.get('/admin/users'),
                api.get('/master-data/regions')
            ]);
            setUsers(usersRes.data.users);
            setRegions(regionsRes.data.regions);
        } catch (error) {
            console.error('Error loading admin data:', error);
            alert('Error loading data');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/users', newUser);
            alert('User created successfully!');
            setShowCreateUser(false);
            setNewUser({
                fullName: '',
                username: '',
                password: '',
                email: '',
                role: 'user',
                regionId: '',
                initials: ''
            });
            loadData();
        } catch (error) {
            console.error('Error creating user:', error);
            alert('Error creating user: ' + (error.response?.data?.message || 'Unknown error'));
        }
    };

    const handleToggleUserStatus = async (userId, currentStatus) => {
        try {
            await api.put(`/admin/users/${userId}`, { isActive: !currentStatus });
            alert('User status updated');
            loadData();
        } catch (error) {
            console.error('Error updating user:', error);
            alert('Error updating user status');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) {
            return;
        }

        try {
            await api.delete(`/admin/users/${userId}`);
            alert('User deleted successfully');
            loadData();
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Error deleting user: ' + (error.response?.data?.message || 'Unknown error'));
        }
    };

    const handleAssignRegion = async (userId, regionId) => {
        try {
            await api.put(`/admin/users/${userId}`, { regionId: regionId || null });
            alert('Region assigned successfully');
            loadData();
        } catch (error) {
            console.error('Error assigning region:', error);
            alert('Error assigning region');
        }
    };

    if (user?.role !== 'admin') {
        return (
            <div>
                <Header />
                <div className="page-container">
                    <div className="container">
                        <div className="alert alert-danger">
                            Access Denied: Admin privileges required
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Header />
            <div className="page-container">
                <div className="container">
                    <h1 className="page-title">Admin Panel</h1>

                    <div className="tabs">
                        <button
                            className={`tab ${activeTab === 'users' ? 'active' : ''}`}
                            onClick={() => setActiveTab('users')}
                        >
                            👥 User Management
                        </button>
                        <button
                            className={`tab ${activeTab === 'regions' ? 'active' : ''}`}
                            onClick={() => setActiveTab('regions')}
                        >
                            🌍 Regions
                        </button>
                        <button
                            className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
                            onClick={() => setActiveTab('settings')}
                        >
                            ⚙️ Settings
                        </button>
                    </div>

                    {activeTab === 'users' && (
                        <div className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 className="section-title" style={{ marginBottom: 0 }}>Users</h3>
                                <button
                                    onClick={() => setShowCreateUser(!showCreateUser)}
                                    className="btn btn-primary"
                                >
                                    {showCreateUser ? 'Cancel' : '+ Create User'}
                                </button>
                            </div>

                            {showCreateUser && (
                                <div style={{ backgroundColor: 'var(--background-light)', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                                    <h4 style={{ marginBottom: '1rem' }}>Create New User</h4>
                                    <form onSubmit={handleCreateUser}>
                                        <div className="grid grid-2">
                                            <div className="form-group">
                                                <label className="form-label required">Full Name</label>
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    value={newUser.fullName}
                                                    onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label required">Username</label>
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    value={newUser.username}
                                                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label required">Password</label>
                                                <input
                                                    type="password"
                                                    className="form-input"
                                                    value={newUser.password}
                                                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                                    required
                                                    minLength="4"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Email</label>
                                                <input
                                                    type="email"
                                                    className="form-input"
                                                    value={newUser.email}
                                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label required">Role</label>
                                                <select
                                                    className="form-select"
                                                    value={newUser.role}
                                                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                                    required
                                                >
                                                    <option value="user">User</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Region</label>
                                                <select
                                                    className="form-select"
                                                    value={newUser.regionId}
                                                    onChange={(e) => setNewUser({ ...newUser, regionId: e.target.value })}
                                                >
                                                    <option value="">No Region (Admin Only)</option>
                                                    {regions.map(region => (
                                                        <option key={region.id} value={region.id}>
                                                            {region.name} ({region.code})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label required">Initials</label>
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    value={newUser.initials}
                                                    onChange={(e) => setNewUser({ ...newUser, initials: e.target.value.toUpperCase() })}
                                                    required
                                                    maxLength="10"
                                                    placeholder="e.g., RK"
                                                />
                                                <div className="form-hint">Used for generating reference numbers</div>
                                            </div>
                                        </div>
                                        <button type="submit" className="btn btn-primary mt-3">
                                            Create User
                                        </button>
                                    </form>
                                </div>
                            )}

                            {loading ? (
                                <div className="spinner"></div>
                            ) : (
                                <div style={{ overflowX: 'auto' }}>
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Full Name</th>
                                                <th>Username</th>
                                                <th>Email</th>
                                                <th>Role</th>
                                                <th>Region</th>
                                                <th>Initials</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map((u) => (
                                                <tr key={u.id}>
                                                    <td>{u.full_name}</td>
                                                    <td><strong>{u.username}</strong></td>
                                                    <td>{u.email || '-'}</td>
                                                    <td>
                                                        <span className={`badge ${u.role === 'admin' ? 'badge-priced' : 'badge-pending'}`}>
                                                            {u.role.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <select
                                                            className="form-select"
                                                            value={u.region_id || ''}
                                                            onChange={(e) => handleAssignRegion(u.id, e.target.value)}
                                                            style={{ fontSize: '0.875rem', padding: '0.5rem' }}
                                                        >
                                                            <option value="">No Region</option>
                                                            {regions.map(region => (
                                                                <option key={region.id} value={region.id}>
                                                                    {region.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td><strong>{u.initials}</strong></td>
                                                    <td>
                                                        <span className={`badge ${u.is_active ? 'badge-approved' : 'badge-rejected'}`}>
                                                            {u.is_active ? 'ACTIVE' : 'INACTIVE'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                            <button
                                                                onClick={() => handleToggleUserStatus(u.id, u.is_active)}
                                                                className={`btn ${u.is_active ? 'btn-danger' : 'btn-success'}`}
                                                                style={{ padding: '0.5rem', fontSize: '0.75rem' }}
                                                            >
                                                                {u.is_active ? 'Deactivate' : 'Activate'}
                                                            </button>
                                                            {u.id !== user.id && (
                                                                <button
                                                                    onClick={() => handleDeleteUser(u.id)}
                                                                    className="btn btn-danger"
                                                                    style={{ padding: '0.5rem', fontSize: '0.75rem' }}
                                                                >
                                                                    Delete
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'regions' && (
                        <div className="card">
                            <h3 className="section-title">Regions</h3>
                            <div style={{ overflowX: 'auto' }}>
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Region Name</th>
                                            <th>Code</th>
                                            <th>Assigned Users</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {regions.map((region) => (
                                            <tr key={region.id}>
                                                <td><strong>{region.name}</strong></td>
                                                <td>{region.code}</td>
                                                <td>
                                                    {users.filter(u => u.region_id === region.id).length} users
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="card">
                            <h3 className="section-title">System Settings</h3>
                            <div className="alert alert-info">
                                <strong>ℹ️ System Information</strong>
                                <ul style={{ marginTop: '1rem', marginLeft: '1.5rem' }}>
                                    <li>Total Ports: {users.length > 0 ? '30+' : 'Loading...'}</li>
                                    <li>Total Airports: {users.length > 0 ? '20+' : 'Loading...'}</li>
                                    <li>Container Types: 14</li>
                                    <li>Commodities: 14</li>
                                    <li>Active Regions: {regions.length}</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
