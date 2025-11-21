import Layout from "../components/Layout";
import KidsStudying from "../assets/images/kidStudy.jpg";
import EarlyChildhood from "../assets/images/kidCarpet.jpg";
import ElementarySchool from "../assets/images/fieldTrip3.jpg";
import AfterSchool from "../assets/images/fieldTrip.jpg";
import FieldTrip from "../assets/images/fieldTrip4.jpg";
import Mascot from "../assets/images/mascot.png";

export default function Home() {
  return (
    <Layout>
      <div className="bg-gray-50 pb-20">

        {/* HERO SECTION */}
        <section className="relative h-[380px] w-full">
          <img
            src={KidsStudying}
            alt="Student studying"
            className="w-full h-full object-cover"
            draggable="false"
          />

          <div className="absolute inset-0 bg-blue-900/60 flex flex-col items-center justify-center text-white px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-3 drop-shadow-lg tracking-tight">
              Welcome to Summer Crest Learning Academy
            </h1>
            <p className="text-lg md:text-xl max-w-2xl drop-shadow-sm">
              A safe, caring environment for Pre-K through 5th grade students to learn,
              explore, and grow.
            </p>
          </div>
        </section>

        {/* COMMUNITY STATEMENT */}
        <section className="max-w-5xl mx-auto text-center py-8 px-4">
          <p className="text-blue-900 font-semibold text-lg md:text-xl">
            Proudly serving the Liberty City community.
          </p>
        </section>

        {/* HIGHLIGHTS */}
        <section className="max-w-6xl mx-auto py-4 px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Academic Excellence",
              text: "Rigorous, engaging instruction that supports every child’s growth.",
            },
            {
              title: "Whole-Child Support",
              text: "Social-emotional learning and a focus on confidence, kindness, and character.",
            },
            {
              title: "Safe & Structured",
              text: "Clear expectations, caring adults, and a welcoming school community.",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl p-6 shadow-md border border-gray-200 flex flex-col"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-1 rounded-full bg-yellow-400" />
                <h3 className="text-xl font-semibold text-blue-900">
                  {item.title}
                </h3>
              </div>
              <p className="text-gray-700 text-sm md:text-base">
                {item.text}
              </p>
            </div>
          ))}
        </section>

        {/* WHY FAMILIES CHOOSE US */}
        <section className="py-16 mt-8">
          <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <img
                src={FieldTrip}
                alt="Students on a field trip"
                className="rounded-2xl shadow-xl object-cover h-80 w-full border border-gray-200"
              />
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-blue-900">
                Why Families Choose Summer Crest
              </h2>
              <p className="text-gray-700 text-base md:text-lg">
                Families trust us to provide a structured, joyful learning environment
                where every child is known, supported, and encouraged to do their best.
              </p>
              <ul className="list-disc pl-5 text-gray-800 space-y-2 text-sm md:text-base">
                <li>Certified, caring teachers in every classroom</li>
                <li>Small class sizes for more individual attention</li>
                <li>Strong communication and partnership with families</li>
                <li>Field trips, enrichment, and hands-on learning experiences</li>
              </ul>
            </div>
          </div>
        </section>

        {/* PROGRAMS PREVIEW */}
        <section className="max-w-6xl mx-auto py-16 px-4">
          <h2 className="text-3xl font-bold text-center text-blue-900 mb-10">
            Programs We Offer
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                img: EarlyChildhood,
                title: "Early Childhood",
                desc: "Pre-K programs focused on play, language, and early literacy.",
              },
              {
                img: ElementarySchool,
                title: "Elementary School",
                desc: "Core academics, creativity, and character-building for grades K–5.",
              },
              {
                img: AfterSchool,
                title: "After-School Programs",
                desc: "Safe, structured after-school care with homework help and activities.",
              },
            ].map((p, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 flex flex-col"
              >
                <img
                  src={p.img}
                  alt={p.title}
                  className="h-48 w-full object-cover"
                />
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-semibold text-blue-900 text-lg mb-1">
                    {p.title}
                  </h3>
                  <div className="h-1 w-10 bg-yellow-400 rounded mb-2" />
                  <p className="text-gray-700 text-sm mt-1 flex-1">
                    {p.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* COMMUNITY AT OUR CORE */}
        <section className="max-w-6xl mx-auto text-center py-12 px-4 bg-blue-900 rounded-3xl shadow-md mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">
            Community at Our Core
          </h2>
          <p className="text-gray-100 text-lg max-w-2xl mx-auto">
            Summer Crest Learning Academy is deeply rooted in Liberty City. We partner
            with families and community organizations to help every child thrive.
          </p>
        </section>

        {/* MASCOT + CTA */}
        <section className="py-16 bg-white rounded-3xl mx-4 shadow-md border border-gray-200">
          <div className="max-w-4xl mx-auto text-center px-4">
            <img
              src={Mascot}
              className="mx-auto h-40 w-auto mb-4 drop-shadow-lg"
              alt="Leo the Lion mascot"
            />
            <h2 className="text-3xl font-bold text-blue-900 mb-2">
              Meet Leo the Lion
            </h2>
            <p className="text-gray-700 text-lg mb-6">
              Leo represents courage, curiosity, and leadership the qualities we build
              into every student at Summer Crest Learning Academy.
            </p>

            <a
              href="/admissions"
              className="inline-block bg-blue-700 text-white px-8 py-3 rounded-xl shadow-md hover:bg-blue-800 transition font-semibold"
            >
              Learn About Admissions
            </a>
          </div>
        </section>
      </div>
    </Layout>
  );
}


