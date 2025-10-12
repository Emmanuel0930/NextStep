import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React, { useEffect } from "react";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Jobs from "./pages/Jobs";
import Dashboard from "./pages/Dashboard";
import Navbar from "./components/Navbar";
import { useNotification } from "./components/NotificationProvider";
import { getWelcomeMessage } from "./utils/Messages";

function App() {
  const { showNotification } = useNotification();

  useEffect(() => {
    showNotification(getWelcomeMessage());
  }, [showNotification]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Jobs />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
