import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import usuarioService from './services/usuario.service'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

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
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>Register</h1>
          {status.msg && (
            <p style={{ color: status.isError ? 'red' : 'green' }}>{status.msg}</p>
          )}
        </div>

        {/* FORMULARIO DE REGISTRO INSERTADO AQUÍ */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '250px', margin: '20px auto' }}>
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
          <button type="submit" className="counter">
            Register User
          </button>
        </form>

        <button
          className="counter"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2>Documentation</h2>
          <p>Your questions, answered</p>
          <ul>
            <li>
              <a href="https://vite.dev/" target="_blank">
                <img className="logo" src={viteLogo} alt="" />
                Explore Vite
              </a>
            </li>
            <li>
              <a href="https://react.dev/" target="_blank">
                <img className="button-icon" src={reactLogo} alt="" />
                Learn more
              </a>
            </li>
          </ul>
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App