import type { Message } from "telegramsjs";
import type { Client } from "./core/client.js";
import type { Language } from "./Language.js";

type TypeFh = (
  ctx: Message & { client: Client },
  i18n: Language,
) => Promise<void> | void;

class CommandManager {
  public name!: string;
  public aliases: string[] = [];
  public execute!: TypeFh;

  setName(name: string): CommandManager {
    this.name = name;
    return this;
  }

  setAliases(names: string | string[]): CommandManager {
    if (Array.isArray(names)) {
      this.aliases.push(...names);
    } else this.aliases.push(names);

    return this;
  }

  setExecute(execute: TypeFh): CommandManager {
    this.execute = execute;
    return this;
  }
}

export { CommandManager, type TypeFh };
