import React, { useState, useEffect } from "react";
import superAdminService from "../../services/superAdminService";
import authService from "../../services/authService";
import "./Home.css";

export default function Home() {
    // Current User
    const [currentUser, setCurrentUser] = useState({ name: "Loading..." });

    // List State
    const [superAdmins, setSuperAdmins] = useState([]);
    const [loadingList, setLoadingList] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentAdminId, setCurrentAdminId] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phoneNumber: "",
    });
    const [submitting, setSubmitting] = useState(false);

    const [pageMessage, setPageMessage] = useState(null);
    const [modalMessage, setModalMessage] = useState(null);

    // Helper to show page messages
    const showPageMessage = (type, text) => {
        setPageMessage({ type, text });
        setTimeout(() => setPageMessage(null), 3000);
    };

    // Helper to show modal messages
    const showModalMessage = (type, text) => {
        setModalMessage({ type, text });
        // Optional: Auto-clear modal errors too? Maybe not, let user correct it.
        if (type === 'success') {
            setTimeout(() => setModalMessage(null), 3000);
        }
    };

    useEffect(() => {
        const user = authService.getCurrentUser();
        if (user) {
            setCurrentUser({ name: user.name });
        }
        fetchSuperAdmins();
    }, []);

    const fetchSuperAdmins = async () => {
        try {
            setLoadingList(true);
            const data = await superAdminService.getAllSuperAdmins();
            setSuperAdmins(data);
        } catch (error) {
            console.error('Adminler getirilirken hata oluştu:', error);
            showPageMessage('error', 'Admin listesi alınamadı.');
        } finally {
            setLoadingList(false);
        }
    };

    // --- Modal Handlers ---
    const openCreateModal = () => {
        setFormData({ name: "", email: "", password: "", phoneNumber: "" });
        setIsEditing(false);
        setCurrentAdminId(null);
        setModalMessage(null);
        setIsModalOpen(true);
    };

    const openEditModal = (admin) => {
        setFormData({
            name: admin.name,
            email: admin.email,
            password: "",
            phoneNumber: admin.phoneNumber || ""
        });
        setIsEditing(true);
        setCurrentAdminId(admin.userId);
        setModalMessage(null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData({ name: "", email: "", password: "", phoneNumber: "" });
        setSubmitting(false);
        setModalMessage(null);
    };

    // --- Form Handlers ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.email || (!isEditing && !formData.password)) {
            showModalMessage('error', "Lütfen tüm zorunlu alanları doldurun.");
            return;
        }

        try {
            setSubmitting(true);
            if (isEditing) {
                await superAdminService.updateSuperAdmin(currentAdminId, formData);
                showPageMessage('success', "Admin başarıyla güncellendi!");
            } else {
                await superAdminService.createSuperAdmin(formData);
                showPageMessage('success', "Admin başarıyla oluşturuldu!");
            }
            fetchSuperAdmins();
            closeModal();
        } catch (error) {
            console.error("Admin kaydedilirken hata:", error);
            showModalMessage('error', "İşlem başarısız oldu. Lütfen bilgileri kontrol edin.");
        } finally {
            setSubmitting(false);
        }
    };

    // --- List Handlers ---
    const handleDelete = async (id) => {
        if (window.confirm("Bu Admini silmek istediğinizden emin misiniz?")) {
            try {
                await superAdminService.deleteSuperAdmin(id);
                setSuperAdmins(superAdmins.filter((sa) => sa.userId !== id));
                showPageMessage('success', "Admin başarıyla silindi.");
            } catch (error) {
                console.error("Admin silinirken hata:", error);
                showPageMessage('error', "Silme işlemi başarısız oldu.");
            }
        }
    };

    // Pagination & Search
    const itemsPerPage = 6;
    const filteredSuperAdmins = superAdmins.filter((superAdmin) =>
        superAdmin.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        superAdmin.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const totalPages = Math.ceil(filteredSuperAdmins.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const displayedSuperAdmins = filteredSuperAdmins.slice(
        startIndex,
        startIndex + itemsPerPage
    );

    return (
        <div className="home-page">
            <div className="admin-header-content">
                <div className="header-left">

                </div>
                <button className="btn-create" onClick={openCreateModal}>
                    + Admin Ekle
                </button>
            </div>

            {pageMessage && (
                <div className={`message-banner ${pageMessage.type}`}>
                    {pageMessage.text}
                </div>
            )}

            <div className="card list-card">
                <div className="list-toolbar">
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Admin ara..."
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

                <div className="table-responsive">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loadingList ? (
                                <tr><td colSpan="4" className="text-center">Loading...</td></tr>
                            ) : displayedSuperAdmins.length === 0 ? (
                                <tr><td colSpan="4" className="text-center">No Super Admins found</td></tr>
                            ) : (
                                displayedSuperAdmins.map((admin) => (
                                    <tr key={admin.userId}>
                                        <td>{admin.name}</td>
                                        <td>{admin.email}</td>
                                        <td>{admin.phoneNumber}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="btn-icon edit"
                                                    onClick={() => openEditModal(admin)}
                                                    title="Edit"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="btn-icon delete"
                                                    onClick={() => handleDelete(admin.userId)}
                                                    title="Delete"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="pagination">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                        className="page-btn"
                    >
                        &lt;
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                            key={page}
                            className={`page-btn ${currentPage === page ? 'active' : ''}`}
                            onClick={() => setCurrentPage(page)}
                        >
                            {page}
                        </button>
                    ))}
                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => p + 1)}
                        className="page-btn"
                    >
                        &gt;
                    </button>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{isEditing ? "Admini Düzenle" : "Yeni Admin Ekle"}</h2>
                            <button className="modal-close" onClick={closeModal}>×</button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-body">
                            {modalMessage && (
                                <div className={`modal-message ${modalMessage.type}`}>
                                    {modalMessage.text}
                                </div>
                            )}
                            <div className="form-group">
                                <label>İsim *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Tam ad giriniz"
                                    className="form-input"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>E-posta *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="E-posta adresi giriniz"
                                    className="form-input"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Şifre {isEditing && "(mevcut şifreyi korumak için boş bırakın)"} *</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Şifre giriniz"
                                    className="form-input"
                                    required={!isEditing}
                                />
                            </div>
                            <div className="form-group">
                                <label>Telefon</label>
                                <input
                                    type="text"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    placeholder="Telefon numarası giriniz"
                                    className="form-input"
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={closeModal}>İptal</button>
                                <button type="submit" className="btn-submit" disabled={submitting}>
                                    {submitting ? "Kaydediliyor..." : (isEditing ? "Yöneticiyi Güncelle" : "Yönetici Oluştur")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
