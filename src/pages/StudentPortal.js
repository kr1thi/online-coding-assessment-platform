import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BASE_URL =
    "https://online-coding-assessment-platform-production.up.railway.app";

const StudentPortal = () => {

    const navigate = useNavigate();

    const [assessmentCount, setAssessmentCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const userName = localStorage.getItem('userName') || 'Student';

    useEffect(() => {
        fetchAssessmentCount();
    }, []);

    const fetchAssessmentCount = async () => {

        try {

            const token = localStorage.getItem('token');

            const response = await axios.get(
                `${BASE_URL}/api/assessment/all`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setAssessmentCount(response.data?.length || 0);

        } catch (error) {

            console.error("Assessment Count Error:", error);

        } finally {

            setLoading(false);
        }
    };

    const handleLogout = () => {

        localStorage.clear();

        navigate('/login');
    };

    const sections = [
        {
            id: 1,
            title: "Practice Problems",
            desc: "Solve coding problems and improve your programming skills.",
            icon: "💻",
            path: "/student/practice",
            color: "#38bdf8",
            badge: null
        },
        {
            id: 2,
            title: "Assessments",
            desc: "Attend college/company assessments and track performance.",
            icon: "📝",
            path: "/student/assessments",
            color: "#818cf8",
            badge:
                assessmentCount > 0
                    ? `${assessmentCount} Active`
                    : null
        }
    ];

    return (
        <div style={styles.container}>

            {/* HEADER */}

            <div style={styles.header}>

                <div style={styles.logo}>
                    Fame<span style={{ color: '#2563eb' }}>Hub</span>
                </div>

                <div style={styles.headerBtns}>

                    <button
                        onClick={() => navigate('/profile')}
                        style={styles.profileBtn}
                    >
                        👤 Profile
                    </button>

                    <button
                        onClick={handleLogout}
                        style={styles.logoutBtn}
                    >
                        Logout 🚪
                    </button>

                </div>
            </div>

            {/* HERO */}

            <div style={styles.heroSection}>

                <h1 style={styles.title}>
                    Welcome back,
                    <span style={{ color: '#38bdf8' }}>
                        {" "} {userName}!
                    </span>
                </h1>

                <p style={styles.subtitle}>
                    Continue your coding journey and improve your skills.
                </p>

            </div>

            {/* LOADING */}

            {loading ? (

                <div style={styles.loading}>
                    Loading dashboard...
                </div>

            ) : (

                <div style={styles.cardGrid}>

                    {sections.map((section) => (

                        <div
                            key={section.id}
                            onClick={() => navigate(section.path)}
                            style={styles.card}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform =
                                    'translateY(-8px)';
                                e.currentTarget.style.borderColor =
                                    section.color;
                                e.currentTarget.style.background =
                                    '#111827';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform =
                                    'translateY(0px)';
                                e.currentTarget.style.borderColor =
                                    '#1e293b';
                                e.currentTarget.style.background =
                                    '#0f172a';
                            }}
                        >

                            {/* BADGE */}

                            {section.badge && (
                                <div
                                    style={{
                                        ...styles.badge,
                                        background: section.color
                                    }}
                                >
                                    {section.badge}
                                </div>
                            )}

                            <div style={styles.icon}>
                                {section.icon}
                            </div>

                            <h2 style={styles.cardTitle}>
                                {section.title}
                            </h2>

                            <p style={styles.cardDesc}>
                                {section.desc}
                            </p>

                            <div
                                style={{
                                    ...styles.exploreText,
                                    color: section.color
                                }}
                            >
                                Explore Now →
                            </div>

                        </div>
                    ))}

                </div>
            )}
        </div>
    );
};

const styles = {

    container: {
        backgroundColor: '#020617',
        minHeight: '100vh',
        padding: '40px 20px',
        color: 'white',
        fontFamily: 'Arial, sans-serif'
    },

    header: {
        maxWidth: '1100px',
        margin: '0 auto 50px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },

    logo: {
        fontSize: '1.5rem',
        fontWeight: 'bold'
    },

    headerBtns: {
        display: 'flex',
        gap: '15px',
        alignItems: 'center'
    },

    profileBtn: {
        background: '#1e293b',
        border: '1px solid #334155',
        color: 'white',
        padding: '10px 18px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600'
    },

    logoutBtn: {
        background: 'transparent',
        border: '1px solid #334155',
        color: '#94a3b8',
        padding: '10px 18px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600'
    },

    heroSection: {
        textAlign: 'center',
        marginBottom: '60px'
    },

    title: {
        fontSize: '3rem',
        fontWeight: '800',
        marginBottom: '15px'
    },

    subtitle: {
        color: '#94a3b8',
        fontSize: '1.1rem'
    },

    loading: {
        textAlign: 'center',
        color: '#38bdf8',
        marginTop: '100px',
        fontSize: '1.2rem'
    },

    cardGrid: {
        maxWidth: '1100px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '30px'
    },

    card: {
        background: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: '24px',
        padding: '35px',
        cursor: 'pointer',
        transition: '0.3s ease',
        position: 'relative'
    },

    badge: {
        position: 'absolute',
        top: '20px',
        right: '20px',
        color: '#000',
        padding: '5px 12px',
        borderRadius: '20px',
        fontSize: '0.75rem',
        fontWeight: 'bold'
    },

    icon: {
        fontSize: '3.5rem',
        marginBottom: '20px'
    },

    cardTitle: {
        fontSize: '1.6rem',
        marginBottom: '15px'
    },

    cardDesc: {
        color: '#94a3b8',
        lineHeight: '1.7',
        fontSize: '1rem'
    },

    exploreText: {
        marginTop: '25px',
        fontWeight: 'bold',
        fontSize: '0.95rem'
    }
};

export default StudentPortal;
