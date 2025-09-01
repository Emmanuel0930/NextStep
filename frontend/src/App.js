import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Main from "./Main";

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Router>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
