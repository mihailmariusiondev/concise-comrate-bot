import axios from "axios";
import * as dotenv from "dotenv";
import { parseStringPromise } from 'xml2js';

dotenv.config();

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

export async function getVideoCaptions(videoId: string): Promise<string | null> {
    // Step 1: Check if captions are available
    const videoDetailsUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet&key=${YOUTUBE_API_KEY}`;

    let response = await axios.get(videoDetailsUrl);
    let videoData = response.data.items[0];

    if (!videoData || videoData.snippet.caption !== "true") {
        return null; // Captions not available
    }

    // Fetch the list of captions available for the video
    const captionsListUrl = `https://www.googleapis.com/youtube/v3/captions?videoId=${videoId}&key=${YOUTUBE_API_KEY}`;
    response = await axios.get(captionsListUrl);
    const captions = response.data.items;

    if (!captions || captions.length === 0) {
        return null; // No captions available
    }

    // Fetch the actual caption content (this provides XML content)
    const captionId = captions[0].id; // Using the first caption track
    const captionUrl = `https://www.googleapis.com/youtube/v3/captions/${captionId}?key=${YOUTUBE_API_KEY}`;
    response = await axios.get(captionUrl, {
        responseType: 'text', // To get the response as raw text
    });

    const captionContent = response.data;

    // Parse the XML caption content to extract the transcription
    const parsedResult = await parseStringPromise(captionContent);
    const transcriptions = parsedResult.transcript.text.map((item: any) => item._);

    return transcriptions.join(' '); // Combine the parsed transcriptions into a single string
}
