
const { ReactionUserManager } = require('discord.js');
const {phraseCount, voiceChannelIDs, botID, emojiNumbers } = require('./dataID.json')

module.exports = client => {
    //phrasenum is 0 by default
    const handleReaction = async (reaction, user, phraseNum = 0) => {
        //makes sure that when the bot is reacting itself, the bot wont turn itself on
        if (user.id === botID) return;
        console.log(user.username, (new Date(Date.now())).toString(), reaction.message.content, reaction._emoji.name);

        /*****************************************************
        //originally made to select random audio, use in future maybe

        if (phraseCount[reaction.emoji.name] > -1) {
            console.log('exists')
            person = reaction.emoji.name;
            
            phraseNum = Math.floor(Math.random() * phraseCount[person])
            //console.log(reaction.emoji.name)

            reaction.message.channel.messages.fetch(reaction.message.id)
            .then(message => {
                if (message.author.id === botID) {
                    joinChannel(client, reaction, person, phraseNum);
                }                
            })
            .catch(console.error)
        }
        ******************************************************/

        //gets which phrase number the emoji reacted with
        phraseNum = emojiNumbers[reaction.emoji.name];
        //checks the message that was reacted to, looking for which person  
        reaction.message.channel.messages.fetch(reaction.message.id)
        .then(message => {
            //retrieves whatever emoji it is and returns the corresponding person that was reacted to it
            person = message.content.slice(message.content.length - 25, message.content.length - 21);

            joinChannel(client, person, phraseNum);
        })
        .catch(console.error)

    }

    //when a user reacts with an emoji that is listed in dataID.json emojinumbers to ANY message in any channel
    client.on('messageReactionAdd', (reaction, user) => {
        handleReaction(reaction, user);
    })
    //when a user unreacts with an emoji that is listed in dataID.json emojinumbers to ANY message in any channel
    client.on('messageReactionRemove', (reaction, user) => {
        handleReaction(reaction, user);
    })
}


function joinChannel(client, person, phraseNum) {
    var mostPopularChannel = {
        id: '',
        size: 0
    };

    for (const voiceChannelID of Object.entries(voiceChannelIDs)) {
        //checks to see which voice channel, of the ones that are listed in dataID.json,
        //has the most people and assigns it to mostPopularChannel to later join
        //this means that the bot WILL NOT join the same person's vc of who reacted but whatever vc has more people
        let channelSize = client.channels.cache.get(voiceChannelID[1]).members.size;
        if (mostPopularChannel.size < channelSize) {
            mostPopularChannel.id = voiceChannelID[1];
            mostPopularChannel.size = channelSize;
        };

    }

    const popularistChannel = client.channels.cache.get(mostPopularChannel.id);

    if (!popularistChannel) {
        console.log('No channels to join');
        return; 
    }

    popularistChannel.join().then(connection => {
        connection.play(`./audio/clipped/${person}/${phraseNum}.mp3`);

        return;
    }).catch(e => {
        console.error(e);
    });
}