import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios';

// ✅ Railway Production URL
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  'https://online-coding-assessment-platform-production.up.railway.app';

const AssessmentExcelImport = ({
  token,
  assessmentId,
  onSuccess,
  styles
}) => {
  const [fileData, setFileData] = useState([]);
  const [fileName, setFileName] = useState('');
  const [rawFile, setRawFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ File Upload Handler
  const handleFileUpload = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setRawFile(file);
    setFileName(file.name);

    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;

        const workbook = XLSX.read(bstr, {
          type: 'binary'
        });

        const sheetName = workbook.SheetNames[0];

        const worksheet = workbook.Sheets[sheetName];

        // ✅ Excel → JSON Preview
        const data = XLSX.utils.sheet_to_json(worksheet);

        setFileData(data);
      } catch (error) {
        console.error(error);
        alert('❌ Excel file read error!');
      }
    };

    reader.readAsBinaryString(file);
  };

  // ✅ Upload Excel to Backend
  const uploadToBackend = async () => {
    if (!rawFile) {
      alert('Please select a file!');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append('file', rawFile);

      // ✅ Railway Endpoint
      const apiEndpoint = `${API_BASE_URL}/api/assessment/${assessmentId}/upload`;

      const response = await axios.post(apiEndpoint, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      alert(
        `✅ Success: ${
          response?.data?.message || 'Questions uploaded successfully'
        }`
      );

      // ✅ Reset States
      setFileData([]);
      setFileName('');
      setRawFile(null);

      // ✅ Refresh Parent Component
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error(err);

      const errorMsg =
        err?.response?.data?.message ||
        err?.response?.data ||
        err.message ||
        'Upload failed.';

      alert(`❌ Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        ...styles.cardStyle,
        padding: '20px',
        marginTop: '20px',
        border: '1px dashed #334155'
      }}
    >
      <h3 style={styles.cardTitle}>Bulk Upload Questions</h3>

      <p
        style={{
          fontSize: '12px',
          color: '#94a3b8',
          marginTop: '5px'
        }}
      >
        Selected File: {fileName || 'No file selected'}
      </p>

      {/* ✅ Upload Controls */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          marginTop: '15px',
          flexWrap: 'wrap'
        }}
      >
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileUpload}
          style={{
            padding: '8px',
            background: '#1e293b',
            color: 'white',
            borderRadius: '6px',
            border: '1px solid #334155'
          }}
        />

        {rawFile && (
          <button
            onClick={uploadToBackend}
            disabled={loading}
            style={{
              ...styles.primaryBtn,
              padding: '8px 15px',
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading
              ? 'Uploading...'
              : `Upload ${fileData.length} Questions`}
          </button>
        )}
      </div>

      {/* ✅ Preview Table */}
      {fileData.length > 0 && (
        <div
          style={{
            marginTop: '20px',
            overflowX: 'auto'
          }}
        >
          <h4
            style={{
              color: '#e2e8f0',
              marginBottom: '10px'
            }}
          >
            Preview ({fileData.length} Questions)
          </h4>

          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              background: '#0f172a'
            }}
          >
            <thead>
              <tr>
                {Object.keys(fileData[0]).map((key) => (
                  <th
                    key={key}
                    style={{
                      border: '1px solid #334155',
                      padding: '10px',
                      color: '#93c5fd',
                      fontSize: '12px',
                      textAlign: 'left'
                    }}
                  >
                    {key}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {fileData.slice(0, 5).map((row, index) => (
                <tr key={index}>
                  {Object.values(row).map((value, i) => (
                    <td
                      key={i}
                      style={{
                        border: '1px solid #334155',
                        padding: '10px',
                        color: '#e2e8f0',
                        fontSize: '13px'
                      }}
                    >
                      {String(value)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {fileData.length > 5 && (
            <p
              style={{
                color: '#94a3b8',
                fontSize: '12px',
                marginTop: '8px'
              }}
            >
              Showing first 5 rows only...
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default AssessmentExcelImport;
