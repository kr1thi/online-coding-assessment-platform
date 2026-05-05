import React, { useState } from 'react';
import axios from 'axios';

const AssessmentForm = ({ token, onSuccess, onCancel, styles }) => {
    const [assessment, setAssessment] = useState({
        title: '',
        duration: 60
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Assessment Controller la irukkura @PostMapping("/create") hit aagum
            const res = await axios.post('http://localhost:8082/api/assessment/create', assessment, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            // Status 200 (OK) or 201 (Created) check
            if (res.status === 200 || res.status === 201) {
                alert("✅ New Assessment Card Created Successfully!");
                
                // res.data-la backend-la save aanadha full Assessment object varum.
                // Adhula irukkura ID-ai pass panrom.
                if (res.data && res.data.id) {
                    onSuccess(res.data.id); 
                } else {
                    console.error("Backend did not return an ID", res.data);
                    alert("❌ Backend error: ID not found in response.");
                }
            }
        } catch (err) {
            console.error("Error creating assessment:", err);
            const errorMsg = err.response?.data?.message || err.message || "Something went wrong";
            alert("❌ Error: " + errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{...styles.cardStyle, padding: '25px', border: '1px solid #334155'}}>
            <h3 style={{...styles.cardTitle, borderBottom: '1px solid #334155', paddingBottom: '10px', marginBottom: '20px'}}>
                Create New Assessment Card
            </h3>
            
            <form onSubmit={handleSubmit} style={styles.formGrid}>
                <div style={styles.fGroup}>
                    <label style={{...styles.lStyle, display: 'block', marginBottom: '8px'}}>
                        Assessment Title (e.g., Java Programming)
                    </label>
                    <input 
                        style={styles.iBox} 
                        required 
                        placeholder="Enter assessment name..."
                        value={assessment.title} 
                        onChange={e => setAssessment({...assessment, title: e.target.value})} 
                        disabled={loading}
                    />
                </div>

                <div style={{...styles.fGroup, marginTop: '15px'}}>
                    <label style={{...styles.lStyle, display: 'block', marginBottom: '8px'}}>
                        Duration (In Minutes)
                    </label>
                    <input 
                        type="number" 
                        style={styles.iBox} 
                        required 
                        min="1"
                        value={assessment.duration} 
                        onChange={e => setAssessment({...assessment, duration: e.target.value})} 
                        disabled={loading}
                    />
                </div>
                <div style={{ display: 'flex', gap: '15px', marginTop: '25px' }}>
                    <button 
                        type="submit" 
                        style={{
                            ...styles.primaryBtn, 
                            opacity: loading ? 0.7 : 1,
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                        disabled={loading}
                    >
                        {loading ? "Saving..." : "Save & Continue"}
                    </button>
                    
                    <button 
                        type="button" 
                        onClick={onCancel} 
                        style={styles.secondaryBtn}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AssessmentForm;
