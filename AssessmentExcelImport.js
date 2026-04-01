import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios';

const AssessmentExcelImport = ({ token, assessmentId, onSuccess, styles }) => {
    const [fileData, setFileData] = useState([]);
    const [fileName, setFileName] = useState("");
    const [rawFile, setRawFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setRawFile(file);
        setFileName(file.name);

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                
                // Excel to JSON conversion -preview katta mattum
                const data = XLSX.utils.sheet_to_json(ws);
                setFileData(data);
            } catch (error) {
                alert("❌ Excel file read error!");
            }
        };
        reader.readAsBinaryString(file);
    };

    const uploadToBackend = async () => {
        if (!rawFile) return alert("Please select a file!");
        setLoading(true);

        const formData = new FormData();
        formData.append("file", rawFile);

        // 🔥 ASSESSMENT SPECIFIC ENDPOINT
        const apiEndpoint = `http://localhost:8082/api/assessment/${assessmentId}/upload`;

        try {
            const response = await axios.post(apiEndpoint, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            alert(`✅ Success: ${response.data.message}`);
         
            setFileData([]);
            setFileName("");
            setRawFile(null);
            if (onSuccess) onSuccess(); 

        } catch (err) {
            const errorMsg = err.response?.data || "Upload failed. Check backend.";
            alert(`❌ Error: ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{...styles.cardStyle, padding: "20px", marginTop: "20px", border: "1px dashed #334155"}}>
            <h3 style={styles.cardTitle}>Bulk Upload Questions</h3>
            <p style={{fontSize: '12px', color: '#94a3b8'}}>Selected: {fileName || "No file selected"}</p>

            <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                <input 
                    type="file" 
                    accept=".csv, .xlsx, .xls" 
                    onChange={handleFileUpload}
                    style={{padding: "5px", background: "#1e293b", color: "white", borderRadius: "5px"}}
                />

                {rawFile && (
                    <button 
                        onClick={uploadToBackend} 
                        disabled={loading}
                        style={{...styles.primaryBtn, padding: "8px 15px"}}
                    >
                        {loading ? "Uploading..." : `Upload ${fileData.length} Questions`}
                    </button>
                )}
            </div>
        </div>
    );
};

export default AssessmentExcelImport;