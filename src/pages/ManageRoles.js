import React, { useState } from 'react';

const ManageRoles = ({ token, cardStyle }) => {
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("STUDENT");
    const [loading, setLoading] = useState(false);

    const updateRole = async () => {
        if (!email) return alert("Please enter an email");
        setLoading(true);
        try {
            const res = await fetch('http://localhost:8082/api/auth/admin/update-role', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ email, role })
            });
            
            if (res.ok) alert("Role Updated Successfully!");
            else alert("Failed to update role. Please check the email.");
        } catch (error) {
            console.error("Error updating role:", error);
            alert("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={cardStyle}>
            <h3 style={{ color: '#f3f4f6', marginBottom: '15px' }}>Change User Role</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input 
                    placeholder="Enter User Email" 
                    onChange={(e) => setEmail(e.target.value)} 
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #374151', background: '#0b0f19', color: '#fff' }}
                />
                <select 
                    onChange={(e) => setRole(e.target.value)}
                    style={{ padding: '10px', borderRadius: '8px', background: '#0b0f19', color: '#fff', border: '1px solid #374151' }}
                >
                    <option value="STUDENT">Student</option>
                    <option value="TEACHER">Teacher</option>
                    <option value="ADMIN">Admin</option>
                </select>
                <button 
                    onClick={updateRole} 
                    disabled={loading}
                    style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}
                >
                    {loading ? "Updating..." : "Update Role"}
                </button>
            </div>
        </div>
    );
};

export default ManageRoles;
