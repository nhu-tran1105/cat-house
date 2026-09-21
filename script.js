// ===============================
// CAT HOUSE GAME
// ===============================

// ===============================
// GAME STATE
// ===============================

let coins = 500;
let happiness = 0;
let level = 1;
let currentCat = null;
let pendingCoins = 0;

let inventory = {};
let completedMissions = [];

let currentRoom = "living-room";

// Furniture is stored separately for each room
let roomFurniture = {
    "living-room": [],
    "bedroom": [],
    "garden": []
};


// ===============================
// FURNITURE DATA
// ===============================

const furnitureData = {
    Bed: {
        icon: "🛏️",
        price: 100,
        happiness: 10,
        level: 1
    },

    "Cat Tree": {
        icon: "🌳",
        price: 150,
        happiness: 15,
        level: 2
    },

    Toy: {
        icon: "🧶",
        price: 50,
        happiness: 5,
        level: 1
    },

    "Food Bowl": {
        icon: "🍽️",
        price: 80,
        happiness: 8,
        level: 1
    },

    Window: {
        icon: "🪟",
        price: 120,
        happiness: 12,
        level: 2
    }
};


// ===============================
// MISSIONS
// ===============================

const missions = [
    {
        id: "cozy-cat",
        icon: "🛏️",
        name: "Cozy Cat",
        description: "Place 1 Bed in the room.",
        target: 1,
        reward: 100,
        getProgress: () => getPlacedFurnitureCount("Bed")
    },

    {
        id: "play-time",
        icon: "🧶",
        name: "Play Time",
        description: "Place 1 Toy in the room.",
        target: 1,
        reward: 75,
        getProgress: () => getPlacedFurnitureCount("Toy")
    },

    {
        id: "happy-cat",
        icon: "❤️",
        name: "Happy Cat",
        description: "Reach 30 happiness.",
        target: 30,
        reward: 150,
        getProgress: () => happiness
    },

    {
        id: "nice-room",
        icon: "🏠",
        name: "Nice Room",
        description: "Place 3 furniture items.",
        target: 3,
        reward: 200,
        getProgress: () =>
            document.querySelectorAll(".placed-furniture").length
    },

    {
        id: "cat-lover",
        icon: "🐱",
        name: "Cat Lover",
        description: "Reach 70 happiness.",
        target: 70,
        reward: 300,
        getProgress: () => happiness
    }
];


// ===============================
// HTML ELEMENTS
// ===============================

const coinsDisplay = document.getElementById("coins");
const happinessDisplay = document.getElementById("happiness");
const levelDisplay = document.getElementById("level");

const room = document.getElementById("room");

const catDisplay = document.getElementById("cat");
const catMessage = document.getElementById("cat-message");

const earnCoinsButton = document.getElementById("earn-coins");
const pendingCoinsDisplay = document.getElementById("pending-coins");

const inventoryList = document.getElementById("inventory-list");

const restartButton = document.getElementById("restart-game");

const missionList = document.getElementById("mission-list");

const roomButtons = document.querySelectorAll(".room-btn");

const furnitureItems = document.querySelectorAll(".furniture-item");

const catOptions = document.querySelectorAll(".cat-option");


// ===============================
// CAT SELECTION
// ===============================

catOptions.forEach(option => {
    option.addEventListener("click", () => {

        currentCat = option.dataset.cat;

        const icon = option.dataset.icon;
        const personality = option.dataset.personality;
        const favorite = option.dataset.favorite;

        catDisplay.textContent = icon;

        catMessage.textContent =
            `${currentCat} is ${personality}! Favorite furniture: ${favorite}.`;

        catOptions.forEach(cat => {
            cat.classList.remove("selected");
        });

        option.classList.add("selected");

        saveGame();
    });
});


// ===============================
// ROOM SELECTION
// ===============================

