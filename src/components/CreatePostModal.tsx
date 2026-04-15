import React, { useState } from "react";
import "./CreatePostModal.css";
import PostService from "../services/post.service";

interface CreatePostModalProps {
  onClose: () => void;
  onPostCreated: () => void;
  userId: string;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ onClose, onPostCreated, userId }) => {
  const [loading, setLoading] = useState(false);
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
    setLoading(true);

    try {
      await PostService.createPost({
        ...formData,
        usuario: userId
      });
      alert("¡Publicación compartida!");
      onPostCreated();
      onClose();
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Error al crear la publicación.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-modal-overlay" onClick={onClose}>
      <div className="create-modal-content" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header-modern">
          <h2>Nueva Publicación</h2>
          <button className="close-x-btn" onClick={onClose}>✕</button>
        </header>

        <form className="create-post-form" onSubmit={handleSubmit}>
          <div className="preview-container">
            {formData.imageUrl ? (
              <img src={formData.imageUrl} alt="Preview" className="img-preview" />
            ) : (
              <div className="img-placeholder">
                <span>📷</span>
                <p>La vista previa aparecerá aquí</p>
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
                placeholder="https://images.pexels.com/..."
                required 
              />
            </div>

            <div className="form-group-modern">
              <label>Pie de foto (Caption)</label>
              <textarea 
                name="caption" 
                value={formData.caption} 
                onChange={handleChange}
                placeholder="Escribe algo interesante sobre esta foto..."
                rows={4}
                required
              />
            </div>

            <button 
              type="submit" 
              className="publish-btn-premium"
              disabled={loading || !formData.imageUrl}
            >
              {loading ? "Compartiendo..." : "Publicar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;
