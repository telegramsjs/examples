import type { EventHandlers } from "telegramsjs";
import type { Language } from "./Language.js";

type TypeFh = (ctx: any, i18n: Language) => void;

class EventsManager {
  public name!: keyof EventHandlers;
  public once: boolean = false;
  public execute!: TypeFh;

  setName(name: keyof EventHandlers): EventsManager {
    this.name = name;
    return this;
  }

  setOnce(once: boolean): EventsManager {
    this.once = once;
    return this;
  }

  setExecute(execute: TypeFh): EventsManager {
    this.execute = execute;
    return this;
  }
}

export { EventsManager };