roomButtons.forEach(button => {

    button.addEventListener("click", () => {

        // Save furniture from the room we are leaving
        saveCurrentRoomFurniture();

        // Change room
        currentRoom = button.dataset.room;

        // Change room background
        room.classList.remove(
            "living-room",
            "bedroom",
            "garden"
        );

        room.classList.add(currentRoom);

        // Update active button
        roomButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        // Show furniture for new room
        displayCurrentRoom();

        // Update missions
        renderMissions();

        saveGame();
    });
});


// ===============================
// SHOP
// ===============================

furnitureItems.forEach(item => {

    item.addEventListener("click", () => {

        const name = item.dataset.name;

        const data = furnitureData[name];

        if (!data) {
            return;
        }

        // Check level
        if (level < data.level) {

            alert(
                `🔒 You need Level ${data.level} to buy ${name}.`
            );

            return;
        }

        // Check coins
        if (coins < data.price) {

            alert("❌ Not enough coins!");

            return;
        }

        // Buy furniture
        coins -= data.price;

        if (!inventory[name]) {
            inventory[name] = 0;
        }

        inventory[name]++;

        updateCoinsDisplay();
        renderInventory();

        saveGame();
    });
});


// ===============================
// DRAG FROM INVENTORY
// ===============================

function setupInventoryDrag(item) {

    item.addEventListener("dragstart", event => {

        event.dataTransfer.setData(
            "type",
            "inventory"
        );

        event.dataTransfer.setData(
            "name",
            item.dataset.name
        );
    });
}


// ===============================
// ROOM DRAG EVENTS
// ===============================

room.addEventListener("dragover", event => {
    event.preventDefault();
});

room.addEventListener("drop", event => {

    event.preventDefault();

    const type = event.dataTransfer.getData("type");

    // =================================
    // MOVE EXISTING FURNITURE
    // =================================

    if (type === "move") {

        const id = event.dataTransfer.getData("id");

        const furniture =
            document.querySelector(
                `[data-id="${id}"]`
            );

        if (!furniture) {
            return;
        }

        moveFurniture(
            furniture,
            event.clientX,
            event.clientY
        );

        saveGame();

        return;
    }


    // =================================
    // PLACE FURNITURE FROM INVENTORY
    // =================================

    if (type === "inventory") {

        const name =
            event.dataTransfer.getData("name");

        const data = furnitureData[name];

        if (!data) {
            return;
        }

        if (!inventory[name] || inventory[name] <= 0) {
            return;
        }

        // Remove from inventory
        inventory[name]--;

        if (inventory[name] <= 0) {
            delete inventory[name];
        }


        // ===============================
        // HAPPINESS
        // ===============================

        let happinessGain = data.happiness;

        // Favorite furniture bonus
        if (
            currentCat === "Lem" &&
            name === "Bed"
        ) {
            happinessGain += 10;
        }

        if (
            currentCat === "Den" &&
            name === "Toy"
        ) {
            happinessGain += 10;
        }

        if (
            currentCat === "Cheese" &&
            name === "Cat Tree"
        ) {
            happinessGain += 10;
        }

        happiness += happinessGain;


        // ===============================
        // CREATE FURNITURE
        // ===============================

        const furniture = document.createElement("div");

        furniture.classList.add("placed-furniture");

        furniture.textContent = data.icon;

        furniture.dataset.id =
            Date.now().toString() +
            Math.random().toString(16).slice(2);

        furniture.dataset.name = name;
        furniture.dataset.price = data.price;

        // Store total happiness earned
        furniture.dataset.happiness =
            happinessGain;

        furniture.draggable = true;

        furniture.style.position = "absolute";


        // ===============================
        // DRAG EXISTING FURNITURE
        // ===============================

        furniture.addEventListener(
            "dragstart",
            event => {

                event.dataTransfer.setData(
                    "type",
                    "move"
                );

                event.dataTransfer.setData(
                    "id",
                    furniture.dataset.id
                );
            }
        );


        // ===============================
        // DOUBLE CLICK TO REMOVE
        // ===============================

        furniture.addEventListener(
            "dblclick",
            () => {

                const refund =
                    Math.floor(data.price * 0.5);

                coins += refund;

                happiness -= Number(
                    furniture.dataset.happiness
                );

                if (happiness < 0) {
                    happiness = 0;
                }

                furniture.remove();

                updateCoinsDisplay();
                updateHappinessDisplay();
                updateLevel();

                renderInventory();
                renderMissions();

                saveGame();
            }
        );


        room.appendChild(furniture);


        // ===============================
        // POSITION
        // ===============================

        moveFurniture(
            furniture,
            event.clientX,
            event.clientY
        );


        // ===============================
        // UPDATE UI
        // ===============================

        updateCoinsDisplay();
        updateHappinessDisplay();
        updateLevel();

        renderInventory();
        renderMissions();

        checkMissions();

        saveGame();
    }
});


