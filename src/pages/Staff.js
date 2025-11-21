import Layout from "../components/Layout";

// Example staff images — replace with your real staff photos
import Placeholder from "../assets/images/kidStudy.jpg"; 
// Add your real files later: Teacher1.jpg, Principal.jpg, etc.

export default function Staff() {
  const staffList = [
    {
      name: "Principal Cicily Murray",
      role: "School Principal",
      img: Placeholder,
      desc: "Dedicated to creating a safe, inclusive learning environment for all students."
    },
    {
      name: "Ms. Johnson",
      role: "Kindergarten Teacher",
      img: Placeholder,
      desc: "Passionate about early childhood development and hands-on learning."
    },
    {
      name: "Mr. Carter",
      role: "1st Grade Teacher",
      img: Placeholder,
      desc: "Focused on literacy, confidence-building, and structured learning."
    },
    {
      name: "Ms. Williams",
      role: "2nd Grade Teacher",
      img: Placeholder,
      desc: "Encourages creativity, curiosity, and critical thinking."
    },
    {
      name: "Ms. Lopez",
      role: "3rd Grade Teacher",
      img: Placeholder,
      desc: "Loves developing strong readers and independent problem-solvers."
    },
    {
      name: "Coach Brown",
      role: "Physical Education",
      img: Placeholder,
      desc: "Committed to keeping students active, healthy, and confident."
    },
  ];

  return (
    <Layout>
      <div className="bg-gray-50 pb-20">

        {/* HERO */}
        <section className="relative h-[250px] w-full bg-blue-900 flex items-center justify-center">
          <h1 className="text-white text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow">
            Our Staff
          </h1>
        </section>

        {/* INTRO */}
        <section className="max-w-4xl mx-auto text-center py-12 px-4">
          <h2 className="text-3xl font-bold text-blue-900 mb-4">
            Meet the Educators Behind Summer Crest
          </h2>
          <p className="text-gray-700 text-lg leading-relaxed max-w-2xl mx-auto">
            Our teachers and staff are dedicated, experienced, and committed 
            to supporting the growth and success of every child. We believe 
            in strong relationships, high expectations, and a warm school culture.
          </p>
        </section>

        {/* STAFF GRID */}
        <section className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-10">
          {staffList.map((staff, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-6 flex flex-col items-center text-center"
            >
              <img
                src={staff.img}
                alt={staff.name}
                className="h-32 w-32 object-cover rounded-full border-4 border-yellow-400 shadow-md mb-4"
              />
              <h3 className="text-xl font-bold text-blue-900">{staff.name}</h3>
              <p className="text-blue-700 font-semibold mb-2">{staff.role}</p>
              <p className="text-gray-700 text-sm">{staff.desc}</p>
            </div>
          ))}
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto text-center px-4 py-16">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">
            Want to Join Our Team?
          </h2>
          <a
            href="/contact"
            className="bg-blue-700 text-white px-8 py-3 rounded-xl shadow-md hover:bg-blue-800 transition font-semibold"
          >
            Contact the Office
          </a>
        </section>
      </div>
    </Layout>
  );
}

