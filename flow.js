const config = require("./restaurant_config.json");
const { sendMessage } = require("./whatsapp");
const { getSession, clearSession } = require("./sessions");

async function handleFlow(phone, intent, message) {
  const session = getSession(phone);

  if (intent === "menu") {
    let menuText = "🍽️ MENU\n\n";
    for (const cat in config.menu) {
      menuText += `*${cat}*\n`;
      config.menu[cat].forEach(i => {
        menuText += `- ${i.name}: KES ${i.price}\n`;
      });
      menuText += "\n";
    }
    await sendMessage(phone, menuText);
    return;
  }

  if (intent === "order") {
    session.step = "ordering";
    await sendMessage(phone, "What would you like to order? (Type item names)");
    return;
  }

  if (session.step === "ordering") {
    session.order.push(message);
    await sendMessage(phone, "Added. Type MORE or CONFIRM.");
    if (message.toLowerCase() === "confirm") {
      const orderText = session.order.join(", ");
      await sendMessage(process.env.STAFF_WHATSAPP,
        `📦 NEW ORDER\nFrom: ${phone}\nItems: ${orderText}`
      );
      await sendMessage(phone, "✅ Order sent. Staff will contact you.");
      clearSession(phone);
    }
    return;
  }

  if (intent === "reservation") {
    session.step = "reserve_date";
    await sendMessage(phone, "Reservation date?");
    return;
  }

  if (session.step === "reserve_date") {
    session.date = message;
    session.step = "reserve_time";
    await sendMessage(phone, "Time?");
    return;
  }

  if (session.step === "reserve_time") {
    session.time = message;
    session.step = "reserve_people";
    await sendMessage(phone, "How many people?");
    return;
  }

  if (session.step === "reserve_people") {
    await sendMessage(
      process.env.STAFF_WHATSAPP,
      `📅 RESERVATION\nFrom: ${phone}\nDate: ${session.date}\nTime: ${session.time}\nPeople: ${message}`
    );
    await sendMessage(phone, "✅ Reservation request sent.");
    clearSession(phone);
    return;
  }

  if (intent === "hours") {
    await sendMessage(phone, `🕒 Hours: ${config.hours}`);
    return;
  }

  if (intent === "location") {
    await sendMessage(phone, `📍 Location: ${config.location}`);
    return;
  }

  await sendMessage(phone, "I’ll connect you to staff.");
  await sendMessage(process.env.STAFF_WHATSAPP, `👤 Customer needs help: ${phone}`);
}

module.exports = { handleFlow };