// ===============================
// MOVE FURNITURE
// ===============================

function moveFurniture(
    furniture,
    mouseX,
    mouseY
) {

    const roomRect =
        room.getBoundingClientRect();

    const furnitureRect =
        furniture.getBoundingClientRect();

    let x =
        mouseX -
        roomRect.left -
        furnitureRect.width / 2;

    let y =
        mouseY -
        roomRect.top -
        furnitureRect.height / 2;


    // Keep furniture inside room
    const maxX =
        room.clientWidth -
        furniture.offsetWidth;

    const maxY =
        room.clientHeight -
        furniture.offsetHeight;


    x = Math.max(
        0,
        Math.min(x, maxX)
    );

    y = Math.max(
        0,
        Math.min(y, maxY)
    );


    furniture.style.left =
        `${x}px`;

    furniture.style.top =
        `${y}px`;
}


// ===============================
// SAVE CURRENT ROOM FURNITURE
// ===============================

function saveCurrentRoomFurniture() {

    roomFurniture[currentRoom] =
        Array.from(
            document.querySelectorAll(
                ".placed-furniture"
            )
        ).map(item => {

            return {
                id: item.dataset.id,

                name: item.dataset.name,

                price: Number(
                    item.dataset.price
                ),

                happiness: Number(
                    item.dataset.happiness
                ),

                icon: item.textContent,

                left: item.style.left,

                top: item.style.top
            };
        });
}


// ===============================
// DISPLAY CURRENT ROOM
// ===============================

function displayCurrentRoom() {

    // Remove furniture currently displayed
    document
        .querySelectorAll(".placed-furniture")
        .forEach(item => {
            item.remove();
        });


    const furnitureList =
        roomFurniture[currentRoom] || [];


    furnitureList.forEach(
        savedFurniture => {
            createPlacedFurniture(
                savedFurniture
            );
        }
    );
}


// ===============================
// CREATE SAVED FURNITURE
// ===============================

function createPlacedFurniture(
    savedFurniture
) {

    const furniture =
        document.createElement("div");

    furniture.classList.add(
        "placed-furniture"
    );

    furniture.textContent =
        savedFurniture.icon ||
        furnitureData[
            savedFurniture.name
        ]?.icon ||
        "🪑";


    furniture.dataset.id =
        savedFurniture.id;

    furniture.dataset.name =
        savedFurniture.name;

    furniture.dataset.price =
        savedFurniture.price;

    furniture.dataset.happiness =
        savedFurniture.happiness;


    furniture.style.position =
        "absolute";

    furniture.style.left =
        savedFurniture.left || "20px";

    furniture.style.top =
        savedFurniture.top || "20px";


    furniture.draggable = true;


    // ===============================
    // DRAG
    // ===============================

    furniture.addEventListener(
        "dragstart",
        event => {

            event.dataTransfer.setData(
                "type",
                "move"
            );

            event.dataTransfer.setData(
                "id",
                furniture.dataset.id
            );
        }
    );


    // ===============================
    // DOUBLE CLICK DELETE
    // ===============================

    furniture.addEventListener(
        "dblclick",
        () => {

            const price =
                Number(
                    furniture.dataset.price
                );

            const furnitureHappiness =
                Number(
                    furniture.dataset.happiness
                );

            const refund =
                Math.floor(price * 0.5);


            coins += refund;

            happiness -= furnitureHappiness;

            if (happiness < 0) {
                happiness = 0;
            }


            furniture.remove();


            updateCoinsDisplay();
            updateHappinessDisplay();
            updateLevel();

            renderInventory();
            renderMissions();

            saveGame();
        }
    );


    room.appendChild(furniture);
}


