import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import PostService from "../services/post.service";
import Postcard from "../components/Postcard";
import type { Post } from "../models/post";
import useUser from "../hooks/useUser";

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { usuario } = useUser();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  useEffect(() => {
    if (!usuario?._id) return;

    const fetchUserPosts = async () => {
      try {
        const { request } = PostService.getPostsByUserId(usuario._id);
        const response = await request;
        setPosts(response.data);
      } catch (error) {
        console.error("Error fetching user posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, [usuario?._id]);

  return (
    <div className="profile-wrapper">
      <Navbar usuario={usuario || undefined} />

      <div className="main-layout">
        <Sidebar aria-label="Navegación principal" />

        <div className="content-area">
          <main className="profile-univy-container">

            {/* HEADER */}
            <header className="univy-profile-header">
              <div className="header-top">

                <div className="avatar-gradient-border">
                  <div className="profile-avatar-xl">
                    {usuario?.nombre?.charAt(0).toUpperCase() || "?"}
                  </div>
                </div>

                <div className="profile-info-main">

                  <div className="username-row">
                    <h1 className="profile-display-name">
                      {usuario?.nombre || "Cargando..."}
                    </h1>

                    <button
                      className="edit-profile-btn-premium"
                      onClick={() => navigate("/profile/edit")}
                    >
                      Editar perfil
                    </button>
                  </div>

                  <div className="profile-social-stats">
                    <div>
                      <span className="stat-num">{posts.length}</span> posts
                    </div>
                  </div>

                  <div className="user-bio-univy">
                    <p className="full-name-label">{usuario?.nombre}</p>
                    <p className="bio-description">
                      Estudiante universitario en Univy
                    </p>
                    <p className="bio-contact">{usuario?.email}</p>
                  </div>

                </div>
              </div>
            </header>

            {/* POSTS */}
            {loading ? (
              <div className="state-message">
                Cargando publicaciones...
              </div>
            ) : posts.length > 0 ? (
              <div className="univy-posts-grid">
                {posts.map((post) => (
                  <div
                    key={post._id}
                    className="univy-grid-item"
                    onClick={() => setSelectedPost(post)}
                  >
                    <img
                      src={post.imageUrl}
                      className="univy-grid-img"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                No posts yet
              </div>
            )}

          </main>
        </div>
      </div>

      {/* MODAL */}
      {selectedPost && (
        <div
          className="post-modal-overlay"
          onClick={() => setSelectedPost(null)}
        >
          <div className="post-modal-container">
            <button
              className="modal-close-x"
              onClick={() => setSelectedPost(null)}
            >
              ✕
            </button>

            <Postcard post={selectedPost} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;