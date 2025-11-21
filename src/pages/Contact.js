import Layout from "../components/Layout";
import FieldTrip from "../assets/images/fieldTrip4.jpg";
import { useState } from "react";

export default function Contact() {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setResult("");

    const formData = new FormData(event.target);

    // REQUIRED — This must be appended here (Web3Forms requirement)
    formData.append("access_key", "a318f1d3-ca65-4d9b-9c40-e6958216941a");

    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    if (data.success) {
      setResult("SUCCESS");
      event.target.reset();
    } else {
      setResult("ERROR");
    }

    setLoading(false);
  };

  return (
    <Layout>
      <div className="bg-gray-50 pb-20">

        {/* HERO */}
        <section className="relative h-[250px] w-full bg-blue-900 flex items-center justify-center">
          <h1 className="text-white text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow">
            Contact Us
          </h1>
        </section>

        {/* CONTACT INFO */}
        <section className="max-w-6xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-2 gap-12">

          {/* INFO BLOCK */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-blue-900">We're Here to Help</h2>
            <p className="text-gray-700">
              Whether you have questions about enrollment, academics, operations, or community partnerships,
              we are here to support you.
            </p>

            <div className="space-y-3">
              <p><span className="font-semibold text-blue-900">Phone:</span> (555) 123-4567</p>

              <p>
                <span className="font-semibold text-blue-900">Email:</span>
                <a href="#contact-form" className="text-blue-700 underline ml-1">
                  admissions@summercrestacademy.com
                </a>
              </p>

              <p><span className="font-semibold text-blue-900">Address:</span> 6161 Northwest 9th Avenue, Miami, FL</p>
              <p><span className="font-semibold text-blue-900">Office Hours:</span> Mon–Fri, 7:30 AM – 4:30 PM</p>
            </div>
          </div>

          {/* IMAGE */}
          <div>
            <img
              src={FieldTrip}
              alt="School community"
              className="rounded-2xl shadow-xl object-cover h-80 w-full border border-gray-200"
            />
          </div>
        </section>

        {/* FORM */}
        <section className="max-w-4xl mx-auto px-4 py-12">
          <h2 className="text-3xl font-bold text-blue-900 text-center mb-8">Send Us a Message</h2>

          {/* SUCCESS / ERROR */}
          {result === "SUCCESS" && (
            <p className="mb-6 p-4 text-green-800 bg-green-100 border border-green-300 rounded-xl text-center">
              Message sent successfully!
            </p>
          )}

          {result === "ERROR" && (
            <p className="mb-6 p-4 text-red-800 bg-red-100 border border-red-300 rounded-xl text-center">
              Something went wrong — please try again.
            </p>
          )}

          <form
            id="contact-form"
            onSubmit={onSubmit}
            className="bg-white p-8 rounded-2xl shadow-md border border-gray-200 space-y-6"
          >

            <input type="hidden" name="from_domain" value="http://localhost:3000/contact#contact-form" />

            {/* NAME */}
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Your Name</label>
              <input
                type="text"
                name="name"
                required
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3"
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Your Email</label>
              <input
                type="email"
                name="email"
                required
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3"
              />
            </div>

            {/* PHONE */}
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Phone Number (optional)</label>
              <input
                type="text"
                name="phone"
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3"
              />
            </div>

            {/* MESSAGE */}
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Message</label>
              <textarea
                name="message"
                required
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 h-32 resize-none"
              ></textarea>
            </div>

            {/* FILE UPLOAD */}
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Upload Document (optional)</label>
              <input
                type="file"
                name="files[]"
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2"
              />
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-blue-700 text-white py-3 rounded-xl font-semibold hover:bg-blue-800 transition ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </section>

      </div>
    </Layout>
  );
}