// ===============================
// INVENTORY
// ===============================

function renderInventory() {

    inventoryList.innerHTML = "";


    const names =
        Object.keys(inventory);


    if (names.length === 0) {

        inventoryList.innerHTML =
            "<p>Your inventory is empty.</p>";

        return;
    }


    names.forEach(name => {

        const quantity =
            inventory[name];


        if (quantity <= 0) {
            return;
        }


        const data =
            furnitureData[name];


        if (!data) {
            return;
        }


        const item =
            document.createElement("div");

        item.classList.add(
            "inventory-item"
        );

        item.draggable = true;

        item.dataset.name = name;


        item.innerHTML = `
            <span class="inventory-icon">
                ${data.icon}
            </span>

            <span>
                ${name}
                ×${quantity}
            </span>
        `;


        setupInventoryDrag(item);


        inventoryList.appendChild(item);
    });
}


// ===============================
// COINS
// ===============================

function updateCoinsDisplay() {

    coinsDisplay.textContent =
        `${coins} 🪙`;

    pendingCoinsDisplay.textContent =
        `+${pendingCoins} 🪙`;
}


// ===============================
// HAPPINESS
// ===============================

function updateHappinessDisplay() {

    happinessDisplay.textContent =
        `${happiness} ❤️`;
}


// ===============================
// LEVEL SYSTEM
// ===============================

function updateLevel() {

    const oldLevel = level;


    if (happiness >= 120) {
        level = 4;
    }
    else if (happiness >= 70) {
        level = 3;
    }
    else if (happiness >= 30) {
        level = 2;
    }
    else {
        level = 1;
    }


    levelDisplay.textContent =
        `Level ${level}`;


    if (level > oldLevel) {

        alert(
            `🎉 Level Up!\n\nYou reached Level ${level}!`
        );
    }


    updateFurnitureLocks();
}


// ===============================
// FURNITURE LOCKS
// ===============================

function updateFurnitureLocks() {

    furnitureItems.forEach(item => {

        const name =
            item.dataset.name;

        const data =
            furnitureData[name];

        if (!data) {
            return;
        }


        if (level < data.level) {

            item.classList.add("locked");

            item.setAttribute(
                "data-lock",
                `🔒 Happiness ${(data.level - 1) * 30}`
            );
        }
        else {

            item.classList.remove("locked");

            item.removeAttribute(
                "data-lock"
            );
        }
    });
}


// ===============================
// MISSIONS
// ===============================

function getPlacedFurnitureCount(name) {

    return document.querySelectorAll(
        `.placed-furniture[data-name="${name}"]`
    ).length;
}


// ===============================
// RENDER MISSIONS
// ===============================

function renderMissions() {

    if (!missionList) {
        return;
    }


    missionList.innerHTML = "";


    missions.forEach(mission => {

        const progress =
            Math.min(
                mission.getProgress(),
                mission.target
            );


        const completed =
            completedMissions.includes(
                mission.id
            );


        const missionElement =
            document.createElement("div");


        missionElement.classList.add(
            "mission"
        );


        if (completed) {
            missionElement.classList.add(
                "completed"
            );
        }


        missionElement.innerHTML = `

            <div class="mission-icon">
                ${mission.icon}
            </div>

            <div class="mission-info">

                <strong>
                    ${mission.name}
                </strong>

                <p>
                    ${mission.description}
                </p>

                <div class="mission-progress">
                    ${progress} / ${mission.target}
                </div>

            </div>

            <div class="mission-reward">

                ${
                    completed
                        ? "✅ Completed"
                        : `+${mission.reward} 🪙`
                }

            </div>
        `;


        missionList.appendChild(
            missionElement
        );
    });
}


