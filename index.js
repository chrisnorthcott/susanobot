const Discord = require("discord.js");
const client = new Discord.Client();
const fs = require("fs");
const Request = require("request");
const ytdl = require('ytdl-core');

const VOICECHANNEL = "SexybotTime";

var nextraid;
var voiceavailable;
var vconn;

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
		return client.channels.find('name', x).join();
	}	
	function leaveVoiceChannel(x){
		return client.channels.find('name', x).leave();
	}
	function playVoiceLine(filename)
	{
		joinVoiceChannel(VOICECHANNEL)
			.then(vconn =>{
				const ds = vconn.playArbitraryInput('./svf/' + filename + '.mp3', {seek:0});
				ds.on('end', end => {vconn.disconnect()});
			});
	}
	if(message.content.startsWith("!revels")){
		message.channel.send("LET THE RRRRRREVELS BEGINNN!");
		playVoiceLine("revels");
	}
	if(message.content.startsWith("!rejoice")){
		message.channel.send("REJOICE!");
		playVoiceLine("rejoice");
	}
	if(message.content.startsWith("!dance")){
		message.channel.send("AHAHAHAHAHAH! 'TWAS A MEMORABLE DANCE INDEED!");
		playVoiceLine("dance");
	}
	if(message.content.startsWith("!chaos"))
	{
		message.channel.send("HOW OUR HEARTS SING IN THE CHAOS!");
		playVoiceLine("chaos");
	}
	if(message.content.startsWith("!makeway")){
		message.channel.send("MAKE WAY!");
		playVoiceLine("makeway");
	}
	if(message.content.startsWith("!rise")){
		message.channel.send("RISE....RISE TO THE OCCASION!");
		playVoiceLine("rise");
	}
	if(message.content.startsWith("!resilient")){
		message.channel.send("RESILIENT SOULS! I SALUTE YOU!");
		playVoiceLine("resilient");
	}
	if(message.content.startsWith("!ferocity")){
		message.channel.send("SUCH... FEROCITY!");
		playVoiceLine("ferocity");
	}
	if(message.content.startsWith("!seas")){
		message.channel.send("THE SEAS PART FOR WE ALONE!");
		playVoiceLine("seas");
	}
	if(message.content.startsWith("!earthandstone")){
		message.channel.send("EARTH AND STONE AT OUR BECK AND CALL!");
		playVoiceLine("earthandstone");
	}
	if(message.content.startsWith("!cake")){
		message.channel.send("I'M A PRIMAL BITCH, I DON'T BAKE CAKES");
	}
	if(message.content.startsWith("KRAFT DES MEERES")){
		message.channel.send("I AM OKAY WITH THIS.");
	}
	if(message.content.startsWith("!wild")){
		message.channel.send("WILD AND PURE AND FORRRREVER FREEEEEE!");
		playVoiceLine
	}
	if(message.content.startsWith("!setnextraid"))
	{
		message.channel.send("UNDERSTOOD, WARRIOR OF LIGHT.");	
		nextraid = message.content.substring(12);
		fs.writeFile('/tmp/nextraid', nextraid, function(err, data) {
			if(err) console.log("Couldn't write file, !nextraid will not have persistence.");
		});
	}
	if(message.content.startsWith("!nextraid"))
	{
		fs.readFile('/tmp/nextraid', 'utf8', function(err, data) {
			if(err) {
				console.log("Couldn't load !nextraid data" +
				err + ", is a date/time saved?");
			}
			nextraid = data;
			if(!nextraid)
			{
				message.channel.send("MY APOLOGIES. I HAVE NO IDEA.");
			}else{
				message.channel.send("THE NEXT SCHEDULED RAID NIGHT IS" + nextraid.toUpperCase());
			}

		});
		
	}
	if(message.content.startsWith("!play")){
		leaveVoiceChannel("SexybotTime");
		var params = message.content.split(' ');
		var vid = params[1];
		var url = "http://www.youtube.com/watch?v=" + vid;
		console.log(url);
                joinVoiceChannel("SexybotTime").then(vconn=>{
                        const strm = ytdl(url, {filter: 'audioonly'});
	                const dispatcher = vconn.playStream(strm);

			dispatcher.on('end', end => { vconn.disconnect(); });
                });

	}
	if(message.content.startsWith("!stop")){
		leaveVoiceChannel("SexybotTime");
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

client.login("MzQyMjg0MzI1NzY2ODIzOTQ3.DGNaMA.-B_7jDMNeRL7TxajWkmIVcD8W7U");