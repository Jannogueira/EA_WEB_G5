import React, { useState } from "react";
import "./Home.css";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import useUser from "../hooks/useUser";
import { searchUsers } from "../services/usuario.service";
import type { Usuario } from "../models/usuario";
import UserCard from "../components/UserCard";

const Explore: React.FC = () => {
    const { usuario } = useUser();

    const [users, setUsers] = useState<Usuario[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async () => {
        try {
            setLoading(true);
            setHasSearched(true);

            const res = await searchUsers(search);
            setUsers(res.data);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="home-wrapper">
            <Navbar usuario={usuario || undefined} />

            <div className="main-layout">
                <Sidebar />

                <div className="content-area">
                    <main className="feed-container">
                        <header className="feed-header">
                            <h1>Explorar Usuarios</h1>
                            <p>Descubre nuevos estudiantes</p>
                        </header>

                        {/* SEARCH */}
                        <div className="search-box">
                            <input 
                                type="text"
                                placeholder="Buscar por nombre..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleSearch();
                                }}
                                className="search-input"
                            />

                            <button onClick={handleSearch}>
                                Buscar
                            </button>
                        </div>

                        {/* RESULTS */}
                        {hasSearched && (
                            <div className="users-list">
                                {loading ? (
                                    <p>Cargando...</p>
                                ) : users.length > 0 ? (
                                    users.map((u) => (
                                        <UserCard key={u._id} user={u} />
                                    ))
                                ) : (
                                    <p>No se encontraron usuarios</p>
                                )}
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default Explore;