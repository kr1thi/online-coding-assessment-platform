import React, { useState, useEffect } from 'react';

const BatchForm = ({
    branches,
    token,
    onSuccess,
    onCancel,
    styles,
    initialData
}) => {

    const [batchName, setBatchName] = useState('');
    const [branchId, setBranchId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    
    const BASE_URL =
        'https://online-coding-assessment-platform-production.up.railway.app';

    // Edit Mode Autofill
    useEffect(() => {
        if (initialData) {
            setBatchName(initialData.batchName || '');
            setBranchId(initialData.branch?.id || '');
        }
    }, [initialData]);

    // Submit function
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!batchName.trim()) {
            alert("❌ Please enter batch name!");
            return;
        }

        if (!branchId) {
            alert("❌ Please select a branch!");
            return;
        }

        setIsSubmitting(true);

        const headers = {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        const payload = {
            batchName: batchName.trim(),
            branchId: Number(branchId)
        };

        const isEdit = initialData?.id;

        const url = isEdit
            ? `${BASE_URL}/api/admin/hierarchy/batches/update/${initialData.id}`
            : `${BASE_URL}/api/admin/hierarchy/batches/add`;

        const method = isEdit ? 'PUT' : 'POST';

        try {

            const response = await fetch(url, {
                method,
                headers,
                body: JSON.stringify(payload)
            });

        
            if (response.ok) {

                const data = await response.json();

                alert(
                    isEdit
                        ? "✅ Batch Updated Successfully!"
                        : "✅ Batch Created Successfully!"
                );

                // Reset Form
                setBatchName('');
                setBranchId('');

                // Refresh Parent Data
                if (onSuccess) {
                    onSuccess(data);
                }

            } else {

                let errorMessage = "Something went wrong";

                try {
                    const errData = await response.json();
                    errorMessage =
                        errData.message ||
                        errData.error ||
                        JSON.stringify(errData);
                } catch {
                    errorMessage = await response.text();
                }

                alert(`❌ Error: ${errorMessage}`);
            }

        } catch (error) {

            console.error("Batch Save Error:", error);

            alert("❌ Server Connection Failed");

        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div
            style={{
                ...styles.cardStyle,
                padding: '25px',
                border: '1px solid #334155'
            }}
        >

         
            <h3
                style={{
                    ...styles.cardTitle,
                    borderBottom: '1px solid #334155',
                    paddingBottom: '12px',
                    marginBottom: '25px'
                }}
            >
                {initialData?.id
                    ? '✏️ Edit Batch'
                    : '➕ Add New Batch'}
            </h3>

          ]
            <form onSubmit={handleSubmit} style={styles.formGrid}>

                {/* BATCH NAME */}
                <div style={styles.fGroup}>
                    <label
                        style={{
                            ...styles.lStyle,
                            marginBottom: '8px',
                            display: 'block'
                        }}
                    >
                        BATCH NAME
                    </label>

                    <input
                        type="text"
                        placeholder="Ex: 2021 - 2025"
                        value={batchName}
                        onChange={(e) =>
                            setBatchName(e.target.value)
                        }
                        style={styles.iBox}
                        disabled={isSubmitting}
                        required
                    />
                </div>

               
                <div style={styles.fGroup}>
                    <label
                        style={{
                            ...styles.lStyle,
                            marginBottom: '8px',
                            display: 'block'
                        }}
                    >
                        SELECT BRANCH
                    </label>

                    <select
                        value={branchId}
                        onChange={(e) =>
                            setBranchId(e.target.value)
                        }
                        style={styles.iBox}
                        disabled={isSubmitting}
                        required
                    >
                        <option value="">
                            -- Select Branch --
                        </option>

                        {branches &&
                            branches.map((branch) => (
                                <option
                                    key={branch.id}
                                    value={branch.id}
                                >
                                    {branch.branchName}
                                    {branch.branchCode
                                        ? ` (${branch.branchCode})`
                                        : ''}
                                </option>
                            ))}
                    </select>
                </div>

            
                <div
                    style={{
                        display: 'flex',
                        gap: '15px',
                        marginTop: '25px'
                    }}
                >
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        style={{
                            ...styles.primaryBtn,
                            opacity: isSubmitting ? 0.7 : 1,
                            cursor: isSubmitting
                                ? 'not-allowed'
                                : 'pointer'
                        }}
                    >
                        {isSubmitting
                            ? 'Processing...'
                            : initialData?.id
                                ? 'Update Batch'
                                : 'Save Batch'}
                    </button>

                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isSubmitting}
                        style={styles.secondaryBtn}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BatchForm;
