import React, { useState, useEffect } from 'react';
import '../styles/Dashboard.css';
import TikTokForm from './TikTokForm';
import CaptionGenerator from './CaptionGenerator';
import SoraVideoGenerator from './SoraVideoGenerator';
import ProgressTracker from './ProgressTracker';
import SettingsModal from './SettingsModal';
import VideoHistory from './VideoHistory';
import { Settings, Download, CloudDownload } from 'lucide-react';

function Dashboard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [tiktokData, setTiktokData] = useState(null);
  const [caption, setCaption] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [updateInfo, setUpdateInfo] = useState(null);
  const [updateReady, setUpdateReady] = useState(false);
  const [checkingUpdate, setCheckingUpdate] = useState(false);

  useEffect(() => {
    if (!window.electronAPI) return;

    const cleanupAvailable = window.electronAPI.onUpdateAvailable((info) => {
      setUpdateInfo(info);
    });

    const cleanupDownloaded = window.electronAPI.onUpdateDownloaded((info) => {
      setUpdateInfo(info);
      setUpdateReady(true);
    });

    return () => {
      if (cleanupAvailable) cleanupAvailable();
      if (cleanupDownloaded) cleanupDownloaded();
    };
  }, []);

  const handleInstallUpdate = () => {
    if (window.electronAPI) {
      window.electronAPI.installUpdate();
    }
  };

  const handleCheckForUpdates = async () => {
    if (!window.electronAPI) return;
    setCheckingUpdate(true);
    try {
      await window.electronAPI.checkForUpdates();
    } finally {
      setCheckingUpdate(false);
    }
  };

  const handleTiktokDataExtracted = (data) => {
    setTiktokData(data);
    setCurrentStep(1);
    addProgress('✓ Đã trích xuất dữ liệu TikTok');
  };

  const handleCaptionGenerated = (generatedCaption) => {
    setCaption(generatedCaption);
    setCurrentStep(2);
    addProgress('✓ Đã tạo caption');
  };

  const addProgress = (message) => {
    setProgress(prev => [...prev, message]);
  };

  const handleVideoCreated = () => {
    addProgress('✓ Đã tạo video với Sora');
    setCurrentStep(0);
    setTiktokData(null);
    setCaption('');
  };

  const handleReset = () => {
    setCurrentStep(0);
    setTiktokData(null);
    setCaption('');
    setProgress([]);
  };

  const handleReuseHistory = (entry) => {
    // Prefill data from history entry
    setTiktokData({
      title: entry.title || '',
      description: entry.description || '',
      images: entry.images || [],
      imagePath: entry.imagePath || '',
    });
    setCaption(entry.caption || '');
    setCurrentStep(2);
    addProgress('♻️ Đang tạo lại từ lịch sử...');
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-info">
          <h1>
            <svg className="tiktok-logo" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '32px', height: '32px', verticalAlign: 'middle', marginRight: '8px' }}>
              <path d="M34.1451 0H26.0556V32.6956C26.0556 36.5913 22.9444 39.7913 19.0726 39.7913C15.2007 39.7913 12.0896 36.5913 12.0896 32.6956C12.0896 28.8695 15.1311 25.7391 18.864 25.6V17.3913C10.6354 17.5304 4 24.2782 4 32.6956C4 41.1826 10.7745 48 19.1422 48C27.5099 48 34.2844 41.1131 34.2844 32.6956V15.9304C37.3259 18.1565 41.0588 19.4782 45 19.5478V11.3391C38.9867 11.1304 34.1451 6.08695 34.1451 0Z" fill="white" />
              <path d="M34.1451 0H26.0556V32.6956C26.0556 36.5913 22.9444 39.7913 19.0726 39.7913C15.2007 39.7913 12.0896 36.5913 12.0896 32.6956C12.0896 28.8695 15.1311 25.7391 18.864 25.6V17.3913C10.6354 17.5304 4 24.2782 4 32.6956C4 41.1826 10.7745 48 19.1422 48C27.5099 48 34.2844 41.1131 34.2844 32.6956V15.9304C37.3259 18.1565 41.0588 19.4782 45 19.5478V11.3391C38.9867 11.1304 34.1451 6.08695 34.1451 0Z" fill="#25F4EE" transform="translate(-1.5, -1.5)" />
              <path d="M34.1451 0H26.0556V32.6956C26.0556 36.5913 22.9444 39.7913 19.0726 39.7913C15.2007 39.7913 12.0896 36.5913 12.0896 32.6956C12.0896 28.8695 15.1311 25.7391 18.864 25.6V17.3913C10.6354 17.5304 4 24.2782 4 32.6956C4 41.1826 10.7745 48 19.1422 48C27.5099 48 34.2844 41.1131 34.2844 32.6956V15.9304C37.3259 18.1565 41.0588 19.4782 45 19.5478V11.3391C38.9867 11.1304 34.1451 6.08695 34.1451 0Z" fill="#FE2C55" transform="translate(1.5, 1.5)" />
              <path d="M34.1451 0H26.0556V32.6956C26.0556 36.5913 22.9444 39.7913 19.0726 39.7913C15.2007 39.7913 12.0896 36.5913 12.0896 32.6956C12.0896 28.8695 15.1311 25.7391 18.864 25.6V17.3913C10.6354 17.5304 4 24.2782 4 32.6956C4 41.1826 10.7745 48 19.1422 48C27.5099 48 34.2844 41.1131 34.2844 32.6956V15.9304C37.3259 18.1565 41.0588 19.4782 45 19.5478V11.3391C38.9867 11.1304 34.1451 6.08695 34.1451 0Z" fill="white" />
            </svg>
            <span className="highlight">TikTok</span> Video Generator
          </h1>
          <p>Tự động tạo nội dung bằng Gemini API & Sora</p>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            className="settings-toggle-btn"
            onClick={handleCheckForUpdates}
            disabled={checkingUpdate}
            title="Check for updates"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '50%',
              width: '42px',
              height: '42px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
          >
            <CloudDownload size={18} color="white" className={checkingUpdate ? 'spin' : ''} />
          </button>
          <button
            className="settings-toggle-btn"
            onClick={() => setIsSettingsOpen(true)}
            title="Settings"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '50%',
              width: '42px',
              height: '42px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
          >
            <Settings size={20} color="white" />
          </button>
        </div>
      </header>

      {updateInfo && (
        <div className="update-banner">
          <div className="update-banner-content">
            <Download size={18} />
            <span>
              {updateReady
                ? `Version ${updateInfo.version} is ready to install!`
                : `Version ${updateInfo.version} is downloading...`}
            </span>
          </div>
          {updateReady && (
            <button className="update-install-btn" onClick={handleInstallUpdate}>
              Restart & Update
            </button>
          )}
          <button className="update-dismiss-btn" onClick={() => setUpdateInfo(null)}>
            &times;
          </button>
        </div>
      )}

      <div className="dashboard-container">
        <div className="main-content">
          {currentStep === 0 && (
            <>
              <VideoHistory onReuse={handleReuseHistory} />
              <TikTokForm
                onDataExtracted={handleTiktokDataExtracted}
                setIsLoading={setIsLoading}
                isLoading={isLoading}
                addProgress={addProgress}
              />
            </>
          )}

          {currentStep === 1 && tiktokData && (
            <CaptionGenerator
              tiktokData={tiktokData}
              onCaptionGenerated={handleCaptionGenerated}
              setIsLoading={setIsLoading}
              isLoading={isLoading}
              addProgress={addProgress}
              onBack={() => setCurrentStep(0)}
            />
          )}

          {currentStep === 2 && tiktokData && caption && (
            <SoraVideoGenerator
              tiktokData={tiktokData}
              caption={caption}
              onVideoCreated={handleVideoCreated}
              setIsLoading={setIsLoading}
              isLoading={isLoading}
              addProgress={addProgress}
              onBack={() => setCurrentStep(1)}
              onReset={handleReset}
            />
          )}
        </div>

        <aside className="sidebar">
          <ProgressTracker progress={progress} currentStep={currentStep} />
        </aside>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}

export default Dashboard;
