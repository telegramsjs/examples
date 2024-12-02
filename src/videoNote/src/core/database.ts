import path from "node:path";
import fs, { constants } from "node:fs/promises";
import { setInterval } from "node:timers";
import { StorageDB, type StorageDBOptions } from "@aoitelegram/database";

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

interface DatabaseOptions extends Required<StorageDBOptions> {
  saveCache?: boolean;
  intervalCached?: number;
}

class Database extends StorageDB<any> {
  public override options: DatabaseOptions;

  constructor(options: Partial<DatabaseOptions>) {
    super(options);

    this.options = {
      ...options,
      extname: options.extname ?? ".json",
    } as unknown as DatabaseOptions;
  }

  async login() {
    const cachePath = path.join(process.cwd(), ".cache");
    if (!(await fileExists(cachePath))) {
      await fs.mkdir(cachePath);
    }

    if (this.options.saveCache) {
      setInterval(
        async () => {
          for (const table of this.options.tables) {
            const fullPaths = path.join(
              process.cwd(),
              ".cache",
              "database",
              table,
            );

            if (
              !(await fs.access(fullPaths, constants.F_OK).catch(() => false))
            ) {
              await fs
                .mkdir(fullPaths, { recursive: true })
                .catch((err) => console.error(`Path: ${err}`));
              await fs
                .writeFile(path.join(fullPaths, `${table}.json`), `{}`)
                .catch((err) => console.error(`Path: ${err}`));
            }

            await this.convertTableToFile(
              table,
              path.join(fullPaths, `${table}.json`),
            ).catch((err) => console.error(`Path: ${err}`));
          }
        },
        this.options.intervalCached ?? 60000 * 10,
      );
    }

    await super.connect();
  }
}

export { Database };
