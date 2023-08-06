import { MessageData } from "../types";

export const recentMessages: { [chatId: number]: MessageData[] } = {};
export const lastCommandUsage: { [chatId: number]: number } = {};
export const botEnabledPerChat: { [chatId: number]: boolean } = {};

export const COMMAND_COOLDOWN = 60 * 1000;
