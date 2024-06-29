import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import { OpenAI } from "openai";
import axios from "axios";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const bot = new TelegramBot(process.env.BOTKEY, { polling: true });

async function getOpenAIResponse(userText) {
  const prompt = `You are an AI assistant at LATOKEN. Answer questions naturally and informatively based on the provided information:
  
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

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userText = msg.text;

  try {
    // Get response from OpenAI
    const aiResponse = await getOpenAIResponse(userText);

    // Send response back to user
    bot.sendMessage(chatId, aiResponse);
  } catch (error) {
    console.error("Error handling user message:", error);
    bot.sendMessage(chatId, "Произошла ошибка при обработке вашего запроса. Пожалуйста, попробуйте позже.");
  }
});

console.log("Bot is running...");
