import React, { useState, useEffect } from 'react';
import { History, Trash2, RotateCcw, Clock, Film, Monitor, ChevronDown, ChevronUp, X } from 'lucide-react';
import '../styles/VideoHistory.css';

function VideoHistory({ onReuse }) {
    const [history, setHistory] = useState([]);
    const [expanded, setExpanded] = useState(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const data = await window.electronAPI.loadHistory();
            setHistory(data || []);
        } catch (err) {
            console.error('Error loading history:', err);
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        await window.electronAPI.deleteHistory(id);
        setHistory(prev => prev.filter(h => h.id !== id));
    };

    const handleClear = async () => {
        if (history.length === 0) return;
        await window.electronAPI.clearHistory();
        setHistory([]);
    };

    const handleReuse = (entry) => {
        if (onReuse) {
            onReuse(entry);
        }
    };

    const formatDate = (ts) => {
        const d = new Date(ts);
        return d.toLocaleDateString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    if (history.length === 0) return null;

    return (
        <div className="video-history">
            <button className="history-toggle" onClick={() => setIsOpen(!isOpen)}>
                <History size={16} />
                <span>Lịch sử tạo video ({history.length})</span>
                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {isOpen && (
                <div className="history-panel">
                    <div className="history-header">
                        <span className="history-count">{history.length} bản ghi</span>
                        <button className="history-clear-btn" onClick={handleClear}>
                            <Trash2 size={13} /> Xóa tất cả
                        </button>
                    </div>

                    <div className="history-list">
                        {history.map((entry) => (
                            <div
                                key={entry.id}
                                className={`history-item ${expanded === entry.id ? 'expanded' : ''}`}
                            >
                                <div className="history-item-header" onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}>
                                    <div className="history-item-info">
                                        <span className="history-title">{entry.title || 'Video'}</span>
                                        <span className="history-date">
                                            <Clock size={12} /> {formatDate(entry.timestamp)}
                                        </span>
                                    </div>
                                    <div className="history-item-tags">
                                        <span className="history-tag">{entry.resolution || '9:16'}</span>
                                        <span className="history-tag">{entry.duration || '10s'}</span>
                                        <span className="history-tag">{entry.videoCount || '1'} vid</span>
                                    </div>
                                </div>

                                {expanded === entry.id && (
                                    <div className="history-item-details">
                                        {entry.caption && (
                                            <div className="history-detail">
                                                <span className="detail-label">Caption:</span>
                                                <p className="detail-value">{entry.caption}</p>
                                            </div>
                                        )}
                                        {entry.prompt && (
                                            <div className="history-detail">
                                                <span className="detail-label">Prompt:</span>
                                                <p className="detail-value prompt-text">{entry.prompt}</p>
                                            </div>
                                        )}
                                        {entry.characterId && (
                                            <div className="history-detail">
                                                <span className="detail-label">Nhân vật:</span>
                                                <span className="detail-value">@{entry.characterId}</span>
                                            </div>
                                        )}
                                        {((entry.videoUrls && entry.videoUrls.length > 0) || entry.videoUrl) && (
                                            <div className="history-detail">
                                                <span className="detail-label">Videos:</span>
                                                <div className="history-video-links">
                                                    {(entry.videoUrls || [entry.videoUrl].filter(Boolean)).map((url, i) => (
                                                        <a key={i} href={url} target="_blank" rel="noreferrer" className="history-video-link">
                                                            🎬 Video {i + 1}
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        <div className="history-item-actions">
                                            <button className="history-reuse-btn" onClick={() => handleReuse(entry)}>
                                                <RotateCcw size={14} /> Tạo lại
                                            </button>
                                            <button className="history-delete-btn" onClick={(e) => handleDelete(entry.id, e)}>
                                                <X size={14} /> Xóa
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default VideoHistory;
