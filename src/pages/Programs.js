import Layout from "../components/Layout";
import EarlyChildhood from "../assets/images/kidCarpet.jpg";
import ElementarySchool from "../assets/images/fieldTrip3.jpg";
import AfterSchool from "../assets/images/fieldTrip.jpg";

export default function Programs() {
  const programs = [
    {
      title: "Early Childhood",
      img: EarlyChildhood,
      desc: "A nurturing, play-based learning environment designed to build early literacy, social skills, and curiosity.",
      items: [
        "Hands-on activities",
        "Learning centers",
        "Social-emotional development",
        "Early literacy foundations"
      ]
    },
    {
      title: "Elementary School",
      img: ElementarySchool,
      desc: "Strong academic instruction with caring teachers who help students grow in confidence, independence, and leadership.",
      items: [
        "English Language Arts",
        "Math & problem-solving",
        "Science exploration",
        "Social studies & community learning"
      ]
    },
    {
      title: "After-School Enrichment",
      img: AfterSchool,
      desc: "Designed to keep students active, engaged, and supported after the school day ends.",
      items: [
        "Homework assistance",
        "Sports & fitness",
        "Arts & creativity",
        "STEM clubs & activities"
      ]
    }
  ];

  return (
    <Layout>
      <div className="bg-gray-50 pb-20">

        {/* HERO */}
        <section className="relative h-[250px] w-full bg-blue-900 flex items-center justify-center">
          <h1 className="text-white text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow">
            Our Programs
          </h1>
        </section>

        {/* INTRO */}
        <section className="max-w-4xl mx-auto text-center py-12 px-4">
          <h2 className="text-3xl font-bold text-blue-900 mb-4">
            Learning for Every Stage
          </h2>
          <p className="text-gray-700 text-lg leading-relaxed max-w-2xl mx-auto">
            At Summer Crest Learning Academy, we support students from their early
            years through elementary grades with structured academics, meaningful
            relationships, and joyful learning experiences.
          </p>
        </section>

        {/* PROGRAM CARDS */}
        <section className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-10">
          {programs.map((program, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden"
            >
              <img
                src={program.img}
                alt={program.title}
                className="h-48 w-full object-cover"
              />

              <div className="p-6">
                <h3 className="text-xl font-bold text-blue-900 mb-2">
                  {program.title}
                </h3>
                <p className="text-gray-700 mb-4">
                  {program.desc}
                </p>

                <ul className="space-y-2 text-gray-700 text-sm">
                  {program.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-yellow-400 rounded-full mt-1" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto text-center px-4 py-16">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">
            Ready to Enroll Your Child?
          </h2>

          <a
            href="/admissions"
            className="bg-blue-700 text-white px-8 py-3 rounded-xl shadow-md hover:bg-blue-800 transition font-semibold"
          >
            View Admissions
          </a>
        </section>

      </div>
    </Layout>
  );
}

