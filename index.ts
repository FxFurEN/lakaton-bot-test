import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import { OpenAI } from "openai";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const bot = new TelegramBot(process.env.BOTKEY, { polling: true });

// Обработчик команды /start
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;

  try {
    await bot.sendMessage(chatId, "Привет! Я бот, созданный для тестового задания в LAKATON.\n\nСсылка на GitHub: https://github.com/FxFurEN/lakaton-bot-test", {
      reply_markup: {
        keyboard: [["Узнать больше о боте"], ["Чат с ботом"]],
        resize_keyboard: true,
      },
    });
  } catch (error) {
    console.error("Error handling /start command:", error);
    bot.sendMessage(chatId, "Произошла ошибка при обработке вашего запроса. Пожалуйста, попробуйте позже.");
  }
});

// Обработчик нажатий на кнопки и сообщений
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userText = msg.text;

  if (msg.entities && msg.entities[0].type === 'bot_command') {
    // Ignore commands
    return;
  }
  
  try {
    if (userText === "Узнать больше о боте") {
      const message = `Привет! Я бот, созданный для тестового задания в LAKATON. Вот некоторая полезная информация о мне:
    
  🤖 **GitHub:** [Ссылка на мой GitHub](https://github.com/FxFurEN/lakaton-bot-test)`;
    
      await bot.sendMessage(chatId, message, {
        parse_mode: "Markdown",
        reply_markup: {
          keyboard: [["Чат с ботом"]],
          resize_keyboard: true,
        },
      });
    }
     else if (userText === "Чат с ботом") {
      await bot.sendMessage(chatId, "Вы можете начать общение с ботом прямо сейчас!", {
        reply_markup: {
          keyboard: [["Узнать больше о боте"]],
          resize_keyboard: true,
        },
      });
    } else {
      const aiResponse = await getOpenAIResponse(userText);
      bot.sendMessage(chatId, aiResponse, {
        reply_markup: {
          keyboard: [["Узнать больше о боте"]],
          resize_keyboard: true,
        },
      });
    }
  } catch (error) {
    console.error("Error handling user message:", error);
    bot.sendMessage(chatId, "Произошла ошибка при обработке вашего запроса. Пожалуйста, попробуйте позже.");
  }
});

async function getOpenAIResponse(userText) {
  const prompt = `You are an AI assistant at LATOKEN. Answer questions naturally and informatively based on the provided information:
  Отвечай только на русском
  
  - https://deliver.latoken.com/hackathon
  - https://coda.io/@latoken/latoken-talent/the-principles-olympics-of-freedom-and-responsibility-to-build-t-60 - здесь ответь четко как там написано
  - https://deliver.latoken.com/jobs - дальше тут есть ссылки на 3 актуальные вакансии https://deliver.latoken.com/jobs/gptxweb3 и https://hh.ru/vacancy/98569710?hhtmFrom=employer_vacancies и Разработчик операций/продаж Меняющим профессию на разработчика или фанаты автоматизации
  - https://deliver.latoken.com/about
  
  Вопрос: ${userText}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "user", content: prompt }
    ],
    temperature: 0.5,
    max_tokens: 3500,
  });

  return response.choices[0].message.content.trim();
}

console.log("Bot is running...");
