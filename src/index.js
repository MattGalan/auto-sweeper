import * as PIXI from 'pixi.js'
import Cell from './Cell';
import {updateTime, startGame} from './Score';

// Initialize Pixi
let app = new PIXI.Application({
    width: 384,
    height: 1024,
    antialias: true,
    transparent: true
});
document.getElementById("game").appendChild(app.view);
const container = new PIXI.Container();
app.stage.addChild(container);

// Prevent context menu from showing
document.oncontextmenu = function(event) {
    event.preventDefault();
}

// Game constants
const rowHeight = 32 * 1.2;
const acceleration = .00005;

// These are set in init()
let cells, distSinceRow, deathRow, speed;

function generateRow() {
    const row = cells.length;

    // Generate the cells
    cells[row] = [];
    for (let col = 0; col < 10; col++) {
        const newCell = new Cell(row, col, cells);
        cells[row][col] = newCell
        container.addChild(newCell.getRenderable());
        newCell.render();
    }

    // Count our neighbors
    for (let col = 0; col < 10; col++) {
        cells[row][col].countNeighborBombs();
    }

    // Make the previous row re-count
    for (let col = 0; col < 10; col++) {
        row > 0 && cells[row - 1][col].countNeighborBombs();
    }
}

function init() {
    cells = [];
    distSinceRow = rowHeight;
    deathRow = -11;
    speed = .2;

    container.removeChildren();

    // Generate the first 10 rows
    for (let row = 0; row < 10; row++) {
        generateRow();
    }
    
    // Reveal the first four rows
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 10; col++) {
            cells[row][col].softReveal();
        }
    }
    
    // Position the container at the top of the screen
    container.y = 352;

    startGame();
}

// Hook up the retry button
document.getElementById("retry-btn").addEventListener("click", init);

init();

// Draw red line
const line = new PIXI.Graphics();
line.lineStyle(4, 0xff6f52, 1);
line.lineTo(384, 0);
line.y = 775;

app.stage.addChild(line);

app.ticker.add(deltaTime => {
    speed += acceleration * deltaTime;
    const deltaDist = deltaTime * speed;
    // const deltaDist = deltaTime * 0;

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
