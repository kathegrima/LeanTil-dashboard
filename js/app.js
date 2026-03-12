// js/app.js
import { buildRoutine, totalRoutineSeconds } from "./exercises.js";

/* ==========================
   API CONFIGURATION
   ========================== */

const APICONFIG = {
  BASEURL: "https://api-leantil.duckdns.org", // modifica se serve
  TOKEN: "LeanTil",
  USERNAME: "mario", // cambia con il tuo username
  POLLINTERVAL: 2000
};

/* ==========================
   GLOBAL STATE
   ========================== */

let isTestMode = false;
let isConnected = false;
let pollingInterval = null;
let testInterval = null;

let dataHistory = [];
let sessionStartTime = Date.now();
let lastUpdateTime = Date.now();

let correctCount = 0;
let totalCount = 0;
let postureDurations = { correct: 0, warning: 0, away: 0 };

let currentMode = "basic";
let currentTheme = "dark";

let monthlyHistory = generateMonthlyHistory();
let calendarView = "week";

let achievementsUnlocked = new Set();

let bestStreak = { start: null, duration: 0 };
let currentStreak = { start: null, duration: 0 };

let consecutiveErrors = 0;
const MAXERRORS = 5;

/* ============ Active Breaks state ============ */

const exerciseState = {
  postureName: "AWAY",
  seatedSince: null,
  postureSince: Date.now(),
  lastReminderAt: 0,
  currentRoutine: null,
  routineIndex: 0,
  modalOpen: false,
  stepEndsAt: 0,
  prefs: loadExercisePrefs()
};

/* ==========================
   POSTURE MAPPING
   ========================== */

const postureMap = {
  CORRETTA: { display: "BALANCED", type: "correct" },
  INCLINATOAVANTI: { display: "LEANING FORWARD", type: "warning" },
  INCLINATOINDIETRO: { display: "LEANING BACK", type: "warning" },
  INCLINATOSINISTRA: { display: "LEANING LEFT", type: "warning" },
  INCLINATODESTRA: { display: "LEANING RIGHT", type: "warning" },
  SLOUCH: { display: "SLOUCH", type: "warning" },
  LEANLEFT: { display: "LEANING LEFT", type: "warning" },
  LEANRIGHT: { display: "LEANING RIGHT", type: "warning" },
  LEANBACK: { display: "LEANING BACK", type: "warning" },
  LEANFORWARD: { display: "LEANING FORWARD", type: "warning" },
  FIDGET: { display: "FIDGET", type: "warning" },
  ASSENTE: { display: "AWAY", type: "away" },
  AWAY: { display: "AWAY", type: "away" },
  CORRECT: { display: "BALANCED", type: "correct" }
};

const testPostures = [
  { name: "CORRETTA", weights: [1200, 1250, 1180, 1220] },
  { name: "INCLINATOINDIETRO", weights: [800, 850, 1450, 1480] },
  { name: "INCLINATOAVANTI", weights: [1400, 1420, 950, 980] },
  { name: "INCLINATODESTRA", weights: [1100, 1350, 1150, 1400] },
  { name: "INCLINATOSINISTRA", weights: [1350, 1100, 1400, 1150] },
  { name: "SLOUCH", weights: [1250, 1300, 1300, 1350] },
  { name: "LEANLEFT", weights: [1300, 1100, 1350, 1150] },
  { name: "LEANRIGHT", weights: [1100, 1350, 1150, 1400] },
  { name: "LEANBACK", weights: [900, 900, 1500, 1500] },
  { name: "FIDGET", weights: [1200, 1300, 1200, 1300] },
  { name: "ASSENTE", weights: [0, 0, 0, 0] }
];

const achievements = {
  firstSession: { icon: "🌱", title: "First Session", desc: "Welcome to LeanTil!", trigger: 1 },
  perfectMinute: { icon: "⭐", title: "Perfect Minute", desc: "60 seconds of great posture!", trigger: 30 },
  consistency: { icon: "📈", title: "Consistency Champion", desc: "100 readings of good posture!", trigger: 100 },
  superStar: { icon: "💫", title: "Posture SuperStar", desc: "Maintained 90+ score!", trigger: 90 }
};

/* ==========================
   DOM ELEMENTS
   ========================== */

