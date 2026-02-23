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
    addProgress('🎬 Đang tạo Sora prompt...');

    try {
      const content = `${tiktokData.title} - ${tiktokData.description} - Caption: ${caption}`;

      const result = await window.electronAPI.generateSoraPrompt(content);

      if (result.success) {
        setSoraPrompt(result.prompt);
        addProgress('✓ Đã tạo Sora prompt');
      } else {
        setError(result.error || 'Tạo prompt thất bại');
        addProgress(`✗ Lỗi: ${result.error}`);
      }
    } catch (err) {
      setError(err.message);
      addProgress(`✗ Lỗi: ${err.message}`);
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const handleCreateVideo = async () => {
    setError('');
    setIsLoading(true);
    addProgress('🎥 Đang tạo video bằng Sora...');

    try {
      const result = await window.electronAPI.createSoraVideo({
        imageData: tiktokData.imagePath,
        prompt: soraPrompt || caption,
        characterId,
      });

      if (result.success) {
        addProgress('✓ Đã tạo video thành công!');
        onVideoCreated();
      } else {
        setError(result.error || 'Tạo video thất bại');
        addProgress(`✗ Lỗi: ${result.error}`);
      }
    } catch (err) {
      setError(err.message);
      addProgress(`✗ Lỗi: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      await window.electronAPI.openSoraLogin();
    } catch (err) {
      setError(`Lỗi khi mở trang đăng nhập: ${err.message}`);
    }
  };

  const handleCloseBrowser = async () => {
    try {
      await window.electronAPI.closeSoraBrowser();
      addProgress('ℹ️ Đã đóng trình duyệt');
    } catch (err) {
      setError(`Lỗi khi đóng trình duyệt: ${err.message}`);
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
        <button className="back-btn" onClick={onBack}>← Quay lại</button>
        <h2>Tạo Video bằng Sora</h2>
      </div>

      <div className="summary">
        <h3>Tóm tắt nội dung</h3>
        <div className="summary-items">
          <div className="summary-item">
            <span className="label">Caption:</span>
            <span className="value">{caption}</span>
          </div>
          <div className="summary-item" style={{ alignItems: 'center' }}>
            <span className="label">Hình ảnh:</span>
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
                  <span style={{ color: '#25f4ee' }}>✓ Đã có ảnh</span>
                </div>
              ) : '✗ Không có'}
            </span>
          </div>
        </div>
      </div>

      <div className="configuration">
        <div className="config-section">
          <label>Nhân vật (Character)</label>
          <input
            type="text"
            list="character-options"
            value={characterId}
            onChange={(e) => setCharacterId(e.target.value)}
            disabled={isLoading}
            placeholder="Nhập hoặc chọn ID nhân vật"
          />
          <datalist id="character-options">
            {commonCharacters.map(char => (
              <option key={char} value={char}>{char}</option>
            ))}
          </datalist>
          <p className="hint">Nhập ID nhân vật tùy chỉnh hoặc chọn từ danh sách</p>
        </div>

        <div className="config-section">
          <label>Video Prompt</label>
          {!soraPrompt ? (
            <button
              onClick={handleGenerateSoraPrompt}
              disabled={isGeneratingPrompt}
              className="generate-prompt-btn"
            >
              {isGeneratingPrompt ? '⏳ Đang tạo...' : '✨ Tạo Smart Prompt'}
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
                🔄 Tạo lại prompt
              </button>
            </>
          )}
          <p className="hint">
            {soraPrompt
              ? 'Bạn có thể chỉnh sửa prompt hoặc tạo lại cái mới'
              : 'Prompt chi tiết sẽ được tự động tạo cho Sora'}
          </p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="action-buttons">
          <button
            onClick={handleCreateVideo}
            disabled={isLoading || !soraPrompt}
            className="create-video-btn"
          >
            {isLoading ? '⏳ Đang tạo video...' : '🎬 Tạo Video với Sora'}
          </button>

          <div className="secondary-actions">
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="login-sora-btn"
              title="Đăng nhập vào Sora nếu phiên đã hết hạn"
            >
              🔑 Đăng nhập Sora
            </button>
            <button
              onClick={handleCloseBrowser}
              disabled={isLoading}
              className="close-browser-btn"
              title="Đóng trình duyệt hiện tại"
            >
              ❌ Đóng trình duyệt
            </button>
          </div>
        </div>

        <div className="info-note">
          <p>
            ℹ️ Trình duyệt sẽ mở trang Sora. Vui lòng làm theo hướng dẫn để
            hoàn tất tạo video. Bạn có thể cần đăng nhập vào tài khoản của mình.
          </p>
        </div>
      </div>
    </div>
  );
}

export default SoraVideoGenerator;
