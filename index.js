const keepAlive = require("./server");
const Discord = require("discord.js");
const fetch = require("node-fetch");
const Database = require("@replit/database");
const yahooStockPrices = require("yahoo-stock-prices");
const cron = require("node-cron");
const db = new Database();
const client = new Discord.Client();

const sadWords = [
  "sad",
  "depressed",
  "unhappy",
  "angry",
  "miserable",
  "upset",
  "anxious",
];

const starterEncouragements = [
  "Cheer up!",
  "Hang in there.",
  "You are a great person / bot!",
];

db.get("encouragements").then((encouragements) => {
  console.log(encouragements);
  if (!encouragements || encouragements.length < 1) {
    db.set("encouragements", starterEncouragements);
  }
});

db.get("responding").then((value) => {
  if (value == null) {
    db.set("responding", true);
  }
});

function getQuote() {
  return fetch("https://zenquotes.io/api/random")
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      return data[0]["q"] + " -" + data[0]["a"];
    });
}

function updateEncouragements(encouragingMessage) {
  db.get("encouragements").then((encouragements) => {
    encouragements.push([encouragingMessage]);
    db.set("encouragements", encouragements);
  });
}

function deleteEncouragment(index) {
  db.get("encouragements").then((encouragements) => {
    if (encouragements.length > index) {
      encouragements.splice(index, 1);
      db.set("encouragements", encouragements);
    }
  });
}

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
  cron.schedule("0 17 * * *", () => {
    const channel = client.channels.cache.get("398918078655758339");
    getQuote().then((quote) =>
      channel.send(`Daily quote of the day: ${quote}`)
    );
  });
  cron.schedule("1 17-22/1 * * 1-5", async () => {
    const channel = client.channels.cache.get("398918078655758339");
    const price = await yahooStockPrices.getCurrentPrice("GME");
    channel.send(`GME CURRENT PRICE: $${price} 💎🙌🚀🚀🚀 `);
    const roblox = await yahooStockPrices.getCurrentPrice("RBLX");
    channel.send(`ROBLOX CURRENT PRICE: $${roblox}`);
  })
});

client.on("guildMemberAdd", (member) => {
  const channel = member.guild.channels.cache.find(
    (ch) => ch.name === "general"
  );
  if (!channel) return;
  channel.send(`Welcome to the server, ${member}`);
});

client.on("message", async (msg) => {


  if (msg.content === "$inspire") {
    getQuote().then((quote) => msg.channel.send(quote));
  }

  db.get("responding").then((responding) => {
    if (responding && sadWords.some((word) => msg.content.includes(word))) {
      db.get("encouragements").then((encouragements) => {
        const encouragement =
          encouragements[Math.floor(Math.random() * encouragements.length)];
        msg.reply(encouragement);
      });
    }
  });

  if (msg.content.startsWith("$new")) {
    encouragingMessage = msg.content.split("$new ")[1];
    updateEncouragements(encouragingMessage);
    msg.channel.send("New encouraging message added.");
  }

  if (msg.content.startsWith("$del")) {
    index = parseInt(msg.content.split("$del ")[1]);
    deleteEncouragment(index);
    msg.channel.send("Encouraging message deleted.");
  }

  if (msg.content.startsWith("$list")) {
    db.get("encouragements").then((encouragements) => {
      msg.channel.send(encouragements);
    });
  }

  if (msg.content.startsWith("$responding")) {
    value = msg.content.split("$responding ")[1];

    if (value.toLowerCase() == "true") {
      db.set("responding", true);
      msg.channel.send("Responding is on.");
    } else {
      db.set("responding", false);
      msg.channel.send("Responding is off.");
    }
  }

  if (msg.content.startsWith("$money")) {
    const price = await yahooStockPrices.getCurrentPrice("GME");
    msg.channel.send(`GME CURRENT PRICE: $${price} 💎🙌🚀🚀🚀 `);
  }

  if (msg.content.startsWith("$roblox")) {
    const price = await yahooStockPrices.getCurrentPrice("RBLX");
    msg.channel.send(`ROBLOX CURRENT PRICE: $${price}`);
  }

  if (msg.content.includes("demon slayer movie")) {
    const attachment = new Discord.MessageAttachment(
      "https://memegenerator.net/img/instances/65073182.jpg"
    );
    msg.channel.send(attachment);
  }

  if (msg.content.startsWith("$prune")) {
    const number = msg.content.split("$prune ")[1];
    if (isNaN(number)) {
      return msg.channel.send("that doesn't seem to be a valid number");
    } else if (number <= 1 || number > 100) {
      return msg.channel.send("you need to input a number between 2 and 100");
    }
    msg.channel.bulkDelete(number, true).catch(err => {
      console.error(err);
      msg.channel.send("there was an error trying to prune messages");
    })
  }
});
keepAlive();
client.login(process.env.TOKEN);
