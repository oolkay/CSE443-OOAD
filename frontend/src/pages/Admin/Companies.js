import React, { useState, useEffect } from "react";
import "./Companies.css";

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCompanyId, setCurrentCompanyId] = useState(null);
  const [newCompany, setNewCompany] = useState({
    name: "",
    email: "",
    address: "",
    phoneNumber: "",
  });
  const [newManager, setNewManager] = useState({
    name: "",
    email: "",
    password: "",
    companyName: "",
    companyEmail: "",
    companyAddress: "",
    companyPhoneNumber: "",
  });

  // API call functions
  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/companies');
      if (response.ok) {
        const data = await response.json();
        setCompanies(data);
      } else {
        console.error('Failed to fetch companies:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCompany = async (companyData) => {
    try {
      const response = await fetch('http://localhost:8080/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyData)
      });
      if (response.ok) {
        const newCompany = await response.json();
        setCompanies([...companies, newCompany]);
        return true;
      }
    } catch (error) {
      console.error('Error creating company:', error);
    }
    return false;
  };

  const updateCompany = async (id, companyData) => {
    try {
      const response = await fetch(`http://localhost:8080/api/companies/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyData)
      });
      if (response.ok) {
        const updatedCompany = await response.json();
        setCompanies(companies.map(c => c.companyId === id ? updatedCompany : c));
        return true;
      }
    } catch (error) {
      console.error('Error updating company:', error);
    }
    return false;
  };

  const deleteCompany = async (id) => {
    try {
      const response = await fetch(`http://localhost:8080/api/companies/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setCompanies(companies.filter(c => c.companyId !== id));
        return true;
      }
    } catch (error) {
      console.error('Error deleting company:', error);
    }
    return false;
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const itemsPerPage = 8;

  // Filter companies based on search (search across company name, manager name)
  const filteredCompanies = companies.filter((company) =>
    company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.managerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedCompanies = filteredCompanies.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Enhanced handlers with API calls
  const handleEdit = (company) => {
    setNewCompany({
      name: company.name,
      email: company.email,
      address: company.address,
      phoneNumber: company.phoneNumber,
    });
    setIsEditing(true);
    setCurrentCompanyId(company.companyId);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this company?")) {
      const success = await deleteCompany(id);
      if (!success) {
        // Fallback to local state update
        setCompanies(companies.filter((c) => c.companyId !== id));
      }
    }
  };

  const handleAddCompany = async () => {
    if (!newCompany.name || !newCompany.email || !newCompany.address || !newCompany.phoneNumber) {
      alert("Please fill in all fields");
      return;
    }

    if (isEditing) {
      const success = await updateCompany(currentCompanyId, newCompany);
      if (!success) {
        // Fallback to local state update
        setCompanies(companies.map(c =>
          c.companyId === currentCompanyId ? { ...c, ...newCompany } : c
        ));
      }
    } else {
      alert("Please use the 'Add New Company' button to create companies with managers.");
    }

    handleModalClose();
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setCurrentCompanyId(null);
    setNewCompany({ name: "", email: "", address: "", phoneNumber: "" });
  };

  const handleAddCompanyWithManager = () => {
    setIsModalOpen(true);
    setIsEditing(false);
    setNewManager({
      name: "",
      email: "",
      password: "",
      companyName: "",
      companyEmail: "",
      companyAddress: "",
      companyPhoneNumber: "",
    });
  };

  const handleCreateCompanyWithManager = async () => {
    if (!newManager.companyName || !newManager.companyEmail || !newManager.companyAddress ||
        !newManager.companyPhoneNumber || !newManager.name || !newManager.email || !newManager.password) {
      alert("Please fill in all company and manager fields");
      return;
    }

    const companyData = {
      companyName: newManager.companyName,
      companyEmail: newManager.companyEmail,
      companyAddress: newManager.companyAddress,
      companyPhoneNumber: newManager.companyPhoneNumber,
      managerName: newManager.name,
      managerEmail: newManager.email,
      managerPassword: newManager.password
    };

    try {
      const response = await fetch('http://localhost:8080/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyData)
      });

      if (response.ok) {
        const newCompany = await response.json();
        setCompanies([...companies, newCompany]);
        await fetchCompanies(); // Refresh the list
        alert("Company and manager created successfully!");
      } else {
        alert("Failed to create company and manager");
      }
    } catch (error) {
      console.error('Error creating company with manager:', error);
      alert("Error creating company and manager");
    }

    handleModalClose();
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      // TODO: Clear auth tokens/session
      window.location.href = "/";
    }
  };

  return (
    <div className="companies-page">
      {/* Header */}
      <header className="companies-header">
        <div className="header-left">
          <span className="menu-icon">☰</span>
          <h1 className="header-title">
            Hi, Rabia <span className="wave">👋</span>
          </h1>
        </div>
        <div className="header-right">
          <button className="btn-logout" onClick={handleLogout}>
            <span className="logout-icon">⎋</span>
          </button>
        </div>
      </header>

      {/* Company List Section */}
      <div className="companies-container">
        <div className="companies-toolbar">
          <h2 className="section-title">Company List</h2>
          <div className="toolbar-actions">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search by name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <span className="search-icon">🔍</span>
            </div>
            <button className="btn-add" onClick={handleAddCompanyWithManager}>
              Add New Company
            </button>
          </div>
        </div>

        {/* Enhanced Table with Manager Info */}
        <div className="companies-table-wrapper">
          <table className="companies-table">
            <thead>
              <tr>
                <th>
                  <input type="checkbox" />
                </th>
                <th>Company</th>
                <th>Address</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Manager</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {displayedCompanies.map((company) => (
                <tr key={company.companyId}>
                  <td>
                    <input type="checkbox" />
                  </td>
                  <td className="company-name">{company.name}</td>
                  <td>{company.address}</td>
                  <td>{company.email}</td>
                  <td>{company.phoneNumber}</td>
                  <td>
                    {company.managerName ? (
                      <div className="manager-info">
                        <span className="manager-name">{company.managerName}</span>
                        <span className="manager-email">{company.managerEmail}</span>
                      </div>
                    ) : (
                      <span className="no-manager">No Manager</span>
                    )}
                  </td>
                  <td>
                    <span className="status-badge active">Active</span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-icon edit"
                        onClick={() => handleEdit(company)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-icon delete"
                        onClick={() => handleDelete(company.companyId)}
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
        </div>

        {/* Pagination */}
        <div className="pagination">
          <div className="pagination-info">
            Total Company: {filteredCompanies.length}
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

      {/* Add/Edit Company Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleModalClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{isEditing ? "Edit Company" : "Add New Company"}</h2>
              <button className="modal-close" onClick={handleModalClose}>
                ×
              </button>
            </div>
            <div className="modal-body">
              {isEditing ? (
                <>
                  <div className="form-group">
                    <label>Company Name</label>
                    <input
                      type="text"
                      value={newCompany.name}
                      onChange={(e) =>
                        setNewCompany({ ...newCompany, name: e.target.value })
                      }
                      placeholder="Enter company name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={newCompany.email}
                      onChange={(e) =>
                        setNewCompany({ ...newCompany, email: e.target.value })
                      }
                      placeholder="Enter email address"
                    />
                  </div>
                  <div className="form-group">
                    <label>Address</label>
                    <input
                      type="text"
                      value={newCompany.address}
                      onChange={(e) =>
                        setNewCompany({ ...newCompany, address: e.target.value })
                      }
                      placeholder="Enter address"
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="text"
                      value={newCompany.phoneNumber}
                      onChange={(e) =>
                        setNewCompany({ ...newCompany, phoneNumber: e.target.value })
                      }
                      placeholder="Enter phone number"
                    />
                  </div>
                </>
              ) : (
                <>
                  <h3>Company Information</h3>
                  <div className="form-group">
                    <label>Company Name</label>
                    <input
                      type="text"
                      value={newManager.companyName}
                      onChange={(e) =>
                        setNewManager({ ...newManager, companyName: e.target.value })
                      }
                      placeholder="Enter company name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Company Email</label>
                    <input
                      type="email"
                      value={newManager.companyEmail}
                      onChange={(e) =>
                        setNewManager({ ...newManager, companyEmail: e.target.value })
                      }
                      placeholder="Enter company email"
                    />
                  </div>
                  <div className="form-group">
                    <label>Company Address</label>
                    <input
                      type="text"
                      value={newManager.companyAddress}
                      onChange={(e) =>
                        setNewManager({ ...newManager, companyAddress: e.target.value })
                      }
                      placeholder="Enter company address"
                    />
                  </div>
                  <div className="form-group">
                    <label>Company Phone</label>
                    <input
                      type="text"
                      value={newManager.companyPhoneNumber}
                      onChange={(e) =>
                        setNewManager({ ...newManager, companyPhoneNumber: e.target.value })
                      }
                      placeholder="Enter company phone number"
                    />
                  </div>
                  <h3>Branch Manager Information</h3>
                  <div className="form-group">
                    <label>Manager Name</label>
                    <input
                      type="text"
                      value={newManager.name}
                      onChange={(e) =>
                        setNewManager({ ...newManager, name: e.target.value })
                      }
                      placeholder="Enter manager full name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Manager Email</label>
                    <input
                      type="email"
                      value={newManager.email}
                      onChange={(e) =>
                        setNewManager({ ...newManager, email: e.target.value })
                      }
                      placeholder="Enter manager email"
                    />
                  </div>
                  <div className="form-group">
                    <label>Temporary Password</label>
                    <input
                      type="password"
                      value={newManager.password}
                      onChange={(e) =>
                        setNewManager({ ...newManager, password: e.target.value })
                      }
                      placeholder="Enter temporary password"
                    />
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={handleModalClose}>
                Cancel
              </button>
              <button className="btn-save" onClick={isEditing ? handleAddCompany : handleCreateCompanyWithManager}>
                {isEditing ? "Update Company" : "Create Company & Manager"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
