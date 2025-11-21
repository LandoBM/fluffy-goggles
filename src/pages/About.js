import Layout from "../components/Layout";
import FieldTrip from "../assets/images/fieldTrip.jpg";
import KidsStudying from "../assets/images/kidStudy.jpg";
import Classroom from "../assets/images/fieldTrip3.jpg"; // add any image you want

export default function About() {
  return (
    <Layout>
      <div className="bg-gray-50 pb-20">

        {/* HERO */}
        <section className="relative h-[300px] w-full">
          <img
            src={KidsStudying}
            alt="Students learning"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-blue-900/60 flex items-center justify-center">
            <h1 className="text-white text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow-lg">
              About Us
            </h1>
          </div>
        </section>

        {/* MISSION */}
        <section className="max-w-5xl mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold text-blue-900 mb-6">Our Mission</h2>
          <p className="text-gray-700 text-lg leading-relaxed max-w-3xl mx-auto">
            Summer Crest Learning Academy provides a safe, structured, and joyful
            environment where every child develops confidence, curiosity, and a lifelong
            love for learning. We believe that strong academics, caring adults, and
            meaningful community partnerships help children reach their full potential.
          </p>
        </section>

        {/* PRINCIPAL WELCOME */}
        <section className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <img
            src={Classroom}
            alt="Teacher and students"
            className="rounded-2xl shadow-xl object-cover h-80 w-full border border-gray-200"
          />

          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-blue-900">
              A Message From Our Principal
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed">
              Summer Crest is more than a school it’s a family. Our staff is dedicated
              to building strong relationships with every student and supporting them
              academically, socially, and emotionally.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed">
              We believe children thrive when they feel seen, valued, and encouraged.
              Thank you for considering our school as a place for your child to grow.
            </p>
            <p className="text-blue-700 font-semibold text-lg">— Principal Cicily Murray</p>
          </div>
        </section>

        {/* CORE VALUES */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-center text-blue-900 mb-10">
            Our Core Values
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Excellence",
                text: "We hold high expectations and provide the support students need to succeed.",
              },
              {
                title: "Character",
                text: "We emphasize kindness, leadership, responsibility, and respect.",
              },
              {
                title: "Community",
                text: "We build strong connections with families and our Liberty City neighborhood.",
              },
            ].map((value, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl p-6 shadow-md border border-gray-200"
              >
                <h3 className="text-xl font-bold text-blue-900 mb-3">
                  {value.title}
                </h3>
                <div className="h-1 w-12 bg-yellow-400 rounded mb-3" />
                <p className="text-gray-700">{value.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CAMPUS & COMMUNITY */}
        <section className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-blue-900">
              Our Campus & Community
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed">
              Located in the heart of Liberty City, Summer Crest Learning Academy is proud 
              to serve a vibrant, diverse community. Our campus provides bright classrooms,
              safe play areas, and learning spaces designed to inspire creativity and growth.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed">
              We work closely with families and community partners to support student success
              in and out of the classroom.
            </p>
          </div>

          <img
            src={FieldTrip}
            alt="Campus and students"
            className="rounded-2xl shadow-xl object-cover h-80 w-full border border-gray-200"
          />
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto text-center px-4 py-16">
          <h2 className="text-3xl font-bold text-blue-900 mb-4">
            Ready to Learn More?
          </h2>
          <a
            href="/admissions"
            className="bg-blue-700 text-white px-8 py-3 rounded-xl shadow-md hover:bg-blue-800 transition font-semibold"
          >
            Explore Admissions
          </a>
        </section>
      </div>
    </Layout>
  );
}