const elements = {
  loginScreen: document.getElementById("loginScreen"),
  dashboard: document.getElementById("dashboard"),
  connectBtn: document.getElementById("connectBtn"),
  testModeBtn: document.getElementById("testModeBtn"),
  disconnectBtn: document.getElementById("disconnectBtn"),
  testModeToggle: document.getElementById("testModeToggle"),
  toggleTestMode: document.getElementById("toggleTestMode"),
  statusText: document.getElementById("statusText"),
  scoreValue: document.getElementById("scoreValue"),
  scoreCircle: document.getElementById("scoreCircle"),
  connectionText: document.getElementById("connectionText"),
  errorMessage: document.getElementById("errorMessage"),
  sessionTime: document.getElementById("sessionTime"),
  correctPercent: document.getElementById("correctPercent"),
  stabilityScore: document.getElementById("stabilityScore"),
  modeToggleContainer: document.getElementById("modeToggleContainer"),
  modeToggleSwitch: document.getElementById("modeToggleSwitch"),
  modeLabel: document.getElementById("modeLabel"),
  themeToggle: document.getElementById("themeToggle"),
  themeToggleLogin: document.getElementById("themeToggleLogin"),
  advancedExtras: document.getElementById("advancedExtras"),
  timeline: document.getElementById("timeline"),
  timelineMarkers: document.getElementById("timelineMarkers"),
  sessionDuration: document.getElementById("sessionDuration"),
  sessionStartTimeDisplay: document.getElementById("sessionStartTime"),
  helpBtn: document.getElementById("helpBtn"),
  helpBackdrop: document.getElementById("helpModalBackdrop"),
  closeHelp: document.getElementById("closeHelp"),
  timelineTooltip: document.getElementById("timelineTooltip"),
  qualityBar: document.getElementById("qualityBar"),
  qualityGood: document.getElementById("qualityGood"),
  qualityWarning: document.getElementById("qualityWarning"),
  qualityAway: document.getElementById("qualityAway"),
  durationGood: document.getElementById("durationGood"),
  durationWarning: document.getElementById("durationWarning"),
  durationAway: document.getElementById("durationAway"),
  insightText: document.getElementById("insightText"),
  qualityInsight: document.getElementById("qualityInsight"),
  achievementPopup: document.getElementById("achievementPopup"),
  achievementIcon: document.getElementById("achievementIcon"),
  achievementTitle: document.getElementById("achievementTitle"),
  achievementDesc: document.getElementById("achievementDesc"),
  impactValueHero: document.getElementById("impactValueHero"),
  impactDescHero: document.getElementById("impactDescHero"),
  stretchEquiv: document.getElementById("stretchEquiv"),
  strainAvoided: document.getElementById("strainAvoided"),
  todayScore: document.getElementById("todayScore"),
  weekAvg: document.getElementById("weekAvg"),
  bestStreak: document.getElementById("bestStreak"),
  bestMomentTimeCombined: document.getElementById("bestMomentTimeCombined"),
  bestMomentDescCombined: document.getElementById("bestMomentDescCombined"),
  statusDot: document.getElementById("statusDot"),
  historyCalendar: document.getElementById("historyCalendar"),
  viewWeek: document.getElementById("viewWeek"),
  viewMonth: document.getElementById("viewMonth"),
  loginLogo: document.getElementById("loginLogo"),
  dashboardLogo: document.getElementById("dashboardLogo"),
  weightElements: [
    document.getElementById("weight-0"),
    document.getElementById("weight-1"),
    document.getElementById("weight-2"),
    document.getElementById("weight-3")
  ],
  postureCells: ["cell-0", "cell-1", "cell-2", "cell-3"],
  goalModal: document.getElementById("goalModal"),
  goalRange: document.getElementById("goalRange"),
  goalRangeValue: document.getElementById("goalRangeValue"),
  cancelGoalBtn: document.getElementById("cancelGoalBtn"),
  saveGoalBtn: document.getElementById("saveGoalBtn"),
  dailyGoalValue: document.getElementById("dailyGoalValue"),
  goalProgressPercent: document.getElementById("goalProgressPercent"),
  goalProgressBar: document.getElementById("goalProgressBar"),
  goalProgressText: document.getElementById("goalProgressText"),
  editGoalBtn: document.getElementById("editGoalBtn"),
  communityProgress: document.getElementById("communityProgress"),
  communityBetterThan: document.getElementById("communityBetterThan"),

  // Active breaks UI
  seatedTimeValue: document.getElementById("seatedTimeValue"),
  postureHoldValue: document.getElementById("postureHoldValue"),
  nextBreakValue: document.getElementById("nextBreakValue"),
  exercisePreviewImage: document.getElementById("exercisePreviewImage"),
  exerciseReason: document.getElementById("exerciseReason"),
  exercisePreviewName: document.getElementById("exercisePreviewName"),
  exercisePreviewDesc: document.getElementById("exercisePreviewDesc"),
  startExerciseBtn: document.getElementById("startExerciseBtn"),
  snoozeExerciseBtn: document.getElementById("snoozeExerciseBtn"),

  reminderInterval: document.getElementById("reminderInterval"),
  persistentEnabled: document.getElementById("persistentEnabled"),
  persistentMinutes: document.getElementById("persistentMinutes"),
  focusNeck: document.getElementById("focusNeck"),
  focusShoulders: document.getElementById("focusShoulders"),
  focusBack: document.getElementById("focusBack"),
  cooldownMinutes: document.getElementById("cooldownMinutes"),

  exerciseModalBackdrop: document.getElementById("exerciseModalBackdrop"),
  closeExerciseModal: document.getElementById("closeExerciseModal"),
  exerciseTitle: document.getElementById("exerciseTitle"),
  exerciseSubtitle: document.getElementById("exerciseSubtitle"),
  exerciseImage: document.getElementById("exerciseImage"),
  exerciseName: document.getElementById("exerciseName"),
  exerciseDescription: document.getElementById("exerciseDescription"),
  exerciseSteps: document.getElementById("exerciseSteps"),
  exerciseTimer: document.getElementById("exerciseTimer"),
  prevExerciseBtn: document.getElementById("prevExerciseBtn"),
  skipExerciseBtn: document.getElementById("skipExerciseBtn"),
  nextExerciseBtn: document.getElementById("nextExerciseBtn")
};

