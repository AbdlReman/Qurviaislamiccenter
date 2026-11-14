import { Db, type MongoClient } from "mongodb";
import { connectMongo } from "@/lib/mongo-connect";

const globalForMongo = globalThis as typeof globalThis & {
  _ilmMongoPromise?: Promise<MongoClient>;
  _ilmIndexPromise?: Promise<void>;
};

function uri(): string {
  const value = process.env.MONGODB_URI;
  if (!value) {
    throw new Error("MONGODB_URI is not set. Add it to .env.local and restart the server.");
  }
  return value;
}

export function databaseName(): string {
  return process.env.MONGODB_DB || "ilmworld";
}

async function ensureIndexes(db: Db): Promise<void> {
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
}

export async function getDb(): Promise<Db> {
  if (!globalForMongo._ilmMongoPromise) {
    globalForMongo._ilmMongoPromise = connectMongo(uri(), { serverSelectionTimeoutMS: 8000 }).catch((error: unknown) => {
      globalForMongo._ilmMongoPromise = undefined;
      throw error;
    });
  }
  const client = await globalForMongo._ilmMongoPromise;
  const db = client.db(databaseName());
  if (!globalForMongo._ilmIndexPromise) {
    globalForMongo._ilmIndexPromise = ensureIndexes(db).catch((error: unknown) => {
      globalForMongo._ilmIndexPromise = undefined;
      console.error("Mongo index setup failed", error);
    });
  }
  await globalForMongo._ilmIndexPromise;
  return db;
}
