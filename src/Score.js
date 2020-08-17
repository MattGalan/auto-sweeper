import { speedUp } from ".";

const scoreDisp = document.getElementById("score");
const secondsDisp = document.getElementById("seconds");
const deciDisp = document.getElementById("decis");
const minutesDisp = document.getElementById("minutes");
const colon = document.getElementsByClassName("decimal")[0];
const clearedDisp = document.getElementById("cleared");
const modals = document.getElementById("modals");

let playing = false;
let score = 0;
let timerStart = 0;
let bombsCleared = 0;

function renderScore() {
    scoreDisp.textContent = score;
}

// Don't use this for text that updates frequently.
function setText(id, text) {
    document.getElementById(id).textContent = text;
}

function getMinutes(millis) {
    return Math.floor(millis / 60000);
}

function getSeconds(millis) {
    return ('0' + Math.floor(millis / 1000) % 60).slice(-2)
}

function getDecis(millis) {
    return Math.floor(millis / 100) % 10;
}

export function startGame() {
    score = 0;
    renderScore();

    timerStart = Date.now();

    playing = true;
}

export function increaseScore(points) {
    if (!playing) {
        return;
    }

    score += points;
    renderScore();
}

export function updateTime() {
    if (!playing) {
        return;
    }

    const elapsedTime = Date.now() - timerStart;
    deciDisp.textContent = getDecis(elapsedTime);
    secondsDisp.textContent = getSeconds(elapsedTime);
    const minutes = getMinutes(elapsedTime);
    colon.style.display = minutes >= 1 ? "inline" : "none";
    minutesDisp.textContent = minutes >= 1 ? minutes : "";
}

export function mineCleared() {
    bombsCleared++;
    clearedDisp.textContent = bombsCleared;
}

export function gameOver(reason) {
    if (!playing) {
        return;
    }
    
    playing = false;
    setText("game-over-reason", reason);

    const elapsedTime = Date.now() - timerStart;
    setText("current-time", `${getMinutes(elapsedTime)}:${getSeconds(elapsedTime)}.${getDecis(elapsedTime)}`);
    setText("current-score", score);
    setText("current-cleared", bombsCleared);
    modals.classList.remove("hidden");
}
