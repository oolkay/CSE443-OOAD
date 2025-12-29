import React, { useState, useEffect } from 'react';
import useInstallPrompt from '../hooks/useInstallPrompt';
import './InstallPrompt.css';

/**
 * InstallPrompt Component (Turkish, Mobile-Optimized)
 * Shows install button when app is installable
 */
const InstallPrompt = ({ variant = 'banner' }) => {
  const { isInstallable, showInstallPrompt } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(false);
  const [showAfterDelay, setShowAfterDelay] = useState(false);

  useEffect(() => {
    // Check if user previously dismissed
    const dismissedUntil = localStorage.getItem('installPromptDismissed');
    if (dismissedUntil && Date.now() < parseInt(dismissedUntil)) {
      setDismissed(true);
    }

    // Show banner after 3 seconds (for better UX)
    if (variant === 'banner' && isInstallable && !dismissed) {
      const timer = setTimeout(() => {
        setShowAfterDelay(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isInstallable, dismissed, variant]);

  if (!isInstallable || dismissed) {
    return null;
  }

  if (variant === 'banner' && !showAfterDelay) {
    return null;
  }

  const handleInstall = async () => {
    await showInstallPrompt();
  };

  const handleDismiss = () => {
    setDismissed(true);
    // Don't show for 7 days
    const dismissedUntil = Date.now() + (7 * 24 * 60 * 60 * 1000);
    localStorage.setItem('installPromptDismissed', dismissedUntil.toString());
  };

  // Button variant
  if (variant === 'button') {
    return (
      <button
        className="install-button"
        onClick={handleInstall}
        aria-label="Uygulamayı yükle"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="install-icon"
        >
          <path d="M8 0C3.58 0 0 3.58 0 8C0 12.42 3.58 16 8 16C12.42 16 16 12.42 16 8C16 3.58 12.42 0 8 0Z"/>
        </svg>
        Uygulamayı Yükle
      </button>
    );
  }

  // Banner variant (default, mobile-optimized)
  return (
    <div className="install-banner">
      <div className="install-banner-content">
        <div className="install-banner-text">
          <h3>Uygulamayı Yükleyin</h3>
          <p>Çevrimdışı destek ve daha hızlı yükleme için tam deneyimi yaşayın.</p>
        </div>
        <div className="install-banner-actions">
          <button className="install-install-button" onClick={handleInstall}>
            Yükle
          </button>
          <button className="install-dismiss-button" onClick={handleDismiss}>
            Şimdi değil
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
