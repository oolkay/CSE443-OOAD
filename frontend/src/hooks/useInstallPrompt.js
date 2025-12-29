import { useState, useEffect } from 'react';

/**
 * Custom hook to handle PWA install prompt
 * @returns {Object} - { isInstallable, showInstallPrompt, browserType, isStandalone }
 */
const useInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [browserType, setBrowserType] = useState('chrome');
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Detect browser type (only for Firefox/Safari)
    const userAgent = navigator.userAgent;
    let browser = 'chrome'; // default

    if (/Firefox/i.test(userAgent)) {
      browser = 'firefox';
    } else if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) {
      browser = 'safari';
    }

    setBrowserType(browser);

    // Check if already installed (standalone mode)
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
                            window.navigator.standalone === true;
    setIsStandalone(isStandaloneMode);

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
      setIsInstallable(true);
      console.log('[PWA] Install prompt available');
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstallable(false);
      console.log('[PWA] App was installed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const showInstallPrompt = async () => {
    // Chrome/Edge with native prompt
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      console.log(`[PWA] User response: ${outcome}`);

      setDeferredPrompt(null);
      setIsInstallable(false);

      return outcome === 'accepted';
    }

    // Firefox/Safari - manual install needed
    if (browserType === 'firefox' || browserType === 'safari') {
      return 'manual';
    }

    console.warn('[PWA] No install prompt available');
    return false;
  };

  return {
    isInstallable: isInstallable || browserType === 'firefox' || browserType === 'safari',
    showInstallPrompt,
    browserType,
    isStandalone
  };
};

export default useInstallPrompt;
