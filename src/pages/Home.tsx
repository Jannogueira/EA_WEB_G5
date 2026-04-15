import React, { useEffect, useState } from "react";
import "./Home.css";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Postcard from "../components/Postcard";
import type { Post } from "../models/post";
import type { Usuario } from "../models/usuario";
import PostService from "../services/post.service";

const Home: React.FC = () => {
  const [usuario, setUsuario] = useState<Usuario | undefined>(undefined);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userJson = localStorage.getItem("usuario");
    if (userJson) {
      setUsuario(JSON.parse(userJson));
    }

    const fetchPosts = async () => {
      try {
        const { request } = PostService.getAll();
        const response = await request;
        const data = response.data || response;
        setPosts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError("Error cargando posts");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="home-wrapper">
      <Navbar usuario={usuario} />

      <div className="main-layout">
        <Sidebar />

        <div className="content-area">
          <main className="feed-container">
            <header className="feed-header">
              <h1 className="page-title">Feed</h1>
              <p className="page-subtitle">
                Explora lo que está pasando en Univy
              </p>
            </header>

            <div className="posts-list">
              {loading && <p>Cargando posts...</p>}
              {error && <p>{error}</p>}

              {!loading && !error && posts.length === 0 && (
                <p>No hay posts todavía</p>
              )}

              {!loading &&
                !error &&
                posts.map((post) => (
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