import uk from "../language/uk.json";
import ru from "../language/ru.json";
import en from "../language/en.json";

type LanguageCode = "uk" | "ru" | "en";
type Translations = Record<string, string>;
type MessageFormat = Record<string, string>;

class Language {
  static languageList: Record<LanguageCode, Translations> = {
    uk: uk as Translations,
    ru: ru as Translations,
    en: en as Translations,
  };

  get(lines: string, language?: string, format?: MessageFormat): string;
  get(lines: string[], language?: string, format?: MessageFormat): string[];
  get(
    lines: string | string[],
    language?: string,
    format?: MessageFormat,
  ): string | string[] {
    const lang = (language as LanguageCode) || "en";

    if (!Array.isArray(lines)) {
      const message = this.#getLine(lines, lang);
      return formatMessage(message, format);
    }

    return lines.map((line) =>
      formatMessage(this.#getLine(line, lang), format),
    );
  }

  #getLine(line: string, language: LanguageCode = "en"): string {
    return (
      Language.languageList[language]?.[line] ||
      Language.languageList["en"]?.[line] ||
      `Missing translation: ${line}`
    );
  }
}

function formatMessage(message: string, params?: MessageFormat): string {
  return params
    ? message.replace(/\${(.*?)}/g, (_, key) =>
        key in params ? String(params[key]) : `{${key}}`,
      )
    : message;
}

export { Language };
