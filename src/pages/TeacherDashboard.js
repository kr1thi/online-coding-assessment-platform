import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AddProblem from './AddProblem';
import AssessmentForm from './AssessmentForm';

const API_BASE = "https://online-coding-assessment-platform-production.up.railway.app";

const TeacherDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("Dashboard");
    const [selectedAssessmentId, setSelectedAssessmentId] = useState(null);
    const [assessments, setAssessments] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("ALL");

    const [showAddStudent, setShowAddStudent] = useState(false);
    const [newStudent, setNewStudent] = useState({
        name: '',
        email: '',
        studentId: ''
    });

    const userName = localStorage.getItem('userName') || 'Educator';
    const userEmail = localStorage.getItem('userEmail') || 'Not Available';
    const token = localStorage.getItem('token');

   

    const fetchAssessments = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(
                `${API_BASE}/api/admin/assessment/all`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setAssessments(res.data);
        } catch (err) {
            console.error("Error fetching assessments", err);
        } finally {
            setLoading(false);
        }
    }, [token]);

  

    const fetchStudents = useCallback(async () => {
        setLoading(true);

        try {
            const res = await axios.get(
                `${API_BASE}/api/admin/students/all`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setStudents(res.data);
        } catch (err) {
            console.error("Error fetching students", err);
        } finally {
            setLoading(false);
        }
    }, [token]);

   

    const fetchTeacherSubmissions = useCallback(async (assessmentId) => {
        if (!assessmentId) return;

        setLoading(true);

        try {
            const res = await axios.get(
                `${API_BASE}/api/assessment/teacher/${assessmentId}/results`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setSubmissions(res.data);
        } catch (err) {
            console.error("Submissions error:", err);
        } finally {
            setLoading(false);
        }
    }, [token]);


    useEffect(() => {

        if (activeTab === "Manage" || activeTab === "Dashboard") {
            fetchAssessments();
        }

        if (activeTab === "Students") {
            fetchStudents();
        }

        if (activeTab === "Submissions" && selectedAssessmentId) {
            fetchTeacherSubmissions(selectedAssessmentId);
        }

    }, [
        activeTab,
        selectedAssessmentId,
        fetchAssessments,
        fetchTeacherSubmissions,
        fetchStudents
    ]);

   
    const handleManualAddStudent = async (e) => {
        e.preventDefault();

        try {

            await axios.post(
                `${API_BASE}/api/admin/students/add`,
                newStudent,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert("Student added successfully!");

            setShowAddStudent(false);

            setNewStudent({
                name: '',
                email: '',
                studentId: ''
            });

            fetchStudents();

        } catch (err) {
            alert("Failed to add student.");
        }
    };

   

    const handleViewResults = (id) => {
        setSelectedAssessmentId(id);
        setActiveTab("Submissions");
        fetchTeacherSubmissions(id);
    };

  

    const handleDeleteAssessment = async (id) => {

        if (window.confirm("Are you sure?")) {

            try {

                await axios.delete(
                    `${API_BASE}/api/admin/assessment/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setAssessments(prev =>
                    prev.filter(asm => asm.id !== id)
                );

            } catch (err) {
                alert("Delete failed.");
            }
        }
    };

   

    const handleFinishAssessment = async () => {

        try {

            await axios.put(
                `${API_BASE}/api/admin/assessment/${selectedAssessmentId}/complete`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert("Assessment Completed!");

            setSelectedAssessmentId(null);
            setActiveTab("Manage");

            fetchAssessments();

        } catch (err) {
            console.error(err);
        }
    };

    // ---------------- LOGOUT ----------------

    const handleLogout = () => {

        if (window.confirm("Logout?")) {

            localStorage.clear();

            navigate('/login', {
                replace: true
            });
        }
    };

    

    const filteredSubmissions = submissions.filter(sub => {

        const matchesSearch =
            sub.studentId
                ?.toString()
                .toLowerCase()
                .includes(searchTerm.toLowerCase());

        const matchesStatus =
            filterStatus === "ALL" ||
            sub.status === filterStatus;

        return matchesSearch && matchesStatus;
    });

    const filteredStudents = students.filter(std =>
        std.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        std.studentId?.toString().includes(searchTerm)
    );

    return (
        <div style={styles.appLayout}>

            {/* SIDEBAR */}

            <aside style={styles.sidebar}>

                <div style={styles.brandWrapper}>
                    <div style={styles.logoSquare}>F</div>

                    <h2 style={styles.brandTitle}>
                        FAMEHUB
                    </h2>
                </div>

                <nav style={styles.navStyle}>

                    <NavItem
                        icon="📊"
                        label="Dashboard"
                        active={activeTab === "Dashboard"}
                        onClick={() => {
                            setActiveTab("Dashboard");
                            setSelectedAssessmentId(null);
                        }}
                    />

                    <NavItem
                        icon="👤"
                        label="Profile"
                        active={activeTab === "Profile"}
                        onClick={() => {
                            setActiveTab("Profile");
                            setSelectedAssessmentId(null);
                        }}
                    />

                    <NavItem
                        icon="🧑‍🎓"
                        label="Students"
                        active={activeTab === "Students"}
                        onClick={() => {
                            setActiveTab("Students");
                            setSelectedAssessmentId(null);
                        }}
                    />

                    <NavItem
                        icon="📝"
                        label="Create"
                        active={activeTab === "Create"}
                        onClick={() => {
                            setActiveTab("Create");
                            setSelectedAssessmentId(null);
                        }}
                    />

                    <NavItem
                        icon="🛠️"
                        label="Manage"
                        active={activeTab === "Manage"}
                        onClick={() => {
                            setActiveTab("Manage");
                            setSelectedAssessmentId(null);
                        }}
                    />

                    <NavItem
                        icon="📑"
                        label="Submissions"
                        active={activeTab === "Submissions"}
                        onClick={() => setActiveTab("Submissions")}
                    />

                    <div style={{ flexGrow: 1 }}></div>

                    <div
                        style={styles.logoutBtn}
                        onClick={handleLogout}
                    >
                        🚪 Logout
                    </div>

                </nav>

            </aside>

            {/* MAIN */}

            <main style={styles.mainViewport}>

                <header style={styles.topHeader}>

                    <div>
                        <h1 style={styles.welcomeText}>
                            Welcome back, {userName}!
                        </h1>

                        <p style={styles.breadcrumb}>
                            System / {activeTab}
                        </p>
                    </div>

                    <div
                        style={styles.topProfileHeader}
                        onClick={() => setActiveTab("Profile")}
                    >

                        <div style={styles.miniAvatar}>
                            {userName.charAt(0)}
                        </div>

                        <span style={styles.miniEmail}>
                            {userEmail}
                        </span>

                    </div>

                </header>

                <div style={styles.content}>


                    {activeTab === "Dashboard" && (

                        <div>

                            <div
                                style={{
                                    display: 'flex',
                                    gap: '20px',
                                    marginBottom: '40px'
                                }}
                            >

                                <div style={styles.miniStatCard}>
                                    <span>Total Assessments</span>
                                    <h2>{assessments.length}</h2>
                                </div>

                                <div style={styles.miniStatCard}>
                                    <span>Students</span>
                                    <h2>{students.length}</h2>
                                </div>

                            </div>

                        </div>
                    )}

                    {/* STUDENTS */}

                    {activeTab === "Students" && (

                        <div>

                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginBottom: '20px'
                                }}
                            >

                                <button
                                    style={styles.primaryBtn}
                                    onClick={() =>
                                        setShowAddStudent(!showAddStudent)
                                    }
                                >
                                    Add Student
                                </button>

                                <input
                                    type="text"
                                    placeholder="Search..."
                                    style={styles.searchBox}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                />

                            </div>

                            {showAddStudent && (

                                <form
                                    onSubmit={handleManualAddStudent}
                                    style={styles.manualAddForm}
                                >

                                    <input
                                        placeholder="Student Name"
                                        style={styles.searchBox}
                                        value={newStudent.name}
                                        onChange={(e) =>
                                            setNewStudent({
                                                ...newStudent,
                                                name: e.target.value
                                            })
                                        }
                                        required
                                    />

                                    <input
                                        placeholder="Student ID"
                                        style={styles.searchBox}
                                        value={newStudent.studentId}
                                        onChange={(e) =>
                                            setNewStudent({
                                                ...newStudent,
                                                studentId: e.target.value
                                            })
                                        }
                                        required
                                    />

                                    <input
                                        type="email"
                                        placeholder="Email"
                                        style={styles.searchBox}
                                        value={newStudent.email}
                                        onChange={(e) =>
                                            setNewStudent({
                                                ...newStudent,
                                                email: e.target.value
                                            })
                                        }
                                        required
                                    />

                                    <button
                                        type="submit"
                                        style={styles.primaryBtn}
                                    >
                                        Save
                                    </button>

                                </form>
                            )}

                            <div style={styles.tableWrapper}>

                                <table
                                    style={{
                                        width: '100%',
                                        borderCollapse: 'collapse'
                                    }}
                                >

                                    <thead>

                                        <tr style={styles.tableHeadRow}>
                                            <th style={styles.thStyle}>
                                                Student ID
                                            </th>

                                            <th style={styles.thStyle}>
                                                Name
                                            </th>

                                            <th style={styles.thStyle}>
                                                Email
                                            </th>
                                        </tr>

                                    </thead>

                                    <tbody>

                                        {filteredStudents.map((std, i) => (

                                            <tr key={i} style={styles.tableRow}>

                                                <td style={styles.tdStyle}>
                                                    {std.studentId}
                                                </td>

                                                <td style={styles.tdStyle}>
                                                    {std.name}
                                                </td>

                                                <td style={styles.tdStyle}>
                                                    {std.email}
                                                </td>

                                            </tr>
                                        ))}

                                    </tbody>

                                </table>

                            </div>

                        </div>
                    )}

                </div>

            </main>

        </div>
    );
};

// ---------------- NAV ITEM ----------------

const NavItem = ({
    icon,
    label,
    active,
    onClick
}) => (

    <div
        style={active ? styles.activeNavItem : styles.navItem}
        onClick={onClick}
    >
        <span style={{ marginRight: '12px' }}>
            {icon}
        </span>

        {label}
    </div>
);



const styles = {

    appLayout: {
        display: 'flex',
        height: '100vh',
        background: '#f5f7fb',
        fontFamily: 'Arial'
    },

    sidebar: {
        width: '240px',
        background: '#fff',
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px'
    },

    brandWrapper: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '30px'
    },

    logoSquare: {
        width: '32px',
        height: '32px',
        background: '#2563eb',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 'bold'
    },

    brandTitle: {
        fontSize: '18px',
        margin: 0
    },

    navStyle: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        flexGrow: 1
    },

    navItem: {
        padding: '10px',
        borderRadius: '6px',
        cursor: 'pointer'
    },

    activeNavItem: {
        padding: '10px',
        borderRadius: '6px',
        background: '#dbeafe',
        color: '#1d4ed8',
        fontWeight: 'bold',
        cursor: 'pointer'
    },

    logoutBtn: {
        padding: '10px',
        color: '#dc2626',
        cursor: 'pointer'
    },

    mainViewport: {
        flex: 1,
        overflowY: 'auto'
    },

    topHeader: {
        padding: '20px',
        background: '#fff',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-between'
    },

    welcomeText: {
        margin: 0
    },

    breadcrumb: {
        color: '#6b7280',
        fontSize: '13px'
    },

    topProfileHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    },

    miniAvatar: {
        width: '35px',
        height: '35px',
        borderRadius: '50%',
        background: '#2563eb',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },

    miniEmail: {
        fontSize: '13px'
    },

    content: {
        padding: '20px'
    },

    miniStatCard: {
        background: '#fff',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        flex: 1
    },

    tableWrapper: {
        background: '#fff',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid #e5e7eb'
    },

    tableHeadRow: {
        background: '#f9fafb'
    },

    thStyle: {
        padding: '12px',
        textAlign: 'left'
    },

    tdStyle: {
        padding: '12px'
    },

    tableRow: {
        borderTop: '1px solid #e5e7eb'
    },

    primaryBtn: {
        background: '#2563eb',
        color: '#fff',
        border: 'none',
        padding: '10px 16px',
        borderRadius: '6px',
        cursor: 'pointer'
    },

    searchBox: {
        padding: '10px',
        border: '1px solid #d1d5db',
        borderRadius: '6px'
    },

    manualAddForm: {
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        flexWrap: 'wrap'
    }

};

export default TeacherDashboard;
