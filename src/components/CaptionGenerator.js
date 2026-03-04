import React, { useState } from "react";
import { ArrowLeft, Sparkles, Edit3, Check, RefreshCw } from "lucide-react";
import "../styles/CaptionGenerator.css";

function CaptionGenerator({
  tiktokData,
  onCaptionGenerated,
  setIsLoading,
  isLoading,
  addProgress,
  onBack,
}) {
  const [caption, setCaption] = useState("");
  const [editedCaption, setEditedCaption] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");

  console.log({ tiktokData });
  const handleGenerateCaption = async () => {
    setError("");
    setIsLoading(true);
    addProgress("🎯 Đang tạo caption bằng Gemini...");

    try {
      const content = `Title: ${tiktokData.title}\nDescription: ${tiktokData.description}`;

      const result = await window.electronAPI.generateCaption(content);

      if (result.success) {
        setCaption(result.caption);
        setEditedCaption(result.caption);
        addProgress("✓ Đã tạo caption");
      } else {
        setError(result.error || "Tạo caption thất bại");
        addProgress(`✗ Lỗi: ${result.error}`);
      }
    } catch (err) {
      setError(err.message);
      addProgress(`✗ Lỗi: ${err.message}`);
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
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={18} /> Quay lại
        </button>
        <h2>Tạo Caption</h2>
      </div>

      <div className="content-review">
        <div className="extracted-content">
          <h3>Nội dung đã trích xuất</h3>
          <div className="content-item">
            <strong>Tiêu đề:</strong>
            <p>{tiktokData.title}</p>
          </div>
          <div className="content-item">
            <strong>Mô tả:</strong>
            <p>{tiktokData.description}</p>
          </div>
          {tiktokData.images && tiktokData.images.length > 0 && (
            <div className="content-item">
              <strong>Hình ảnh:</strong>
              <div style={{ margin: "0.75rem 0" }}>
                <img
                  src={tiktokData.images[0]}
                  alt="Extracted preview"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "200px",
                    borderRadius: "8px",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                  }}
                />
              </div>
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
            {isLoading ? "⏳ Đang tạo..." : "✨ Tạo Caption"}
          </button>
        ) : (
          <>
            <div className="caption-display">
              <h3>Caption đã tạo</h3>
              {!isEditing ? (
                <div className="caption-text">
                  <p>{caption}</p>
                  <button
                    className="edit-btn"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit3 size={14} /> Sửa
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
                    <Check size={14} /> Lưu
                  </button>
                </div>
              )}
            </div>

            <button onClick={handleUseCaption} className="use-caption-btn">
              <Check size={18} /> Sử dụng Caption này & Tiếp tục
            </button>

            <button
              onClick={handleGenerateCaption}
              disabled={isLoading}
              className="regenerate-btn"
            >
              <RefreshCw size={14} /> Tạo lại cái mới
            </button>
          </>
        )}

        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
}

export default CaptionGenerator;
