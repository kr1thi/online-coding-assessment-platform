import React, { useState } from 'react';

const TeacherForm = ({ institutions, token, onSuccess, onCancel, styles }) => {
    const [teacherForm, setTeacherForm] = useState({ 
        name: '', email: '', institutionId: '', designation: '' 
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

        try {
            const res = await fetch('http://localhost:8082/api/admin/teachers/add', {
                method: 'POST', 
                headers, 
                body: JSON.stringify(teacherForm)
            });

            if (res.ok) { 
                alert("Teacher Registered Successfully!"); 
                onSuccess(); 
            } else {
                alert("Failed to register teacher.");
            }
        } catch (err) { 
            alert("Database Connection Error!"); 
        }
    };

    return (
        <div style={styles.cardStyle}>
            <h3 style={{...styles.cardTitle, marginBottom: '20px'}}>Add New Educator</h3>
            <form onSubmit={handleSubmit} style={styles.formGrid}>
                <div style={styles.fGroup}>
                    <label style={styles.lStyle}>FULL NAME</label>
                    <input style={styles.iBox} required value={teacherForm.name} onChange={e => setTeacherForm({...teacherForm, name: e.target.value})} />
                </div>
                <div style={styles.fGroup}>
                    <label style={styles.lStyle}>EMAIL ADDRESS</label>
                    <input style={styles.iBox} type="email" required value={teacherForm.email} onChange={e => setTeacherForm({...teacherForm, email: e.target.value})} />
                </div>
                <div style={styles.fGroup}>
                    <label style={styles.lStyle}>INSTITUTION</label>
                    <select style={styles.iBox} required value={teacherForm.institutionId} onChange={e => setTeacherForm({...teacherForm, institutionId: e.target.value})}>
                        <option value="">-- Select College --</option>
                        {institutions.map(inst => <option key={inst.id} value={inst.id}>{inst.name}</option>)}
                    </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
                    <button type="submit" style={styles.primaryBtn}>Register Teacher</button>
                    <button type="button" onClick={onCancel} style={styles.secondaryBtn}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default TeacherForm;
