import React, { useState } from "react";
import "./Explore.css";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import useUser from "../hooks/useUser";
import { searchUsers } from "../services/usuario.service";
import type { Usuario } from "../models/usuario";
import UserCard from "../components/UserCard";
import { Search, Compass } from "lucide-react";

const Explore: React.FC = () => {
    const { usuario } = useUser();

    const [users, setUsers] = useState<Usuario[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async () => {
        if (!search.trim()) return;
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
                        <header className="feed-header explore-header">
                            <div className="header-icon-box">
                                <Compass size={32} className="explore-icon" />
                            </div>
                            <div className="header-text">
                                <h1>Explorar Usuarios</h1>
                                <p>Descubre nuevos estudiantes de Univy</p>
                            </div>
                        </header>

                        {/* SEARCH */}
                        <div className="search-section-premium">
                            <div className="search-box-wrapper">
                                <Search size={20} className="search-icon-inside" />
                                <input 
                                    type="text"
                                    placeholder="Buscar por nombre..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") handleSearch();
                                    }}
                                    className="search-input-premium"
                                />
                                <button className="search-btn-premium" onClick={handleSearch} disabled={loading}>
                                    {loading ? "..." : "Buscar"}
                                </button>
                            </div>
                        </div>

                        {/* RESULTS */}
                        <div className="explore-results-area">
                            {hasSearched ? (
                                <div className="users-list">
                                    {loading ? (
                                        <div className="state-message">Buscando mentes brillantes...</div>
                                    ) : users.length > 0 ? (
                                        users.map((u) => (
                                            <UserCard key={u._id} user={u} />
                                        ))
                                    ) : (
                                        <div className="empty-state">No se encontraron usuarios con ese nombre</div>
                                    )}
                                </div>
                            ) : (
                                <div className="explore-onboarding">
                                    <div className="onboarding-circle">
                                        <Search size={48} opacity={0.3} />
                                    </div>
                                    <h3>Busca a alguien para empezar</h3>
                                    <p>Encuentra a tus compañeros de clase o de universidad</p>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default Explore;