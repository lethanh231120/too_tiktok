import React, { useState, useEffect } from 'react';
import '../styles/Settings.css';

function SettingsModal({ isOpen, onClose }) {
    const [geminiApiKey, setGeminiApiKey] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Load existing config when modal opens
            window.electronAPI.loadConfig().then((config) => {
                if (config && config.geminiApiKey) {
                    setGeminiApiKey(config.geminiApiKey);
                }
            });
        }
    }, [isOpen]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Save to electron-store
            await window.electronAPI.saveConfig({ geminiApiKey });
            onClose();
        } catch (error) {
            console.error('Lỗi khi lưu cấu hình:', error);
            alert('Không thể lưu cài đặt');
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content glass-panel">
                <div className="modal-header">
                    <h2>Cài đặt</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body">
                    <div className="form-group">
                        <label htmlFor="apiKey">Gemini API Key</label>
                        <input
                            type="password"
                            id="apiKey"
                            value={geminiApiKey}
                            onChange={(e) => setGeminiApiKey(e.target.value)}
                            placeholder="Nhập Gemini API Key bắt đầu bằng AIzaSy..."
                        />
                        <p className="hint">Key này được lưu cục bộ trên máy và dùng để tạo caption & Sora prompt.</p>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="cancel-btn" onClick={onClose}>Hủy</button>
                    <button
                        className="save-btn"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? 'Đang lưu...' : 'Lưu cài đặt'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SettingsModal;
