import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login";
import SignUp from "./SignUp";
import Main from "./Main";

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Router>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
