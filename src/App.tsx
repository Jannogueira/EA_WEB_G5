import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import SelectUniversity from './pages/SelectUniversity';
import Home from './pages/Home';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Explore from './pages/Explore';
import Messages from './pages/Messages';
import Notifications from './pages/Notifications';
import UniMatch from './pages/UniMatch';
import Universidad from './pages/Universidad';
import Saved from './pages/SavedPosts';
import { SocketProvider } from './context/SocketContext';
import ThemedBackground from './components/ThemedBackground';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <ThemedBackground />
      <SocketProvider>
        <Routes>
          {/* Entrar a la web te redirige automáticamente al Login */}
          <Route path="/" element={<Navigate to="/login" />} />
          
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/select-university" element={<SelectUniversity />} />
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/unimatch" element={<UniMatch />} />
          <Route path="/university" element={<Universidad />} />
          <Route path="/profile/:id" element={<Profile />} />
        </Routes>
      </SocketProvider>
    </BrowserRouter>
  );
}

export default App;