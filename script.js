let coins = 500;
let happiness = 0;
let level = 1;
let currentCat = null;
let pendingCoins = 0;

let inventory = {};
let completedMissions = [];

let currentRoom = "living-room";

let roomFurniture = {
    "living-room": [],
    "bedroom": [],
    "garden": []
};

/* =========================
   CAT DATA
========================= */

const cats = {

    Lem: {
        personality: "Calm",
        favorite: "Bed"
    },

    Den: {
        personality: "Playful",
        favorite: "Toy"
    },

    Cheese: {
        personality: "Friendly",
        favorite: "Cat Tree"
    }

};


/* =========================
   ELEMENTS
========================= */

const levelDisplay =
    document.getElementById("level");

const coinsDisplay =
    document.getElementById("coins");

const happinessDisplay =
    document.getElementById("happiness");

const room =
    document.getElementById("room");

const cat =
    document.getElementById("cat");

const catMessage =
    document.getElementById("cat-message");

const catOptions =
    document.querySelectorAll(".cat-option");

const furnitureItems =
    document.querySelectorAll(".furniture-item");

const earnCoinsButton =
    document.getElementById("earn-coins");

const pendingCoinsDisplay =
    document.getElementById("pending-coins");

const restartGameButton =
    document.getElementById("restart-game");

const inventoryList =
    document.getElementById("inventory-list");

const emptyInventory =
    document.getElementById("empty-inventory");

const roomButtons = document.querySelectorAll(".room-btn");

roomButtons.forEach(button => {

    button.addEventListener("click", () => {

        // Save current room before switching
        saveCurrentRoomFurniture();

        currentRoom = button.dataset.room;

        roomButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        displayCurrentRoom();   

        saveGame();
    });

});

    function saveCurrentRoomFurniture() {

        roomFurniture[currentRoom] =
            Array.from(
                document.querySelectorAll(".placed-furniture")
            ).map(item => ({
                id: item.dataset.id,
                name: item.dataset.name,
                price: Number(item.dataset.price),
                happiness: Number(item.dataset.happiness),
                icon: item.textContent,
                left: item.style.left,
                top: item.style.top
            }));
    }

    function displayCurrentRoom() {

        document
            .querySelectorAll(".placed-furniture")
            .forEach(item => item.remove());

        roomFurniture[currentRoom].forEach(item => {
            createPlacedFurniture(item);
        });
    }

/* =========================
   CAT SELECTION
========================= */

catOptions.forEach(option => {

    option.addEventListener("click", () => {

        catOptions.forEach(item => {
            item.classList.remove("selected");
        });

        option.classList.add("selected");

        const catName =
            option.dataset.cat;

        const catIcon =
            option.dataset.icon;

        const personality =
            option.dataset.personality;

        currentCat = catName;

        cat.textContent = catIcon;

        const favorite =
            cats[catName].favorite;

        catMessage.textContent =
            `${catName} is ${personality}! Favorite: ${favorite} ❤️`;

        saveGame();
    });

});


/* =========================
   BUY FURNITURE
========================= */

furnitureItems.forEach(item => {

    const buyButton =
        item.querySelector(".buy-button");


    buyButton.addEventListener("click", () => {

        const requiredLevel =
            Number(item.dataset.level);

        const name =
            item.dataset.name;

        const price =
            Number(item.dataset.price);


        /* Check level */

        if (level < requiredLevel) {

            alert(
                `🔒 You need Level ${requiredLevel} to buy this furniture.`
            );

            return;
        }


        /* Check coins */

        if (coins < price) {

            alert(
                "Not enough coins! 🪙"
            );

            return;
        }


        /* Spend coins */

        coins -= price;


        /* Add to inventory */

        if (!inventory[name]) {

            inventory[name] = 0;
        }

        inventory[name]++;


        /* Update UI */

        coinsDisplay.textContent =
            coins;

        renderInventory();

        saveGame();


        catMessage.textContent =
            `You bought a ${name}! 🛍️`;
    });

});


