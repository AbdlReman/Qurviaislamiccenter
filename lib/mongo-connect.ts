import { MongoClient, type MongoClientOptions } from "mongodb";

const SRV_PREFIX = "mongodb+srv://";

type SrvParts = {
  userinfo: string;
  host: string;
  path: string;
  query: string;
};

type DnsAnswer = {
  type?: number;
  data?: string;
};

type SrvRecord = {
  priority: number;
  weight: number;
  port: number;
  target: string;
};

export function isQuerySrvError(error: unknown): boolean {
  const seen = new Set<unknown>();
  const pending: unknown[] = [error];
  while (pending.length > 0) {
    const current = pending.pop();
    if (!current || seen.has(current)) continue;
    seen.add(current);
    if (typeof current === "string") {
      if (/querySrv|_mongodb\._tcp/i.test(current)) return true;
      continue;
    }
    if (typeof current !== "object") continue;
    const record = current as { message?: unknown; cause?: unknown; reason?: unknown };
    if (typeof record.message === "string" && /querySrv|_mongodb\._tcp/i.test(record.message)) return true;
    if (record.cause) pending.push(record.cause);
    if (record.reason) pending.push(record.reason);
  }
  return false;
}

export function splitSrvUri(uri: string): SrvParts {
  if (!uri.startsWith(SRV_PREFIX)) {
    throw new Error("Expected a mongodb+srv URI.");
  }
  const rest = uri.slice(SRV_PREFIX.length);
  const at = rest.lastIndexOf("@");
  const userinfo = at >= 0 ? rest.slice(0, at) : "";
  const afterAuth = at >= 0 ? rest.slice(at + 1) : rest;
  const queryAt = afterAuth.indexOf("?");
  const hostAndPath = queryAt >= 0 ? afterAuth.slice(0, queryAt) : afterAuth;
  const query = queryAt >= 0 ? afterAuth.slice(queryAt + 1) : "";
  const slash = hostAndPath.indexOf("/");
  const hostPort = (slash >= 0 ? hostAndPath.slice(0, slash) : hostAndPath).trim();
  const host = hostPort.replace(/:\d+$/, "");
  const path = slash >= 0 ? hostAndPath.slice(slash) : "";
  if (!host) throw new Error("The mongodb+srv URI is missing a host.");
  return { userinfo, host, path, query };
}

function parentDomain(host: string): string {
  const labels = host.split(".").filter(Boolean);
  return labels.length < 2 ? host : labels.slice(1).join(".");
}

function isUnderParent(target: string, parent: string): boolean {
  const host = target.toLowerCase();
  const suffix = parent.toLowerCase();
  return host === suffix || host.endsWith(`.${suffix}`);
}

export function parseSrvRecords(answers: DnsAnswer[], srvHost: string): SrvRecord[] {
  const parent = parentDomain(srvHost);
  const records = answers.flatMap((answer) => {
    if (answer.type !== undefined && answer.type !== 33) return [];
    if (!answer.data) return [];
    const parts = answer.data.trim().split(/\s+/);
    if (parts.length < 4) return [];
    const port = Number(parts[2]);
    const target = parts.slice(3).join("").replace(/\.$/, "");
    if (!Number.isFinite(port) || port <= 0 || !target) return [];
    if (!isUnderParent(target, parent)) {
      throw new Error(`SRV target ${target} is outside ${parent}.`);
    }
    return [
      {
        priority: Number(parts[0]) || 0,
        weight: Number(parts[1]) || 0,
        port,
        target,
      },
    ];
  });
  records.sort((left, right) => left.priority - right.priority || right.weight - left.weight);
  return records;
}

export function parseTxtOptions(answers: DnsAnswer[]): string {
  const records = answers.filter((answer) => answer.type === undefined || answer.type === 16);
  if (records.length > 1) {
    throw new Error("MongoDB SRV TXT lookup returned more than one record.");
  }
  const data = records[0]?.data;
  if (!data) return "";
  return data
    .trim()
    .replace(/^"|"$/g, "")
    .replace(/"\s*"/g, "")
    .replace(/\\"/g, "");
}

export function buildStandardUri(parts: SrvParts, records: SrvRecord[], txt: string): string {
  if (records.length === 0) {
    throw new Error(`No MongoDB SRV hosts were found for ${parts.host}.`);
  }
  const params = new URLSearchParams(txt);
  for (const [key, value] of new URLSearchParams(parts.query)) params.set(key, value);
  if (!params.has("tls") && !params.has("ssl")) params.set("tls", "true");
  const auth = parts.userinfo ? `${parts.userinfo}@` : "";
  const hosts = records.map((record) => `${record.target}:${record.port}`).join(",");
  return `mongodb://${auth}${hosts}${parts.path}?${params.toString()}`;
}

async function dnsAnswers(name: string, type: "SRV" | "TXT"): Promise<DnsAnswer[]> {
  const url = `https://dns.google/resolve?name=${encodeURIComponent(name)}&type=${type}`;
  const response = await fetch(url, { headers: { accept: "application/dns-json" } });
  if (!response.ok) {
    throw new Error(`DNS-over-HTTPS ${type} lookup for ${name} failed (${response.status}).`);
  }
  const body = (await response.json()) as { Status?: number; Answer?: DnsAnswer[] };
  if (body.Status !== undefined && body.Status !== 0) {
    throw new Error(`DNS-over-HTTPS ${type} lookup for ${name} returned status ${body.Status}.`);
  }
  return body.Answer ?? [];
}

export async function srvUriToStandard(uri: string): Promise<string> {
  const parts = splitSrvUri(uri);
  const [srv, txt] = await Promise.all([
    dnsAnswers(`_mongodb._tcp.${parts.host}`, "SRV"),
    dnsAnswers(parts.host, "TXT"),
  ]);
  return buildStandardUri(parts, parseSrvRecords(srv, parts.host), parseTxtOptions(txt));
}

async function openClient(uri: string, options: MongoClientOptions): Promise<MongoClient> {
  const client = new MongoClient(uri, options);
  try {
    await client.connect();
    return client;
  } catch (error) {
    await client.close().catch(() => undefined);
    throw error;
  }
}

export async function connectMongo(uri: string, options: MongoClientOptions = {}): Promise<MongoClient> {
  const clientOptions: MongoClientOptions = { serverSelectionTimeoutMS: 10000, ...options };
  try {
    return await openClient(uri, clientOptions);
  } catch (error) {
    if (!uri.startsWith(SRV_PREFIX) || !isQuerySrvError(error)) throw error;
    const standard = await srvUriToStandard(uri);
    console.warn(
      "MongoDB SRV lookup failed with querySrv. Retrying with a standard seed-list URI resolved via https://dns.google/resolve.",
    );
    return await openClient(standard, clientOptions);
  }
}
