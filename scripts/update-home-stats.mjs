import { config } from "dotenv";
import { MongoClient } from "mongodb";

config({ path: ".env.local" });

const intro =
  "Thousands of students choose our online Quran academy for flexible class schedules, experienced male and female Quran teachers, personalized one-on-one Quran classes, and structured courses designed for both children and adults.";

const items = [
  { value: "4.9", prefix: "", suffix: "+", label: "139★ Google Verified Reviews" },
  { value: "6", prefix: "", suffix: "+", label: "Years of Experience" },
  { value: "200", prefix: "", suffix: "+", label: "Qualified Tutors" },
  { value: "24/7", prefix: "", suffix: "", label: "All Time Zones" },
];

const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const db = client.db(process.env.MONGODB_DB || "ilmworld");
const home = await db.collection("pages").findOne({ path: "/" });
if (!home) throw new Error("Home page missing");

const sections = [...home.sections];
const idx = sections.findIndex((section) => section.type === "stats");
if (idx >= 0) {
  sections[idx] = {
    ...sections[idx],
    heading: "The Numbers Say It All",
    introText: intro,
    items,
  };
} else {
  sections.splice(6, 0, {
    id: `stats-${Date.now().toString(36)}`,
    type: "stats",
    heading: "The Numbers Say It All",
    introText: intro,
    items,
  });
}

await db.collection("pages").updateOne(
  { _id: home._id },
  { $set: { sections, updatedAt: new Date().toISOString() } },
);

console.log("Home stats updated");
await client.close();
