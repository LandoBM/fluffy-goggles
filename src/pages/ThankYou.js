import Layout from "../components/Layout";
import Mascot from "../assets/images/mascot.png"; // your Leo image

export default function ThankYou() {
  return (
    <Layout>
      <div className="bg-gray-50 py-20 px-6">
        
        {/* MAIN BOX */}
        <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-lg p-10 text-center border border-gray-200">
          
          {/* LEO IMAGE */}
          <img
            src={Mascot}
            alt="Leo the Lion"
            className="h-40 w-auto mx-auto mb-4 animate-bounce"
          />

          <h1 className="text-4xl font-extrabold text-blue-800 mb-4">
            Thank You!
          </h1>

          <p className="text-lg text-gray-700 mb-6 max-w-xl mx-auto">
            Your message has been received. Someone from our team will reach out 
            to you shortly.
          </p>

          {/* FUN LEO QUOTE */}
          <div className="bg-yellow-100 text-yellow-900 rounded-xl p-4 mb-6 shadow-sm">
            <p className="font-semibold italic">
              “You’re in good paws now! I’ll make sure the right humans get your message.”
            </p>
            <p className="text-sm mt-1 font-medium">
              — Leo the Lion 🦁✨
            </p>
          </div>

          {/* FRIENDLY WAVE LINE */}
          <p className="text-blue-800 font-bold text-xl">
            *Leo waves his paw excitedly… “See you soon!”*
          </p>

          {/* BACK BUTTON */}
          <a
            href="/"
            className="inline-block mt-8 bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow hover:bg-blue-800 transition"
          >
            Back to Home
          </a>
        </div>
      </div>
    </Layout>
  );
}

