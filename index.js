const Discord = require('discord.js');
var client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
const { token } = require('./config.json')
const command = require('./command')
const onReaction = require('./onReaction')

const people = ['aung', 'antt', 'andy', 'nate', 'jonn', 'jess', 'just', 'othe'];

client.on("ready", async () => {
    console.log("running...");

    //message is the callback message from command, message has all the information, see command.js
    command(client, people, (message) => {
        //console.log(message.channel)
        //message.channel.send('hi')
    })
    onReaction(client);
})

client.login(token);

//npm i ffmpeg-static
//change avatar or username
//https://discord.com/developers/applications/763659159139778591/information