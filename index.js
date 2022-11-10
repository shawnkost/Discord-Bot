require('dotenv').config(); //initialize dotenv
const Discord = require('discord.js'); //import discord.js
const yahooStockPrices = require("yahoo-stock-prices");

const client = new Discord.Client(); //create new client

const generalChannelID = "398918078655758339";
const stockPricesChannelID = "821443098277052427";

function getQuote() {
  return fetch("https://zenquotes.io/api/random")
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      return data[0]["q"] + " -" + data[0]["a"];
    });
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  cron.schedule("*/2 * * * *", () => {
    const channel = client.channels.cache.get(stockPricesChannelID);
    getQuote().then((quote) =>
      channel.send(`Daily quote of the day: ${quote}`)
    );
  });
  cron.schedule("0 17-22/1 * * 1-5", async () => {
    const channel = client.channels.cache.get(stockPricesChannelID);
    const price = await yahooStockPrices.getCurrentPrice("GME");
    channel.send(`GME CURRENT PRICE: $${price} 💎🙌🚀🚀🚀 `);
    const roblox = await yahooStockPrices.getCurrentPrice("RBLX");
    channel.send(`ROBLOX CURRENT PRICE: $${roblox}`);
  })
});

//make sure this line is the last line
client.login(process.env.CLIENT_TOKEN); //login bot using token
