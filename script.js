const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext('2d');
canvas.width = 900;
canvas.height = 600;

//global variables
const cellSize = 100;
const cellGap = 3;
const gameGrid = [];
const defenders = [];
const enemies = [];
const enemyPositions = [];
const enemyExplosionPositions = [];
const projecticles = [];
const resources = [];
const winningScore = 100;
let explosionFrameX = 0;
let chosenDefender = 1;
let numberOfResources = 300;
let enemiesInterval = 600;
let frame = 0;
let gameOver = false;
let score = 0;

//mouse
const mouse = {
    x: 10,
    y: 10,
    width: 0.1,
    height: 0.1,
    clicked: false
}

canvas.addEventListener('mousedown', function () {
    mouse.clicked = true;
});

canvas.addEventListener('mouseup', function () {
    mouse.clicked = false;
});


let canvasPosition = canvas.getBoundingClientRect();
canvas.addEventListener('mousemove', function (e) {
    mouse.x = e.x - canvasPosition.left;
    mouse.y = e.y - canvasPosition.top;
});

canvas.addEventListener('mouseleave', function (e) {
    mouse.x = undefined;
    mouse.y = undefined;
});


//game board
const controlsBar = {
    width: canvas.width,
    height: cellSize
}

class Cell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = cellSize;
        this.height = cellSize;
    }

    draw() {
        if (mouse.x && mouse.y && collision(this, mouse)) {
            ctx.strokeStyle = 'white';
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }


    }
}

function createGrid() {
    for (let y = cellSize; y < canvas.height; y += cellSize) {
        for (let x = 0; x < canvas.width; x += cellSize) {
            gameGrid.push(new Cell(x, y));
        }
    }
}
createGrid();
function handleGameGrid() {
    for (let index = 0; index < gameGrid.length; index++) {
        gameGrid[index].draw();
    }
}
//projecticles

const projectile1 = new Image();
projectile1.src = 'blood_red_bullet.png';

// const defender2 = new Image();
// defender2.src = 'HeroGirl.png';


class Projecticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 35;
        this.height = 35;
        this.power = 20;
        this.speed = 5;
        this.frameX = 0;
        this.frameY = 0;
        this.spriteHeight = 141;
        this.spriteWidth = 141;
        this.minFrame = 0;
        this.maxFrame = 5;
    }
    update() {
        if (frame % 5 === 0) {
            if (this.frameX < this.maxFrame) this.frameX++;
            else this.frameX = this.minFrame;
            if (this.frameX === 15) this.shootNow = true;
        }
        this.x += this.speed;
    }
    draw() {
        // ctx.fillStyle = 'white';
        // ctx.beginPath();
        // ctx.arc(this.x, this.y, this.width, 0, Math.PI * 2);
        // ctx.fill();
        ctx.drawImage(projectile1, this.frameX * this.spriteWidth, 0, this.spriteHeight, this.spriteHeight,
            this.x, this.y - 15, this.width, this.height);
    }
}

