import React from "react";
import "./UserCard.css";
import type { Usuario } from "../models/usuario";
import { useNavigate } from "react-router-dom";

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

          <p className="user-uni">
            {typeof user.universidad === "object"
              ? user.universidad?.nombre
              : "Sin universidad"}
          </p>
        </div>
      </div>

      <div className="user-body">
        <p className="user-desc">
          {user.descripcion}
        </p>
      </div>
    </div>
  );
};

export default UserCard;