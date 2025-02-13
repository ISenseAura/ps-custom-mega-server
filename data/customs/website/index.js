
// Immediately Invoked Function Expression (IIFE) to handle `sessionId` and helper functions
let sessionId; // Declare sessionId globally
(function () {
  window.toID = function (text) {
    if (typeof text !== "string") {
      if (text) text = text.id || text.userid || text.roomid || text;
      if (typeof text === "number") text = "" + text;
      else if (typeof text !== "string") return "";
    }
    return text.toLowerCase().replace(/[^a-z0-9]+/g, "");
  };

  sessionId = window.location.href.split("sessionId=")[1].replace("#","");
  if (!sessionId) {
    alert("Invalid session!");
    return;
  }
  window.sessionId = sessionId;

  
})();

// API URL
const apiUrl = "http://localhost:3000";

// Make POST request function
const makePostRequest = async (url, body) => {
  body.sessionId = sessionId; // Attach sessionId to the request body
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json(); // Parse JSON response
    console.log("Response Data:", data);
    return data;
  } catch (error) {
    console.error("Error making POST request:", error);
  }
};

// Helper functions for input handling and validation
function getVal(id) {
  return document.getElementById(id).value.trim(); // Trim spaces
}

function capitalizeWords(str) {
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("-");
}

function validatePokemon(body) {
  // Name validation
  if (!body.pokemon.name) {
    throw new Error("The Pokémon name is required.");
  }
  if (body.pokemon.name.startsWith("Mega")) {
    throw new Error("The Pokémon name cannot start with 'Mega'.");
  }
  if (body.pokemon.name.includes(" ")) {
    throw new Error("The Pokémon name should not include spaces. Use '-' instead.");
  }

  // Base stats validation
  if (
    !body.pokemon.baseStats ||
    Object.values(body.pokemon.baseStats).some((stat) => isNaN(stat) || stat <= 0)
  ) {
    throw new Error("Base stats are required and must all be positive numbers.");
  }

  // Abilities validation
  if (!body.pokemon.abilities || Object.keys(body.pokemon.abilities).length === 0) {
    throw new Error("At least one ability is required.");
  }

  // Mega Pokémon validation
  if (body.isMega && !body.pokemon.requiredItem) {
    throw new Error("A Mega Pokémon must have a required item.");
  }

  // Moveset validation
  if (!body.learnset || !Array.isArray(body.learnset) || body.learnset.length === 0) {
    throw new Error("A moveset is required for the Pokémon.");
  }
}

// Add Pokémon function
function addPokemon() {
  try {
    console.log("Adding Pokémon...");

    const nameInput = getVal("name");
    const formattedName = capitalizeWords(nameInput);

    const body = {
      pokemon: {
        name: formattedName,
        types:
          getVal("type2") === getVal("type1")
            ? [getVal("type1")]
            : [getVal("type1"), getVal("type2")],
        genderRatio: { M: 0.875, F: 0.125 },
        baseStats: {
          hp: parseInt(getVal("hp")),
          atk: parseInt(getVal("atk")),
          def: parseInt(getVal("def")),
          spa: parseInt(getVal("spa")),
          spd: parseInt(getVal("spd")),
          spe: parseInt(getVal("spe")),
        },
        abilities: {
          "0": getVal("ability1"),
          "1": getVal("ability2") || null,
          H: getVal("hiddenAbility") || null,
        },
        heightm: parseFloat(getVal("height")),
        weightkg: parseFloat(getVal("weight")),
        prevo: getVal("prevo") || null,
        evoType: "trade",
        requiredItem: getVal("requiredItem") || null,
      },
      isMega: getVal("ismega").toLowerCase() === "yes",
      learnset: getVal("moveset").split(",").map((move) => move.trim()), // Convert moveset into an array
    };

    // Validate Pokémon data
    validatePokemon(body);

    // Make API request
    makePostRequest(apiUrl + "/addpokemon", body).then((response) => {
      console.log("Response from server:", response);
      alert("Pokémon added successfully!");
    });

    console.log("Pokémon added successfully:", body);
  } catch (error) {
    console.error("Error adding Pokémon:", error.message);
    alert(error.message); // Provide feedback to the user
  }
}
