import React, { useState, useEffect } from "react";
import "./Postcard.css";
import type { Post } from "../models/post";
import CommentService from "../services/comment.service";
import PostService from "../services/post.service";

import { Heart, MessageCircle, SendHorizonal } from "lucide-react";

const Postcard: React.FC<{ post: Post }> = ({ post }) => {
  const [currentPost, setCurrentPost] = useState<Post>({
    ...post,
    comments: post.comments ?? [],
    likes: post.likes ?? [],
  });

  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [loadingComment, setLoadingComment] = useState(false);

  useEffect(() => {
    setCurrentPost({
      ...post,
      comments: post.comments ?? [],
      likes: post.likes ?? [],
    });
  }, [post]);

  const userAvatar =
    currentPost.usuario?.avatarUrl || "default-avatar-url.png";

  const handleLike = async () => {
    try {
      const response = await PostService.darleLike(currentPost._id);

      setCurrentPost((prev) => ({
        ...prev,
        likes: response.data.likes,
      }));
    } catch (err) {
      console.error("Error liking the post", err);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    try {
      setLoadingComment(true);
      //const user = JSON.parse(localStorage.getItem("usuario") || "{}");

      const response = await CommentService.create({
        //usuario: user._id,
        post: currentPost._id,
        texto: commentText,
      });

      setCurrentPost((prev) => ({
        ...prev,
        comments: [...(prev.comments || []), response.data],
      }));

      setCommentText("");
    } catch (err) {
      console.error("Error creating comment", err);
    } finally {
      setLoadingComment(false);
    }
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <img
          src={userAvatar}
          alt={currentPost.usuario?.nombre || "Usuario"}
          className="author-avatar"
        />

        <div className="author-info">
          <h3 className="author-name">
            {currentPost.usuario?.nombre || "Usuario"}
          </h3>
        </div>
      </div>

      {currentPost.imageUrl && (
        <div className="post-image-container">
          <img
            src={currentPost.imageUrl}
            alt="Post content"
            className="post-image"
          />
        </div>
      )}

      <div className="post-content">
        <div className="post-actions">
          <button onClick={handleLike} className="like-button">
            <Heart size={20} className={currentPost.likes?.length ? "liked" : ""} />
            <span>{currentPost.likes?.length || 0}</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="comment-button"
          >
            <MessageCircle size={20} />
            <span>{currentPost.comments?.length || 0}</span>
          </button>
        </div>

        <div className="post-caption">
          <strong>{currentPost.usuario?.nombre || "Usuario"}</strong>{" "}
          {currentPost.caption}
        </div>

        {showComments && (
          <div className="post-comments">
            {currentPost.comments?.map((c) => (
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
                onKeyDown={(e) =>
                  e.key === "Enter" && handleAddComment()
                }
              />

              <button 
                onClick={handleAddComment} 
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