const fs = require("fs");
const path = require("path");

const customPath = path.join(path.resolve(), "/data/customs/data");
const dataPath = path.join(path.resolve(), "/data");

const { execSync, fork } = require("child_process");
const { toID } = require("../sim/dex-data");

const { spawn } = require("child_process");

const MAIN_PATH = path.join(path.resolve(), "..");
const SERVER_FOLDER_NAME = "pokemon-showdown";
const CLIENT_FOLDER_NAME = "pokemon-showdown-client";


if (!fs.existsSync(path.join(path.resolve(), "/data/customs/"))) {
	console.log(
		"[WARNING] Customs direcotry does not exist, this is either a mistake or an indication that this is a client project\nAborting importing custom pokemon data.. "
	);
	return;
}

function startApi() {
	// Path to the API script
	const apiScript = "./dist/data/customs/api.js"; // Replace with your API script path

	const child = fork(apiScript);

	child.on("message", (message) => {
		console.log("Message from child:", message);
	});
}

function getCustomPath(file) {
	return customPath + "/" + file + ".txt";
}
function getDataPath(file) {
	return dataPath + "/" + file + ".ts";
}

function getPrevoPokemon(txt) {
	let evos = [];
	let jsonObj = JSON.parse("{" + txt + "}");
	Object.values(jsonObj).forEach((val) => {
		if (val.prevo || val.baseSpecies)
			evos.push(
				JSON.stringify({
					name: toID(val.prevo) || toID(val.baseSpecies),
					evotype: val.evoType,
					from: val.name,
				})
			);
	});
	return evos;
}

const args = process.argv.slice(2);

let importPokedexData = () => {
	let customdexFilePath = getCustomPath("pokedex");
	let pokedexFilePath = (sourceFilePath = getDataPath("pokedex"));
	try {
		console.log("Importing custom pokedex data...");
		const customFileContent = fs.readFileSync(customdexFilePath, "utf-8");
		const pokedexFileContent = fs.readFileSync(sourceFilePath, "utf-8");

		const newEntries = customFileContent;
		const oldEntries = pokedexFileContent.split("/*CUSTOM POKEMONS*/");

		let bufFunc = ``;

		let existingChanges = getPrevoPokemon(newEntries);

		if (existingChanges.length) {
			bufFunc = `
	/*
	 function to add custom evolutions to existing pokemon,
	 this is basically done to let existing pokemon have 
	 the eviolite bonus if a custom pokemon is added as its evolution
	*/ 
			(() => {
	let toChangePokemon = [${existingChanges}];
	toChangePokemon.forEach((val) => {
		//val = JSON.parse(val)
		if(val.from.includes("-Mega")) {
		if(!Pokedex[(val.name)].otherFormes) Pokedex[(val.name)].otherFormes = [];
		Pokedex[(val.name)].otherFormes.push(val.from)
		} else {
		if (Pokedex[(val.name)].evos)
			Pokedex[(val.name)]?.evos?.push(val.from);
		if (!Pokedex[(val.name)].evos)
			Pokedex[(val.name)]?.evos?.push(val.from);
	}
	});
})();`;

			console.log(
				"New evolutions found for existing pokemon, making changes accordingly"
			);
		}

		if (oldEntries[1]) {
			oldEntries[0] += `/*CUSTOM POKEMONS*/\n${newEntries}\n};\n ${bufFunc}`;
			fs.writeFileSync(pokedexFilePath, oldEntries[0], "utf-8");
			console.log("Custom Pokedex imported succesfully!");
			return;
		}
		const updatedContent = pokedexFileContent.replace(
			/};\s*$/,
			`\n/*CUSTOM POKEMONS*/\n${newEntries}\n};\n`
		);

		fs.writeFileSync(pokedexFilePath, updatedContent, "utf-8");

		console.log("New entries appended successfully!");
	} catch (error) {
		console.error("Error appending new entries:", error);
	}
};

let importTextData = () => {
	let txtFiles = ["pokedex", "abilities", "items"];
	txtFiles.forEach((file) => {
		let customdexFilePath = getCustomPath("text/" + file);
		let pokedexFilePath = (sourceFilePath = getDataPath("text/" + file));
		try {
			console.log(`Importing custom ${file} text data...`);
			const customFileContent = fs.readFileSync(customdexFilePath, "utf-8");
			const pokedexFileContent = fs.readFileSync(sourceFilePath, "utf-8");

			const newEntries = customFileContent;
			const oldEntries = pokedexFileContent.split("/*CUSTOM TEXTS*/");

			let bufFunc = ``;

			if (oldEntries[1]) {
				oldEntries[0] += `/*CUSTOM TEXTS*/\n${newEntries}\n};\n ${bufFunc}`;
				fs.writeFileSync(pokedexFilePath, oldEntries[0], "utf-8");
				console.log(`Custom ${file} text imported succesfully!`);
				return;
			}
			const updatedContent = pokedexFileContent.replace(
				/};\s*$/,
				`\n/*CUSTOM TEXTS*/\n${newEntries}\n};\n`
			);

			fs.writeFileSync(pokedexFilePath, updatedContent, "utf-8");

			console.log("New entries appended successfully!");
		} catch (error) {
			console.error("Error appending new entries:", error);
		}
	});
};

