import Layout from "../components/Layout";

export default function Admissions() {
  return (
    <Layout>
      <div className="min-h-screen bg-blue-50 pb-20">

        {/* HERO */}
        <section className="relative h-[300px] w-full">
          <img
            src="https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=1400&q=80"
            alt="Young kids sitting in classroom"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-purple-800 bg-opacity-40 flex items-center justify-center">
            <h1 className="text-white text-4xl font-bold text-center drop-shadow-lg">
              Admissions at Summer Crest Learning Academy
            </h1>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4">

          {/* INTRO */}
          <section className="py-10 text-center bg-pink-100 rounded-3xl shadow-lg mt-10 px-6">
            <p className="text-gray-700 text-lg leading-relaxed max-w-3xl mx-auto">
              We’re excited to welcome new families! Our admissions process is simple,
              supportive, and designed to make your transition smooth and joyful.
            </p>
          </section>

          {/* ENROLLMENT STEPS */}
          <section className="bg-yellow-100 rounded-3xl shadow-lg p-10 mt-12 border border-yellow-200">
            <h2 className="text-3xl font-bold text-yellow-900 mb-6 text-center">
              Enrollment Steps
            </h2>

            <div className="grid md:grid-cols-2 gap-10 items-center">
              <img
                src="https://images.unsplash.com/photo-1590410501629-87b1f6e963d1?auto=format&fit=crop&w=1400&q=80"
                alt="Kids painting and smiling"
                className="rounded-2xl shadow-md object-cover h-64 w-full"
              />

              <ol className="list-decimal pl-6 space-y-3 text-gray-800 text-lg">
                <li>Complete the admissions application.</li>
                <li>Submit required documents.</li>
                <li>Meet our admissions team.</li>
                <li>Tour our campus and classrooms.</li>
                <li>Receive acceptance and next steps!</li>
              </ol>
            </div>
          </section>

          {/* DOCUMENTS SECTION */}
          <section className="py-12 mt-12 bg-green-100 rounded-3xl shadow-inner px-6">
            <h2 className="text-3xl font-bold text-green-900 mb-6 text-center">
              Required Documents
            </h2>

            <ul className="list-disc pl-6 space-y-2 text-gray-700 text-lg max-w-3xl mx-auto">
              <li>Child’s birth certificate</li>
              <li>Immunization and health records</li>
              <li>Proof of residency</li>
              <li>Any previous school records (if applicable)</li>
              <li>Completed application form</li>
            </ul>

            {/* Image Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 max-w-5xl mx-auto">
              <img
                src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1400&q=80"
                className="rounded-2xl h-48 w-full object-cover shadow-lg"
                alt="Kids smiling"
              />
              <img
                src="https://images.unsplash.com/photo-1555529669-e69e7aa0ba9c?auto=format&fit=crop&w=1400&q=80"
                className="rounded-2xl h-48 w-full object-cover shadow-lg"
                alt="Kids at desks"
              />
              <img
                src="https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=1400&q=80"
                className="rounded-2xl h-48 w-full object-cover shadow-lg"
                alt="Kids doing art"
              />
            </div>
          </section>

          {/* TUITION */}
          <section className="bg-blue-100 rounded-3xl shadow-lg p-10 mt-12 border border-blue-200">
            <h2 className="text-3xl font-bold text-blue-900 mb-4">
              Tuition & Fees
            </h2>

            <p className="text-gray-700 text-lg mb-4">
              Tuition varies by age group and program. Contact our admissions team for
              full details and payment plan options.
            </p>

            <p className="text-lg text-gray-700">
              Email: <span className="font-semibold text-blue-700">
                admissions@summercrestacademy.com
              </span>
            </p>
            <p className="text-lg text-gray-700">
              Phone: <span className="font-semibold text-blue-700">(555) 123-4567</span>
            </p>
          </section>

          {/* TOUR CTA */}
          <section className="text-center py-16 mt-16 bg-purple-200 rounded-3xl shadow-inner">
            <h2 className="text-3xl font-bold text-purple-900 mb-4">
              Schedule a School Tour
            </h2>
            <p className="text-gray-800 text-lg max-w-2xl mx-auto mb-6">
              Come explore our classrooms, meet our teachers, and see firsthand why
              families love being part of Summer Crest Learning Academy.
            </p>

            <a
              href="/contact"
              className="bg-purple-700 text-white px-8 py-3 rounded-2xl shadow hover:bg-purple-800 transition"
            >
              Book Your Tour
            </a>
          </section>

        </div>
      </div>
    </Layout>
  );
}

