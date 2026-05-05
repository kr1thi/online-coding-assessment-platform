import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const StudentForm = ({ batches, token, onSuccess, onCancel, styles, initialData }) => {
    const navigate = useNavigate();
    const [studentForm, setStudentForm] = useState({ 
        name: '', 
        rollNo: '', 
        email: '', 
        batchId: '' 
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (initialData) {
            setStudentForm({
                name: initialData.name || '',
                rollNo: initialData.rollNo || '',
                email: initialData.email || '',
                batchId: initialData.batch?.id || ''
            });
        }
    }, [initialData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token) { alert("Session expired."); return; }
        setIsSubmitting(true);

        const payload = {
            name: studentForm.name.trim(),
            rollNo: studentForm.rollNo.trim(),
            email: studentForm.email.trim(),
            batch: { id: parseInt(studentForm.batchId) } 
        };

        const url = initialData?.id 
            ? `http://localhost:8082/api/admin/students/update/${initialData.id}`
            : 'http://localhost:8082/api/admin/students/add';
        
        const method = initialData?.id ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method: method,
                headers: { 
                    'Authorization': `Bearer ${token}`, 
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify(payload) 
            });

            if (res.ok) {
                alert(initialData?.id ? "✅ Student Updated!" : "🎉 Student Registered!");
                setStudentForm({ name: '', rollNo: '', email: '', batchId: '' });
                onSuccess(); 
            } else {
                const errorData = await res.json().catch(() => ({}));
                alert(`❌ Error: ${errorData.message || "Operation failed"}`);
            }
        } catch (error) {
            alert("⚠️ Connection Failed.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={styles.cardStyle}>
            {/*  Title and Profile link  header sec*/}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '1px solid #1e293b', paddingBottom: '15px' }}>
                <h3 style={{ ...styles.cardTitle, margin: 0, color: '#8b5cf6' }}>
                    {initialData?.id ? 'Edit Student Details' : 'Manual Student Entry'}
                </h3>
                
                {initialData?.id && (
                    <button 
                        type="button"
                        onClick={() => navigate(`/admin/student-profile/${initialData.id}`)}
                        style={{
                            background: '#1e293b',
                            border: '1px solid #8b5cf6',
                            color: '#8b5cf6',
                            padding: '6px 14px',
                            borderRadius: '8px',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <span>👤</span> View Profile
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} style={styles.formGrid}>
                <div style={styles.fGroup}>
                    <label style={styles.lStyle}>STUDENT NAME</label>
                    <input 
                        style={styles.iBox} 
                        required 
                        placeholder="Ex: John Doe"
                        value={studentForm.name} 
                        onChange={e => setStudentForm({ ...studentForm, name: e.target.value })} 
                        disabled={isSubmitting}
                    />
                </div>

                <div style={styles.fGroup}>
                    <label style={styles.lStyle}>ROLL NUMBER</label>
                    <input 
                        style={styles.iBox} 
                        required 
                        placeholder="Ex: 21CS001"
                        value={studentForm.rollNo} 
                        onChange={e => setStudentForm({ ...studentForm, rollNo: e.target.value })} 
                        disabled={isSubmitting}
                    />
                </div>

                <div style={styles.fGroup}>
                    <label style={styles.lStyle}>EMAIL ADDRESS</label>
                    <input 
                        style={styles.iBox} 
                        type="email" 
                        required 
                        placeholder="student@college.edu"
                        value={studentForm.email} 
                        onChange={e => setStudentForm({ ...studentForm, email: e.target.value })} 
                        disabled={isSubmitting}
                    />
                </div>

                <div style={styles.fGroup}>
                    <label style={styles.lStyle}>BATCH</label>
                    <select 
                        style={styles.iBox} 
                        required 
                        value={studentForm.batchId} 
                        onChange={e => setStudentForm({ ...studentForm, batchId: e.target.value })}
                        disabled={isSubmitting}
                    >
                        <option value="">-- Choose Batch --</option>
                        {batches && batches.map(bt => (
                            <option key={bt.id} value={bt.id}>
                                {bt.batchName} ({bt.branch?.branchName || 'No Branch'})
                            </option>
                        ))}
                    </select>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button 
                        type="submit" 
                        style={{...styles.primaryBtn, opacity: isSubmitting ? 0.7 : 1}}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Saving..." : (initialData?.id ? "Update Changes" : "Save Student")}
                    </button>
                    <button 
                        type="button" 
                        onClick={onCancel} 
                        style={styles.secondaryBtn}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default StudentForm;
