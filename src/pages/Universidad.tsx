import React, { useEffect, useState } from "react";
import "./Home.css";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import UserCard from "../components/UserCard";
import useUser from "../hooks/useUser";
import gradoService from "../services/grado";
import type { Grado } from "../models/grado";
import type { Asignatura } from "../models/asignatura";
import { BookOpen, GraduationCap } from "lucide-react";

import Alert from "../components/Alert";
import type { AlertState } from "../components/Alert";

const Universidad: React.FC = () => {
  const { usuario } = useUser();

  const [grado, setGrado] = useState<Grado | null>(null);
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [alert, setAlert] = useState<AlertState | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!usuario?._id) return;

      const gradoId =
        typeof usuario.grado === "string"
          ? usuario.grado
          : usuario.grado?._id;

      if (!gradoId) return;

      try {
        setLoading(true);

        // 1. grado
        const resGrado = await gradoService.getById(gradoId);
        setGrado(resGrado.data);

        // 2. asignaturas del grado
        const resAsig = await gradoService.getAsignaturas(gradoId);
        const todas: Asignatura[] = resAsig.data;

        // 3. SOLO asignaturas donde está el usuario logeado
        const filtradas = todas.filter((asig) =>
          asig.usuarios.some((u) => u._id === usuario._id)
        );

        setAsignaturas(filtradas);
      } catch (error: any) {
        const msg =
          error.response?.data?.message ||
          error.message ||
          "Error al contactar con el servidor";

        setAlert({
          type: "error",
          title: "Error",
          message: msg,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [usuario]);

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

            {loading ? (
              <p>Cargando asignaturas...</p>
            ) : (
              <>
                {/* HEADER */}
                <header className="feed-header">
                  <h1>{grado?.nombre || "Mi Grado"}</h1>

                  <p>
                    <GraduationCap size={18} />
                    {usuario?.universidad?.nombre ?? "Sin universidad"}
                  </p>
                </header>

                {/* LISTA */}
                <div className="posts-list">
                  {asignaturas.length === 0 ? (
                    <p>No estás inscrito en ninguna asignatura.</p>
                  ) : (
                    asignaturas.map((asig) => {
                      const isOpen = open === asig._id;

                      const usuariosSinMi = asig.usuarios.filter(
                        (u) => u._id !== usuario?._id
                      );

                      return (
                        <div key={asig._id}>
                          {/* CARD ASIGNATURA */}
                          <section
                            className="subject-card cursor-pointer"
                            onClick={() =>
                              setOpen(isOpen ? null : asig._id)
                            }
                          >
                            <div className="subject-info">
                              <div className="flex-gap-10">
                                <BookOpen size={22} />
                                <h2>{asig.nombre}</h2>
                              </div>

                              <span>
                                {usuariosSinMi.length} compañeros
                              </span>
                            </div>
                          </section>

                          {/* USERS EXPANDIBLE */}
                          {isOpen && (
                            <div className="users-grid mt-10">
                              {usuariosSinMi.length === 0 ? (
                                <p>No hay compañeros en esta asignatura.</p>
                              ) : (
                                usuariosSinMi.map((u) => (
                                  <UserCard key={u._id} user={u} />
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            )}

          </main>
        </div>
      </div>
    </div>
  );
};

export default Universidad;