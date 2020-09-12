import { speedUp } from ".";
import Cookies from "js-cookie";

const scoreDisp = document.getElementById("score");
const timeDisp = document.getElementById("time");
const clearedDisp = document.getElementById("cleared");
const mainElement = document.getElementById("main");
const modals = document.getElementById("modals");
const startModal = document.getElementById("start");
const gameOverModal = document.getElementById("game-over");

const states = Object.freeze({
    mainMenu: 1,
    playing: 2,
    gameOver: 3
});

let curState = states.mainMenu;
let score = 0;
let timerStart = 0;
let cleared = 0;

function renderScore() {
    scoreDisp.textContent = Math.floor(score);
}

function hideElement(el) {
    el.classList.add("hidden");
}

function showElement(el) {
    el.classList.remove("hidden");
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

    curState = states.playing;
    modals.classList.add("disabled");
    hideElement(startModal);
    hideElement(gameOverModal);
    mainElement.classList.remove("blurry");
}

export function increaseScore(points) {
    if (curState !== states.playing) {
        return;
    }

    score += points;
    renderScore();
}

export function updateTime() {
    if (curState !== states.playing) {
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
    if (curState !== states.playing) {
        return;
    }

    curState = states.gameOver
    
    const elapsedTime = Date.now() - timerStart;
    
    const bestTime = getBest("time", elapsedTime);
    const bestScore = getBest("score", Math.floor(score));
    const bestCleared = getBest("cleared", cleared);
    
    setText("game-over-reason", reason);
    setText("current-time", getReadableTime(elapsedTime));
    setText("current-score", Math.floor(score));
    setText("current-cleared", cleared);
    setText("best-time", getReadableTime(bestTime));
    setText("best-score", bestScore);
    setText("best-cleared", bestCleared);
    mainElement.classList.add("blurry");
    modals.classList.remove("disabled");
    showElement(gameOverModal);
}
