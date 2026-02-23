import React, { useState } from 'react';
import '../styles/Dashboard.css';
import TikTokForm from './TikTokForm';
import CaptionGenerator from './CaptionGenerator';
import SoraVideoGenerator from './SoraVideoGenerator';
import ProgressTracker from './ProgressTracker';

function Dashboard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [tiktokData, setTiktokData] = useState(null);
  const [caption, setCaption] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState([]);

  const handleTiktokDataExtracted = (data) => {
    setTiktokData(data);
    setCurrentStep(1);
    addProgress('✓ TikTok data extracted');
  };

  const handleCaptionGenerated = (generatedCaption) => {
    setCaption(generatedCaption);
    setCurrentStep(2);
    addProgress('✓ Caption generated');
  };

  const addProgress = (message) => {
    setProgress(prev => [...prev, message]);
  };

  const handleVideoCreated = () => {
    addProgress('✓ Video created with Sora');
    setCurrentStep(0);
    setTiktokData(null);
    setCaption('');
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>🎵 TikTok Video Generator</h1>
        <p>Automated content generation using Gemini API & Sora</p>
      </header>

      <div className="dashboard-container">
        <div className="main-content">
          {currentStep === 0 && (
            <TikTokForm
              onDataExtracted={handleTiktokDataExtracted}
              setIsLoading={setIsLoading}
              isLoading={isLoading}
              addProgress={addProgress}
            />
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
            />
          )}
        </div>

        <aside className="sidebar">
          <ProgressTracker progress={progress} currentStep={currentStep} />
        </aside>
      </div>
    </div>
  );
}

export default Dashboard;
