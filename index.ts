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
    await bot.sendMessage(chatId, "Бот создан для тестового задания в LAKATON\n\ngithub:https://github.com/FxFurEN/lakaton-bot-test", {
      reply_markup: {
        keyboard: [["Начать тест"], ["Чат с ботом"]],
        resize_keyboard: true,
      },
    });
  } catch (error) {
    console.error("Error handling /start command:", error);
    bot.sendMessage(chatId, "Произошла ошибка при обработке вашего запроса. Пожалуйста, попробуйте позже.");
  }
});

// Обработчик нажатий на кнопки
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userText = msg.text;

  if (msg.entities && msg.entities[0].type === 'bot_command') {
    // Ignore commands
    return;
  }
  
  try {
    if (userText === "Начать тест") {
      await startTest(chatId);
    } else if (userText === "Чат с ботом") {
      await bot.sendMessage(chatId, "Вы можете начать общение с ботом прямо сейчас!", {
        reply_markup: {
          keyboard: [["Начать тест"]],
          resize_keyboard: true,
        },
      });
    } else {
      if (isTakingTest) {
        answers.push(userText);
        currentQuestionIndex++;
        await sendNextQuestion(chatId);
      } else {
        const aiResponse = await getOpenAIResponse(userText);
        bot.sendMessage(chatId, aiResponse, {
          reply_markup: {
            keyboard: [["Начать тест"]],
            resize_keyboard: true,
          },
        });
      }
    }
  } catch (error) {
    console.error("Error handling user message:", error);
    bot.sendMessage(chatId, "Произошла ошибка при обработке вашего запроса. Пожалуйста, попробуйте позже.");
  }
});

// Логика теста
let isTakingTest = false;
let currentQuestionIndex = 0;
let answers = [];

const questions = [
  "Вопрос 1: Какой ваш любимый цвет?",
  "Вопрос 2: Что вы предпочитаете: кофе или чай?",
  "Вопрос 3: Какой ваш любимый сезон года?",
];

async function sendNextQuestion(chatId) {
  if (currentQuestionIndex < questions.length) {
    await bot.sendMessage(chatId, questions[currentQuestionIndex], {
      reply_markup: {
        keyboard: [["Ответ 1", "Ответ 2"]],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    });
  } else {
    const resultMessage = `Спасибо за прохождение теста!\n\nВаши ответы:\n\n1. ${answers[0]}\n2. ${answers[1]}\n3. ${answers[2]}`;
    bot.sendMessage(chatId, resultMessage, {
      reply_markup: {
        keyboard: [["Начать тест"], ["Чат с ботом"]],
        resize_keyboard: true,
      },
    });
    isTakingTest = false;
    currentQuestionIndex = 0;
    answers = [];
  }
}

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

async function startTest(chatId) {
  isTakingTest = true;
  answers = [];
  await bot.sendMessage(chatId, "Тест начат!", {
    reply_markup: {
      keyboard: [["Ответ 1", "Ответ 2"]],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  });
  await sendNextQuestion(chatId);
}

console.log("Bot is running...");
