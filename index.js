const Discord = require("discord.js");
const client = new Discord.Client();
const fs = require("fs");
const Request = require("request");
const ytdl = require('ytdl-core');
const moment = require('moment');
const worker = require('webworker-threads').Worker;
const twss = require('twss');
const VOICECHANNEL = "Stuff";

var nextraid;
var playlist = [];
var playlistposition = 0;
var vconn;
var w;
var lewd = false;

twss.threshold = 0.99;

var roster = {
	'datetime': 0,
	'topic': '',
	'tanks': ['None', 'None'],
	'healers': ['None', 'None'],
	'dps': ['None', 'None', 'None', 'None']
}

//hack to make the blank roster object immutable
var currentRoster = JSON.parse(JSON.stringify(roster));

function Percentile(x)
{
	if( x < 25 ) return ":poop:";
	if( x > 25 && x < 51) return "Mediocre";
	if( x > 50 && x < 76) return "Good";
	if( x > 75 && x < 96) return "Excellent";
	if( x > 95) return "Best :star:"; 
}

function TLA(x)
{
	if(x.match('DarkKnight')) return '<:drk:342458050575204356>';
	if(x.match('Machinist')) return '<:mch:342458050575204357>';
	if(x.match('Astrologian')) return '<:ast:342458050747170827>';
        if(x.match('Arcanist')) return '<:acn:342458050797502464>';
        if(x.match('Warrior')) return '<:war:342458050801565699>';
        if(x.match('Archer')) return '<:arc:342458050805891072>';
        if(x.match('Bard')) return '<:brd:342458050814410753>';
        if(x.match('Dragoon')) return ' <:drg:342458050831187968>';
        if(x.match('BlackMage')) return '<:blm:342458050835251210>';
        if(x.match('Rogue')) return '<:rog:342458050847834125>';
        if(x.match('Conjurer')) return '<:cnj:342458050851897354>';
        if(x.match('Ninja')) return '<:nin:342458050910617602>';
        if(x.match('Lancer')) return '<:lnc:342458050931589130>';
        if(x.match('Gladiator')) return '<:gla:342458050948497408>';
        if(x.match('RedMage')) return '<:rdm:342458050986377267>';
        if(x.match('Summoner')) return '<:smn:342458051019931659>';
        if(x.match('Paladin')) return '<:pld:342458051023994880>';
        if(x.match('Monk')) return '<:gla:342458050948497408>';
        if(x.match('Samurai')) return '<:sam:342458051057418240>';
        if(x.match('WhiteMage')) return '<:whm:342458051061612545>';
        if(x.match('Pugilist')) return '<:pgl:342458051065806848>';
        if(x.match('Thaumaturge')) return '<:thm:342458051082584076>';
        if(x.match('Marauder')) return '<:mrd:342458051108012032>';
        if(x.match('Scholar')) return '<:sch:342458051347087360>';
	return x;
}

function EncID(x)
{
	if(!x) return "None";
	if(x.match('Susano')) return "zone=15&encounter=1036";
	if(x.match('Lakshmi')) return "zone=15&encounter=1037";
	if(x.match('AlteRoite') || x.match('O1S')) return "zone=17&encounter=42";
	if(x.match('Catastrophe') || x.match('O2S')) return "zone=17&encounter=43";
	if(x.match('Halicarnassus') || x.match('O3S')) return "zone=17&encounter=44";
	if(x.match('Exdeath') || x.match('O4S-Exfaust')) return "zone=17&encounter=45";
	if(x.match('NeoExdeath') || x.match('O4S')) return "zone=17&encounter=46";
	return x;
}

client.on('ready', () => {
	console.log('Logged in as ' + client.user.tag);
});