/* =========================
   ROOM DRAG OVER
========================= */

room.addEventListener("dragover", event => {

    event.preventDefault();

    room.classList.add("drag-over");

});


/* =========================
   ROOM DRAG LEAVE
========================= */

room.addEventListener("dragleave", () => {

    room.classList.remove("drag-over");

});


/* =========================
   ROOM DROP
========================= */

room.addEventListener("drop", event => {

    event.preventDefault();

    room.classList.remove("drag-over");


    const type =
        event.dataTransfer.getData("type");


    /* =========================
       MOVE EXISTING FURNITURE
    ========================= */

    if (type === "move") {

        const id =
            event.dataTransfer.getData("id");


        const furniture =
            document.querySelector(
                `[data-id="${id}"]`
            );


        if (furniture) {

            moveFurniture(
                furniture,
                event.clientX,
                event.clientY
            );

            saveGame();
        }

        return;
    }


    /* =========================
       PLACE FROM INVENTORY
    ========================= */

    if (type === "inventory") {

        const name =
            event.dataTransfer.getData("name");


        const item =
            furnitureData[name];


        if (!item) {
            return;
        }


        if (!inventory[name] ||
            inventory[name] <= 0) {

            return;
        }


        /* Remove one from inventory */

        inventory[name]--;


        /* Happiness */

        let happinessEarned =
            item.happiness;


        if (
            currentCat &&
            cats[currentCat].favorite === name
        ) {

            happinessEarned += 10;

            alert(
                `${currentCat} loves this! ❤️ +10 bonus happiness!`
            );
        }


        happiness +=
            happinessEarned;


        /* Create furniture */

        createPlacedFurniture({

            id:
                "furniture-" +
                Date.now() +
                "-" +
                Math.random(),

            name:
                name,

            price:
                item.price,

            happiness:
                happinessEarned,

            icon:
                item.icon,

            left:
                "50px",

            top:
                "50px"

        });


        /* Position */

        const furniture =
            document.querySelector(
                `[data-id^="furniture-"]`
            );


        const allFurniture =
            document.querySelectorAll(
                ".placed-furniture"
            );


        const newestFurniture =
            allFurniture[
                allFurniture.length - 1
            ];


        moveFurniture(
            newestFurniture,
            event.clientX,
            event.clientY
        );

        roomFurniture[currentRoom] =
            Array.from(
                document.querySelectorAll(".placed-furniture")
            ).map(item => ({

                id: item.dataset.id,

                name: item.dataset.name,

                price: Number(item.dataset.price),

                happiness: Number(item.dataset.happiness),

                icon: item.textContent,

                left: item.style.left,

                top: item.style.top

            }));

        /* Update */

        coinsDisplay.textContent =
            coins;

        happinessDisplay.textContent =
            happiness;


        updateLevel();

        renderInventory();

        checkMissions();

        saveGame();

        return;
    }

});


/* =========================
   FURNITURE DATA
========================= */

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

/* =========================
   MISSIONS
========================= */

const missions = [

    {
        id: "cozy-cat",

        icon: "🛏️",

        name: "Cozy Cat",

        description: "Place 1 Bed in the room.",

        target: 1,

        reward: 100,

        getProgress: () =>
            getPlacedFurnitureCount("Bed")
    },


    {
        id: "play-time",

        icon: "🧶",

        name: "Play Time",

        description: "Place 1 Toy in the room.",

        target: 1,

        reward: 75,

        getProgress: () =>
            getPlacedFurnitureCount("Toy")
    },


    {
        id: "happy-cat",

        icon: "❤️",

        name: "Happy Cat",

        description: "Reach 30 happiness.",

        target: 30,

        reward: 150,

        getProgress: () =>
            happiness
    },


    {
        id: "nice-room",

        icon: "🏠",

        name: "Nice Room",

        description: "Place 3 furniture items.",

        target: 3,

        reward: 200,

        getProgress: () =>
            document.querySelectorAll(
                ".placed-furniture"
            ).length
    },


    {
        id: "cat-lover",

        icon: "🐱",

        name: "Cat Lover",

        description: "Reach 70 happiness.",

        target: 70,

        reward: 300,

        getProgress: () =>
            happiness
    }

];

