import React, { useState } from "react";
import "./Postcard.css";
import type { Post } from "../models/post";
import usePost from "../hooks/usePost";
import { useNavigate } from "react-router-dom";
import { Heart, MessageCircle, Send } from "lucide-react";
import { useTranslation } from "react-i18next";

import SharePostModal from "./SharePostModal";
import PostDetailModal from "./PostDetailModal";

const Postcard: React.FC<{ post: Post }> = ({ post: postProp }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { post, likePost, likeComment, addComment, loadingComment, error } = usePost(postProp);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

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
      <div className="post-header cursor-pointer" onClick={handleProfileClick}>
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
        <div className="post-image-container cursor-pointer" onClick={() => setShowDetailModal(true)}>
          <img
            src={post.imageUrl}
            alt="Post content"
            className="post-image"
          />
        </div>
      )}

      <div className="post-content">
        <div className="post-actions">
          <div className="main-actions">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                likePost();
              }} 
              className="like-button" 
              title={t('postcard.like_post')}
            >
              <Heart size={24} className={postLiked ? "liked" : ""} fill={postLiked ? "currentColor" : "none"} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDetailModal(true);
              }}
              className="comment-button"
            >
              <MessageCircle size={24} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowShareModal(true);
              }}
              className="share-btn-action"
              title={t('postcard.share')}
            >
              <Send size={24} />
            </button>
          </div>
        </div>

        <div className="post-likes-count">
            {post.likes?.length || 0} {t('postcard.likes')}
        </div>

        <div className="post-caption">
            <span className="author-name-inline">{post.usuario?.nombre}</span>{" "}
            {post.caption}
        </div>


        {error && <p className="error-message error-text">{error}</p>}
      </div>

      {showShareModal && (
        <SharePostModal 
          postId={post._id} 
          onClose={() => setShowShareModal(false)} 
        />
      )}

      {showDetailModal && (
          <PostDetailModal 
            post={post}
            currentUserId={currentUserId}
            onClose={() => setShowDetailModal(false)}
            onLike={likePost}
            onLikeComment={likeComment}
            onAddComment={addComment}
            loadingComment={loadingComment}
            onShare={() => setShowShareModal(true)}
          />
      )}
    </div>
  );
};

export default Postcard;