let coins = 500;
let happiness = 0;
let level = 1;
let currentCat = null;
let pendingCoins = 0;


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
   DRAG FROM SHOP
========================= */

furnitureItems.forEach(item => {

    item.addEventListener("dragstart", event => {

        const requiredLevel =
            Number(item.dataset.level);

        if (level < requiredLevel) {
            event.preventDefault();
            return;
        }

        event.dataTransfer.setData(
            "type",
            "new"
        );

        event.dataTransfer.setData(
            "name",
            item.dataset.name
        );

        event.dataTransfer.setData(
            "price",
            item.dataset.price
        );

        event.dataTransfer.setData(
            "happiness",
            item.dataset.happiness
        );

        event.dataTransfer.setData(
            "icon",
            item.querySelector(".furniture-icon").textContent
        );
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
   DRAG LEAVE
========================= */

room.addEventListener("dragleave", () => {

    room.classList.remove("drag-over");
});


/* =========================
   DROP
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
       NEW FURNITURE
    ========================= */

    const name =
        event.dataTransfer.getData("name");

    const price =
        Number(
            event.dataTransfer.getData("price")
        );

    const happinessValue =
        Number(
            event.dataTransfer.getData("happiness")
        );

    const icon =
        event.dataTransfer.getData("icon");


    /* =========================
       CHECK COINS
    ========================= */

    if (coins < price) {

        alert("Not enough coins! 🪙");

        return;
    }


    /* =========================
       SPEND COINS
    ========================= */

    coins -= price;


    /* =========================
       CALCULATE HAPPINESS
    ========================= */

    let happinessEarned =
        happinessValue;


    /* Favorite bonus */

    if (
        currentCat &&
        cats[currentCat].favorite === name
    ) {

        happinessEarned += 10;

        alert(
            `${currentCat} loves this! ❤️ +10 bonus happiness!`
        );
    }


    happiness += happinessEarned;


    /* =========================
       UPDATE UI
    ========================= */

    coinsDisplay.textContent =
        coins;

    happinessDisplay.textContent =
        happiness;


    /* =========================
       CREATE FURNITURE
    ========================= */

    const furniture =
        document.createElement("div");

    furniture.classList.add(
        "placed-furniture"
    );

    furniture.textContent =
        icon;


    /* Unique ID */

    furniture.dataset.id =
        "furniture-" +
        Date.now() +
        "-" +
        Math.random();


    /* Save furniture information */

    furniture.dataset.price =
        price;

    furniture.dataset.happiness =
        happinessEarned;


    /* Add to room */

    room.appendChild(
        furniture
    );


    /* Position furniture */

    moveFurniture(
        furniture,
        event.clientX,
        event.clientY
    );


    /* Make furniture movable */

    furniture.draggable = true;


    /* =========================
       MOVE FURNITURE
    ========================= */

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


    /* =========================
       DELETE FURNITURE
    ========================= */

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


            coins += refund;

            happiness -= happinessValue;


            /* Remove furniture FIRST */

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


    /* =========================
       UPDATE LEVEL
    ========================= */

    updateLevel();


    /* =========================
       SAVE AFTER FURNITURE EXISTS
    ========================= */

    saveGame();
});


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
   PASSIVE COIN SYSTEM
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


        coins += pendingCoins;


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


    level = newLevel;


    levelDisplay.textContent =
        level;


    updateFurnitureLocks();
}


/* =========================
   UPDATE FURNITURE LOCKS
========================= */

function updateFurnitureLocks() {

    furnitureItems.forEach(item => {

        const requiredLevel =
            Number(item.dataset.level);


        const requiredHappiness =
            (requiredLevel - 1) * 30;


        if (happiness < requiredHappiness) {

            item.classList.add("locked");

            item.setAttribute(
                "draggable",
                "false"
            );


            if (
                !item.querySelector(".lock-text")
            ) {

                const lockText =
                    document.createElement("span");

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

            item.setAttribute(
                "draggable",
                "true"
            );


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


    document
        .querySelectorAll(".placed-furniture")
        .forEach(item => {

            furniture.push({

                id:
                    item.dataset.id,

                price:
                    Number(
                        item.dataset.price
                    ),

                happiness:
                    Number(
                        item.dataset.happiness
                    ),

                icon:
                    item.textContent,

                left:
                    item.style.left,

                top:
                    item.style.top
            });
        });


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

        furniture:
            furniture
    };


    localStorage.setItem(
        "catHouseGame",
        JSON.stringify(gameData)
    );
}


/* =========================
   LOAD GAME
========================= */

function loadGame() {

    const savedGame =
        localStorage.getItem(
            "catHouseGame"
        );


    if (!savedGame) {

        updateLevel();

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


    /* Update UI */

    coinsDisplay.textContent =
        coins;

    happinessDisplay.textContent =
        happiness;

    levelDisplay.textContent =
        level;

    pendingCoinsDisplay.textContent =
        `+${pendingCoins} 🪙`;


    /* =========================
       RESTORE CAT
    ========================= */

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


    /* Update furniture locks */

    updateFurnitureLocks();


    /* =========================
       RESTORE FURNITURE
    ========================= */

    gameData.furniture?.forEach(
        savedFurniture => {

            createPlacedFurniture(
                savedFurniture
            );
        }
    );
}


/* =========================
   CREATE SAVED FURNITURE
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


    furniture.draggable = true;


    /* =========================
       MOVE SAVED FURNITURE
    ========================= */

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


    /* =========================
       DELETE SAVED FURNITURE
    ========================= */

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


            coins += refund;

            happiness -= happinessValue;


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
   START GAME
========================= */

loadGame();