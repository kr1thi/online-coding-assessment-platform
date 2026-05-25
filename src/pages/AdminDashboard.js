import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import StudentForm from "./StudentForm";
import TeacherForm from "./TeacherForm";
import BranchForm from "./BranchForm";
import BatchForm from "./BatchForm";
import ExcelImport from "./ExcelImport";
import ManageRoles from "./ManageRoles";

const API_BASE =
  process.env.REACT_APP_API_URL || "http://localhost:8082";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("Dashboard");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [stats, setStats] = useState({
    totalAssessments: 0,
    totalPractice: 0,
    totalSubmissions: 0,
    activeStudents: 0,
  });

  const [moduleData, setModuleData] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [branches, setBranches] = useState([]);
  const [batches, setBatches] = useState([]);

  const [recentSubmissions, setRecentSubmissions] = useState([]);

  const adminData = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return { name: "Admin" };
    }
  }, []);

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    code: "",
    headName: "",
    primaryEmail: "",
    primaryContact: "",
    secondaryEmail: "",
    address: "",
    city: "",
    state: "",
    instituteType: "College",
    accessPlan: "Basic",
    password: "",
    version: null,
  });

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role")?.toUpperCase();

  const headers = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }),
    [token]
  );

  const allowCreateTabs = [
    "Institutions",
    "Branches",
    "Batch Years",
    "Teachers",
    "Students",
  ];

  const handleLogout = useCallback(() => {
    localStorage.clear();
    navigate("/login", { replace: true });
  }, [navigate]);

  const fetchData = async (endpoint) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers,
    });

    if (!res.ok) throw new Error("Fetch failed");

    return res.json();
  };

  const fetchCoreData = useCallback(async () => {
    if (!token || role !== "ADMIN") {
      handleLogout();
      return;
    }

    setLoading(true);

    try {
      if (activeTab === "Dashboard") {
        const [statsData, submissionsData] = await Promise.all([
          fetchData("/api/admin/stats"),
          fetchData("/api/submissions/all"),
        ]);

        setStats(statsData);

        setRecentSubmissions(
          Array.isArray(submissionsData)
            ? [...submissionsData].reverse().slice(0, 8)
            : []
        );
      }

      const endpointMap = {
        Institutions: "/api/admin/hierarchy/institutions",
        Branches: "/api/admin/hierarchy/branches/all",
        "Batch Years": "/api/admin/hierarchy/batches/all",
        Students: "/api/admin/students/all",
        "Student Import": "/api/admin/students/all",
        Teachers: "/api/admin/teachers/all",
        "Teacher Import": "/api/admin/teachers/all",
      };

      if (endpointMap[activeTab]) {
        const data = await fetchData(endpointMap[activeTab]);
        setModuleData(Array.isArray(data) ? data : []);
      }

      const [inst, br, bt] = await Promise.all([
        fetchData("/api/admin/hierarchy/institutions"),
        fetchData("/api/admin/hierarchy/branches/all"),
        fetchData("/api/admin/hierarchy/batches/all"),
      ]);

      setInstitutions(inst);
      setBranches(br);
      setBatches(bt);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, token, role, handleLogout]);

  useEffect(() => {
    fetchCoreData();
    setSearchTerm("");
    setShowForm(false);
    setIsEditing(false);
  }, [activeTab, fetchCoreData]);

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return moduleData;

    const lower = searchTerm.toLowerCase();

    return moduleData.filter((item) =>
      JSON.stringify(item).toLowerCase().includes(lower)
    );
  }, [moduleData, searchTerm]);

  const resetForm = () => {
    setFormData({
      id: "",
      name: "",
      code: "",
      headName: "",
      primaryEmail: "",
      primaryContact: "",
      secondaryEmail: "",
      address: "",
      city: "",
      state: "",
      instituteType: "College",
      accessPlan: "Basic",
      password: "",
      version: null,
    });

    setShowForm(false);
    setIsEditing(false);
  };

  const handleSaveInstitution = async (e) => {
    e.preventDefault();

    const url = isEditing
      ? `${API_BASE}/api/admin/hierarchy/institutions/update/${formData.id}`
      : `${API_BASE}/api/admin/hierarchy/institutions/add`;

    const method = isEditing ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert(
          isEditing
            ? "Updated Successfully"
            : "Institution Created"
        );

        resetForm();
        fetchCoreData();
      } else {
        const err = await res.json();
        alert(err.message || "Failed");
      }
    } catch {
      alert("Server Error");
    }
  };

  const handleDelete = async (item, type) => {
    if (!window.confirm("Delete this item?")) return;

    const endpointMap = {
      Institutions: `/api/admin/hierarchy/institutions/delete/${item.id}`,
      Teachers: `/api/admin/teachers/delete/${item.id}`,
      "Teacher Import": `/api/admin/teachers/delete/${item.id}`,
      Branches: `/api/admin/hierarchy/branches/delete/${item.id}`,
      "Batch Years": `/api/admin/hierarchy/batches/delete/${item.id}`,
      Students: `/api/admin/students/delete/${item.id}`,
      "Student Import": `/api/admin/students/delete/${item.id}`,
    };

    try {
      const res = await fetch(`${API_BASE}${endpointMap[type]}`, {
        method: "DELETE",
        headers,
      });

      if (res.ok) {
        alert("Deleted Successfully");
        fetchCoreData();
      } else {
        alert("Delete Failed");
      }
    } catch {
      alert("Error");
    }
  };

  const menuGroups = [
    {
      name: "FOUNDATION",
      items: ["Institutions", "Batch Years", "Branches"],
    },
    {
      name: "USER MANAGEMENT",
      items: ["Teachers", "Students", "Manage Roles"],
    },
    {
      name: "REPOSITORY",
      items: ["Student Import", "Teacher Import"],
    },
  ];

  return (
    <div style={appLayout}>
      <aside style={sidebarStyle}>
        <div style={brandWrapper}>
          <h2 style={brandTitle}>
            FAMEHUB <span style={badgeStyle}>ADMIN</span>
          </h2>
        </div>

        <nav style={navStyle}>
          <NavItem
            label="Dashboard"
            icon="📊"
            active={activeTab === "Dashboard"}
            onClick={() => setActiveTab("Dashboard")}
          />

          {menuGroups.map((group) => (
            <div key={group.name} style={menuGroupWrapper}>
              <p style={groupLabel}>{group.name}</p>

              {group.items.map((item) => (
                <NavItem
                  key={item}
                  label={item}
                  active={activeTab === item}
                  onClick={() => setActiveTab(item)}
                />
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

          <div style={headerRight}>
            {activeTab !== "Dashboard" && (
              <input
                style={{ ...iBox, width: "250px" }}
                placeholder={`Search ${activeTab}`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            )}

            <div style={profilePill}>
              <div style={smallAvatar}>
                {(adminData.name || "A")[0]}
              </div>

              <div>
                <div style={pillName}>{adminData.name}</div>
                <div style={pillRole}>Administrator</div>
              </div>
            </div>

            <button onClick={handleLogout} style={dangerBtn}>
              Logout
            </button>
          </div>
        </header>

        <section style={contentSection}>
          {loading ? (
            <div style={loadingBox}>
              <div style={spinnerStyle}></div>
            </div>
          ) : (
            <>
              {viewItem && (
                <Modal
                  item={viewItem}
                  close={() => setViewItem(null)}
                />
              )}

              {activeTab === "Dashboard" ? (
                <>
                  <div style={statsGrid}>
                    <StatBox
                      title="Assessments"
                      val={stats.totalAssessments}
                      color="#3b82f6"
                    />
                    <StatBox
                      title="Practice"
                      val={stats.totalPractice}
                      color="#10b981"
                    />
                    <StatBox
                      title="Submissions"
                      val={stats.totalSubmissions}
                      color="#f59e0b"
                    />
                    <StatBox
                      title="Students"
                      val={stats.activeStudents}
                      color="#8b5cf6"
                    />
                  </div>

                  <div style={cardStyle}>
                    <h3 style={cardTitle}>Recent Activity</h3>

                    <DataTable
                      tab="Dashboard"
                      headers={[
                        "#",
                        "Student",
                        "Problem",
                        "Status",
                        "Score",
                        "Date",
                      ]}
                      data={recentSubmissions}
                    />
                  </div>
                </>
              ) : (
                <>
                  {showForm && (
                    <div style={cardStyle}>
                      <h3 style={cardTitle}>
                        {isEditing ? "Update" : "Create"}{" "}
                        {activeTab}
                      </h3>

                      <br />

                      {activeTab === "Institutions" && (
                        <form
                          onSubmit={handleSaveInstitution}
                          style={formGrid}
                        >
                          <div style={fGroup}>
                            <label style={lStyle}>Name</label>

                            <input
                              style={iBox}
                              value={formData.name}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  name: e.target.value,
                                })
                              }
                            />
                          </div>

                          <div style={fGroup}>
                            <label style={lStyle}>Code</label>

                            <input
                              style={iBox}
                              value={formData.code}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  code: e.target.value,
                                })
                              }
                            />
                          </div>

                          <div style={fGroup}>
                            <label style={lStyle}>
                              Head Name
                            </label>

                            <input
                              style={iBox}
                              value={formData.headName}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  headName: e.target.value,
                                })
                              }
                            />
                          </div>

                          <div style={fGroup}>
                            <label style={lStyle}>Email</label>

                            <input
                              style={iBox}
                              type="email"
                              value={formData.primaryEmail}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  primaryEmail:
                                    e.target.value,
                                })
                              }
                            />
                          </div>

                          <div
                            style={{
                              display: "flex",
                              gap: 10,
                              marginTop: 15,
                            }}
                          >
                            <button
                              type="submit"
                              style={primaryBtn}
                            >
                              Save
                            </button>

                            <button
                              type="button"
                              style={secondaryBtn}
                              onClick={resetForm}
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      )}

                      {activeTab === "Branches" && (
                        <BranchForm
                          institutions={institutions}
                          token={token}
                          onSuccess={fetchCoreData}
                          onCancel={resetForm}
                        />
                      )}

                      {activeTab === "Batch Years" && (
                        <BatchForm
                          branches={branches}
                          token={token}
                          onSuccess={fetchCoreData}
                          onCancel={resetForm}
                        />
                      )}

                      {activeTab === "Teachers" && (
                        <TeacherForm
                          institutions={institutions}
                          token={token}
                          onSuccess={fetchCoreData}
                          onCancel={resetForm}
                        />
                      )}

                      {activeTab === "Students" && (
                        <StudentForm
                          batches={batches}
                          token={token}
                          onSuccess={fetchCoreData}
                          onCancel={resetForm}
                        />
                      )}
                    </div>
                  )}

                  {activeTab === "Manage Roles" && (
                    <div style={cardStyle}>
                      <ManageRoles
                        token={token}
                        onSuccess={fetchCoreData}
                      />
                    </div>
                  )}

                  {![
                    "Manage Roles",
                    "Student Import",
                    "Teacher Import",
                  ].includes(activeTab) && (
                    <div style={cardStyle}>
                      <div style={cardHeader}>
                        <h3 style={cardTitle}>
                          {activeTab} List
                        </h3>

                        {!showForm &&
                          allowCreateTabs.includes(
                            activeTab
                          ) && (
                            <button
                              style={primaryBtn}
                              onClick={() =>
                                setShowForm(true)
                              }
                            >
                              + New
                            </button>
                          )}
                      </div>

                      <DataTable
                        tab={activeTab}
                        data={filteredData}
                        onDelete={handleDelete}
                        onView={setViewItem}
                        onEdit={(item) => {
                          setFormData({ ...item });
                          setIsEditing(true);
                          setShowForm(true);

                          window.scrollTo({
                            top: 0,
                            behavior: "smooth",
                          });
                        }}
                        headers={
                          activeTab === "Institutions"
                            ? [
                                "#",
                                "Name",
                                "Email",
                                "Head",
                                "Code",
                                "Actions",
                              ]
                            : activeTab === "Students"
                            ? [
                                "#",
                                "Name",
                                "Roll No",
                                "Batch",
                                "Branch",
                                "Actions",
                              ]
                            : activeTab === "Teachers"
                            ? [
                                "#",
                                "Name",
                                "Staff ID",
                                "Institution",
                                "Actions",
                              ]
                            : [
                                "#",
                                "Name",
                                "Detail",
                                "Status",
                                "Actions",
                              ]
                        }
                      />
                    </div>
                  )}

                  {activeTab === "Student Import" && (
                    <>
                      <ExcelImport
                        token={token}
                        importMode="STUDENT"
                        onSuccess={fetchCoreData}
                      />

                      <div style={cardStyle}>
                        <h3 style={cardTitle}>
                          Current Students
                        </h3>

                        <DataTable
                          tab="Students"
                          headers={[
                            "#",
                            "Name",
                            "Roll No",
                            "Batch",
                            "Branch",
                            "Actions",
                          ]}
                          data={filteredData}
                          onDelete={handleDelete}
                          onView={setViewItem}
                          onEdit={(item) => {
                            setFormData(item);
                            setShowForm(true);
                            setIsEditing(true);
                          }}
                        />
                      </div>
                    </>
                  )}

                  {activeTab === "Teacher Import" && (
                    <>
                      <ExcelImport
                        token={token}
                        importMode="TEACHER"
                        onSuccess={fetchCoreData}
                      />

                      <div style={cardStyle}>
                        <h3 style={cardTitle}>
                          Current Teachers
                        </h3>

                        <DataTable
                          tab="Teachers"
                          headers={[
                            "#",
                            "Name",
                            "Staff ID",
                            "Institution",
                            "Actions",
                          ]}
                          data={filteredData}
                          onDelete={handleDelete}
                          onView={setViewItem}
                          onEdit={(item) => {
                            setFormData(item);
                            setShowForm(true);
                            setIsEditing(true);
                          }}
                        />
                      </div>
                    </>
                  )}
                </>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
};