/* ==========================
   INIT
   ========================== */

function init() {
  attachEvents();
  loadThemePreference();
  renderCalendar();
  setInterval(loopTick, 1000);
}

document.addEventListener("DOMContentLoaded", init);

/* ==========================
   EVENTS
   ========================== */

function attachEvents() {
  elements.connectBtn?.addEventListener("click", connectToAPI);
  elements.disconnectBtn?.addEventListener("click", disconnectFromAPI);
  elements.testModeBtn?.addEventListener("click", toggleTestMode);
  elements.toggleTestMode?.addEventListener("click", toggleTestMode);

  elements.themeToggle?.addEventListener("click", toggleTheme);
  elements.themeToggleLogin?.addEventListener("click", toggleTheme);
  elements.modeToggleContainer?.addEventListener("click", toggleMode);

  elements.helpBtn?.addEventListener("click", () => toggleHelp(true));
  elements.closeHelp?.addEventListener("click", () => toggleHelp(false));
  elements.helpBackdrop?.addEventListener("click", (e) => {
    if (e.target === elements.helpBackdrop) toggleHelp(false);
  });

  elements.viewWeek?.addEventListener("click", () => {
    calendarView = "week";
    elements.viewWeek.classList.add("active");
    elements.viewMonth.classList.remove("active");
    renderCalendar();
  });

  elements.viewMonth?.addEventListener("click", () => {
    calendarView = "month";
    elements.viewMonth.classList.add("active");
    elements.viewWeek.classList.remove("active");
    renderCalendar();
  });

  elements.editGoalBtn?.addEventListener("click", openGoalModal);
  elements.cancelGoalBtn?.addEventListener("click", closeGoalModal);
  elements.saveGoalBtn?.addEventListener("click", saveGoal);
  elements.goalRange?.addEventListener("input", handleGoalRangeChange);

  elements.startExerciseBtn?.addEventListener("click", openExerciseModal);
  elements.snoozeExerciseBtn?.addEventListener("click", snoozeRoutine);
  elements.closeExerciseModal?.addEventListener("click", closeExerciseModal);

  elements.prevExerciseBtn?.addEventListener("click", prevExercise);
  elements.skipExerciseBtn?.addEventListener("click", nextExercise);
  elements.nextExerciseBtn?.addEventListener("click", nextExercise);

  elements.exerciseModalBackdrop?.addEventListener("click", (e) => {
    if (e.target === elements.exerciseModalBackdrop) {
      closeExerciseModal();
    }
  });
}

/* ==========================
   THEME
   ========================== */

function toggleTheme() {
  currentTheme = currentTheme === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", currentTheme);
  const logoSrc = currentTheme === "dark" ? "./leantil-logo2.png" : "./leantil-logo.png";
  if (elements.loginLogo) elements.loginLogo.src = logoSrc;
  if (elements.dashboardLogo) elements.dashboardLogo.src = logoSrc;
  const icon = currentTheme === "dark" ? "◐" : "◑";
  if (elements.themeToggle) elements.themeToggle.textContent = icon;
  if (elements.themeToggleLogin) elements.themeToggleLogin.textContent = icon;
  localStorage.setItem("theme", currentTheme);
}

function loadThemePreference() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light") {
    currentTheme = "dark"; // forzare toggle
    toggleTheme();
  }
}

/* ==========================
   MODE
   ========================== */

function toggleMode() {
  currentMode = currentMode === "basic" ? "advanced" : "basic";
  elements.modeToggleSwitch.classList.toggle("active", currentMode === "advanced");
  elements.modeLabel.textContent = currentMode === "basic" ? "Simple" : "Advanced";
  elements.advancedExtras.classList.toggle("hidden", currentMode === "basic");
  if (currentMode === "advanced" && dataHistory.length > 0) {
    updateTimeline();
    updateTimelineMarkers();
    updateQualityBreakdown();
  }
}

/* ==========================
   HELP
   ========================== */

function toggleHelp(open) {
  if (!elements.helpBackdrop) return;
  elements.helpBackdrop.setAttribute("aria-hidden", open ? "false" : "true");
  elements.helpBackdrop.classList.toggle("open", open);
}

/* ==========================
   CONNECTION / API
   ========================== */

function connectToAPI() {
  isConnected = false;
  isTestMode = false;
  updateConnectionStatus();
  showDashboard();
  startPolling();
}

function disconnectFromAPI() {
  stopPolling();
  stopTestMode();
  isConnected = false;
  isTestMode = false;
  updateConnectionStatus();
  showLogin();
}

