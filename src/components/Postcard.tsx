import React, { useState } from "react";
import "./Postcard.css";
import type { Post } from "../models/post";
import usePost from "../hooks/usePost";
import { Heart, MessageCircle, SendHorizonal } from "lucide-react";

const Postcard: React.FC<{ post: Post }> = ({ post: postProp }) => {
  const { post, likePost, addComment, loadingComment } = usePost(postProp);

  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");

  const userAvatar = post.usuario?.avatarUrl;

  return (
    <div className="post-card">
      <div className="post-header">
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
          <button onClick={likePost} className="like-button">
            <Heart size={20} className={post.likes?.length ? "liked" : ""} />
            <span>{post.likes?.length || 0}</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="comment-button"
          >
            <MessageCircle size={20} />
            <span>{post.comments?.length || 0}</span>
          </button>
        </div>

        {showComments && (
          <div className="post-comments">
            {post.comments?.map((c) => (
              <p key={c._id} className="comment-item">
                <strong>
                  {typeof c.usuario === "object"
                    ? c.usuario.nombre
                    : "Usuario"}
                </strong>{" "}
                {c.texto}
              </p>
            ))}

            <div className="comment-input-area">
              <input
                type="text"
                value={commentText}
                placeholder="Escribe un comentario..."
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
                title="Enviar comentario"
              >
                {loadingComment ? "..." : <SendHorizonal size={18} />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Postcard;