import React, { useState, useRef } from 'react';
import './CreatePostModal.css';
import useCreatePost from '../hooks/useCreatePost';
import { useTranslation } from 'react-i18next';
import { uploadImage } from '../services/upload';

import { ImagePlus, Send, X, Loader2 } from 'lucide-react';

interface CreatePostModalProps {
  onClose: () => void;
  onPostCreated: () => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ onClose, onPostCreated }) => {
  const { t } = useTranslation();
  const { createPost, loading: creatingPost } = useCreatePost();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    imageUrl: '',
    caption: '',
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError(null);
      const res = await uploadImage(file);
      setFormData((prev) => ({ ...prev, imageUrl: res.url }));
    } catch (err) {
      //Error manejado en la pagina
    } finally {
      setUploading(false);
    }
  };

  const handleCaptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, caption: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.imageUrl) {
      setError('Por favor selecciona una imagen primero');
      return;
    }

    try {
      setError(null);
      await createPost(formData);
      onPostCreated();
      onClose();
    } catch {
      setError(t('create_post.error'));
    }
  };

  return (
    <div className="create-modal-overlay" onClick={onClose}>
      <div className="create-modal-content" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header-modern">
          <h2>{t('create_post.title')}</h2>
          <button className="close-x-btn" aria-label={t('edit_profile.cancel')} onClick={onClose}>
            <X size={20} />
          </button>
        </header>

        <form className="create-post-form" onSubmit={handleSubmit}>
          <div
            className="preview-container clickable"
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? (
              <div className="img-placeholder">
                <Loader2 size={48} className="animate-spin" />
                <p>Subiendo a Cloudinary...</p>
              </div>
            ) : formData.imageUrl ? (
              <img src={formData.imageUrl} alt="Preview" className="img-preview" />
            ) : (
              <div className="img-placeholder">
                <ImagePlus size={48} strokeWidth={1.5} />
                <p>{t('create_post.img_placeholder')}</p>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
              accept="image/*"
            />
          </div>

          <div className="input-section">
            {error && (
              <div className="form-error-banner" style={{ marginBottom: '15px' }}>
                {error}
              </div>
            )}
            <div className="form-group-modern">
              <label>{t('create_post.label_caption')}</label>
              <textarea
                name="caption"
                value={formData.caption}
                onChange={handleCaptionChange}
                rows={4}
                required
              />
            </div>

            <button
              type="submit"
              className="publish-btn-premium"
              disabled={creatingPost || uploading || !formData.imageUrl}
            >
              {creatingPost ? (
                t('create_post.sharing')
              ) : (
                <>
                  <span>{t('create_post.publish')}</span>
                  <Send size={18} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;
