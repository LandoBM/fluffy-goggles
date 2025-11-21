import Mascot from "../assets/images/mascot.png";

export default function Hero() {
  return (
    <section className="bg-blue-700 text-white py-24 pt-28 text-center">
      <h1 className="text-4xl font-bold mb-4">
        Welcome to Summer Crest Learning Academy
      </h1>
      <p className="text-lg max-w-xl mx-auto">
        Helping every student grow, learn, and lead.
      </p>
      <img
  src={Mascot}
  alt="Mascot"
  className="absolute bottom-4 right-4 h-32 w-auto drop-shadow-lg"
 />

    </section>
  );
}

