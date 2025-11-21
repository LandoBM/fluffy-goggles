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

export default function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/programs" element={<Programs />} />
            {/* <Route
              path="/programs/pre-k"
              element={<Admissions grade="Pre-K" />}
            />
            <Route
              path="/programs/first"
              element={<GradePage grade="First Grade" />}
            />
            <Route
              path="/programs/second"
              element={<GradePage grade="Second Grade" />}
            />
            <Route
              path="/programs/third"
              element={<GradePage grade="Third Grade" />}
            />
            <Route
              path="/programs/fourth"
              element={<GradePage grade="Fourth Grade" />}
            />
            <Route
              path="/programs/fifth"
              element={<GradePage grade="Fifth Grade" />}
            /> */}
            <Route path="/about" element={<About />} />
            <Route path="/location" element={<Location />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/staff" element={<Staff />} />
            <Route path="/community" element={<Community />} />
            <Route path="/admissions" element={<Admissions />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}