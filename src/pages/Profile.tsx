import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Profile.css";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import PostService from "../services/post";
import { getFollowers, getFollowing, getUserById, toggleFollow} from "../services/usuario";
import PostDetailModal from "../components/PostDetailModal";
import type { Post } from "../models/post";
import usePost from "../hooks/usePost";
import useUser from "../hooks/useUser";
import type { Usuario } from "../models/usuario";
import { X, Heart, MessageCircle, FolderOpen, UserPlus, UserMinus, NotebookPen, GraduationCap, Clock, Lock, Flame, Plus, Trash2 } from "lucide-react";
import { getMyPhotos, getUserPhotos, uploadUnimatchPhoto, deleteUnimatchPhoto, type UnimatchPhoto } from '../services/unimatch';
import { useTranslation } from "react-i18next";
import Alert from "../components/Alert";
import type { AlertState } from "../components/Alert";
import SharePostModal from "../components/SharePostModal";

const ProfilePostModal: React.FC<{ post: Post; onClose: () => void; currentUserId: string | null }> = ({ post, onClose, currentUserId }) => {
  const { post: p, likePost, likeComment, addComment, loadingComment, toggleSave, isSaved } = usePost(post);
  const [showShareModal, setShowShareModal] = useState(false);
  
  return (
    <>
      <PostDetailModal 
        post={p}
        currentUserId={currentUserId}
        onClose={onClose}
        onLike={likePost}
        onLikeComment={likeComment}
        onAddComment={addComment}
        loadingComment={loadingComment}
        onShare={() => setShowShareModal(true)}
        onToggleSave={toggleSave}
        isSaved={isSaved}
      />
      {showShareModal && (
        <SharePostModal 
          postId={p._id}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </>
  );
};

const Profile: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { usuario: currentUser } = useUser();
  const currentUserId = currentUser?._id;

  const [profileUser, setProfileUser] = useState<Usuario | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const [alert, setAlert] = useState<AlertState | null>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'unimatch'>('posts');
  const [unimatchPhotos, setUnimatchPhotos] = useState<UnimatchPhoto[]>([]);
  const [uploadingUnimatch, setUploadingUnimatch] = useState(false);

  const isOwnProfile = !id || id === currentUser?._id;

  useEffect(() => {
  const fetchProfileData = async () => {
    setLoading(true);

    try {
      if (!id && !currentUser?._id) return;

      const targetId = id || currentUser._id;
      
      // Lanzar todas las peticiones en paralelo para máxima velocidad
      const [userRes, postsResRaw, followersRes, followingRes] = await Promise.all([
        getUserById(targetId),
        PostService.getPostsByUserId(targetId).request,
        getFollowers(targetId),
        getFollowing(targetId)
      ]);

      const targetUser = userRes.data;
      const postsData = postsResRaw.data.docs || [];

      // Sincronizar todos los estados al final para evitar renderizado fragmentado ("bloque por bloque")
      setProfileUser(targetUser);
      setPosts(postsData);
      setFollowersCount(followersRes.data.seguidores?.length || 0);
      setFollowingCount(followingRes.data.seguidos?.length || 0);

      if (targetUser) {
        setIsFollowing(targetUser.followStatus === 'ACCEPTED');
        setIsPending(targetUser.followStatus === 'PENDING');
      }

      if (currentUser && followersRes.data.seguidores) {
        const amIFollowing = followersRes.data.seguidores.some(
          (f: any) => (typeof f === "string" ? f : f._id) === currentUser._id
        );
        setIsFollowing(amIFollowing);
      }

    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        "Error al conectar con el servidor";
        
      setAlert({
        type: 'error',
        title: 'Error',
        message: errorMsg
      });
    } finally {
      setLoading(false);
    }
  };

  fetchProfileData();
}, [id, currentUser]);

  // Manejar apertura de post desde URL (notificaciones)
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const postId = queryParams.get('postId') || queryParams.get('post');
    
    if (postId) {
      const postInList = posts.find(p => p._id === postId);
      if (postInList) {
        setSelectedPost(postInList);
      } else if (!loading) {
        // Carga el post individualmente si no está en la lista de perfil
        PostService.getPostById(postId)
          .then(res => setSelectedPost(res.data))
          .catch(err => console.error("Error al cargar post enlazado:", err));
      }
    }
  }, [posts, loading]);

  const handleToggleFollow = async () => {
    if (!profileUser || !currentUser) return;

    try {
      const res = await toggleFollow(profileUser._id);
      const newStatus = res.data.status;
      
      setIsFollowing(newStatus === 'ACCEPTED');
      setIsPending(newStatus === 'PENDING');

      if (newStatus === 'ACCEPTED') setFollowersCount(prev => prev + 1);
      else if (!newStatus) setFollowersCount(prev => isFollowing ? prev - 1 : prev);
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        "Error al conectar con el servidor";

      setAlert({
        type: 'error',
        title: 'Acción no completada',
        message: errorMsg
      });
    }
  };

  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
  };

  const getName = (obj: any) =>
    typeof obj === "string" ? obj : obj?.nombre;

  const isRestricted = profileUser?.privado && !isOwnProfile && !isFollowing;

  if (loading && !profileUser) return <div className="state-message">{t('profile.loading')}</div>;
  if (!profileUser && !loading) return <div className="state-message">{t('profile.not_found')}</div>;

  return (
    <div className="profile-wrapper">
      {alert && (
        <Alert
        type={alert.type}
        title={alert.title}
        message={alert.message}
        onClose={() => setAlert(null)}
        />
      )}
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
                      {profileUser?.avatarUrl ? (
                        <img src={profileUser.avatarUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                      ) : (
                        profileUser?.nombre?.charAt(0).toUpperCase() || "?"
                      )}
                    </div>
                  </div>
                </div>

                <div className="profile-info-main">

                  <div className="username-row">
                    <h2 className="profile-display-name">
                      {profileUser?.nombre}
                      {profileUser?.privado && (
                        <span className="private-badge">
                          <Lock size={14} />
                          {t('edit_profile.label_privacy')}
                        </span>
                      )}
                    </h2>

                    {isOwnProfile ? (
                      <button
                        className="edit-prf-btn-premium"
                        onClick={() => navigate("/profile/edit")}
                      >
                        {t('profile.edit_btn')}
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
                            <UserMinus size={18} /> {t('profile.unfollow')}
                          </>
                        ) : isPending ? (
                          <>
                            <Clock size={18} /> {t('profile.pending')}
                          </>
                        ) : (
                          <>
                            <UserPlus size={18} /> {t('profile.follow')}
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  <div className="profile-social-stats">
                    <div className="social-stat">
                      <span className="stat-num">{posts.length}</span> {t('profile.posts_count')}
                    </div>
                    <div className="social-stat">
                      <span className="stat-num">{followersCount}</span> {t('profile.followers_count')}
                    </div>
                    <div className="social-stat">
                      <span className="stat-num">{followingCount}</span> {t('profile.following_count')}
                    </div>
                  </div>

                  <div className="user-bio-univy">
                    {profileUser?.descripcion && (
                      <p className="bio-description">
                        {profileUser.descripcion}
                      </p>
                    )}

                    <p className="bio-contact">{profileUser?.email}</p>

                    {(profileUser?.universidad ||
                      profileUser?.grado ||
                      profileUser?.asignaturas?.length) && (
                      <div className="academic-info-univy">

                        <div className="academic-label">
                          <span className="academic-value">
                            <GraduationCap size={18} className="btn-icon" /> {getName(profileUser.universidad)}
                          </span>
                        </div>

                        <div className="academic-item">
                          <span className="academic-value">
                          <NotebookPen size={15} className="btn-icon" /> {getName(profileUser.grado)}
                          </span>
                        </div>

                        {profileUser.asignaturas.length > 0 && (
                          <div className="academic-item">

                            <div className="academic-tags">
                              {profileUser.asignaturas?.map((a: any) => (
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
              <div className="profile-tabs">
                <button
                  className={`profile-tab ${activeTab === 'posts' ? 'active' : ''}`}
                  onClick={() => setActiveTab('posts')}
                >
                  {t('profile.posts_title')}
                </button>
                <button
                  className={`profile-tab ${activeTab === 'unimatch' ? 'active' : ''}`}
                  onClick={async () => {
                    setActiveTab('unimatch');
                    try {
                      const targetId = id || currentUser?._id;
                      if (!targetId) return;
                      const res = isOwnProfile
                        ? await getMyPhotos()
                        : await getUserPhotos(targetId);
                      setUnimatchPhotos(res.data);
                    } catch (err) {
                      console.error('Error loading unimatch photos:', err);
                    }
                  }}
                >
                  <Flame size={16} /> UniMatch
                </button>
              </div>
              <div className="active-line"></div>
            </div>

            {activeTab === 'posts' ? (
              <>
            {loading ? (
              <div className="state-message">{t('profile.loading_posts')}</div>
            ) : isRestricted ? (
              <div className="private-account-empty">
                <span className="empty-icon"><Lock size={48} /></span>
                <h3>{t('profile.private_title')}</h3>
                <p>{t('profile.private_subtitle')}</p>
              </div>
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
                <span className="empty-icon"><FolderOpen size={48} /></span>
                <h3>{t('profile.empty_posts')}</h3>
              </div>
            )}
              </>
            ) : (
              /* UniMatch Photos Tab */
              <div className="unimatch-photos-tab">
                {isOwnProfile && (
                  <div
                    className="unimatch-add-photo"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.onchange = async (e: any) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploadingUnimatch(true);
                        try {
                          const res = await uploadUnimatchPhoto(file);
                          setUnimatchPhotos(prev => [...prev, res.data]);
                        } catch (err) {
                          console.error('Error uploading unimatch photo:', err);
                        } finally {
                          setUploadingUnimatch(false);
                        }
                      };
                      input.click();
                    }}
                  >
                    {uploadingUnimatch ? (
                      <div className="unimatch-upload-spinner" />
                    ) : (
                      <Plus size={32} />
                    )}
                    <span>{t('profile.add_photo')}</span>
                  </div>
                )}
                {unimatchPhotos.length > 0 ? (
                  <div className="unimatch-photos-grid">
                    {unimatchPhotos.map((photo) => (
                      <div key={photo._id} className="unimatch-photo-item">
                        <img src={photo.imageUrl} alt="UniMatch" />
                        {isOwnProfile && (
                          <button
                            className="unimatch-delete-photo"
                            onClick={async () => {
                              try {
                                await deleteUnimatchPhoto(photo._id);
                                setUnimatchPhotos(prev => prev.filter(p => p._id !== photo._id));
                              } catch (err) {
                                console.error('Error deleting photo:', err);
                              }
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : !isOwnProfile ? (
                  <div className="empty-state">
                    <span className="empty-icon"><Flame size={48} /></span>
                    <h3>{t('profile.no_unimatch_photos')}</h3>
                  </div>
                ) : null}
              </div>
            )}
          </main>
        </div>
      </div>

      {selectedPost && (
        <ProfilePostModal 
          post={selectedPost} 
          onClose={() => setSelectedPost(null)} 
          currentUserId={currentUserId || null}
        />
      )}
    </div>
  );
};

export default Profile;