let importFormatsData = () => {
	let customdexFilePath = getCustomPath("formats-data");
	let pokedexFilePath = (sourceFilePath = getDataPath("formats-data"));
	try {
		console.log("Importing custom formats-data...");
		const customFileContent = fs.readFileSync(customdexFilePath, "utf-8");
		const pokedexFileContent = fs.readFileSync(sourceFilePath, "utf-8");

		const newEntries = customFileContent;
		const oldEntries = pokedexFileContent.split("/*CUSTOM FORMATS*/");

		if (oldEntries[1]) {
			oldEntries[0] += `/*CUSTOM FORMATS*/\n${newEntries}\n};\n`;
			fs.writeFileSync(pokedexFilePath, oldEntries[0], "utf-8");
			console.log("Custom Formats data imported succesfully!");
			return;
		}
		const updatedContent = pokedexFileContent.replace(
			/};\s*$/,
			`\n/*CUSTOM FORMATS*/\n${newEntries}\n};\n`
		);

		fs.writeFileSync(pokedexFilePath, updatedContent, "utf-8");

		console.log("New entries appended successfully!");
	} catch (error) {
		console.error("Error appending new entries:", error);
	}
};

let importAbilitiesData = () => {
	let customdexFilePath = getCustomPath("abilities");
	let pokedexFilePath = (sourceFilePath = getDataPath("abilities"));
	try {
		console.log("Importing custom abilites data...");
		const customFileContent = fs.readFileSync(customdexFilePath, "utf-8");
		const pokedexFileContent = fs.readFileSync(sourceFilePath, "utf-8");

		const newEntries = customFileContent.split("/*FUNCTIONS*/");
		const oldEntries = pokedexFileContent.split("/*CUSTOM ABILITIES*/");

		let bufunc = ``;

		if (oldEntries[1]) {
			oldEntries[0] += `/*CUSTOM ABILITIES*/\n${newEntries[0]}};`;
			oldEntries[0] += `\n/*FUNCTIONS*/\n${newEntries[1]}`;
			const updatedContent = pokedexFileContent.replace(
				/};\s*$/,
				`\n/*CUSTOM ABILITIES*/\n${newEntries}};\n`
			);

			fs.writeFileSync(pokedexFilePath, oldEntries[0], "utf-8");

			console.log("Custom Abilities imported succesfully!");
			return;
		}
		const updatedContent = pokedexFileContent.replace(
			/};\s*$/,
			`\n/*CUSTOM ABILITIES*/\n${newEntries}};\n`
		);

		fs.writeFileSync(pokedexFilePath, updatedContent, "utf-8");

		console.log("Custom Abilities imported succesfully!");
	} catch (error) {
		console.error("Error importing custom abilities:", error);
	}
};

let importItemsData = () => {
	let customdexFilePath = getCustomPath("items");
	let pokedexFilePath = (sourceFilePath = getDataPath("items"));
	try {
		console.log("Importing custom abilites data...");
		const customFileContent = fs.readFileSync(customdexFilePath, "utf-8");
		const pokedexFileContent = fs.readFileSync(sourceFilePath, "utf-8");

		const newEntries = customFileContent.split("/*FUNCTIONS*/");
		const oldEntries = pokedexFileContent.split("/*CUSTOM ITEMS*/");

		let bufunc = ``;

		if (oldEntries[1]) {
			oldEntries[0] += `\n/*CUSTOM ITEMS*/\n${newEntries[0]}};`;
			oldEntries[0] += `\n/*FUNCTIONS*/\n${newEntries[1]}`;
			const updatedContent = pokedexFileContent.replace(
				/};\s*$/,
				`\n/*CUSTOM ITEMS*/\n${newEntries}};\n`
			);
			fs.writeFileSync(pokedexFilePath, oldEntries[0], "utf-8");
			console.log("Custom Items imported succesfully!");
			return;
		}
		const updatedContent = pokedexFileContent.replace(
			/};\s*$/,
			`\n/*CUSTOM ITEMS*/\n${newEntries}};\n`
		);

		fs.writeFileSync(pokedexFilePath, updatedContent, "utf-8");

		console.log("Custom Items imported succesfully!");
	} catch (error) {
		console.error("Error importing custom items:", error);
	}
};

