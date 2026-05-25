import React, { useState, useEffect } from 'react';

const BranchForm = ({
    institutions,
    token,
    onSuccess,
    onCancel,
    styles,
    initialData
}) => {

    const [branchName, setBranchName] = useState('');
    const [branchCode, setBranchCode] = useState('');
    const [institutionId, setInstitutionId] = useState('');
    const [loading, setLoading] = useState(false);

    const BASE_URL =
        'https://online-coding-assessment-platform-production.up.railway.app';

    useEffect(() => {
        if (initialData) {
            setBranchName(initialData.branchName || '');
            setBranchCode(initialData.branchCode || '');
            setInstitutionId(initialData.institution?.id || '');
        }
    }, [initialData]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!branchName.trim()) {
            alert("❌ Please enter branch name");
            return;
        }

        if (!branchCode.trim()) {
            alert("❌ Please enter branch code");
            return;
        }

        if (!institutionId) {
            alert("❌ Please select institution");
            return;
        }

        setLoading(true);

        const headers = {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        
        const payload = {
            branchName: branchName.trim(),
            branchCode: branchCode.trim(),
            institutionId: Number(institutionId)
        };

        // ✅ Create OR Update
        const isEdit = initialData?.id;

        const url = isEdit
            ? `${BASE_URL}/api/admin/hierarchy/branches/update/${initialData.id}`
            : `${BASE_URL}/api/admin/hierarchy/branches/add`;

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
                        ? "✅ Branch Updated Successfully!"
                        : "✅ Branch Added Successfully!"
                );

                // Reset Form
                setBranchName('');
                setBranchCode('');
                setInstitutionId('');

              
                if (onSuccess) {
                    onSuccess(data);
                }

            } else {

                let errorMessage = "Something went wrong";

                try {
                    const errorData = await response.json();

                    errorMessage =
                        errorData.message ||
                        errorData.error ||
                        JSON.stringify(errorData);

                } catch {

                    errorMessage = await response.text();
                }

                alert(`❌ Failed: ${errorMessage}`);
            }

        } catch (error) {

            console.error("Branch Save Error:", error);

            alert("⚠️ Server Error: " + error.message);

        } finally {

            setLoading(false);
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
                    ? '✏️ Edit Branch'
                    : '➕ Add New Branch'}
            </h3>

            <form onSubmit={handleSubmit} style={styles.formGrid}>

                <div style={styles.fGroup}>
                    <label
                        style={{
                            ...styles.lStyle,
                            display: 'block',
                            marginBottom: '8px'
                        }}
                    >
                        BRANCH NAME
                    </label>

                    <input
                        type="text"
                        placeholder="e.g. Computer Science"
                        value={branchName}
                        onChange={(e) =>
                            setBranchName(e.target.value)
                        }
                        style={styles.iBox}
                        disabled={loading}
                        required
                    />
                </div>

             
                <div style={styles.fGroup}>
                    <label
                        style={{
                            ...styles.lStyle,
                            display: 'block',
                            marginBottom: '8px'
                        }}
                    >
                        BRANCH CODE
                    </label>

                    <input
                        type="text"
                        placeholder="e.g. CSE"
                        value={branchCode}
                        onChange={(e) =>
                            setBranchCode(e.target.value)
                        }
                        style={styles.iBox}
                        disabled={loading}
                        required
                    />
                </div>

             
                <div style={styles.fGroup}>
                    <label
                        style={{
                            ...styles.lStyle,
                            display: 'block',
                            marginBottom: '8px'
                        }}
                    >
                        SELECT INSTITUTION
                    </label>

                    <select
                        value={institutionId}
                        onChange={(e) =>
                            setInstitutionId(e.target.value)
                        }
                        style={styles.iBox}
                        disabled={loading}
                        required
                    >
                        <option value="">
                            -- Choose Institution --
                        </option>

                        {institutions &&
                            institutions.map((inst) => (
                                <option
                                    key={inst.id}
                                    value={inst.id}
                                >
                                    {inst.name}
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
                        disabled={loading}
                        style={{
                            ...styles.primaryBtn,
                            opacity: loading ? 0.7 : 1,
                            cursor: loading
                                ? 'not-allowed'
                                : 'pointer'
                        }}
                    >
                        {loading
                            ? 'Processing...'
                            : initialData?.id
                                ? 'Update Branch'
                                : 'Save Branch'}
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

export default BranchForm;
