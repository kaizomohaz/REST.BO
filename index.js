 // test deploy change
import express from "express";
import dotenv from "dotenv";
import { handleIncomingMessage } from "./whatsapp.js";

dotenv.config();

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is live");
});

/* ✅ WEBHOOK VERIFICATION */
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.VERIFY_TOKEN) {
    console.log("✅ Webhook verified");
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

/* ✅ RECEIVE ALL EVENTS */
app.post("/webhook", async (req, res) => {
  console.log("📩 Incoming webhook event:");
  console.log(JSON.stringify(req.body, null, 2));

  try {
    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const message = change?.value?.messages?.[0];

    if (message) {
      await handleIncomingMessage(message);
    }
  } catch (err) {
    console.error("❌ Error handling message:", err.message);
  }

  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Bot running on port ${PORT}`);
});
