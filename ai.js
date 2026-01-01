const axios = require("axios");

async function detectIntent(message) {
  const prompt = `
Classify the message into ONE intent:
[menu, order, reservation, hours, location, human]
Message: "${message}"
Return only the intent word.
`;

  const res = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      }
    }
  );

  return res.data.choices[0].message.content.trim().toLowerCase();
}

module.exports = { detectIntent };
