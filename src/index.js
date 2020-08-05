import * as PIXI from 'pixi.js'
import Cell from './Cell';

//Create a Pixi Application
let app = new PIXI.Application({
    width: 1024,
    height: 1024,
    antialias: true,
    transparent: true
});

//Add the canvas that Pixi automatically created for you to the HTML document
document.body.appendChild(app.view);

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

let distSinceRow = 0;

app.ticker.add(deltaTime => {
    const deltaDist = deltaTime * .3;
    container.y += deltaDist;
    distSinceRow += deltaDist;

    if (distSinceRow > 32 * 1.2) {
        generateRow();
        distSinceRow = 0;
    }
});
