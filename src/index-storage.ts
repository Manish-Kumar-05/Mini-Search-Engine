import fs from "node:fs/promises";
import path from "node:path";

export class IndexStorage {
  constructor(private readonly filePath: string) {}

  async save<T>(data: T): Promise<void> {
    const directory = path.dirname(this.filePath);

    await fs.mkdir(directory, { recursive: true });

    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), "utf-8");
  }

  async load<T>(): Promise<T | null> {
    try {
      const content = await fs.readFile(this.filePath, "utf-8");

      return JSON.parse(content) as T;
    } catch (error: any) {
      if (error.code === "ENOENT") {
        return null;
      }

      throw error;
    }
  }
}
