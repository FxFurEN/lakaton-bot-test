import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import { OpenAI } from "openai";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY as string,
});

const bot = new TelegramBot(process.env.BOTKEY as string, { polling: true });

bot.on('message', async (msg) => {
  try {
    let responseText = "";

    if (msg.text.toLowerCase().includes('продакт разработчик python')) {
      responseText = await getResponseForJobRole("Продакт Разработчик Python");
    } else if (msg.text.toLowerCase().includes('разработчик операций/продаж')) {
      responseText = await getResponseForJobRole("Разработчик операций/продаж");
    } else if (msg.text.toLowerCase().includes('менеджер продаж и роп')) {
      responseText = await getResponseForJobRole("Менеджер продаж и РОП");
      
    } else if (msg.text.toLowerCase().includes('хакатон')) {
      responseText = await getHakatonInfo();
    } else if (msg.text.toLowerCase().includes('культура')) {
      responseText = await getCompanyCultureInfo();
    } else if (msg.text.toLowerCase().includes('вакансии')) {
      responseText = "На данный момент существуют 3 актуальные вакансии и информация о культуре компании.\n\nВыберите интересующую вас вакансию или узнайте о культуре компании:";
      const keyboard = {
        reply_markup: {
          keyboard: [
            [{ text: 'Продакт Разработчик Python' }],
            [{ text: 'Разработчик операций/продаж' }],
            [{ text: 'Менеджер продаж и РОП' }],
          ],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      };
      bot.sendMessage(msg.chat.id, responseText, keyboard);
      return;
    } else {
      return;
    }

    // Отправляем ответ пользователю
    if (responseText !== "") {
      bot.sendMessage(msg.chat.id, responseText);
    } else {
      bot.sendMessage(msg.chat.id, "Информация по вашему запросу не найдена.");
    }
  } catch (error) {
    bot.sendMessage(msg.chat.id, "Произошла ошибка.");
    console.error(error);
  }
});

async function getResponseForJobRole(role: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: role }],
      temperature: 0.5,
      max_tokens: 400,
    });
    return response.choices[0].message.content ?? "Не удалось получить ответ от нейросети.";
  } catch (error) {
    console.error(error);
    return "Произошла ошибка при получении ответа от нейросети.";
  }
}

async function getCompanyCultureInfo(): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: "Изучи культуру LATOKEN: https://coda.io/@latoken/latoken-talent/the-principles-olympics-of-freedom-and-responsibility-to-build-t-60" }],
      temperature: 0.5,
      max_tokens: 3500,
    });
    return response.choices[0].message.content ?? "Не удалось получить ответ от нейросети.";
  } catch (error) {
    console.error(error);
    return "Произошла ошибка при получении информации о культуре компании.";
  }
}

async function getHakatonInfo(): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: "Изучи хакатон: https://deliver.latoken.com/hackathon" }],
      temperature: 0.5,
      max_tokens: 3500,
    });
    return response.choices[0].message.content ?? "Не удалось получить ответ от нейросети.";
  } catch (error) {
    console.error(error);
    return "Произошла ошибка при получении информации о культуре компании.";
  }
}
