export function toPlain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function withId<T extends { _id?: unknown }>(doc: T): Omit<T, "_id"> & { id: string } {
  const plain = toPlain(doc) as T & { _id?: unknown };
  const id = plain._id == null ? "" : String(plain._id);
  delete plain._id;
  return { ...plain, id };
}