// ===============================
// CHECK MISSIONS
// ===============================

function checkMissions() {

    missions.forEach(mission => {

        if (
            completedMissions.includes(
                mission.id
            )
        ) {
            return;
        }


        const progress =
            mission.getProgress();


        if (progress >= mission.target) {

            completedMissions.push(
                mission.id
            );


            coins += mission.reward;


            alert(
                `🎯 Mission Complete!\n\n` +
                `${mission.name}\n` +
                `Reward: +${mission.reward} 🪙`
            );
        }
    });


    updateCoinsDisplay();

    renderMissions();

    saveGame();
}


// ===============================
// COLLECT PASSIVE COINS
// ===============================

if (earnCoinsButton) {

    earnCoinsButton.addEventListener(
        "click",
        () => {

            if (pendingCoins <= 0) {

                alert(
                    "No coins to collect yet!"
                );

                return;
            }


            coins += pendingCoins;

            pendingCoins = 0;


            updateCoinsDisplay();

            catMessage.textContent =
                "Your cat gave you some coins! 🪙";


            saveGame();
        }
    );
}


// ===============================
// PASSIVE COIN TIMER
// ===============================

setInterval(() => {

    if (!currentCat) {
        return;
    }


    const reward =
        Math.max(
            5,
            Math.floor(happiness / 10)
        );


    pendingCoins += reward;


    pendingCoinsDisplay.textContent =
        `+${pendingCoins} 🪙`;


    catMessage.textContent =
        `${currentCat} earned ${reward} coins! 🪙`;


    saveGame();

}, 30000);


// ===============================
// SAVE GAME
// ===============================

function saveGame() {

    // Save furniture currently visible
    saveCurrentRoomFurniture();


    const gameData = {

        coins: coins,

        happiness: happiness,

        level: level,

        currentCat: currentCat,

        pendingCoins: pendingCoins,

        inventory: inventory,

        completedMissions:
            completedMissions,

        currentRoom:
            currentRoom,

        roomFurniture:
            roomFurniture,

        catNeeds: catNeeds,
    };


    localStorage.setItem(
        "catHouseGame",
        JSON.stringify(gameData)
    );
}


// ===============================
// LOAD GAME
// ===============================

