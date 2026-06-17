import Layout from "../components/Layout";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import TransportImg from "../assets/images/bus.jpg";
import TransportationPDF from "../assets/pdfs/SummerCrest_Transportation_Form.pdf";
import SCLAPoliciesPDF from "../assets/pdfs/SCLA_Policies_Procedures.pdf";
import SCLAConductPDF from "../assets/pdfs/SCLA_Code_of_Conduct.pdf";

const eventColors = {
  event: "bg-blue-100 text-blue-800 border-blue-300",
  important: "bg-yellow-100 text-yellow-800 border-yellow-300",
  noschool: "bg-red-100 text-red-700 border-red-300",
};

export default function Resources() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from("calendar_events")
        .select("id, title, date, type, description");
      if (!error) setEvents(data || []);
    };
    fetchEvents();
  }, []);

  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];
  const daysOfWeek = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  const goToPrevMonth = () =>
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  const goToNextMonth = () =>
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarCells = [];
  for (let i = 0; i < firstDay; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);

  const importantEventsThisMonth = events.filter((e) => {
    const [yStr, mStr] = e.date.split("-");
    return Number(yStr) === year && Number(mStr) === month + 1 && e.type === "important";
  });

  return (
    <Layout>
      <div className="bg-gray-50 pb-20">
        {/* HERO */}
        <section className="relative h-[250px] w-full bg-blue-900 flex items-center justify-center">
          <h1 className="text-white text-4xl md:text-5xl font-extrabold drop-shadow tracking-tight">
            Family Resources
          </h1>
        </section>

        {/* CALENDAR */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-blue-900 mb-6 text-center">School Calendar</h2>

          <div className="flex items-center justify-between max-w-md mx-auto mb-6">
            <button onClick={goToPrevMonth}
              className="bg-blue-700 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-800">◀</button>
            <h3 className="text-xl font-semibold text-blue-900">{monthNames[month]} {year}</h3>
            <button onClick={goToNextMonth}
              className="bg-blue-700 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-800">▶</button>
          </div>

          <div className="grid grid-cols-7 gap-3 mb-8">
            {daysOfWeek.map((day) => (
              <div key={day} className="text-center font-semibold text-blue-800">{day}</div>
            ))}
            {calendarCells.map((date, index) => {
              const fullDate = date
                ? `${year}-${String(month + 1).padStart(2, "0")}-${String(date).padStart(2, "0")}`
                : null;
              const event = fullDate ? events.find((e) => e.date === fullDate) : null;

              return (
                <div key={index}
                  className={`h-24 border rounded-xl shadow-sm p-1 flex flex-col items-center justify-start ${
                    date ? "bg-white" : "bg-gray-100"
                  } border-gray-300`}>
                  {date && <span className="text-gray-800 font-bold mb-1">{date}</span>}
                  {event && (
                    <span className={`text-[0.65rem] px-2 py-1 rounded-lg text-center mt-1 leading-snug border ${eventColors[event.type] || eventColors.event}`}>
                      {event.title}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Important Dates */}
          <div className="max-w-3xl mx-auto mt-6">
            <h3 className="text-2xl font-bold text-blue-900 mb-3 text-center">Important Dates This Month</h3>
            {importantEventsThisMonth.length === 0 ? (
              <p className="text-center text-gray-600">No important dates listed for this month yet.</p>
            ) : (
              <ul className="space-y-2">
                {importantEventsThisMonth.map((event) => {
                  const [, mStr, dStr] = event.date.split("-");
                  return (
                    <li key={event.id}
                      className="flex items-center justify-between bg-white border border-yellow-300 rounded-lg px-4 py-2 shadow-sm">
                      <span className="font-semibold text-blue-900">
                        {monthNames[Number(mStr) - 1]} {Number(dStr)}
                      </span>
                      <span className="text-gray-800 text-sm md:text-base">{event.title}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>

        {/* DOCUMENTS */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-blue-900 text-center mb-10">Important Documents</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Policies & Procedures", link: SCLAPoliciesPDF, desc: "School expectations, arrival/dismissal, attendance, safety protocols." },
              { title: "Code of Conduct", link: SCLAConductPDF, desc: "Behavior expectations that support a safe and respectful school environment." },
              { title: "Tuition & Fee Schedule", link: "#", desc: "Current tuition rates, payment options, and financial policies." },
            ].map((item, idx) => (
              <a key={idx} href={item.link}
                className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition block">
                <h3 className="text-xl font-semibold text-blue-900 mb-3">{item.title}</h3>
                <div className="h-1 w-12 bg-yellow-400 rounded mb-3" />
                <p className="text-gray-700 text-sm">{item.desc}</p>
              </a>
            ))}
          </div>
        </section>

        {/* TRANSPORTATION */}
        <section className="max-w-5xl mx-auto px-4 py-10">
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden grid grid-cols-1 md:grid-cols-3">
            <div className="h-40 md:h-full w-full md:col-span-1">
              <img src={TransportImg} alt="Transportation services" className="h-full w-full object-cover" />
            </div>
            <div className="p-5 md:col-span-2 flex flex-col justify-center">
              <h2 className="text-2xl font-bold text-blue-900 mb-2">Transportation Services</h2>
              <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                If your child needs a ride to and from school, our transportation team is here to help. We offer reliable, safe bus routes with clear pick-up and drop-off procedures for all families.
              </p>
              <ul className="space-y-1 text-gray-700 text-sm mb-4">
                <li className="flex items-start gap-2"><span className="w-2 h-2 bg-yellow-400 rounded-full mt-1" />Morning & afternoon bus routes</li>
                <li className="flex items-start gap-2"><span className="w-2 h-2 bg-yellow-400 rounded-full mt-1" />Verified pick-up/drop-off protocols</li>
                <li className="flex items-start gap-2"><span className="w-2 h-2 bg-yellow-400 rounded-full mt-1" />Safety-first transportation staff</li>
              </ul>
              <div className="flex flex-col sm:flex-row gap-3">
                <a href="/transportation"
                  className="bg-blue-700 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-800 transition text-sm font-semibold text-center">
                  Request Transportation
                </a>
                <a href={TransportationPDF}
                  className="border border-blue-700 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-50 transition text-sm font-semibold text-center">
                  Download Form
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto text-center px-4 py-16">
          <h2 className="text-3xl font-bold text-blue-900 mb-4">Need Additional Support?</h2>
          <a href="/contact"
            className="bg-blue-700 text-white px-8 py-3 rounded-xl shadow-md hover:bg-blue-800 transition font-semibold">
            Contact Our Office
          </a>
        </section>
      </div>
    </Layout>
  );
}

