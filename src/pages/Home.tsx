import React from "react";
import "./Home.css";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Postcard from "../components/Postcard";
import type { Post } from "../models/post";
import type { Usuario } from "../models/usuario";

const Home: React.FC = () => {
  return (
    <div className="home-wrapper">
      {/* 1. Navbar: fixa a dalt de tot, cobrint tot l'ample */}
      <Navbar usuario={mockUser} />

      <div className="main-layout">
        {/* 2. Sidebar: fixa a l'esquerra sota la navbar */}
        <Sidebar />

        {/* 3. Àrea de contingut: es desplaça a la dreta del sidebar */}
        <div className="content-area">
          <main className="feed-container">
            <header className="feed-header">
              <h1 className="page-title">Home</h1>
              <p className="page-subtitle">Discover</p>
            </header>

            <div className="posts-list">
              {MOCK_POSTS.map((post) => (
                /* Cada carta de post amb mida de 450px definida al CSS */
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


//-----BORRAR DESPUÉS CUANDO LO TENGAMOS EN BBDD-----/ /

// --- Mock User (L'usuari que està loguejat) ---
const mockUser: Usuario = {
  _id: "u123",
  nombre: "Marc Estudiant",
  email: "marc@universitat.edu",
  password: "", // No es mostra mai
  rol: "user",
  activo: true,
  avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marc",
  //universidad: { _id: "uni1", nombre: "UPC", ubicacion: "Barcelona" }
};

// --- Mock Posts (Dades de la base de dades) ---
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
      //universidad: { _id: "uni1", nombre: "UPC", ubicacion: "Barcelona" }
    },
    imageUrl: "https://images.pexels.com/photos/14424025/pexels-photo-14424025.jpeg",
    caption: "Estudiant a la biblioteca de l'escola! 📚 #UPC #Exàmens",
    likes: 45,
    comments: [
      {
        _id: 101,
        usuario: mockUser,
        texto: "Molts ànims, Ana! Jo hi vaig demà."
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
    caption: "Primer dia de pràctiques acabat. Molt content amb l'equip! ✅",
    likes: 120,
    comments: []
  }
];
