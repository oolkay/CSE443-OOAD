import React from 'react';
import './OfflineBanner.css';

/**
 * OfflineBanner Component (Turkish)
 * Displays a banner when the user is offline
 */
const OfflineBanner = () => {
  return (
    <div className="offline-banner">
      <div className="offline-banner-content">
        <svg
          className="offline-icon"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10C18 14.4183 14.4183 18 10 18Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10 6V10L13 13"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="offline-text">Çevrimdışısınız. Bazı özellikler kullanılamayabilir.</span>
        <button
          className="retry-button"
          onClick={() => window.location.reload()}
          aria-label="Bağlantıyı yeniden dene"
        >
          Tekrar Dene
        </button>
      </div>
    </div>
  );
};

export default OfflineBanner;
