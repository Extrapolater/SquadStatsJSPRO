const Command = require("../../base/Command.js"),
	Discord = require("discord.js"),
	axios = require("axios"),
	io = require("socket.io-client"),
	config = require("../../config");



const stringCleaner = require("@sindresorhus/slugify");
const Canvas = require("canvas");
const { resolve } = require("path");
// Register assets fonts
Canvas.registerFont(resolve("./assets/fonts/theboldfont.ttf"), {
	family: "Bold",
});
Canvas.registerFont(resolve("./assets/fonts/SketchMatch.ttf"), {
	family: "SketchMatch",
});

const applyText = (canvas, text, defaultFontSize) => {
	const ctx = canvas.getContext("2d");
	do {
		ctx.font = `${(defaultFontSize -= 10)}px Bold`;
	} while (ctx.measureText(text).width > 600);
	return ctx.font;
};

/** Wraps a text in multiple lines. A solution for .fillText() that goes out of the canvas.
 *
 * @param {Object<Canvas>} context - The Canvas Object.
 * @param {string} text - The text to be wrapped.
 * @param {number} x - The x-coordinate.
 * @param {number} y - The y-coordinate.
 * @param {number} maxWidth - The maximum value of the width of one line.
 * @param {number} lineHeight - The space between multiple lines.
 * @author LeventHAN
 */
function wrapText(context, text, x, y, maxWidth, lineHeight) {
	let line;
	let words;
	let testWidth;
	let metrics;
	let testLine;
	let cars;
	cars = text.split("\n");
	for (let ii = 0; ii < cars.length; ii++) {
		line = "";
		words = cars[ii].split(" ");
		for (let n = 0; n < words.length; n++) {
			testLine = line + words[n] + " ";
			metrics = context.measureText(testLine);
			testWidth = metrics.width;
			if (testWidth > maxWidth) {
				context.fillText(line, x, y);
				line = words[n] + " ";
				y += lineHeight;
			} else {
				line = testLine;
			}
		}
		context.fillText(line, x, y);
		y += lineHeight;
	}
}
/**Draws a text to the canvas.
 *
 * @param {Object} ctx - The context of the canvas 2D.
 * @param {string} font - The font size and type, (ex. 70px Bold).
 * @param {string} strokeStyle - The color of the outer stroke in HEX.
 * @param {number} lineWidth - The width of the letter's line.
 * @param {string} data - Player data (obtained from MongoDB) to be drawn in the canvas.
 * @param {number} xPos - The postion of the text X-coordinates.
 * @param {number} yPos - The postion of the text Y-coordinates.
 * @param {number} gradientWidth - The width of the gradient.
 * @param {number} gradientHeight - The height of the gradient.
 * @param {string} colorStart - The gradients start color in HEX.
 * @param {string} colorEnd - The gradients end color in HEX.
 * @author LeventHAN
 */
function drawText(
	ctx,
	font,
	strokeStyle,
	lineWidth,
	data,
	xPos,
	yPos,
	gradientWidth,
	gradientHeight,
	colorStart,
	colorEnd
) {
	// Draw Kills with gradient
	ctx.font = font;
	ctx.strokeStyle = strokeStyle;
	ctx.lineWidth = lineWidth;
	ctx.strokeText(data, xPos, yPos);
	let gradient = ctx.createLinearGradient(gradientWidth, 0, gradientHeight, 0);
	gradient.addColorStop(0, colorStart);
	gradient.addColorStop(1, colorEnd);
	ctx.fillStyle = gradient;
	ctx.fillText(data, xPos, yPos);
}

/**Command for squad profile stats track.
 * <h2>Usage: </h2>
 * <h3>Linking your account</h3>
 * <code>{prefix}profile {Steam64ID}</code>
 * <br />
 * <h3>Removing the link from your account</h3>
 * <code>{prefix}profile re</code> OR <code>{prefix}profile re-link</code>
 * <br />
 * <h6>Note: </h6>
 * <sub><sup>After linking your account you don't need to specify your steam64ID anymore. Just use; <code>{prefix}profile</code></sup></sub>
 *
 * @author LeventHAN
 * @class Squad-Track-Profile
 * @extends Command
 */
class MapVote extends Command {
	constructor(client) {
		super(client, {
			name: "mapvote",
			dirname: __dirname,
			enabled: true,
			guildOnly: true,
			aliases: [],
			memberPermissions: [],
			botPermissions: ["SEND_MESSAGES", "EMBED_LINKS", "KICK_MEMBERS"],
			nsfw: false,
			ownerOnly: false,
			cooldown: 1000,
		});
		this.client = client;
		this.pool = null;
	}

