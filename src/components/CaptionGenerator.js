import React, { useState } from 'react';
import '../styles/CaptionGenerator.css';

function CaptionGenerator({
  tiktokData,
  onCaptionGenerated,
  setIsLoading,
  isLoading,
  addProgress,
  onBack,
}) {
  const [caption, setCaption] = useState('');
  const [editedCaption, setEditedCaption] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateCaption = async () => {
    setError('');
    setIsLoading(true);
    addProgress('🎯 Generating caption with Gemini...');

    try {
      const content = `Title: ${tiktokData.title}\nDescription: ${tiktokData.description}`;
      
      const result = await window.electronAPI.generateCaption(content);

      if (result.success) {
        setCaption(result.caption);
        setEditedCaption(result.caption);
        addProgress('✓ Caption generated');
      } else {
        setError(result.error || 'Failed to generate caption');
        addProgress(`✗ Error: ${result.error}`);
      }
    } catch (err) {
      setError(err.message);
      addProgress(`✗ Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseCaption = () => {
    onCaptionGenerated(editedCaption || caption);
  };

  return (
    <div className="caption-generator">
      <div className="header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h2>Generate Caption</h2>
      </div>

      <div className="content-review">
        <div className="extracted-content">
          <h3>Extracted Content</h3>
          <div className="content-item">
            <strong>Title:</strong>
            <p>{tiktokData.title}</p>
          </div>
          <div className="content-item">
            <strong>Description:</strong>
            <p>{tiktokData.description}</p>
          </div>
          {tiktokData.imagePath && (
            <div className="content-item">
              <strong>Image:</strong>
              <p className="image-path">{tiktokData.imagePath}</p>
            </div>
          )}
        </div>
      </div>

      <div className="caption-section">
        {!caption ? (
          <button
            onClick={handleGenerateCaption}
            disabled={isLoading}
            className="generate-btn"
          >
            {isLoading ? '⏳ Generating...' : '✨ Generate Caption'}
          </button>
        ) : (
          <>
            <div className="caption-display">
              <h3>Generated Caption</h3>
              {!isEditing ? (
                <div className="caption-text">
                  <p>{caption}</p>
                  <button
                    className="edit-btn"
                    onClick={() => setIsEditing(true)}
                  >
                    ✏️ Edit
                  </button>
                </div>
              ) : (
                <div className="caption-edit">
                  <textarea
                    value={editedCaption}
                    onChange={(e) => setEditedCaption(e.target.value)}
                    rows="4"
                  />
                  <button
                    className="save-btn"
                    onClick={() => setIsEditing(false)}
                  >
                    ✓ Save
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleUseCaption}
              className="use-caption-btn"
            >
              ✓ Use This Caption & Continue
            </button>

            <button
              onClick={handleGenerateCaption}
              disabled={isLoading}
              className="regenerate-btn"
            >
              🔄 Generate New
            </button>
          </>
        )}

        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
}

export default CaptionGenerator;
