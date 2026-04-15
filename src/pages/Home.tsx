import React, { useEffect, useState } from "react";
import "./Home.css";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Postcard from "../components/Postcard";
import type { Post } from "../models/post";
import type { Usuario } from "../models/usuario";

const Home: React.FC = () => {
  const [usuario, setUsuario] = useState<Usuario | undefined>(undefined);

  useEffect(() => {
    const userJson = localStorage.getItem('usuario');
    if (userJson) {
      setUsuario(JSON.parse(userJson));
    }
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
              <p className="page-subtitle">Explora lo que está pasando en Univy</p>
            </header>

            <div className="posts-list">
              {MOCK_POSTS.map((post) => (
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

// --- Mock Posts (Para demostración visual) ---
const MOCK_POSTS: Post[] = [
  {
    _id: 1,
    usuario: {
      _id: "u1",
      nombre: "Ana Martínez",
      email: "ana@test.com",
      password: "",
      rol: "user",
      activo: true,
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana",
    },
    imageUrl: "https://images.pexels.com/photos/14424025/pexels-photo-14424025.jpeg",
    caption: "Estudiando en la biblioteca! 📚 #Exámenes",
    likes: 45,
    comments: [
      {
        _id: 101,
        usuario: { _id: "u123", nombre: "Tú", email: "tu@mail.com", password: "", rol: "user", activo: true, avatarUrl: "" },
        texto: "¡Mucho ánimo!"
      }
    ]
  },
  {
    _id: 2,
    usuario: {
      _id: "u2",
      nombre: "Luis Garcia",
      email: "luis@test.com",
      password: "",
      rol: "user",
      activo: true,
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Luis"
    },
    imageUrl: "https://images.pexels.com/photos/30002394/pexels-photo-30002394.jpeg",
    caption: "Primer día de prácticas superado ✅",
    likes: 120,
    comments: []
  }
];

