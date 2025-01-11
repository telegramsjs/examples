import {
  TelegramClient,
  InlineQueryResultBuilder,
  InputMessageContentBuilder,
  DefaultPollingParameters,
  Events,
} from "telegramsjs";

const client = new TelegramClient("TOKEN");

client.on(Events.InlineQuery, async (inline) => {
  const results = [
    InlineQueryResultBuilder.article(
      "Result1", // Id
      "Result 1", // Title
      InputMessageContentBuilder.text("You selected Result 1!"), // Message Input
      { description: "Description of Result 1" }, // Out parameters
    ),
    InlineQueryResultBuilder.article(
      "Result2", // Id
      "Result 2", // Title
      InputMessageContentBuilder.text("You selected Result 2!"), // Message Input
      { description: "Description of Result 2" }, // Out parameters
    ),
    InlineQueryResultBuilder.article(
      "Result3", // Id
      "Result 3", // Title
      InputMessageContentBuilder.text("You selected Result 3!"), // Message Input
      { description: "Description of Result 3" }, // Out parameters
    ),
  ] as const;

  await inline
    .answerQuery(results)
    .catch((err) => console.error(`Error Answer: ${err}`));
});

client.on(Events.ChosenInlineResult, async ({ id, author: { id: userId } }) => {
  console.log(`User ${userId} selected result with ID: ${id}`);

  if (id === "Result1") {
    console.log("Handled Result 1");
  } else if (id === "Result2") {
    console.log("Handled Result 2");
  } else if (id === "Result3") {
    console.log("Handled Result 3");
  } else {
    console.log("Unknown result selected");
  }
});

client.login({
  polling: {
    allowedUpdates: [
      ...DefaultPollingParameters.allowedUpdates,
      "chosen_inline_result",
    ],
  },
});
