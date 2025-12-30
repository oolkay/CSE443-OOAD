import { useState, useEffect } from 'react';
import useInstallPrompt from '../hooks/useInstallPrompt';
import './InstallPrompt.css';

/**
 * InstallPrompt Component (Turkish, Mobile-Optimized)
 * Shows install button when app is installable
 */
const InstallPrompt = ({ variant = 'banner' }) => {
  const { isInstallable, showInstallPrompt, browserType, isStandalone } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(false);
  const [showAfterDelay, setShowAfterDelay] = useState(false);
  const [showManualInstructions, setShowManualInstructions] = useState(false);

  useEffect(() => {
    // Check if user previously dismissed
    const dismissedUntil = localStorage.getItem('installPromptDismissed');
    if (dismissedUntil && Date.now() < parseInt(dismissedUntil)) {
      setDismissed(true);
    }

    // Show banner after 3 seconds (for better UX)
    if (variant === 'banner' && isInstallable && !dismissed && !isStandalone) {
      const timer = setTimeout(() => {
        setShowAfterDelay(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isInstallable, dismissed, variant, isStandalone]);

  if (!isInstallable || dismissed || isStandalone) {
    return null;
  }

  if (variant === 'banner' && !showAfterDelay) {
    return null;
  }

  const handleInstall = async () => {
    const result = await showInstallPrompt();

    // Show manual instructions for Firefox/Safari
    if (result === 'manual') {
      setShowManualInstructions(true);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    setShowManualInstructions(false);
    // Don't show for 7 days
    const dismissedUntil = Date.now() + (7 * 24 * 60 * 60 * 1000);
    localStorage.setItem('installPromptDismissed', dismissedUntil.toString());
  };

  // Button variant
  if (variant === 'button') {
    return (
      <>
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

        {/* Manual Instructions Modal */}
        {showManualInstructions && (
          <div className="install-modal-overlay" onClick={() => setShowManualInstructions(false)}>
            <div className="install-modal" onClick={(e) => e.stopPropagation()}>
              <div className="install-modal-header">
                <h3>
                  {browserType === 'firefox' ? 'Firefox ile Yükle' : 'Safari ile Yükle'}
                </h3>
                <button
                  className="install-modal-close"
                  onClick={() => setShowManualInstructions(false)}
                  aria-label="Kapat"
                >
                  ×
                </button>
              </div>

              <div className="install-modal-body">
                {browserType === 'firefox' ? (
                  <>
                    <h4>Firefox'ta Uygulama Yükleme:</h4>
                    <ol>
                      <li>Adres çubuğunun sağındaki <strong>⋮</strong> (üç nokta) menüsüne tıklayın</li>
                      <li><strong>"Uygulamayı Yükle"</strong> veya <strong>"Install App"</strong> seçeneğini seçin</li>
                      <li>Açılan pencerede <strong>"Yükle"</strong> butonuna tıklayın</li>
                    </ol>
                    <p className="install-tip">
                      💡 <strong>İpucu:</strong> Uygulama yüklendikten sonra masaüstünüzde veya uygulama menünüzde bir kısayol göreceksiniz.
                    </p>
                  </>
                ) : (
                  <>
                    <h4>Safari'de Uygulama Yükleme:</h4>

                    {/iPhone|iPad|iPod/.test(navigator.userAgent) ? (
                      <>
                        <ol>
                          <li>Safari'nin altındaki <strong>Paylaş</strong> butonuna tıklayın (↑ içinde bir kutu)</li>
                          <li>Listede aşağı kaydırın ve <strong>"Ana Ekrana Ekle"</strong> seçeneğini seçin</li>
                          <li>Sağ üst köşedeki <strong>"Ekle"</strong> butonuna tıklayın</li>
                        </ol>
                        <p className="install-tip">
                          💡 <strong>İpucu:</strong> Artık uygulamanız ana ekranınızda bir uygulama olarak görünecek!
                        </p>
                      </>
                    ) : (
                      <>
                        <ol>
                          <li>Safari menü çubuğundan <strong>"Dosya"</strong> menüsüne tıklayın</li>
                          <li><strong>"Ana Ekrana Ekle..."</strong> seçeneğini seçin</li>
                          <li>Açılan pencerede <strong>"Ekle"</strong> butonuna tıklayın</li>
                        </ol>
                        <p className="install-tip">
                          💡 <strong>İpucu:</strong> Uygulama Applications klasörüne eklenecek.
                        </p>
                      </>
                    )}
                  </>
                )}

                <button
                  className="install-modal-dismiss"
                  onClick={() => setShowManualInstructions(false)}
                >
                  Anladım
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Banner variant (default, mobile-optimized)
  return (
    <>
      <div className="install-banner">
        <div className="install-banner-content">
          <div className="install-banner-text">
            <h3>Uygulamayı Yükleyin</h3>
            <p>
              {browserType === 'firefox' || browserType === 'safari'
                ? 'Daha hızlı erişim için uygulama olarak yükleyin.'
                : 'Çevrimdışı destek ve daha hızlı yükleme için tam deneyimi yaşayın.'}
            </p>
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

      {/* Manual Instructions Modal */}
      {showManualInstructions && (
        <div className="install-modal-overlay" onClick={() => setShowManualInstructions(false)}>
          <div className="install-modal" onClick={(e) => e.stopPropagation()}>
            <div className="install-modal-header">
              <h3>
                {browserType === 'firefox' ? 'Firefox ile Yükle' : 'Safari ile Yükle'}
              </h3>
              <button
                className="install-modal-close"
                onClick={() => setShowManualInstructions(false)}
                aria-label="Kapat"
              >
                ×
              </button>
            </div>

            <div className="install-modal-body">
              {browserType === 'firefox' ? (
                <>
                  <h4>Firefox'ta Uygulama Yükleme:</h4>
                  <ol>
                    <li>Adres çubuğunun sağındaki <strong>⋮</strong> (üç nokta) menüsüne tıklayın</li>
                    <li><strong>"Uygulamayı Yükle"</strong> veya <strong>"Install App"</strong> seçeneğini seçin</li>
                    <li>Açılan pencerede <strong>"Yükle"</strong> butonuna tıklayın</li>
                  </ol>
                  <p className="install-tip">
                    💡 <strong>İpucu:</strong> Uygulama yüklendikten sonra masaüstünüzde veya uygulama menünüzde bir kısayol göreceksiniz.
                  </p>
                </>
              ) : (
                <>
                  <h4>Safari'de Uygulama Yükleme:</h4>

                  {/iPhone|iPad|iPod/.test(navigator.userAgent) ? (
                    <>
                      <ol>
                        <li>Safari'nin altındaki <strong>Paylaş</strong> butonuna tıklayın (↑ içinde bir kutu)</li>
                        <li>Liste aşağı kaydırın ve <strong>"Ana Ekrana Ekle"</strong> seçeneğini seçin</li>
                        <li>Sağ üst köşedeki <strong>"Ekle"</strong> butonuna tıklayın</li>
                      </ol>
                      <p className="install-tip">
                        💡 <strong>İpucu:</strong> Artık uygulamanız ana ekranınızda bir uygulama olarak görünecek!
                      </p>
                    </>
                  ) : (
                    <>
                      <ol>
                        <li>Safari menü çubuğundan <strong>"Dosya"</strong> menüsüne tıklayın</li>
                        <li><strong>"Ana Ekrana Ekle..."</strong> seçeneğini seçin</li>
                        <li>Açılan pencerede <strong>"Ekle"</strong> butonuna tıklayın</li>
                      </ol>
                      <p className="install-tip">
                        💡 <strong>İpucu:</strong> Uygulama Applications klasörüne eklenecek.
                      </p>
                    </>
                  )}
                </>
              )}

              <button
                className="install-modal-dismiss"
                onClick={() => setShowManualInstructions(false)}
              >
                Anladım
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InstallPrompt;
