import axios from "axios";
import fs from "fs";

const restaurant = JSON.parse(
  fs.readFileSync("./restaurant_config.json", "utf-8")
);

export async function getAIResponse(userMessage) {
  const systemPrompt = `
You are a professional restaurant WhatsApp assistant.

Restaurant Info:
Name: ${restaurant.name}
Hours: ${restaurant.hours}
Location: ${restaurant.location}
Delivery: ${restaurant.delivery}
Menu: ${restaurant.menu.map(item => `${item.name} - ${item.price}`).join(", ")}

Rules:
- Be concise
- Be friendly
- Only answer restaurant-related questions
`;

  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ]
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      }
    }
  );

  return response.data.choices[0].message.content;
}
