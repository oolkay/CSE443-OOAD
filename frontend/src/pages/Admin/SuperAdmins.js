import React, { useState, useEffect } from "react";
import "./SuperAdmins.css";

export default function SuperAdmins() {
  const [superAdmins, setSuperAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [newSuperAdmin, setNewSuperAdmin] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
  });

  // API call functions
  const fetchSuperAdmins = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/super-admins', {
        headers: {
                    'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSuperAdmins(data);
      } else {
        console.error('Failed to fetch super admins:', response.status);
        // Fallback to mock data if API fails
        setSuperAdmins([]);
      }
    } catch (error) {
      console.error('Error fetching super admins:', error);
      // Fallback to mock data if API fails
      setSuperAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  const createSuperAdmin = async (superAdminData) => {
    try {
      const response = await fetch('http://localhost:8080/api/super-admins', {
        method: 'POST',
        headers: {
                    'Content-Type': 'application/json'
        },
        body: JSON.stringify(superAdminData)
      });

      if (response.ok) {
        const newSuperAdmin = await response.json();
        setSuperAdmins([...superAdmins, newSuperAdmin]);
        return true;
      } else {
        const errorText = await response.text();
        let errorMessage = `Failed to create Super Admin (${response.status}): ${errorText}`;
        try {
          const errorJson = await response.json();
          if (errorJson.message) {
            errorMessage = `Failed to create Super Admin: ${errorJson.message}`;
          }
        } catch (e) {
          // If not JSON, use text error
        }
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Error creating super admin:', error);
      alert(`Error creating Super Admin: ${error.message}`);
    }
    return false;
  };

  const updateSuperAdmin = async (id, superAdminData) => {
    try {
      const response = await fetch(`http://localhost:8080/api/super-admins/${id}`, {
        method: 'PUT',
        headers: {
                    'Content-Type': 'application/json'
        },
        body: JSON.stringify(superAdminData)
      });

      if (response.ok) {
        const updatedSuperAdmin = await response.json();
        setSuperAdmins(superAdmins.map(sa => sa.userId === id ? updatedSuperAdmin : sa));
        return true;
      } else {
        const errorText = await response.text();
        let errorMessage = `Failed to update Super Admin (${response.status}): ${errorText}`;
        try {
          const errorJson = await response.json();
          if (errorJson.message) {
            errorMessage = `Failed to update Super Admin: ${errorJson.message}`;
          }
        } catch (e) {
          // If not JSON, use text error
        }
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Error updating super admin:', error);
      alert(`Error updating Super Admin: ${error.message}`);
    }
    return false;
  };

  const deleteSuperAdmin = async (id) => {
    try {
      const response = await fetch(`http://localhost:8080/api/super-admins/${id}`, {
        method: 'DELETE',
        headers: {
                    'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setSuperAdmins(superAdmins.filter(sa => sa.userId !== id));
        return true;
      } else {
        const errorText = await response.text();
        let errorMessage = `Failed to delete Super Admin (${response.status}): ${errorText}`;
        try {
          const errorJson = await response.json();
          if (errorJson.message) {
            errorMessage = `Failed to delete Super Admin: ${errorJson.message}`;
          }
        } catch (e) {
          // If not JSON, use text error
        }
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Error deleting super admin:', error);
      alert(`Error deleting Super Admin: ${error.message}`);
    }
    return false;
  };

  useEffect(() => {
    fetchSuperAdmins();
  }, []);

  const itemsPerPage = 8;

  // Filter super admins based on search
  const filteredSuperAdmins = superAdmins.filter((superAdmin) =>
    superAdmin.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    superAdmin.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredSuperAdmins.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedSuperAdmins = filteredSuperAdmins.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleEdit = (superAdmin) => {
    setNewSuperAdmin({
      name: superAdmin.name,
      email: superAdmin.email,
      password: "", // Leave empty for security
      phoneNumber: superAdmin.phoneNumber,
    });
    setIsEditing(true);
    setCurrentId(superAdmin.userId);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this Super Admin?")) {
      const success = await deleteSuperAdmin(id);
      if (!success) {
        // Fallback to local state update
        setSuperAdmins(superAdmins.filter((sa) => sa.userId !== id));
      }
    }
  };

  const handleAddSuperAdmin = async () => {
    if (!newSuperAdmin.name || !newSuperAdmin.email || !newSuperAdmin.password) {
      alert("Please fill in all required fields");
      return;
    }

    if (isEditing) {
      const success = await updateSuperAdmin(currentId, newSuperAdmin);
      if (!success) {
        // Fallback to local state update
        setSuperAdmins(superAdmins.map(sa =>
          sa.userId === currentId ? { ...sa, ...newSuperAdmin } : sa
        ));
      }
    } else {
      const success = await createSuperAdmin(newSuperAdmin);
      if (!success) {
        // Fallback to local state update
        const newSA = {
          userId: Date.now(),
          ...newSuperAdmin,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setSuperAdmins([...superAdmins, newSA]);
      }
    }

    handleModalClose();
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setCurrentId(null);
    setNewSuperAdmin({ name: "", email: "", password: "", phoneNumber: "" });
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      // TODO: Clear auth tokens/session
      window.location.href = "/";
    }
  };

  return (
    <div className="super-admins-page">
      {/* Header */}
      <header className="super-admins-header">
        <div className="header-left">
          <h1 className="header-title">
            Hi, Super Admin <span className="wave">👋</span>
          </h1>
        </div>
      </header>

      {/* Super Admin List Section */}
      <div className="super-admins-container">
        <div className="super-admins-toolbar">
          <h2 className="section-title">Super Admin List</h2>
          <div className="toolbar-actions">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search by name or email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <span className="search-icon">🔍</span>
            </div>
            <button className="btn-add" onClick={() => {
              setIsModalOpen(true);
              setIsEditing(false);
              setNewSuperAdmin({ name: "", email: "", password: "", phoneNumber: "" });
            }}>
              Add Super Admin
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="super-super-admins-table-wrapper">
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading Super Admins...</p>
            </div>
          ) : (
            <table className="super-admins-table">
              <thead>
                <tr>
                  <th>
                    <input type="checkbox" />
                  </th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {displayedSuperAdmins.map((superAdmin) => (
                  <tr key={superAdmin.userId}>
                    <td>
                      <input type="checkbox" />
                    </td>
                    <td className="super-admin-name">{superAdmin.name}</td>
                    <td>{superAdmin.email}</td>
                    <td>{superAdmin.phoneNumber}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon edit"
                          onClick={() => handleEdit(superAdmin)}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-icon delete"
                          onClick={() => handleDelete(superAdmin.userId)}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="pagination">
          <div className="pagination-info">
            Total Super Admins: {filteredSuperAdmins.length}
          </div>
          <div className="pagination-controls">
            <button
              className="page-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              &lt;
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                className={`page-btn ${currentPage === i + 1 ? "active" : ""}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="page-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* Add/Edit Super Admin Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleModalClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{isEditing ? "Edit Super Admin" : "Add Super Admin"}</h2>
              <button className="modal-close" onClick={handleModalClose}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={newSuperAdmin.name}
                  onChange={(e) =>
                    setNewSuperAdmin({ ...newSuperAdmin, name: e.target.value })
                  }
                  placeholder="Enter full name"
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={newSuperAdmin.email}
                  onChange={(e) =>
                    setNewSuperAdmin({ ...newSuperAdmin, email: e.target.value })
                  }
                  placeholder="Enter email address"
                />
              </div>
              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  value={newSuperAdmin.password}
                  onChange={(e) =>
                    setNewSuperAdmin({ ...newSuperAdmin, password: e.target.value })
                  }
                  placeholder={isEditing ? "Enter new password (leave blank to keep current)" : "Enter password"}
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  value={newSuperAdmin.phoneNumber}
                  onChange={(e) =>
                    setNewSuperAdmin({ ...newSuperAdmin, phoneNumber: e.target.value })
                  }
                  placeholder="Enter phone number"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={handleModalClose}>
                Cancel
              </button>
              <button className="btn-save" onClick={handleAddSuperAdmin}>
                {isEditing ? "Update" : "Create"} Super Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}