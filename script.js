let coins = 500;
let happiness = 50;


const coinsDisplay =
    document.getElementById("coins");

const happinessDisplay =
    document.getElementById("happiness");

const room =
    document.getElementById("room");

const furnitureItems =
    document.querySelectorAll(".furniture-item");


/* DRAG FURNITURE */

furnitureItems.forEach(item => {

    item.addEventListener("dragstart", event => {

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


/* DRAG LEAVE */

room.addEventListener("dragleave", () => {

    room.classList.remove("drag-over");

});


/* =========================
   DROP FURNITURE
========================= */

room.addEventListener("drop", event => {

    event.preventDefault();

    room.classList.remove("drag-over");


    const name =
        event.dataTransfer.getData("name");

    const price =
        Number(event.dataTransfer.getData("price"));

    const happinessValue =
        Number(event.dataTransfer.getData("happiness"));

    const icon =
        event.dataTransfer.getData("icon");


    /* Check coins */

    if (coins < price) {

        alert("Not enough coins! 🪙");

        return;
    }


    /* Spend coins */

    coins -= price;


    /* Increase happiness */

    happiness += happinessValue;


    /* Update UI */

    coinsDisplay.textContent = coins;

    happinessDisplay.textContent = happiness;


    /* Create furniture */

    const furniture =
        document.createElement("div");


    furniture.classList.add(
        "placed-furniture"
    );


    furniture.textContent = icon;


    /* Position furniture */

    const roomRect =
        room.getBoundingClientRect();


    let x =
        event.clientX - roomRect.left;

    let y =
        event.clientY - roomRect.top;


    /* Keep inside room */

    x = Math.max(30, Math.min(x, roomRect.width - 60));

    y = Math.max(30, Math.min(y, roomRect.height - 60));


    furniture.style.left = `${x}px`;

    furniture.style.top = `${y}px`;


    /* Add furniture to room */

    room.appendChild(furniture);


    console.log(
        `${name} added to room`
    );

});