function loadGame() {

    const saved =
        localStorage.getItem(
            "catHouseGame"
        );


    if (!saved) {

        updateCoinsDisplay();
        updateHappinessDisplay();
        updateLevel();
        renderInventory();
        renderMissions();
        displayCurrentRoom();

        return;
    }


    try {

        const gameData =
            JSON.parse(saved);


        // ===============================
        // BASIC GAME DATA
        // ===============================

        coins =
            gameData.coins ?? 500;

        happiness =
            gameData.happiness ?? 0;

        level =
            gameData.level ?? 1;

        currentCat =
            gameData.currentCat ?? null;

        pendingCoins =
            gameData.pendingCoins ?? 0;


        inventory =
            gameData.inventory ?? {};


        completedMissions =
            gameData.completedMissions ?? [];

                if (gameData.catNeeds) {
            catNeeds = {
                hunger: gameData.catNeeds.hunger ?? 100,
                energy: gameData.catNeeds.energy ?? 100
            };
        }


        // ===============================
        // ROOM DATA
        // ===============================

        if (gameData.roomFurniture) {

            roomFurniture = {

                "living-room":
                    gameData.roomFurniture[
                        "living-room"
                    ] ?? [],

                "bedroom":
                    gameData.roomFurniture[
                        "bedroom"
                    ] ?? [],

                "garden":
                    gameData.roomFurniture[
                        "garden"
                    ] ?? []
            };

        }
        else {

            // Support old save files
            // that only had "furniture"

            roomFurniture = {

                "living-room":
                    gameData.furniture ?? [],

                "bedroom": [],

                "garden": []
            };
        }


        currentRoom =
            gameData.currentRoom ??
            "living-room";

        room.classList.remove(
            "living-room",
            "bedroom",
            "garden"
        );

        room.classList.add(currentRoom);
        // ===============================
        // UPDATE UI
        // ===============================

        updateCoinsDisplay();

        updateHappinessDisplay();

        levelDisplay.textContent =
            `Level ${level}`;


        updateFurnitureLocks();

        renderInventory();


        // ===============================
        // RESTORE CAT
        // ===============================

        if (currentCat) {

            const selectedCat =
                document.querySelector(
                    `.cat-option[data-cat="${currentCat}"]`
                );


            if (selectedCat) {

                selectedCat.classList.add(
                    "selected"
                );


                catDisplay.textContent =
                    selectedCat.dataset.icon;


                catMessage.textContent =
                    `${currentCat} is ` +
                    `${selectedCat.dataset.personality}! ` +
                    `Favorite furniture: ` +
                    `${selectedCat.dataset.favorite}.`;
            }
        }


        // ===============================
        // RESTORE ROOM BUTTON
        // ===============================

        roomButtons.forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.room ===
                    currentRoom
            );
        });


        // ===============================
        // DISPLAY ROOM
        // ===============================

        displayCurrentRoom();


        // ===============================
        // MISSIONS
        // ===============================

        renderMissions();


    } catch (error) {

        console.error(
            "Could not load saved game:",
            error
        );


        // If save is corrupted,
        // start a fresh game

        localStorage.removeItem(
            "catHouseGame"
        );


        updateCoinsDisplay();
        updateHappinessDisplay();
        updateLevel();
        renderInventory();
        renderMissions();
        displayCurrentRoom();
    }
}


// ===============================
// RESTART GAME
// ===============================

if (restartButton) {

    restartButton.addEventListener(
        "click",
        () => {

            const confirmed =
                confirm(
                    "Are you sure you want to restart the game?\n\nAll progress will be deleted."
                );


            if (!confirmed) {
                return;
            }


            // Reset game data
            coins = 500;

            happiness = 0;

            level = 1;

            currentCat = null;

            pendingCoins = 0;

            inventory = {};

            completedMissions = [];

            currentRoom =
                "living-room";


            roomFurniture = {

                "living-room": [],

                "bedroom": [],

                "garden": []
            };


            // Clear saved game
            localStorage.removeItem(
                "catHouseGame"
            );


            // Reset cat selection
            catOptions.forEach(
                cat => {
                    cat.classList.remove(
                        "selected"
                    );
                }
            );


            catDisplay.textContent =
                "🐱";


            catMessage.textContent =
                "Choose a cat to begin!";


            // Reset room buttons
            roomButtons.forEach(
                button => {

                    button.classList.toggle(
                        "active",
                        button.dataset.room ===
                            "living-room"
                    );
                }
            );


            // Clear furniture
            document
                .querySelectorAll(
                    ".placed-furniture"
                )
                .forEach(item => {
                    item.remove();
                });


            // Update UI
            updateCoinsDisplay();

            updateHappinessDisplay();

            levelDisplay.textContent =
                "Level 1";

            updateFurnitureLocks();

            renderInventory();

            renderMissions();

            saveGame();
        }
    );
}


// ===============================
// INITIALIZE GAME
// ===============================

loadGame();

renderMissions();

updateCoinsDisplay();

updateHappinessDisplay();

updateFurnitureLocks();

updateCatNeedsDisplay();

// ===============================
// CAT INTERACTION
// ===============================

