import SummerCamp from "../assets/images/summercamp.JPG";
import Enroll from "../assets/images/enroll.JPG";
import SOTM from "../assets/images/Rod.JPG";

// Add new announcements here as they come in — newest or oldest, order doesn't matter.
// Just make sure each has an accurate `date`.
export const allAnnouncements = [
  {
    image: SummerCamp,
    headline: "Summer Camp Enrollment Closing Soon",
    date: "June 1, 2026",
    kicker: "Only 10 Spots Left",
    caption:
      "Summer Crest's Summer Camp is almost full! Campers enjoy arts & crafts, sports & recreation, exciting field trips, and games and activities that build new friendships and lasting memories. $75 per week, $25 registration fee. Bonus: free round-trip transportation for enrolled camp students. Only 10 spots remaining! Call to enroll: 786-582-5599.",
    dates: "June 15 – July 31",
  },
  {
    image: SOTM,
    headline: "Student of the Month",
    date: "February 05, 2026",
    caption:
      "Congratulations to our Student of the Month Rodrick Williams for their outstanding achievement for completing 3,000 math questions and learning 22 new skills. Rodrick's dedication to learning and his impressive progress in mathematics is truly inspiring.",
  },
  {
    image: Enroll,
    headline: "A Bright Future Starts Here: Open Enrollment!",
    date: "June 01, 2026",
    caption:
      "Now enrolling for the 2026–2027 school year. Small classes, personalized learning, and a safe environment for every student.",
  },
];

// Returns true if the announcement date is within the last `days` days
export function isRecent(dateString, days = 30) {
  const postedDate = new Date(dateString);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return postedDate >= cutoff;
}