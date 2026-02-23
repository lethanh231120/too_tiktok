import React, { useState } from 'react';
import '../styles/SoraVideoGenerator.css';

function SoraVideoGenerator({
  tiktokData,
  caption,
  onVideoCreated,
  setIsLoading,
  isLoading,
  addProgress,
  onBack,
}) {
  const [characterId, setCharacterId] = useState('vuluu2k.thao');
  const [soraPrompt, setSoraPrompt] = useState('');
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateSoraPrompt = async () => {
    setError('');
    setIsGeneratingPrompt(true);
    addProgress('🎬 Generating Sora prompt...');

    try {
      const content = `${tiktokData.title} - ${tiktokData.description} - Caption: ${caption}`;

      const result = await window.electronAPI.generateSoraPrompt(content);

      if (result.success) {
        setSoraPrompt(result.prompt);
        addProgress('✓ Sora prompt generated');
      } else {
        setError(result.error || 'Failed to generate prompt');
        addProgress(`✗ Error: ${result.error}`);
      }
    } catch (err) {
      setError(err.message);
      addProgress(`✗ Error: ${err.message}`);
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const handleCreateVideo = async () => {
    setError('');
    setIsLoading(true);
    addProgress('🎥 Creating video with Sora...');

    try {
      const result = await window.electronAPI.createSoraVideo({
        imageData: tiktokData.imagePath,
        prompt: soraPrompt || caption,
        characterId,
      });

      if (result.success) {
        addProgress('✓ Video created successfully!');
        onVideoCreated();
      } else {
        setError(result.error || 'Failed to create video');
        addProgress(`✗ Error: ${result.error}`);
      }
    } catch (err) {
      setError(err.message);
      addProgress(`✗ Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const commonCharacters = [
    'vuluu2k.thao',
    'character_default',
    'character_anime',
    'character_realistic',
  ];

  return (
    <div className="sora-video-generator">
      <div className="header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h2>Generate Video with Sora</h2>
      </div>

      <div className="summary">
        <h3>Content Summary</h3>
        <div className="summary-items">
          <div className="summary-item">
            <span className="label">Caption:</span>
            <span className="value">{caption}</span>
          </div>
          <div className="summary-item" style={{ alignItems: 'center' }}>
            <span className="label">Image:</span>
            <span className="value">
              {(tiktokData.images && tiktokData.images.length > 0) ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <img
                    src={tiktokData.images[0]}
                    alt="Preview"
                    style={{
                      width: '40px',
                      height: '40px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '1px solid rgba(37, 244, 238, 0.3)'
                    }}
                  />
                  <span style={{ color: '#25f4ee' }}>✓ Provided</span>
                </div>
              ) : '✗ None'}
            </span>
          </div>
        </div>
      </div>

      <div className="configuration">
        <div className="config-section">
          <label>Character</label>
          <input
            type="text"
            list="character-options"
            value={characterId}
            onChange={(e) => setCharacterId(e.target.value)}
            disabled={isLoading}
            placeholder="Type or select a character ID"
          />
          <datalist id="character-options">
            {commonCharacters.map(char => (
              <option key={char} value={char}>{char}</option>
            ))}
          </datalist>
          <p className="hint">Type a custom character ID or select from the list</p>
        </div>

        <div className="config-section">
          <label>Video Prompt</label>
          {!soraPrompt ? (
            <button
              onClick={handleGenerateSoraPrompt}
              disabled={isGeneratingPrompt}
              className="generate-prompt-btn"
            >
              {isGeneratingPrompt ? '⏳ Generating...' : '✨ Generate Smart Prompt'}
            </button>
          ) : (
            <>
              <textarea
                value={soraPrompt}
                onChange={(e) => setSoraPrompt(e.target.value)}
                rows="6"
                disabled={isLoading}
              />
              <button
                onClick={handleGenerateSoraPrompt}
                disabled={isGeneratingPrompt || isLoading}
                className="regenerate-prompt-btn"
              >
                🔄 Regenerate
              </button>
            </>
          )}
          <p className="hint">
            {soraPrompt
              ? 'You can edit the prompt or regenerate it'
              : 'A detailed prompt will be generated for Sora'}
          </p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button
          onClick={handleCreateVideo}
          disabled={isLoading || !soraPrompt}
          className="create-video-btn"
        >
          {isLoading ? '⏳ Creating Video...' : '🎬 Create Video with Sora'}
        </button>

        <div className="info-note">
          <p>
            ℹ️ The browser will open to Sora. Please follow the prompts to
            complete video generation. You may need to login to your account.
          </p>
        </div>
      </div>
    </div>
  );
}

export default SoraVideoGenerator;
