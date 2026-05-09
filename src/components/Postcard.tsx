import React, { useState } from "react";
import "./Postcard.css";
import type { Post } from "../models/post";
import usePost from "../hooks/usePost";
import { useNavigate } from "react-router-dom";
import { Heart, MessageCircle, Send } from "lucide-react";
import { useTranslation } from "react-i18next";

const Postcard: React.FC<{ post: Post }> = ({ post: postProp }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { post, likePost, likeComment, addComment, loadingComment, error } = usePost(postProp);

  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");

  const currentUserId = (() => {
    try {
      const u = localStorage.getItem("usuario");
      if (!u) return null;
      const parsed = JSON.parse(u);
      return parsed._id || parsed.id;
    } catch { return null; }
  })();

  const userAvatar = post.usuario?.avatarUrl;

  const handleProfileClick = () => {
    if (post.usuario?._id) {
      navigate(`/profile/${post.usuario._id}`);
    }
  };

  const postLiked = currentUserId && post.likes?.some((u: any) => (u._id || u) === currentUserId);

  return (
    <div className="post-card">
      <div className="post-header" onClick={handleProfileClick} style={{ cursor: "pointer" }}>
        <img
          src={userAvatar}
          alt={post.usuario?.nombre || "Usuario"}
          className="author-avatar"
        />

        <div className="author-info">
          <h3 className="author-name">
            {post.usuario?.nombre || "Usuario"}
          </h3>
        </div>
      </div>

      {post.imageUrl && (
        <div className="post-image-container">
          <img
            src={post.imageUrl}
            alt="Post content"
            className="post-image"
          />
        </div>
      )}

      <div className="post-caption">
        <strong>{post.usuario?.nombre || "Usuario"}</strong>{" "}
        {post.caption}
      </div>

      <div className="post-content">
        <div className="post-actions">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              likePost();
            }} 
            className="like-button" 
            title={t('postcard.like_post')}
          >
            <Heart size={22} className={postLiked ? "liked" : ""} />
            <span>{post.likes?.length || 0}</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowComments(!showComments);
            }}
            className="comment-button"
          >
            <MessageCircle size={20} />
            <span>{post.comments?.length || 0}</span>
          </button>
        </div>

        {error && <p className="error-message" style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '5px' }}>{error}</p>}

        {showComments && (
          <div className="post-comments">
            {post.comments?.map((c) => {
              const isCommentLiked = currentUserId && c.likes?.some((id: any) => (id._id || id) === currentUserId);
              return (
                <div key={c._id} className="comment-item-row">
                  <p className="comment-item">
                    <strong>
                      {typeof c.usuario === "object"
                        ? c.usuario.nombre
                        : "Usuario"}
                    </strong>{" "}
                    {c.texto}
                  </p>
                  <button 
                    className={`comment-like-btn ${isCommentLiked ? 'liked' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      likeComment(c._id);
                    }}
                    title={t('postcard.like_comment')}
                  >
                    <Heart size={14} className={isCommentLiked ? "liked" : ""} />
                    {c.likes && c.likes.length > 0 && <span>{c.likes.length}</span>}
                  </button>
                </div>
              );
            })}

            <div className="comment-input-area" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={commentText}
                placeholder={t('postcard.comment_placeholder')}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addComment(commentText);
                    setCommentText("");
                  }
                }}
              />

              <button
                onClick={() => {
                  addComment(commentText);
                  setCommentText("");
                }}
                disabled={loadingComment || !commentText.trim()}
                className="send-comment-btn"
                title={t('postcard.send_comment')}
              >
                {loadingComment ? "..." : <Send size={18} />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Postcard;