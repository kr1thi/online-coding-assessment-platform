import React, { useState } from 'react';

const BASE_URL = "https://online-coding-assessment-platform-production.up.railway.app";

const ManageRoles = ({ token, cardStyle }) => {
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("STUDENT");
    const [loading, setLoading] = useState(false);

    const updateRole = async () => {
        if (!email.trim()) {
            alert("⚠️ Please enter an email");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(
                `${BASE_URL}/api/auth/admin/update-role`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        email,
                        role
                    })
                }
            );

            const data = await res.json();

            if (res.ok) {
                alert("✅ Role Updated Successfully!");
                setEmail("");
                setRole("STUDENT");
            } else {
                alert(`❌ ${data.message || "Failed to update role"}`);
            }

        } catch (error) {
            console.error("Error updating role:", error);
            alert("❌ Server error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                ...cardStyle,
                background: '#111827',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #1f2937'
            }}
        >
            <h3
                style={{
                    color: '#f3f4f6',
                    marginBottom: '20px',
                    fontSize: '20px'
                }}
            >
                Change User Role
            </h3>

            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '15px'
                }}
            >
              
                <input
                    type="email"
                    placeholder="Enter User Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid #374151',
                        background: '#0b0f19',
                        color: '#fff',
                        outline: 'none',
                        fontSize: '14px'
                    }}
                />

               
                <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    style={{
                        padding: '12px',
                        borderRadius: '8px',
                        background: '#0b0f19',
                        color: '#fff',
                        border: '1px solid #374151',
                        fontSize: '14px',
                        outline: 'none'
                    }}
                >
                    <option value="STUDENT">Student</option>
                    <option value="TEACHER">Teacher</option>
                    <option value="ADMIN">Admin</option>
                </select>

                {/* Button */}
                <button
                    onClick={updateRole}
                    disabled={loading}
                    style={{
                        background: loading ? '#1e40af' : '#3b82f6',
                        color: '#fff',
                        border: 'none',
                        padding: '12px',
                        borderRadius: '8px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontWeight: '600',
                        transition: '0.2s'
                    }}
                >
                    {loading ? "Updating..." : "Update Role"}
                </button>
            </div>
        </div>
    );
};

export default ManageRoles;
