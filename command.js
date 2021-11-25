const { prefix } = require('./config.json');
const ytdl = require('ytdl-core');
const {emoji, phraseCount, emojiNumbersR } = require('./dataID.json')

module.exports = (client, people, callback) => {
    

    //checks if person is on the list of people
    //does not technically need the check
    // if (typeof people === 'string') {
    //     people = [people];
    // }
    //client checking for when a message comes in
    client.on('message', message => {
        
        //content is the msg that the user sent as a command
        var { content } = message;

        //ignores bot messages when populating for reactions
        if (message.member?.user.username === 'bot_test_1' || !message.member) {
            return;
        }
        //logs all messages from people other than bot
        else {
            console.log(`${new Date(Number(new Date()))} ${message.member.user.username}: ${content}`);
        };

        //using contentOriginal because youtube links are case sensitive
        contentOriginal = content;
        content = content.toLowerCase();

        //can remove once rythm bot is kicked
        if (message.member.user.username === 'Rythm') {
            message.delete();
            return;
        }

        //idk if people use this, can add !help once rythm bot is kicked
        if (content === '!h') {
            var names_phrases = 'To use, put !NAME \nPeople: Phrases\n';
            people.forEach(person => {
                names_phrases += ` ${person}: ${phraseCount[person]}\n`
            });
            message.channel.send(
                names_phrases + 'You can also react with a face for a random phrase of that person.\n' +
                'Other useful command(s): !all'
            )
            .catch(console.error);
            return;
        }

        //outputs everyone listed in dataID.json and however many phrases they have
        if (content === '!all') {
            //deletes users own message, just to keep chat cleaner
            message.delete();
            for (const [person, emojiID] of Object.entries(emoji)) {
                if (phraseCount[person]) {
                    message.channel.send(`React with a number to hear phrases for ${emojiID}.`)
                    .then(msgReaction => {
                        //use \ before an emoji in discord to retrieve emoji id#
                        for (let i = 0; i < phraseCount[person]; i++) {
                            msgReaction.react(emojiNumbersR[i]);
                        }
                    })
                    .catch(console.error);
                }
            }
            return; 
        }
        
        //deletes all messages in the last 2 weeks, will fail if the latest messages are too old
        if (content ==='!d' || content ==='!del' || content === '!delete') {
            message.channel.messages.fetch()
            .then((results) => {
                message.channel.bulkDelete(results);
            })
            .catch(console.error);
            return; 
        }

/**************************************Joins most populated voice channel****************************************************/
        const { voice } = message.member;

        var mostPopularChannel = {
            voiceChannel: voice.channel,
            name: '',
            population: 0
        };
        //if not in a channel
        if (!voice.channelID) {
            //get list of all voice channels
            const voiceChannels = message.guild.channels.cache.filter(c => c.type === 'voice');
            
            for (const [id, voiceChannel] of voiceChannels) {
                //checks to see which voice channel has the most people and assigns it to mostPopularChannel
                if (mostPopularChannel.population < voiceChannel.members.size) {
                    mostPopularChannel.voiceChannel = voiceChannel;
                    mostPopularChannel.name = voiceChannel.name;
                    mostPopularChannel.population = voiceChannel.members.size
                };

            }

            //if there is no mostPopularChannel, meaning no one is in a voice channel at all, dont do anything
            if (!mostPopularChannel.voiceChannel) {
                message.channel.send('There is currently no one in a voice channel.');

                message.delete();
                //message.reply('There is currently no one in a channel.');
                return;
            }
        }

/******************************************************************************************/

        if (content.substring(0, 2) === '!p') {
            //i think refers to info of the current voice channel 
            mostPopularChannel.voiceChannel.join()
                .then(connection => {
                    const youtubeURL = contentOriginal.substring(contentOriginal.indexOf('h'), contentOriginal.length);
                    connection.play(ytdl(youtubeURL, { filter: 'audioonly', quality: 'highestaudio', highWaterMark: 1 << 25 }));
                return;
            })
            .catch(console.error);
            callback(message);

            return;
        }


        //checks for each person in the people array, which person with voices 
        people.forEach(person => {
            const command = `${prefix}${person}`
            if (content.slice(1) === person) {
                console.log(content.slice(1))
                message.delete();
                const phrases = phraseCount[person];

                if (phraseCount[person] === 0) {
                    message.channel.send(`${person} does not yet have any phrases stored.`);
                    return;
                }

                message.channel.send(
                    `React with a number to hear phrases for ${emoji[person]}.`
                ).then(msgReaction => {
                    //use \ before an emoji in discord to retrieve emoji id#
                    for (let i = 0; i < phrases; i++) {
                        msgReaction.react(emojiNumbersR[i]);
                    }
                })
                return;
            }


            if (content.startsWith(`${command}`) || content === command || content.substring(0, 2) === '!p') {
                //checks the last char, whetherh its a single digit or not
                var phraseNum = content.slice(-1);
                if (isNaN(phraseNum)) {
                    phraseNum = 0;
                }

                //join voice channel with most people
                mostPopularChannel.voiceChannel.join()
                .then(connection => {
                    //play audio clip of a certain person with number denoting which phrase
                    connection.play(`./audio/clipped/${person}/${phraseNum}.mp3`);
                    message.delete();
                    return;
                })
                .catch(console.error);
                callback(message);

                
                
            }
        })
        
    })
}