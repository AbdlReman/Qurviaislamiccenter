import { MongoMemoryServer } from "mongodb-memory-server";

const port = Number(process.env.MONGO_PORT || 27018);
const server = await MongoMemoryServer.create({
  instance: { port, dbName: "ilmworld" },
});

console.log(server.getUri());
const shutdown = async () => {
  await server.stop();
  process.exit(0);
};
process.on("SIGINT", () => void shutdown());
process.on("SIGTERM", () => void shutdown());
setInterval(() => undefined, 60_000);
