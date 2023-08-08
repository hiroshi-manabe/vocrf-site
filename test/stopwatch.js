let startTime;
let elapsedTime = 0;
let timerInterval;
let recordedTimes = [];

let timerRunning = false;

document.body.onkeyup = function(e) {
    if (e.keyCode == 32) { // Space key
        e.preventDefault(); // Prevent the default action
        recordTime();
    } else if (e.keyCode == 83) { // 'S' key
        if (timerRunning) {
            stopTimer();
        } else {
            startTimer();
        }
    } else if (e.keyCode == 82) { // 'R' key
        resetTimer();
    }
}

document.getElementById('start').onclick = function() {
    if (timerRunning) {
        stopTimer();
    } else {
        startTimer();
    }
}

document.getElementById('reset').onclick = function() {
    resetTimer();
}

function startTimer() {
    timerRunning = true;
    document.getElementById('start').innerText = 'Stop';
    startTime = Date.now() - elapsedTime;
    timerInterval = setInterval(function printTime() {
        elapsedTime = Date.now() - startTime;
        document.getElementById("stopwatch").innerHTML = (elapsedTime / 1000).toFixed(2);
    }, 10);
}

function stopTimer() {
    timerRunning = false;
    document.getElementById('start').innerText = 'Start';
    clearInterval(timerInterval);
}

function recordTime() {
    if (!timerRunning) return; // If the timer is not running, exit the function without recording a time

    let time = (elapsedTime / 1000).toFixed(2);
    recordedTimes.push(time);

    let timesDiv = document.getElementById("times");
    timesDiv.innerHTML += `<p>${time}</p>`;
}

function resetTimer() {
    timerRunning = false;
    document.getElementById('start').innerText = 'Start';
    clearInterval(timerInterval);
    recordedTimes = [];
    elapsedTime = 0;
    document.getElementById("stopwatch").innerHTML = "0.00";
    document.getElementById("times").innerHTML = "";
}

