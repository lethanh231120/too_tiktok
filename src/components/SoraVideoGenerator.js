import React, { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  Video,
  Key,
  X,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Download,
  Check,
  Monitor,
  Smartphone,
  Clock,
  Film,
  ChevronDown,
  User,
} from "lucide-react";
import "../styles/SoraVideoGenerator.css";

/* ────── Option Pill Selector ────── */
function OptionPills({ options, value, onChange, disabled, icon: Icon }) {
  return (
    <div className="option-pills">
      {options.map((opt) => (
        <button
          key={opt.value}
          className={`option-pill ${value === opt.value ? "active" : ""}`}
          onClick={() => !disabled && onChange(opt.value)}
          disabled={disabled}
          title={opt.description || opt.label}
        >
          {opt.icon && <opt.icon size={16} />}
          <span className="pill-label">{opt.label}</span>
          {opt.sub && <span className="pill-sub">{opt.sub}</span>}
        </button>
      ))}
    </div>
  );
}

/* ────── Custom Select Dropdown ────── */
function CustomSelect({
  options,
  value,
  onChange,
  disabled,
  placeholder,
  icon: Icon,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div
      className={`custom-select ${open ? "open" : ""} ${disabled ? "disabled" : ""}`}
      ref={ref}
    >
      <button
        className="custom-select-trigger"
        onClick={() => !disabled && setOpen(!open)}
      >
        {Icon && <Icon size={16} className="select-icon" />}
        <span className="select-value">
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`select-chevron ${open ? "rotated" : ""}`}
        />
      </button>
      {open && (
        <div className="custom-select-dropdown">
          {options.map((opt) => (
            <button
              key={opt.value}
              className={`custom-select-option ${value === opt.value ? "selected" : ""}`}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
            >
              {opt.icon && <opt.icon size={16} />}
              <span>{opt.label}</span>
              {value === opt.value && (
                <Check size={14} className="check-icon" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ────── Toggle Switch ────── */
function ToggleSwitch({ checked, onChange, label }) {
  return (
    <label className="toggle-switch">
      <div
        className={`toggle-track ${checked ? "on" : ""}`}
        onClick={() => onChange(!checked)}
      >
        <div className="toggle-thumb" />
      </div>
      <span className="toggle-label-text">{label}</span>
    </label>
  );
}

/* ────── Main Component ────── */
function SoraVideoGenerator({
  tiktokData,
  caption,
  onVideoCreated,
  setIsLoading,
  isLoading,
  addProgress,
  onBack,
}) {
  const [characterId, setCharacterId] = useState("vuluu2k.thao");
  const [resolution, setResolution] = useState("9:16");
  const [duration, setDuration] = useState("10s");
  const [videoCount, setVideoCount] = useState("1");
  const [soraPrompt, setSoraPrompt] = useState("");
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [submissionScreenshot, setSubmissionScreenshot] = useState(null);
  const [autoDownload, setAutoDownload] = useState(true);
  const [videoUrl, setVideoUrl] = useState(null);
  const [downloadPath, setDownloadPath] = useState("");
  const [error, setError] = useState("");
  const [renderProgress, setRenderProgress] = useState(null);

  useEffect(() => {
    const validResolutions = ["9:16", "16:9"];
    const validDurations = ["10s", "15s"];
    const validCounts = ["1", "2", "3"];
    const loadConfig = async () => {
      try {
        const config = await window.electronAPI.loadConfig();
        if (config.characterId) setCharacterId(config.characterId);
        if (config.resolution && validResolutions.includes(config.resolution))
          setResolution(config.resolution);
        if (config.duration && validDurations.includes(config.duration))
          setDuration(config.duration);
        if (config.videoCount && validCounts.includes(config.videoCount))
          setVideoCount(config.videoCount);
      } catch (err) {
        console.error("Error loading config:", err);
      }
    };
    loadConfig();
  }, []);

  // Listen for real-time progress from backend
  useEffect(() => {
    if (!window.electronAPI.onSoraProgress) return;
    const cleanup = window.electronAPI.onSoraProgress((data) => {
      setRenderProgress(data);
    });
    return cleanup;
  }, []);

  useEffect(() => {
    const saveConfig = async () => {
      try {
        const currentConfig = await window.electronAPI.loadConfig();
        await window.electronAPI.saveConfig({
          ...currentConfig,
          characterId,
          resolution,
          duration,
          videoCount,
        });
      } catch (err) {
        console.error("Error saving config:", err);
      }
    };
    saveConfig();
  }, [characterId, resolution, duration, videoCount]);

  const handleGenerateSoraPrompt = async () => {
    setError("");
    setIsGeneratingPrompt(true);
    addProgress("🎬 Đang tạo Sora prompt...");

    try {
      const content = `${tiktokData.title} - ${tiktokData.description} - Caption: ${caption}`;
      const result = await window.electronAPI.generateSoraPrompt(content);

      console.log({ content, result });
      if (result.success) {
        setSoraPrompt(result.prompt);
        addProgress("✓ Đã tạo Sora prompt");
      } else {
        setError(result.error || "Tạo prompt thất bại");
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
    setError("");
    setIsLoading(true);
    setSubmissionScreenshot(null);
    setVideoUrl(null);
    setDownloadPath("");
    setRenderProgress(null);
    addProgress("🎥 Đang bắt đầu quy trình tạo video Sora...");

    try {
      const submitResult = await window.electronAPI.createSoraVideo({
        imageData: tiktokData.imagePath,
        prompt: soraPrompt || caption,
        characterId,
        resolution,
        duration,
        videoCount,
      });

      if (submitResult.success) {
        if (submitResult.screenshot) {
          setSubmissionScreenshot(submitResult.screenshot);
          addProgress("📸 Đã chụp ảnh xác nhận từ Sora");
        }
        addProgress("✓ Đã gửi yêu cầu lên Sora. Đang chờ render...");

        const pollResult = await window.electronAPI.pollSoraResult();

        if (pollResult.success) {
          setVideoUrl(pollResult.videoUrl);
          addProgress("✓ Video đã render xong!");

          if (autoDownload) {
            addProgress("📥 Đang tự động tải video về máy...");
            const filename = `tiktok_video_${Date.now()}.mp4`;
            const downloadResult = await window.electronAPI.downloadVideo({
              url: pollResult.videoUrl,
              filename,
            });

            if (downloadResult.success) {
              setDownloadPath(downloadResult.filePath);
              addProgress(`✓ Đã tải về: ${downloadResult.filePath}`);
            } else {
              addProgress(`✗ Lỗi tải về: ${downloadResult.error}`);
            }
          }

          // Save to history
          await window.electronAPI.saveHistory({
            title: tiktokData.title || "Video",
            description: tiktokData.description || "",
            caption,
            prompt: soraPrompt,
            characterId,
            resolution,
            duration,
            videoCount,
            videoUrls: Array.isArray(pollResult.videoUrl)
              ? pollResult.videoUrl
              : [pollResult.videoUrl].filter(Boolean),
            images: tiktokData.images || [],
            imagePath: tiktokData.imagePath || "",
            timestamp: new Date().toISOString(),
          });

          onVideoCreated();
        } else {
          setError(pollResult.error || "Lỗi khi chờ video render");
          addProgress(`✗ Lỗi: ${pollResult.error}`);
        }
      } else if (submitResult.needLogin) {
        setError(
          'Phiên làm việc Sora đã hết hạn. Vui lòng nhấn nút "Đăng nhập Sora" bên dưới.',
        );
        addProgress("⚠️ Yêu cầu đăng nhập Sora để tiếp tục");
      } else {
        setError(submitResult.error || "Gửi yêu cầu thất bại");
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
      addProgress("ℹ️ Đã đóng trình duyệt");
    } catch (err) {
      setError(`Lỗi khi đóng trình duyệt: ${err.message}`);
    }
  };

  const resolutionOptions = [
    { value: "9:16", label: "Dọc", sub: "9:16", icon: Smartphone },
    { value: "16:9", label: "Ngang", sub: "16:9", icon: Monitor },
  ];

  const durationOptions = [
    { value: "10s", label: "10s" },
    { value: "15s", label: "15s" },
  ];

  const videoCountOptions = [
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
  ];

  const characterOptions = [
    { value: "vuluu2k.thao", label: "@vuluu2k.thao" },
    { value: "character_default", label: "Default Character" },
    { value: "character_anime", label: "Anime Style" },
    { value: "character_realistic", label: "Realistic" },
  ];

  return (
    <div className="sora-video-generator">
      {/* Header */}
      <div className="header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={18} /> Quay lại
        </button>
        <h2>Tạo Video bằng Sora</h2>
      </div>

      {/* Summary */}
      <div className="summary">
        <h3>Tóm tắt nội dung</h3>
        <div className="summary-items">
          <div className="summary-item">
            <span className="label">Caption:</span>
            <span className="value">{caption}</span>
          </div>
          <div className="summary-item" style={{ alignItems: "center" }}>
            <span className="label">Hình ảnh:</span>
            <span className="value">
              {tiktokData.images && tiktokData.images.length > 0 ? (
                <div
                  style={{ display: "flex", alignItems: "center", gap: "1rem" }}
                >
                  <img
                    src={tiktokData.images[0]}
                    alt="Preview"
                    style={{
                      width: "40px",
                      height: "40px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      border: "1px solid rgba(37, 244, 238, 0.3)",
                    }}
                  />
                  <span style={{ color: "#25f4ee" }}>✓ Đã có ảnh</span>
                </div>
              ) : (
                "✗ Không có"
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Configuration */}
      <div className="configuration">
        {/* Character */}
        <div className="config-card">
          <div className="config-card-header">
            <User size={18} className="config-icon" />
            <label>Nhân vật (Character)</label>
          </div>
          <CustomSelect
            options={characterOptions}
            value={characterId}
            onChange={setCharacterId}
            disabled={isLoading}
            placeholder="Chọn nhân vật"
            icon={User}
          />
          <input
            type="text"
            className="character-input"
            value={characterId}
            onChange={(e) => setCharacterId(e.target.value)}
            disabled={isLoading}
            placeholder="Hoặc nhập ID nhân vật tùy chỉnh..."
          />
        </div>

        {/* Video Settings Row */}
        <div className="settings-grid">
          {/* Resolution */}
          <div className="config-card">
            <div className="config-card-header">
              <Monitor size={18} className="config-icon" />
              <label>Khung hình</label>
            </div>
            <OptionPills
              options={resolutionOptions}
              value={resolution}
              onChange={setResolution}
              disabled={isLoading}
            />
          </div>

          {/* Duration */}
          <div className="config-card">
            <div className="config-card-header">
              <Clock size={18} className="config-icon" />
              <label>Thời lượng</label>
            </div>
            <OptionPills
              options={durationOptions}
              value={duration}
              onChange={setDuration}
              disabled={isLoading}
            />
          </div>

          {/* Video Count */}
          <div className="config-card">
            <div className="config-card-header">
              <Film size={18} className="config-icon" />
              <label>Số lượng</label>
            </div>
            <OptionPills
              options={videoCountOptions}
              value={videoCount}
              onChange={setVideoCount}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Prompt */}
        <div className="config-card prompt-card">
          <div className="config-card-header">
            <Sparkles size={18} className="config-icon sparkle" />
            <label>Video Prompt</label>
          </div>
          {!soraPrompt ? (
            <button
              onClick={handleGenerateSoraPrompt}
              disabled={isGeneratingPrompt}
              className="generate-prompt-btn"
            >
              {isGeneratingPrompt ? (
                <>
                  <span className="btn-spinner" /> Đang tạo...
                </>
              ) : (
                <>
                  <Sparkles size={18} /> Tạo Smart Prompt
                </>
              )}
            </button>
          ) : (
            <>
              <textarea
                value={soraPrompt}
                onChange={(e) => setSoraPrompt(e.target.value)}
                rows="5"
                disabled={isLoading}
                className="prompt-textarea"
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
              ? "Bạn có thể chỉnh sửa prompt hoặc tạo lại cái mới"
              : "Prompt chi tiết sẽ được tự động tạo cho Sora"}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠</span>
            {error}
          </div>
        )}

        {/* Render Progress */}
        {isLoading && renderProgress && (
          <div className="render-progress-panel">
            <div className="render-progress-header">
              <div className="render-progress-pulse"></div>
              <span className="render-progress-status">
                {renderProgress.status}
              </span>
            </div>
            {renderProgress.detail && (
              <p className="render-progress-detail">{renderProgress.detail}</p>
            )}
          </div>
        )}

        {/* Submission Verification */}
        {submissionScreenshot && (
          <div className="submission-verification">
            <h4>
              <CheckCircle2 size={16} color="#25f4ee" /> Xác nhận đã gửi tới
              Sora
            </h4>
            <p>Video của bạn đang được xử lý với prompt bên dưới:</p>
            <div className="active-prompt-display">
              <code>{soraPrompt || caption}</code>
            </div>
            <div className="screenshot-container">
              <img
                src={`file://${submissionScreenshot}`}
                alt="Sora Confirmation"
              />
              <div className="screenshot-overlay">
                Ảnh chụp màn hình từ Sora
              </div>
            </div>

            <div className="auto-download-control">
              <ToggleSwitch
                checked={autoDownload}
                onChange={setAutoDownload}
                label="Tự động tải video về khi xong"
              />
            </div>

            {videoUrl && (
              <div className="result-display fade-in">
                <div className="success-badge">
                  <Check size={14} /> Render thành công
                </div>
                {downloadPath ? (
                  <div className="download-path">
                    <Download size={14} /> Đã lưu tại:{" "}
                    <code>{downloadPath}</code>
                  </div>
                ) : (
                  <div className="video-link">
                    Link video:{" "}
                    <a href={videoUrl} target="_blank" rel="noreferrer">
                      Tại đây
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="action-buttons">
          <button
            onClick={handleCreateVideo}
            disabled={isLoading || !soraPrompt}
            className="create-video-btn"
          >
            {isLoading ? (
              <>
                <span className="btn-spinner" /> Đang tạo video...
              </>
            ) : (
              <>
                <Video size={20} /> Tạo Video với Sora
              </>
            )}
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
            ℹ️ Trình duyệt sẽ mở trang Sora. Vui lòng làm theo hướng dẫn để hoàn
            tất tạo video. Bạn có thể cần đăng nhập vào tài khoản của mình.
          </p>
        </div>
      </div>
    </div>
  );
}

export default SoraVideoGenerator;