	async run(message, args, /**@type {{}}*/ data) {
		if (!data.guild.plugins.squad.mapVote.enabled)
			return message.error("MAP VOTE IS NOT ENABLED");

		const client = this.client;

		const socket = io.connect("ws://185.255.92.71:7894", {
			auth: {
				token: "MySexyPassword123"
			}
		});

		socket.on("connect_error", (err) => {
			return console.log(err.data); // { content: "Please retry later" }
		});

		if(!socket) return console.error("Socket connection was not accomplied.");

		socket.on(("PLAYER_DAMAGED"), (content) => {
			console.log("DEBUG", Date.now());
			console.log(content);

			const modeVoteEmbed = new Discord.MessageEmbed()
				.setColor('#000000')
				.setTitle("misc/MODE_TITLE")
				.setDescription();
			











		});

		const canvas = Canvas.createCanvas(1680, 1080),
			ctx = canvas.getContext("2d");

		// Background language
		const background = await Canvas.loadImage(
			"./assets/img/mapvote_background.jpg"
		);
		// This uses the canvas dimensions to stretch the image onto the entire canvas
		ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

		// example maps array

		const response = await axios.get(
			"https://raw.githubusercontent.com/Squad-Wiki-Editorial/squad-wiki-pipeline-map-data/master/completed_output/_Current%20Version/finished.json"
		);

		// All layer names
		// response.data.Maps.levelName
		// response.data.Maps.gamemode
		let modes = [];
		let ignoreModes = [
			"Tutorial",
			"Training",
			"Traning",
			"Tanks",
			"TA",
			"Insurgency"
		];
		response.data.Maps.forEach(
			(map) => {
				if(!modes.includes(map.gamemode) 
				&& map.gamemode
				&& !ignoreModes.includes(map.gamemode)) {
					modes.push(map.gamemode);
				}

			}
		);
		console.log(modes);


		/* response.levelName ==> harita ismi */

		let maps = [
			{
				mapName: "AL BASRAH",
				mapSrc: await Canvas.loadImage(
					"https://static.wikia.nocookie.net/squad_gamepedia/images/2/20/Squad_Al_Basrah_2.jpg/revision/latest/scale-to-width-down/480?cb=20181117014811"
				),
			},
			{
				mapName: "BELAYA",
				mapSrc: await Canvas.loadImage(
					"https://static.wikia.nocookie.net/squad_gamepedia/images/f/f4/Belaya_HighRes.jpg/revision/latest/scale-to-width-down/480?cb=20181117012812"
				),
			},
			{
				mapName: "CHORA",
				mapSrc: await Canvas.loadImage(
					"https://static.wikia.nocookie.net/squad_gamepedia/images/3/3c/Chora1_Minimap_V6.jpeg/revision/latest/scale-to-width-down/480?cb=20181117014105"
				),
			},
			{
				mapName: "FALLUJAH",
				mapSrc: await Canvas.loadImage(
					"https://static.wikia.nocookie.net/squad_gamepedia/images/1/1e/Fallujah_Minimap.jpg/revision/latest/scale-to-width-down/480?cb=20200912005720"
				),
			},
			{
				mapName: "GORODOK",
				mapSrc: await Canvas.loadImage(
					"https://static.wikia.nocookie.net/squad_gamepedia/images/4/4e/Alpha_v9_Gorodok_Map.jpg/revision/latest/scale-to-width-down/480?cb=20200608215632"
				),
			},
			{
				mapName: "KAMDESH",
				mapSrc: await Canvas.loadImage(
					"https://static.wikia.nocookie.net/squad_gamepedia/images/5/57/Kamdesh_Minimap_Final.jpg/revision/latest/scale-to-width-down/480?cb=20200608220338"
				),
			},
		];

		/*
		Other Maps Source Links:

			skorpo: await Canvas.loadImage("https://static.wikia.nocookie.net/squad_gamepedia/images/3/32/Skorpo_minimap.jpg/revision/latest/scale-to-width-down/480?cb=20200608215033"),
			fools_road: await Canvas.loadImage("https://static.wikia.nocookie.net/squad_gamepedia/images/b/b6/Fools_Road_v1_Minimap_V6.jpeg/revision/latest/scale-to-width-down/480?cb=20181117013024"),
			mestia: await Canvas.loadImage("https://static.wikia.nocookie.net/squad_gamepedia/images/2/2c/Minimap_Mestia.jpg/revision/latest/scale-to-width-down/480?cb=20200608215932"),
			yehorivka: await Canvas.loadImage("https://static.wikia.nocookie.net/squad_gamepedia/images/2/2b/Alpha_v9_Yehorivka_Map.jpg/revision/latest/scale-to-width-down/480?cb=20200608220109"),
			narva: await Canvas.loadImage("https://static.wikia.nocookie.net/squad_gamepedia/images/0/04/Narva_Minimap_Alpha_V10.jpg/revision/latest/scale-to-width-down/480?cb=20200703064500"),
			kohat_toi: await Canvas.loadImage("https://static.wikia.nocookie.net/squad_gamepedia/images/9/93/Kohat_minimap_V6.jpeg/revision/latest/scale-to-width-down/480?cb=20181117014223"),
			kokan: await Canvas.loadImage("https://static.wikia.nocookie.net/squad_gamepedia/images/6/6d/Kokan_minimap_8.jpg/revision/latest/scale-to-width-down/480?cb=20200608220657"),
			lashkar_valley: await Canvas.loadImage("https://static.wikia.nocookie.net/squad_gamepedia/images/6/65/Lashkar_Minimap.jpg/revision/latest/scale-to-width-down/480?cb=20200630033145"),
			logar_valley: await Canvas.loadImage("https://static.wikia.nocookie.net/squad_gamepedia/images/d/d7/Logarvalley_minimap_V6.jpeg/revision/latest/scale-to-width-down/480?cb=20200608220856"),
			sumari_bala: await Canvas.loadImage("https://static.wikia.nocookie.net/squad_gamepedia/images/b/b0/Sumari_minimap_V6.jpeg/revision/latest/scale-to-width-down/480?cb=20181117014542"),
			mutaha: await Canvas.loadImage("https://static.wikia.nocookie.net/squad_gamepedia/images/1/15/Mutaha.jpg/revision/latest/scale-to-width-down/480?cb=20191124193304"),
			talil_outskirts: await Canvas.loadImage("https://static.wikia.nocookie.net/squad_gamepedia/images/9/9d/Tallil_Outskirts_Minimap.jpg/revision/latest/scale-to-width-down/480?cb=20200608221044"),
			manic_5: await Canvas.loadImage("https://static.wikia.nocookie.net/squad_gamepedia/images/3/35/Manic-5_Minimap.jpg/revision/latest/scale-to-width-down/480?cb=20200608200737"),
			goose_bay: await Canvas.loadImage("https://static.wikia.nocookie.net/squad_gamepedia/images/d/d9/GooseBay_Minimap.jpg/revision/latest/scale-to-width-down/480?cb=20201228075903")
		*/

		/** Draws maps and their sequence numbers to canvas.
		 *
		 *@param {Array} mapArray - Array of map objects. Every element has map name and map source links.
			*@throws Will throw error if argument of array length is not equal to 6.
			*/
		const drawMaps = (mapArray) => {
			const alignText = (text) => {
				const maptxt = ctx.measureText(text);
				return (400 - maptxt.width) / 2;
			};

			if (mapArray.length != 6) {
				throw new Error("Map array must has 6 elements.");
			}

			// dont touch the rest of the variables they are hardcoded constant coordinate values

			// draw map images
			ctx.font = "42px Bold";
			ctx.fillStyle = "#fcfc03";

			mapArray.forEach((map) => {
				map.mapSrc
			});

			ctx.drawImage(
				mapArray[0].mapSrc, 
				120,
				90,
				400,
				400);

			ctx.fillText(
				mapArray[0].mapName,
				120 + alignText(mapArray[0].mapName),
				540
			);


			ctx.drawImage(mapArray[1].mapSrc, 640, 90, 400, 400);
			ctx.fillText(
				mapArray[1].mapName,
				640 + alignText(mapArray[1].mapName),
				540
			);

			ctx.drawImage(mapArray[2].mapSrc, 1160, 90, 400, 400);
			ctx.fillText(
				mapArray[2].mapName,
				1160 + alignText(mapArray[2].mapName),
				540
			);

			ctx.drawImage(mapArray[3].mapSrc, 120, 580, 400, 400);
			ctx.fillText(
				mapArray[3].mapName,
				120 + alignText(mapArray[3].mapName),
				1030
			);

			ctx.drawImage(mapArray[4].mapSrc, 640, 580, 400, 400);
			ctx.fillText(
				mapArray[4].mapName,
				640 + alignText(mapArray[4].mapName),
				1030
			);

			ctx.drawImage(mapArray[5].mapSrc, 1160, 580, 400, 400);
			ctx.fillText(
				mapArray[5].mapName,
				1160 + alignText(mapArray[5].mapName),
				1030
			);

			// draw numbers
			ctx.font = "64px Sans-serif";
			ctx.strokeStyle = "black";
			ctx.lineWidth = 6;
			ctx.fillStyle = "#f56c42";

			ctx.strokeText("1", 460, 460);
			ctx.fillText("1", 460, 460);

			ctx.strokeText("2", 980, 460);
			ctx.fillText("2", 980, 460);

			ctx.strokeText("3", 1500, 460);
			ctx.fillText("3", 1500, 460);

			ctx.strokeText("4", 460, 950);
			ctx.fillText("4", 460, 950);

			ctx.strokeText("5", 980, 950);
			ctx.fillText("5", 980, 950);

			ctx.strokeText("6", 1500, 950);
			ctx.fillText("6", 1500, 950);
		};

		drawMaps(maps);

		const attachment = new Discord.MessageAttachment(
			canvas.toBuffer(),
			"mapVote.png"
		);
		message.channel.send(attachment);
	}
}

module.exports = MapVote;