/* =========================
   MOVE FURNITURE
========================= */

function moveFurniture(
    furniture,
    mouseX,
    mouseY
) {

    const roomRect =
        room.getBoundingClientRect();


    let x =
        mouseX -
        roomRect.left -
        30;


    let y =
        mouseY -
        roomRect.top -
        30;


    x = Math.max(
        10,
        Math.min(
            x,
            roomRect.width - 70
        )
    );


    y = Math.max(
        10,
        Math.min(
            y,
            roomRect.height - 70
        )
    );


    furniture.style.left =
        `${x}px`;


    furniture.style.top =
        `${y}px`;
}


/* =========================
   PASSIVE COINS
========================= */

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


/* =========================
   COLLECT COINS
========================= */

earnCoinsButton.addEventListener(
    "click",
    () => {

        if (!currentCat) {

            alert(
                "Choose a cat first! 🐱"
            );

            return;
        }


        if (pendingCoins <= 0) {

            catMessage.textContent =
                "Your cat hasn't earned any coins yet! 🐱";

            return;
        }


        coins +=
            pendingCoins;


        catMessage.textContent =
            `${currentCat} gave you ${pendingCoins} coins! 🪙`;


        pendingCoins = 0;


        coinsDisplay.textContent =
            coins;


        pendingCoinsDisplay.textContent =
            "+0 🪙";


        saveGame();
    }
);


/* =========================
   RENDER INVENTORY
========================= */

function renderInventory() {

    inventoryList.innerHTML = "";


    let hasItems = false;


    Object.keys(inventory).forEach(name => {

        const quantity =
            inventory[name];


        if (quantity <= 0) {
            return;
        }


        hasItems = true;


        const item =
            furnitureData[name];


        const inventoryItem =
            document.createElement("div");


        inventoryItem.classList.add(
            "inventory-item"
        );


        inventoryItem.draggable = true;


        inventoryItem.dataset.name =
            name;


        inventoryItem.innerHTML = `

            <div class="inventory-icon">
                ${item.icon}
            </div>

            <span class="inventory-name">
                ${name}
            </span>

            <span class="inventory-count">
                × ${quantity}
            </span>

        `;


        /* Drag inventory item */

        inventoryItem.addEventListener(
            "dragstart",
            event => {

                event.dataTransfer.setData(
                    "type",
                    "inventory"
                );

                event.dataTransfer.setData(
                    "name",
                    name
                );

            }
        );


        inventoryList.appendChild(
            inventoryItem
        );

    });


    if (!hasItems) {

        const message =
            document.createElement("p");

        message.id =
            "empty-inventory";

        message.textContent =
            "Your inventory is empty.";

        inventoryList.appendChild(
            message
        );
    }

}


/* =========================
   UPDATE LEVEL
========================= */

function updateLevel() {

    let newLevel = 1;


    if (happiness >= 120) {

        newLevel = 4;

    } else if (happiness >= 70) {

        newLevel = 3;

    } else if (happiness >= 30) {

        newLevel = 2;
    }


    if (newLevel > level) {

        alert(
            `🎉 Level ${newLevel} unlocked!`
        );
    }


    level =
        newLevel;


    levelDisplay.textContent =
        level;


    updateFurnitureLocks();
}


/* =========================
   UPDATE SHOP LOCKS
========================= */

