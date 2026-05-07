import React, { useEffect, useRef } from "react";
import "./Home.css";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Postcard from "../components/Postcard";
import useUser from "../hooks/useUser";
import usePosts from "../hooks/usePosts";
import { useTranslation } from "react-i18next";

const Home: React.FC = () => {
  const { t } = useTranslation();
  const { usuario } = useUser();
  const { posts, loading, error, hasNextPage, fetchNextPage } = usePosts();
  
  // Referencia al elemento que detectará el final del scroll
  const observerTarget = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasNextPage && !loading) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) observer.unobserve(observerTarget.current);
    };
  }, [observerTarget, hasNextPage, loading, fetchNextPage]);

  return (
    <div className="home-wrapper">
      <Navbar usuario={usuario || undefined} />

      <div className="main-layout">
        <Sidebar />

        <div className="content-area">
          <main className="feed-container">
            <header className="feed-header">
              <h1>{t('home.title')}</h1>
              <p>{t('home.subtitle')}</p>
            </header>

            <div className="posts-list">
              {error && <p className="error-message">{error}</p>}

              {posts.map(post => (
                <Postcard key={post._id} post={post} />
              ))}

              {/* Centinela para el scroll infinito */}
              <div ref={observerTarget} className="scroll-sentinel">
                {loading && <p>{t('home.loading')}</p>}
                {!hasNextPage && posts.length > 0 && <p className="end-message">{t('home.end')}</p>}
              </div>

              {!loading && !error && posts.length === 0 && (
                <p>{t('home.empty')}</p>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Home;