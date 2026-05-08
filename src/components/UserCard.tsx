import React from "react";
import "./UserCard.css";
import type { Usuario } from "../models/usuario";
import { useNavigate } from "react-router-dom";
import { GraduationCap, NotebookPen } from "lucide-react";

const UserCard: React.FC<{ user: Usuario }> = ({ user }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/profile/${user._id}`);
    };

    return (
        <div className="user-card" onClick={handleClick}>
            <div className="user-header">
                <img
                    src={user.avatarUrl || "/default-avatar.png"}
                    alt={user.nombre}
                    className="user-avatar"
                />

                <div className="user-info">
                    <h3 className="user-name">{user.nombre}</h3>

                    <p className="user-uni"> <GraduationCap size={18} className="btn-icon" />
                        {typeof user.universidad === "object"
                            ? user.universidad?.nombre
                            : "Sin universidad"}
                    </p>
                    
                    {/* NEW: Display Grado tag if it exists */}
                    {user.grado && (
                        <div className="user-grado-badge">
                          <NotebookPen size={18} className="btn-icon" />
                            {typeof user.grado === "object" 
                                ? user.grado.nombre 
                                : "Grado asignado"}
                        </div>
                    )}
                </div>
            </div>

            <div className="user-body">
                {user.descripcion && (
                    <p className="user-desc">
                        {user.descripcion}
                    </p>
                )}
                
            </div>
        </div>
    );
};

export default UserCard;