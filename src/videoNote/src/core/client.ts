import { Database } from "./database.js";
import { TelegramClient } from "telegramsjs";
import { Collection } from "@telegram.ts/collection";
import type { TypeFh as CommandFh } from "../CommandManager.js";

interface ISettingUser {
  quality: "low" | "medium" | "high";
  isBlastVideo?: boolean;
}

class Client extends TelegramClient {
  public readonly db: Database;
  public readonly commands: Collection<string, CommandFh>;
  public readonly settingUser = new Collection<string, ISettingUser>();

  constructor(token: string) {
    super(token);

    this.commands = new Collection();

    this.db = new Database({
      saveCache: true,
      path: "database",
      tables: ["settings", "client"],
    });
  }

  override async login() {
    this.db.on("update", ({ variable, newData }) =>
      this.settingUser.set(variable, newData),
    );

    await this.db.connect();

    const usersSetting = Object.entries(await this.db.all("settings"));

    for (const [userId, setting] of usersSetting) {
      this.settingUser.set(userId, setting);
    }

    await super.login();
  }
}

export { Client, type ISettingUser };
