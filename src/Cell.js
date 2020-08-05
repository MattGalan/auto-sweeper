import * as PIXI from 'pixi.js'
import {increaseScore} from './Score';

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

        this.text = new PIXI.Text(this.isBomb ? "X" : "");
        this.text.x = 8;

        this.container = new PIXI.Container();
        this.container.x = this.size * col * 1.2;
        this.container.y = -this.size * row * 1.2;
        this.container.addChild(this.graphics);
        this.container.addChild(this.text);
    }

    countNeighborBombs() {
        if (this.isBomb) {
            return;
        }
        
        let bombCount = 0;

        for (let xDelta = -1; xDelta <= 1; xDelta++) {
            for (let yDelta = -1; yDelta <= 1; yDelta++) {
                const row = this.map[this.rol + xDelta];
                const neighbor = row && row[this.col + yDelta];

                if (neighbor && neighbor.isBomb) {
                    bombCount++;
                }
            }
        }

        this.bombCount = bombCount;
        this.text.text = bombCount || "";
    }

    reveal() {
        if (this.revealed || this.isBomb || this.isMarked) {
            return;
        }

        increaseScore(this.bombCount);
        this.revealed = true;
        this.render();

        if (this.text.text === "") {
            for (let xDelta = -1; xDelta <= 1; xDelta++) {
                for (let yDelta = -1; yDelta <= 1; yDelta++) {
                    const row = this.map[this.rol + xDelta];
                    const neighbor = row && row[this.col + yDelta];
                    neighbor && neighbor.reveal();
                }
            }
        }
    }

    onMouseEnter() {
        // this.graphics.clear();
        // this.graphics.lineStyle(2, 0xcc0000);
        // this.graphics.beginFill(0xcc9999, 1);
        // this.graphics.drawRoundedRect(0, 0, this.size, this.size, 4);
        // this.graphics.endFill();
        // this.hovered = true;
        // this.render();
    }

    onMouseExit() {
        // this.hovered = false;
        // this.render();
    }

    onMouseDown() {
        this.reveal();
    }

    onRightMouseDown() {
        if (this.revealed) {
            return;
        }

        if (this.isMarked) {
            this.text.text = "";
            this.isMarked = false;
        } else {
            this.text.text = "!";
            this.isMarked = true;
        }
        
        this.render();
    }

    render() {
        let opacity = 1;
        this.text.visible = false;

        if (this.revealed) {
            opacity = .1;
        }

        if (this.revealed || this.isMarked) {
            this.text.visible = true;
        }

        this.graphics.clear();
        this.graphics.lineStyle(2, 0xcc0000, opacity);
        this.graphics.beginFill(0xcc9999, opacity);
        this.graphics.drawRoundedRect(0, 0, this.size, this.size, 4);
        this.graphics.endFill();
    }

    getRenderable() {
        return this.container;
    }
}