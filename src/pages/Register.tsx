import React, { useState } from 'react';
import usuarioService from '../services/usuario.service';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

 const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("1. Botón pulsado. Datos a enviar:", formData);
    
    try {
      console.log("2. Llamando a Axios...");
      const respuesta = await usuarioService.create(formData);
      
      //
      console.log("3. ¡Axios terminó! Esta es la respuesta mágica:", respuesta); 
      
      alert("¡Registro exitoso!");
    } catch (error) {
      console.error('Error registering user:', error);
    }
  };

  return (
    // Añadimos la clase del contenedor principal
    <div className="register-container">
      <h2>Register</h2>
      
      {/* Añadimos la clase del formulario */}
      <form onSubmit={handleSubmit} className="register-form">
        
        {/* Añadimos la clase form-group para agrupar label + input */}
        <div className="form-group">
          <label htmlFor="nombre">Name:</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        
        {/* Añadimos la clase del botón */}
        <button type="submit" className="register-btn">Register</button>
      </form>
    </div>
  );
};

export default Register;