import React, { useState } from "react";
import "./Postcard.css";
import type { Post } from "../models/post";

const Postcard: React.FC<{ post: Post }> = ({ post }) => {
  const [likes, setLikes] = useState(post.likes);
  const [showComments, setShowComments] = useState(false); // Estat per mostrar/amagar

  const userAvatar = post.usuario.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${post.usuario.nombre}`;

  return (
    <div className="post-card">
      <div className="post-header">
        <img src={userAvatar} alt={post.usuario.nombre} className="author-avatar" />
        <div className="author-info">
          <h3 className="author-name">{post.usuario.nombre}</h3>
          {post.usuario.universidad && <span className="author-uni">{post.usuario.universidad.nombre}</span>}
        </div>
      </div>

      {post.imageUrl && (
        <div className="post-image-container">
          <img src={post.imageUrl} alt="Post" className="post-image" />
        </div>
      )}

      <div className="post-content">
        <div className="post-actions">
          <button onClick={() => setLikes(likes + 1)} className="like-button">
            ❤️ {likes}
          </button>
          {/* Al clicar el botó de comentaris, canviem l'estat */}
          <button className="comment-button" onClick={() => setShowComments(!showComments)}>
            💬 {post.comments.length}
          </button>
        </div>

        <div className="post-caption">
          <strong>{post.usuario.nombre}</strong> {post.caption}
        </div>

        {/* NOMÉS es mostren si l'estat showComments és true */}
        {showComments && post.comments.length > 0 && (
          <div className="post-comments">
            {post.comments.map((comment) => (
              <p key={comment._id} className="comment-item">
                <strong>{comment.usuario.nombre}</strong> {comment.texto}
              </p>
            ))}
          </div>
        )}
        
        {/* L'input també el podem amagar o deixar-lo sempre visible */}
        {showComments && (
          <div className="comment-input-area">
            <input type="text" placeholder="Escriu un comentari..." />
          </div>
        )}
      </div>
    </div>
  );
};

export default Postcard;