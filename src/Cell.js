import * as PIXI from 'pixi.js'
import anime from 'animejs';
import {increaseScore, mineCleared, gameOver} from './Score';
import lerp from 'lerp';

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
];

const alphas = {
    normal: .5,
    hovered: .75,
    preReveal: .2,
    revealed: .1
}

export default class Cell {
    constructor(row, col, map, ) {
        this.rol = row;
        this.col = col;
        this.map = map;
        this.size = 32;
        this.isBomb = Math.random() < .1;

        this.graphics = new PIXI.Graphics();
        this.graphics.interactive = true;
        this.graphics.alpha = .5;
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

        this.circle = new PIXI.Graphics();
        this.circle.x = 16;
        this.circle.y = 16;
        this.circle.beginFill(0xffffff, 1);
        this.circle.drawCircle(0, 0, 16);
        this.circle.endFill();
        this.circle.visible = false;

        this.container = new PIXI.Container();
        this.container.x = this.size * col * 1.2;
        this.container.y = -this.size * row * 1.2;
        this.container.addChild(this.graphics);
        this.container.addChild(this.text);
        this.container.addChild(this.circle);
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

    softReveal(delay = 0) {
        // Soft reveal does nothing if it's a bomb
        if (this.isBomb) {
            return;
        }

        // Don't reveal if already revealed or marked
        if (this.isRevealed || this.isMarked) {
            return;
        }

        
        this.isRevealed = true;

        this.graphics.alpha = alphas.preReveal;
        setTimeout(() => {
            increaseScore(this.bombCount);
            anime({
                duration: 250,
                update: ({progress}) =>
                    this.graphics.alpha = lerp(alphas.preReveal, alphas.revealed, progress / 100)
            });
        }, delay);


        this.render();

        // If we're an unrevealed 0, reveal our neighbors
        if (this.text.text === "") {
            for (let xDelta = -1; xDelta <= 1; xDelta++) {
                this.iterateOverNeighbors(neighbor => neighbor.softReveal(delay + 50));
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

                this.circle.tint = 0x2bff48;
                this.circle.visible = true;
                anime({
                    duration: 500,
                    easing: 'easeOutCubic',
                    update: ({progress}) => {
                        const s = lerp(1, 2, progress / 100);
                        this.circle.scale.x = s;
                        this.circle.scale.y = s;
                        this.circle.alpha = lerp(1, 0, progress / 100);
                    }
                });

                mineCleared();
            } else {
                gameOver("An unmarked bomb crossed the line!");
            }
        } else {
            if (this.isMarked) {
                gameOver("You marked a regular cell as a bomb!");
            }
        }
        this.render();
    }

    onMouseEnter() {
        this.graphics.alpha = this.isRevealed ? alphas.revealed : alphas.hovered;
        this.render();
    }

    onMouseExit() {
        this.graphics.alpha = this.isRevealed ? alphas.revealed : alphas.normal;
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
            // Mark the bomb
            this.text.text = "•";
            this.text.x = 11;
            this.text.style.fill = 0xff6f52;
            this.isMarked = true;
        }

        this.circle.tint = 0xff6f52;
        this.circle.visible = true;
        anime({
            duration: 250,
            easing: 'easeOutCubic',
            update: ({progress}) => {
                const s = lerp(1, 2, progress / 100);
                this.circle.scale.x = s;
                this.circle.scale.y = s;
                this.circle.alpha = lerp(1, 0, progress / 100);
            }
        });
        
        this.render();
    }

    render() {
        let color = 0xffffff;
        this.text.visible = false;

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
        this.graphics.beginFill(color, 1);
        this.graphics.drawRoundedRect(0, 0, this.size, this.size, 4);
        this.graphics.endFill();
    }

    getRenderable() {
        return this.container;
    }
}