function updateFurnitureLocks() {

    furnitureItems.forEach(item => {

        const requiredLevel =
            Number(item.dataset.level);


        const requiredHappiness =
            (requiredLevel - 1) * 30;


        const buyButton =
            item.querySelector(".buy-button");


        if (
            happiness <
            requiredHappiness
        ) {

            item.classList.add(
                "locked"
            );


            buyButton.disabled =
                true;


            if (
                !item.querySelector(
                    ".lock-text"
                )
            ) {

                const lockText =
                    document.createElement(
                        "span"
                    );


                lockText.classList.add(
                    "lock-text"
                );


                lockText.textContent =
                    `🔒 Happiness ${requiredHappiness}`;


                item.appendChild(
                    lockText
                );
            }

        } else {

            item.classList.remove(
                "locked"
            );


            buyButton.disabled =
                false;


            const lockText =
                item.querySelector(
                    ".lock-text"
                );


            if (lockText) {
                lockText.remove();
            }

        }

    });

}


/* =========================
   SAVE GAME
========================= */

function saveGame() {
    const furniture = [];

    document.querySelectorAll(".placed-furniture").forEach(item => {
        furniture.push({
            id: item.dataset.id,
            name: item.dataset.name,
            price: Number(item.dataset.price),
            happiness: Number(item.dataset.happiness),
            icon: item.textContent,
            left: item.style.left,
            top: item.style.top
        });
    });

    // Save furniture for the current room
    roomFurniture[currentRoom] = furniture;

    const gameData = {
        coins,
        happiness,
        level,
        currentCat,
        pendingCoins,
        inventory,
        completedMissions,
        currentRoom,
        roomFurniture
    };

    localStorage.setItem("catHouseGame", JSON.stringify(gameData));
}


    const gameData = {

        coins:
            coins,

        happiness:
            happiness,

        level:
            level,

        currentCat:
            currentCat,

        pendingCoins:
            pendingCoins,

        inventory:
            inventory,

        completedMissions:
            completedMissions,

        furniture:
            furniture

    };


    localStorage.setItem(
        "catHouseGame",
        JSON.stringify(gameData)
    );


/* =========================
   LOAD GAME
========================= */

function loadGame() {

    const savedGame =
        localStorage.getItem("catHouseGame");


    if (!savedGame) {

        updateLevel();

        renderInventory();

        return;
    }


    const gameData =
        JSON.parse(savedGame);


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


    // Restore room data
    roomFurniture =
        gameData.roomFurniture ?? {
            "living-room": [],
            "bedroom": [],
            "garden": []
        };


    currentRoom =
        gameData.currentRoom ?? "living-room";


    /* Update UI */

    coinsDisplay.textContent =
        coins;

    happinessDisplay.textContent =
        happiness;

    levelDisplay.textContent =
        level;

    pendingCoinsDisplay.textContent =
        `+${pendingCoins} 🪙`;


    /* Restore cat */

    if (currentCat) {

        const selectedCat =
            document.querySelector(
                `.cat-option[data-cat="${currentCat}"]`
            );


        if (selectedCat) {

            catOptions.forEach(item => {

                item.classList.remove(
                    "selected"
                );

            });


            selectedCat.classList.add(
                "selected"
            );


            cat.textContent =
                selectedCat.dataset.icon;


            const personality =
                selectedCat.dataset.personality;


            const favorite =
                cats[currentCat].favorite;


            catMessage.textContent =
                `${currentCat} is ${personality}! Favorite: ${favorite} ❤️`;

        }

    }


    /* Restore room button */

    roomButtons.forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.room === currentRoom
        );

    });


    /* Restore inventory */

    renderInventory();


    /* Restore missions */

    renderMissions();


    /* Restore shop */

    updateFurnitureLocks();


    /* Restore current room furniture */

    if (gameData.roomFurniture) {
        roomFurniture = gameData.roomFurniture;
    } else {
        roomFurniture = {
            "living-room": gameData.furniture ?? [],
            "bedroom": [],
            "garden": []
        };
    }

    currentRoom = gameData.currentRoom ?? "living-room";

        roomButtons.forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.room === currentRoom
        );
    });

    roomFurniture[currentRoom].forEach(savedFurniture => {
        createPlacedFurniture(savedFurniture);
    });

}
/* =========================
   CREATE PLACED FURNITURE
========================= */