let importLearnsetsData = () => {
	let customdexFilePath = getCustomPath("learnsets");
	let pokedexFilePath = (sourceFilePath = getDataPath("learnsets"));
	try {
		console.log("Importing custom abilites data...");
		const customFileContent = fs.readFileSync(customdexFilePath, "utf-8");
		const pokedexFileContent = fs.readFileSync(sourceFilePath, "utf-8");

		const newEntries = customFileContent;
		const oldEntries = pokedexFileContent.split("/*CUSTOM LEARNSETS*/");

		let bufunc = ``;

		if (oldEntries[1]) {
			oldEntries[0] += `/*CUSTOM LEARNSETS*/\n${newEntries}};`;
			const updatedContent = pokedexFileContent.replace(
				/};\s*$/,
				`\n/*CUSTOM LEARNSETS*/\n${newEntries}};\n`
			);
			fs.writeFileSync(pokedexFilePath, oldEntries[0], "utf-8");
			console.log("Custom Learnsets imported succesfully!");
			return;
		}
		const updatedContent = pokedexFileContent.replace(
			/};\s*$/,
			`\n/*CUSTOM LEARNSETS*/\n${newEntries}};\n`
		);

		fs.writeFileSync(pokedexFilePath, updatedContent, "utf-8");

		console.log("Custom Learnsets imported succesfully!");
	} catch (error) {
		console.error("Error importing custom learnsets:", error);
	}
};

let importCustomData = async () => {
	this.importTextData();
	this.importPokedexData();
	this.importLearnsetsData();
	this.importAbilitiesData();
	this.importItemsData();
	this.importFormatsData();
};

let updateRepo = (msg = "Data Update") => {
	console.log("\n[UPDATING SERVER REPO]")
	console.log(execSync("git add .",{cwd : MAIN_PATH + "/" + SERVER_FOLDER_NAME}).toString())
	console.log(execSync(`git commit -m "[Automated Push] ${msg}"`,{cwd : MAIN_PATH + "/" + SERVER_FOLDER_NAME}).toString())
	console.log(execSync(`git push origin2`,{cwd : MAIN_PATH + "/" + SERVER_FOLDER_NAME}).toString())
	console.log("\n[FINISHED]")
}

let updateClient = (msg) => {
	console.log("\n[UPDATING CLIENT]")
	console.log(execSync("npm run build-full",{cwd : MAIN_PATH + "/" + CLIENT_FOLDER_NAME}).toString())
	console.log("\n[FINISHED]")
}

exports.importTextData = importTextData;
exports.importPokedexData = importPokedexData;
exports.importFormatsData = importFormatsData;
exports.importAbilitiesData = importAbilitiesData;
exports.importItemsData = importItemsData;
exports.importLearnsetsData = importLearnsetsData;
exports.importCustomData = importCustomData;

if (args.length) {
	args.forEach((arg) => {
		console.log
		//console.log(this)
try {
		switch (arg) {
			case "pokedex":
				importPokedexData();
				break;
			case "abilities":
				importAbilitiesData();
				break;
			case "items":
				importItemsData();
				break;
			case "learnsets":
				importLearnsetsData();
				break;
			case "formats-data":
				importFormatsData();
				break;
			case "text/pokedex":
				importTextData();
				break;
			case "apistart":
				startApi();
				break;
			case "updaterepo":
				updateRepo();
				break;
			case "updateclient":
				updateClient();
			default:
				 importCustomData();
		}
	} catch(e) {
		console.log(e);
	}
	});
	return;
}

/* TEST FUNCTIONS, SHOULD BE REMOVED AFTER USE */


const h = require("../dist/data/customs/handler.js").default
let abs = require("./test.js").abilities;

Object.keys(abs).forEach((key) => {
	let ability = abs[key]
	let functions = [];
	if(ability.onStart) functions.push({name:"onStart",body:ability.onStart.toString()})
	if(ability.onModifySpA) functions.push({name:"onModifySpA",body:ability.onModifySpA.toString()})
	if(ability.onModifyAtk) functions.push({name:"onModifyAtk",body:ability.onModifyAtk.toString()})
	if(ability.onModifyDef) functions.push({name:"onModifyDef",body:ability.onModifyDef.toString()})
	if(ability.onModifySpD) functions.push({name:"onModifySpD",body:ability.onModifySpD.toString()})
	if(ability.onModifySpe) functions.push({name:"onModifySpe",body:ability.onModifySpe.toString()})
		
	if(ability.onTerrainChange) functions.push({name:"onTerrainChange",body:ability.onTerrainChange.toString()})
	if(ability.onWeatherChange) functions.push({name:"onWeatherChange",body:ability.onWeatherChange.toString()})
	if(ability.onDamagingHit) functions.push({name:"onDamagingHit",body:ability.onDamagingHit.toString()})
	if(ability.onAnyModifySpe) functions.push({name:"onAnyModifySpe",body:ability.onAnyModifySpe.toString()})
	if(ability.onSourceAfterFaint) functions.push({name:"onSourceAfterFaint",body:ability.onSourceAfterFaint.toString()})

	if(ability.onModifyType) functions.push({name:"onModifyType",body:ability.onModifyType.toString()})
	if(ability.onBasePower) functions.push({name:"onBasePower",body:ability.onBasePower.toString()})



	ability.functions = functions
	h.addAbility(ability )

})
	
//console.log(h)
