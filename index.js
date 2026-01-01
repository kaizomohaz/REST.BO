require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const { detectIntent } = require("./ai");
const { handleFlow } = require("./flows");

const app = express();
app.use(bodyParser.json());

app.get("/webhook", (req, res) => {
  if (req.query["hub.verify_token"] === process.env.VERIFY_TOKEN) {
    return res.send(req.query["hub.challenge"]);
  }
  res.sendStatus(403);
});

app.post("/webhook", async (req, res) => {
  const msg = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (!msg) return res.sendStatus(200);

  const phone = msg.from;
  const text = msg.text?.body;

  const intent = await detectIntent(text);
  await handleFlow(phone, intent, text);

  res.sendStatus(200);
});

app.listen(process.env.PORT, () =>
  console.log("BOT RUNNING")
);
