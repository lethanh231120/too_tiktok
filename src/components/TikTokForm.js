import React, { useState } from 'react';
import { CheckCircle2, Link2 } from 'lucide-react';
import '../styles/TikTokForm.css';

function TikTokForm({ onDataExtracted, setIsLoading, isLoading, addProgress }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    addProgress('🔄 Đang trích xuất dữ liệu TikTok...');

    try {
      if (!window.electronAPI) {
        throw new Error('Electron API not available');
      }

      const result = await window.electronAPI.extractTiktokData(url);

      if (result.success) {
        onDataExtracted(result.data);
      } else {
        setError(result.error || 'Trích xuất dữ liệu thất bại');
        addProgress(`✗ Lỗi: ${result.error}`);
      }
    } catch (err) {
      setError(err.message);
      addProgress(`✗ Lỗi: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="tiktok-form">
      <div className="form-container">
        <h2>Nhập TikTok URL</h2>
        <p>Dán link video TikTok để bắt đầu</p>

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
            {isLoading ? 'Đang trích xuất...' : 'Trích xuất dữ liệu'}
          </button>
        </form>

        <div className="format-hint">
          <h3>Định dạng link hợp lệ:</h3>
          <code>https://www.tiktok.com/@username/video/123456789</code>
        </div>
      </div>

      <div className="info-section">
        <h3>Tính năng:</h3>
        <ul>
          <li><CheckCircle2 size={16} /> Trích xuất tiêu đề và mô tả video</li>
          <li><CheckCircle2 size={16} /> Tải ảnh bìa/thumbnail</li>
          <li><CheckCircle2 size={16} /> Phân tích cấu trúc nội dung</li>
        </ul>
      </div>
    </div>
  );
}

export default TikTokForm;
