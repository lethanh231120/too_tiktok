import React, { useState } from 'react';
import '../styles/TikTokForm.css';

function TikTokForm({ onDataExtracted, setIsLoading, isLoading, addProgress }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    addProgress('🔄 Extracting TikTok data...');

    try {
      if (!window.electronAPI) {
        throw new Error('Electron API not available');
      }

      const result = await window.electronAPI.extractTiktokData(url);

      if (result.success) {
        onDataExtracted(result.data);
      } else {
        setError(result.error || 'Failed to extract data');
        addProgress(`✗ Error: ${result.error}`);
      }
    } catch (err) {
      setError(err.message);
      addProgress(`✗ Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="tiktok-form">
      <div className="form-container">
        <h2>Enter TikTok URL</h2>
        <p>Paste a TikTok video URL to get started</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="url">TikTok URL</label>
            <input
              id="url"
              type="text"
              placeholder="https://www.tiktok.com/@creator/video/123456789"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            disabled={isLoading || !url}
            className="submit-btn"
          >
            {isLoading ? 'Extracting...' : 'Extract Data'}
          </button>
        </form>

        <div className="format-hint">
          <h3>Valid URL Format:</h3>
          <code>https://www.tiktok.com/@username/video/123456789</code>
        </div>
      </div>

      <div className="info-section">
        <h3>What this does:</h3>
        <ul>
          <li>Extracts video title and description</li>
          <li>Downloads thumbnail/cover image</li>
          <li>Analyzes content structure</li>
        </ul>
      </div>
    </div>
  );
}

export default TikTokForm;