function startPolling() {
  stopPolling();
  pollingInterval = setInterval(fetchDataFromAPI, APICONFIG.POLLINTERVAL);
}

function stopPolling() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
}

async function fetchDataFromAPI() {
  try {
    const url = `${APICONFIG.BASEURL}/posture?user=${encodeURIComponent(
      APICONFIG.USERNAME
    )}&token=${encodeURIComponent(APICONFIG.TOKEN)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("API error");
    const data = await res.json();
    consecutiveErrors = 0;
    isConnected = true;
    updateConnectionStatus();
    parseAndUpdateData(data);
  } catch (err) {
    consecutiveErrors++;
    if (consecutiveErrors >= MAXERRORS) {
      isConnected = false;
      updateConnectionStatus();
      stopPolling();
    }
  }
}

function updateConnectionStatus() {
  if (!elements.statusDot || !elements.connectionText) return;
  elements.statusDot.classList.toggle("disconnected", !isConnected && !isTestMode);
  if (isTestMode) {
    elements.connectionText.textContent = "Demo mode";
  } else if (isConnected) {
    elements.connectionText.textContent = "Connected to API";
  } else {
    elements.connectionText.textContent = "Disconnected";
  }
}

/* ==========================
   TEST MODE
   ========================== */

function toggleTestMode() {
  isTestMode = !isTestMode;
  elements.testModeToggle.classList.toggle("hidden", !isTestMode);
  elements.toggleTestMode.textContent = isTestMode ? "ON" : "OFF";

  if (isTestMode && !isConnected) {
    updateConnectionStatus();
    showDashboard();
    startTestData();
  } else if (!isTestMode && !isConnected) {
    stopTestMode();
    updateConnectionStatus();
    showLogin();
  }
}

function startTestData() {
  stopTestMode();
  testInterval = setInterval(() => {
    const posture = testPostures[Math.floor(Math.random() * testPostures.length)];
    const data = {
      postureName: posture.name,
      lc0: posture.weights[0],
      lc1: posture.weights[1],
      lc2: posture.weights[2],
      lc3: posture.weights[3]
    };
    parseAndUpdateData(data);
  }, 2000);
}

function stopTestMode() {
  if (testInterval) {
    clearInterval(testInterval);
    testInterval = null;
  }
}

/* ==========================
   SCREEN SWITCH
   ========================== */

function showDashboard() {
  if (elements.loginScreen) elements.loginScreen.classList.add("hidden");
  if (elements.dashboard) elements.dashboard.classList.remove("hidden");
  sessionStartTime = Date.now();
  dataHistory = [];
  correctCount = 0;
  totalCount = 0;
  postureDurations = { correct: 0, warning: 0, away: 0 };
}

function showLogin() {
  if (elements.dashboard) elements.dashboard.classList.add("hidden");
  if (elements.loginScreen) elements.loginScreen.classList.remove("hidden");
}

/* ==========================
   DATA PARSING
   ========================== */

function parseAndUpdateData(data) {
  const totalWeight = data.lc0 + data.lc1 + data.lc2 + data.lc3;

  data.percentages = [
    totalWeight > 0 ? (data.lc0 / totalWeight) * 100 : 25,
    totalWeight > 0 ? (data.lc1 / totalWeight) * 100 : 25,
    totalWeight > 0 ? (data.lc2 / totalWeight) * 100 : 25,
    totalWeight > 0 ? (data.lc3 / totalWeight) * 100 : 25
  ];

  dataHistory.push({
    ...data,
    timestamp: Date.now(),
    percentages: data.percentages
  });

  if (dataHistory.length > 500) {
    dataHistory.shift();
  }

  totalCount++;
  const mapped = postureMap[data.postureName] || { display: "UNKNOWN", type: "warning" };
  const isCorrect = mapped.type === "correct";

  if (isCorrect) {
    correctCount++;
  }

  updatePostureDurations(mapped.type);
  trackBestMoment(isCorrect);
  updateAllUI(data, mapped);
}

/* ==========================
   UI UPDATE
   ========================== */

function updateAllUI(data, posture) {
  if (elements.statusText) {
    elements.statusText.textContent = posture.display;
    elements.statusText.className = `status-text status-${posture.type}`;
  }

  const score =
    totalCount > 0
      ? Math.max(0, Math.min(100, Math.round((correctCount / totalCount) * 100) - 5))
      : 85;

  if (elements.scoreValue) elements.scoreValue.textContent = score;
  if (elements.scoreCircle) {
    elements.scoreCircle.style.setProperty("--score-percent", `${score * 3.6}deg`);
  }
  if (elements.correctPercent) elements.correctPercent.textContent = `${score}%`;
  if (elements.stabilityScore) {
    elements.stabilityScore.textContent = `${Math.round(score * 0.9 + 10)}%`;
  }

  const minutes = Math.floor((Date.now() - sessionStartTime) / 60000);
  if (elements.sessionTime) elements.sessionTime.textContent = minutes;

  checkAchievements(score);
  updateHealthImpact(score);
  updateComparisons(score);
  updateTodayScore(score);
  updateProgressStats();
  updateSessionDuration();
  updatePostureMap(data);

  if (currentMode === "advanced") {
    updateTimeline();
    updateTimelineMarkers();
    updateQualityBreakdown();
  }

  updateExerciseEngine(data.postureName);
}

function updatePostureMap(data) {
  const activeCells = getActiveCells(data.postureName);
  elements.postureCells.forEach((cellId, i) => {
    const cell = document.getElementById(cellId);
    const weightEl = elements.weightElements[i];
    if (cell) cell.classList.toggle("active", activeCells.includes(i));
    if (weightEl) weightEl.textContent = `${Math.round(data.percentages[i])}%`;
  });
}

function getActiveCells(name) {
  if (!name) return [];
  if (name === "CORRETTA" || name === "CORRECT") return [0, 1, 2, 3];
  if (name.includes("AVANTI") || name.includes("FORWARD")) return [0, 1];
  if (name.includes("INDIETRO") || name.includes("BACK")) return [2, 3];
  if (name.includes("SINISTRA") || name.includes("LEFT")) return [0, 2];
  if (name.includes("DESTRA") || name.includes("RIGHT")) return [1, 3];
  return [];
}

function updateTimeline() {
  if (!elements.timeline) return;
  elements.timeline.innerHTML = "";
  dataHistory.forEach((d) => {
    const div = document.createElement("div");
    const mapped = postureMap[d.postureName];
    div.className = `timeline-bar ${mapped?.type || "warning"}`;
    div.onclick = () => {
      const time = new Date(d.timestamp).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
      alert(`${time}\n${mapped?.display || "Unknown"}`);
    };
    elements.timeline.appendChild(div);
  });
}

function updateTimelineMarkers() {
  if (!elements.timelineMarkers) return;
  elements.timelineMarkers.innerHTML = "";
  const markers = ["Start", "¼", "½", "¾", "Now"];
  markers.forEach((m) => {
    const span = document.createElement("span");
    span.textContent = m;
    elements.timelineMarkers.appendChild(span);
  });
}

function updateSessionDuration() {
  const ms = Date.now() - sessionStartTime;
  const min = Math.floor(ms / 60000);
  const hr = Math.floor(min / 60);
  if (elements.sessionDuration) {
    elements.sessionDuration.textContent = `${hr}h ${min % 60}m`;
  }
  if (elements.sessionStartTimeDisplay) {
    elements.sessionStartTimeDisplay.textContent = new Date(sessionStartTime).toLocaleTimeString(
      "en-US",
      { hour: "2-digit", minute: "2-digit" }
    );
  }
}

function updatePostureDurations(type) {
  const now = Date.now();
  const delta = now - lastUpdateTime;
  lastUpdateTime = now;

  if (!type) return;
  if (type === "correct") postureDurations.correct += delta;
  else if (type === "warning") postureDurations.warning += delta;
  else if (type === "away") postureDurations.away += delta;
}

function updateQualityBreakdown() {
  const total = postureDurations.correct + postureDurations.warning + postureDurations.away || 1;
  const pctCorrect = Math.round((postureDurations.correct / total) * 100);
  const pctWarning = Math.round((postureDurations.warning / total) * 100);
  const pctAway = 100 - pctCorrect - pctWarning;

  if (elements.qualityGood) elements.qualityGood.textContent = pctCorrect;
  if (elements.qualityWarning) elements.qualityWarning.textContent = pctWarning;
  if (elements.qualityAway) elements.qualityAway.textContent = pctAway;

  if (elements.durationGood) {
    elements.durationGood.textContent = msToMinSec(postureDurations.correct);
  }
  if (elements.durationWarning) {
    elements.durationWarning.textContent = msToMinSec(postureDurations.warning);
  }
  if (elements.durationAway) {
    elements.durationAway.textContent = msToMinSec(postureDurations.away);
  }

  if (elements.qualityBar) {
    const segments = elements.qualityBar.children;
    if (segments[0]) segments[0].style.width = `${pctCorrect}%`;
    if (segments[1]) segments[1].style.width = `${pctWarning}%`;
    if (segments[2]) segments[2].style.width = `${pctAway}%`;
  }

  if (elements.insightText) {
    if (pctCorrect >= 70) elements.insightText.textContent = "Great stability – keep going!";
    else if (pctCorrect >= 40)
      elements.insightText.textContent = "Nice base – a few more balanced minutes will help.";
    else elements.insightText.textContent = "Try a short active break to rebalance.";
  }
}

/* ==========================
   HEALTH IMPACT & PROGRESS
   ========================== */

function updateHealthImpact(score) {
  const minutesCorrect = (postureDurations.correct / 60000) || 0;
  const stretchEquiv = Math.round(minutesCorrect * 0.8);
  const strainAvoided = Math.round(score * 0.3);

  if (elements.impactValueHero) elements.impactValueHero.textContent = stretchEquiv;
  if (elements.impactDescHero)
    elements.impactDescHero.textContent = "min stretching equivalent";
  if (elements.stretchEquiv) elements.stretchEquiv.textContent = stretchEquiv;
  if (elements.strainAvoided) elements.strainAvoided.textContent = strainAvoided;
}

function updateComparisons(score) {
  // placeholder semplice, puoi raffinarlo con dati reali
  const avg = 65;
  const betterThan = Math.max(0, Math.min(95, Math.round((score / Math.max(avg, 1)) * 50)));
  if (elements.communityProgress) {
    elements.communityProgress.innerHTML = `You’re <strong style="color:var(--color-accent);">${betterThan}%</strong> of the way to the community average`;
  }
  if (elements.communityBetterThan) {
    elements.communityBetterThan.innerHTML = `You’ve already surpassed <strong style="color:var(--color-green);">${Math.round(
      score / 4
    )}%</strong> of users`;
  }
}

function updateTodayScore(score) {
  if (!elements.todayScore) return;
  const current = parseInt(elements.todayScore.textContent || "0", 10);
  const newScore = Math.round(current * 0.7 + score * 0.3);
  elements.todayScore.textContent = newScore;
  updateTodayInHistory(newScore);
}

function updateProgressStats() {
  const today = parseInt(elements.todayScore?.textContent || "0", 10);
  const yesterday = today - 10;
  const diff = today - yesterday;

  if (elements.weekAvg) {
    elements.weekAvg.textContent = Math.round(today * 0.6 + 60 * 0.4);
  }
  if (elements.bestStreak) {
    elements.bestStreak.textContent = "7d";
  }

  const goal = parseInt(elements.dailyGoalValue?.textContent || "60", 10);
  const progress = Math.max(0, Math.min(100, Math.round((today / goal) * 100)));
  if (elements.goalProgressPercent) elements.goalProgressPercent.textContent = `${progress}%`;
  if (elements.goalProgressBar) elements.goalProgressBar.style.width = `${progress}%`;
  if (elements.goalProgressText) {
    elements.goalProgressText.innerHTML = `You've reached <strong style="color:var(--color-accent);">${progress}%</strong> of your daily goal`;
  }

  if (elements.bestMomentTimeCombined) {
    elements.bestMomentTimeCombined.textContent = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    });
  }
  if (elements.bestMomentDescCombined) {
    elements.bestMomentDescCombined.textContent = "Nice balanced streak!";
  }
}

