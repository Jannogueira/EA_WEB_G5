import React, { useState, useEffect } from "react";
import "./Explore.css";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import useUser from "../hooks/useUser";
import { searchUsers } from "../services/usuario.service";
import type { Usuario } from "../models/usuario";
import UserCard from "../components/UserCard";
import { Search, Compass } from "lucide-react";
import ExploreFilter from "../components/ExploreFilterModal";

const Explore: React.FC = () => {
    const { usuario } = useUser();

    const [users, setUsers] = useState<Usuario[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [hasTyped, setHasTyped] = useState(false);

    const [showFilter, setShowFilter] = useState(false);
    const [selectedUnis, setSelectedUnis] = useState<string[]>([]);

    useEffect(() => {
        if (!search.trim() && selectedUnis.length === 0) {
            setUsers([]);
            setHasTyped(false);
            return;
        }
    
        const timer = setTimeout(async () => {
            try {
                setLoading(true);
                setHasTyped(true);
    
                const res = await searchUsers(search, selectedUnis);
                setUsers(res.data);
    
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }, 400);
    
        return () => clearTimeout(timer);
    }, [search, selectedUnis]);

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
                            <button
                                    className="filter-btn-premium"
                                    onClick={() => setShowFilter(true)}
                                >   
                                    Filtrar
                                </button>
                            <div className="search-box-wrapper">
                                <Search size={20} className="search-icon-inside" />
                                <input 
                                    type="text"
                                    placeholder="Buscar por nombre..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="search-input-premium"
                                />
                                </div>
                        </div>

                        {/* RESULTS */}
                        <div className="explore-results-area">
                            {hasTyped ? (
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

            {showFilter && (
                <ExploreFilter
                selected={selectedUnis}
                onApply={(unis) => setSelectedUnis(unis)}
                onClose={() => setShowFilter(false)}
                />
            )}
        </div>
    );
};

export default Explore;