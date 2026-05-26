import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BASE_URL = "https://online-coding-assessment-platform-production.up.railway.app";

const StudentForm = ({ 
    batches = [], 
    token, 
    onSuccess, 
    onCancel, 
    styles = {}, 
    initialData 
}) => {

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

    const handleChange = (field, value) => {
        setStudentForm((prev) => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!token) {
            alert("⚠️ Session expired. Please login again.");
            return;
        }

        if (
            !studentForm.name ||
            !studentForm.rollNo ||
            !studentForm.email ||
            !studentForm.batchId
        ) {
            alert("⚠️ Please fill all fields.");
            return;
        }

        setIsSubmitting(true);

        const payload = {
            name: studentForm.name.trim(),
            rollNo: studentForm.rollNo.trim(),
            email: studentForm.email.trim(),
            batch: {
                id: Number(studentForm.batchId)
            }
        };

        const url = initialData?.id
            ? `${BASE_URL}/api/admin/students/update/${initialData.id}`
            : `${BASE_URL}/api/admin/students/add`;

        const method = initialData?.id ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert(
                    initialData?.id
                        ? "✅ Student Updated Successfully!"
                        : "🎉 Student Added Successfully!"
                );

                setStudentForm({
                    name: '',
                    rollNo: '',
                    email: '',
                    batchId: ''
                });

                if (onSuccess) onSuccess();
            } else {
                const errorData = await response.json().catch(() => ({}));

                alert(
                    `❌ ${
                        errorData.message || 'Failed to save student.'
                    }`
                );
            }
        } catch (error) {
            console.error("Student Save Error:", error);
            alert("❌ Server connection failed.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={styles.cardStyle || localStyles.cardStyle}>

            {/* HEADER */}
            <div style={localStyles.header}>
                <h3
                    style={{
                        ...(styles.cardTitle || {}),
                        margin: 0,
                        color: '#8b5cf6'
                    }}
                >
                    {initialData?.id
                        ? 'Edit Student'
                        : 'Add Student'}
                </h3>

                {initialData?.id && (
                    <button
                        type="button"
                        onClick={() =>
                            navigate(`/admin/student-profile/${initialData.id}`)
                        }
                        style={localStyles.profileBtn}
                    >
                        👤 View Profile
                    </button>
                )}
            </div>

            {/* FORM */}
            <form
                onSubmit={handleSubmit}
                style={styles.formGrid || localStyles.formGrid}
            >

                {/* NAME */}
                <div style={localStyles.formGroup}>
                    <label style={localStyles.label}>
                        STUDENT NAME
                    </label>

                    <input
                        type="text"
                        required
                        placeholder="Enter student name"
                        value={studentForm.name}
                        onChange={(e) =>
                            handleChange('name', e.target.value)
                        }
                        style={styles.iBox || localStyles.input}
                        disabled={isSubmitting}
                    />
                </div>

                {/* ROLL NO */}
                <div style={localStyles.formGroup}>
                    <label style={localStyles.label}>
                        ROLL NUMBER
                    </label>

                    <input
                        type="text"
                        required
                        placeholder="Enter roll number"
                        value={studentForm.rollNo}
                        onChange={(e) =>
                            handleChange('rollNo', e.target.value)
                        }
                        style={styles.iBox || localStyles.input}
                        disabled={isSubmitting}
                    />
                </div>

                {/* EMAIL */}
                <div style={localStyles.formGroup}>
                    <label style={localStyles.label}>
                        EMAIL ADDRESS
                    </label>

                    <input
                        type="email"
                        required
                        placeholder="student@gmail.com"
                        value={studentForm.email}
                        onChange={(e) =>
                            handleChange('email', e.target.value)
                        }
                        style={styles.iBox || localStyles.input}
                        disabled={isSubmitting}
                    />
                </div>

                {/* BATCH */}
                <div style={localStyles.formGroup}>
                    <label style={localStyles.label}>
                        SELECT BATCH
                    </label>

                    <select
                        required
                        value={studentForm.batchId}
                        onChange={(e) =>
                            handleChange('batchId', e.target.value)
                        }
                        style={styles.iBox || localStyles.input}
                        disabled={isSubmitting}
                    >
                        <option value="">
                            -- Select Batch --
                        </option>

                        {batches.map((batch) => (
                            <option
                                key={batch.id}
                                value={batch.id}
                            >
                                {batch.batchName} (
                                {batch.branch?.branchName || 'No Branch'})
                            </option>
                        ))}
                    </select>
                </div>

                {/* BUTTONS */}
                <div style={localStyles.buttonGroup}>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        style={{
                            ...(styles.primaryBtn || localStyles.primaryBtn),
                            opacity: isSubmitting ? 0.7 : 1
                        }}
                    >
                        {isSubmitting
                            ? 'Saving...'
                            : initialData?.id
                            ? 'Update Student'
                            : 'Add Student'}
                    </button>

                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isSubmitting}
                        style={styles.secondaryBtn || localStyles.secondaryBtn}
                    >
                        Cancel
                    </button>

                </div>
            </form>
        </div>
    );
};

const localStyles = {

    cardStyle: {
        background: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: '16px',
        padding: '25px',
        color: '#f8fafc'
    },

    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '25px',
        borderBottom: '1px solid #1e293b',
        paddingBottom: '15px'
    },

    profileBtn: {
        background: '#1e293b',
        border: '1px solid #8b5cf6',
        color: '#8b5cf6',
        padding: '8px 14px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600'
    },

    formGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px'
    },

    formGroup: {
        display: 'flex',
        flexDirection: 'column'
    },

    label: {
        marginBottom: '8px',
        color: '#94a3b8',
        fontSize: '13px',
        fontWeight: '600'
    },

    input: {
        background: '#020617',
        border: '1px solid #334155',
        borderRadius: '10px',
        padding: '12px',
        color: '#f8fafc',
        outline: 'none',
        fontSize: '14px'
    },

    buttonGroup: {
        gridColumn: 'span 2',
        display: 'flex',
        gap: '12px',
        marginTop: '10px'
    },

    primaryBtn: {
        background: '#8b5cf6',
        color: 'white',
        border: 'none',
        padding: '12px 18px',
        borderRadius: '10px',
        cursor: 'pointer',
        fontWeight: '600'
    },

    secondaryBtn: {
        background: 'transparent',
        border: '1px solid #334155',
        color: '#cbd5e1',
        padding: '12px 18px',
        borderRadius: '10px',
        cursor: 'pointer',
        fontWeight: '600'
    }
};

export default StudentForm;
