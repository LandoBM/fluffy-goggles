import Layout from "../components/Layout";
import Placeholder from "../assets/images/kidStudy.jpg"; 
import Principal from "../assets/images/IMG_2459 2.jpg"
import firstGrade from "../assets/images/nesha.JPG";

export default function Staff() {

  const principal = {
    name: "Principal Cicily Murray",
    role: "School Principal",
    img: Principal,
    desc: "Dedicated to creating a safe, inclusive learning environment for all students."
  };

  const teachers = [
    {
      name: "Christiane Moncoeur",
      role: "Pre-K & Kindergarten Teacher",
      //img: Placeholder,
      desc: "Passionate about early childhood development and hands-on learning.",
    },
    {
      name: "Tanesha Keith-Graham",
      role: "1st Grade Teacher",
      img: firstGrade,
      desc: "Focused on literacy, confidence-building, and structured learning."
    },
    {
      name: "Tina Farley",
      role: "2nd - 5th Grade Teacher",
      //img: Placeholder,
      desc: "Encourages creativity, curiosity, and critical thinking."
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
            Our staff is committed to helping every student grow academically,
            socially, and emotionally. Strong relationships and high expectations
            guide everything we do.
          </p>
        </section>

        {/* PRINCIPAL - TOP OF TREE */}
        <section className="max-w-xl mx-auto text-center mb-16">
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 flex flex-col items-center">
            <img
              src={principal.img}
              alt={principal.name}
              className="h-36 w-36 object-cover rounded-full border-4 border-yellow-400 shadow-md mb-4"
            />
            <h3 className="text-2xl font-bold text-blue-900">{principal.name}</h3>
            <p className="text-blue-700 font-semibold mb-2">{principal.role}</p>
            <p className="text-gray-700 text-sm">{principal.desc}</p>
          </div>

          {/* connecting line */}
          <div className="w-1 h-12 bg-gray-300 mx-auto mt-4"></div>
        </section>

        {/* TEACHERS ROW */}
        <section className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-10">
          {teachers.map((staff, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-6 flex flex-col items-center text-center"
            >
              <img
                src={staff.img}
                alt={staff.name}
                className="h-32 w-32 object-cover rounded-full border-4 border-blue-300 shadow-md mb-4"
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

