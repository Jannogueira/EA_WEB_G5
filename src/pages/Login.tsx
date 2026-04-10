import { Link, useNavigate } from 'react-router-dom';
import './Login.css'; 

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault(); 
    console.log("Simulando que el backend nos da el OK...");
    navigate('/home');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Iniciar Sesión</h1>
        
        {/* Formulario */}
        <form className="login-form" onSubmit={handleLogin}>
          <input 
            type="email" 
            className="login-input" 
            placeholder="Correo electrónico" 
            required 
          />
          <input 
            type="password" 
            className="login-input" 
            placeholder="Contraseña" 
            required 
          />
          <button type="submit" className="login-button">Entrar</button>
        </form>

        {/* Sección de Registro */}
        <div className="register-section">
          <p>¿Aún no tienes cuenta?</p>
          <Link to="/register">
            <button className="register-button">Regístrate aquí</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;