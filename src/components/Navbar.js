import { Link } from "react-router-dom";
import { useState } from "react";
import Mascot from "../assets/images/mascot.png";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* LEFT: Logo + School Name */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src={Mascot} alt="Mascot" className="h-9 w-auto" />
          <div className="flex flex-col leading-tight">
            <span className="text-base md:text-lg font-extrabold text-blue-900 tracking-tight whitespace-nowrap">
              Summer Crest
            </span>
            <span className="text-xs text-blue-700 font-medium whitespace-nowrap">
              Learning Academy
            </span>
          </div>
        </Link>

        {/* DESKTOP MENU */}
        <ul className="hidden lg:flex gap-5 text-gray-700 font-semibold items-center text-sm">
          <li>
            <Link to="/" className="hover:text-blue-700">
              Home
            </Link>
          </li>
          <li>
            <Link to="/about" className="hover:text-blue-700">
              About
            </Link>
          </li>
          <li>
            <Link to="/programs" className="hover:text-blue-700">
              Programs
            </Link>
          </li>

          {/* MORE DROPDOWN */}
          <li className="relative">
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              onBlur={() => setTimeout(() => setMoreOpen(false), 150)}
              className="hover:text-blue-700 flex items-center gap-1"
            >
              More
              <span className={`text-xs transition-transform ${moreOpen ? "rotate-180" : ""}`}>
                ▼
              </span>
            </button>

            {moreOpen && (
              <div className="absolute top-full left-0 mt-2 bg-white shadow-lg rounded-lg border border-gray-100 py-2 w-48 flex flex-col">
                <Link to="/resources" className="px-4 py-2 hover:bg-blue-50 hover:text-blue-700">
                  Resources
                </Link>
                <Link to="/staff" className="px-4 py-2 hover:bg-blue-50 hover:text-blue-700">
                  Staff
                </Link>
                <Link to="/announcements" className="px-4 py-2 hover:bg-blue-50 hover:text-blue-700">
                  Announcements
                </Link>
                <Link to="/transportation" className="px-4 py-2 hover:bg-blue-50 hover:text-blue-700">
                  Transportation
                </Link>
                <Link to="/contact" className="px-4 py-2 hover:bg-blue-50 hover:text-blue-700">
                  Contact
                </Link>
              </div>
            )}
          </li>

          {/* SPECIAL ADMISSIONS BUTTON */}
          <li>
            <Link
              to="/admissions"
              className="bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-blue-800 transition whitespace-nowrap"
            >
              Admissions
            </Link>
          </li>

          {/* SPECIAL PAY TUITION BUTTON */}
          <li>
            <Link
              to="/login"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-700 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-green-800 transition whitespace-nowrap"
            >
              Pay Tuition
            </Link>
          </li>
        </ul>

        {/* MOBILE MENU BUTTON */}
        <button
          className="lg:hidden text-gray-700 focus:outline-none"
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
        <div className="lg:hidden bg-white shadow-inner px-6 py-4 space-y-3 text-gray-700 font-medium">
          <Link onClick={() => setMenuOpen(false)} to="/" className="block hover:text-blue-700">
            Home
          </Link>
          <Link onClick={() => setMenuOpen(false)} to="/about" className="block hover:text-blue-700">
            About
          </Link>
          <Link onClick={() => setMenuOpen(false)} to="/programs" className="block hover:text-blue-700">
            Programs
          </Link>
          <Link onClick={() => setMenuOpen(false)} to="/resources" className="block hover:text-blue-700">
            Resources
          </Link>
          <Link onClick={() => setMenuOpen(false)} to="/staff" className="block hover:text-blue-700">
            Staff
          </Link>
          <Link onClick={() => setMenuOpen(false)} to="/announcements" className="block hover:text-blue-700">
            Announcements
          </Link>
          <Link onClick={() => setMenuOpen(false)} to="/transportation" className="block hover:text-blue-700">
            Transportation
          </Link>
          <Link onClick={() => setMenuOpen(false)} to="/contact" className="block hover:text-blue-700">
            Contact
          </Link>

          <Link
            onClick={() => setMenuOpen(false)}
            to="/admissions"
            className="block bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-blue-800 transition text-center"
          >
            Admissions
          </Link>
          <Link
            onClick={() => setMenuOpen(false)}
            to="/login"
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-green-700 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-green-800 transition text-center"
          >
            Pay Tuition
          </Link>
        </div>
      )}
    </nav>
  );
}
