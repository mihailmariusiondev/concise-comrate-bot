import * as dotenv from "dotenv";
import { TranscriptResponse, YoutubeTranscript } from "youtube-transcript";

dotenv.config();

export async function getVideoCaptions(videoId: string): Promise<string> {
  console.log("Entered getVideoCaptions function, Video ID:", videoId);

  try {
    const transcriptResponse = await YoutubeTranscript.fetchTranscript(videoId);
    return transcriptResponse.map((transcript) => transcript.text).join(" ");
  } catch (error) {
    return "";
  }
}
