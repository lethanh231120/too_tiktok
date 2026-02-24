import React, { useState } from 'react';
import { ArrowLeft, Video, Key, X, Zap, Sparkles, RefreshCw, CheckCircle2, Download, Check } from 'lucide-react';
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
  const [resolution, setResolution] = useState('16:9');
  const [duration, setDuration] = useState('10s');
  const [videoCount, setVideoCount] = useState('1');
  const [soraPrompt, setSoraPrompt] = useState('');
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [submissionScreenshot, setSubmissionScreenshot] = useState(null);
  const [autoDownload, setAutoDownload] = useState(true);
  const [videoUrl, setVideoUrl] = useState(null);
  const [downloadPath, setDownloadPath] = useState('');
  const [error, setError] = useState('');

  React.useEffect(() => {
    // Load config on mount
    const loadConfig = async () => {
      try {
        const config = await window.electronAPI.loadConfig();
        if (config.characterId) setCharacterId(config.characterId);
        if (config.resolution) setResolution(config.resolution);
        if (config.duration) setDuration(config.duration);
        if (config.videoCount) setVideoCount(config.videoCount);
      } catch (err) {
        console.error('Error loading config:', err);
      }
    };
    loadConfig();
  }, []);

  React.useEffect(() => {
    // Save config when changed
    const saveConfig = async () => {
      try {
        const currentConfig = await window.electronAPI.loadConfig();
        await window.electronAPI.saveConfig({
          ...currentConfig,
          characterId,
          resolution,
          duration,
          videoCount
        });
      } catch (err) {
        console.error('Error saving config:', err);
      }
    };
    saveConfig();
  }, [characterId, resolution, duration, videoCount]);

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
    setSubmissionScreenshot(null);
    setVideoUrl(null);
    setDownloadPath('');
    addProgress('🎥 Đang bắt đầu quy trình tạo video Sora...');

    try {
      // Step 1: Submission
      const submitResult = await window.electronAPI.createSoraVideo({
        imageData: tiktokData.imagePath,
        prompt: soraPrompt || caption,
        characterId,
        resolution,
        duration,
        videoCount
      });

      if (submitResult.success) {
        if (submitResult.screenshot) {
          setSubmissionScreenshot(submitResult.screenshot);
          addProgress('📸 Đã chụp ảnh xác nhận từ Sora');
        }
        addProgress('✓ Đã gửi yêu cầu lên Sora. Đang chờ render...');

        // Step 2: Polling
        const pollResult = await window.electronAPI.pollSoraResult();

        if (pollResult.success) {
          setVideoUrl(pollResult.videoUrl);
          addProgress('✓ Video đã render xong!');

          // Step 3: Auto Download
          if (autoDownload) {
            addProgress('📥 Đang tự động tải video về máy...');
            const filename = `tiktok_video_${Date.now()}.mp4`;
            const downloadResult = await window.electronAPI.downloadVideo({
              url: pollResult.videoUrl,
              filename
            });

            if (downloadResult.success) {
              setDownloadPath(downloadResult.filePath);
              addProgress(`✓ Đã tải về: ${downloadResult.filePath}`);
            } else {
              addProgress(`✗ Lỗi tải về: ${downloadResult.error}`);
            }
          }

          onVideoCreated();
        } else {
          setError(pollResult.error || 'Lỗi khi chờ video render');
          addProgress(`✗ Lỗi: ${pollResult.error}`);
        }
      } else if (submitResult.needLogin) {
        setError('Phiên làm việc Sora đã hết hạn. Vui lòng nhấn nút "Đăng nhập Sora" bên dưới.');
        addProgress('⚠️ Yêu cầu đăng nhập Sora để tiếp tục');
      } else {
        setError(submitResult.error || 'Gửi yêu cầu thất bại');
        addProgress(`✗ Lỗi: ${submitResult.error}`);
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
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={18} /> Quay lại
        </button>
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

        <div className="config-section" style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <label>Khung hình</label>
            <input
              type="text"
              list="resolution-options"
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              disabled={isLoading}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(255, 255, 255, 0.05)', color: 'white' }}
            />
            <datalist id="resolution-options">
              <option value="16:9">Ngang (16:9)</option>
              <option value="9:16">Dọc (9:16)</option>
            </datalist>
          </div>
          <div style={{ flex: 1 }}>
            <label>Thời lượng</label>
            <input
              type="text"
              list="duration-options"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              disabled={isLoading}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(255, 255, 255, 0.05)', color: 'white' }}
            />
            <datalist id="duration-options">
              <option value="10s">10 giây</option>
              <option value="15s">15 giây</option>
            </datalist>
          </div>
          <div style={{ flex: 1 }}>
            <label>Số lượng</label>
            <input
              type="text"
              list="videocount-options"
              value={videoCount}
              onChange={(e) => setVideoCount(e.target.value)}
              disabled={isLoading}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(255, 255, 255, 0.05)', color: 'white' }}
            />
            <datalist id="videocount-options">
              <option value="1">1 Video</option>
              <option value="2">2 Video</option>
              <option value="3">3 Video</option>
            </datalist>
          </div>
        </div>

        <div className="config-section">
          <label>Video Prompt</label>
          {!soraPrompt ? (
            <button
              onClick={handleGenerateSoraPrompt}
              disabled={isGeneratingPrompt}
              className="generate-prompt-btn"
            >
              {isGeneratingPrompt ? '⏳ Đang tạo...' : <><Sparkles size={18} /> Tạo Smart Prompt</>}
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
                <RefreshCw size={16} /> Tạo lại prompt
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

        {submissionScreenshot && (
          <div className="submission-verification">
            <h4><CheckCircle2 size={16} color="#25f4ee" /> Xác nhận đã gửi tới Sora</h4>
            <p>Video của bạn đang được xử lý với prompt bên dưới:</p>
            <div className="active-prompt-display">
              <code>{soraPrompt || caption}</code>
            </div>
            <div className="screenshot-container">
              <img src={`file://${submissionScreenshot}`} alt="Sora Confirmation" />
              <div className="screenshot-overlay">Ảnh chụp màn hình từ Sora</div>
            </div>

            <div className="auto-download-control">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={autoDownload}
                  onChange={(e) => setAutoDownload(e.target.checked)}
                />
                <span className="toggle-text">Tự động tải video về khi xong</span>
              </label>
            </div>

            {videoUrl && (
              <div className="result-display fade-in">
                <div className="success-badge"><Check size={14} /> Render thành công</div>
                {downloadPath ? (
                  <div className="download-path">
                    <Download size={14} /> Đã lưu tại: <code>{downloadPath}</code>
                  </div>
                ) : (
                  <div className="video-link">
                    Link video: <a href={videoUrl} target="_blank" rel="noreferrer">Tại đây</a>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="action-buttons">
          <button
            onClick={handleCreateVideo}
            disabled={isLoading || !soraPrompt}
            className="create-video-btn"
          >
            {isLoading ? '⏳ Đang tạo video...' : <><Video size={20} /> Tạo Video với Sora</>}
          </button>

          <div className="secondary-actions">
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="login-sora-btn"
              title="Đăng nhập vào Sora nếu phiên đã hết hạn"
            >
              <Key size={16} /> Đăng nhập Sora
            </button>
            <button
              onClick={handleCloseBrowser}
              disabled={isLoading}
              className="close-browser-btn"
              title="Đóng trình duyệt hiện tại"
            >
              <X size={16} /> Đóng trình duyệt
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
