import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Profile.css";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import PostService from "../services/post";
import {
  getFollowers,
  getFollowing,
  getUserById,
  toggleFollow
} from "../services/usuario";
import Postcard from "../components/Postcard";
import type { Post } from "../models/post";
import useUser from "../hooks/useUser";
import type { Usuario } from "../models/usuario";
import {
  X,
  Heart,
  MessageCircle,
  FolderOpen,
  UserPlus,
  UserMinus
} from "lucide-react";

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { usuario: currentUser } = useUser();

  const [profileUser, setProfileUser] = useState<Usuario | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);

  const isOwnProfile = !id || id === currentUser?._id;

  useEffect(() => {
  const fetchProfileData = async () => {
    setLoading(true);

    try {
      if (!id && !currentUser?._id) return;

      const targetId = id || currentUser._id;
      const res = await getUserById(targetId);
      const targetUser = res.data;

      setProfileUser(targetUser);

      // Cargar posts
      const { request } = PostService.getPostsByUserId(targetId);
      const postsRes = await request;
      setPosts(postsRes.data.docs || []);

      // Cargar followers/following
      const [followersRes, followingRes] = await Promise.all([
        getFollowers(targetId),
        getFollowing(targetId)
      ]);

      setFollowersCount(followersRes.data.seguidores?.length || 0);
      setFollowingCount(followingRes.data.seguidos?.length || 0);

      // Saber si sigues al usuario
      if (currentUser) {
        const amIFollowing = (followersRes.data.seguidores || []).some(
          (f: any) => (typeof f === "string" ? f : f._id) === currentUser._id
        );
        setIsFollowing(amIFollowing);
      }

    } catch (error) {
      console.error("Error profile:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchProfileData();
}, [id, currentUser]);

  const handleToggleFollow = async () => {
    if (!profileUser || !currentUser) return;

    try {
      await toggleFollow(profileUser._id);
      setIsFollowing(!isFollowing);
      setFollowersCount((prev) => (isFollowing ? prev - 1 : prev + 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
  };

  if (loading && !profileUser)
    return <div className="state-message">Cargando perfil...</div>;

  if (!profileUser)
    return <div className="state-message">Usuario no encontrado</div>;

  // 🔥 helper para mostrar nombre o fallback
  const getName = (obj: any) =>
    typeof obj === "string" ? obj : obj?.nombre;

  return (
    <div className="profile-wrapper">
      <Navbar usuario={currentUser || undefined} />

      <div className="main-layout">
        <Sidebar aria-label="Navegación principal" />

        <div className="content-area">
          <main className="profile-univy-container">
            <header className="univy-profile-header">
              <div className="header-top">

                <div className="profile-avatar-wrapper">
                  <div className="avatar-gradient-border">
                    <div className="profile-avatar-xl">
                      {profileUser?.nombre?.charAt(0).toUpperCase() || "?"}
                    </div>
                  </div>
                </div>

                <div className="profile-info-main">

                  <div className="username-row">
                    <h2 className="profile-display-name">
                      {profileUser?.nombre}
                    </h2>

                    {isOwnProfile ? (
                      <button
                        className="edit-profile-btn-premium"
                        onClick={() => navigate("/profile/edit")}
                      >
                        Editar Perfil
                      </button>
                    ) : (
                      <button
                        className={`follow-btn-premium ${
                          isFollowing ? "following" : ""
                        }`}
                        onClick={handleToggleFollow}
                      >
                        {isFollowing ? (
                          <>
                            <UserMinus size={18} /> Dejar de seguir
                          </>
                        ) : (
                          <>
                            <UserPlus size={18} /> Seguir
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  <div className="profile-social-stats">
                    <div className="social-stat">
                      <span className="stat-num">{posts.length}</span> posts
                    </div>
                    <div className="social-stat">
                      <span className="stat-num">{followersCount}</span> seguidores
                    </div>
                    <div className="social-stat">
                      <span className="stat-num">{followingCount}</span> seguidos
                    </div>
                  </div>

                  <div className="user-bio-univy">
                    <p className="full-name-label">{profileUser?.nombre}</p>

                    {profileUser?.descripcion && (
                      <p className="bio-description">
                        {profileUser.descripcion}
                      </p>
                    )}

                    <p className="bio-contact">{profileUser?.email}</p>

                    {/* 🧠 ACADEMIC INFO FIXED */}
                    {(profileUser?.universidad ||
                      profileUser?.grado ||
                      profileUser?.asignaturas?.length) && (
                      <div className="academic-info-univy">

                        <div className="academic-item">
                          <span className="academic-label">Universidad</span>
                          <span className="academic-value">
                            {getName(profileUser.universidad)}
                          </span>
                        </div>

                        <div className="academic-item">
                          <span className="academic-label">Grado</span>
                          <span className="academic-value">
                            {getName(profileUser.grado)}
                          </span>
                        </div>

                        {profileUser.asignaturas?.length > 0 && (
                          <div className="academic-item">
                            <span className="academic-label">Asignaturas</span>

                            <div className="academic-tags">
                              {profileUser.asignaturas.map((a: any) => (
                                <span key={a._id || a} className="academic-tag">
                                  {getName(a)}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                      </div>
                    )}

                  </div>
                </div>
              </div>
            </header>

            <div className="posts-section-divider">
              <h3 className="section-title-modern">PUBLICACIONES</h3>
              <div className="active-line"></div>
            </div>

            {loading ? (
              <div className="state-message">Cargando...</div>
            ) : posts.length > 0 ? (
              <div className="univy-posts-grid">
                {posts.map((post) => (
                  <div
                    key={post._id}
                    className="univy-grid-item"
                    onClick={() => handlePostClick(post)}
                  >
                    <img
                      src={post.imageUrl}
                      className="univy-grid-img"
                    />
                    <div className="univy-grid-hover">
                      <div className="hover-stats">
                        <span>
                          <Heart size={18} /> {post.likes?.length || 0}
                        </span>
                        <span>
                          <MessageCircle size={18} /> {post.comments?.length || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <FolderOpen size={48} />
                <h3>Sin publicaciones</h3>
              </div>
            )}
          </main>
        </div>
      </div>

      {selectedPost && (
        <div
          className="post-modal-overlay"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="post-modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close-x"
              onClick={() => setSelectedPost(null)}
            >
              <X size={24} />
            </button>
            <Postcard post={selectedPost} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;