import { config } from "dotenv";
import { MongoClient } from "mongodb";

config({ path: ".env.local" });

const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const db = client.db(process.env.MONGODB_DB || "ilmworld");

const home = await db.collection("pages").findOne({ path: "/" });
const about = await db.collection("pages").findOne({ path: "/about-us" });

if (!home?.sections || !about?.sections) {
  throw new Error("Home or About page missing");
}

const team = home.sections.find((section) => section.type === "team");
if (!team) throw new Error("Home team section not found");

const already = about.sections.some(
  (section) => section.type === "team" && section.heading === team.heading,
);
if (already) {
  console.log("About already has the tutors section");
  await client.close();
  process.exit(0);
}

// Prefer the full tutor set from Elementor blocks when items are incomplete
const fromBlocks = [];
const blocks = Array.isArray(team.blocks) ? team.blocks : [];
for (let i = 0; i < blocks.length; i += 1) {
  const block = blocks[i];
  if (block?.widget === "image" && blocks[i + 1]?.widget === "heading" && blocks[i + 2]?.widget === "text-editor") {
    fromBlocks.push({
      name: String(blocks[i + 1].text || "").trim(),
      bio: String(blocks[i + 2].text || blocks[i + 2].html?.replace(/<[^>]+>/g, "") || "").trim(),
      image: block.image || null,
    });
  }
}

const teamForAbout = {
  ...JSON.parse(JSON.stringify(team)),
  id: `about-team-${Date.now().toString(36)}`,
  items: fromBlocks.length >= (team.items?.length || 0) ? fromBlocks : team.items,
};

const sections = [...about.sections];
const latestIdx = sections.findIndex((section) => section.type === "latestPosts");
const testimonialsIdx = sections.findIndex((section) => section.type === "testimonials");
const insertAt =
  latestIdx >= 0 ? latestIdx : testimonialsIdx >= 0 ? testimonialsIdx + 1 : sections.length;

sections.splice(insertAt, 0, teamForAbout);

await db.collection("pages").updateOne(
  { _id: about._id },
  {
    $set: {
      sections,
      updatedAt: new Date().toISOString(),
    },
  },
);

console.log("Added tutors section to /about-us at index", insertAt);
console.log(
  "Tutors:",
  teamForAbout.items.map((item) => item.name),
);

// Keep home tutors list in sync with the same full set
const homeTeamIdx = home.sections.findIndex((section) => section.type === "team");
if (homeTeamIdx >= 0) {
  const homeSections = [...home.sections];
  homeSections[homeTeamIdx] = {
    ...homeSections[homeTeamIdx],
    items: teamForAbout.items,
  };
  await db.collection("pages").updateOne(
    { _id: home._id },
    { $set: { sections: homeSections, updatedAt: new Date().toISOString() } },
  );
  console.log("Synced home team items too");
}

await client.close();
