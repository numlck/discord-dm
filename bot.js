const config = require('./config.json');
const chalk = require('chalk');
const request = require('request');
var fs = require('fs');


class Bot {
    constructor(client, token, invite, message) {
        this.client = client;
        this.token = token;
        this.invite = invite;
        this.message = message;
    }
    send() {
        var client = this.client;
        var message = this.message;
        this.client.on('ready', () => {
            var g = 0;
            request({
                method: "POST",
                url: `https://discordapp.com/api/v7/invite/${this.invite}`,
                json: false,
                headers: {
                    authorization: this.token
                },
            }, (error, response, body) => {
                if (!body) return;
                var json = JSON.parse(body);
                if (!json || !json.guild || !json.guild.id) return;
                var guild = json.guild.id;
                try {
                    var channel = this.client.guilds.get(guild).channels.find("name", "main");
                    var count = {}
                    var last_message = null;
                    var list = []
                    var blacklist = [
                        "<user blacklist>",
                    ]
                    var sent = fs.readFileSync('sent.txt').toString().split("\n");
                    function fetch(){
                        var options = {limit:100}

                        if(last_message){
                            options.around = last_message.id
                        }
       
                        channel.fetchMessages(options).then(function(x){
                            x.map(function(x){
                                if(count[x.author.id] !== undefined){
                                    count[x.author.id].count = count[x.author.id].count + 1;
                                    if( count[x.author.id].count > 9999){
                                        if(blacklist.indexOf(x.author.id) > -1){
                                            console.log("Detected Mod")
                                            return false;
                                        }
                                        if(!sent.indexOf(x.author.id)){
                                            client.users.get(x.author.id).send(message).then(g => {
                                                sent.push(x.author.id);
                                                console.log(chalk.green(`Success | Sent DM to ${x.author.username}!`));
                                            }).catch(err => {
                                                console.log(chalk.yellow(`Warning | User ${x.author.username} has Direct Messages Disabled!`));
                                            });
                                        }
                                        count[x.author.id].count = 0;
                                    }
                                } else {
                                     count[x.author.id] = {
                                        name:x.author.username,
                                        count:0
                                     };
                                }
                                last_message = x;
                             })
                        }).finally(function(){
                            fs.appendFile('sent.txt', sent.join("\n"), 'utf8', function(err) { 
                                console.log("Sent is appended to file successfully.")
                            });
                        })
                    }
                   fetch()
                } catch(err) {
                    console.log(err);
                }
            });
        });
        console.log("Login")
        this.client.login(this.token).catch(err => {
            console.log(chalk.red(`Error: Invalid Token | ${this.token}`));
        });
    }
}

module.exports = Bot;
