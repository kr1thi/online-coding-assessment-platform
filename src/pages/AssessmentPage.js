import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  'https://online-coding-assessment-platform-production.up.railway.app';

const AssessmentPage = () => {
  const navigate = useNavigate();

  const [assignedTests, setAssignedTests] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        setLoading(true);

        const assessmentRes = await axios.get(
          `${API_BASE_URL}/api/assessment/all`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        let resultsData = [];

        try {
          const resultsRes = await axios.get(
            `${API_BASE_URL}/api/assessment/student/${userId}/results`,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );

          resultsData = resultsRes.data || [];
        } catch (e) {
          console.log('No results found.');
        }

      
        if (assessmentRes.data) {
          const activeTests = assessmentRes.data.filter((test) => {
            const isCompleted = resultsData.some(
              (r) => r.assessmentId === test.id
            );

            return !isCompleted;
          });

          setAssignedTests(activeTests);
        }
      } catch (err) {
        console.error('Assessment Fetch Failed:', err);

        setAssignedTests([]);

     
        if (err.response?.status === 401) {
          alert('Session expired. Please login again.');

          localStorage.clear();

          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    if (token && userId) {
      fetchAssessments();
    } else {
      navigate('/login');
    }
  }, [userId, token, navigate]);


  if (loading) {
    return (
      <div
        style={{
          backgroundColor: '#020617',
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          fontFamily: 'Inter, sans-serif'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '50px',
              height: '50px',
              border: '5px solid #1e293b',
              borderTop: '5px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px auto'
            }}
          />

          <h2>Checking Assessments...</h2>

          <style>
            {`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}
          </style>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: '#020617',
        minHeight: '100vh',
        color: 'white',
        padding: '40px 20px',
        fontFamily: 'Inter, sans-serif'
      }}
    >
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto'
        }}
      >
        {/* ✅ Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '40px',
            flexWrap: 'wrap',
            gap: '15px'
          }}
        >
          <div>
            <h1
              style={{
                fontSize: '2rem',
                marginBottom: '5px'
              }}
            >
              📝 Pending Assessments
            </h1>

            <p style={{ color: '#94a3b8' }}>
              Only tests you haven't completed yet are shown here.
            </p>
          </div>

          <button
            onClick={() => navigate('/student/dashboard')}
            style={{
              background: 'transparent',
              border: '1px solid #334155',
              color: '#94a3b8',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            ← Back to Portal
          </button>
        </div>

        
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '25px'
          }}
        >
          {assignedTests.length > 0 ? (
            assignedTests.map((test) => (
              <div
                key={test.id}
                style={{
                  background: '#0f172a',
                  borderRadius: '16px',
                  border: '1px solid #1e293b',
                  padding: '30px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: '0.3s ease'
                }}
              >
                {/* Assessment Info */}
                <div>
                  <h3
                    style={{
                      marginBottom: '12px',
                      fontSize: '1.3rem',
                      color: '#f8fafc'
                    }}
                  >
                    {test.title}
                  </h3>

                  <p
                    style={{
                      color: '#94a3b8',
                      fontSize: '0.95rem',
                      marginBottom: '8px'
                    }}
                  >
                    ⏱ Duration:{' '}
                    <span style={{ color: 'white' }}>
                      {test.duration} mins
                    </span>
                  </p>

                  <p
                    style={{
                      color: '#94a3b8',
                      fontSize: '0.9rem'
                    }}
                  >
                    📌 Status:{' '}
                    <span style={{ color: '#22c55e' }}>
                      Pending
                    </span>
                  </p>
                </div>

                
                <button
                  onClick={() =>
                    navigate(`/student/exam/${test.id}`)
                  }
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '10px',
                    border: 'none',
                    background: '#2563eb',
                    color: 'white',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    marginTop: '20px',
                    fontSize: '15px'
                  }}
                >
                  Start Assessment
                </button>
              </div>
            ))
          ) : (
            // ✅ Empty State
            <div
              style={{
                textAlign: 'center',
                gridColumn: '1/-1',
                padding: '80px 20px'
              }}
            >
              <div
                style={{
                  fontSize: '4rem',
                  marginBottom: '20px'
                }}
              >
                ✅
              </div>

              <h2
                style={{
                  color: 'white',
                  marginBottom: '10px'
                }}
              >
                All Caught Up!
              </h2>

              <p
                style={{
                  color: '#94a3b8',
                  fontSize: '15px'
                }}
              >
                You have no pending assessments at the moment.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssessmentPage;
