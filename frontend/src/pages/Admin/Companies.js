import React, { useState } from "react";
import "./Companies.css";

const initialCompanies = [
  {
    id: 1,
    company: "Derin Bakış Psikoloji",
    name: "Tayyib",
    lastName: "Şener",
    phone: "+988 (99) 436-48-15",
  },
  {
    id: 2,
    company: "Estetik Palette",
    name: "Buğra",
    lastName: "Kaşıkçı",
    phone: "+988 (99) 436-48-15",
  },
  {
    id: 3,
    company: "Kronos Klinik",
    name: "Ahmet",
    lastName: "Tuna",
    phone: "+988 (99) 436-48-15",
  },
  {
    id: 4,
    company: "Fit Limit Stüdyo",
    name: "Mahmut",
    lastName: "Terdemir",
    phone: "+988 (99) 436-48-15",
  },
  {
    id: 5,
    company: "Lastik Durağı Pro",
    name: "Özan",
    lastName: "Uçar",
    phone: "+988 (99) 436-48-15",
  },
  {
    id: 6,
    company: "Örnek Firma",
    name: "Can",
    lastName: "Yılmaz",
    phone: "+988 (99) 436-48-15",
  },
];

export default function Companies() {
  const [companies, setCompanies] = useState(initialCompanies);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCompany, setNewCompany] = useState({
    company: "",
    name: "",
    lastName: "",
    phone: "",
  });

  const itemsPerPage = 8;

  // Filter companies based on search (search across company name, first name, last name)
  const filteredCompanies = companies.filter((company) =>
    company.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedCompanies = filteredCompanies.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleEdit = (id) => {
    console.log("Edit company:", id);
    // TODO: Navigate to edit page or open modal
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this company?")) {
      setCompanies(companies.filter((c) => c.id !== id));
    }
  };

  const handleAddCompany = () => {
    if (!newCompany.company || !newCompany.name || !newCompany.lastName || !newCompany.phone) {
      alert("Please fill in all fields");
      return;
    }

    const company = {
      id: companies.length + 1,
      ...newCompany,
    };

    setCompanies([...companies, company]);
    setIsModalOpen(false);
    setNewCompany({ company: "", name: "", lastName: "", phone: "" });
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setNewCompany({ company: "", name: "", lastName: "", phone: "" });
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
            <button className="btn-add" onClick={() => setIsModalOpen(true)}>
              Add New Company
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="companies-table-wrapper">
          <table className="companies-table">
            <thead>
              <tr>
                <th>
                  <input type="checkbox" />
                </th>
                <th>Company</th>
                <th>Name</th>
                <th>Last Name</th>
                <th>Phone</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {displayedCompanies.map((company) => (
                <tr key={company.id}>
                  <td>
                    <input type="checkbox" />
                  </td>
                  <td>{company.company}</td>
                  <td>{company.name}</td>
                  <td>{company.lastName}</td>
                  <td>{company.phone}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-icon edit"
                        onClick={() => handleEdit(company.id)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-icon delete"
                        onClick={() => handleDelete(company.id)}
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

      {/* Add New Company Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleModalClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Company</h2>
              <button className="modal-close" onClick={handleModalClose}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Company Name</label>
                <input
                  type="text"
                  value={newCompany.company}
                  onChange={(e) =>
                    setNewCompany({ ...newCompany, company: e.target.value })
                  }
                  placeholder="Enter company name"
                />
              </div>
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  value={newCompany.name}
                  onChange={(e) =>
                    setNewCompany({ ...newCompany, name: e.target.value })
                  }
                  placeholder="Enter first name"
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  value={newCompany.lastName}
                  onChange={(e) =>
                    setNewCompany({ ...newCompany, lastName: e.target.value })
                  }
                  placeholder="Enter last name"
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="text"
                  value={newCompany.phone}
                  onChange={(e) =>
                    setNewCompany({ ...newCompany, phone: e.target.value })
                  }
                  placeholder="Enter phone number"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={handleModalClose}>
                Cancel
              </button>
              <button className="btn-save" onClick={handleAddCompany}>
                Add Company
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
