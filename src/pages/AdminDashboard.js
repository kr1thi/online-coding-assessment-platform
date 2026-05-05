import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentForm from './StudentForm';
import AddProblem from './AddProblem';
import ExcelImport from './ExcelImport';
import TeacherForm from './TeacherForm';
import BranchForm from './BranchForm';
import BatchForm from './BatchForm';
import ManageRoles from './ManageRoles';

//admindashboard component - Integrated excel import and live data list
 
const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("Dashboard");
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [viewItem, setViewItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    
    const [stats, setStats] = useState({
        totalAssessments: 0, totalPractice: 0, totalSubmissions: 0, activeStudents: 0
    });
    const [moduleData, setModuleData] = useState([]);
    const [institutions, setInstitutions] = useState([]);
    const [branches, setBranches] = useState([]);
    const [batches, setBatches] = useState([]);
    const [recentSubmissions, setRecentSubmissions] = useState([]);

    const adminData = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem('user') || '{}');
        } catch (e) {
            return { name: 'Admin' };
        }
    }, []);

    const [formData, setFormData] = useState({
        id: '', name: '', code: '', headName: '', primaryEmail: '',
        primaryContact: '', secondaryEmail: '', address: '',
        city: '', state: '', instituteType: 'College',
        accessPlan: 'Basic', password: '', version: null
    });

    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role')?.toUpperCase();

    const handleLogout = useCallback(() => {
        localStorage.clear();
        navigate('/login', { replace: true });
    }, [navigate]);

    const fetchCoreData = useCallback(async () => {
        if (!token || role !== 'ADMIN') return handleLogout();
        const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
        
        setLoading(true);

        try {
            if (activeTab === "Dashboard") {
                const [sRes, rRes] = await Promise.all([
                    fetch('http://localhost:8082/api/admin/stats', { headers }),
                    fetch('http://localhost:8082/api/submissions/all', { headers })
                ]);
                if (sRes.ok) setStats(await sRes.json());
                if (rRes.ok) {
                    const data = await rRes.json();
                    setRecentSubmissions(Array.isArray(data) ? [...data].reverse().slice(0, 8) : []);
                }
            }

            const endpointMap = {
                "Institutions": "hierarchy/institutions",
                "Branches": "hierarchy/branches/all",
                "Batch Years": "hierarchy/batches/all",
                "Students": "students/all",
                "Student Import": "students/all",//live data for import view
                "Teachers": "teachers/all",
                "Teacher Import": "teachers/all", // Live data for Import View
                "Assessments": "assessments/all",
                "Curriculum": "curriculum/all"
            };

            if (endpointMap[activeTab]) {
                const res = await fetch(`http://localhost:8082/api/admin/${endpointMap[activeTab]}`, { headers });
                if (res.ok) {
                    const data = await res.json();
                    setModuleData(Array.isArray(data) ? data : []);
                }
            }

            const [instRes, brRes, btRes] = await Promise.all([
                fetch('http://localhost:8082/api/admin/hierarchy/institutions', { headers }),
                fetch('http://localhost:8082/api/admin/hierarchy/branches/all', { headers }),
                fetch('http://localhost:8082/api/admin/hierarchy/batches/all', { headers })
            ]);

            if (instRes.ok) setInstitutions(await instRes.json());
            if (brRes.ok) setBranches(await brRes.json());
            if (btRes.ok) setBatches(await btRes.json());

        } catch (error) {
            console.error("Fetch Error:", error);
        } finally {
            setLoading(false);
        }
    }, [activeTab, token, role, handleLogout]);

    useEffect(() => {
        fetchCoreData();
        setShowForm(false);
        setIsEditing(false);
        setSearchTerm("");
    }, [activeTab, fetchCoreData]);

    const filteredData = useMemo(() => {
        if (!searchTerm) return moduleData;
        const lowerSearch = searchTerm.toLowerCase();
        return moduleData.filter(item => {
            const name = item.name || item.userName || item.branchName || item.batchName || "";
            const roll = item.rollNo || item.code || "";
            return name.toLowerCase().includes(lowerSearch) || roll.toLowerCase().includes(lowerSearch);
        });
    }, [moduleData, searchTerm]);

    const resetForm = () => {
        setFormData({ id: '', name: '', code: '', headName: '', primaryEmail: '', primaryContact: '', secondaryEmail: '', address: '', city: '', state: '', instituteType: 'College', accessPlan: 'Basic', password: '', version: null });
        setShowForm(false);
        setIsEditing(false);
    };

    const handleSaveInstitution = async (e) => {
        e.preventDefault();
        const method = isEditing ? 'PUT' : 'POST';
        const url = isEditing
            ? `http://localhost:8082/api/admin/hierarchy/institutions/update/${formData.id}`
            : 'http://localhost:8082/api/admin/hierarchy/institutions/add';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                alert(isEditing ? "✅ Updated Successfully!" : "✅ Registered Successfully!");
                resetForm();
                fetchCoreData();
            } else {
                const err = await res.json();
                alert("❌ Error: " + (err.message || "Failed to save"));
            }
        } catch (error) {
            alert("Connection Error");
        }
    };

    const handleDelete = async (item, type) => {
        if (!window.confirm(`Are you sure you want to delete this ${type.slice(0, -1)}?`)) return;

        const endpointMap = {
            "Institutions": `http://localhost:8082/api/admin/hierarchy/institutions/delete/${item.id}`,
            "Teachers": `http://localhost:8082/api/admin/teachers/delete/${item.id}`,
            "Teacher Import": `http://localhost:8082/api/admin/teachers/delete/${item.id}`,
            "Branches": `http://localhost:8082/api/admin/hierarchy/branches/delete/${item.id}`,
            "Batch Years": `http://localhost:8082/api/admin/hierarchy/batches/delete/${item.id}`,
            "Students": `http://localhost:8082/api/admin/students/delete/${item.id}`,
            "Student Import": `http://localhost:8082/api/admin/students/delete/${item.id}` 
        };

        try {
            const res = await fetch(endpointMap[type], {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                alert("Deleted successfully!");
                fetchCoreData();
            } else {
                alert("Failed to delete. It might be linked to other records.");
            }
        } catch (error) {
            alert("Error deleting record");
        }
    };

    const menuGroups = [
        { name: "FOUNDATION", items: ["Institutions", "Batch Years", "Branches"] },
        { name: "ACADEMICS", items: ["Assessments", "Curriculum"] },
        { name: "USER MANAGEMENT", items: ["Teachers", "Students", "Manage Roles"] },
        { name: "REPOSITORY", items: ["Student Import", "Teacher Import", "Add Problem"] }
    ];

    const sharedStyles = { cardStyle, cardTitle, formGrid, fGroup, lStyle, iBox, primaryBtn, secondaryBtn };

    return (
        <div style={appLayout}>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            
            <aside style={sidebarStyle}>
                <div style={brandWrapper}><h2 style={brandTitle}>FAMEHUB <span style={badgeStyle}>ADMIN</span></h2></div>
                <nav style={navStyle}>
                    <NavItem label="Dashboard" icon="📊" active={activeTab === "Dashboard"} onClick={() => setActiveTab("Dashboard")} />
                    {menuGroups.map(group => (
                        <div key={group.name} style={menuGroupWrapper}>
                            <p style={groupLabel}>{group.name}</p>
                            {group.items.map(item => (
                                <NavItem key={item} label={item} active={activeTab === item} onClick={() => setActiveTab(item)} />
                            ))}
                        </div>
                    ))}
                </nav>
            </aside>

            <main style={mainViewport}>
                <header style={topHeader}>
                    <div>
                        <h1 style={viewTitle}>{activeTab}</h1>
                        <p style={breadcrumb}>Admin / {activeTab}</p>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                        {activeTab !== "Dashboard" && !["Add Problem"].includes(activeTab) && (
                            <input 
                                style={{ ...iBox, width: '250px' }} 
                                placeholder={`Search ${activeTab}...`} 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        )}

                        <div style={profilePill}>
                            <div style={smallAvatar}>{(adminData.name || 'A').charAt(0).toUpperCase()}</div>
                            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
                                <span style={pillName}>{adminData.name || "Admin"}</span>
                                <span style={pillRole}>Main Administrator</span>
                            </div>
                        </div>
                        <button onClick={handleLogout} style={dangerBtn}>Logout</button>
                    </div>
                </header>

                <section style={contentSection}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '100px' }}>
                            <div style={spinnerStyle}></div>
                            <h3 style={{color: '#3b82f6', marginTop: '20px'}}>Refreshing Data...</h3>
                        </div>
                    ) : (
                        <>
                            {viewItem && (
                                <div style={modalOverlay} onClick={() => setViewItem(null)}>
                                    <div style={modalContent} onClick={e => e.stopPropagation()}>
                                        <h3 style={cardTitle}>Information Details</h3>
                                        <hr style={{ borderColor: '#1f2937', margin: '15px 0' }} />
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', overflowY: 'auto', maxHeight: '60vh' }}>
                                            {Object.entries(viewItem).map(([k, v]) => (
                                                <div key={k}>
                                                    <label style={lStyle}>{k.toUpperCase()}</label>
                                                    <p style={{ color: '#fff', fontSize: '13px', marginTop: '4px' }}>
                                                        {typeof v === 'object' ? (v?.name || v?.batchName || '---') : String(v)}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                        <button onClick={() => setViewItem(null)} style={{ ...secondaryBtn, marginTop: '20px', width: '100%' }}>Close</button>
                                    </div>
                                </div>
                            )}

                            {activeTab === "Dashboard" ? (
                                <>
                                    <div style={statsGrid}>
                                        <StatBox title="Assessments" val={stats.totalAssessments} color="#3b82f6" icon="📝" />
                                        <StatBox title="Practice" val={stats.totalPractice} color="#10b981" icon="⚡" />
                                        <StatBox title="Submissions" val={stats.totalSubmissions} color="#f59e0b" icon="📡" />
                                        <StatBox title="Students" val={stats.activeStudents} color="#8b5cf6" icon="🎓" />
                                    </div>
                                    <div style={cardStyle}>
                                        <h3 style={cardTitle}>Recent Activity</h3>
                                        <DataTable headers={['#', 'Student', 'Problem', 'Status', 'Score', 'Date']} data={recentSubmissions} tab="Dashboard" />
                                    </div>
                                </>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    
                                    {/* form selection */}
                                    {showForm && (
                                        <div style={cardStyle}>
                                            <h3 style={cardTitle}>{isEditing ? "Update" : "Create New"} {activeTab}</h3>
                                            <br/>
                                            {activeTab === "Institutions" && (
                                                <form onSubmit={handleSaveInstitution} style={formGrid}>
                                                    <div style={fGroup}><label style={lStyle}>NAME</label><input style={iBox} required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
                                                    <div style={fGroup}><label style={lStyle}>CODE</label><input style={iBox} required value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} /></div>
                                                    <div style={fGroup}><label style={lStyle}>HEAD NAME</label><input style={iBox} required value={formData.headName} onChange={e => setFormData({ ...formData, headName: e.target.value })} /></div>
                                                    <div style={fGroup}><label style={lStyle}>EMAIL</label><input style={iBox} type="email" required value={formData.primaryEmail} onChange={e => setFormData({ ...formData, primaryEmail: e.target.value })} /></div>
                                                    <div style={{ display: 'flex', gap: '10px', gridColumn: 'span 2', marginTop: '10px' }}>
                                                        <button type="submit" style={primaryBtn}>{isEditing ? "Update" : "Save"}</button>
                                                        <button type="button" onClick={resetForm} style={secondaryBtn}>Cancel</button>
                                                    </div>
                                                </form>
                                            )}
                                            {activeTab === "Branches" && <BranchForm institutions={institutions} token={token} onSuccess={() => { fetchCoreData(); setShowForm(false); }} onCancel={() => setShowForm(false)} styles={sharedStyles} />}
                                            {activeTab === "Batch Years" && <BatchForm branches={branches} token={token} onSuccess={() => { fetchCoreData(); setShowForm(false); }} onCancel={() => setShowForm(false)} styles={sharedStyles} />}
                                            {activeTab === "Teachers" && <TeacherForm institutions={institutions} token={token} onSuccess={() => { fetchCoreData(); setShowForm(false); }} onCancel={() => setShowForm(false)} styles={sharedStyles} />}
                                            {activeTab === "Students" && <StudentForm batches={batches} token={token} onSuccess={() => { fetchCoreData(); setShowForm(false); }} onCancel={() => setShowForm(false)} styles={sharedStyles} />}
                                        </div>
                                    )}
                                    {/*mange role selection*/}
{activeTab === "Manage Roles" && (
    <div style={cardStyle}>
        <ManageRoles token={token}
        onSuccess={() => {
        setShowForm(false);
        fetchCoreData(); // Itha call panna thaan table la puthiya data kaatum
    }} />

    </div>
)}

                                    {/* main data list section */}
                                    {!["Student Import", "Teacher Import","Manage Roles", "Add Problem"].includes(activeTab) && (
                                        <div style={cardStyle}>
                                            <div style={cardHeader}>
                                                <h3 style={cardTitle}>{activeTab} List</h3>
                                                {!showForm && (
                                                    <button onClick={() => { resetForm(); setShowForm(true); }} style={primaryBtn}>+ New {activeTab.slice(0, -1)}</button>
                                                )}
                                            </div>
                                            <DataTable
                                                headers={
                                                    activeTab === "Institutions" ? ['#', 'Name', 'Email', 'Head', 'Code', 'Actions'] :
                                                    activeTab === "Students" ? ['#', 'Name', 'Roll No', 'Batch', 'Actions'] :
                                                    activeTab === "Teachers" ? ['#', 'Name', 'Staff ID', 'Institution', 'Actions'] :
                                                    ['#', 'Name', 'Detail', 'Status', 'Actions']
                                                }
                                                data={filteredData}
                                                tab={activeTab}
                                                onDelete={handleDelete}
                                                onView={setViewItem}
                                                onEdit={(item) => { setFormData(item); setIsEditing(true); setShowForm(true); window.scrollTo(0,0); }}
                                            />
                                        </div>
                                    )}

                                    {/*student import and live list */}
                                    {activeTab === "Student Import" && (
                                        <>
                                            <ExcelImport 
                                                token={token} 
                                                activeTab={activeTab} 
                                                importMode="STUDENT" 
                                                styles={sharedStyles} 
                                                onSuccess={fetchCoreData} 
                                            />
                                            <div style={cardStyle}>
                                                <h3 style={cardTitle}>Current Students List</h3>
                                                <DataTable 
                                                    headers={['#', 'Name', 'Roll No', 'Batch', 'Branch', 'Actions']}
                                                    data={filteredData}
                                                    tab="Students"
                                                    onDelete={handleDelete}
                                                    onView={setViewItem}
                                                    onEdit={(item) => { setFormData(item); setIsEditing(true); setShowForm(true); }}
                                                />
                                            </div>
                                        </>
                                    )}

                                    {/* --- TEACHER IMPORT + LIVE LIST --- */}
                                    {activeTab === "Teacher Import" && (
                                        <>
                                            <ExcelImport 
                                                token={token} 
                                                activeTab={activeTab} 
                                                importMode="TEACHER" 
                                                styles={sharedStyles} 
                                                onSuccess={fetchCoreData} 
                                            />
                                            <div style={cardStyle}>
                                                <h3 style={cardTitle}>Current Teachers List</h3>
                                                <DataTable 
                                                    headers={['#', 'Name', 'Staff ID', 'Institution', 'Actions']}
                                                    data={filteredData}
                                                    tab="Teachers"
                                                    onDelete={handleDelete}
                                                    onView={setViewItem}
                                                    onEdit={(item) => { setFormData(item); setIsEditing(true); setShowForm(true); }}
                                                />
                                            </div>
                                        </>
                                    )}

                                    {activeTab === "Add Problem" && <AddProblem token={token} styles={sharedStyles} />}
                                </div>
                            )}
                        </>
                    )}
                </section>
            </main>
        </div>
    );
};

