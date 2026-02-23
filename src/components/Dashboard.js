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
        <div>
          <h1>
            <svg className="tiktok-logo" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width: '32px', height: '32px', verticalAlign: 'middle', marginRight: '8px'}}>
              <path d="M34.1451 0H26.0556V32.6956C26.0556 36.5913 22.9444 39.7913 19.0726 39.7913C15.2007 39.7913 12.0896 36.5913 12.0896 32.6956C12.0896 28.8695 15.1311 25.7391 18.864 25.6V17.3913C10.6354 17.5304 4 24.2782 4 32.6956C4 41.1826 10.7745 48 19.1422 48C27.5099 48 34.2844 41.1131 34.2844 32.6956V15.9304C37.3259 18.1565 41.0588 19.4782 45 19.5478V11.3391C38.9867 11.1304 34.1451 6.08695 34.1451 0Z" fill="white"/>
              <path d="M34.1451 0H26.0556V32.6956C26.0556 36.5913 22.9444 39.7913 19.0726 39.7913C15.2007 39.7913 12.0896 36.5913 12.0896 32.6956C12.0896 28.8695 15.1311 25.7391 18.864 25.6V17.3913C10.6354 17.5304 4 24.2782 4 32.6956C4 41.1826 10.7745 48 19.1422 48C27.5099 48 34.2844 41.1131 34.2844 32.6956V15.9304C37.3259 18.1565 41.0588 19.4782 45 19.5478V11.3391C38.9867 11.1304 34.1451 6.08695 34.1451 0Z" fill="#25F4EE" transform="translate(-1.5, -1.5)"/>
              <path d="M34.1451 0H26.0556V32.6956C26.0556 36.5913 22.9444 39.7913 19.0726 39.7913C15.2007 39.7913 12.0896 36.5913 12.0896 32.6956C12.0896 28.8695 15.1311 25.7391 18.864 25.6V17.3913C10.6354 17.5304 4 24.2782 4 32.6956C4 41.1826 10.7745 48 19.1422 48C27.5099 48 34.2844 41.1131 34.2844 32.6956V15.9304C37.3259 18.1565 41.0588 19.4782 45 19.5478V11.3391C38.9867 11.1304 34.1451 6.08695 34.1451 0Z" fill="#FE2C55" transform="translate(1.5, 1.5)"/>
              <path d="M34.1451 0H26.0556V32.6956C26.0556 36.5913 22.9444 39.7913 19.0726 39.7913C15.2007 39.7913 12.0896 36.5913 12.0896 32.6956C12.0896 28.8695 15.1311 25.7391 18.864 25.6V17.3913C10.6354 17.5304 4 24.2782 4 32.6956C4 41.1826 10.7745 48 19.1422 48C27.5099 48 34.2844 41.1131 34.2844 32.6956V15.9304C37.3259 18.1565 41.0588 19.4782 45 19.5478V11.3391C38.9867 11.1304 34.1451 6.08695 34.1451 0Z" fill="white"/>
            </svg>
            <span className="highlight">TikTok</span> Video Generator
          </h1>
          <p>Automated content generation using Gemini API & Sora</p>
        </div>
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
