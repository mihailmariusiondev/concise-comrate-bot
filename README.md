# concise-comrade-bot

concise-comrade-bot is designed to provide concise and accurate summaries for various types of content. While its current capabilities focus on YouTube videos and chat conversations, the bot's architecture is built to accommodate future expansion into other areas of summarization.

## Features

- Chat Conversation Summarization: Summarize chat conversations to catch up on key details and significant events.
- YouTube Video Summarization: Obtain quick and accurate summaries of YouTube videos.
- Language Detection: Automatically detect the language of the content.
- Content Translation: Translate summaries into different languages.
- Customizable Summaries: Adjust the length and focus of the summary based on user preferences.
- Extensible Architecture: Designed to support additional summarization features in the future.
- Robust Error Handling: Ensures a smooth user experience.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/summarization-telegram-bot.git
   ```

2. Navigate to the project directory:

   ```bash
   cd summarization-telegram-bot
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Set up environment variables in the .env file. Refer to .env.example for required variables.

5. Start the bot:

   ```bash
   npm start
   ```

## Usage

### For YouTube Video Summarization

- Send a YouTube video URL to the bot.
- Receive a concise summary of the video content.
- Customize the summary or translate it into different languages (if supported).

### For Chat Conversation Summarization

- Send chat conversation text or provide access to a chat group.
- Receive a summarized version highlighting key details.
- Translate the summary into different languages (if supported).

## Roadmap

The bot is actively being developed, with plans to support additional types of content summarization. Stay tuned for updates and new features! For now, this is the official TODO list:

- Add a `/config` command
  - Configure initial language for the whole session
- Add inline summarization capabilities (example: /summarize youtube-link OR /summarize your-text)
- Add better error handling
- Don't use memory for state management, I need persistent storage solution
- Improve folder structure, not sure if this is the best solution

## Contributing

Contributions are welcome! Please refer to the [CONTRIBUTING.md](CONTRIBUTING.md) file for guidelines.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Support and Feedback

For support, feedback, or feature requests, please [open an issue](https://github.com/mihailmariusiondev/concise-comrate-bot/issues) on GitHub.

## Acknowledgements

Special thanks to the libraries and services used in this project, including OpenAI, youtube-transcript, and Google Translate API.