/* ==========================
   ACHIEVEMENTS
   ========================== */

function checkAchievements(score) {
  if (!achievementsUnlocked.has("firstSession") && totalCount >= achievements.firstSession.trigger) {
    unlockAchievement(achievements.firstSession, "firstSession");
  }
  if (!achievementsUnlocked.has("superStar") && score >= achievements.superStar.trigger) {
    unlockAchievement(achievements.superStar, "superStar");
  }
}

function unlockAchievement(ach, key) {
  achievementsUnlocked.add(key);
  if (!elements.achievementPopup) return;
  elements.achievementIcon.textContent = ach.icon;
  elements.achievementTitle.textContent = ach.title;
  elements.achievementDesc.textContent = ach.desc;
  elements.achievementPopup.classList.add("show");
  setTimeout(() => elements.achievementPopup.classList.remove("show"), 2500);
}

/* ==========================
   MONTHLY HISTORY
   ========================== */

function generateMonthlyHistory() {
  const history = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    history.push({ date, score: null, isToday: i === 0 });
  }
  return history;
}

function renderCalendar() {
  const container = elements.historyCalendar;
  if (!container) return;
  container.innerHTML = "";

  const dayNames = ["S", "M", "T", "W", "T", "F", "S"];
  const data = calendarView === "week" ? monthlyHistory.slice(-7) : monthlyHistory;

  data.forEach((day) => {
    const dayEl = document.createElement("div");
    dayEl.className = "calendar-day";

    const label = document.createElement("div");
    label.className = "calendar-day-label";
    label.textContent = calendarView === "week" ? dayNames[day.date.getDay()] : day.date.getDate();

    const circle = document.createElement("div");
    circle.className = "calendar-circle";
    if (day.isToday) circle.classList.add("today");
    circle.textContent = day.date.getDate();

    if (day.score == null) circle.classList.add("poor");
    else if (day.score >= 90) circle.classList.add("excellent");
    else if (day.score >= 70) circle.classList.add("good");
    else if (day.score >= 50) circle.classList.add("medium");
    else circle.classList.add("poor");

    dayEl.onclick = () => {
      const dateStr = day.date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric"
      });
      const scoreText = day.score != null ? `Score ${day.score}` : "No data";
      alert(`${dateStr}\n${scoreText}`);
    };

    dayEl.appendChild(label);
    dayEl.appendChild(circle);
    container.appendChild(dayEl);
  });
}

