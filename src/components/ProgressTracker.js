import React from 'react';
import '../styles/ProgressTracker.css';

function ProgressTracker({ progress, currentStep }) {
  return (
    <div className="progress-tracker">
      <h3>📋 Progress</h3>
      
      <div className="steps">
        <div className={`step ${currentStep >= 0 ? 'active' : ''} ${currentStep > 0 ? 'completed' : ''}`}>
          <div className="step-number">1</div>
          <div className="step-title">Extract TikTok</div>
        </div>
        
        <div className={`step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
          <div className="step-number">2</div>
          <div className="step-title">Generate Caption</div>
        </div>
        
        <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
          <div className="step-number">3</div>
          <div className="step-title">Create Video</div>
        </div>
      </div>

      <div className="progress-log">
        {progress.length === 0 ? (
          <p className="empty-message">Ready to start...</p>
        ) : (
          progress.map((msg, idx) => (
            <div key={idx} className="log-entry">
              {msg}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ProgressTracker;
