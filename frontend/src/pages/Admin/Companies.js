import React, { useState, useEffect } from "react";
import authService from "../../services/authService";
import companyService from "../../services/companyService";
import managerService from "../../services/managerService";
import "./Companies.css";

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [currentUser, setCurrentUser] = useState({ name: "Loading..." });

  // Fetch current user info
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser({ name: user.name });
    }
  }, []);
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

  const [pageMessage, setPageMessage] = useState(null);
  const [companyModalMessage, setCompanyModalMessage] = useState(null);
  const [managerModalMessage, setManagerModalMessage] = useState(null);

  // Delete confirmation states
  const [companyToDelete, setCompanyToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isForceDeleteModalOpen, setIsForceDeleteModalOpen] = useState(false);
  const [appointmentCount, setAppointmentCount] = useState(0);

  const showPageMessage = (type, text) => {
    setPageMessage({ type, text });
    setTimeout(() => setPageMessage(null), 3000);
  };

  const showCompanyModalMessage = (type, text) => {
    setCompanyModalMessage({ type, text });
    if (type === 'success') setTimeout(() => setCompanyModalMessage(null), 3000);
  };

  const showManagerModalMessage = (type, text) => {
    setManagerModalMessage({ type, text });
    if (type === 'success') setTimeout(() => setManagerModalMessage(null), 3000);
  };

  // API call functions
  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const data = await companyService.getAllCompanies();
      setCompanies(data);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCompany = async (companyData) => {
    try {
      const newCompany = await companyService.createCompany(companyData);
      setCompanies([...companies, newCompany]);
      return true;
    } catch (error) {
      console.error('Error creating company:', error);
    }
    return false;
  };

  const updateCompany = async (id, companyData) => {
    try {
      const updatedCompany = await companyService.updateCompany(id, companyData);
      setCompanies(companies.map(c => c.companyId === id ? updatedCompany : c));
      return true;
    } catch (error) {
      console.error('Error updating company:', error);
    }
    return false;
  };

  const deleteCompany = async (id, confirm = false) => {
    try {
      await companyService.deleteCompany(id, confirm);
      setCompanies(companies.filter(c => c.companyId !== id));
      return true;
    } catch (error) {
      console.error('=== DELETE COMPANY ERROR ===');
      console.error('Error:', error);
      console.error('Response:', error.response);
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
      console.error('Message:', error.response?.data?.message);

      // Check for associated appointments message
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message;

      if (error.response && error.response.status === 403) {
        showPageMessage('error', "Bu işlem için yetkiniz yok. SUPER_ADMIN rolü gereklidir.");
      } else if (error.response && error.response.status === 404) {
        showPageMessage('error', "Şirket bulunamadı.");
      } else if (errorMessage.includes("associated appointments")) {
        // Extract appointment count if available
        const match = errorMessage.match(/(\d+)\s+associated appointments/);
        const count = match ? parseInt(match[1]) : 0;
        setAppointmentCount(count);
        setIsForceDeleteModalOpen(true);
        throw error; // Re-throw to stop deletion
      } else {
        const errorStatus = error.response?.status || 'Bilinmeyen';
        showPageMessage('error', `Hata (${errorStatus}): ${errorMessage}`);
      }
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

  const initiateDelete = (id) => {
    setCompanyToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async (force = false) => {
    if (!companyToDelete) return;

    try {
      const success = await deleteCompany(companyToDelete, force);
      if (success) {
        showPageMessage('success', "Şirket başarıyla silindi.");
        setIsDeleteModalOpen(false);
        setIsForceDeleteModalOpen(false);
        setCompanyToDelete(null);
        setAppointmentCount(0);
      }
    } catch (error) {
      // Error already handled in deleteCompany
    }
  };

  const handleAddCompany = async () => {
    if (!newCompany.name || !newCompany.email || !newCompany.address || !newCompany.phoneNumber) {
      showCompanyModalMessage('error', "Lütfen tüm alanları doldurun");
      return;
    }

    if (isEditing) {
      const success = await updateCompany(currentCompanyId, newCompany);
      if (!success) {
        // Fallback
        setCompanies(companies.map(c =>
          c.companyId === currentCompanyId ? { ...c, ...newCompany } : c
        ));
      }
      showPageMessage('success', "Şirket güncellendi.");
    } else {
      showCompanyModalMessage('error', "Şirket oluşturmak için lütfen 'Yeni Şirket Ekle' butonunu kullanın.");
      return;
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
    setCompanyModalMessage(null);
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
    setCompanyModalMessage(null);
  };


  const handleOpenManagerModal = async (company) => {
    setSelectedCompany(company);

    // If editing existing manager, fetch fresh data from API
    if (company.managerId) {
      try {
        const manager = await managerService.getManagerById(company.managerId);
        setManagerData({
          name: manager.name || "",
          email: manager.email || "",
          password: "",
          phoneNumber: manager.phoneNumber || "",
        });
      } catch (error) {
        console.error('Error fetching manager:', error);
        // Fallback to company data if API fails
        setManagerData({
          name: company.managerName || "",
          email: company.managerEmail || "",
          password: "",
          phoneNumber: company.managerPhoneNumber || "",
        });
      }
    } else {
      // New manager, clear form
      setManagerData({
        name: "",
        email: "",
        password: "",
        phoneNumber: "",
      });
    }

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
    setManagerModalMessage(null);
  };

  return (
    <div className="companies-page">
      {/* Header */}
      <header className="companies-header">
        <div className="header-left"></div>
        <button className="btn-create" onClick={handleAddCompanyWithManager}>
          + Şirket Ekle
        </button>
      </header>

      {/* Company List Section */}
      <div className="companies-container">
        {pageMessage && (
          <div className={`message-banner ${pageMessage.type}`}>
            {pageMessage.text}
          </div>
        )}
        <div className="companies-toolbar" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
          <div className="search-box">
            <input
              type="text"
              placeholder="Şirket ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </span>
          </div>
        </div>

        {/* Enhanced Table with Manager Info */}
        <div className="companies-table-wrapper">
          <table className="companies-table">
            <thead>
              <tr>

                <th>Şirket</th>
                <th>Adres</th>
                <th>E-posta</th>
                <th>Telefon</th>
                <th>Yönetici</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {displayedCompanies.map((company) => (
                <tr key={company.companyId}>

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
                          title="Yöneticiyi Düzenle"
                        >
                          Düzenle
                        </button>
                      </div>
                    ) : (
                      <button
                        className="btn-add-manager"
                        onClick={() => handleOpenManagerModal(company)}
                        title="Şube Yöneticisi Ata"
                      >
                        Yönetici Ata
                      </button>
                    )}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-icon edit"
                        onClick={() => handleEdit(company)}
                        title="Düzenle"
                      >
                        Düzenle
                      </button>
                      <button
                        className="btn-icon delete"
                        onClick={() => initiateDelete(company.companyId)}
                        title="Sil"
                      >
                        Sil
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
            Toplam Şirket: {filteredCompanies.length}
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
              <h2>{isEditing ? "Şirketi Düzenle" : "Yeni Şirket Ekle"}</h2>
              <button className="modal-close" onClick={handleModalClose}>
                ×
              </button>
            </div>
            <div className="modal-body">
              {companyModalMessage && (
                <div className={`modal-message ${companyModalMessage.type}`}>
                  {companyModalMessage.text}
                </div>
              )}
              {isEditing ? (
                <>
                  <div className="form-group">
                    <label>Şirket Adı</label>
                    <input
                      type="text"
                      value={newCompany.name}
                      onChange={(e) =>
                        setNewCompany({ ...newCompany, name: e.target.value })
                      }
                      placeholder="Şirket adı giriniz"
                    />
                  </div>
                  <div className="form-group">
                    <label>E-posta</label>
                    <input
                      type="email"
                      value={newCompany.email}
                      onChange={(e) =>
                        setNewCompany({ ...newCompany, email: e.target.value })
                      }
                      placeholder="E-posta adresi giriniz"
                    />
                  </div>
                  <div className="form-group">
                    <label>Adres</label>
                    <input
                      type="text"
                      value={newCompany.address}
                      onChange={(e) =>
                        setNewCompany({ ...newCompany, address: e.target.value })
                      }
                      placeholder="Adres giriniz"
                    />
                  </div>
                  <div className="form-group">
                    <label>Telefon</label>
                    <input
                      type="text"
                      value={newCompany.phoneNumber}
                      onChange={(e) =>
                        setNewCompany({ ...newCompany, phoneNumber: e.target.value })
                      }
                      placeholder="Telefon numarası giriniz"
                    />
                  </div>
                </>
              ) : (
                <>
                  <h3>Şirket Bilgileri</h3>
                  <div className="form-group">
                    <label>Şirket Adı</label>
                    <input
                      type="text"
                      value={newManager.companyName}
                      onChange={(e) =>
                        setNewManager({ ...newManager, companyName: e.target.value })
                      }
                      placeholder="Şirket adı giriniz"
                    />
                  </div>
                  <div className="form-group">
                    <label>Şirket E-postası</label>
                    <input
                      type="email"
                      value={newManager.companyEmail}
                      onChange={(e) =>
                        setNewManager({ ...newManager, companyEmail: e.target.value })
                      }
                      placeholder="Şirket e-posta adresi giriniz"
                    />
                  </div>
                  <div className="form-group">
                    <label>Şirket Adresi</label>
                    <input
                      type="text"
                      value={newManager.companyAddress}
                      onChange={(e) =>
                        setNewManager({ ...newManager, companyAddress: e.target.value })
                      }
                      placeholder="Şirket adresi giriniz"
                    />
                  </div>
                  <div className="form-group">
                    <label>Şirket Telefonu</label>
                    <input
                      type="text"
                      value={newManager.companyPhoneNumber}
                      onChange={(e) =>
                        setNewManager({ ...newManager, companyPhoneNumber: e.target.value })
                      }
                      placeholder="Şirket telefon numarası giriniz"
                    />
                  </div>
                  <div className="manager-assignment-section">
                    <h3>Şube Yöneticisi Atama</h3>
                    {managerCreated && createdManagerData ? (
                      <div className="manager-created-status">
                        <p className="manager-success-text">
                          Şube Yöneticisi Oluşturuldu: {createdManagerData.name} ({createdManagerData.email})
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
                          Yöneticiyi Düzenle
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="manager-assignment-desc">
                          Her şirketin bir Şube Yöneticisine ihtiyacı vardır. Bu şirket için yeni bir Şube Yöneticisi oluşturmak için aşağıdaki butona tıklayın.
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
                          Şube Yöneticisi Oluştur
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={handleModalClose}>
                İptal
              </button>
              <button className="btn-save" onClick={isEditing ? handleAddCompany : async () => {
                if (!newManager.companyName || !newManager.companyEmail || !newManager.companyAddress || !newManager.companyPhoneNumber) {
                  showCompanyModalMessage('error', "Lütfen tüm şirket alanlarını doldurun");
                  return;
                }

                if (!managerCreated || !createdManagerData) {
                  showCompanyModalMessage('error', "Lütfen önce bu şirket için bir Şube Yöneticisi oluşturun.");
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
                  managerPassword: createdManagerData.password,
                  managerPhoneNumber: createdManagerData.phoneNumber
                };

                try {
                  await companyService.createCompany(companyData);

                  showPageMessage('success', "Şirket ve yönetici başarıyla oluşturuldu!");
                  await fetchCompanies();
                  handleModalClose();
                } catch (error) {
                  console.error('Şirket ve yönetici oluşturulurken hata:', error);
                  showCompanyModalMessage('error', "İşlem başarısız oldu.");
                }
              }}>
                {isEditing ? "Şirketi Güncelle" : "Şirket ve Yönetici Oluştur"}
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
                    ? `Yöneticiyi Düzenle - ${selectedCompany.name}`
                    : `Yönetici Ata - ${selectedCompany.name}`
                ) : 'Yönetici Oluştur'}
              </h2>
              <button className="modal-close" onClick={handleCloseManagerModal}>
                ×
              </button>
            </div>
            <div className="modal-body">
              {managerModalMessage && (
                <div className={`modal-message ${managerModalMessage.type}`}>
                  {managerModalMessage.text}
                </div>
              )}
              <div className="manager-form-section">
                <h3>Yönetici Bilgileri</h3>
                <div className="form-group">
                  <label>Yönetici Adı *</label>
                  <input
                    type="text"
                    value={managerData.name}
                    onChange={(e) =>
                      setManagerData({ ...managerData, name: e.target.value })
                    }
                    placeholder="Yöneticinin tam adı"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Yönetici E-postası *</label>
                  <input
                    type="email"
                    value={managerData.email}
                    onChange={(e) =>
                      setManagerData({ ...managerData, email: e.target.value })
                    }
                    placeholder="Yöneticinin e-postası"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Şifre *</label>
                  <input
                    type="password"
                    value={managerData.password}
                    onChange={(e) =>
                      setManagerData({ ...managerData, password: e.target.value })
                    }
                    placeholder={selectedCompany?.managerName ? "Yeni şifre giriniz (mevcut şifreyi korumak için boş bırakın)" : "Geçici şifre giriniz"}
                    required={!selectedCompany?.managerName}
                  />
                </div>
                <div className="form-group">
                  <label>Telefon *</label>
                  <input
                    type="text"
                    value={managerData.phoneNumber}
                    onChange={(e) =>
                      setManagerData({ ...managerData, phoneNumber: e.target.value })
                    }
                    placeholder="Telefon numarası giriniz"
                    required
                  />
                </div>
              </div>

              {selectedCompany && (
                <div className="company-info-section">
                  <h3>Şirket Bilgileri</h3>
                  <div className="company-display">
                    <p><strong>Şirket:</strong> {selectedCompany.name}</p>
                    <p><strong>E-posta:</strong> {selectedCompany.email}</p>
                    <p><strong>Adres:</strong> {selectedCompany.address}</p>
                    <p><strong>Telefon:</strong> {selectedCompany.phoneNumber}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={handleCloseManagerModal}>
                İptal
              </button>
              <button
                className="btn-save"
                onClick={async () => {
                  const isNewManager = !selectedCompany?.managerName;
                  if (!managerData.name || !managerData.email || !managerData.phoneNumber ||
                      (isNewManager && !managerData.password)) {
                    showManagerModalMessage('error', "Lütfen tüm zorunlu alanları doldurun.");
                    return;
                  }

                  try {
                    if (selectedCompany) {
                      // Update existing company's manager
                      const response = await managerService.updateManager(selectedCompany.managerId, managerData);

                      if (response) {
                        showPageMessage('success', selectedCompany.managerName ? "Yönetici güncellendi!" : "Yönetici atandı!");
                        await fetchCompanies();
                        handleCloseManagerModal();
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
                      showCompanyModalMessage('success', "Yönetici bilgileri kaydedildi.");
                      handleCloseManagerModal();
                    }
                  } catch (error) {
                    console.error('Yönetici/şirket yönetimi hatası:', error);
                    showManagerModalMessage('error', "İşlem başarısız.");
                  }
                }}
              >
                {selectedCompany ? (selectedCompany.managerName ? "Yöneticiyi Güncelle" : "Yönetici Ata") : "Yönetici Bilgisini Kaydet"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="modal-overlay" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Şirketi Sil</h2>
              <button className="modal-close" onClick={() => setIsDeleteModalOpen(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>Bu şirketi silmek istediğinizden emin misiniz?</p>
              <p style={{ color: '#666', fontSize: '14px', marginTop: '10px' }}>
                Bu işlem geri alınamaz.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setIsDeleteModalOpen(false)}>
                İptal
              </button>
              <button className="btn-save" style={{ backgroundColor: '#dc3545' }} onClick={() => confirmDelete(false)}>
                Sil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Force Delete Confirmation Modal */}
      {isForceDeleteModalOpen && (
        <div className="modal-overlay" onClick={() => setIsForceDeleteModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Dikkat: Randevular Var!</h2>
              <button className="modal-close" onClick={() => setIsForceDeleteModalOpen(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div style={{ backgroundColor: '#fff3cd', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
                <p style={{ color: '#856404', fontWeight: 'bold', marginBottom: '10px' }}>
                  ⚠️ Bu şirketin <span style={{ color: '#dc3545', fontSize: '18px' }}>{appointmentCount}</span> aktif randevusu var!
                </p>
                <p style={{ color: '#856404', fontSize: '14px' }}>
                  Şirketi silerseniz:
                </p>
                <ul style={{ color: '#856404', fontSize: '14px', marginLeft: '20px' }}>
                  <li>Tüm randevular iptal edilecek</li>
                  <li>Müşterilere e-posta bildirimi gidecek</li>
                  <li>Şirket ve çalışanlar tamamen silinecek</li>
                </ul>
              </div>
              <p style={{ fontSize: '14px', color: '#666' }}>
                Bu işlem geri alınamaz. Devam etmek istiyor musunuz?
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => {
                setIsForceDeleteModalOpen(false);
                setCompanyToDelete(null);
                setAppointmentCount(0);
              }}>
                İptal
              </button>
              <button className="btn-save" style={{ backgroundColor: '#dc3545' }} onClick={() => confirmDelete(true)}>
                Randevuları İptal Et ve Şirketi Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
