import { speedUp } from ".";

const scoreDisp = document.getElementById("score");
const secondsDisp = document.getElementById("seconds");
const deciDisp = document.getElementById("decis");
const minutesDisp = document.getElementById("minutes");
const colon = document.getElementsByClassName("decimal")[0];
const clearedDisp = document.getElementById("cleared");

let score = 0;
let timerStart = 0;
let bombsCleared = 0;

function renderScore() {
    scoreDisp.textContent = score;
}

export function resetScore() {
    score = 0;
    renderScore();
}

export function increaseScore(points) {
    score += points;
    renderScore();
}

export function startClock() {
    timerStart = Date.now();
}

export function updateTime() {
    const elapsedTime = Date.now() - timerStart;
    deciDisp.textContent = Math.floor(elapsedTime / 100) % 10;
    secondsDisp.textContent = ('0' + Math.floor(elapsedTime / 1000) % 60).slice(-2);
    const minutes = Math.floor(elapsedTime / 60000);
    colon.style.display = minutes >= 1 ? "inline" : "none";
    minutesDisp.textContent = minutes >= 1 ? minutes : "";
}

export function mineCleared() {
    bombsCleared++;
    clearedDisp.textContent = bombsCleared;
}
