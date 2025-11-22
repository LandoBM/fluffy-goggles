import { useState } from "react";
import Layout from "../components/Layout";
import FieldTrip from "../assets/images/fieldTrip4.jpg";

export default function Contact() {
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    const form = e.target;
    const formData = new FormData(form);

    // Send to Formspree via AJAX
    const response = await fetch("https://formspree.io/f/xldvjjzo", {
      method: "POST",
      body: formData,
      headers: { Accept: "application/json" },
    });

    if (response.ok) {
      form.reset();

      // Redirect to Thank You page
      window.location.href = "/thank-you";
    } else {
      alert("Something went wrong. Please try again.");
    }

    setSubmitting(false);
  }

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
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-blue-900">
              We're Here to Help
            </h2>
            <p className="text-gray-700">
              Whether you have questions about enrollment, academics,
              operations, or community partnerships, we are here to support you.
            </p>

            <div className="space-y-3">
              <p>
                <span className="font-semibold text-blue-900">Phone:</span>{" "}
                (786) 582-5599
              </p>
              <p>
                <span className="font-semibold text-blue-900">Email:</span>
                <a
                  href="#contact-form"
                  className="text-blue-700 underline ml-1"
                >
                  admissions@summercrestacademy.com
                </a>
              </p>
              <p>
                <span className="font-semibold text-blue-900">Address:</span>{" "}
                6161 Northwest 9th Avenue, Miami, FL
              </p>
              <p>
                <span className="font-semibold text-blue-900">
                  Office Hours:
                </span>{" "}
                Mon–Fri, 7:30 AM – 4:30 PM
              </p>
            </div>
          </div>

          <div>
            <img
              src={FieldTrip}
              alt="School community"
              className="rounded-2xl shadow-xl object-cover h-80 w-full border border-gray-200"
            />
          </div>
        </section>

        {/* FORM SECTION */}
        <section id="contact-form" className="max-w-4xl mx-auto px-4 py-12">
          <h2 className="text-3xl font-bold text-blue-900 text-center mb-8">
            Send Us a Message
          </h2>

          <form
            onSubmit={handleSubmit}
            className="bg-white p-8 rounded-2xl shadow-md border border-gray-200 space-y-6"
          >
            {/* Hidden subject */}
            <input
              type="hidden"
              name="_subject"
              value="New Contact Message - Summer Crest Learning Academy"
            />

            {/* NAME */}
            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                Your Name
              </label>
              <input
                type="text"
                name="name"
                required
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3"
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                Your Email
              </label>
              <input
                type="email"
                name="email"
                required
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3"
              />
            </div>

            {/* PHONE */}
            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                Phone Number (optional)
              </label>
              <input
                type="text"
                name="phone"
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3"
              />
            </div>

            {/* MESSAGE */}
            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                Message
              </label>
              <textarea
                name="message"
                required
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 h-32 resize-none"
              ></textarea>
            </div>

            {/* FILE */}
            {/* <div>
              <label className="block text-gray-700 font-semibold mb-1">Upload Document (optional)</label>
              <input
                type="file"
                name="attachment"
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2"
              />
            </div> */}

            <button
              type="submit"
              disabled={submitting}
              className={`w-full bg-blue-700 text-white py-3 rounded-xl font-semibold hover:bg-blue-800 transition ${
                submitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {submitting ? "Sending..." : "Send Message"}
            </button>
            <p className="text-sm text-blue-800 font-medium bg-blue-50 border border-blue-200 rounded-lg p-3">
              *To send documents, email us directly at{" "}
              <a
                href="mailto:admissions@summercrestacademy.com"
                className="underline"
              >
                admissions@summercrestacademy.com
              </a>
              .
            </p>
          </form>
        </section>
      </div>
    </Layout>
  );
}
