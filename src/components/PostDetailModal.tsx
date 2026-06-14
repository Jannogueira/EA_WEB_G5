import React, { useState } from 'react';
import './PostDetailModal.css';
import type { Post } from '../models/post';
import { X, Heart, MessageCircle, Send, MoreHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

interface PostDetailModalProps {
  post: Post;
  currentUserId: string | null;
  onClose: () => void;
  onLike: () => void;
  onLikeComment: (commentId: string) => void;
  onAddComment: (text: string) => void;
  loadingComment: boolean;
  onShare: () => void;
}

const PostDetailModal: React.FC<PostDetailModalProps> = ({
  post,
  currentUserId,
  onClose,
  onLike,
  onLikeComment,
  onAddComment,
  loadingComment,
  onShare,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [commentText, setCommentText] = useState('');

  const postLiked = currentUserId && post.likes?.some((u: any) => (u._id || u) === currentUserId);

  const handleProfileClick = () => {
    if (post.usuario?._id) {
      navigate(`/profile/${post.usuario._id}`);
      onClose();
    }
  };

  const submitComment = () => {
    if (!commentText.trim() || loadingComment) return;
    onAddComment(commentText);
    setCommentText('');
  };

  return (
    <div className="post-detail-overlay" onClick={onClose}>
      <button className="post-detail-close" onClick={onClose}>
        <X size={28} />
      </button>

      <div className="post-detail-content" onClick={(e) => e.stopPropagation()}>
        {/* Lado Izquierdo: Imagen */}
        <div className="post-detail-image-side">
          <img src={post.imageUrl} alt="Post content" />
        </div>

        {/* Lado Derecho: Info y Comentarios */}
        <div className="post-detail-info-side">
          <header className="post-detail-header">
            <div className="post-detail-user" onClick={handleProfileClick}>
              <img src={post.usuario?.avatarUrl} alt="" className="user-avatar-mini" />
              <div className="user-name-wrapper">
                <span className="user-name-bold">{post.usuario?.nombre}</span>
                <span className="user-status-online">En Univy</span>
              </div>
            </div>
            <button className="post-detail-options">
              <MoreHorizontal size={24} />
            </button>
          </header>

          <div className="post-detail-comments-list">
            {/* Caption como primer comentario */}
            <div className="comment-item-row detail-caption">
              <img src={post.usuario?.avatarUrl} alt="" className="user-avatar-tiny" />
              <div className="comment-content">
                <span className="user-name-bold">{post.usuario?.nombre}</span>{' '}
                <span className="comment-text">{post.caption}</span>
              </div>
            </div>

            {/* Lista de comentarios */}
            {post.comments?.map((c) => {
              const isCommentLiked =
                currentUserId && c.likes?.some((id: any) => (id._id || id) === currentUserId);
              const author =
                typeof c.usuario === 'object' ? c.usuario : { nombre: 'Usuario', avatarUrl: '' };

              return (
                <div key={c._id} className="comment-item-row">
                  <img src={author.avatarUrl} alt="" className="user-avatar-tiny" />
                  <div className="comment-content">
                    <div className="comment-main">
                      <span className="user-name-bold">{author.nombre}</span>{' '}
                      <span className="comment-text">{c.texto}</span>
                    </div>
                    <div className="comment-footer">
                      <span>{new Date().toLocaleDateString()}</span>
                      {c.likes && c.likes.length > 0 && (
                        <span className="comment-likes-count">
                          {c.likes.length} {t('postcard.likes')}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    className={`detail-comment-like ${isCommentLiked ? 'liked' : ''}`}
                    onClick={() => onLikeComment(c._id)}
                  >
                    <Heart size={14} fill={isCommentLiked ? 'currentColor' : 'none'} />
                  </button>
                </div>
              );
            })}
          </div>

          <footer className="post-detail-footer">
            <div className="post-detail-actions">
              <div className="detail-main-btns">
                <button
                  onClick={onLike}
                  className={`detail-action-btn ${postLiked ? 'liked' : ''}`}
                >
                  <Heart size={28} fill={postLiked ? 'currentColor' : 'none'} />
                </button>
                <button onClick={onClose} className="detail-action-btn">
                  <MessageCircle size={28} />
                </button>
                <button onClick={onShare} className="detail-action-btn share-accent">
                  <Send size={28} />
                </button>
              </div>
              <div className="detail-likes-info">
                {post.likes?.length || 0} {t('postcard.likes')}
              </div>
            </div>

            <div className="detail-comment-input-container">
              <input
                type="text"
                placeholder={t('postcard.comment_placeholder')}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitComment()}
              />
              <button
                onClick={submitComment}
                disabled={!commentText.trim() || loadingComment}
                className="detail-post-btn"
              >
                {t('create_post.publish')}
              </button>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default PostDetailModal;
