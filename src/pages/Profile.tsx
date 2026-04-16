import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Profile.css";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import PostService from "../services/post.service";
import type { Post } from "../models/post";
import useUser from "../hooks/useUser";
import { getUsers } from "../services/usuario.service";
import type { Usuario } from "../models/usuario";

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { usuario } = useUser();

  const [profileUser, setProfileUser] = useState<Usuario | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const isOwnProfile = !id || id === usuario?._id;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // 👤 MY PROFILE
        if (isOwnProfile && usuario) {
          setProfileUser(usuario);

          const { request } = PostService.getPostsByUserId(usuario._id);
          const res = await request;
          setPosts(res.data);
        }

        // 👤 OTHER USER PROFILE
        else if (id) {
          const userRes = await getUsers(); // better: getUserById (see note below)
          const foundUser = userRes.data.find((u: Usuario) => u._id === id);

          setProfileUser(foundUser || null);

          const { request } = PostService.getPostsByUserId(id);
          const res = await request;
          setPosts(res.data);
        }

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, usuario]);

  if (!profileUser) return <p>Cargando perfil...</p>;

  return (
    <div className="profile-wrapper">
      <Navbar usuario={usuario || undefined} />

      <div className="main-layout">
        <Sidebar />

        <div className="content-area">
          <main className="profile-univy-container">

            {/* HEADER */}
            <header className="univy-profile-header">
              <div className="header-top">

                <div className="avatar-gradient-border">
                  <div className="profile-avatar-xl">
                    {profileUser.nombre?.charAt(0).toUpperCase() || "?"}
                  </div>
                </div>

                <div className="profile-info-main">

                  <div className="username-row">
                    <h1 className="profile-display-name">
                      {profileUser.nombre}
                    </h1>

                    {isOwnProfile && (
                      <button
                        className="edit-profile-btn-premium"
                        onClick={() => navigate("/profile/edit")}
                      >
                        Editar perfil
                      </button>
                    )}
                  </div>

                  <div className="profile-social-stats">
                    <div>
                      <span className="stat-num">{posts.length}</span> posts
                    </div>
                  </div>

                  <div className="user-bio-univy">
                    <p className="full-name-label">{profileUser.nombre}</p>

                    {profileUser.descripcion && (
                      <p className="bio-description">
                        {profileUser.descripcion}
                      </p>
                    )}

                    <p className="bio-contact">{profileUser.email}</p>
                  </div>

                </div>
              </div>
            </header>

            {/* POSTS */}
            {loading ? (
              <div className="state-message">Cargando publicaciones...</div>
            ) : posts.length > 0 ? (
              <div className="univy-posts-grid">
                {posts.map((post) => (
                  <div key={post._id} className="univy-grid-item">
                    <img src={post.imageUrl} className="univy-grid-img" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">No posts yet</div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
};

export default Profile;