client.on('message', (message) => {
	console.log(message.content + " - probability of lewd: " + twss.prob(message.content));
	if(twss.is(message.content) && lewd)	
	{
		message.channel.send("OwO");
	}
	if(message.content.startsWith("!lewd"))
	{
		lewd = !lewd;
		message.channel.send("TWSS " + ((lewd)? 'on': 'off') + ".");	
	}
	if(message.content.startsWith("!fflogs")){
		var outmsg;
		var args = message.content.split(" ");
		if(args.length != 5)
		{
			message.channel.send("IF YOU'RE HAPPY AND YOU KNOW IT \nSYNTAX ERROR \n(syntax error!)");
			return;
		}
		var charname = args[1] + "%20" + args[2];
		var world = args[3];
		var region = "eu";
		var encounter = args[4];
	
		var fflogs_uri = "https://www.fflogs.com:443/v1/parses/character/";
			fflogs_uri += charname + "/";
			fflogs_uri += world + "/";
			fflogs_uri += region + "?";
			fflogs_uri += EncID(encounter) + "&api_key=5b8f9262441268091d2da6b54c70f030";
			Request.get({ json: true, uri: fflogs_uri }, (err, res, data) => {
			if(err){
				console.log('GET error ', err);
			}else if(res.statusCode != 200){
				console.log('GET error ', res.statusCode);
			}else{
				outmsg = "NOTHING HERE, WARRIOR OF LIGHT. IF THIS IS YOU, GET F\*CKING GUD.";
				for(var i = 0; i < res.body.length; i++)
				{
					outmsg = "\n\nData for encounter " + res.body[i].name + ":\n\n";
					for(var j = 0; j < res.body[i].specs.length; j++)
					{
						var spec = res.body[i].specs[j];
						outmsg += TLA(spec.spec) + " ";
						outmsg += "Best: " + spec.best_persecondamount + " (" + spec.best_historical_percent + "% - "+
							Percentile(spec.best_historical_percent) + ")\n";
					}
				}
				message.channel.send(outmsg);
			}
		});
	}
	///
	function joinVoiceChannel(x)
	{
		console.log(client.channels.find('name', x).joinable);
		return client.channels.find('name', x).join();
	}	
	function leaveVoiceChannel(x){
		return client.channels.find('name', x).leave();
	}
	function playVoiceLine(filename)
	{
	
		joinVoiceChannel(VOICECHANNEL)
			.then(vconn =>{
				console.log(vconn);
				const ds = vconn.playArbitraryInput('./svf/' + filename , {seek:0});
				ds.on('end', end => {vconn.disconnect()});
			})
			.catch(console.error);
	}
	if(message.content.startsWith("!roster")){
		
		var args = message.content.split(' ');
		fs.readFile('/tmp/nextraid', 'utf-8', function(err, data){
			if(!err){
				currentRoster = JSON.parse(data);
			}else{
				console.log("Couldn't read nextraid data");
			}
		});
		switch(args[1])
		{
			case 'clear': 
				//there is probably a more efficient way to do this
				currentRoster.tanks[0] = currentRoster.tanks[1] =
				currentRoster.healers[0] = currentRoster.healers[1] =
				currentRoster.dps[0] = currentRoster.dps[1] = 
				currentRoster.dps[2] = currentRoster.dps[3] = 'None';
				message.channel.send("Roster cleared.");
				break;
			case 'show':
				var t = new Date(currentRoster.datetime);
				var outmsg = "Current raid roster for " + moment(t.toISOString()).format('MMMM Do YYYY, h:mm a') +
					" (" + moment(t.toISOString()).utcOffset('+0300').fromNow() + ")"+
					"\n**" + currentRoster.topic +
					"**\n<:tank:343069630321000459> " + currentRoster.tanks[0] +
					"\n<:tank:343069630321000459> " + currentRoster.tanks[1] +
					"\n<:heal:343069630534778890> " + currentRoster.healers[0] +
					"\n<:heal:343069630534778890> " + currentRoster.healers[1] +
					"\n<:dps:343069630270537729> " + currentRoster.dps[0] +
					"\n<:dps:343069630270537729> " + currentRoster.dps[1] +
					"\n<:dps:343069630270537729> " + currentRoster.dps[2] +
	        			"\n<:dps:343069630270537729> " + currentRoster.dps[3];
				message.channel.send(outmsg);
				break;
			case 'add':
				var role = args[2];
				var firstname = args[3];
				var lastname = args[4];
				switch(role){
					case 'tank': 
						currentRoster.tanks.pop(); 
						currentRoster.tanks.unshift(firstname + ' ' + lastname);
						break;
					case 'healer':
						currentRoster.healers.pop();
						currentRoster.healers.unshift(firstname + ' ' + lastname);
						break;
					case 'dps':
						currentRoster.dps.pop();
						currentRoster.dps.unshift(firstname + ' ' + lastname);
				}
				message.channel.send(":ok_hand:");
				break;
			case 'settopic':
				currentRoster.topic = message.content.substr(17);
				message.channel.send(":ok_hand:");
				break;		
			case 'settime':
				currentRoster.datetime = Date.parse(message.content.substr(15));
				message.channel.send(":ok_hand:");
				break;
			default:
				message.channel.send("Valid !roster commands are: clear, show, add [role] [name], settime [time]");
				
		}
		if(currentRoster.datetime > 0)
		{		
			fs.writeFile('/tmp/nextraid', JSON.stringify(currentRoster), function(err, data){
				if(err)
					console.log("Couldn't write nextraid data, will be forgotten on restart.");
			});
		}
	}
	if(message.content.startsWith("I AM THE LORD OF THE HIVE"))
	{
		message.channel.send("CAN'T WE JUST GO FOR A DRINK? I'M LORD OF THE REVEL, NOT LORD OF THE MASS MURDER OF INNOCENTS. HA HA HA HA!");
	}
	if(message.content.startsWith("SUSANO IS AS WEAK AS HIS CREATOR!"))
	{
		message.channel.send("I THOUGHT WE WERE BUDDIES, BRO. WHY?");
	}
	if(message.content.startsWith("!revels")){
		message.channel.send("LET THE RRRRRREVELS BEGINNN!");
		playVoiceLine("revels.mp3");
	}
	if(message.content.startsWith("!rejoice")){
		message.channel.send("REJOICE!");
		playVoiceLine("rejoice.mp3");
	}
	if(message.content.startsWith("!dance")){
		message.channel.send("AHAHAHAHAHAH! 'TWAS A MEMORABLE DANCE INDEED!");
		playVoiceLine("dance.mp3");
	}
	if(message.content.startsWith("!chaos"))
	{
		message.channel.send("HOW OUR HEARTS SING IN THE CHAOS!");
		playVoiceLine("chaos.mp3");
	}
	if(message.content.startsWith("!makeway")){
		message.channel.send("MAKE WAY!");
		playVoiceLine("makeway.mp3");
	}
	if(message.content.startsWith("!rise")){
		message.channel.send("RISE....RISE TO THE OCCASION!");
		playVoiceLine("rise.mp3");
	}
	if(message.content.startsWith("!resilient")){
		message.channel.send("RESILIENT SOULS! I SALUTE YOU!");
		playVoiceLine("resilient.mp3");
	}
	if(message.content.startsWith("!ferocity")){
		message.channel.send("SUCH... FEROCITY!");
		playVoiceLine("ferocity.mp3");
	}
	if(message.content.startsWith("!seas")){
		message.channel.send("THE SEAS PART FOR WE ALONE!");
		playVoiceLine("seas.mp3");
	}
	if(message.content.startsWith("!identitycrisis"))
	{
		message.channel.send("I DON'T KNOW WHICH PRIMAL I AM ANY MORE");
		playVoiceLine("ravana.wav");
	}
	if(message.content.startsWith("!earthandstone")){
		message.channel.send("EARTH AND STONE AT OUR BECK AND CALL!");
		playVoiceLine("earthandstone.mp3");
	}
	if(message.content.startsWith("!cake")){
		message.channel.send("I'M A PRIMAL BITCH, I BAKE THE BEST CAKES");
	}
	if(message.content.startsWith("KRAFT DES MEERES")){
		message.channel.send("I AM OKAY WITH THIS.");
	}
	if(message.content.startsWith("!wild")){
		message.channel.send("WILD AND PURE AND FORRRREVER FREEEEEE!");
		playVoiceLine("wild.mp3");
	}
	if(message.content.startsWith("!setnextraid"))
	{
		message.reply("!nextraid is now obsolete, use !roster instead.");
	}
	if(message.content.startsWith("!nextraid"))
	{
		message.reply("!nextraid is now obsolete, use !roster instead.");	
	}
	if(message.content.startsWith("!joke"))
	{
		var jokes = [
			"What do you get when you cross a penis and a potato? A dictator",
			"A penis has a sad life, his hair is a mess, his family is nuts, his neightbour is an asshole "+
			"and his owner beats him.",
			"My dick is so big that at birth, instead of spanking me, the doctor smashed me with a bottle of champagne.",
			"I got this great joke about my penis, but it's too long.",
			"If I laid my dick out on my computer keyboard, it would go all the way from A to Z!"
		];
		var rnd = Math.floor(Math.random() * jokes.length);
		message.channel.send(jokes[rnd]);
	}
	if(message.content.startsWith("!play")){
		leaveVoiceChannel(VOICECHANNEL);
		var params = message.content.split(' ');
		var vid = params[1];
		if(vid.startsWith("http")) vid = vid.substr(31);
		var url = "http://www.youtube.com/watch?v=" + vid;
		console.log(url);
                joinVoiceChannel(VOICECHANNEL).then(vconn=>{
                        const strm = ytdl(url, {filter: 'audioonly'});
	                const dispatcher = vconn.playStream(strm);

			dispatcher.on('end', end => { vconn.disconnect(); });
                });

	}
	if(message.content.startsWith("!plist")){
		//doesn't work.... yet.
		var args = message.content.split(' ');
		switch(args[1])
		{
			case 'clear':
				playlist = [];
				message.channel.send(":ok_hand:");
				break;
			case 'add':
				var vid = args[2];
		                if(vid.startsWith("http")) vid = vid.substr(31);
				playlist.push(vid);
				message.channel.send(":ok_hand:");
				break;
			case 'remove':
				if(args[2]){
					playlist.splice(args[2],1);
				}else{
					playlist.pop();
				}
				break;
			case 'show':
				outmsg = "Current playlist:\n";
				var i = 0;
				for(i = 0; i < playlist.length; i++)
				{
					outmsg += i + ": http://www.youtube.com/watch?v=" + playlist[i] + "\n";
				}
				if(i == 0)
				{
					outmsg += "(Empty)";
				}
				message.channel.send(outmsg);
				break;
			case 'next':
				w.postMessage({cmd:"next", channel: client.channels.find('name', VOICECHANNEL)});
				message.channel.send("Now playing: http://www.youtube.com/watch?v=" + playlist[playlistposition]);	
				break;
			case 'prev':
				w.postMessage({cmd:"prev"});
				message.channel.send("Now playing: http://www.youtube.com/watch?v=" + playlist[playlistposition]);
				break;
			case 'play':
				w = new worker(function(){
					this.onmessage = function(ev){
						var cmd = ev.data.cmd;
						var channel = ev.data.channel;
						console.log("Inside worker thread, channel metadata: " + channel);
						console.log("worker message recd:" + ev.data.cmd);
						switch(ev.data.cmd){
							case 'next': playlistpositon++; break;
							case 'prev': playlistposition--; break;
							case 'begin':
							default:
						}
						channel.join();
						return;
						leaveVoiceChannel(VOICECHANNEL);
						joinVoiceChannel(VOICECHANNEL).then(vconn => {
							console.log("vc " + VOICECHANNEL + "entered, playing.");
							var url = "http://www.youtube.com/watch?v=" + playlist[playlistposition];
							const strm = ytdl(url, { filter: 'audioonly'});
							const dispatcher = vconn.playStream(strm);
							console.log(url);
							dispatcher.on('end', end => {
								playlistPosition++;
								this.postMessage('next');
							});
						}).catch(console.error);
					}
				});
				w.postMessage({cmd:'begin', channel: client.channels.find('name', VOICECHANNEL)});
				break;
		}
	}
	if(message.content.startsWith("!stop")){
		leaveVoiceChannel(VOICECHANNEL);
	}
	if(message.content.startsWith("!help")){
		outmsg = "\nAvailable !commands:\n\n";
		outmsg += "!fflogs <firstname> <lastname> <world> <encounter>\n"
		outmsg += "!help-fflogs (for more detailed help)\n"
		outmsg += "!play <YTVideoID>\n"
		outmsg += "!stop\n"
		outmsg += "!lewd (toggles That's What She Said bayesian classifier)\n"
		outmsg += "!wild !cake !earthandstone !seas !ferocity !resilient !rise !makeway !chaos !dance !rejoice !revels\n"
		outmsg += "!roster (on its own, will provide help for the command)\n";
		message.channel.send(outmsg);
	}
	if(message.content.startsWith("!help-fflogs")){
		outmsg = "\nTo retrieve FFlogs data:";
		outmsg += "\n`!fflogs <FirstName> <LastName> <World> <Encounter>`";
		outmsg += "\nThe first three should be obvious. I'm not going to insult your intelligence.";
		outmsg += "\nEncounter can be:"
		outmsg += "\n\t One of 'Lakshmi' 'Susano' 'AlteRoite' 'Catastrophe' 'Halicarnassus' 'Exdeath' 'NeoExdeath'";
		outmsg += "\n\t  These are Emanation (Extreme), Pool of Tribute (Extreme), O1S, O2S, O3S, O4S Exfaust, O4S Main Phase respectively.";
		outmsg += "\n\t  Alternatively you can query FFLogs directly using `zone=X&encounter=Y` if you know the FFLogs Zone and";
		outmsg += "\n\t  Encounter IDs."
		message.channel.send(outmsg);
	}
});

client.login('xxx');