const catMessages = {
    Lem: [
        "Lem is feeling cozy! 🥰",
        "Lem wants to take a nap. 💤",
        "Lem is purring! 😸",
        "Lem looks happy! ❤️"
    ],

    Den: [
        "Den wants to play! 🧶",
        "Den is ready for fun! 😸",
        "Den is running around! 🐾",
        "Den is very playful today! ❤️"
    ],

    Cheese: [
        "Cheese wants some attention! 🥰",
        "Cheese is happy to see you! 😸",
        "Cheese is purring! ❤️",
        "Cheese loves this room! 🐾"
    ]
};


if (catDisplay) {

    catDisplay.addEventListener(
        "click",
        () => {

            // No cat selected
            if (!currentCat) {

                catMessage.textContent =
                    "Choose a cat first! 🐱";

                return;
            }


            // Get messages
            const messages =
                catMessages[currentCat] || [
                    "Meow! 🐱"
                ];


            // Random message
            const randomMessage =
                messages[
                    Math.floor(
                        Math.random() *
                        messages.length
                    )
                ];


            catMessage.textContent =
                randomMessage;


            // Animation
            catDisplay.classList.remove(
                "clicked"
            );


            // Force animation restart
            void catDisplay.offsetWidth;


            catDisplay.classList.add(
                "clicked"
            );
        }
    );
}

// ===============================
// CAT MOVEMENT
// ===============================

if (catDisplay) {
    catDisplay.addEventListener("dblclick", () => {
        if (!currentCat) {
            catMessage.textContent = "Choose a cat first! 🐱";
            return;
        }

        catDisplay.classList.remove("moving");

        // Restart animation
        void catDisplay.offsetWidth;

        catDisplay.classList.add("moving");

        catMessage.textContent =
            `${currentCat} is running around! 🐾`;

        setTimeout(() => {
            catDisplay.classList.remove("moving");
        }, 1200);
    });
}

// ===============================
// CAT NEEDS
// ===============================

let catNeeds = {
    hunger: 100,
    energy: 100
};

function updateCatNeedsDisplay() {
    const hungerBar = document.getElementById("hunger-bar");
    const energyBar = document.getElementById("energy-bar");
    const happinessBar = document.getElementById("happiness-bar");

    const hungerValue =
        document.getElementById("hunger-value");

    const energyValue =
        document.getElementById("energy-value");

    const happinessValue =
        document.getElementById("happiness-value");

    const happinessPercent =
        Math.min(100, Math.max(0, happiness));

    if (hungerBar) {
        hungerBar.style.width =
            catNeeds.hunger + "%";
    }

    if (energyBar) {
        energyBar.style.width =
            catNeeds.energy + "%";
    }

    if (happinessBar) {
        happinessBar.style.width =
            happinessPercent + "%";
    }

    if (hungerValue) {
        hungerValue.textContent =
            catNeeds.hunger + "%";
    }

    if (energyValue) {
        energyValue.textContent =
            catNeeds.energy + "%";
    }

    if (happinessValue) {
        happinessValue.textContent =
            happinessPercent + "%";
    }
}

setInterval(() => {
    updateCatNeeds();
}, 30000);


// ===============================
// FURNITURE INTERACTION
// ===============================

document.addEventListener("click", (event) => {
    const furniture =
        event.target.closest(".placed-furniture");

    if (!furniture || !currentCat) return;

    const furnitureName =
        furniture.dataset.name;

    if (furnitureName === "Food Bowl") {

        catNeeds.hunger =
            Math.min(100, catNeeds.hunger + 30);

        catMessage.textContent =
            `${currentCat} is eating! 🍽️😸`;

        updateCatNeedsDisplay();

    } else if (furnitureName === "Bed") {

        catNeeds.energy =
            Math.min(100, catNeeds.energy + 30);

        catMessage.textContent =
            `${currentCat} is taking a nap! 💤🐱`;

        updateCatNeedsDisplay();

    } else if (furnitureName === "Toy") {

        happiness += 5;

        catMessage.textContent =
            `${currentCat} is playing! 🧶😸`;

        updateHappinessDisplay();
        updateFurnitureLocks();
        renderMissions();
        updateCatNeedsDisplay();
    }

    saveGame();
});