import * as PIXI from 'pixi.js'
import Cell from './Cell';
import {resetScore, startClock, updateTime, mineCleared} from './Score';

//Create a Pixi Application
let app = new PIXI.Application({
    width: 384,
    height: 1024,
    antialias: true,
    transparent: true
});

//Add the canvas that Pixi automatically created for you to the HTML document
document.getElementById("game").appendChild(app.view);

const container = new PIXI.Container();
app.stage.addChild(container);

// Prevent context menu from showing
document.oncontextmenu = function(event) {
    event.preventDefault();
}

const cells = [];

for (let row = 0; row < 10; row++) {
    cells[row] = [];
    for (let col = 0; col < 10; col++) {
        const newCell = new Cell(row, col, cells);
        cells[row][col] = newCell
        container.addChild(newCell.getRenderable());
        newCell.render();
    }
}

for (let x = 0; x < 10; x++) {
    for (let y = 0; y < 10; y++) {
        cells[x][y].countNeighborBombs();
    }
}

// Reveal the first four rows
for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 10; col++) {
        cells[row][col].softReveal();
    }
}

container.y = 352;

function generateRow() {
    const row = cells.length
    cells[row] = [];
    for (let col = 0; col < 10; col++) {
        const newCell = new Cell(row, col, cells);
        cells[row][col] = newCell
        container.addChild(newCell.getRenderable());
        newCell.render();
    }
    for (let col = 0; col < 10; col++) {
        cells[row][col].countNeighborBombs();
    }
    for (let col = 0; col < 10; col++) {
        cells[row - 1][col].countNeighborBombs();
    }
}


const rowHeight = 32 * 1.2;
let distSinceRow = rowHeight;
let deathRow = -11;

// Draw red line
const line = new PIXI.Graphics();
line.lineStyle(4, 0xff6f52, 1);
line.lineTo(384, 0);
line.y = 775;

app.stage.addChild(line);

resetScore();
startClock();

let speed = .2;
const acceleration = .00005;

app.ticker.add(deltaTime => {
    speed += acceleration * deltaTime;
    const deltaDist = deltaTime * speed;

    container.y += deltaDist;
    distSinceRow += deltaDist;

    if (distSinceRow > rowHeight) {
        generateRow();

        cells[deathRow] && cells[deathRow].forEach(cell => cell.kill());
        deathRow++;

        distSinceRow -= rowHeight;
    }

    updateTime();
});
