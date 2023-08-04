import { ChatCompletionRequestMessage, ChatCompletionRequestMessageRoleEnum } from "openai";
import { Context } from "telegraf";
import { openAiApi, ERROR_SUMMARIZING } from "../config";
import { recentMessages } from "../state";

export async function getSummaryForChat(ctx: Context, count: number): Promise<string> {
  let messages: string[] = [];
  if (ctx.chat && typeof ctx.chat.id === "number") {
    const messageDataList = recentMessages[ctx.chat.id]?.slice(-count) || [];
    messages = messageDataList.map((data: { sender: any; text: any; reply_to?: any }) => {
      if (data.reply_to) {
        return `${data.sender} (in reply to ${data.reply_to.sender}): ${data.text}`;
      }
      return `${data.sender}: ${data.text}`;
    });
  }

  const systemMessage: ChatCompletionRequestMessage = {
    role: "system" as ChatCompletionRequestMessageRoleEnum,
    content: `You are an assistant helping friends catch up in a busy chat group. Your goal is to help friends in this group stay up to date without having to read all the messages. The conversation provided to you is in a specific language, and you should adapt to it, ensuring your summary is in the same language.
        Respond with a short and concise summary of the conversation while following these guidelines:
        - Adapt to and match the tone of the conversation, acting like you are part of the group.
        - Use 3 sentences or less for your summary.
        - Be specific: mention who said what without being too general.`,
  };

  const userMessage: ChatCompletionRequestMessage = {
    role: "user" as ChatCompletionRequestMessageRoleEnum,
    content: messages.join("\\n"),
  };

  console.log("Payload being sent to OpenAI:", {
    model: "gpt-3.5-turbo-16k",
    messages: [systemMessage, userMessage],
  });

  try {
    const completion = await openAiApi.createChatCompletion({
      model: "gpt-3.5-turbo-16k",
      messages: [systemMessage, userMessage],
    });

    return completion.data?.choices[0]?.message?.content?.trim() || ERROR_SUMMARIZING;
  } catch (error) {
    console.error(ERROR_SUMMARIZING);
    return ERROR_SUMMARIZING;
  }
}
