import React, { useState } from 'react';

const TeacherForm = ({ institutions, token, onSuccess, onCancel, styles }) => {

    const [teacherForm, setTeacherForm] = useState({
        name: '',
        email: '',
        institutionId: '',
        designation: ''
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setTeacherForm({
            ...teacherForm,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!teacherForm.name || !teacherForm.email || !teacherForm.institutionId) {
            alert("Please fill all required fields");
            return;
        }

        setLoading(true);

        try {

            const response = await fetch(
                'https://online-coding-assessment-platform-production.up.railway.app/api/admin/teachers/add',
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(teacherForm)
                }
            );

            if (response.ok) {

                alert("✅ Teacher Registered Successfully!");

                setTeacherForm({
                    name: '',
                    email: '',
                    institutionId: '',
                    designation: ''
                });

                if (onSuccess) {
                    onSuccess();
                }

            } else {

                const errorText = await response.text();
                alert("❌ Failed : " + errorText);

            }

        } catch (error) {

            console.error("Error :", error);
            alert("⚠️ Server Connection Failed");

        } finally {

            setLoading(false);

        }
    };

    return (
        <div style={styles.cardStyle}>

            <h3
                style={{
                    ...styles.cardTitle,
                    marginBottom: '20px'
                }}
            >
                Add New Teacher
            </h3>

            <form onSubmit={handleSubmit} style={styles.formGrid}>

                {/* Teacher Name */}
                <div style={styles.fGroup}>
                    <label style={styles.lStyle}>
                        FULL NAME
                    </label>

                    <input
                        type="text"
                        name="name"
                        placeholder="Enter Teacher Name"
                        value={teacherForm.name}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        style={styles.iBox}
                    />
                </div>

                <div style={styles.fGroup}>
                    <label style={styles.lStyle}>
                        EMAIL ADDRESS
                    </label>

                    <input
                        type="email"
                        name="email"
                        placeholder="Enter Email"
                        value={teacherForm.email}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        style={styles.iBox}
                    />
                </div>

                <div style={styles.fGroup}>
                    <label style={styles.lStyle}>
                        DESIGNATION
                    </label>

                    <input
                        type="text"
                        name="designation"
                        placeholder="Ex : Assistant Professor"
                        value={teacherForm.designation}
                        onChange={handleChange}
                        disabled={loading}
                        style={styles.iBox}
                    />
                </div>

                <div style={styles.fGroup}>
                    <label style={styles.lStyle}>
                        SELECT INSTITUTION
                    </label>

                    <select
                        name="institutionId"
                        value={teacherForm.institutionId}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        style={styles.iBox}
                    >
                        <option value="">
                            -- Select Institution --
                        </option>

                        {institutions &&
                            institutions.map((inst) => (
                                <option key={inst.id} value={inst.id}>
                                    {inst.name}
                                </option>
                            ))
                        }
                    </select>
                </div>

             
                <div
                    style={{
                        display: 'flex',
                        gap: '10px',
                        marginTop: '10px'
                    }}
                >

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            ...styles.primaryBtn,
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? "Registering..." : "Register Teacher"}
                    </button>

                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        style={styles.secondaryBtn}
                    >
                        Cancel
                    </button>

                </div>

            </form>

        </div>
    );
};

export default TeacherForm;
