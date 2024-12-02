import type { Language } from "./Language.js";
import type { Client } from "./core/client.js";
import type { CallbackQuery } from "telegramsjs";

type TypeFh = (ctx: CallbackQuery & { client: Client }, i18n: Language) => void;

class CallbackManager {
  public name!: string;
  public regExp: boolean = false;
  public execute!: TypeFh;

  setName(name: string): CallbackManager {
    this.name = name;
    return this;
  }

  setRegExp(regExp: boolean): CallbackManager {
    this.regExp = regExp;
    return this;
  }

  setExecute(execute: TypeFh): CallbackManager {
    this.execute = execute;
    return this;
  }
}

export { CallbackManager };
