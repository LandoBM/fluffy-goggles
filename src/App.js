import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Programs from "./pages/Programs";
import Admissions from "./pages/Admissions";
import About from "./pages/About";
import Location from "./pages/Location";
import Resources from "./pages/Resources";
import Contact from "./pages/Contact";
import Staff from "./pages/Staff";
import Community from "./pages/Community";
import ThankYou from "./pages/ThankYou";
import Tuition from "./pages/Tuition.js";
import Login from "./pages/Login";
import Portal from "./pages/Portal";
import ResetPassword from "./pages/ResetPassword";
import Transportation from "./pages/Transportation.js";
import Announcements from "./pages/Announcements.js";
import AnnouncementsArchive from "./pages/AnnouncementsArchive.js";
import AdminPortal from "./pages/AdminPortal.js";

export default function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/programs" element={<Programs />} />
            <Route path="/about" element={<About />} />
            <Route path="/location" element={<Location />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/staff" element={<Staff />} />
            <Route path="/community" element={<Community />} />
            <Route path="/admissions" element={<Admissions />} />
            <Route path="/thank-you" element={<ThankYou />} />
            <Route path="/tuition" element={<Tuition />} />
            <Route path="/login" element={<Login />} />
            <Route path="/portal" element={<Portal />} />
            <Route path="/transportation" element={<Transportation />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/announcements/archive" element={<AnnouncementsArchive />} />
            <Route path="/admin" element={<AdminPortal />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}