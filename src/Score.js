import { speedUp } from ".";
import Cookies from "js-cookie";

const scoreDisp = document.getElementById("score");
const timeDisp = document.getElementById("time");
const clearedDisp = document.getElementById("cleared");
const gameOverModal = document.getElementById("game-over");

let playing = false;
let score = 0;
let timerStart = 0;
let cleared = 0;

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

function getReadableTime(millis) {
    if (millis === "-") {
        return millis;
    }
    return `${getMinutes(millis)}:${getSeconds(millis)}.${getDecis(millis)}`;
}

export function startGame() {
    score = 0;
    renderScore();

    timerStart = Date.now();

    playing = true;
    gameOverModal.classList.add("hidden");
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
    timeDisp.textContent = getReadableTime(elapsedTime);
}

export function mineCleared() {
    cleared++;
    clearedDisp.textContent = cleared;
}

function getBest(name, current) {
    const stored = Cookies.get(name);

    // No PR found
    if (!stored) {
        Cookies.set(name, current, {expires: 365000});
        return "-";
    }

    // Update cookie for a new PR
    if (stored === "undefined" || current > stored) {
        Cookies.set(name, current, {expires: 365000});
    }

    return stored;
}

export function gameOver(reason) {
    if (!playing) {
        return;
    }

    playing = false;
    
    const elapsedTime = Date.now() - timerStart;
    
    const bestTime = getBest("time", elapsedTime);
    const bestScore = getBest("score", score);
    const bestCleared = getBest("cleared", cleared);
    
    setText("game-over-reason", reason);
    setText("current-time", getReadableTime(elapsedTime));
    setText("current-score", score);
    setText("current-cleared", cleared);
    setText("best-time", getReadableTime(bestTime));
    setText("best-score", bestScore);
    setText("best-cleared", bestCleared);
    gameOverModal.classList.remove("hidden");
}