function createPlacedFurniture(
    savedFurniture
) {

    const furniture =
        document.createElement("div");


    furniture.classList.add(
        "placed-furniture"
    );


    furniture.textContent =
        savedFurniture.icon;


    furniture.dataset.id =
        savedFurniture.id;


    furniture.dataset.name =
        savedFurniture.name || "";


    furniture.dataset.price =
        savedFurniture.price;


    furniture.dataset.happiness =
        savedFurniture.happiness;


    furniture.style.left =
        savedFurniture.left;


    furniture.style.top =
        savedFurniture.top;


    room.appendChild(
        furniture
    );


    furniture.draggable =
        true;


    /* Move */

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


    /* Delete */

    furniture.addEventListener(
        "dblclick",
        () => {

            const refund =
                Math.floor(
                    Number(
                        furniture.dataset.price
                    ) / 2
                );


            const happinessValue =
                Number(
                    furniture.dataset.happiness
                );


            coins +=
                refund;

            happiness -=
                happinessValue;

            /* Remove FIRST */

            furniture.remove();


            /* Update UI */

            coinsDisplay.textContent =
                coins;


            happinessDisplay.textContent =
                happiness;


            updateLevel();


            saveGame();

        }
    );

}


/* =========================
   RESTART GAME
========================= */

restartGameButton.addEventListener(
    "click",
    () => {

        const confirmRestart =
            confirm(
                "Are you sure you want to restart the game? All progress will be lost."
            );


        if (!confirmRestart) {
            return;
        }


        localStorage.removeItem(
            "catHouseGame"
        );


        location.reload();

    }
);

/* =========================
   MISSION FUNCTIONS
========================= */

const missionList =
    document.getElementById("mission-list");


function getPlacedFurnitureCount(name) {

    return document.querySelectorAll(
        `.placed-furniture[data-name="${name}"]`
    ).length;

}


/* =========================
   RENDER MISSIONS
========================= */

function renderMissions() {

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


        const card =
            document.createElement("div");


        card.classList.add(
            "mission-card"
        );


        if (completed) {

            card.classList.add(
                "completed"
            );

        }


        card.innerHTML = `

            <div class="mission-icon">
                ${mission.icon}
            </div>

            <span class="mission-name">
                ${mission.name}
            </span>

            <div class="mission-description">
                ${mission.description}
            </div>

            <div class="mission-progress">

                ${
                    completed
                        ? "✅ Completed!"
                        : `${progress} / ${mission.target}`
                }

            </div>

            <div class="mission-reward">

                ${
                    completed
                        ? `🎁 Reward claimed: +${mission.reward} 🪙`
                        : `🎁 Reward: +${mission.reward} 🪙`
                }

            </div>

        `;


        missionList.appendChild(card);

    });

}


/* =========================
   CHECK MISSIONS
========================= */

function checkMissions() {

    missions.forEach(mission => {

        const progress =
            mission.getProgress();


        if (
            progress >= mission.target &&
            !completedMissions.includes(
                mission.id
            )
        ) {

            completedMissions.push(
                mission.id
            );


            coins +=
                mission.reward;


            coinsDisplay.textContent =
                coins;


            alert(
                `🎉 Mission Complete!\n\n` +
                `${mission.name}\n` +
                `+${mission.reward} 🪙`
            );

        }

    });


    renderMissions();

}

function saveCurrentRoomFurniture() {

    roomFurniture[currentRoom] =
        Array.from(
            document.querySelectorAll(".placed-furniture")
        ).map(item => ({

            id: item.dataset.id,

            name: item.dataset.name,

            price: Number(item.dataset.price),

            happiness: Number(item.dataset.happiness),

            icon: item.textContent,

            left: item.style.left,

            top: item.style.top

        }));

}

function displayCurrentRoom() {

    document
        .querySelectorAll(".placed-furniture")
        .forEach(item => item.remove());

    roomFurniture[currentRoom].forEach(item => {

        createPlacedFurniture(item);

    });

}

/* =========================
   START GAME
========================= */

loadGame();

renderMissions();