const attendeesInput = document.getElementById("attendees");
const rateMinInput = document.getElementById("rateMin");
const rateMaxInput = document.getElementById("rateMax");
const elapsedTime = document.getElementById("elapsedTime");
const costMin = document.getElementById("costMin");
const costMax = document.getElementById("costMax");
const statusBadge = document.getElementById("statusBadge");
const liveRate = document.getElementById("liveRate");
const summaryLine = document.getElementById("summaryLine");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");
const stepButtons = document.querySelectorAll(".step-btn");
const presetButtons = document.querySelectorAll(".preset");

let timerId = null;
let elapsedMs = 0;
let startedAt = null;
let isRunning = false;

function getInputs() {
  const attendees = Math.max(1, Number(attendeesInput.value) || 1);
  const min = Math.max(0, Number(rateMinInput.value) || 0);
  const max = Math.max(min, Number(rateMaxInput.value) || 0);

  attendeesInput.value = attendees;
  rateMinInput.value = min;
  rateMaxInput.value = max;

  return { attendees, min, max };
}

function formatCurrency(value) {
  return new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency: "TWD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDuration(milliseconds) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

function setStatus(mode) {
  statusBadge.className = `status ${mode}`;

  if (mode === "running") {
    statusBadge.textContent = "計時中";
  } else if (mode === "paused") {
    statusBadge.textContent = "已暫停";
  } else {
    statusBadge.textContent = "尚未開始";
  }
}

function getCurrentElapsed() {
  if (!isRunning || !startedAt) {
    return elapsedMs;
  }

  return elapsedMs + (Date.now() - startedAt);
}

function render() {
  const { attendees, min, max } = getInputs();
  const currentElapsed = getCurrentElapsed();
  const hours = currentElapsed / 1000 / 60 / 60;
  const totalMin = attendees * min * hours;
  const totalMax = attendees * max * hours;
  const perMinuteMin = (attendees * min) / 60;
  const perMinuteMax = (attendees * max) / 60;

  elapsedTime.textContent = formatDuration(currentElapsed);
  costMin.textContent = formatCurrency(totalMin);
  costMax.textContent = formatCurrency(totalMax);
  liveRate.textContent = `每分鐘 ${formatCurrency(perMinuteMin)} - ${formatCurrency(perMinuteMax)}`;
  summaryLine.textContent = `${attendees} 人會議，時薪區間 ${formatCurrency(min)} - ${formatCurrency(max)}`;
}

function startTimer() {
  if (isRunning) {
    return;
  }

  isRunning = true;
  startedAt = Date.now();
  timerId = window.setInterval(render, 250);
  setStatus("running");
  render();
}

function pauseTimer() {
  if (!isRunning) {
    return;
  }

  elapsedMs = getCurrentElapsed();
  startedAt = null;
  isRunning = false;
  window.clearInterval(timerId);
  timerId = null;
  setStatus("paused");
  render();
}

function resetTimer() {
  elapsedMs = 0;
  startedAt = null;
  isRunning = false;
  window.clearInterval(timerId);
  timerId = null;
  setStatus("idle");
  render();
}

startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
resetBtn.addEventListener("click", resetTimer);

stepButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const next = Math.max(1, Number(attendeesInput.value) + Number(button.dataset.step));
    attendeesInput.value = next;
    render();
  });
});

presetButtons.forEach((button) => {
  button.addEventListener("click", () => {
    rateMinInput.value = button.dataset.min;
    rateMaxInput.value = button.dataset.max;
    render();
  });
});

[attendeesInput, rateMinInput, rateMaxInput].forEach((input) => {
  input.addEventListener("input", render);
});

render();
