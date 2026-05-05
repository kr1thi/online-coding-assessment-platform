import React, { useState, useEffect } from 'react';

const BatchForm = ({ branches, token, onSuccess, onCancel, styles, initialData }) => {
    const [batchName, setBatchName] = useState('');
    const [branchId, setBranchId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Editing mode kaga data va autofill pannuthu
    useEffect(() => {
        if (initialData) {
            setBatchName(initialData.batchName || '');
            setBranchId(initialData.branch?.id || '');
        }
    }, [initialData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!branchId) { alert("Please select a branch!"); return; }

        setIsSubmitting(true);
        const headers = { 
            'Authorization': `Bearer ${token}`, 
            'Content-Type': 'application/json' 
        };
        
        const payload = { 
            batchName: batchName.trim(), 
            branchId: branchId.toString() 
        };

        // Edit ah illai New va nu check pannuthu
        const url = initialData?.id 
            ? `http://localhost:8082/api/admin/hierarchy/batches/update/${initialData.id}`
            : 'http://localhost:8082/api/admin/hierarchy/batches/add';
        
        const method = initialData?.id ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method: method,
                headers,
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert(initialData?.id ? "✅ Batch Updated!" : "✅ Batch Created!");
                setBatchName('');
                setBranchId('');
                onSuccess();
            } else {
                const errorText = await res.text();
                alert("❌ Error: " + errorText);
            }
        } catch (error) { 
            alert("❌ Server Connection Failed."); 
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={styles.cardStyle}>
            {/* Title dynamic-ah maarum */}
            <h3 style={styles.cardTitle}>{initialData?.id ? 'Edit Batch' : 'Add New Batch'}</h3>
            <form onSubmit={handleSubmit} style={styles.formGrid}>
                
                <div style={styles.fGroup}>
                    <label style={styles.lStyle}>BATCH NAME (Ex: 2021-2025)</label>
                    <input 
                        style={styles.iBox} 
                        required 
                        value={batchName} 
                        onChange={e => setBatchName(e.target.value)} 
                        placeholder="Ex: 2024 Passed Out"
                        disabled={isSubmitting}
                    />
                </div>

                <div style={styles.fGroup}>
                    <label style={styles.lStyle}>SELECT BRANCH</label>
                    <select 
                        style={styles.iBox} 
                        required 
                        value={branchId} 
                        onChange={e => setBranchId(e.target.value)}
                        disabled={isSubmitting}
                    >
                        <option value="">-- Choose Branch --</option>
                        {branches && branches.map(br => (
                            <option key={br.id} value={br.id}>
                                {br.branchName} ({br.branchCode || 'No Code'})
                            </option>
                        ))}
                    </select>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                    <button 
                        type="submit" 
                        style={{ ...styles.primaryBtn, opacity: isSubmitting ? 0.7 : 1 }}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Processing..." : (initialData?.id ? "Update Batch" : "Save Batch")}
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

export default BatchForm;
