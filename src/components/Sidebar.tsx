import { useNavigate } from "react-router-dom";
import "./Sidebar.css";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">Menú</h2>

      <nav className="sidebar-nav">
        <button className="sidebar-btn" onClick={() => navigate("/home")}>
          Home
        </button>
        <button className="sidebar-btn" onClick={() => navigate("/home")}>
          Explore
        </button>
        <button className="sidebar-btn" onClick={() => navigate("/home")}>
          University
        </button>
        <button className="sidebar-btn" onClick={() => navigate("/home")}>
          Classes
        </button>
        <button className="sidebar-btn" onClick={() => navigate("/home")}>
          Chat
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;