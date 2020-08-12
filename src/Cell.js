import * as PIXI from 'pixi.js'
import {increaseScore} from './Score';

const numberColors = [
    0xffffff, // 0 - white
    0x7da4ff, // 1 - blue
    0x76ee86, // 2 - green
    0xff6f52, // 3 - red
    0xb152ff, // 4 - navy
    0xb56131, // 5 - brown
    0x53e0c2, // 6 - teal
    0x8f8f8f, // 7 - black
    0xd4d4d4  // 8 - gray
]

export default class Cell {
    constructor(row, col, map, ) {
        this.rol = row;
        this.col = col;
        this.map = map;
        this.size = 32;
        this.isBomb = Math.random() < .1;

        this.graphics = new PIXI.Graphics();
        this.graphics.interactive = true;
        this.graphics.mouseover = this.onMouseEnter.bind(this);
        this.graphics.mouseout = this.onMouseExit.bind(this);
        this.graphics.mousedown = this.onMouseDown.bind(this);
        this.graphics.rightdown = this.onRightMouseDown.bind(this);

        this.text = new PIXI.Text(
            this.isBomb ? "X" : "",
            {
                fontWeight: 'bold',
                fill: 0xffffff,
                align: 'right'
            }
        );
        this.text.x = 8;
        this.text.y = 1;

        this.container = new PIXI.Container();
        this.container.x = this.size * col * 1.2;
        this.container.y = -this.size * row * 1.2;
        this.container.addChild(this.graphics);
        this.container.addChild(this.text);
    }

    iterateOverNeighbors(fn) {
        for (let xDelta = -1; xDelta <= 1; xDelta++) {
            for (let yDelta = -1; yDelta <= 1; yDelta++) {
                const row = this.map[this.rol + xDelta];
                const neighbor = row && row[this.col + yDelta];

                neighbor && fn(neighbor);
            }
        }
    }

    countNeighborBombs() {
        if (this.isBomb) {
            return;
        }
        
        let bombCount = 0;

        this.iterateOverNeighbors(neighbor => {
            if (neighbor && neighbor.isBomb) {
                bombCount++;
            }
        })

        this.bombCount = bombCount;
        this.text.text = bombCount || "";
        this.text.style.fill = numberColors[bombCount];
    }

    softReveal() {
        // Soft reveal does nothing if it's a bomb
        if (this.isBomb) {
            return;
        }

        // Don't reveal if already revealed or marked
        if (this.isRevealed || this.isMarked) {
            return;
        }

        increaseScore(this.bombCount);
        this.isRevealed = true;
        this.render();

        // If we're an unrevealed 0, reveal our neighbors
        if (this.text.text === "") {
            for (let xDelta = -1; xDelta <= 1; xDelta++) {
                this.iterateOverNeighbors(neighbor => neighbor.softReveal());
            }
        }
    }

    hardReveal() {
        // Don't reveal if already revealed or marked
        if (this.isRevealed || this.isMarked) {
            return;
        }

        // Hard reveal kills you if it's a bomb
        if (this.isBomb) {
            console.log("BOOM!");
            return;
        }

        this.softReveal();
    }

    kill() {
        if (this.isBomb) {
            if (this.isMarked) {
                // A marked bomb hit the line
                this.isCleared = true;
            } else {
                // An unmarked bomb hit the line!
                alert("YOU DIED!");
            }
        }
        this.render();
    }

    onMouseEnter() {
        this.hovered = true;
        this.render();
    }

    onMouseExit() {
        this.hovered = false;
        this.render();
    }

    onMouseDown() {
        if (this.isRevealed) {
            let markedNeighbors = 0;
            this.iterateOverNeighbors(neighbor => {
                if (neighbor.isMarked) {
                    markedNeighbors++;
                }
            });

            if (markedNeighbors === this.bombCount) {
                this.iterateOverNeighbors(neighbor => neighbor.hardReveal());
            }
        } else {
            this.hardReveal();
        }
    }

    onRightMouseDown() {
        if (this.isRevealed) {
            return;
        }

        if (this.isMarked) {
            this.text.text = "";
            this.isMarked = false;
        } else {
            this.text.text = "•";
            this.text.x = 11;
            this.text.style.fill = 0xff6f52;
            this.isMarked = true;
        }
        
        this.render();
    }

    render() {
        let opacity = .5;
        let color = 0xffffff;
        this.text.visible = false;

        if (this.hovered) {
            opacity = .75;
        }

        if (this.isRevealed) {
            opacity = .1;
        }

        if (this.isRevealed || this.isMarked) {
            this.text.visible = true;
        }

        if (this.isMarked) {
            color = 0xff6f52;
        }

        if (this.isCleared) {
            color = 0x76ee86;
            this.text.style.fill = 0x2bff48;
        }

        this.graphics.clear();
        this.graphics.beginFill(color, opacity);
        this.graphics.drawRoundedRect(0, 0, this.size, this.size, 4);
        this.graphics.endFill();
    }

    getRenderable() {
        return this.container;
    }
}