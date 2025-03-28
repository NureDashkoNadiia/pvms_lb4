const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");

// Завантаження тестових даних
const sportsData = JSON.parse(fs.readFileSync("sports_data.json", "utf8"));
const usersData = {};

const token = "Тут має бути токен";
const bot = new TelegramBot(token, { polling: true });

const mainMenu = {
  reply_markup: {
    keyboard: [
      ["⚽ Футбол", "🏀 Баскетбол"],
      ["🎾 Теніс", "📊 Моя статистика"],
    ],
    resize_keyboard: true,
  },
};

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  usersData[chatId] = usersData[chatId] || { requests: 0 };
  bot.sendMessage(chatId, "Ласкаво просимо! Оберіть вид спорту:", mainMenu);
});

bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!usersData[chatId]) usersData[chatId] = { requests: 0 };
  usersData[chatId].requests += 1;

  if (text === "⚽ Футбол" || text === "🏀 Баскетбол" || text === "🎾 Теніс") {
    const sport = text
      .replace(/[⚽🏀🎾]/g, "")
      .trim()
      .toLowerCase();
    const results = sportsData[sport];
    if (results) {
      let response = `Результати останніх матчів ${text}:\n\n`;
      results.forEach((match) => {
        response += `${match.teams} - ${match.score}\n`;
      });
      bot.sendMessage(chatId, response, mainMenu);
    } else {
      bot.sendMessage(chatId, "Немає доступних результатів.", mainMenu);
    }
  } else if (text === "📊 Моя статистика") {
    bot.sendMessage(
      chatId,
      `Ви зробили ${usersData[chatId].requests} запитів.`,
      mainMenu
    );
  } else {
    bot.sendMessage(chatId, "Будь ласка, оберіть категорію з меню.", mainMenu);
  }
});

console.log("Бот запущений...");
