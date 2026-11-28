import { config } from "dotenv";
import { MongoClient } from "mongodb";

config({ path: ".env.local" });

const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const db = client.db(process.env.MONGODB_DB || "ilmworld");

const about = await db.collection("pages").findOne({ path: "/about-us" });
const home = await db.collection("pages").findOne({ path: "/" });
const team = about?.sections?.find((section) => section.type === "team");
const homeTeamIdx = home?.sections?.findIndex((section) => section.type === "team") ?? -1;

if (!team || homeTeamIdx < 0) {
  throw new Error("Missing team section");
}

const homeSections = [...home.sections];
homeSections[homeTeamIdx] = {
  ...homeSections[homeTeamIdx],
  items: team.items,
};

await db.collection("pages").updateOne(
  { _id: home._id },
  { $set: { sections: homeSections, updatedAt: new Date().toISOString() } },
);

console.log(
  "Home tutors synced:",
  team.items.map((item) => item.name),
);

await client.close();
