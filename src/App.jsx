import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Meseros from './pages/Meseros';
import Mesa from './pages/Mesa/Mesa';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Meseros />} />
        <Route path="/mesa/:mesaId" element={<Mesa />} />
      </Routes>
    </Router>
  );
}

export default App;