import { config } from "dotenv";
import { MongoClient } from "mongodb";

config({ path: ".env.local" });

function isValidDate(value) {
  if (value == null) return false;
  if (value instanceof Date) return !Number.isNaN(value.getTime());
  if (typeof value === "string" || typeof value === "number") {
    return !Number.isNaN(new Date(value).getTime());
  }
  return false;
}

const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const db = client.db(process.env.MONGODB_DB || "ilmworld");
const now = new Date().toISOString();

for (const col of ["pages", "posts"]) {
  const docs = await db.collection(col).find({}, { projection: { updatedAt: 1, publishedAt: 1 } }).toArray();
  let fixed = 0;
  for (const doc of docs) {
    if (isValidDate(doc.updatedAt)) continue;
    const fallback = isValidDate(doc.publishedAt)
      ? new Date(doc.publishedAt).toISOString()
      : now;
    await db.collection(col).updateOne({ _id: doc._id }, { $set: { updatedAt: fallback } });
    fixed += 1;
  }
  console.log(`${col}: fixed ${fixed}`);
}

await client.close();
