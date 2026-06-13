import Layout from "../components/Layout";
import TopNotchHero from "../assets/images/top-notch-logo.png";

export default function Transportation() {
  return (
    <Layout>
      <div className="bg-black pb-20 pt-24 min-h-screen">

        {/* HERO SECTION */}
        <section className="relative w-full bg-black flex items-center justify-center py-10 px-4 border-b border-yellow-500/30">
          <img
            src={TopNotchHero}
            alt="Top Notch Express Transportation Service"
            className="max-h-64 w-auto object-contain"
          />
        </section>

        {/* INTRO */}
        <section className="max-w-4xl mx-auto text-center pt-12 px-4">
          <h1 className="text-3xl md:text-4xl font-extrabold text-yellow-400 mb-4 tracking-tight">
            Private Transportation Services
          </h1>
          <p className="text-gray-200 text-base md:text-lg max-w-3xl mx-auto">
            Top Notch Express Transportation Service offers private
            transportation for students and private events, with options
            available throughout Miami.
          </p>
        </section>

        {/* SERVICE OPTIONS */}
        <section className="max-w-5xl mx-auto px-4 pt-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-900 rounded-xl p-6 border border-yellow-500/20">
              <h3 className="text-yellow-400 font-semibold text-lg mb-2">
                Weekly One-Way Trips
              </h3>
              <p className="text-gray-300 text-sm md:text-base">
                Reliable weekly one-way transportation available throughout
                Miami.
              </p>
            </div>
            <div className="bg-gray-900 rounded-xl p-6 border border-yellow-500/20">
              <h3 className="text-yellow-400 font-semibold text-lg mb-2">
                Roundtrip Service
              </h3>
              <p className="text-gray-300 text-sm md:text-base">
                Roundtrip transportation options also available throughout
                Miami.
              </p>
            </div>
          </div>

          <p className="text-yellow-300 font-semibold uppercase tracking-widest text-sm text-center mt-10">
            Comfort &bull; Reliability &bull; Excellence
          </p>
        </section>

        {/* CONTACT */}
        <section className="max-w-xl mx-auto px-4 pt-10">
          <div className="bg-gray-900 rounded-xl p-6 border border-yellow-500/20 text-center">
            <h3 className="text-white font-semibold text-lg mb-2">
              For More Information
            </h3>
            <p className="text-gray-300 text-base mb-1">
              Contact: Cicily Murray
            </p>
            <a
              href="tel:7865825599"
              className="inline-block mt-3 bg-yellow-400 text-black px-8 py-3 rounded-xl shadow-md hover:bg-yellow-300 transition font-bold"
            >
              Call 786-582-5599
            </a>
          </div>
        </section>

        {/* PARTNERSHIP STATEMENT */}
        <section className="max-w-3xl mx-auto px-4 pt-16 text-center">
          <p className="text-gray-300 text-sm md:text-base italic">
            Top Notch is proudly partnered with Summer Crest Learning Academy
            to provide safe and reliable transportation for our children.
          </p>
        </section>
      </div>
    </Layout>
  );
}
