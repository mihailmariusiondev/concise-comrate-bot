import { Context } from "telegraf";

export function handleError(ctx: Context, error: any) {
  console.error("Error occurred:", error);

  // Check error code and handle specific errors
  if (error.code === 403) {
    console.error("Bot was kicked from the group chat");
    // Notify admin or take further action
  } else if (error.code === 429) {
    console.error("Too many requests, retry after:", error.parameters.retry_after);
    // Implement retry logic
  } else {
    // For other errors, notify the user
    ctx.reply("An error occurred, please try again later").catch(console.error);
  }
}
