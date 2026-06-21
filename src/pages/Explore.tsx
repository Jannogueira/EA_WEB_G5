import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Explore.css';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Postcard from '../components/Postcard';
import UserCard from '../components/UserCard';
import useUser from '../hooks/useUser';
import useUnis from '../hooks/useUni';
import gradoService from '../services/grado';
import postService from '../services/post';
import { searchUsers } from '../services/usuario';
import { Search, SlidersHorizontal, Heart, MessageCircle } from 'lucide-react';
import ExploreFilter from '../components/ExploreFilterModal';
import { useTranslation } from 'react-i18next';
import { useGlobalAlert } from '../context/AlertContext';
import type { Usuario } from '../models/usuario';
import type { Grado } from '../models/grado';
import type { Asignatura } from '../models/asignatura';
import type { Post } from '../models/post';
import PostDetailModal from '../components/PostDetailModal';
import usePost from '../hooks/usePost';
import SharePostModal from '../components/SharePostModal';

const DiscoveryPostItem: React.FC<{ post: Post; onClick: () => void }> = ({ post, onClick }) => {
  return (
    <div className="discovery-grid-item" onClick={onClick}>
      <img src={post.imageUrl} alt="" className="discovery-grid-img" />
      <div className="discovery-grid-hover">
        <div className="hover-stats">
          <span>
            <Heart size={18} fill="white" /> {post.likes?.length || 0}
          </span>
          <span>
            <MessageCircle size={18} fill="white" /> {post.comments?.length || 0}
          </span>
        </div>
      </div>
    </div>
  );
};

const ExplorePostModal: React.FC<{
  post: Post;
  onClose: () => void;
  currentUserId: string | null;
}> = ({ post, onClose, currentUserId }) => {
  const {
    post: p,
    likePost,
    likeComment,
    addComment,
    loadingComment,
    toggleSave,
    isSaved,
  } = usePost(post);
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
      {showShareModal && <SharePostModal postId={p._id} onClose={() => setShowShareModal(false)} />}
    </>
  );
};

const Explore: React.FC = () => {
  const { t } = useTranslation();
  const { usuario } = useUser();
  const { universidades } = useUnis();

  // Search State
  const [users, setUsers] = useState<Usuario[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasTyped, setHasTyped] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  // Discovery Feed State
  const [discoveryPosts, setDiscoveryPosts] = useState<Post[]>([]);
  const [loadingDiscovery, setLoadingDiscovery] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // Filter & Data State
  const [showFilter, setShowFilter] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [grados, setGrados] = useState<Grado[]>([]);
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const { showAlert } = useGlobalAlert();

  // Refs
  const observerTarget = useRef<HTMLDivElement | null>(null);
  const latestRequest = useRef(0);
  const mounted = useRef(true);
  const didInitialSearch = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // Initial Load: Grados, Asignaturas, and Discovery Feed
  useEffect(() => {
    const initData = async () => {
      try {
        setLoadingDiscovery(true);
        const [gRes, aRes, postRes] = await Promise.all([
          gradoService.getAll(),
          gradoService.getAllAsignaturas(),
          postService.getDiscoveryFeed(),
        ]);
        if (!mounted.current) return;
        setGrados(gRes.data);
        setAsignaturas(aRes.data);
        const rawData = postRes.data as any;
        setDiscoveryPosts(Array.isArray(rawData) ? rawData : (rawData?.docs ?? []));
      } catch (error: any) {
        const errorMsg = error.data || t('alerts.explore_filter.connection_error');
        showAlert(t('alerts.explore_filter.error_title'), errorMsg, 'error');
      } finally {
        if (mounted.current) setLoadingDiscovery(false);
      }
    };
    initData();
  }, []);

  // Search Logic
  const performSearch = useCallback(
    async (pageNum: number, isNewSearch: boolean = false) => {
      try {
        setLoading(true);
        const requestId = ++latestRequest.current;
        const res = await searchUsers(
          search,
          selectedFilters,
          universidades,
          grados,
          asignaturas,
          pageNum,
        );

        if (requestId !== latestRequest.current || !mounted.current) return;

        const { docs, hasNextPage: more } = res.data;
        setUsers((prev) => (isNewSearch ? docs : [...prev, ...docs]));
        setHasNextPage(more);
        setPage(pageNum);

        if (isNewSearch) {
          setHasTyped(true);
          didInitialSearch.current = true;
        }
      } catch (error) {
        if (mounted.current)
          showAlert(
            t('alerts.explore_filter.error_title'),
            t('alerts.explore_filter.search_error'),
            'error',
          );
      } finally {
        if (mounted.current) setLoading(false);
      }
    },
    [search, selectedFilters, universidades, grados, asignaturas],
  );

  useEffect(() => {
    const isIdle = !search.trim() && selectedFilters.length === 0;
    if (isIdle) {
      setUsers([]);
      setHasTyped(false);
      setHasNextPage(false);
      setPage(1);
      didInitialSearch.current = false;
      return;
    }
    const timer = setTimeout(() => performSearch(1, true), 400);
    return () => clearTimeout(timer);
  }, [search, selectedFilters, performSearch]);

  // Intersection Observer for Infinite Scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !loading && didInitialSearch.current) {
          performSearch(page + 1);
        }
      },
      { threshold: 1.0 },
    );
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [hasNextPage, loading, page, performSearch]);

  const handlePostClick = async (post: Post) => {
    try {
      const res = await postService.getPostById(post._id);
      setSelectedPost({
        ...res.data,
        isSaved: post.isSaved,
      });
    } catch (error) {
      setSelectedPost(post);
    }
  };

  return (
    <div className="home-wrapper">
      <Navbar usuario={usuario || undefined} />
      <div className="main-layout">
        <Sidebar />
        <div className="content-area">
          <main
            className={`feed-container explore-container ${!hasTyped ? 'grid-view' : 'list-view'}`}
          >
            <header className="feed-header">
              <h1>{t('explore.title')}</h1>
              <p>{t('explore.subtitle')}</p>
            </header>

            <div className="search-section-premium">
              <button className="filter-btn-premium" onClick={() => setShowFilter(true)}>
                <SlidersHorizontal size={20} />
                {selectedFilters.length > 0 && `(${selectedFilters.length})`}
              </button>
              <div className="search-box-wrapper">
                <Search size={20} className="search-icon-inside" />
                <input
                  type="text"
                  className="search-input-premium"
                  placeholder={t('explore.search_placeholder')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="explore-results-area">
              {!hasTyped ? (
                <div className="discovery-grid">
                  {discoveryPosts.map((post) => (
                    <DiscoveryPostItem
                      key={post._id}
                      post={post}
                      onClick={() => handlePostClick(post)}
                    />
                  ))}
                  {loadingDiscovery && <p>{t('home.loading')}</p>}
                </div>
              ) : (
                <div className="users-list">
                  {loading && page === 1 ? (
                    <div className="state-message">{t('explore.searching')}</div>
                  ) : (
                    <>
                      {users.map((u) => (
                        <UserCard key={u._id} user={u} />
                      ))}
                      <div ref={observerTarget} className="scroll-sentinel">
                        {loading && <p>{t('explore.loading_more')}</p>}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {selectedPost && (
        <ExplorePostModal
          post={selectedPost}
          currentUserId={usuario?._id || null}
          onClose={() => setSelectedPost(null)}
        />
      )}

      {showFilter && (
        <ExploreFilter
          selected={selectedFilters}
          onApply={(ids) => setSelectedFilters(ids)}
          onClose={() => setShowFilter(false)}
        />
      )}
    </div>
  );
};

export default Explore;
