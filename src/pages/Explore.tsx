import React, { useState, useEffect, useRef } from "react";
import "./Explore.css";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import useUser from "../hooks/useUser";
import useUnis from "../hooks/useUni";
import gradoService from "../services/grado";
import { searchUsers } from "../services/usuario";
import type { Usuario } from "../models/usuario";
import type { Grado } from "../models/grado";
import type { Asignatura } from "../models/asignatura";
import UserCard from "../components/UserCard";
import { Search, Compass } from "lucide-react";
import ExploreFilter from "../components/ExploreFilterModal";
import { useTranslation } from "react-i18next";
import type { AlertState } from "../components/Alert";
import Alert from "../components/Alert";

const Explore: React.FC = () => {
    const { t } = useTranslation();
    const { usuario } = useUser();

    const [users, setUsers] = useState<Usuario[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [hasTyped, setHasTyped] = useState(false);
    const [page, setPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(false);

    const [showFilter, setShowFilter] = useState(false);
    
    const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

    const { universidades } = useUnis();
    const [grados, setGrados] = useState<Grado[]>([]);
    const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);

    const [alert, setAlert] = useState<AlertState | null>(null);

    const observerTarget = useRef(null);

    useEffect(() => {
        const fetchRefs = async () => {
            try {
                const [gRes, aRes] = await Promise.all([
                    gradoService.getAll(),
                    gradoService.getAllAsignaturas()
                ]);
                setGrados(gRes.data);
                setAsignaturas(aRes.data);
        } catch (error: any) {
            const msg =
            error.response?.data?.message ||
            error.message ||
            'Error al contactar con el servidor';

            setAlert({
                type: 'error',
                title: 'Error de carga',
                message: msg
            });
        }
    };fetchRefs();
    }, []);

    const performSearch = async (pageNum: number, isNewSearch: boolean = false) => {
        if (loading || (!isNewSearch && !hasNextPage)) return;

        try {
            setLoading(true);
            const res = await searchUsers(
                search, 
                selectedFilters, 
                universidades, 
                grados, 
                asignaturas, 
                pageNum
            );
            
            const { docs, hasNextPage: more } = res.data;
            setUsers(prev => isNewSearch ? docs : [...prev, ...docs]);
            setHasNextPage(more);
            setPage(pageNum);
            if (isNewSearch) setHasTyped(true);
        } catch (error: any) {
            const msg =
            error.response?.data?.message ||
            error.message ||
            'Error al contactar con el servidor';

            setAlert({
                type: 'error',
                title: 'Error en la búsqueda',
                message: msg
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!search.trim() && selectedFilters.length === 0) {
            setUsers([]);
            setHasTyped(false);
            setHasNextPage(false);
            return;
        }

        const timer = setTimeout(() => {
            performSearch(1, true);
        }, 400);

        return () => clearTimeout(timer);
    }, [search, selectedFilters]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasNextPage && !loading) {
                    performSearch(page + 1);
                }
            },
            { threshold: 1.0 }
        );

        if (observerTarget.current) observer.observe(observerTarget.current);
        return () => {
            if (observerTarget.current) observer.unobserve(observerTarget.current);
        };
    }, [hasNextPage, loading, page]);

    return (
        <div className="home-wrapper">

            {alert && (
                <Alert
                type={alert.type}
                title={alert.title}
                message={alert.message}
                onClose={() => setAlert(null)}
                />
            )}

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
                                <h1>{t('explore.title')}</h1>
                                <p>{t('explore.subtitle')}</p>
                            </div>
                        </header>

                        <div className="search-section-premium">
                            <button className="filter-btn-premium" onClick={() => setShowFilter(true)}>
                                {t('explore.filter')} {selectedFilters.length > 0 && `(${selectedFilters.length})`}
                            </button>
                            <div className="search-box-wrapper">
                                <Search size={20} className="search-icon-inside" />
                                <input
                                    type="text"
                                    placeholder={t('explore.search_placeholder')}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="search-input-premium"
                                />
                            </div>
                        </div>

                        <div className="explore-results-area">
                            {hasTyped ? (
                                <div className="users-list">
                                    {loading && page === 1 ? (
                                        <div className="state-message">{t('explore.searching')}</div>
                                    ) : users.length > 0 ? (
                                        <>
                                            {users.map((u) => <UserCard key={u._id} user={u} />)}
                                            <div ref={observerTarget} className="scroll-sentinel">
                                                {loading && <p>{t('explore.loading_more')}</p>}
                                                {!hasNextPage && <p className="end-message">{t('explore.no_more')}</p>}
                                            </div>
                                        </>
                                    ) : !loading && (
                                        <div className="empty-state">{t('explore.not_found')}</div>
                                    )}
                                </div>
                            ) : (
                                <div className="explore-onboarding">
                                    <div className="onboarding-circle"><Search size={48} opacity={0.3} /></div>
                                    <h3>{t('explore.onboarding_title')}</h3>
                                    <p>{t('explore.onboarding_subtitle')}</p>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>

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