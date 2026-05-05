import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios';

/*
 Bulk Import 
 handles both students and teachers dynamically.
 */
const ExcelImport = ({ token, activeTab, styles, onSuccess }) => {
    const [fileData, setFileData] = useState([]);
    const [fileName, setFileName] = useState("");
    const [rawFile, setRawFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);
    const isTeacher = activeTab && activeTab.toLowerCase().includes("teacher");
    const label = isTeacher ? "Teacher" : "Student";
    
    // API Endpoints
    const apiEndpoint = isTeacher 
        ? `http://localhost:8082/api/admin/teachers/bulk-upload_teacher`
        : `http://localhost:8082/api/admin/bulk-upload-students`;

const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileType = file.name.split('.').pop().toLowerCase();
    
    // Check for excel and CSV
    if (!['xlsx', 'xls', 'csv'].includes(fileType)) {
        alert("❌ Please upload only Excel (.xlsx, .xls) or CSV (.csv) files");
        return;
    }

    setRawFile(file);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
        try {
            // Use arrayBuffer instead of binaryString for better compatibility
            const data = new Uint8Array(evt.target.result);
            const workbook = XLSX.read(data, { type: 'array' }); 
            
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            
            // CSV parsingku sheet to json nalla work aagum
            const json = XLSX.utils.sheet_to_json(worksheet, {
                header: 0, // First row headersah eduthukkum
                defval: "" // Empty cellsku empty string kudukkum
            });
            
            if (json.length === 0) {
                alert("⚠️ The uploaded file is empty!");
                return;
            }

            setFileData(json);
        } catch (error) {
            console.error("File Reading Error:", error);
            alert("❌ Error reading file content! Check if the file is corrupted.");
        }
    };
    
    //CSV and modern XLSX work best with readAsArrayBuffer
    reader.readAsArrayBuffer(file);
};

    const uploadToBackend = async () => {
        if (!rawFile) return;
        setLoading(true);

        const formData = new FormData();
        formData.append("file", rawFile);

        try {
            const response = await axios.post(apiEndpoint, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            alert(`✅ ${label}s Uploaded Successfully!`);
            resetStates();
            if (onSuccess) onSuccess();

        } catch (err) {
            const errorMsg = err.response?.data?.message || "Check your Excel column headers and try again.";
            alert(`❌ Upload failed: ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    const resetStates = () => {
        setFileData([]);
        setFileName("");
        setRawFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const downloadTemplate = () => {
        const headers = isTeacher 
            ? [["name", "email", "department", "institutionId"]] 
            : [["name", "rollNo", "email", "batchName", "branchCode"]];
        
        const ws = XLSX.utils.aoa_to_sheet(headers);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");
        XLSX.writeFile(wb, `${label}_Upload_Template.xlsx`);
    };

    return (
        <div style={{...styles?.cardStyle, border: '1px dashed #334155', background: '#0f172a', padding: '20px', borderRadius: '12px'}}>
            {/*header section */}
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                <div>
                    <h3 style={{...styles?.cardTitle, color: '#f8fafc', margin: 0}}>Bulk {label} Import</h3>
                    <p style={{fontSize: '12px', color: '#64748b', marginTop: '4px'}}>
                        Currently in <b>{label} Mode</b>. Upload the correct sheet to avoid errors.
                    </p>
                </div>
                <button 
                    onClick={downloadTemplate}
                    style={{
                        background: 'transparent', 
                        cursor: 'pointer',
                        fontSize: '12px', 
                        padding: '8px 12px', 
                        color: '#3b82f6', 
                        border: '1px solid #3b82f6',
                        borderRadius: '6px'
                    }}
                >
                    📥 Download {label} Template
                </button>
            </div>

            {/* upload area */}
            <div style={dropzoneStyle}>
                <input 
                    type="file" 
                    ref={fileInputRef}
                    accept=".xlsx, .xls, .csv" 
                    onChange={handleFileUpload}
                    style={{display: 'none'}}
                    id="excel-upload"
                />
                <label htmlFor="excel-upload" style={{cursor: 'pointer', textAlign: 'center', display: 'block', width: '100%'}}>
                    <div style={{fontSize: '40px', marginBottom: '10px'}}>📊</div>
                    <span style={{color: '#94a3b8', fontSize: '14px'}}>
                        {fileName ? `Selected: ${fileName}` : `Click to upload ${label} Excel file`}
                    </span>
                </label>
            </div>

            {/* p[review section */}
            {fileData.length > 0 && (
                <div style={{marginTop: '25px'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px'}}>
                        <span style={{fontSize: '14px', color: '#10b981', fontWeight: '500'}}>
                            ✔ {fileData.length} {label} records detected
                        </span>
                        <div style={{display: 'flex', gap: '10px'}}>
                            <button onClick={resetStates} style={secondaryBtnStyle}>Cancel</button>
                            <button 
                                onClick={uploadToBackend} 
                                disabled={loading} 
                                style={loading ? disabledBtnStyle : primaryBtnStyle}
                            >
                                {loading ? "Uploading..." : `Confirm Bulk ${label} Upload`}
                            </button>
                        </div>
                    </div>

                    <div style={tableContainer}>
                        <table style={miniTable}>
                            <thead>
                                <tr style={{background: '#1e293b'}}>
                                    {Object.keys(fileData[0]).map(key => (
                                        <th key={key} style={miniTh}>{key}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {fileData.slice(0, 5).map((row, i) => (
                                    <tr key={i} style={{borderBottom: '1px solid #1e293b'}}>
                                        {Object.values(row).map((val, j) => (
                                            <td key={j} style={miniTd}>{String(val)}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {fileData.length > 5 && (
                            <div style={{padding: '10px', textAlign: 'center', fontSize: '11px', color: '#475569', background: '#0b0f19'}}>
                                ... showing first 5 of {fileData.length} rows
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// internal style
const dropzoneStyle = {
    border: '2px dashed #1e293b',
    borderRadius: '12px',
    padding: '40px 20px',
    background: '#0b0f19',
    transition: '0.3s',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
};

const tableContainer = {
    maxHeight: '250px',
    overflow: 'auto',
    borderRadius: '8px',
    border: '1px solid #1e293b'
};

const miniTable = { width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' };
const miniTh = { padding: '12px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' };
const miniTd = { padding: '12px', color: '#e2e8f0', borderTop: '1px solid #1e293b' };

const primaryBtnStyle = {
    background: '#2563eb', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500'
};
const secondaryBtnStyle = {
    background: 'transparent', color: '#94a3b8', border: '1px solid #334155', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer'
};
const disabledBtnStyle = { ...primaryBtnStyle, background: '#1e293b', cursor: 'not-allowed', color: '#475569' };

export default ExcelImport;
