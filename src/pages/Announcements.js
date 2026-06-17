import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import Layout from "../components/Layout";

function isRecent(dateStr, days = 30) {
  const posted = new Date(dateStr);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return posted >= cutoff;
}

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("id, title, body, kicker, image_url, posted_at")
        .order("posted_at", { ascending: false });

      if (!error) setAnnouncements(data || []);
      setLoading(false);
    };

    fetchAnnouncements();
  }, []);

  const recent = announcements.filter((a) => isRecent(a.posted_at, 30));
  const featured = recent[0];
  const rest = recent.slice(1);

  return (
    <Layout>
      <div className="bg-[#f7f4ec] pt-24 pb-20 min-h-screen">

        {/* MASTHEAD */}
        <header className="max-w-5xl mx-auto px-4 text-center border-b-4 border-blue-900 pb-4 mb-2">
          <p className="text-xs md:text-sm uppercase tracking-[0.3em] text-gray-500 mb-1">
            Summer Crest Learning Academy
          </p>
          <h1 className="font-serif text-4xl md:text-6xl font-black text-blue-900 tracking-tight">
            The Summer Crest Gazette
          </h1>
          <p className="font-serif italic text-gray-600 text-sm md:text-base mt-1">
            School Updates &amp; Announcements
          </p>
        </header>

        <div className="max-w-5xl mx-auto px-4 flex justify-between text-xs text-gray-500 font-serif border-b border-gray-400 pb-3 mb-8">
          <span>Liberty City Edition</span>
          <span>Latest News for Our Families</span>
        </div>

        {loading ? (
          <div className="max-w-5xl mx-auto px-4 text-center py-20">
            <p className="font-serif text-gray-500 text-lg">Loading latest news…</p>
          </div>
        ) : recent.length === 0 ? (
          <div className="max-w-5xl mx-auto px-4 text-center py-20">
            <p className="font-serif text-gray-500 text-lg">No recent announcements.</p>
            <a href="/announcements/archive" className="font-serif text-blue-900 underline hover:text-blue-700 mt-4 inline-block">
              View Past Announcements →
            </a>
          </div>
        ) : (
          <>
            {/* FEATURED STORY */}
            {featured && (
              <section className="max-w-5xl mx-auto px-4 mb-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center border-b border-gray-300 pb-10">
                  {featured.image_url && (
                    <img
                      src={featured.image_url}
                      alt={featured.title}
                      onClick={() => setActiveImage(featured.image_url)}
                      className="w-full h-96 object-contain border border-gray-300 shadow-md bg-white p-2 cursor-pointer hover:opacity-90 transition"
                    />
                  )}
                  <div>
                    {featured.kicker && (
                      <p className="text-xs uppercase tracking-widest text-yellow-600 font-bold mb-2">
                        {featured.kicker}
                      </p>
                    )}
                    <h2 className="font-serif text-3xl md:text-4xl font-bold text-blue-900 mb-2 leading-tight">
                      {featured.title}
                    </h2>
                    <p className="font-serif text-gray-500 text-sm mb-4">
                      Posted: {featured.posted_at}
                    </p>
                    <p className="font-serif text-gray-800 text-base md:text-lg leading-relaxed mb-4">
                      {featured.body}
                    </p>
                    <a
                      href="tel:7865825599"
                      className="inline-block bg-yellow-400 text-blue-900 px-6 py-2.5 rounded-xl shadow-md hover:bg-yellow-300 transition font-bold"
                    >
                      Call to Enroll: 786-582-5599
                    </a>
                  </div>
                </div>
              </section>
            )}

            {/* NEWS GRID */}
            {rest.length > 0 && (
              <section className="max-w-5xl mx-auto px-4">
                <h2 className="font-serif text-2xl font-bold text-blue-900 border-b-2 border-blue-900 mb-8 pb-1">
                  More News
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {rest.map((post) => (
                    <article
                      key={post.id}
                      className="flex flex-col border-r border-gray-300 last:border-r-0 md:pr-6"
                    >
                      {post.image_url && (
                        <img
                          src={post.image_url}
                          alt={post.title}
                          onClick={() => setActiveImage(post.image_url)}
                          className="w-full h-72 object-contain border border-gray-300 bg-white p-1 mb-3 cursor-pointer hover:opacity-90 transition"
                        />
                      )}
                      <p className="text-xs uppercase tracking-widest text-yellow-600 font-bold mb-1">
                        {post.posted_at}
                      </p>
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
          </>
        )}

        {/* VIEW PAST ANNOUNCEMENTS */}
        <div className="text-center mt-16 pt-6 border-t-2 border-blue-900">
          <a
            href="/announcements/archive"
            className="font-serif text-blue-900 underline hover:text-blue-700 text-lg"
          >
            View Past Announcements →
          </a>
        </div>

        {/* FOOTER NOTE */}
        <section className="max-w-5xl mx-auto px-4 mt-8 text-center">
          <p className="font-serif italic text-gray-600 text-sm mb-2">
            Have questions regarding the announcements? Contact the front office at{" "}
            <a href="mailto:info@summercrestacademy.com" className="text-blue-900 underline">
              info@summercrestacademy.com
            </a>.
          </p>
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
