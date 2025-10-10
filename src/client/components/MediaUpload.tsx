import React, { useState, useRef } from 'react';
import { uploadMedia } from '../api';

interface MediaUploadProps {
  value: string;
  onChange: (url: string) => void;
  placeholder: string;
  acceptTypes: string;
  label: string;
  mediaType: 'image' | 'video' | 'audio';
}

const MediaUpload: React.FC<MediaUploadProps> = ({
  value,
  onChange,
  placeholder,
  acceptTypes,
  label,
  mediaType
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getMediaIcon = () => {
    switch (mediaType) {
      case 'image': return '🖼️';
      case 'video': return '🎥';
      case 'audio': return '🎵';
      default: return '📁';
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = acceptTypes.split(',').map(type => type.trim());
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const mimeType = file.type;
    
    const isValidType = validTypes.some(type => 
      type === mimeType || type === fileExtension || file.name.toLowerCase().endsWith(type)
    );
    
    if (!isValidType) {
      alert(`Please select a valid ${mediaType} file. Accepted types: ${acceptTypes}`);
      return;
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert(`File size must be less than 10MB. Current file size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Simulate upload progress (since we don't have real progress tracking)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const response = await uploadMedia(file, `${mediaType} for quiz question`);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.data.success && response.data.data?.url) {
        onChange(response.data.data.url);
        setTimeout(() => {
          setUploadProgress(0);
          setIsUploading(false);
        }, 500);
      } else {
        throw new Error('Upload failed - no URL returned');
      }

    } catch (error: any) {
      console.error('Upload error:', error);
      console.error('Response:', error.response?.data);
      alert(`Failed to upload file: ${error.response?.data?.error || error.message}`);
      setIsUploading(false);
      setUploadProgress(0);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  const clearMedia = () => {
    onChange('');
  };

  const renderPreview = () => {
    if (!value) return null;

    switch (mediaType) {
      case 'image':
        return (
          <div className="media-preview">
            <img 
              src={value} 
              alt="Preview" 
              style={{ 
                maxWidth: '200px', 
                maxHeight: '150px', 
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                objectFit: 'cover'
              }} 
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        );
      case 'video':
        return (
          <div className="media-preview">
            <video 
              src={value} 
              controls 
              style={{ 
                maxWidth: '200px', 
                maxHeight: '150px', 
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}
              onError={(e) => {
                const target = e.target as HTMLVideoElement;
                target.style.display = 'none';
              }}
            >
              Your browser does not support video playback.
            </video>
          </div>
        );
      case 'audio':
        return (
          <div className="media-preview">
            <audio 
              src={value} 
              controls 
              style={{ 
                width: '200px',
                borderRadius: '8px'
              }}
              onError={(e) => {
                const target = e.target as HTMLAudioElement;
                target.style.display = 'none';
              }}
            >
              Your browser does not support audio playback.
            </audio>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="media-upload-container">
      <label className="media-upload-label">
        {getMediaIcon()} {label}
      </label>
      
      <div className="media-upload-input-group">
        <input
          type="url"
          value={value}
          onChange={handleUrlChange}
          placeholder={placeholder}
          className="media-url-input"
          disabled={isUploading}
        />
        
        <div className="media-upload-buttons">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="upload-btn"
            title={`Upload ${mediaType} file`}
          >
            {isUploading ? '⏳' : '📁'} Upload
          </button>
          
          {value && (
            <button
              type="button"
              onClick={clearMedia}
              disabled={isUploading}
              className="clear-btn"
              title="Clear"
            >
              ❌
            </button>
          )}
        </div>
      </div>

      {isUploading && (
        <div className="upload-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <span className="progress-text">{uploadProgress}%</span>
        </div>
      )}

      {renderPreview()}

      <input
        ref={fileInputRef}
        type="file"
        accept={acceptTypes}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      <style>{`
        .media-upload-container {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .media-upload-label {
          font-weight: 600;
          color: #374151;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .media-upload-input-group {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .media-url-input {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 0.95rem;
          transition: all 0.2s ease;
        }

        .media-url-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .media-url-input:disabled {
          background-color: #f9fafb;
          cursor: not-allowed;
        }

        .media-upload-buttons {
          display: flex;
          gap: 0.25rem;
        }

        .upload-btn, .clear-btn {
          padding: 0.75rem 1rem;
          border: none;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .upload-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .upload-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .upload-btn:disabled {
          background: #9ca3af;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .clear-btn {
          background: #fee2e2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }

        .clear-btn:hover:not(:disabled) {
          background: #fecaca;
          transform: translateY(-1px);
        }

        .upload-progress {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-top: 0.5rem;
        }

        .progress-bar {
          flex: 1;
          height: 6px;
          background: #e5e7eb;
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          transition: width 0.3s ease;
          border-radius: 3px;
        }

        .progress-text {
          font-size: 0.8rem;
          color: #6b7280;
          font-weight: 500;
          min-width: 40px;
        }

        .media-preview {
          margin-top: 0.75rem;
          padding: 0.75rem;
          background: #f8fafc;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        @media (max-width: 768px) {
          .media-upload-input-group {
            flex-direction: column;
            align-items: stretch;
          }
          
          .media-upload-buttons {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default MediaUpload;
