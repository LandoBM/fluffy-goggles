import { Link } from "react-router-dom";
import { useState } from "react";
import Mascot from "../assets/images/mascot.png";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">

        {/* LEFT: Logo + School Name */}
        <div className="flex items-center gap-3">
          <img src={Mascot} alt="Mascot" className="h-10 w-auto" />
          <div className="flex flex-col leading-tight">
            <span className="text-lg md:text-xl font-extrabold text-blue-900 tracking-tight">
              Summer Crest
            </span>
            <span className="text-sm text-blue-700 font-medium">
              Learning Academy
            </span>
          </div>
        </div>

        {/* DESKTOP MENU */}
        <ul className="hidden md:flex gap-8 text-gray-700 font-semibold items-center">
          <li><Link to="/" className="hover:text-blue-700">Home</Link></li>
          <li><Link to="/about" className="hover:text-blue-700">About</Link></li>
          <li><Link to="/programs" className="hover:text-blue-700">Programs</Link></li>
          <li><Link to="/resources" className="hover:text-blue-700">Resources</Link></li>
          <li><Link to="/staff" className="hover:text-blue-700">Staff</Link></li>
          <li><Link to="/contact" className="hover:text-blue-700">Contact</Link></li>

          {/* SPECIAL ADMISSIONS BUTTON */}
          <li>
            <Link
              to="/admissions"
              className="bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-blue-800 transition"
            >
              Admissions
            </Link>
          </li>
        </ul>

        {/* MOBILE MENU BUTTON */}
        <button
          className="md:hidden text-gray-700 focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? (
            <span className="text-3xl">&times;</span>
          ) : (
            <span className="text-3xl">&#9776;</span>
          )}
        </button>
      </div>

      {/* MOBILE DROPDOWN MENU */}
      {menuOpen && (
        <div className="md:hidden bg-white shadow-inner px-6 py-4 space-y-4 text-gray-700 font-medium">
          <Link onClick={() => setMenuOpen(false)} to="/" className="block hover:text-blue-700">Home</Link>
          <Link onClick={() => setMenuOpen(false)} to="/about" className="block hover:text-blue-700">About</Link>
          <Link onClick={() => setMenuOpen(false)} to="/programs" className="block hover:text-blue-700">Programs</Link>
          <Link onClick={() => setMenuOpen(false)} to="/resources" className="block hover:text-blue-700">Resources</Link>
          <Link onClick={() => setMenuOpen(false)} to="/staff" className="block hover:text-blue-700">Staff</Link>
          <Link onClick={() => setMenuOpen(false)} to="/contact" className="block hover:text-blue-700">Contact</Link>

          <Link
            onClick={() => setMenuOpen(false)}
            to="/admissions"
            className="block bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-blue-800 transition text-center"
          >
            Admissions
          </Link>
        </div>
      )}
    </nav>
  );
}






