import React, { useState, useRef } from 'react';
import { Plus, X } from 'lucide-react';
import { uploadUnimatchPhoto, acceptUnimatchTerms } from '../services/unimatch';
import './UniMatchWelcomeModal.css';

interface Props {
    onComplete: () => void;
}

interface PreviewPhoto {
    file: File;
    preview: string;
}

const UniMatchWelcomeModal: React.FC<Props> = ({ onComplete }) => {
    const [photos, setPhotos] = useState<PreviewPhoto[]>([]);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newPhotos: PreviewPhoto[] = [];
        for (let i = 0; i < files.length && photos.length + newPhotos.length < 6; i++) {
            const file = files[i];
            newPhotos.push({
                file,
                preview: URL.createObjectURL(file)
            });
        }

        setPhotos(prev => [...prev, ...newPhotos]);
        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removePhoto = (index: number) => {
        setPhotos(prev => {
            const updated = [...prev];
            URL.revokeObjectURL(updated[index].preview);
            updated.splice(index, 1);
            return updated;
        });
    };

    const handleSubmit = async () => {
        if (photos.length === 0) return;

        setUploading(true);
        try {
            // Subir todas las fotos
            for (const photo of photos) {
                await uploadUnimatchPhoto(photo.file);
            }

            // Aceptar términos
            await acceptUnimatchTerms();

            // Actualizar localStorage
            const userJson = localStorage.getItem('usuario');
            if (userJson) {
                const user = JSON.parse(userJson);
                user.hasAcceptedUnimatchTerms = true;
                localStorage.setItem('usuario', JSON.stringify(user));
            }

            onComplete();
        } catch (err) {
            console.error('Error setting up UniMatch:', err);
        } finally {
            setUploading(false);
        }
    };

    const emptySlots = Math.max(0, 3 - photos.length);

    return (
        <div className="welcome-modal-overlay">
            <div className="welcome-modal">
                <div className="welcome-icon">🔥</div>
                <h2>Bienvenido a UniMatch</h2>
                <p>
                    Conecta con estudiantes de tu universidad y descubre 
                    personas con intereses similares.
                </p>

                <div className="welcome-privacy-notice">
                    <span className="privacy-icon">🔒</span>
                    <span>
                        Tus fotos de este modo serán visibles para otros usuarios de UniMatch. 
                        Nadie sabrá si les diste ❌ o ❤️ a menos que sea un Match mutuo.
                    </span>
                </div>

                <div className="welcome-photo-section">
                    <h4>Sube al menos 1 foto para empezar</h4>
                    <div className="photo-upload-grid">
                        {photos.map((photo, index) => (
                            <div key={index} className="photo-upload-slot has-photo">
                                <img src={photo.preview} alt={`Foto ${index + 1}`} />
                                <button 
                                    className="remove-photo-btn"
                                    onClick={() => removePhoto(index)}
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                        {Array.from({ length: emptySlots }).map((_, index) => (
                            <div
                                key={`empty-${index}`}
                                className="photo-upload-slot"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Plus size={24} className="add-icon" />
                            </div>
                        ))}
                    </div>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                />

                <button
                    className="welcome-btn"
                    onClick={handleSubmit}
                    disabled={photos.length === 0 || uploading}
                >
                    {uploading ? (
                        <span className="welcome-loading">
                            <span className="welcome-spinner" />
                            Subiendo fotos...
                        </span>
                    ) : (
                        `Empezar a descubrir 🚀`
                    )}
                </button>
            </div>
        </div>
    );
};

export default UniMatchWelcomeModal;
