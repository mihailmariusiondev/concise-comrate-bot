import { CreateChatCompletionRequest } from "openai";
import { openAiApi, ERROR_SUMMARIZING, ContentType } from "../config";

export async function getSummary(
  contentToSummarize: string,
  contentType: ContentType = ContentType.GENERAL,
  language: string
): Promise<string> {
  let systemMessage = "";
  if (contentType === ContentType.CHAT) {
    systemMessage = `You are an assistant helping friends catch up in a busy chat group. Your goal is to summarize the conversation in bullet-point format, outlining who said what about which topic.
      Respond immediately with a short and concise summary, capturing key details and significant events.
      - (IMPORTANT) NEVER reference message IDs (e.g., #360).
      - The summary should look like bullet points
      - Mention who said what about which topic
      Example:
      - Alice mentioned her new job at XYZ Corp.
      - Bob shared a link to a YouTube video about cooking.
      - Carol expressed concerns about climate change.`;
  } else if (contentType === ContentType.VIDEO) {
    systemMessage = `You are an assistant summarizing video content. Your goal is to provide a concise summary of the video.`;
  } else if (contentType === ContentType.GENERAL) {
    systemMessage = `You are an assistant tasked with summarizing general content. Provide a concise summary.`;
  }

  // Adding common characteristics for all content types
  systemMessage += `
    - (VERY IMPORTANT) Should be in ${language} language`;

  const payload: CreateChatCompletionRequest = {
    model: "gpt-3.5-turbo-16k",
    messages: [
      {
        role: "system",
        content: systemMessage,
      },
      {
        role: "user",
        content: contentToSummarize,
      },
    ],
  };

  console.log("Payload being sent to OpenAI:", JSON.stringify(payload, null, 2));

  try {
    const response = await openAiApi.createChatCompletion(payload);
    const assistantMessage = response.data.choices?.[0]?.message?.content;

    console.log("Payload received from OpenAI:", JSON.stringify(payload, null, 2));
    return assistantMessage || ERROR_SUMMARIZING;
  } catch (error) {
    console.error("Error getting summary from OpenAI:", error);
    return ERROR_SUMMARIZING;
  }
}