// sub Components 

const DataTable = ({ headers, data, tab, onDelete, onView, onEdit }) => (
    <div style={{ overflowX: 'auto' }}>
        <table style={tableStyle}>
            <thead>
                <tr style={tableHeaderRow}>
                    {headers.map(h => <th key={h} style={thStyle}>{h}</th>)}
                </tr>
            </thead>
            <tbody>
                {data && data.length > 0 ? data.map((item, i) => (
                    <tr key={item.id || i} style={tableRow}>
                        <td style={tdStyle}>{i + 1}</td>
                        {tab === "Institutions" ? (
                            <>
                                <td style={tdBold}>{item.name}</td>
                                <td style={tdStyle}>{item.primaryEmail}</td>
                                <td style={tdStyle}>{item.headName}</td>
                                <td style={tdStyle}><span style={badgeCode}>{item.code}</span></td>
                            </>
                        ) : tab === "Students" || tab === "Student Import" ? (
                            <>
                                <td style={tdBold}>{item.name || item.userName}</td>
                                <td style={tdStyle}>{item.rollNo}</td>
                                <td style={tdStyle}>{item.batch?.batchName || "N/A"}</td>
                                <td style={tdStyle}>{item.batch?.branch?.branchName || "N/A"}</td>
                            </>
                        ) : tab === "Dashboard" ? (
                            <>
                                <td style={tdBold}>{item.userName}</td>
                                <td style={tdStyle}>{item.problemName}</td>
                                <td style={tdStyle}><span style={{ color: item.status === 'ACCEPTED' ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>{item.status}</span></td>
                                <td style={tdStyle}>{item.score}%</td>
                                <td style={tdStyle}>{item.submittedAt ? new Date(item.submittedAt).toLocaleDateString() : 'N/A'}</td>
                            </>
                        ) : tab === "Teachers" || tab === "Teacher Import" ? (
                            <>
                                <td style={tdBold}>{item.name}</td>
                                <td style={tdStyle}>{item.staffId || "N/A"}</td>
                                <td style={tdStyle}>{item.institution?.name || "N/A"}</td>
                            </>
                        ) : (
                            <>
                                <td style={tdBold}>{item.name || item.branchName || item.batchName}</td>
                                <td style={tdStyle}>{item.code || item.branchCode || "---"}</td>
                                <td style={tdStyle}><span style={{color: '#10b981'}}>Active</span></td>
                            </>
                        )}
                        {tab !== "Dashboard" && (
                            <td style={tdStyle}>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={() => onView(item)} style={actionBtnView} title="View">👁️</button>
                                    <button onClick={() => onEdit(item)} style={actionBtnEdit} title="Edit">✏️</button>
                                    <button onClick={() => onDelete(item, tab)} style={actionBtnDelete} title="Delete">🗑️</button>
                                </div>
                            </td>
                        )}
                    </tr>
                )) : (
                    <tr><td colSpan={headers.length} style={emptyCell}>No records found.</td></tr>
                )}
            </tbody>
        </table>
    </div>
);

const NavItem = ({ label, icon, active, onClick }) => (
    <div onClick={onClick} style={active ? activeNavItem : navItem}>
        {icon && <span style={{ marginRight: '10px' }}>{icon}</span>} {label}
    </div>
);

const StatBox = ({ title, val, color, icon }) => (
    <div style={{ ...statCard, borderLeft: `4px solid ${color}` }}>
        <div style={statHeader}><span style={statLabel}>{title}</span> <span style={{fontSize: '20px'}}>{icon}</span></div>
        <h2 style={statValue}>{val}</h2>
    </div>
);

//  CSS 
const appLayout = { display: 'flex', height: '100vh', background: '#0b0f19', color: '#e2e8f0', fontFamily: 'Inter, sans-serif' };
const sidebarStyle = { width: '260px', background: '#111827', borderRight: '1px solid #1f2937', display: 'flex', flexDirection: 'column' };
const brandWrapper = { padding: '24px', borderBottom: '1px solid #1f2937' };
const brandTitle = { fontSize: '18px', fontWeight: '800', color: '#3b82f6', letterSpacing: '1px', margin: 0 };
const badgeStyle = { fontSize: '10px', background: '#3b82f6', color: '#fff', padding: '2px 6px', borderRadius: '4px', marginLeft: '5px', verticalAlign: 'middle' };
const navStyle = { padding: '20px', flex: 1, overflowY: 'auto' };
const menuGroupWrapper = { marginBottom: '25px' };
const groupLabel = { fontSize: '11px', color: '#4b5563', fontWeight: 'bold', marginBottom: '12px', textTransform: 'uppercase' };
const navItem = { padding: '12px 15px', borderRadius: '8px', cursor: 'pointer', color: '#9ca3af', fontSize: '14px', transition: '0.3s', display: 'flex', alignItems: 'center' };
const activeNavItem = { ...navItem, background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', fontWeight: '600' };
const mainViewport = { flex: 1, overflowY: 'auto', background: '#0b0f19' };
const topHeader = { padding: '15px 40px', background: '#111827', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10, borderBottom: '1px solid #1f2937' };
const viewTitle = { fontSize: '20px', margin: 0, fontWeight: '700' };
const breadcrumb = { fontSize: '12px', color: '#6b7280', marginTop: '4px', margin: 0 };
const contentSection = { padding: '30px 40px' };
const profilePill = { display: 'flex', alignItems: 'center', gap: '12px', background: '#1f2937', padding: '6px 14px 6px 8px', borderRadius: '50px', border: '1px solid #374151', cursor: 'pointer' };
const smallAvatar = { width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold', color: '#fff' };
const pillName = { fontSize: '13px', fontWeight: '600', color: '#f3f4f6' };
const pillRole = { fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' };
const statsGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' };
const statCard = { background: '#111827', padding: '20px', borderRadius: '12px', border: '1px solid #1f2937', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' };
const statHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#9ca3af' };
const statLabel = { fontSize: '13px', fontWeight: '500' };
const statValue = { fontSize: '28px', margin: '12px 0 0 0', fontWeight: '800', color: '#fff' };
const cardStyle = { background: '#111827', borderRadius: '12px', padding: '24px', border: '1px solid #1f2937' };
const cardHeader = { display: 'flex', justifyContent: 'space-between', marginBottom: '25px', alignItems: 'center' };
const cardTitle = { fontSize: '17px', margin: 0, fontWeight: '600', color: '#f3f4f6' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const tableHeaderRow = { textAlign: 'left', borderBottom: '2px solid #1f2937' };
const thStyle = { padding: '15px 12px', color: '#6b7280', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' };
const tableRow = { borderBottom: '1px solid #1f2937', transition: '0.2s hover', background: 'transparent' };
const tdStyle = { padding: '16px 12px', color: '#9ca3af', fontSize: '14px' };
const tdBold = { ...tdStyle, color: '#f3f4f6', fontWeight: '600' };
const emptyCell = { padding: '60px', textAlign: 'center', color: '#6b7280', fontSize: '15px' };
const badgeCode = { background: '#1e293b', color: '#3b82f6', border: '1px solid #3b82f6', padding: '3px 8px', borderRadius: '5px', fontSize: '12px', fontWeight: 'bold' };
const primaryBtn = { background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' };
const secondaryBtn = { background: '#1f2937', color: '#9ca3af', border: '1px solid #374151', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' };
const dangerBtn = { background: '#ef4444', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' };
const actionBtnView = { background: '#f59e0b', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' };
const actionBtnEdit = { background: '#475569', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' };
const actionBtnDelete = { background: '#ef4444', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' };
const formGrid = { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' };
const fGroup = { display: 'flex', flexDirection: 'column', gap: '8px' };
const lStyle = { fontSize: '11px', color: '#6b7280', fontWeight: '700', letterSpacing: '0.5px' };
const iBox = { background: '#0b0f19', border: '1px solid #1f2937', padding: '12px', borderRadius: '8px', color: '#fff', outline: 'none', fontSize: '14px' };
const modalOverlay = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalContent = { background: '#111827', padding: '30px', borderRadius: '16px', width: '550px', border: '1px solid #1f2937', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' };

const spinnerStyle = {
    width: '40px',
    height: '40px',
    border: '4px solid rgba(59, 130, 246, 0.2)',
    borderTop: '4px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto'
};

export default AdminDashboard;