function handleProjecticles() {
    for (let i = 0; i < projecticles.length; i++) {
        projecticles[i].update();
        projecticles[i].draw();

        for (let j = 0; j < enemies.length; j++) {
            if (enemies[j] && projecticles[i] && collision(projecticles[i], enemies[j])) {
                enemies[j].health -= projecticles[i].power;
                projecticles.splice(i, 1);
                i--;
            }
        }

        if (projecticles[i] && projecticles[i].x > canvas.width - cellSize) {
            projecticles.splice(i, 1);
            i--;
        }
    }
}
//defenders / towers
const defender1 = new Image();
defender1.src = 'HeroBoy.png';
const defender2 = new Image();
defender2.src = 'HeroGirl.png';
class Defender {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = cellSize - cellGap * 2;
        this.height = cellSize - cellGap * 2;
        this.shooting = false;
        this.shootNow = false;
        this.health = 100;
        this.projectiles = [];
        this.timer = 0;
        this.frameX = 0;
        this.frameY = 0;
        this.spriteHeight = 194;
        this.spriteWidth = 194;
        this.minFrame = 0;
        this.maxFrame = 16;
        this.chosenDefender = chosenDefender;
    }

    draw() {
        // ctx.fillStyle = 'blue';
        // ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = 'white';
        ctx.font = '30px Orbitron';
        ctx.fillText(Math.floor(this.health), this.x + 15, this.y + 25);

        if (this.chosenDefender === 1) {
            ctx.drawImage(defender1, this.frameX * this.spriteWidth, 0, this.spriteHeight, this.spriteHeight,
                this.x, this.y, this.width, this.height);
        } else if (this.chosenDefender === 2) {
            ctx.drawImage(defender2, this.frameX * this.spriteWidth, 0, this.spriteHeight, this.spriteHeight,
                this.x, this.y, this.width, this.height);
        }

    }

    update() {
        if (frame % 5 === 0) {
            if (this.frameX < this.maxFrame) this.frameX++;
            else this.frameX = this.minFrame;
            if (this.frameX === 15) this.shootNow = true;
        }

        if (this.chosenDefender === 1) {
            if (this.shooting) {
                this.minFrame = 0;
                this.maxFrame = 16;
            } else {
                this.minFrame = 17;
                this.maxFrame = 24;
            }
        } else if (this.chosenDefender === 2) {
            if (this.shooting) {
                this.minFrame = 13;
                this.maxFrame = 28;
            } else {
                this.minFrame = 0;
                this.maxFrame = 12;
            }
        }
        if (this.shooting && this.shootNow) {
            // this.timer++;
            projecticles.push(new Projecticle(this.x + 70, this.y + 35));
            this.shootNow = false;
        } else {
            // this.timer = 0;
        }
    }
}

function handleDefenders() {
    for (let i = 0; i < defenders.length; i++) {
        defenders[i].draw();
        defenders[i].update();
        if (enemyPositions.indexOf(defenders[i].y) !== -1) {
            defenders[i].shooting = true;
        } else {
            defenders[i].shooting = false;
        }
        for (let j = 0; j < enemies.length; j++) {
            if (defenders[i] && collision(defenders[i], enemies[j])) {
                enemies[j].movement = 0;
                defenders[i].health -= 0.2;
            }
            if (defenders[i] && defenders[i].health <= 0) {
                defenders.splice(i, 1);
                i--;
                enemies[j].movement = enemies[j].speed;
            }
        }
    }
}

const card1 = {
    x: 10,
    y: 10,
    width: 70,
    height: 85
}

const card2 = {
    x: 90,
    y: 10,
    width: 70,
    height: 85
}

function chooseDefender() {
    let card1stroke = 'white';
    let card2stroke = 'white';
    if (collision(mouse, card1) && mouse.clicked) {
        chosenDefender = 1;
    } else if (collision(mouse, card2) && mouse.clicked) {
        chosenDefender = 2;
    }
    if (chosenDefender === 1) {
        card1stroke = 'gold';
        card2stroke = 'white';
    } else if (chosenDefender === 2) {
        card1stroke = 'white';
        card2stroke = 'gold';
    } else {
        card1stroke = 'white';
        card2stroke = 'white';
    }
    ctx.lineWidth = 1;
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(card1.x, card1.y, card1.width, card1.height);
    ctx.strokeStyle = card1stroke;
    ctx.strokeRect(card1.x, card1.y, card1.width, card1.height);
    ctx.drawImage(defender1, 0, 0, 194, 194, 0, 5, 194 / 2, 194 / 2);
    ctx.fillRect(card2.x, card2.y, card2.width, card2.height);
    ctx.strokeStyle = card2stroke;
    ctx.drawImage(defender2, 0, 0, 194, 194, 80, 5, 194 / 2, 194 / 2);
    ctx.strokeRect(card2.x, card2.y, card2.width, card2.height);
}
// Floating Messages

const floatingMessages = [];
class floatingMessage {
    constructor(value, x, y, size, color) {
        this.value = value;
        this.x = x;
        this.y = y;
        this.size = size;
        this.lifeSpan = 0;
        this.color = color;
        this.opacity = 1;
    }

