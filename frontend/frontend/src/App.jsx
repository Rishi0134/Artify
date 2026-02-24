import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import ArtistLayout from "./layouts/ArtistLayout";

import Home from "./pages/Home";
import Gallery from "./pages/Gallery";
import Artists from "./pages/Artists";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import ArtworkDetails from "./pages/ArtworkDetails";
import Register from "./pages/Register";
import ArtistDashboard from "./pages/ArtistDashboard";
import ChatPage from "./pages/ChatPage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/gallery/:id" element={<ArtworkDetails />} />
          <Route path="/artists" element={<Artists />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/chat"
            element={
              <ProtectedRoute roles={["customer", "artist"]}>
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
      </Routes>
    </Router>
  );
}

export default App;
