let score = 0;
const scoreDisp = document.getElementById("score");
scoreDisp.textContent = score;

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