    update() {
        this.y -= 0.3;
        this.lifeSpan += 1;
        if (this.opacity > 0.03) {
            this.opacity -= 0.03;
        }
    }
    draw() {
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.font = this.size + 'px Orbitron';
        ctx.fillText(this.value, this.x, this.y)
        ctx.globalAlpha = 1;
    }
}

function handleFloatingMessages() {
    for (let i = 0; i < floatingMessages.length; i++) {
        floatingMessages[i].update();
        floatingMessages[i].draw();
        if (floatingMessages[i].lifeSpan >= 50) {
            floatingMessages.splice(i, 1);
            i--;
        }
    }
}
//enemies
const enemyTypes = [];
const enemy1 = new Image();
enemy1.src = 'enemy1.png';
enemyTypes.push(enemy1);

const enemy2 = new Image();
enemy2.src = 'enemy2.png';
enemyTypes.push(enemy2);

const explosion1 = new Image();
explosion1.src = 'explosion1.png'


class Enemy {
    constructor(verticalPosition) {
        this.x = canvas.width;
        this.y = verticalPosition;
        this.width = cellSize - cellGap * 2;
        this.height = cellSize - cellGap * 2;
        this.speed = Math.random() * 0.2 + 0.4;
        this.movement = this.speed;
        this.health = 100;
        this.maxHealth = this.health;
        this.enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        this.frameX = 0;
        this.framY = 0;
        this.minFrame = 0;
        // changing frames based on different enemy as each enemy have different frames
        // if(this.enemyType === enemy1){
        //     this.maxFrame = 4;
        // }else if (this.enemyType === enemy2){
        //     this.maxFrame = 7;
        // }

        this.maxFrame = 4;
        this.spriteHeight = 256;
        this.spriteWidth = 256;
    }

    update() {
        this.x -= this.movement;
        if (frame % 5 === 0) {
            if (this.frameX < this.maxFrame) this.frameX++;
            else this.frameX = this.minFrame;
        }

    }

    draw() {
        // ctx.fillStyle = 'red';
        // ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = 'white';
        ctx.font = '30px Orbitron';
        ctx.fillText(Math.floor(this.health), this.x + 15, this.y + 25);
        ctx.drawImage(this.enemyType, this.frameX * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);

    }
}



function handleEnemies() {
    for (let index = 0; index < enemies.length; index++) {
        enemies[index].update();
        enemies[index].draw();
        if (enemies[index].x < 0) {
            gameOver = true;
        }
        if (enemies[index].health <= 0) {
            enemyExplosionPositions.push({ 'x': enemies[index].x, 'y': enemies[index].y });
            console.log("enemyExplosionPositions", enemyExplosionPositions);
            let gainedResources = enemies[index].maxHealth / 5;
            floatingMessages.push(new floatingMessage('+' + gainedResources, enemies[index].x, enemies[index].y, 30, 'white'));
            floatingMessages.push(new floatingMessage('+' + gainedResources, 250, 50, 30, 'gold'));
            numberOfResources += gainedResources;
            score += gainedResources;
            const findThisIndex = enemyPositions.indexOf(enemies[index].y)
            enemyPositions.splice(findThisIndex, 1);
            enemies.splice(index, 1);
            index--;
            // console.log(enemyPositions);
        }
    }
    if (frame % enemiesInterval === 0 && score < winningScore) {
        verticalPosition = Math.floor(Math.random() * 5 + 1) * cellSize + cellGap;
        console.log("verticalPosition", verticalPosition);
        enemies.push(new Enemy(verticalPosition));
        enemyPositions.push(verticalPosition);
        if (enemiesInterval > 120) {
            enemiesInterval -= 50;
            // console.log(enemyPositions);
        }
    }
}

function handleExplosion() {
    let isExplosion = true;
    for (let i = 0; i < enemyExplosionPositions.length; i++) {
        if (frame % 6 === 0) {
            if (explosionFrameX < 6) {
                explosionFrameX++;
                if (explosionFrameX === 5) isExplosion = false;
            } else explosionFrameX = 0;
        }
        ctx.drawImage(explosion1, explosionFrameX * 322, 0, 322, 322, enemyExplosionPositions[i].x, enemyExplosionPositions[i].y, cellSize, cellSize);
        if (!isExplosion) {
            enemyExplosionPositions.splice(i, 1);
            i--;
        }

    }

}
//resources
const amounts = [20, 30, 40];

