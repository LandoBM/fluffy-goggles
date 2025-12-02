import Layout from "../components/Layout";
import Mascot from "../assets/images/mascot.png";

export default function Tuition() {
  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen flex items-center justify-center px-4 py-16">
        <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
          {/* Leo animation */}
          <img
            src={Mascot}
            alt="Leo the Lion"
            className="h-32 w-auto mx-auto mb-4 leo-bounce"
          />

          <h1 className="text-3xl font-bold text-blue-900 mb-3">
            Tuition Page Coming Soon
          </h1>

          <p className="text-gray-700 mb-2 text-lg">
            Uh oh, we&apos;ve hit a snag.
          </p>

          <p className="text-gray-700 mb-4">
            Please contact the principal for tuition payments while we work to
            update this page. We&apos;re sorry for the inconvenience.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-left inline-block text-gray-800">
            <p className="font-semibold text-blue-900 mb-1">
              Principal Contact
            </p>
            <p>
              <span className="font-semibold">Name:</span> Cicily Murray
            </p>
            <p>
              <span className="font-semibold">Email:</span>{" "}
              <a
                href="mailto:admissions@summercrestacademy.com"
                className="text-blue-700 underline"
              >
                admissions@summercrestacademy.com
              </a>
            </p>
            <p>
              <span className="font-semibold">Phone:</span> (786) 582-5599
            </p>
          </div>

          <a
            href="/contact"
            className="mt-6 inline-block bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-md hover:bg-blue-800 transition"
          >
            Go to Contact Page
          </a>
        </div>
      </div>
    </Layout>
  );
}
