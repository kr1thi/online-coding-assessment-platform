import React, { useState } from 'react';
import axios from 'axios';
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  'https://online-coding-assessment-platform-production.up.railway.app';
const AssessmentForm = ({
  token,
  onSuccess,
  onCancel,
  styles
}) => {
  const [assessment, setAssessment] = useState({
    title: '',
    duration: 60
  });

  const [loading, setLoading] = useState(false);

 
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!assessment.title.trim()) {
      alert('❌ Assessment title is required');
      return;
    }

    setLoading(true);

    try {
    
      const apiEndpoint = `${API_BASE_URL}/api/assessment/create`;

      const response = await axios.post(
        apiEndpoint,
        {
          title: assessment.title,
          duration: Number(assessment.duration)
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
    
      if (response.status === 200 || response.status === 201) {
        alert('✅ New Assessment Created Successfully!');

       
        if (response.data && response.data.id) {
          // Pass Assessment ID to parent
          onSuccess(response.data.id);
        } else {
          console.error('Backend response:', response.data);

          alert('❌ Backend did not return assessment ID');
        }
      }
    } catch (err) {
      console.error('Assessment Create Error:', err);

      const errorMsg =
        err?.response?.data?.message ||
        err?.response?.data ||
        err.message ||
        'Something went wrong';

      alert(`❌ Error: ${errorMsg}`);
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
          paddingBottom: '10px',
          marginBottom: '20px'
        }}
      >
        Create New Assessment
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
            Assessment Title
          </label>

          <input
            type="text"
            placeholder="Enter assessment title..."
            style={styles.iBox}
            required
            disabled={loading}
            value={assessment.title}
            onChange={(e) =>
              setAssessment({
                ...assessment,
                title: e.target.value
              })
            }
          />
        </div>

        
        <div
          style={{
            ...styles.fGroup,
            marginTop: '15px'
          }}
        >
          <label
            style={{
              ...styles.lStyle,
              display: 'block',
              marginBottom: '8px'
            }}
          >
            Duration (Minutes)
          </label>

          <input
            type="number"
            min="1"
            required
            disabled={loading}
            style={styles.iBox}
            value={assessment.duration}
            onChange={(e) =>
              setAssessment({
                ...assessment,
                duration: e.target.value
              })
            }
          />
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
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Saving...' : 'Save & Continue'}
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

export default AssessmentForm;
