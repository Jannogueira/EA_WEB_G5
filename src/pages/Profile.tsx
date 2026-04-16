import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Profile.css";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import PostService from "../services/post.service";
import { getFollowers, getFollowing, getUsers, toggleFollow } from "../services/usuario.service";
import Postcard from "../components/Postcard";
import type { Post } from "../models/post";
import useUser from "../hooks/useUser";
import type { Usuario } from "../models/usuario";
import { X, Heart, MessageCircle, FolderOpen, UserPlus, UserMinus } from "lucide-react";

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
        let targetUser: Usuario | null = null;
        let targetId = id;

        if (isOwnProfile && currentUser) {
          targetUser = currentUser;
          targetId = currentUser._id;
        } else if (id) {
          const userRes = await getUsers();
          targetUser = userRes.data.find((u: Usuario) => u._id === id) || null;
        }

        setProfileUser(targetUser);

        if (targetId) {
          // Fetch Posts
          const { request } = PostService.getPostsByUserId(targetId);
          const res = await request;
          setPosts(res.data);

          // Fetch Follow Data
          try {
            const [followersRes, followingRes] = await Promise.all([
              getFollowers(targetId),
              getFollowing(targetId)
            ]);
            
            const followers = followersRes.data.seguidores || [];
            const following = followingRes.data.seguidos || [];
            
            setFollowersCount(followers.length);
            setFollowingCount(following.length);

            // Check if current user is following this profile
            if (currentUser) {
              const amIFollowing = followers.some((f: any) => 
                (typeof f === 'string' ? f : f._id) === currentUser._id
              );
              setIsFollowing(amIFollowing);
            }
          } catch (followErr) {
            console.error("Error fetching follow data:", followErr);
          }
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [id, currentUser, isOwnProfile]);

  const handleToggleFollow = async () => {
    if (!profileUser || !currentUser) return;
    
    try {
      await toggleFollow(profileUser._id);
      setIsFollowing(!isFollowing);
      setFollowersCount(prev => isFollowing ? prev - 1 : prev + 1);
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  };

  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
  };

  if (loading && !profileUser) return <div className="state-message">Cargando perfil...</div>;
  if (!profileUser && !loading) return <div className="state-message">Usuario no encontrado</div>;

  return (
    <div className="profile-wrapper">
      <Navbar usuario={currentUser || undefined} />

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
                      {profileUser?.nombre ? profileUser.nombre.charAt(0).toUpperCase() : "?"}
                    </div>
                  </div>
                </div>

                <div className="profile-info-main">
                  <div className="username-row">
                    <h2 className="profile-display-name">{profileUser?.nombre}</h2>
                    
                    {isOwnProfile ? (
                      <button 
                        className="edit-profile-btn-premium"
                        onClick={() => navigate('/profile/edit')}
                      >
                        Editar Perfil
                      </button>
                    ) : (
                      <button 
                        className={`follow-btn-premium ${isFollowing ? 'following' : ''}`}
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
                      <span className="stat-num">{posts.length}</span> publicaciones
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
                      <p className="bio-description">{profileUser.descripcion}</p>
                    )}
                    <p className="bio-contact">{profileUser?.email}</p>
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
                        <span className="stat-item"><Heart size={18} fill="white" /> {post.likes?.length || 0}</span>
                        <span className="stat-item"><MessageCircle size={18} fill="white" /> {post.comments?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <span className="empty-icon"><FolderOpen size={48} /></span>
                <h3>Aún no hay publicaciones</h3>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedPost && (
        <div className="post-modal-overlay" onClick={() => setSelectedPost(null)}>
          <div className="post-modal-container" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-x" onClick={() => setSelectedPost(null)}><X size={24} /></button>
            <Postcard post={selectedPost} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;