function updateTodayInHistory(score) {
  const today = new Date();
  const idx = monthlyHistory.findIndex(
    (d) =>
      d.date.getFullYear() === today.getFullYear() &&
      d.date.getMonth() === today.getMonth() &&
      d.date.getDate() === today.getDate()
  );
  if (idx >= 0) {
    monthlyHistory[idx].score = score;
    monthlyHistory[idx].isToday = true;
  }
  renderCalendar();
}

/* ==========================
   DAILY GOAL MODAL
   ========================== */

function openGoalModal() {
  if (!elements.goalModal) return;
  elements.goalModal.style.display = "flex";
  elements.goalModal.setAttribute("aria-hidden", "false");
  const currentGoal = parseInt(elements.dailyGoalValue?.textContent || "60", 10);
  elements.goalRange.value = currentGoal;
  elements.goalRangeValue.textContent = currentGoal;
}

function closeGoalModal() {
  if (!elements.goalModal) return;
  elements.goalModal.style.display = "none";
  elements.goalModal.setAttribute("aria-hidden", "true");
}

function handleGoalRangeChange() {
  elements.goalRangeValue.textContent = elements.goalRange.value;
}

function saveGoal() {
  const val = parseInt(elements.goalRange.value || "60", 10);
  if (elements.dailyGoalValue) elements.dailyGoalValue.textContent = val;
  localStorage.setItem("leantil.dailyGoal", String(val));
  closeGoalModal();
}

