import { CallbackManager } from "../src/CallbackManager.js";

const data = new CallbackManager()
  .setName("set_quality_")
  .setRegExp(true)
  .setExecute(async (ctx, i18n) => {
    if (!ctx.data) return;
    if (!ctx.author) return;

    const newQuality = ctx.data.split("_")[2]!;
    const currentSettings = ctx.client.settingUser.get(ctx.author.id) || {
      quality: "medium",
    };

    if (newQuality === currentSettings.quality) {
      await ctx.showAlert(
        i18n.get("settingsAlreadyApplied", ctx.author.language, {
          quality: newQuality,
        }),
      );
      return;
    }

    if (!["low", "medium", "high"].includes(newQuality)) {
      await ctx.showAlert("Invalid quality selected.");
      return;
    }

    await ctx.client.db.set("settings", ctx.author.id, {
      ...currentSettings,
      quality: newQuality,
    });

    await ctx.showAlert(
      i18n
        .get("settingsUpdated", ctx.author.language, {
          quality: newQuality,
        })
        .replace(/\{quality\}/, () =>
          i18n.get(newQuality, ctx.author.language),
        ),
    );
  });

export { data };
