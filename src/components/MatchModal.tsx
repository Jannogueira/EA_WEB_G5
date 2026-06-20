import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './MatchModal.css';
import { useTranslation } from "react-i18next";

interface MatchUser {
    _id: string;
    nombre: string;
    avatarUrl?: string;
    unimatchPhoto?: string;
}

interface Props {
    matchedUser: MatchUser;
    myPhoto: string;
    onClose: () => void;
}

const MatchModal: React.FC<Props> = ({ matchedUser, myPhoto, onClose }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        // Simple confetti effect using canvas
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const colors = ['#ff6b6b', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43'];

        interface Particle {
            x: number;
            y: number;
            vx: number;
            vy: number;
            color: string;
            size: number;
            rotation: number;
            rotationSpeed: number;
            opacity: number;
        }

        const particles: Particle[] = [];

        for (let i = 0; i < 150; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: -Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 6,
                vy: Math.random() * 4 + 2,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 8 + 4,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 10,
                opacity: 1
            });
        }

        let animationId: number;

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            let activeParticles = 0;

            for (const p of particles) {
                if (p.opacity <= 0) continue;
                activeParticles++;

                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.05; // gravity
                p.rotation += p.rotationSpeed;

                if (p.y > canvas.height) {
                    p.opacity -= 0.02;
                }

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate((p.rotation * Math.PI) / 180);
                ctx.globalAlpha = p.opacity;
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
                ctx.restore();
            }

            if (activeParticles > 0) {
                animationId = requestAnimationFrame(animate);
            }
        };

        animate();

        return () => {
            cancelAnimationFrame(animationId);
        };
    }, []);

    const theirPhoto = matchedUser.unimatchPhoto || matchedUser.avatarUrl || '';

    return (
        <>
            <canvas ref={canvasRef} className="match-canvas" />
            <div className="match-overlay" onClick={onClose}>
                <div className="match-content" onClick={e => e.stopPropagation()}>
                    <h1 className="match-title">{t('unimatch_modal.title')} 🎉</h1>

                    <div className="match-photos">
                        <div className="match-photo-container">
                            <img src={myPhoto} alt={t('unimatch_modal.alt_me')} className="match-photo my-photo" />
                        </div>
                        <span className="match-heart">❤️</span>
                        <div className="match-photo-container">
                            <img src={theirPhoto} alt={t('unimatch_modal.alt_them', { name: matchedUser.nombre })} className="match-photo their-photo" />
                            <div className="match-name">{matchedUser.nombre}</div>
                        </div>
                    </div>

                    <p className="match-subtitle">
                        {t('unimatch_modal.subtitle')}
                    </p>

                    <div className="match-actions">
                        <button
                            className="match-btn primary"
                            onClick={() => {
                                onClose();
                                navigate('/messages');
                            }}
                        >
                            💬 {t('unimatch_modal.send_message')}
                        </button>
                        <button className="match-btn secondary" onClick={onClose}>
                            {t('unimatch_modal.continue')}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default MatchModal;