import React, { useState } from "react";
import "./CreatePostModal.css";
import useCreatePost from "../hooks/useCreatePost";

import { ImagePlus, Send, X } from "lucide-react";

interface CreatePostModalProps {
  onClose: () => void;
  onPostCreated: () => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ onClose, onPostCreated }) => {
  const { createPost, loading } = useCreatePost();

  const [formData, setFormData] = useState({
    imageUrl: "",
    caption: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createPost(formData);

      onPostCreated();
      onClose();
    } catch {
      alert("Error al crear la publicación.");
    }
  };

  return (
    <div className="create-modal-overlay" onClick={onClose}>
      <div className="create-modal-content" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header-modern">
          <h2>Nueva Publicación</h2>
          <button className="close-x-btn" aria-label="Cerrar" onClick={onClose}>
            <X size={20} />
          </button>
        </header>

        <form className="create-post-form" onSubmit={handleSubmit}>
          <div className="preview-container">
            {formData.imageUrl ? (
              <img src={formData.imageUrl} alt="Preview" className="img-preview" />
            ) : (
              <div className="img-placeholder">
                <ImagePlus size={48} strokeWidth={1.5} />
                <p>La vista previa de tu imagen aparecerá aquí</p>
              </div>
            )}
          </div>

          <div className="input-section">
            <div className="form-group-modern">
              <label>URL de la imagen</label>
              <input 
                type="text" 
                name="imageUrl" 
                value={formData.imageUrl} 
                onChange={handleChange}
                required 
              />
            </div>

            <div className="form-group-modern">
              <label>Pie de foto</label>
              <textarea 
                name="caption" 
                value={formData.caption} 
                onChange={handleChange}
                rows={4}
                required
              />
            </div>

            <button 
              type="submit" 
              className="publish-btn-premium"
              disabled={loading || !formData.imageUrl}
            >
              {loading ? "Compartiendo..." : (
                <>
                  <span>Publicar</span>
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