const DataTable = ({
  headers,
  data,
  tab,
  onDelete,
  onView,
  onEdit,
}) => {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={tableStyle}>
        <thead>
          <tr style={tableHeaderRow}>
            {headers.map((h) => (
              <th key={h} style={thStyle}>
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data?.length > 0 ? (
            data.map((item, i) => (
              <tr key={item.id || i} style={tableRow}>
                <td style={tdStyle}>{i + 1}</td>

                {tab === "Institutions" ? (
                  <>
                    <td style={tdBold}>{item.name}</td>
                    <td style={tdStyle}>
                      {item.primaryEmail}
                    </td>
                    <td style={tdStyle}>
                      {item.headName}
                    </td>
                    <td style={tdStyle}>
                      <span style={badgeCode}>
                        {item.code}
                      </span>
                    </td>
                  </>
                ) : tab === "Students" ? (
                  <>
                    <td style={tdBold}>
                      {item.name || item.userName}
                    </td>
                    <td style={tdStyle}>
                      {item.rollNo}
                    </td>
                    <td style={tdStyle}>
                      {item.batch?.batchName}
                    </td>
                    <td style={tdStyle}>
                      {
                        item.batch?.branch
                          ?.branchName
                      }
                    </td>
                  </>
                ) : tab === "Teachers" ? (
                  <>
                    <td style={tdBold}>{item.name}</td>
                    <td style={tdStyle}>
                      {item.staffId}
                    </td>
                    <td style={tdStyle}>
                      {item.institution?.name}
                    </td>
                  </>
                ) : tab === "Dashboard" ? (
                  <>
                    <td style={tdBold}>
                      {item.userName}
                    </td>
                    <td style={tdStyle}>
                      {item.problemName}
                    </td>
                    <td style={tdStyle}>
                      {item.status}
                    </td>
                    <td style={tdStyle}>
                      {item.score}%
                    </td>
                    <td style={tdStyle}>
                      {item.submittedAt
                        ? new Date(
                            item.submittedAt
                          ).toLocaleDateString()
                        : "N/A"}
                    </td>
                  </>
                ) : (
                  <>
                    <td style={tdBold}>
                      {item.name ||
                        item.branchName ||
                        item.batchName}
                    </td>

                    <td style={tdStyle}>
                      {item.code ||
                        item.branchCode}
                    </td>

                    <td style={tdStyle}>Active</td>
                  </>
                )}

                {tab !== "Dashboard" && (
                  <td style={tdStyle}>
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                      }}
                    >
                      <button
                        style={actionBtnView}
                        onClick={() => onView(item)}
                      >
                        👁️
                      </button>

                      <button
                        style={actionBtnEdit}
                        onClick={() => onEdit(item)}
                      >
                        ✏️
                      </button>

                      <button
                        style={actionBtnDelete}
                        onClick={() =>
                          onDelete(item, tab)
                        }
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td
                style={emptyCell}
                colSpan={headers.length}
              >
                No Records Found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const Modal = ({ item, close }) => (
  <div style={modalOverlay} onClick={close}>
    <div
      style={modalContent}
      onClick={(e) => e.stopPropagation()}
    >
      <h3 style={cardTitle}>Details</h3>

      <hr style={{ margin: "15px 0" }} />

      {Object.entries(item).map(([k, v]) => (
        <div key={k} style={{ marginBottom: 10 }}>
          <label style={lStyle}>{k}</label>

          <div style={{ color: "#fff" }}>
            {typeof v === "object"
              ? v?.name ||
                v?.batchName ||
                v?.branchName ||
                "---"
              : String(v)}
          </div>
        </div>
      ))}

      <button
        style={{
          ...secondaryBtn,
          width: "100%",
          marginTop: 15,
        }}
        onClick={close}
      >
        Close
      </button>
    </div>
  </div>
);

const NavItem = ({
  label,
  icon,
  active,
  onClick,
}) => (
  <div
    onClick={onClick}
    style={active ? activeNavItem : navItem}
  >
    {icon} {label}
  </div>
);

const StatBox = ({ title, val, color }) => (
  <div
    style={{
      ...statCard,
      borderLeft: `4px solid ${color}`,
    }}
  >
    <div style={statLabel}>{title}</div>

    <h2 style={statValue}>{val}</h2>
  </div>
);

const appLayout = {
  display: "flex",
  minHeight: "100vh",
  background: "#0f172a",
  color: "#fff",
};

const sidebarStyle = {
  width: 240,
  background: "#111827",
  padding: 20,
};

const mainViewport = {
  flex: 1,
};

const navStyle = {
  marginTop: 20,
};

const navItem = {
  padding: 10,
  cursor: "pointer",
  borderRadius: 6,
  marginBottom: 8,
};

const activeNavItem = {
  ...navItem,
  background: "#1e293b",
  color: "#3b82f6",
};

const topHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: 20,
  borderBottom: "1px solid #1f2937",
};

const contentSection = {
  padding: 25,
};

const statsGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 20,
  marginBottom: 25,
};

const statCard = {
  background: "#111827",
  padding: 20,
  borderRadius: 10,
};

const statLabel = {
  color: "#9ca3af",
};

const statValue = {
  marginTop: 10,
};

const cardStyle = {
  background: "#111827",
  padding: 20,
  borderRadius: 10,
  marginBottom: 25,
};

const cardHeader = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: 20,
};

const cardTitle = {
  fontSize: 18,
  fontWeight: 600,
};

const primaryBtn = {
  background: "#3b82f6",
  color: "#fff",
  border: "none",
  padding: "8px 14px",
  borderRadius: 6,
  cursor: "pointer",
};

const secondaryBtn = {
  background: "#374151",
  color: "#fff",
  border: "none",
  padding: "8px 14px",
  borderRadius: 6,
  cursor: "pointer",
};

const dangerBtn = {
  background: "#ef4444",
  color: "#fff",
  border: "none",
  padding: "8px 14px",
  borderRadius: 6,
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
};

const tableHeaderRow = {
  borderBottom: "1px solid #1f2937",
};

const thStyle = {
  padding: 12,
  textAlign: "left",
};

const tableRow = {
  borderBottom: "1px solid #1f2937",
};

const tdStyle = {
  padding: 12,
};

const tdBold = {
  ...tdStyle,
  fontWeight: 600,
};

const badgeCode = {
  background: "#1e293b",
  padding: "4px 8px",
  borderRadius: 4,
};

const actionBtnView = {
  background: "#f59e0b",
  border: "none",
  padding: "5px 8px",
  borderRadius: 5,
};

const actionBtnEdit = {
  background: "#6b7280",
  border: "none",
  padding: "5px 8px",
  borderRadius: 5,
};

const actionBtnDelete = {
  background: "#ef4444",
  border: "none",
  padding: "5px 8px",
  borderRadius: 5,
};

const emptyCell = {
  textAlign: "center",
  padding: 30,
};

const modalOverlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.7)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const modalContent = {
  background: "#111827",
  padding: 25,
  width: 500,
  borderRadius: 10,
};

const formGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 15,
};

const fGroup = {
  display: "flex",
  flexDirection: "column",
};

const lStyle = {
  marginBottom: 5,
  fontSize: 12,
};

const iBox = {
  background: "#020617",
  border: "1px solid #1f2937",
  padding: 10,
  borderRadius: 6,
  color: "#fff",
};

const loadingBox = {
  display: "flex",
  justifyContent: "center",
  padding: 100,
};

const spinnerStyle = {
  width: 40,
  height: 40,
  border: "4px solid #1f2937",
  borderTop: "4px solid #3b82f6",
  borderRadius: "50%",
};

const headerRight = {
  display: "flex",
  gap: 20,
  alignItems: "center",
};

const profilePill = {
  display: "flex",
  alignItems: "center",
  gap: 10,
};

const smallAvatar = {
  width: 35,
  height: 35,
  borderRadius: "50%",
  background: "#3b82f6",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const pillName = {
  fontWeight: 600,
};

const pillRole = {
  fontSize: 12,
  color: "#9ca3af",
};

const viewTitle = {
  fontSize: 22,
};

const breadcrumb = {
  fontSize: 12,
  color: "#9ca3af",
};

const brandWrapper = {
  marginBottom: 20,
};

const brandTitle = {
  fontSize: 18,
};

const badgeStyle = {
  background: "#3b82f6",
  padding: "3px 7px",
  borderRadius: 4,
  fontSize: 10,
};

const menuGroupWrapper = {
  marginBottom: 20,
};

const groupLabel = {
  fontSize: 11,
  color: "#9ca3af",
};

export default AdminDashboard;
