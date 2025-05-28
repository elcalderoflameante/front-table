import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Mesa from './pages/Mesa/Mesa';
import Login from './pages/Login/Login';
import Solicitudes from './pages/Mesas/Solicitudes';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/mesa/:mesaId" element={<Mesa />} />
        <Route path="/login" element={<Login />} />
        <Route path="/solicitudes" element={<Solicitudes />} />
      </Routes>
    </Router>
  );
}

export default App;