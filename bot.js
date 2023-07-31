"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var telegraf_1 = require("telegraf");
var openai_1 = require("openai");
var BOT_TOKEN = "6610691916:AAHAVageSJ5M7wSb4PRZozgJmVcCTVWYaQk";
var GPT_API_KEY = "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";
var configuration = new openai_1.Configuration({
    apiKey: GPT_API_KEY,
});
var openai = new openai_1.OpenAIApi(configuration);
var bot = new telegraf_1.Telegraf(BOT_TOKEN);
// A simple in-memory storage for the recent messages.
// For a production environment, consider using a more persistent storage solution.
var recentMessages = {};
bot.start(function (ctx) { return ctx.reply("Welcome to the Summary Bot!"); });
bot.command("summarize", function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var messages, summary;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, fetchRecentMessages(ctx, 50)];
            case 1:
                messages = _a.sent();
                return [4 /*yield*/, getSummary(messages)];
            case 2:
                summary = _a.sent();
                console.log({ summary: summary });
                ctx.reply(summary);
                return [2 /*return*/];
        }
    });
}); });
bot.command("summarize_100", function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var messages, summary;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, fetchRecentMessages(ctx, 100)];
            case 1:
                messages = _a.sent();
                return [4 /*yield*/, getSummary(messages)];
            case 2:
                summary = _a.sent();
                ctx.reply(summary);
                return [2 /*return*/];
        }
    });
}); });
bot.on("text", function (ctx) {
    var _a;
    var chatId = (_a = ctx.chat) === null || _a === void 0 ? void 0 : _a.id;
    // Check if it's a text message
    if (ctx.message && isTextMessage(ctx.message)) {
        var messageText = ctx.message.text;
        if (chatId && messageText) {
            // Initialize the chat in the recentMessages object if it's not already present
            if (!recentMessages[chatId]) {
                recentMessages[chatId] = [];
            }
            // Add the message to the recent messages for the chat
            recentMessages[chatId].push(messageText);
            // Keep only the last 100 messages for simplicity
            if (recentMessages[chatId].length > 100) {
                recentMessages[chatId].shift();
            }
        }
    }
});
function fetchRecentMessages(ctx, count) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var chatId;
        return __generator(this, function (_b) {
            chatId = (_a = ctx.chat) === null || _a === void 0 ? void 0 : _a.id;
            if (!chatId || !recentMessages[chatId]) {
                return [2 /*return*/, []];
            }
            return [2 /*return*/, recentMessages[chatId].slice(-count)];
        });
    });
}
function getSummary(messages) {
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function () {
        var systemMessage, userMessage, completion, error_1;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    systemMessage = {
                        role: "system",
                        content: "You are an assistant helping friends catch up in a busy chat group. Your goal is to help friends in this group stay up to date without having to read all the messages.",
                    };
                    userMessage = {
                        role: "user",
                        content: messages.join("\n"),
                    };
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, openai.createChatCompletion({
                            model: "gpt-3.5-turbo",
                            messages: [systemMessage, userMessage],
                        })];
                case 2:
                    completion = _e.sent();
                    return [2 /*return*/, ((_d = (_c = (_b = (_a = completion.data) === null || _a === void 0 ? void 0 : _a.choices[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content) === null || _d === void 0 ? void 0 : _d.trim()) || "Error summarizing the messages."];
                case 3:
                    error_1 = _e.sent();
                    console.error("Error summarizing the messages:", error_1);
                    return [2 /*return*/, "Error summarizing the messages."];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function isTextMessage(message) {
    return message && "text" in message;
}
bot.launch();
console.log("Bot is running...");