const Resource1 = new Image();
Resource1.src = 'coin.png'

class Resource {
    constructor() {
        this.x = Math.random() * canvas.width - cellSize;
        this.y = (Math.floor(Math.random() * 5) + 1) * cellSize + 25;
        this.width = cellSize * 0.6;
        this.height = cellSize * 0.6;
        this.amount = amounts[Math.floor(Math.random() * amounts.length)];
    }
    draw() {
        // ctx.fillStyle = "yellow";
        // ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.drawImage(Resource1, 0, 0, 128, 128, this.x, this.y, this.width, this.height);
        ctx.fillStyle = "white";
        ctx.font = "20px Orbitron";
        ctx.fillText(this.amount, this.x + 15, this.y + 25);
    }
}

function handleResources() {
    if (frame % 500 === 0 && score < winningScore) {
        resources.push(new Resource());
    }
    for (let i = 0; i < resources.length; i++) {
        resources[i].draw();
        if (resources[i] && mouse.x && mouse.y && collision(resources[i], mouse)) {
            numberOfResources += resources[i].amount;
            floatingMessages.push(new floatingMessage('+' + resources[i].amount, resources[i].x, resources[i].y, 30, 'white'))
            floatingMessages.push(new floatingMessage('+' + resources[i].amount, 250, 50, 30, 'gold'))
            resources.splice(i, 1);
            i--;
        }
    }
}
//utilities


function handleGameStatus() {
    ctx.fillStyle = 'gold';
    ctx.font = '30px Orbitron';
    ctx.fillText('Score: ' + score, 180, 40);
    ctx.fillText('Resources: ' + numberOfResources, 180, 80);
    // ctx.drawImage(background, 50, 50);
    if (gameOver) {
        ctx.fillStyle = 'white';
        ctx.font = '90px Orbitron';
        ctx.fillText('GAME OVER', 135, 330);
    }
    if (score >= winningScore && enemies.length === 0) {
        ctx.fillStyle = 'white';
        ctx.font = '60px Orbitron';
        ctx.fillText('LEVEL COMPLETE', 130, 300);
        ctx.font = '30px Orbitron';
        ctx.fillText('You win with ' + score + ' points!!!', 134, 340);
    }
}

canvas.addEventListener('click', function () {
    const gridPositionX = mouse.x - (mouse.x % cellSize) + cellGap;
    const gridPositionY = mouse.y - (mouse.y % cellSize) + cellGap;
    if (gridPositionY < cellSize) return;

    for (let index = 0; index < defenders.length; index++) {
        if (defenders[index].x === gridPositionX && defenders[index].y === gridPositionY) return;
    }
    let defenderCost = 100;
    if (numberOfResources >= defenderCost) {
        defenders.push(new Defender(gridPositionX, gridPositionY));
        numberOfResources -= defenderCost;
    } else {
        floatingMessages.push(new floatingMessage('need more resources', mouse.x, mouse.y, 20, 'white'));
    }
})



//background image
const background = new Image();
background.src = 'tile2.png';

const background2 = new Image();
background2.src = 'tile3.jpg';

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(background2, 0, 0, canvasPosition.width, canvasPosition.height);
    ctx.fillStyle = 'blue'
    ctx.fillRect(0, 0, controlsBar.width, controlsBar.height);
    handleGameGrid();
    handleDefenders();
    handleResources();
    handleProjecticles();
    handleEnemies();
    handleExplosion();
    chooseDefender();
    handleGameStatus();
    handleFloatingMessages();
    frame++;
    if (!gameOver) requestAnimationFrame(animate);
}
animate();

function collision(first, second) {
    if (
        !(first.x > second.x + second.width ||
            first.x + first.width < second.x ||
            first.y > second.y + second.height ||
            first.y + first.height < second.y
        )) {
        return true;
    }

}

window.addEventListener('resize', function () {
    canvasPosition = canvas.getBoundingClientRect();
});