/* ==========================
   ACTIVE BREAKS ENGINE
   ========================== */

function loadExercisePrefs() {
  const raw = localStorage.getItem("leantil.exercisePrefs");
  if (!raw) {
    return {
      reminderInterval: "45",
      persistentEnabled: true,
      persistentMinutes: "3",
      focusNeck: true,
      focusShoulders: true,
      focusBack: true,
      cooldownMinutes: "10"
    };
  }
  try {
    return JSON.parse(raw);
  } catch {
    return {
      reminderInterval: "45",
      persistentEnabled: true,
      persistentMinutes: "3",
      focusNeck: true,
      focusShoulders: true,
      focusBack: true,
      cooldownMinutes: "10"
    };
  }
}

function saveExercisePrefs() {
  localStorage.setItem("leantil.exercisePrefs", JSON.stringify(exerciseState.prefs));
}

function updateExerciseEngine(postureName) {
  const now = Date.now();
  const prevPosture = exerciseState.postureName;
  exerciseState.postureName = postureName || "AWAY";

  if (prevPosture !== exerciseState.postureName) {
    exerciseState.postureSince = now;
  }

  if (exerciseState.postureName === "AWAY") {
    exerciseState.seatedSince = null;
    exerciseState.currentRoutine = null;
    closeExerciseModal();
  } else if (!exerciseState.seatedSince) {
    exerciseState.seatedSince = now;
  }

  evaluateExerciseTriggers();
  renderExerciseSummary();
}

function evaluateExerciseTriggers() {
  const now = Date.now();
  if (!exerciseState.seatedSince || exerciseState.postureName === "AWAY") return;

  const seatedMs = now - exerciseState.seatedSince;
  const postureMs = now - exerciseState.postureSince;
  const reminderMs = Number(exerciseState.prefs.reminderInterval) * 60 * 1000;
  const persistentMs = Number(exerciseState.prefs.persistentMinutes) * 60 * 1000;
  const cooldownMs = Number(exerciseState.prefs.cooldownMinutes) * 60 * 1000;

  const inCooldown =
    exerciseState.lastReminderAt && now - exerciseState.lastReminderAt < cooldownMs;
  if (inCooldown) return;

  const timeTrigger = seatedMs >= reminderMs;
  const postureTrigger =
    exerciseState.prefs.persistentEnabled &&
    ["SLOUCH", "LEANLEFT", "LEANRIGHT", "LEANBACK", "FIDGET"].includes(
      exerciseState.postureName
    ) &&
    postureMs >= persistentMs;

  if (!exerciseState.currentRoutine && (timeTrigger || postureTrigger)) {
    exerciseState.currentRoutine = buildRoutine(
      exerciseState.postureName,
      exerciseState.prefs
    );
    exerciseState.lastReminderAt = now;
  }
}

