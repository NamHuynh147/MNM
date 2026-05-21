import React from "react";
import { Navigate, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import CardList from "./pages/CardList";
import PublicCardList from "./pages/PublicCardList";
import CreateCard from "./pages/CreateCard";
import DetailCard from "./pages/DetailCard";
import EditCard from "./pages/EditCard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Admin from "./pages/Admin";
import "./styles/App.css";

function RequireAuth({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

function RequireAdmin({ children }) {
  const token = localStorage.getItem("token");
  const savedUser = localStorage.getItem("user");
  const user = savedUser ? JSON.parse(savedUser) : null;

  if (!token) return <Navigate to="/login" replace />;
  return user?.role === "admin" ? children : <Navigate to="/" replace />;
}

function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="app-main">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/cards/public" element={<PublicCardList />} />
          <Route path="/cards/:id" element={<DetailCard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes (require authentication) */}
          <Route
            path="/cards"
            element={
              <RequireAuth>
                <CardList />
              </RequireAuth>
            }
          />
          <Route
            path="/cards/create"
            element={
              <RequireAuth>
                <CreateCard />
              </RequireAuth>
            }
          />
          <Route
            path="/cards/:id/edit"
            element={
              <RequireAuth>
                <EditCard />
              </RequireAuth>
            }
          />

          {/* Admin Route */}
          <Route
            path="/admin"
            element={
              <RequireAuth>
                <RequireAdmin>
                  <Admin />
                </RequireAdmin>
              </RequireAuth>
            }
          />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="app-footer">
        <p>&copy; 2024 Tạo Thiệp Mời. Tất cả quyền được bảo lưu.</p>
      </footer>
    </div>
  );
}

export default App;
