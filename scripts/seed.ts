import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { MongoClient, type Document } from "mongodb";
import { connectMongo } from "../lib/mongo-connect";

function loadEnv(file: string) {
  const path = resolve(file);
  if (!existsSync(path)) return;
  const raw = readFileSync(path, "utf8").replace(/^\uFEFF/, "");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator < 0) continue;
    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

function readJson(name: string): Document[] {
  const path = resolve("data/seed", name);
  const parsed = JSON.parse(readFileSync(path, "utf8")) as unknown;
  if (!Array.isArray(parsed)) throw new Error(`${name} must be a JSON array`);
  return parsed as Document[];
}

async function upsert(client: MongoClient, dbName: string, collection: string, docs: Document[], key: string) {
  const col = client.db(dbName).collection(collection);
  let count = 0;
  for (const doc of docs) {
    const value = doc[key];
    if (typeof value !== "string" || !value) {
      console.warn(`Skipping ${collection} document without ${key}`);
      continue;
    }
    await col.updateOne({ [key]: value }, { $set: doc }, { upsert: true });
    count += 1;
  }
  console.log(`${collection}: upserted ${count} by ${key}`);
}

async function main() {
  loadEnv(".env.local");
  loadEnv(".env");
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || "ilmworld";
  if (!uri) {
    console.error("MONGODB_URI is required. Copy .env.example to .env.local first.");
    process.exit(1);
  }

  const client = await connectMongo(uri, { serverSelectionTimeoutMS: 10000 });
  const db = client.db(dbName);
  await Promise.all([
    db.collection("pages").createIndex({ path: 1 }, { unique: true }),
    db.collection("pages").createIndex({ slug: 1 }, { unique: true }),
    db.collection("posts").createIndex({ path: 1 }, { unique: true }),
    db.collection("posts").createIndex({ slug: 1 }, { unique: true }),
    db.collection("categories").createIndex({ slug: 1 }, { unique: true }),
    db.collection("media").createIndex({ publicId: 1 }, { unique: true }),
    db.collection("menus").createIndex({ key: 1 }, { unique: true }),
    db.collection("settings").createIndex({ key: 1 }, { unique: true }),
    db.collection("leads").createIndex({ createdAt: -1 }),
  ]);

  const files = new Set(readdirSync(resolve("data/seed")));
  const jobs: [string, string, string][] = [
    ["pages.json", "pages", "path"],
    ["posts.json", "posts", "path"],
    ["categories.json", "categories", "slug"],
    ["media.json", "media", "publicId"],
    ["menus.json", "menus", "key"],
    ["settings.json", "settings", "key"],
  ];
  for (const [file, collection, key] of jobs) {
    if (!files.has(file)) throw new Error(`Missing data/seed/${file}`);
    await upsert(client, dbName, collection, readJson(file), key);
  }
  await client.close();
  console.log(`Seeded ${dbName}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
