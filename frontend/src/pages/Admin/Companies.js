import React, { useState, useEffect } from "react";
import "./Companies.css";

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isManagerModalOpen, setIsManagerModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCompanyId, setCurrentCompanyId] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [managerData, setManagerData] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
  });
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
  const [managerCreated, setManagerCreated] = useState(false);
  const [createdManagerData, setCreatedManagerData] = useState(null);

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
    setManagerCreated(false);
    setCreatedManagerData(null);
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
    setManagerCreated(false);
    setCreatedManagerData(null);
  };

  
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      // TODO: Clear auth tokens/session
      window.location.href = "/";
    }
  };

  const handleOpenManagerModal = (company) => {
    setSelectedCompany(company);
    setManagerData({
      name: company.managerName || "",
      email: company.managerEmail || "",
      password: "",
      phoneNumber: "",
    });
    setIsManagerModalOpen(true);
  };

  const handleCloseManagerModal = () => {
    setIsManagerModalOpen(false);
    setSelectedCompany(null);
    setManagerData({
      name: "",
      email: "",
      password: "",
      phoneNumber: "",
    });
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
                        <button
                          className="btn-edit-manager"
                          onClick={() => handleOpenManagerModal(company)}
                          title="Edit Manager"
                        >
                          ✏️
                        </button>
                      </div>
                    ) : (
                      <button
                        className="btn-add-manager"
                        onClick={() => handleOpenManagerModal(company)}
                        title="Assign Branch Manager"
                      >
                        + Assign Manager
                      </button>
                    )}
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
                  <div className="manager-assignment-section">
                    <h3>Branch Manager Assignment</h3>
                    {managerCreated && createdManagerData ? (
                      <div className="manager-created-status">
                        <p className="manager-success-text">
                          ✅ Branch Manager Created: {createdManagerData.name} ({createdManagerData.email})
                        </p>
                        <button
                          type="button"
                          className="btn-modify-manager"
                          onClick={() => {
                            setSelectedCompany(null);
                            setManagerData(createdManagerData);
                            setIsManagerModalOpen(true);
                          }}
                        >
                          Modify Manager
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="manager-assignment-desc">
                          Every company requires a Branch Manager. Click the button below to create a new Branch Manager for this company.
                        </p>
                        <button
                          type="button"
                          className="btn-create-branch-manager"
                          onClick={() => {
                            setSelectedCompany(null);
                            setManagerData({
                              name: "",
                              email: "",
                              password: "",
                              phoneNumber: "",
                            });
                            setIsManagerModalOpen(true);
                          }}
                        >
                          Create Branch Manager
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={handleModalClose}>
                Cancel
              </button>
              <button className="btn-save" onClick={isEditing ? handleAddCompany : async () => {
                if (!newManager.companyName || !newManager.companyEmail || !newManager.companyAddress || !newManager.companyPhoneNumber) {
                  alert("Please fill in all company fields");
                  return;
                }

                if (!managerCreated || !createdManagerData) {
                  alert("Please create a Branch Manager for this company first.");
                  return;
                }

                // Create company with manager
                const companyData = {
                  companyName: newManager.companyName,
                  companyEmail: newManager.companyEmail,
                  companyAddress: newManager.companyAddress,
                  companyPhoneNumber: newManager.companyPhoneNumber,
                  managerName: createdManagerData.name,
                  managerEmail: createdManagerData.email,
                  managerPassword: createdManagerData.password
                };

                try {
                  const response = await fetch('http://localhost:8080/api/companies', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(companyData)
                  });

                  if (response.ok) {
                    alert("Company and manager created successfully!");
                    await fetchCompanies();
                    handleModalClose();
                  } else {
                    const errorText = await response.text();
                    let errorMessage = `Failed to create company and manager (${response.status}): ${errorText}`;
                    try {
                      const errorJson = await response.json();
                      if (errorJson.message) {
                        errorMessage = `Failed to create company and manager: ${errorJson.message}`;
                      }
                    } catch (e) {
                      // If not JSON, use text error
                    }
                    alert(errorMessage);
                  }
                } catch (error) {
                  console.error('Error creating company with manager:', error);
                  alert(`Error creating company and manager: ${error.message}`);
                }
              }}>
                {isEditing ? "Update Company" : "Create Company & Manager"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Branch Manager Modal */}
      {isManagerModalOpen && (
        <div className="modal-overlay" onClick={handleCloseManagerModal}>
          <div className="modal-content manager-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {selectedCompany ? (
                  selectedCompany.managerName
                    ? `Modify Branch Manager - ${selectedCompany.name}`
                    : `Assign Branch Manager - ${selectedCompany.name}`
                ) : 'Create Branch Manager'}
              </h2>
              <button className="modal-close" onClick={handleCloseManagerModal}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="manager-form-section">
                <h3>Branch Manager Information</h3>
                <div className="form-group">
                  <label>Manager Name *</label>
                  <input
                    type="text"
                    value={managerData.name}
                    onChange={(e) =>
                      setManagerData({ ...managerData, name: e.target.value })
                    }
                    placeholder="Enter manager full name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Manager Email *</label>
                  <input
                    type="email"
                    value={managerData.email}
                    onChange={(e) =>
                      setManagerData({ ...managerData, email: e.target.value })
                    }
                    placeholder="Enter manager email"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Password *</label>
                  <input
                    type="password"
                    value={managerData.password}
                    onChange={(e) =>
                      setManagerData({ ...managerData, password: e.target.value })
                    }
                    placeholder={selectedCompany?.managerName ? "Enter new password (leave blank to keep current)" : "Enter temporary password"}
                    required={!selectedCompany?.managerName}
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    value={managerData.phoneNumber}
                    onChange={(e) =>
                      setManagerData({ ...managerData, phoneNumber: e.target.value })
                    }
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              {selectedCompany && (
                <div className="company-info-section">
                  <h3>Company Information</h3>
                  <div className="company-display">
                    <p><strong>Company:</strong> {selectedCompany.name}</p>
                    <p><strong>Email:</strong> {selectedCompany.email}</p>
                    <p><strong>Address:</strong> {selectedCompany.address}</p>
                    <p><strong>Phone:</strong> {selectedCompany.phoneNumber}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={handleCloseManagerModal}>
                Cancel
              </button>
              <button
                className="btn-save"
                onClick={async () => {
                  if (!managerData.name || !managerData.email || !managerData.password) {
                    alert("Please fill in all required manager fields (name, email, and password)");
                    return;
                  }

                  try {
                    if (selectedCompany) {
                      // Update existing company's manager
                      const response = await fetch('http://localhost:8080/api/managers', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          name: managerData.name,
                          email: managerData.email,
                          password: managerData.password,
                          phoneNumber: managerData.phoneNumber,
                          companyId: selectedCompany.companyId
                        })
                      });

                      if (response.ok) {
                        alert(selectedCompany.managerName ? "Manager updated successfully!" : "Branch manager assigned successfully!");
                        await fetchCompanies();
                        handleCloseManagerModal();
                      } else {
                        const errorText = await response.text();
                        let errorMessage = `Failed to ${selectedCompany.managerName ? 'update' : 'assign'} manager (${response.status}): ${errorText}`;
                        try {
                          const errorJson = await response.json();
                          if (errorJson.message) {
                            errorMessage = `Failed to ${selectedCompany.managerName ? 'update' : 'assign'} manager: ${errorJson.message}`;
                          }
                        } catch (e) {
                          // If not JSON, use text error
                        }
                        alert(errorMessage);
                      }
                    } else {
                      // Save manager data locally for later company creation
                      setCreatedManagerData({
                        name: managerData.name,
                        email: managerData.email,
                        password: managerData.password,
                        phoneNumber: managerData.phoneNumber,
                      });
                      setManagerCreated(true);
                      alert("Branch Manager information saved! Now click 'Create Company & Manager' to complete the creation.");
                      handleCloseManagerModal();
                    }
                  } catch (error) {
                    console.error('Error managing manager/company:', error);
                    alert(`Error: ${error.message}`);
                  }
                }}
              >
                {selectedCompany ? (selectedCompany.managerName ? "Update Manager" : "Assign Manager") : "Save Manager Info"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
