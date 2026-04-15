import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import PostService from "../services/post.service";
import Postcard from "../components/Postcard";
import type { Post } from "../models/post";
import type { Usuario } from "../models/usuario";

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<Usuario | undefined>(undefined);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  useEffect(() => {
    const userJson = localStorage.getItem('usuario');
    if (userJson) {
      const user = JSON.parse(userJson);
      setUsuario(user);
      const userId = user._id || user.id;
      if (userId) fetchUserPosts(userId);
    }
  }, []);

  const fetchUserPosts = async (userId: string) => {
    try {
      console.log("Fetching posts for user ID:", userId);
      const { request } = PostService.getPostsByUserId(userId);
      const response = await request;
      console.log("Posts received:", response.data);
      setPosts(response.data);
    } catch (error) {
      console.error("Error fetching user posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
  };

  return (
    <div className="profile-wrapper">
      <Navbar usuario={usuario} />

      <div className="main-layout">
        <Sidebar aria-label="Navegación principal" />

        <div className="content-area">
          <main className="profile-univy-container">
            {/* Header: Univy Signature Style */}
            <header className="univy-profile-header">
              <div className="header-top">
                <div className="profile-avatar-wrapper">
                    <div className="avatar-gradient-border">
                        <div className="profile-avatar-xl">
                            {usuario?.nombre ? usuario.nombre.charAt(0).toUpperCase() : "?"}
                        </div>
                    </div>
                </div>

                <div className="profile-info-main">
                  <div className="username-row">
                    <h2 className="profile-display-name">{usuario?.nombre || "Cargando..."}</h2>
                    <button 
                      className="edit-profile-btn-premium"
                      onClick={() => navigate('/profile/edit')}
                    >
                      Editar Perfil
                    </button>
                  </div>

                  <div className="profile-social-stats">
                    <div className="social-stat">
                      <span className="stat-num">{posts.length}</span> publicaciones
                    </div>
                    <div className="social-stat">
                      <span className="stat-num">482</span> seguidores
                    </div>
                    <div className="social-stat">
                      <span className="stat-num">156</span> seguidos
                    </div>
                  </div>

                  <div className="user-bio-univy">
                    <span className="full-name-label">{usuario?.nombre}</span>
                    <p className="bio-description">
                      Estudiante en Univy | Apasionado por la tecnología 🚀
                    </p>
                    {usuario?.email && <p className="bio-contact">{usuario.email}</p>}
                  </div>
                </div>
              </div>
            </header>

            {/* Posts Heading: Modern Univy Style */}
            <div className="posts-section-divider">
              <h3 className="section-title-modern">PUBLICACIONES</h3>
              <div className="active-line"></div>
            </div>

            {/* Posts Grid: Univy Modern Grid */}
            {loading ? (
              <div className="state-message">Cargando publicaciones...</div>
            ) : posts.length > 0 ? (
              <div className="univy-posts-grid">
                {posts.map((post) => (
                  <div 
                    key={post._id} 
                    className="univy-grid-item"
                    onClick={() => handlePostClick(post)}
                  >
                    <img src={post.imageUrl} alt="Post" className="univy-grid-img" />
                    <div className="univy-grid-hover">
                      <div className="hover-stats">
                        <span>❤️ {post.likes.length}</span>
                        <span>💬 {post.comments.length}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <span className="empty-icon">📂</span>
                <h3>Aún no has compartido nada</h3>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedPost && (
        <div className="post-modal-overlay" onClick={() => setSelectedPost(null)}>
          <div className="post-modal-container" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-x" onClick={() => setSelectedPost(null)}>✕</button>
            <Postcard post={selectedPost} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
