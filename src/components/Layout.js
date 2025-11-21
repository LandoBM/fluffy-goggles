import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
      <Navbar />
      {/* Header */}
      {/* <header className="bg-blue-800 text-white py-4 shadow">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-4">
          <h1 className="text-xl font-bold tracking-wide">
            Summer Crest Learning Academy
          </h1>

          <nav className="space-x-6 text-sm">
            <a href="/" className="hover:text-gray-200">Home</a>
            <a href="/about" className="hover:text-gray-200">About</a>
            <a href="/programs" className="hover:text-gray-200">Programs</a>
            <a href="/grade" className="hover:text-gray-200">Grade Levels</a>
            <a href="/community" className="hover:text-gray-200">Community</a>
            <a href="/resources" className="hover:text-gray-200">Resources</a>
            <a href="/staff" className="hover:text-gray-200">Staff</a>
            <a href="/location" className="hover:text-gray-200">Location</a>
            <a href="/contact" className="hover:text-gray-200">Contact</a>
          </nav>
        </div>
      </header> */}

      {/* Main content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      {/* <footer className="bg-blue-800 text-white py-6 text-center text-sm mt-12">
        © {new Date().getFullYear()} Summercrest Academy. All rights reserved.
      </footer> */}
    </div>
  );
}
