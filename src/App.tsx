import { useState } from 'react'
import usuarioService from './services/usuario.service'
import './App.css'

function App() {

  // ESTADO PARA EL FORMULARIO DE REGISTRO
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: ''
  });

  const [status, setStatus] = useState({ msg: '', isError: false });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // FUNCIÓN PARA MANEJAR EL REGISTRO
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await usuarioService.create(formData);
      setStatus({ msg: 'Success!', isError: false });
      setFormData({ nombre: '', email: '', password: '' });
    } catch (error: any) {
      setStatus({ msg: 'Error', isError: true });
    }
  };

  return (
    <>
      <section id="center">
        <div>
          <h1>Register</h1>
          {status.msg && (
            <p style={{ color: status.isError ? 'red' : 'green' }}>{status.msg}</p>
          )}
        </div>

        {/* FORMULARIO DE REGISTRO LIMPIO */}
        <form onSubmit={handleSubmit} className="atelier-form">
          <input
            type="text"
            name="nombre"
            placeholder="Name"
            value={formData.nombre}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit" className="counter atelier-btn">
            Register
          </button>
        </form>

      </section>
    </>
  )
}

export default App