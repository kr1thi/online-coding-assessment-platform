import React, { useState, useEffect } from 'react';

const BranchForm = ({ institutions, token, onSuccess, onCancel, styles, isEditing, initialData }) => {
    const [branchName, setBranchName] = useState('');
    const [branchCode, setBranchCode] = useState('');
    const [institutionId, setInstitutionId] = useState('');

    // Editing modela iruntha datava autofill panna
    useEffect(() => {
        if (initialData) {
            setBranchName(initialData.branchName || '');
            setBranchCode(initialData.branchCode || '');
            setInstitutionId(initialData.institution?.id || '');
        }
    }, [initialData]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        // Backend requirement-padi payload-a check pannunga
        // Sila backend-la institution: { id: id } nu kekkum
        const payload = {
            branchName: branchName,
            branchCode: branchCode,
            institutionId: institutionId 
        };

        const url = initialData?.id 
            ? `http://localhost:8082/api/admin/hierarchy/branches/update/${initialData.id}`
            : 'http://localhost:8082/api/admin/hierarchy/branches/add';
        
        const method = initialData?.id ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method: method,
                headers: headers,
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert(initialData?.id ? "✅ Branch Updated!" : "✅ Branch Added!");
                // Clear fields
                setBranchName('');
                setBranchCode('');
                setInstitutionId('');
                onSuccess(); // Refresh list in Dashboard
            } else {
                const errorMsg = await res.text();
                alert("❌ Failed: " + errorMsg);
            }
        } catch (error) {
            alert("⚠️ Server Error: " + error.message);
        }
    };

    return (
        <div style={styles.cardStyle}>
            <h3 style={styles.cardTitle}>{initialData?.id ? 'Edit Branch' : 'Add New Branch'}</h3>
            <form onSubmit={handleSubmit} style={styles.formGrid}>
                <div style={styles.fGroup}>
                    <label style={styles.lStyle}>BRANCH NAME</label>
                    <input 
                        style={styles.iBox} 
                        required 
                        placeholder="e.g. Computer Science"
                        value={branchName} 
                        onChange={e => setBranchName(e.target.value)} 
                    />
                </div>
                <div style={styles.fGroup}>
                    <label style={styles.lStyle}>BRANCH CODE</label>
                    <input 
                        style={styles.iBox} 
                        required 
                        placeholder="e.g. CSE"
                        value={branchCode} 
                        onChange={e => setBranchCode(e.target.value)} 
                    />
                </div>
                <div style={styles.fGroup}>
                    <label style={styles.lStyle}>SELECT INSTITUTION</label>
                    <select 
                        style={styles.iBox} 
                        required 
                        value={institutionId} 
                        onChange={e => setInstitutionId(e.target.value)}
                    >
                        <option value="">-- Choose Institution --</option>
                        {institutions && institutions.map(inst => (
                            <option key={inst.id} value={inst.id}>{inst.name}</option>
                        ))}
                    </select>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                    <button type="submit" style={styles.primaryBtn}>
                        {initialData?.id ? 'Update Branch' : 'Save Branch'}
                    </button>
                    <button type="button" onClick={onCancel} style={styles.secondaryBtn}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default BranchForm;