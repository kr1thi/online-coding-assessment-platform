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

            console.error(err);

            alert("Failed to add student.");
        }
    };


    const handleViewResults = (id) => {

        setSelectedAssessmentId(id);

        setActiveTab("Submissions");

        fetchTeacherSubmissions(id);
    };


    const handleDeleteAssessment = async (id) => {

        if (!window.confirm("Are you sure?")) return;

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

            console.error(err);

            alert("Delete failed");
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

    const handleLogout = () => {

        localStorage.clear();

        navigate('/login', { replace: true });
    };


    const filteredSubmissions = submissions.filter(sub => {

        const matchesSearch =
            sub.studentId?.toString()
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

            <aside style={styles.sidebar}>

                <h2>Teacher Dashboard</h2>

                <button onClick={() => setActiveTab("Dashboard")}>
                    Dashboard
                </button>

                <button onClick={() => setActiveTab("Students")}>
                    Students
                </button>

                <button onClick={() => setActiveTab("Create")}>
                    Create Assessment
                </button>

                <button onClick={() => setActiveTab("Manage")}>
                    Manage Tests
                </button>

                <button onClick={() => setActiveTab("Submissions")}>
                    Submissions
                </button>

                <button onClick={handleLogout}>
                    Logout
                </button>

            </aside>

            <main style={styles.mainViewport}>

                <h1>Welcome back, {userName}</h1>


                {activeTab === "Dashboard" && (

                    <div>

                        <h2>Total Assessments: {assessments.length}</h2>

                        <h2>Total Students: {students.length}</h2>

                    </div>
                )}

           

                {activeTab === "Students" && (

                    <div>

                        <button
                            onClick={() =>
                                setShowAddStudent(!showAddStudent)
                            }
                        >
                            Add Student
                        </button>

                        <input
                            type="text"
                            placeholder="Search..."
                            onChange={(e) =>
                                setSearchTerm(e.target.value)
                            }
                        />

                        {showAddStudent && (

                            <form onSubmit={handleManualAddStudent}>

                                <input
                                    placeholder="Student Name"
                                    value={newStudent.name}
                                    onChange={(e) =>
                                        setNewStudent({
                                            ...newStudent,
                                            name: e.target.value
                                        })
                                    }
                                />

                                <input
                                    placeholder="Student ID"
                                    value={newStudent.studentId}
                                    onChange={(e) =>
                                        setNewStudent({
                                            ...newStudent,
                                            studentId: e.target.value
                                        })
                                    }
                                />

                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={newStudent.email}
                                    onChange={(e) =>
                                        setNewStudent({
                                            ...newStudent,
                                            email: e.target.value
                                        })
                                    }
                                />

                                <button type="submit">
                                    Save
                                </button>

                            </form>
                        )}

                        <table>

                            <thead>

                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                </tr>

                            </thead>

                            <tbody>

                                {filteredStudents.map((std, i) => (

                                    <tr key={i}>

                                        <td>{std.studentId}</td>

                                        <td>{std.name}</td>

                                        <td>{std.email}</td>

                                    </tr>
                                ))}

                            </tbody>

                        </table>

                    </div>
                )}

                {activeTab === "Create" && (

                    <div>

                        {!selectedAssessmentId ? (

                            <AssessmentForm
                                token={token}
                                styles={styles}
                                onSuccess={(id) =>
                                    setSelectedAssessmentId(id)
                                }
                                onCancel={() =>
                                    setActiveTab("Dashboard")
                                }
                            />

                        ) : (

                            <div>

                                <button
                                    onClick={() =>
                                        setSelectedAssessmentId(null)
                                    }
                                >
                                    Back
                                </button>

                                <button
                                    onClick={handleFinishAssessment}
                                >
                                    Go Live
                                </button>

                                <AddProblem
                                    token={token}
                                    styles={styles}
                                    assessmentId={selectedAssessmentId}
                                />

                            </div>
                        )}

                    </div>
                )}

                {activeTab === "Manage" && (

                    <div>

                        <h2>Manage Assessments</h2>

                        {loading ? (

                            <p>Loading...</p>

                        ) : (

                            assessments.map(asm => (

                                <div
                                    key={asm.id}
                                    style={styles.manageCard}
                                >

                                    <h3>{asm.title}</h3>

                                    <p>
                                        Duration: {asm.duration} mins
                                    </p>

                                    <button
                                        onClick={() =>
                                            handleViewResults(asm.id)
                                        }
                                    >
                                        Results
                                    </button>

                                    <button
                                        onClick={() => {
                                            setSelectedAssessmentId(asm.id);
                                            setActiveTab("Create");
                                        }}
                                    >
                                        Edit
                                    </button>

                                    <button
                                        onClick={() =>
                                            handleDeleteAssessment(asm.id)
                                        }
                                    >
                                        Delete
                                    </button>

                                </div>
                            ))
                        )}

                    </div>
                )}

               
                {activeTab === "Submissions" && (

                    <div>

                        <h2>Submissions</h2>

                        <input
                            type="text"
                            placeholder="Search Student ID"
                            onChange={(e) =>
                                setSearchTerm(e.target.value)
                            }
                        />

                        <select
                            onChange={(e) =>
                                setFilterStatus(e.target.value)
                            }
                        >
                            <option value="ALL">All</option>
                            <option value="ACCEPTED">Passed</option>
                            <option value="FAILED">Failed</option>
                        </select>

                        <table>

                            <thead>

                                <tr>
                                    <th>Student ID</th>
                                    <th>Name</th>
                                    <th>Score</th>
                                    <th>Status</th>
                                </tr>

                            </thead>

                            <tbody>

                                {filteredSubmissions.map((sub, i) => (

                                    <tr key={i}>

                                        <td>{sub.studentId}</td>

                                        <td>{sub.studentName}</td>

                                        <td>
                                            {sub.totalScore} /
                                            {sub.totalPossible}
                                        </td>

                                        <td>{sub.status}</td>

                                    </tr>
                                ))}

                            </tbody>

                        </table>

                    </div>
                )}

            </main>

        </div>
    );
};


const styles = {

    appLayout: {
        display: 'flex',
        minHeight: '100vh',
        background: '#f5f7fb'
    },

    sidebar: {
        width: '250px',
        background: '#fff',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
    },

    mainViewport: {
        flex: 1,
        padding: '20px'
    },

    manageCard: {
        background: '#fff',
        padding: '20px',
        marginBottom: '20px',
        borderRadius: '8px'
    }
};

export default TeacherDashboard;
