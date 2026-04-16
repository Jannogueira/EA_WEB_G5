import React from "react";
import "./Home.css";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Postcard from "../components/Postcard";
import useUser from "../hooks/useUser";
import usePosts from "../hooks/usePosts";

const Home: React.FC = () => {
  const { usuario } = useUser();
  const { posts, loading, error } = usePosts();

  return (
    <div className="home-wrapper">
      <Navbar usuario={usuario || undefined} />

      <div className="main-layout">
        <Sidebar />

        <div className="content-area">
          <main className="feed-container">
            <header className="feed-header">
              <h1>Feed</h1>
              <p>Explora lo que está pasando en Univy</p>
            </header>

            <div className="posts-list">
              {loading && <p>Cargando posts...</p>}
              {error && <p>{error}</p>}

              {!loading && !error && posts.length === 0 && (
                <p>No hay posts todavía</p>
              )}

              {posts.map(post => (
                <Postcard key={post._id} post={post} />
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Home;