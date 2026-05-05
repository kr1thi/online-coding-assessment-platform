import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
        { name: 'Institutions', path: '/admin/institutions', icon: '🏢' },
        { name: 'Users', path: '/admin/users', icon: '👥' },
        { name: 'Submissions', path: '/admin/submissions', icon: '📝' },
        { name: 'Settings', path: '/admin/settings' },
    ];

    return (
        <div className="sidebar">
            <div className="sidebar-logo">
                FAMEHUB <span style={{color: 'white', marginLeft: '5px'}}>PRO</span>
            </div>
            
            <nav className="sidebar-nav">
                {menuItems.map((item) => (
                    <div 
                        key={item.path}
                        className={`nav-item ${location.pathname.startsWith(item.path) ? 'active' : ''}`}
                        onClick={() => navigate(item.path)}
                    >
                        <span style={{marginRight: '12px'}}>{item.icon}</span>
                        {item.name}
                    </div>
                ))}
            </nav>
        </div>
    );
};

export default Sidebar;
