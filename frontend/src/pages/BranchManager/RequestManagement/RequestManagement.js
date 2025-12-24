import React, { useState } from "react";
import "./RequestManagement.css";

const RequestManagement = () => {
  // Mock pending requests data
  const [requests, setRequests] = useState([
    {
      id: 1,
      customerName: "Ayşe Yılmaz",
      service: "Haircut and Care",
      date: "2024-07-20",
      time: "10:00",
      status: "pending",
    },
    {
      id: 2,
      customerName: "Caner Demir",
      service: "Beard Shaving and Facial Care",
      date: "2024-07-20",
      time: "11:30",
      status: "pending",
    },
    {
      id: 3,
      customerName: "Elif Kaya",
      service: "Manicure & Pedicure",
      date: "2024-07-21",
      time: "14:00",
      status: "pending",
    },
    {
      id: 4,
      customerName: "Murat Güneş",
      service: "Skin Care and Massage",
      date: "2024-07-21",
      time: "16:00",
      status: "pending",
    },
    {
      id: 5,
      customerName: "Zeynep Arslan",
      service: "Hair Coloring and Ombre",
      date: "2024-07-22",
      time: "09:00",
      status: "pending",
    },
    {
      id: 6,
      customerName: "Deniz Kurt",
      service: "Permanent Makeup Consultancy",
      date: "2024-07-22",
      time: "13:00",
      status: "pending",
    },
  ]);

  const [filterStatus, setFilterStatus] = useState("pending");

  const handleApprove = (id) => {
    setRequests((prevRequests) =>
      prevRequests.map((request) =>
        request.id === id ? { ...request, status: "approved" } : request
      )
    );
    console.log(`Approved request ${id}`);
  };

  const handleReject = (id) => {
    setRequests((prevRequests) =>
      prevRequests.map((request) =>
        request.id === id ? { ...request, status: "rejected" } : request
      )
    );
    console.log(`Rejected request ${id}`);
  };

  // Filter requests by status
  const filteredRequests = requests.filter(
    (req) => req.status === filterStatus
  );
  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const approvedCount = requests.filter((r) => r.status === "approved").length;
  const rejectedCount = requests.filter((r) => r.status === "rejected").length;

  return (
    <div className="request-management-container">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Appointment Request Management</h1>
          <p className="page-description">
            Review and process pending appointment requests from customers.
            Approve or reject requests to manage your scheduling.
          </p>
        </div>
      </div>

      <div className="stats-section">
        <div className="stat-card">
          <div className="stat-number pending-count">{pendingCount}</div>
          <div className="stat-label">Pending Requests</div>
        </div>
        <div className="stat-card">
          <div className="stat-number approved-count">{approvedCount}</div>
          <div className="stat-label">Approved</div>
        </div>
        <div className="stat-card">
          <div className="stat-number rejected-count">{rejectedCount}</div>
          <div className="stat-label">Rejected</div>
        </div>
      </div>

      <div className="filter-section">
        <div className="filter-tabs">
          {["pending", "approved", "rejected"].map((status) => (
            <button
              key={status}
              className={`filter-tab ${
                filterStatus === status ? "active" : ""
              }`}
              onClick={() => setFilterStatus(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">—</div>
          <h3>No {filterStatus} requests</h3>
          <p>
            There are currently no {filterStatus} appointment requests to
            display.
          </p>
        </div>
      ) : (
        <div className="requests-grid">
          {filteredRequests.map((request) => (
            <div key={request.id} className="request-card">
              <div className="card-status-badge" data-status={request.status}>
                {request.status.toUpperCase()}
              </div>

              <div className="card-content">
                <div className="customer-section">
                  <h3 className="customer-name">{request.customerName}</h3>
                  <p className="customer-role">Customer</p>
                </div>

                <div className="details-section">
                  <div className="detail-item">
                    <span className="detail-label">Service</span>
                    <span className="detail-value">{request.service}</span>
                  </div>

                  <div className="detail-row">
                    <div className="detail-item">
                      <span className="detail-label">Date</span>
                      <span className="detail-value">{request.date}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Time</span>
                      <span className="detail-value">{request.time}</span>
                    </div>
                  </div>
                </div>
              </div>

              {filterStatus === "pending" && (
                <div className="card-actions">
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleReject(request.id)}
                  >
                    Reject
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleApprove(request.id)}
                  >
                    Approve
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RequestManagement;