function renderExerciseSummary() {
  const now = Date.now();
  const seatedMs =
    exerciseState.seatedSince && exerciseState.postureName !== "AWAY"
      ? now - exerciseState.seatedSince
      : 0;
  const postureMs = now - exerciseState.postureSince;
  const reminderMs = Number(exerciseState.prefs.reminderInterval) * 60 * 1000;
  const left = Math.max(0, reminderMs - seatedMs);

  if (elements.seatedTimeValue) elements.seatedTimeValue.textContent = msToClock(seatedMs);
  if (elements.postureHoldValue)
    elements.postureHoldValue.textContent =
      exerciseState.postureName === "AWAY" ? "00:00" : msToClock(postureMs);
  if (elements.nextBreakValue)
    elements.nextBreakValue.textContent =
      !exerciseState.seatedSince || exerciseState.postureName === "AWAY"
        ? "--:--"
        : msToClock(left);

  const routine = exerciseState.currentRoutine;
  if (!routine || !routine.exercises || routine.exercises.length === 0) {
    if (elements.exerciseReason)
      elements.exerciseReason.textContent = "No routine suggested yet.";
    if (elements.exercisePreviewName) elements.exercisePreviewName.textContent = "Waiting for trigger";
    if (elements.exercisePreviewDesc) {
      elements.exercisePreviewDesc.textContent =
        "When LeanTil detects prolonged sitting or a persistent posture, this area will show a seated routine with visual guidance.";
    }
    if (elements.startExerciseBtn) elements.startExerciseBtn.disabled = true;
    if (elements.snoozeExerciseBtn) elements.snoozeExerciseBtn.disabled = true;
    return;
  }

  const ex = routine.exercises[0];
  if (elements.exerciseReason) elements.exerciseReason.textContent = routine.reason;
  if (elements.exercisePreviewName) elements.exercisePreviewName.textContent = ex.name;
  if (elements.exercisePreviewDesc) elements.exercisePreviewDesc.textContent = ex.description;
  if (elements.exercisePreviewImage) elements.exercisePreviewImage.src = ex.image;
  if (elements.startExerciseBtn) elements.startExerciseBtn.disabled = false;
  if (elements.snoozeExerciseBtn) elements.snoozeExerciseBtn.disabled = false;
}

/* MODALE ROUTINE */

function openExerciseModal() {
  const routine = exerciseState.currentRoutine;
  if (!routine || !routine.exercises || routine.exercises.length === 0) return;
  exerciseState.modalOpen = true;
  exerciseState.routineIndex = 0;
  if (elements.exerciseModalBackdrop) {
    elements.exerciseModalBackdrop.setAttribute("aria-hidden", "false");
    elements.exerciseModalBackdrop.classList.add("open");
  }
  renderCurrentExercise();
}

function closeExerciseModal() {
  exerciseState.modalOpen = false;
  if (elements.exerciseModalBackdrop) {
    elements.exerciseModalBackdrop.setAttribute("aria-hidden", "true");
    elements.exerciseModalBackdrop.classList.remove("open");
  }
}

function snoozeRoutine() {
  exerciseState.currentRoutine = null;
  exerciseState.lastReminderAt = Date.now();
  renderExerciseSummary();
}

function renderCurrentExercise() {
  const routine = exerciseState.currentRoutine;
  if (!routine || !routine.exercises) return;
  const ex = routine.exercises[exerciseState.routineIndex];
  if (!ex) {
    finishRoutine();
    return;
  }

  const total = routine.exercises.length;
  if (elements.exerciseTitle) elements.exerciseTitle.textContent = "Guided Routine";
  if (elements.exerciseSubtitle)
    elements.exerciseSubtitle.textContent = `${exerciseState.routineIndex + 1} of ${total}`;

  if (elements.exerciseImage) {
    elements.exerciseImage.src = ex.image;
    elements.exerciseImage.alt = ex.name;
  }
  if (elements.exerciseName) elements.exerciseName.textContent = ex.name;
  if (elements.exerciseDescription) elements.exerciseDescription.textContent = ex.description;
  if (elements.exerciseSteps) {
    elements.exerciseSteps.innerHTML = ex.steps.map((s) => `<li>${s}</li>`).join("");
  }

  exerciseState.stepEndsAt = Date.now() + ex.duration * 1000;
  updateExerciseTimer();

  if (elements.prevExerciseBtn) {
    elements.prevExerciseBtn.disabled = exerciseState.routineIndex === 0;
  }
  if (elements.nextExerciseBtn) {
    elements.nextExerciseBtn.textContent =
      exerciseState.routineIndex === total - 1 ? "Complete" : "Next";
  }
}

function updateExerciseTimer() {
  if (!exerciseState.modalOpen || !elements.exerciseTimer) return;
  const left = Math.max(0, Math.ceil((exerciseState.stepEndsAt - Date.now()) / 1000));
  elements.exerciseTimer.textContent = `${String(left).padStart(2, "0")}s`;
}

function prevExercise() {
  if (!exerciseState.currentRoutine) return;
  if (exerciseState.routineIndex > 0) {
    exerciseState.routineIndex -= 1;
    renderCurrentExercise();
  }
}

function nextExercise() {
  if (!exerciseState.currentRoutine) return;
  exerciseState.routineIndex += 1;
  if (exerciseState.routineIndex >= exerciseState.currentRoutine.exercises.length) {
    finishRoutine();
  } else {
    renderCurrentExercise();
  }
}

function finishRoutine() {
  exerciseState.currentRoutine = null;
  closeExerciseModal();
  renderExerciseSummary();
}

/* ==========================
   LOOP TICK
   ========================== */

function loopTick() {
  if (exerciseState.modalOpen) {
    updateExerciseTimer();
  }
  renderExerciseSummary();
}

/* ==========================
   UTILS
   ========================== */

function msToClock(ms) {
  const totalSec = Math.floor(ms / 1000);
  const min = String(Math.floor(totalSec / 60)).padStart(2, "0");
  const sec = String(totalSec % 60).padStart(2, "0");
  return `${min}:${sec}`;
}

function msToMinSec(ms) {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}m ${sec}s`;
}
