import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import ArtistLayout from "./layouts/ArtistLayout";

import Home from "./pages/Home";
import Gallery from "./pages/Gallery";
import ArtistsPage from "./pages/Artists";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import ArtworkDetails from "./pages/ArtworkDetails";
import Register from "./pages/Register";
import ArtistDashboard from "./pages/ArtistDashboard";
import ChatPage from "./pages/ChatPage";
import ProtectedRoute from "./components/ProtectedRoute";

import AdminLayout from "./admin/layouts/AdminLayout";
import AdminProtectedRoute from "./admin/components/ProtectedRoute";
import Dashboard from "./admin/pages/Dashboard";
import Users from "./admin/pages/Users";
import Artists from "./admin/pages/Artists";
import Artworks from "./admin/pages/Artworks";
import Orders from "./admin/pages/Orders";
import Categories from "./admin/pages/Categories";
import Reports from "./admin/pages/Reports";

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/gallery/:id" element={<ArtworkDetails />} />
          <Route path="/artists" element={<ArtistsPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/chat"
            element={
              <ProtectedRoute roles={["customer", "user", "artist"]}>
                <ChatPage />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route
          path="/artist"
          element={
            <ProtectedRoute roles={["artist"]}>
              <ArtistLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<ArtistDashboard />} />
          <Route path="chat" element={<ChatPage />} />
        </Route>

        <Route
          path="/admin"
          element={
            <AdminProtectedRoute roles={["admin"]}>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="artists" element={<Artists />} />
          <Route path="artworks" element={<Artworks />} />
          <Route path="orders" element={<Orders />} />
          <Route path="categories" element={<Categories />} />
          <Route path="reports" element={<Reports />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
