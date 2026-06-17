import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import Layout from "../components/Layout";

function isRecent(dateStr, days = 30) {
  const posted = new Date(dateStr);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return posted >= cutoff;
}

export default function AnnouncementsArchive() {
  const [archived, setArchived] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(null);

  useEffect(() => {
    const fetchArchived = async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("id, title, body, kicker, image_url, posted_at")
        .order("posted_at", { ascending: false });

      if (!error) {
        setArchived((data || []).filter((a) => !isRecent(a.posted_at, 30)));
      }
      setLoading(false);
    };

    fetchArchived();
  }, []);

  return (
    <Layout>
      <div className="bg-[#f7f4ec] pt-24 pb-20 min-h-screen">

        {/* MASTHEAD */}
        <header className="max-w-5xl mx-auto px-4 text-center border-b-4 border-blue-900 pb-4 mb-2">
          <p className="text-xs md:text-sm uppercase tracking-[0.3em] text-gray-500 mb-1">
            Summer Crest Learning Academy
          </p>
          <h1 className="font-serif text-4xl md:text-6xl font-black text-blue-900 tracking-tight">
            Past Announcements
          </h1>
          <p className="font-serif italic text-gray-600 text-sm md:text-base mt-1">
            Archive of Previous School Updates
          </p>
        </header>

        <div className="max-w-5xl mx-auto px-4 flex justify-between text-xs text-gray-500 font-serif border-b border-gray-400 pb-3 mb-8">
          <a href="/announcements" className="underline hover:text-blue-900">
            ← Back to Current Announcements
          </a>
          <span>Liberty City Edition</span>
        </div>

        {/* ARCHIVE GRID */}
        {loading ? (
          <div className="text-center py-20">
            <p className="font-serif text-gray-500 text-lg">Loading archive…</p>
          </div>
        ) : archived.length === 0 ? (
          <p className="font-serif text-center text-gray-500 italic">
            No past announcements yet — check back soon.
          </p>
        ) : (
          <section className="max-w-5xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {archived.map((post) => (
                <article
                  key={post.id}
                  className="flex flex-col border-r border-gray-300 last:border-r-0 md:pr-6 opacity-90"
                >
                  {post.image_url && (
                    <img
                      src={post.image_url}
                      alt={post.title}
                      onClick={() => setActiveImage(post.image_url)}
                      className="w-full h-72 object-contain border border-gray-300 bg-white p-1 mb-3 cursor-pointer hover:opacity-90 transition"
                    />
                  )}
                  <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-1">
                    {post.posted_at}
                  </p>
                  {post.kicker && (
                    <p className="text-xs uppercase tracking-widest text-yellow-600 font-bold mb-1">
                      {post.kicker}
                    </p>
                  )}
                  <h3 className="font-serif text-xl font-bold text-blue-900 mb-2 leading-snug">
                    {post.title}
                  </h3>
                  <p className="font-serif text-gray-700 text-sm leading-relaxed">
                    {post.body}
                  </p>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* FOOTER */}
        <section className="max-w-5xl mx-auto px-4 mt-16 pt-6 border-t-2 border-blue-900 text-center">
          <p className="font-serif text-gray-500 text-xs">
            &copy; {new Date().getFullYear()} Summer Crest Learning Academy. All rights reserved.
          </p>
        </section>

        {/* LIGHTBOX */}
        {activeImage && (
          <div
            className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4"
            onClick={() => setActiveImage(null)}
          >
            <button
              onClick={() => setActiveImage(null)}
              className="absolute top-5 right-5 text-white text-4xl font-bold hover:text-yellow-400 transition"
              aria-label="Close"
            >
              &times;
            </button>
            <img
              src={activeImage}
              alt="Enlarged poster"
              onClick={(e) => e.stopPropagation()}
              className="max-h-[90vh] max-w-[90vw] object-contain shadow-2xl rounded-md bg-white p-2"
            />
          </div>
        )}
      </div>
    </Layout>
  );
}