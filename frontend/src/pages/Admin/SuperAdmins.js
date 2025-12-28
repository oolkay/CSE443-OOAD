import React, { useState, useEffect } from "react";
import superAdminService from "../../services/superAdminService";
import authService from "../../services/authService";
import "./SuperAdmins.css";

export default function SuperAdmins() {
  const [superAdmins, setSuperAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [currentUser, setCurrentUser] = useState({ name: "Loading..." });
  const [newSuperAdmin, setNewSuperAdmin] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
  });

  // Fetch current user info
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser({ name: user.name });
    }
  }, []);

  // API call functions
  const fetchSuperAdmins = async () => {
    try {
      setLoading(true);
      const data = await superAdminService.getAllSuperAdmins();
      setSuperAdmins(data);
    } catch (error) {
      console.error('Error fetching super admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSuperAdmin = async (superAdminData) => {
    try {
      const newSuperAdmin = await superAdminService.createSuperAdmin(superAdminData);
      setSuperAdmins([...superAdmins, newSuperAdmin]);
      return true;
    } catch (error) {
      console.error('Error creating super admin:', error);
      alert(`Süper Admin oluşturma hatası: ${error.message || error.response?.data?.message || 'Bilinmeyen hata'}`);
    }
    return false;
  };

  const updateSuperAdmin = async (id, superAdminData) => {
    try {
      const updatedSuperAdmin = await superAdminService.updateSuperAdmin(id, superAdminData);
      setSuperAdmins(superAdmins.map(sa => sa.userId === id ? updatedSuperAdmin : sa));
      return true;
    } catch (error) {
      console.error('Error updating super admin:', error);
      alert(`Süper Admin güncelleme hatası: ${error.message || error.response?.data?.message || 'Bilinmeyen hata'}`);
    }
    return false;
  };

  const deleteSuperAdmin = async (id) => {
    try {
      await superAdminService.deleteSuperAdmin(id);
      setSuperAdmins(superAdmins.filter(sa => sa.userId !== id));
      return true;
    } catch (error) {
      console.error('Error deleting super admin:', error);
      alert(`Süper Admin silme hatası: ${error.message || error.response?.data?.message || 'Bilinmeyen hata'}`);
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
    if (window.confirm("Bu Süper Admin'i silmek istediğinizden emin misiniz?")) {
      const success = await deleteSuperAdmin(id);
      if (!success) {
        // Fallback to local state update
        setSuperAdmins(superAdmins.filter((sa) => sa.userId !== id));
      }
    }
  };

  const handleAddSuperAdmin = async () => {
    if (!newSuperAdmin.name || !newSuperAdmin.email || !newSuperAdmin.password) {
      alert("Lütfen tüm gerekli alanları doldurun");
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
    if (window.confirm("Çıkış yapmak istediğinizden emin misiniz?")) {
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
            Merhaba, {currentUser.name} <span className="wave">👋</span>
          </h1>
        </div>
      </header>

      {/* Super Admin List Section */}
      <div className="super-admins-container">
        <div className="super-admins-toolbar">
          <h2 className="section-title">Süper Admin Listesi</h2>
          <div className="toolbar-actions">
            <div className="search-box">
              <input
                type="text"
                placeholder="İsim veya e-posta ile ara"
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
              Süper Admin Ekle
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="super-super-admins-table-wrapper">
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Süper Adminler Yükleniyor...</p>
            </div>
          ) : (
            <table className="super-admins-table">
              <thead>
                <tr>
                  <th>
                    <input type="checkbox" />
                  </th>
                  <th>İsim</th>
                  <th>E-posta</th>
                  <th>Telefon</th>
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
                          title="Düzenle"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-icon delete"
                          onClick={() => handleDelete(superAdmin.userId)}
                          title="Sil"
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
            Toplam Süper Admin: {filteredSuperAdmins.length}
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
              <h2>{isEditing ? "Süper Admin Düzenle" : "Süper Admin Ekle"}</h2>
              <button className="modal-close" onClick={handleModalClose}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>İsim *</label>
                <input
                  type="text"
                  value={newSuperAdmin.name}
                  onChange={(e) =>
                    setNewSuperAdmin({ ...newSuperAdmin, name: e.target.value })
                  }
                  placeholder="Tam isim girin"
                />
              </div>
              <div className="form-group">
                <label>E-posta *</label>
                <input
                  type="email"
                  value={newSuperAdmin.email}
                  onChange={(e) =>
                    setNewSuperAdmin({ ...newSuperAdmin, email: e.target.value })
                  }
                  placeholder="E-posta adresi girin"
                />
              </div>
              <div className="form-group">
                <label>Şifre *</label>
                <input
                  type="password"
                  value={newSuperAdmin.password}
                  onChange={(e) =>
                    setNewSuperAdmin({ ...newSuperAdmin, password: e.target.value })
                  }
                  placeholder={isEditing ? "Yeni şifre girin (mevcut şifreyi korumak için boş bırakın)" : "Şifre girin"}
                />
              </div>
              <div className="form-group">
                <label>Telefon Numarası</label>
                <input
                  type="text"
                  value={newSuperAdmin.phoneNumber}
                  onChange={(e) =>
                    setNewSuperAdmin({ ...newSuperAdmin, phoneNumber: e.target.value })
                  }
                  placeholder="Telefon numarası girin"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={handleModalClose}>
                İptal
              </button>
              <button className="btn-save" onClick={handleAddSuperAdmin}>
                {isEditing ? "Güncelle" : "Oluştur"} Süper Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}