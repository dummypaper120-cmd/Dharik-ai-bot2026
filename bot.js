const express = require("express");

const app = express();
const PORT = process.env.PORT || 10000;

app.get("/", (req, res) => {
  res.send("DHARIK AI BOT RUNNING");
});

app.listen(PORT, () => {
  console.log("Server running on " + PORT);
});

const API_URL = "https://draw.ar-lottery01.com/WinGo/WinGo_30S/GetHistoryIssuePage.json";

const TG_TOKEN = "8685608225:AAH9_ncjvU38F3XxAlnXqbgmwqO7s0rIysU";
const TG_CHAT_ID = "-1003558999419";

async function sendTelegram(msg) {
  try {
    await fetch(
      `https://api.telegram.org/bot${TG_TOKEN}/sendMessage?chat_id=${TG_CHAT_ID}&text=${encodeURIComponent(msg)}`
    );
  } catch (err) {
    console.log("Telegram error");
  }
}

async function runBot() {
  try {
    const res = await fetch(`${API_URL}?gameCode=WinGo_30S&timestamp=${Date.now()}`);
    const json = await res.json();

    if (!json?.data?.list) return;

    const last = json.data.list[0];

    const prediction = parseInt(last.number) >= 5 ? "SMALL" : "BIG";

    await sendTelegram(
`🚀 DHARIK AI SIGNAL 🚀

📌 PERIOD: ${last.issueNumber}

🎯 PREDICTION: ${prediction}`
    );

  } catch (e) {
    console.log("sync error");
  }
}

setInterval(runBot, 30000);
runBot();
