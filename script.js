let coins = 500;
let happiness = 50;

let currentCat = null;


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


/* =========================
   CAT SELECTION
========================= */

catOptions.forEach(option => {

    option.addEventListener("click", () => {

        /* Remove old selection */

        catOptions.forEach(item => {
            item.classList.remove("selected");
        });


        /* Select new cat */

        option.classList.add("selected");


        const catName =
            option.dataset.cat;

        const catIcon =
            option.dataset.icon;

        const personality =
            option.dataset.personality;


        /* Save current cat */

        currentCat = catName;


        /* Change cat */

        cat.textContent = catIcon;


        /* Find favorite */

        const favorite =
            cats[catName].favorite;


        /* Update message */

        catMessage.textContent =
            `${catName} is ${personality}! Favorite: ${favorite} ❤️`;

    });

});


/* =========================
   DRAG FROM SHOP
========================= */

furnitureItems.forEach(item => {

    item.addEventListener("dragstart", event => {

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


    /* Check coins */

    if (coins < price) {

        alert("Not enough coins! 🪙");

        return;
    }


    /* Spend coins */

    coins -= price;


    /* =========================
       HAPPINESS
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


    /* Update UI */

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


    /* Save furniture data */

    furniture.dataset.id =
        "furniture-" +
        Date.now() +
        "-" +
        Math.random();

    furniture.dataset.price =
        price;

    furniture.dataset.happiness =
        happinessEarned;


    /* Add to room */

    room.appendChild(
        furniture
    );


    /* Position */

    moveFurniture(
        furniture,
        event.clientX,
        event.clientY
    );


    /* =========================
       MAKE MOVABLE
    ========================= */

    furniture.draggable = true;


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
       DELETE
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


            coinsDisplay.textContent =
                coins;

            happinessDisplay.textContent =
                happiness;


            furniture.remove();

        }
    );

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