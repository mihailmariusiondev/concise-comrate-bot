import { MAX_MESSAGE_LENGTH, openAiApi } from "../config";
import { recentMessages } from "../state";

export async function getSummaryForChat(chatId: number): Promise<string> {
  const recentMessagesForChat = recentMessages[chatId];
  if (!recentMessagesForChat || recentMessagesForChat.length === 0) {
    return "No recent messages to summarize.";
  }

  const systemMessage =
    "You're an assistant summarizing a chat group conversation. Carefully adapt to the language used in the conversation and maintain that same language in your summary. Summarize in 3 sentences or less, mentioning specifics without referencing message numbers. It's crucial to respond in the conversation's language.";

  const formattedMessages = recentMessagesForChat
    .map((message) => {
      if (message.reply_to && message.reply_to.id) {
        return `#${message.id} ${message.sender} (reply to #${message.reply_to.id}): ${message.text.slice(0, MAX_MESSAGE_LENGTH)}...`;
      }
      return `#${message.id} ${message.sender}: ${message.text.slice(0, MAX_MESSAGE_LENGTH)}...`;
    })
    .join("\\n");

  const payload = {
    model: "gpt-3.5-turbo-16k",
    messages: [
      {
        role: "system",
        content: systemMessage,
      },
      {
        role: "user",
        content: formattedMessages,
      },
    ],
  };

  console.log("Payload being sent to OpenAI:", JSON.stringify(payload, null, 2));

  try {
    const response = await openAiApi.createChatCompletion({
      model: "gpt-3.5-turbo-16k",
      messages: [
        {
          role: "system",
          content: systemMessage,
        },
        {
          role: "user",
          content: formattedMessages,
        },
      ],
    });
    const assistantMessage = response.data.choices?.[0]?.message?.content;
    return assistantMessage || "Error retrieving summary.";
  } catch (error) {
    console.error("Error getting summary from OpenAI:", error);
    return "Error retrieving summary.";
  }
}
