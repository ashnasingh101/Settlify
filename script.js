let tileSize = 32;
let rows = 16;
let columns = 16;

let board;
let boardWidth = tileSize * columns; // 32 * 16
let boardHeight = tileSize * rows; // 32 * 16
let context;

//squirrel
let squirrelWidth = tileSize * 2;
let squirrelHeight = tileSize;
let squirrelX = tileSize * columns / 2 - tileSize;
let squirrelY = tileSize * rows - tileSize * 2;

let squirrel = {
    x: squirrelX,
    y: squirrelY,
    width: squirrelWidth,
    height: squirrelHeight
}

let squirrelImg;
let squirrelVelocityX = tileSize; //squirrel moving speed

//acorns
let acornArray = [];
let acornWidth = tileSize * 2;
let acornHeight = tileSize;
let acornX = tileSize;
let acornY = tileSize;
let acornImg;

let acornRows = 2;
let acornColumns = 3;
let acornCount = 0; //number of acorns to defeat
let acornVelocityX = 1; //acorn moving speed

//nuts
let nutArray = [];
let nutVelocityY = -10; //nut moving speed

let score = 0;
let gameOver = false;

window.onload = function () {
    board = document.getElementById("board");
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext("2d"); //used for drawing on the board

    //draw initial squirrel
    // context.fillStyle="green";
    // context.fillRect(squirrel.x, squirrel.y, squirrel.width, squirrel.height);

    //load images
    squirrelImg = new Image();
    squirrelImg.src = "./squirrel.png";
    squirrelImg.onload = function () {
        context.drawImage(squirrelImg, squirrel.x, squirrel.y, squirrel.width, squirrel.height);
    }

    acornImg = new Image();
    acornImg.src = "./acorn.png";
    createAcorns();

    requestAnimationFrame(update);
    document.addEventListener("keydown", moveSquirrel);
    document.addEventListener("keyup", shoot);
}

function update() {
    requestAnimationFrame(update);

    if (gameOver) {
        return;
    }

    context.clearRect(0, 0, board.width, board.height);

    //squirrel
    context.drawImage(squirrelImg, squirrel.x, squirrel.y, squirrel.width, squirrel.height);

    //acorns
    for (let i = 0; i < acornArray.length; i++) {
        let acorn = acornArray[i];
        if (acorn.alive) {
            acorn.x += acornVelocityX;

            //if acorn touches the borders
            if (acorn.x + acorn.width >= board.width || acorn.x <= 0) {
                acornVelocityX *= -1;
                acorn.x += acornVelocityX * 2;

                //move all acorns up by one row
                for (let j = 0; j < acornArray.length; j++) {
                    acornArray[j].y += acornHeight;
                }
            }
            context.drawImage(acornImg, acorn.x, acorn.y, acorn.width, acorn.height);

            if (acorn.y >= squirrel.y) {
                gameOver = true;
            }
        }
    }

    //nuts
    for (let i = 0; i < nutArray.length; i++) {
        let nut = nutArray[i];
        nut.y += nutVelocityY;
        context.fillStyle = "white";
        context.fillRect(nut.x, nut.y, nut.width, nut.height);

        //nut collision with acorns
        for (let j = 0; j < acornArray.length; j++) {
            let acorn = acornArray[j];
            if (!nut.used && acorn.alive && detectCollision(nut, acorn)) {
                nut.used = true;
                acorn.alive = false;
                acornCount--;
                score += 100;
            }
        }
    }

    //clear nuts
    while (nutArray.length > 0 && (nutArray[0].used || nutArray[0].y < 0)) {
        nutArray.shift(); //removes the first element of the array
    }

    //next level
    if (acornCount == 0) {
        //increase the number of acorns in columns and rows by 1
        score += acornColumns * acornRows * 100; //bonus points :)
        acornColumns = Math.min(acornColumns + 1, columns / 2 - 2); //cap at 16/2 -2 = 6
        acornRows = Math.min(acornRows + 1, rows - 4);  //cap at 16-4 = 12
        if (acornVelocityX > 0) {
            acornVelocityX += 0.2; //increase the acorn movement speed towards the right
        }
        else {
            acornVelocityX -= 0.2; //increase the acorn movement speed towards the left
        }
        acornArray = [];
        nutArray = [];
        createAcorns();
    }

    //score
    context.fillStyle = "white";
    context.font = "16px courier";
    context.fillText(score, 5, 20);
}

function moveSquirrel(e) {
    if (gameOver) {
        return;
    }

    if (e.code == "ArrowLeft" && squirrel.x - squirrelVelocityX >= 0) {
        squirrel.x -= squirrelVelocityX; //move left one tile
    }
    else if (e.code == "ArrowRight" && squirrel.x + squirrelVelocityX + squirrel.width <= board.width) {
        squirrel.x += squirrelVelocityX; //move right one tile
    }
}

function createAcorns() {
    for (let c = 0; c < acornColumns; c++) {
        for (let r = 0; r < acornRows; r++) {
            let acorn = {
                img: acornImg,
                x: acornX + c * acornWidth,
                y: acornY + r * acornHeight,
                width: acornWidth,
                height: acornHeight,
                alive: true
            }
            acornArray.push(acorn);
        }
    }
    acornCount = acornArray.length;
}

function shoot(e) {
    if (gameOver) {
        return;
    }

    if (e.code == "Space") {
        //shoot
        let nut = {
            x: squirrel.x + squirrelWidth * 15 / 32,
            y: squirrel.y,
            width: tileSize / 8,
            height: tileSize / 2,
            used: false
        }
        nutArray.push(nut);
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
        a.x + a.width > b.x &&   //a's top right corner passes b's top left corner
        a.y < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner
        a.y + a.height > b.y;    //a's bottom left corner passes b's top left corner
}
