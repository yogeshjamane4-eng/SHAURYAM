"use strict";

/* =========================================
   SHAURYAM — CREATED BY YOGESH
   HTML5 + CSS3 + Vanilla JavaScript
========================================= */

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const STORAGE_KEY = "shauryam_app_v1";

const DEFAULT_TIMETABLE = [
  { id: "t1", name: "Wake up & prepare", start: "05:30", end: "05:40", category: "Routine" },
  { id: "t2", name: "Morning Trisandhya", start: "05:40", end: "05:55", category: "Spiritual" },
  { id: "t3", name: "Beginner fitness", start: "05:55", end: "06:15", category: "Fitness" },
  { id: "t4", name: "Bath & get ready", start: "06:15", end: "06:45", category: "Routine" },
  { id: "t5", name: "Breakfast & preparation", start: "06:45", end: "07:00", category: "Routine" },
  { id: "t6", name: "NDA Maths", start: "07:00", end: "07:40", category: "Study" },
  { id: "t7", name: "NDA GAT", start: "07:40", end: "08:05", category: "Study" },
  { id: "t8", name: "Revision & travel buffer", start: "08:05", end: "09:00", category: "Routine" },
  { id: "t9", name: "College", start: "09:00", end: "11:00", category: "College" },
  { id: "t10", name: "Midday Trisandhya opportunity", start: "11:00", end: "11:15", category: "Spiritual" },
  { id: "t11", name: "College classes", start: "11:15", end: "13:15", category: "College" },
  { id: "t12", name: "Lunch", start: "13:15", end: "13:45", category: "Routine" },
  { id: "t13", name: "College classes", start: "13:45", end: "17:00", category: "College" },
  { id: "t14", name: "Evening Trisandhya opportunity", start: "17:00", end: "17:15", category: "Spiritual" },
  { id: "t15", name: "College / study hour", start: "17:15", end: "19:30", category: "College" },
  { id: "t16", name: "Return travel & refresh", start: "19:30", end: "20:30", category: "Routine" },
  { id: "t17", name: "Dinner & personal time", start: "20:30", end: "20:50", category: "Personal" },
  { id: "t18", name: "Bhagavata Purana reading", start: "20:50", end: "21:10", category: "Spiritual" },
  { id: "t19", name: "Prepare for tomorrow", start: "21:10", end: "21:20", category: "Routine" },
  { id: "t20", name: "Sleep", start: "21:20", end: "05:30", category: "Personal" }
];

const DEFAULT_MISSIONS = [
  "Morning Trisandhya",
  "Fitness session",
  "NDA Maths revision",
  "NDA GAT revision",
  "College study",
  "Bhagavata Purana reading"
];

const DEFAULT_EXERCISES = [
  "Warm-up and gentle mobility",
  "Easy squats — comfortable repetitions",
  "Wall push-ups or comfortable push-ups",
  "Light marching or easy walking",
  "Gentle stretching and cool-down"
];

const DEFAULT_NDA = {
  Maths: [
    "Sets", "Relations and Functions", "Trigonometric Functions",
    "Complex Numbers", "Linear Inequalities", "Permutations and Combinations",
    "Binomial Theorem", "Sequences and Series", "Straight Lines",
    "Conic Sections", "Introduction to 3D Geometry", "Limits and Derivatives",
    "Statistics", "Probability"
  ],
  GAT: [
    "English Grammar", "Vocabulary", "Reading Comprehension",
    "Physics Basics", "Chemistry Basics", "General Science",
    "Indian History", "Indian Geography", "Indian Polity",
    "Economics Basics", "Current Affairs"
  ]
};

const DEFAULT_PUC = {
  Physics: [
    "Units and Measurements", "Motion in a Straight Line",
    "Motion in a Plane", "Laws of Motion", "Work, Energy and Power",
    "System of Particles and Rotational Motion", "Gravitation",
    "Mechanical Properties of Solids", "Mechanical Properties of Fluids",
    "Thermal Properties of Matter", "Thermodynamics",
    "Kinetic Theory", "Oscillations", "Waves"
  ],
  Chemistry: [
    "Some Basic Concepts of Chemistry",
    "Structure of Atom", "Classification of Elements",
    "Chemical Bonding", "States of Matter",
    "Thermodynamics", "Equilibrium", "Redox Reactions",
    "Hydrogen", "s-Block Elements", "Some p-Block Elements",
    "Organic Chemistry Basics", "Hydrocarbons",
    "Environmental Chemistry"
  ],
  Mathematics: [
    "Sets", "Relations and Functions", "Trigonometric Functions",
    "Complex Numbers", "Linear Inequalities",
    "Permutations and Combinations", "Binomial Theorem",
    "Sequences and Series", "Straight Lines", "Conic Sections",
    "3D Geometry", "Limits and Derivatives", "Statistics", "Probability"
  ],
  "Computer Science": [
    "Computer System", "Encoding Schemes",
    "Boolean Logic", "Number Systems",
    "Introduction to Problem Solving", "Python Basics",
    "Operators and Expressions", "Conditional Statements",
    "Loops", "Strings", "Lists", "Tuples", "Dictionaries",
    "Functions", "File Handling"
  ]
};

const DEFAULT_STATE = {
  version: 1,
  name: "",
  theme: "navy",
  timetable: DEFAULT_TIMETABLE.map(item => ({ ...item })),
  missions: {},
  exerciseChecks: {},
  workoutHistory: [],
  nda: {
    chapters: {
      Maths: DEFAULT_NDA.Maths.map((name, i) => ({ id: "nm" + i, name, done: false })),
      GAT: DEFAULT_NDA.GAT.map((name, i) => ({ id: "ng" + i, name, done: false }))
    },
    notes: "",
    targets: { maths: 40, gat: 25 },
    resources: []
  },
  puc: {
    chapters: Object.fromEntries(
      Object.entries(DEFAULT_PUC).map(([subject, chapters]) => [
        subject,
        chapters.map((name, i) => ({
          id: subject.replace(/\W/g, "") + i,
          name,
          done: false
        }))
      ])
    ),
    notes: {}
  },
  notes: [],
  settings: {
    repeat: false,
    workoutMusic: true
  }
};

let state = loadState();
let currentScreen = "home";
let ndaSubject = "Maths";
let pucSubject = "Physics";
let toastTimeout = null;

let currentAudioURL = null;
let playlist = [];
let currentTrack = -1;
let repeatMode = state.settings.repeat ? 1 : 0;

let workout = {
  active: false,
  paused: false,
  elapsed: 0,
  duration: 15 * 60,
  startedAt: 0,
  savedAudioTime: 0,
  wasPlaying: false,
  trackIndex: -1
};

let focus = {
  duration: 25 * 60,
  remaining: 25 * 60,
  active: false,
  paused: false,
  deadline: 0
};

const audio = $("#audioPlayer");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return clone(DEFAULT_STATE);

    const saved = JSON.parse(raw);
    if (!saved || typeof saved !== "object") return clone(DEFAULT_STATE);

    return {
      ...clone(DEFAULT_STATE),
      ...saved,
      settings: { ...DEFAULT_STATE.settings, ...(saved.settings || {}) },
      nda: {
        ...clone(DEFAULT_STATE.nda),
        ...(saved.nda || {}),
        chapters: {
          ...clone(DEFAULT_STATE.nda.chapters),
          ...(saved.nda?.chapters || {})
        },
        targets: {
          ...DEFAULT_STATE.nda.targets,
          ...(saved.nda?.targets || {})
        },
        resources: Array.isArray(saved.nda?.resources)
          ? saved.nda.resources : []
      },
      puc: {
        ...clone(DEFAULT_STATE.puc),
        ...(saved.puc || {}),
        chapters: {
          ...clone(DEFAULT_STATE.puc.chapters),
          ...(saved.puc?.chapters || {})
        },
        notes: saved.puc?.notes || {}
      },
      timetable: Array.isArray(saved.timetable)
        ? saved.timetable : clone(DEFAULT_TIMETABLE),
      missions: saved.missions || {},
      exerciseChecks: saved.exerciseChecks || {},
      workoutHistory: Array.isArray(saved.workoutHistory)
        ? saved.workoutHistory : [],
      notes: Array.isArray(saved.notes) ? saved.notes : []
    };
  } catch (error) {
    console.warn("Saved data could not be read.", error);
    return clone(DEFAULT_STATE);
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (error) {
    console.warn("Local storage unavailable or full.", error);
    toast("Could not save data. Check browser storage.");
    return false;
  }
}

function makeId() {
  return "id_" + Date.now().toString(36) +
    Math.random().toString(36).slice(2, 8);
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function toast(message) {
  const element = $("#toast");
  element.textContent = message;
  element.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => element.classList.remove("show"), 2600);
}

function confirmAction(message) {
  return window.confirm(message);
}

function todayKey() {
  const date = new Date();
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
}

function todayMissions() {
  const key = todayKey();
  if (!state.missions[key]) {
    state.missions[key] = {};
    saveState();
  }
  return state.missions[key];
}

function completedCount(items) {
  return items.filter(item => item.done).length;
}

function progressPercent(items) {
  return items.length
    ? Math.round(completedCount(items) / items.length * 100)
    : 0;
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) seconds = 0;
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return mins + ":" + String(secs).padStart(2, "0");
}

function formatClockTime(time) {
  if (!time) return "";
  const [hour, minute] = time.split(":").map(Number);
  const suffix = hour >= 12 ? "PM" : "AM";
  const h = hour % 12 || 12;
  return h + ":" + String(minute).padStart(2, "0") + " " + suffix;
}

function setTheme(theme) {
  const validThemes = ["navy", "black", "white", "forest", "royal"];
  if (!validThemes.includes(theme)) theme = "navy";

  state.theme = theme;
  document.body.dataset.theme = theme;
  $("#themeSelect").value = theme;

  const themeColors = {
    navy: "#091326",
    black: "#080808",
    white: "#f4f2ed",
    forest: "#071b18",
    royal: "#140e29"
  };

  $('meta[name="theme-color"]').content = themeColors[theme];
  saveState();
}

function showScreen(name) {
  const target = $("#screen-" + name);
  if (!target) {
    toast("This screen is not available.");
    return;
  }

  currentScreen = name;

  $$(".screen").forEach(screen => screen.classList.remove("active"));
  target.classList.add("active");

  $$(".nav-item").forEach(button => {
    button.classList.toggle("active", button.dataset.go === name);
  });

  renderScreen(name);

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderScreen(name) {
  switch (name) {
    case "home":
      renderHome();
      break;
    case "music":
      renderPlaylist();
      break;
    case "exercise":
      renderExercise();
      updateWorkoutDisplay();
      break;
    case "timetable":
      renderTimetable();
      break;
    case "nda":
      renderNDA();
      break;
    case "puc":
      renderPUC();
      break;
    case "notes":
      renderNotes();
      break;
    case "focus":
      updateFocusDisplay();
      break;
    case "settings":
      renderSettings();
      break;
  }
}

/* =========================================
   SPLASH, PARTICLES AND LOCAL PROFILE
========================================= */

function createParticles() {
  const container = $("#particles");
  for (let i = 0; i < 17; i++) {
    const particle = document.createElement("i");
    particle.className = "particle";
    particle.style.left = Math.random() * 100 + "%";
    particle.style.top = (25 + Math.random() * 70) + "%";
    particle.style.animationDelay = (Math.random() * 5) + "s";
    particle.style.animationDuration = (4 + Math.random() * 4) + "s";
    container.appendChild(particle);
  }
}

function startApp() {
  createParticles();
  setTheme(state.theme);

  $("#settingsRepeat").checked = state.settings.repeat;
  $("#settingsWorkoutMusic").checked = state.settings.workoutMusic;
  $("#workoutMusic").checked = state.settings.workoutMusic;

  $("#focusDuration").value = "25";
  updateFocusDisplay();

  renderHome();

  setTimeout(() => {
    $("#splash").classList.add("hide");
    $("#app").classList.remove("hidden");

    if (!state.name) {
      $("#nameModal").classList.remove("hidden");
      $("#nameInput").focus();
    } else {
      updateProfileDisplay();
    }
  }, 1500);
}

function updateProfileDisplay() {
  const name = state.name || "Warrior";
  $("#greeting").textContent = "Welcome, " + name;
  $("#profileDisplayName").textContent = name;
  $("#profileAvatar").textContent = name.trim().charAt(0).toUpperCase() || "Y";
  $("#profileNameInput").value = name;

  const date = new Date();
  $("#todayDate").textContent = date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

$("#nameForm").addEventListener("submit", event => {
  event.preventDefault();
  const name = $("#nameInput").value.trim();

  if (!name) {
    toast("Please enter your name.");
    return;
  }

  state.name = name;
  saveState();

  $("#nameModal").classList.add("hidden");
  updateProfileDisplay();
  renderHome();
  toast("Welcome to SHAURYAM, " + name + "!");
});

$("#profileForm").addEventListener("submit", event => {
  event.preventDefault();
  const name = $("#profileNameInput").value.trim();

  if (!name) {
    toast("Enter a display name first.");
    return;
  }

  state.name = name;
  saveState();
  updateProfileDisplay();
  toast("Profile updated.");
});

$("#nameInput").value = state.name;

/* =========================================
   NAVIGATION
========================================= */

document.addEventListener("click", event => {
  const button = event.target.closest("[data-go]");
  if (!button) return;

  showScreen(button.dataset.go);
});

/* =========================================
   HOME AND DAILY MISSIONS
========================================= */

function renderHome() {
  updateProfileDisplay();

  const missions = todayMissions();
  const completed = DEFAULT_MISSIONS.filter((_, i) => missions[i]).length;

  $("#homeTaskCount").textContent =
    completed + "/" + DEFAULT_MISSIONS.length;

  $("#homeWorkoutCount").textContent =
    state.workoutHistory.filter(item => item.date === todayKey()).length;

  const allChapters = [
    ...Object.values(state.nda.chapters).flat(),
    ...Object.values(state.puc.chapters).flat()
  ];

  $("#homeStudyCount").textContent = progressPercent(allChapters) + "%";

  const missionList = $("#missionList");
  missionList.replaceChildren();

  DEFAULT_MISSIONS.forEach((name, index) => {
    const label = document.createElement("label");
    label.className = "mission-item" + (missions[index] ? " done" : "");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = !!missions[index];
    checkbox.setAttribute("aria-label", name);

    checkbox.addEventListener("change", () => {
      todayMissions()[index] = checkbox.checked;
      saveState();
      renderHome();
    });

    const text = document.createElement("span");
    text.textContent = name;

    label.append(checkbox, text);
    missionList.appendChild(label);
  });

  const overview = $("#homeStudyOverview");
  overview.replaceChildren();

  [
    ["NDA Maths", state.nda.chapters.Maths],
    ["NDA GAT", state.nda.chapters.GAT],
    ...Object.entries(state.puc.chapters)
  ].forEach(([title, chapters]) => {
    const block = document.createElement("div");
    block.style.marginBottom = "14px";

    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.justifyContent = "space-between";
    row.style.gap = "8px";
    row.style.marginBottom = "7px";
    row.style.fontSize = "11px";

    const label = document.createElement("span");
    label.textContent = title;

    const value = document.createElement("strong");
    value.textContent = progressPercent(chapters) + "%";
    value.style.color = "var(--gold)";

    const track = document.createElement("div");
    track.className = "progress-track";

    const fill = document.createElement("div");
    fill.className = "progress-fill";
    fill.style.width = progressPercent(chapters) + "%";

    row.append(label, value);
    track.appendChild(fill);
    block.append(row, track);
    overview.appendChild(block);
  });
}

/* =========================================
   THEME SETTINGS
========================================= */

$("#themeSelect").addEventListener("change", event => {
  setTheme(event.target.value);
  toast("Theme updated.");
});

$("#settingsRepeat").addEventListener("change", event => {
  state.settings.repeat = event.target.checked;
  repeatMode = event.target.checked ? 1 : 0;
  audio.loop = repeatMode === 1;
  updateRepeatButton();
  saveState();
});

$("#settingsWorkoutMusic").addEventListener("change", event => {
  state.settings.workoutMusic = event.target.checked;
  $("#workoutMusic").checked = event.target.checked;
  saveState();
});

/* =========================================
   MUSIC PLAYER
========================================= */

function getTrackTitle(file) {
  return file.name.replace(/\.[^/.]+$/, "");
}

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function updateRepeatButton() {
  const labels = ["Repeat: Off", "Repeat: One"];
  $("#repeatButton").textContent = labels[repeatMode];
  audio.loop = repeatMode === 1;
}

function updateMusicAnimation(playing) {
  $("#musicDisc").classList.toggle("playing", playing);
  $("#equalizer").classList.toggle("playing", playing);
  $("#playPause").textContent = playing ? "Ⅱ" : "▶";
  $("#playPause").setAttribute("aria-label", playing ? "Pause" : "Play");
}

function updateMusicTime() {
  const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
  const current = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;

  $("#elapsedTime").textContent = formatTime(current);
  $("#totalTime").textContent = formatTime(duration);

  $("#seekBar").value = duration ? Math.round(current / duration * 1000) : 0;
}

function selectTrack(index, autoplay = true) {
  if (index < 0 || index >= playlist.length) {
    toast("Select an audio file first.");
    return false;
  }

  audio.pause();

  if (currentAudioURL) {
    URL.revokeObjectURL(currentAudioURL);
    currentAudioURL = null;
  }

  currentTrack = index;
  const track = playlist[index];

  currentAudioURL = URL.createObjectURL(track.file);
  audio.src = currentAudioURL;
  audio.load();

  $("#songTitle").textContent = track.title;
  $("#songMeta").textContent = formatBytes(track.file.size);
  updateMusicTime();
  renderPlaylist();
  updateWorkoutSongOptions();

  if (autoplay) {
    playAudio();
  } else {
    updateMusicAnimation(false);
  }

  return true;
}

async function playAudio() {
  if (currentTrack < 0 || !playlist[currentTrack]) {
    toast("Select audio files from your phone first.");
    $("#audioFiles").click();
    return false;
  }

  try {
    await audio.play();
    updateMusicAnimation(true);
    return true;
  } catch (error) {
    updateMusicAnimation(false);
    toast("Playback failed. Try another audio file or tap Play.");
    console.warn("Audio playback error:", error);
    return false;
  }
}

function pauseAudio() {
  audio.pause();
  updateMusicAnimation(false);
}

function nextTrack() {
  if (!playlist.length) {
    toast("Select audio files first.");
    return;
  }

  let next = currentTrack + 1;
  if (next >= playlist.length) next = 0;
  selectTrack(next, true);
}

function previousTrack() {
  if (!playlist.length) {
    toast("Select audio files first.");
    return;
  }

  if (audio.currentTime > 3) {
    audio.currentTime = 0;
    return;
  }

  let previous = currentTrack - 1;
  if (previous < 0) previous = playlist.length - 1;
  selectTrack(previous, true);
}

$("#audioFiles").addEventListener("change", event => {
  const files = [...event.target.files];

  const validFiles = files.filter(file =>
    file.type.startsWith("audio/") ||
    /\.(mp3|m4a|aac|ogg|wav|flac|opus|weba)$/i.test(file.name)
  );

  if (!validFiles.length && files.length) {
    toast("No supported audio files were selected.");
    event.target.value = "";
    return;
  }

  const firstNewTrack = playlist.length;

  validFiles.forEach(file => {
    playlist.push({ id: makeId(), title: getTrackTitle(file), file });
  });

  if (validFiles.length) {
    toast(validFiles.length + " audio file(s) added.");
    if (currentTrack < 0) selectTrack(firstNewTrack, false);
    renderPlaylist();
    updateWorkoutSongOptions();
  }

  event.target.value = "";
});

$("#playPause").addEventListener("click", () => {
  if (audio.paused) playAudio();
  else pauseAudio();
});

$("#nextSong").addEventListener("click", nextTrack);
$("#previousSong").addEventListener("click", previousTrack);

$("#seekBar").addEventListener("input", () => {
  if (Number.isFinite(audio.duration) && audio.duration > 0) {
    audio.currentTime = Number($("#seekBar").value) / 1000 * audio.duration;
  }
});

$("#volumeControl").addEventListener("input", () => {
  audio.volume = Number($("#volumeControl").value);
});

audio.volume = 0.8;

$("#repeatButton").addEventListener("click", () => {
  repeatMode = (repeatMode + 1) % 2;
  state.settings.repeat = repeatMode === 1;
  audio.loop = state.settings.repeat;
  $("#settingsRepeat").checked = state.settings.repeat;
  updateRepeatButton();
  saveState();
});

audio.addEventListener("timeupdate", updateMusicTime);
audio.addEventListener("loadedmetadata", updateMusicTime);

audio.addEventListener("play", () => updateMusicAnimation(true));
audio.addEventListener("pause", () => updateMusicAnimation(false));

audio.addEventListener("ended", () => {
  if (repeatMode === 1) return;
  if (playlist.length > 1) nextTrack();
  else updateMusicAnimation(false);
});

audio.addEventListener("error", () => {
  updateMusicAnimation(false);
  if (audio.currentSrc) toast("This audio format could not be played.");
});

function renderPlaylist() {
  const container = $("#playlist");
  container.replaceChildren();

  $("#playlistCount").textContent =
    playlist.length + (playlist.length === 1 ? " track" : " tracks");

  if (!playlist.length) {
    container.innerHTML = '<div class="empty-state">Your playlist is empty. Select audio files to start.</div>';
    return;
  }

  playlist.forEach((track, index) => {
    const row = document.createElement("div");
    row.className = "playlist-item";

    const play = document.createElement("button");
    play.className = "playlist-play";
    play.textContent = index === currentTrack && !audio.paused ? "Ⅱ" : "▶";
    play.setAttribute("aria-label", "Play " + track.title);

    play.addEventListener("click", () => {
      if (currentTrack === index && !audio.paused) pauseAudio();
      else if (currentTrack === index) playAudio();
      else selectTrack(index, true);
      renderPlaylist();
    });

    const info = document.createElement("div");
    info.className = "track-info";

    const title = document.createElement("strong");
    title.textContent = track.title;

    const meta = document.createElement("small");
    meta.textContent = formatBytes(track.file.size) +
      (index === currentTrack ? " · Selected" : "");

    info.append(title, meta);

    const remove = document.createElement("button");
    remove.className = "track-remove";
    remove.textContent = "✕";
    remove.setAttribute("aria-label", "Remove " + track.title);

    remove.addEventListener("click", () => removeTrack(index));

    row.append(play, info, remove);
    container.appendChild(row);
  });
}

function removeTrack(index) {
  const wasCurrent = index === currentTrack;

  if (wasCurrent) {
    audio.pause();
    audio.removeAttribute("src");
    audio.load();

    if (currentAudioURL) URL.revokeObjectURL(currentAudioURL);
    currentAudioURL = null;
  }

  playlist.splice(index, 1);

  if (!playlist.length) {
    currentTrack = -1;
    $("#songTitle").textContent = "No song selected";
    $("#songMeta").textContent = "Choose audio files to begin";
    updateMusicAnimation(false);
  } else if (wasCurrent) {
    currentTrack = -1;
    selectTrack(Math.min(index, playlist.length - 1), false);
  } else if (index < currentTrack) {
    currentTrack--;
  }

  renderPlaylist();
  updateWorkoutSongOptions();
  toast("Track removed.");
}

function updateWorkoutSongOptions() {
  const select = $("#workoutSong");
  const previousValue = select.value;
  select.replaceChildren();

  const next = document.createElement("option");
  next.value = "-1";
  next.textContent = "Next available song";
  select.appendChild(next);

  playlist.forEach((track, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = track.title;
    select.appendChild(option);
  });

  if ([...select.options].some(option => option.value === previousValue)) {
    select.value = previousValue;
  }
}

/* =========================================
   EXERCISE MODE + AUTOMATIC WORKOUT MUSIC
========================================= */

function renderExercise() {
  const container = $("#exerciseChecklist");
  container.replaceChildren();

  const key = todayKey();
  const checks = state.exerciseChecks[key] || {};

  DEFAULT_EXERCISES.forEach((name, index) => {
    const label = document.createElement("label");
    label.className = "check-row";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = !!checks[index];

    checkbox.addEventListener("change", () => {
      if (!state.exerciseChecks[key]) state.exerciseChecks[key] = {};
      state.exerciseChecks[key][index] = checkbox.checked;
      saveState();
      updateExerciseProgress();
    });

    const text = document.createElement("span");
    text.textContent = name;

    label.append(checkbox, text);
    container.appendChild(label);
  });

  $("#workoutMusic").checked = state.settings.workoutMusic;
  updateExerciseProgress();
  $("#workoutHistoryCount").textContent =
    state.workoutHistory.filter(item => item.date === key).length;
}

function updateExerciseProgress() {
  const checks = state.exerciseChecks[todayKey()] || {};
  const count = DEFAULT_EXERCISES.filter((_, i) => checks[i]).length;
  const percent = count / DEFAULT_EXERCISES.length * 100;

  $("#exerciseProgressBar").style.width = percent + "%";
  $("#exerciseProgressText").textContent =
    count + " of " + DEFAULT_EXERCISES.length + " activities completed";
}

function updateWorkoutDisplay() {
  $("#workoutClock").textContent = formatTime(workout.elapsed);
  $("#startWorkout").disabled = workout.active && !workout.paused;
  $("#pauseWorkout").disabled = !workout.active;
  $("#pauseWorkout").textContent = workout.paused ? "▶ Resume" : "Ⅱ Pause";
  $("#endWorkout").disabled = !workout.active;

  if (!workout.active) {
    $("#workoutStatus").textContent = "Ready for today's session";
  } else if (workout.paused) {
    $("#workoutStatus").textContent = "Workout paused";
  } else {
    $("#workoutStatus").textContent = "Workout in progress";
  }
}

async function startWorkout() {
  if (workout.active && workout.paused) {
    workout.paused = false;
    workout.startedAt = Date.now() - workout.elapsed * 1000;
    updateWorkoutDisplay();

    if ($("#workoutMusic").checked && workout.trackIndex >= 0) {
      await playAudio();
    }
    return;
  }

  if (workout.active) return;

  workout.duration = Number($("#workoutDuration").value) * 60;
  workout.elapsed = 0;
  workout.startedAt = Date.now();
  workout.active = true;
  workout.paused = false;
  workout.wasPlaying = !audio.paused;
  workout.savedAudioTime = audio.currentTime || 0;
  workout.trackIndex = -1;

  if ($("#workoutMusic").checked) {
    if (!playlist.length) {
      workout.active = false;
      updateWorkoutDisplay();
      toast("Select a workout song before starting with music.");
      $("#audioFiles").click();
      return;
    }

    const chosen = Number($("#workoutSong").value);
    const track = chosen >= 0 ? chosen : (currentTrack >= 0 ? currentTrack : 0);

    if (!selectTrack(track, false)) {
      workout.active = false;
      updateWorkoutDisplay();
      return;
    }

    workout.trackIndex = track;

    // Play is requested directly from the user's Start Workout tap.
    const played = await playAudio();
    if (!played) {
      toast("Workout started, but music could not play. Check the player.");
    }
  }

  updateWorkoutDisplay();
  toast("Workout started. Go at your own pace.");
}

function pauseWorkout() {
  if (!workout.active) return;

  if (!workout.paused) {
    workout.elapsed = Math.floor((Date.now() - workout.startedAt) / 1000);
    workout.paused = true;
    pauseAudio();
  } else {
    workout.paused = false;
    workout.startedAt = Date.now() - workout.elapsed * 1000;

    if ($("#workoutMusic").checked && workout.trackIndex >= 0) {
      playAudio();
    }
  }

  updateWorkoutDisplay();
}

function endWorkout(completed = false) {
  if (!workout.active) return;

  workout.elapsed = Math.min(
    workout.duration,
    Math.floor(workout.paused
      ? workout.elapsed
      : (Date.now() - workout.startedAt) / 1000)
  );

  if (completed && workout.elapsed < workout.duration) {
    // A manual Finish saves the actual elapsed duration.
  }

  if (workout.elapsed > 0) {
    state.workoutHistory.push({
      date: todayKey(),
      seconds: workout.elapsed,
      completed,
      timestamp: new Date().toISOString()
    });

    // Keep the local history small.
    state.workoutHistory = state.workoutHistory.slice(-100);
    saveState();
  }

  workout.active = false;
  workout.paused = false;

  // Stop workout playback; do not unexpectedly restart earlier audio.
  pauseAudio();

  updateWorkoutDisplay();
  renderExercise();
  renderHome();

  toast(completed ? "Workout duration reached!" : "Workout finished.");
}

$("#startWorkout").addEventListener("click", startWorkout);
$("#pauseWorkout").addEventListener("click", pauseWorkout);
$("#endWorkout").addEventListener("click", () => endWorkout(false));

$("#workoutMusic").addEventListener("change", event => {
  state.settings.workoutMusic = event.target.checked;
  $("#settingsWorkoutMusic").checked = event.target.checked;
  saveState();

  if (workout.active) {
    if (!event.target.checked) {
      pauseAudio();
    } else if (workout.trackIndex >= 0 && !workout.paused) {
      playAudio();
    } else if (event.target.checked && !playlist.length) {
      toast("Select a song for workout music.");
    }
  }
});

/* =========================================
   EDITABLE TIMETABLE
========================================= */

function sortedTimetable() {
  return [...state.timetable].sort((a, b) =>
    a.start.localeCompare(b.start)
  );
}

function renderTimetable() {
  const container = $("#timetableList");
  container.replaceChildren();

  sortedTimetable().forEach(activity => {
    const row = document.createElement("div");
    row.className = "timetable-item";

    const time = document.createElement("div");
    time.className = "activity-time";
    time.textContent =
      formatClockTime(activity.start) + "\n–\n" +
      formatClockTime(activity.end);
    time.style.whiteSpace = "pre-line";

    const main = document.createElement("div");
    main.className = "activity-main";

    const name = document.createElement("strong");
    name.textContent = activity.name;

    const tag = document.createElement("span");
    tag.className = "category-tag";
    tag.textContent = activity.category || "Routine";

    const actions = document.createElement("div");
    actions.className = "activity-actions";

    const edit = document.createElement("button");
    edit.textContent = "Edit";
    edit.addEventListener("click", () => openActivityEditor(activity));

    const remove = document.createElement("button");
    remove.textContent = "Delete";
    remove.addEventListener("click", () => {
      if (!confirmAction("Delete this activity from your timetable?")) return;
      state.timetable = state.timetable.filter(item => item.id !== activity.id);
      saveState();
      renderTimetable();
      toast("Activity deleted.");
    });

    actions.append(edit, remove);
    main.append(name, tag, actions);
    row.append(time, main);
    container.appendChild(row);
  });

  if (!state.timetable.length) {
    container.innerHTML = '<div class="empty-state">No activities yet. Tap Add to create your routine.</div>';
  }
}

function openActivityEditor(activity = null) {
  $("#activityEditor").classList.remove("hidden");
  $("#activityEditorTitle").textContent = activity ? "Edit activity" : "Add activity";

  $("#activityId").value = activity?.id || "";
  $("#activityName").value = activity?.name || "";
  $("#activityStart").value = activity?.start || "07:00";
  $("#activityEnd").value = activity?.end || "07:30";
  $("#activityCategory").value = activity?.category || "Routine";

  $("#activityEditor").scrollIntoView({ behavior: "smooth", block: "start" });
}

$("#addActivity").addEventListener("click", () => openActivityEditor());
$("#cancelActivity").addEventListener("click", () => {
  $("#activityEditor").classList.add("hidden");
});

$("#activityForm").addEventListener("submit", event => {
  event.preventDefault();

  const id = $("#activityId").value || makeId();
  const name = $("#activityName").value.trim();
  const start = $("#activityStart").value;
  const end = $("#activityEnd").value;
  const category = $("#activityCategory").value;

  if (!name || !start || !end) {
    toast("Fill in all activity details.");
    return;
  }

  if (start === end) {
    toast("Start and end times cannot be the same.");
    return;
  }

  const activity = { id, name, start, end, category };
  const index = state.timetable.findIndex(item => item.id === id);

  if (index >= 0) state.timetable[index] = activity;
  else state.timetable.push(activity);

  saveState();
  renderTimetable();
  $("#activityEditor").classList.add("hidden");
  toast("Timetable saved.");
});

$("#restoreTimetable").addEventListener("click", () => {
  if (!confirmAction("Restore the suggested timetable? Your current timetable will be replaced.")) {
    return;
  }

  state.timetable = clone(DEFAULT_TIMETABLE);
  saveState();
  renderTimetable();
  toast("Default timetable restored.");
});

/* =========================================
   NDA PREPARATION
========================================= */

function renderNDA() {
  const chapters = state.nda.chapters[ndaSubject] || [];

  $("#ndaSubjectTitle").textContent = ndaSubject + " Chapters";
  $("#ndaNotes").value = state.nda.notes || "";
  $("#ndaMathTarget").value = state.nda.targets.maths;
  $("#ndaGatTarget").value = state.nda.targets.gat;

  const all = Object.values(state.nda.chapters).flat();
  const percent = progressPercent(all);

  $("#ndaProgress").textContent = percent + "%";
  $("#ndaProgressBar").style.width = percent + "%";

  const container = $("#ndaChapterList");
  container.replaceChildren();

  chapters.forEach(chapter => {
    const row = document.createElement("div");
    row.className = "chapter-item" + (chapter.done ? " completed" : "");

    const check = document.createElement("input");
    check.type = "checkbox";
    check.checked = !!chapter.done;
    check.setAttribute("aria-label", "Complete " + chapter.name);

    check.addEventListener("change", () => {
      chapter.done = check.checked;
      saveState();
      renderNDA();
      renderHome();
    });

    const details = document.createElement("div");
    details.className = "chapter-details";

    const title = document.createElement("strong");
    title.textContent = chapter.name;

    const status = document.createElement("small");
    status.textContent = chapter.done ? "Completed" : "Pending revision";

    details.append(title, status);

    const remove = document.createElement("button");
    remove.className = "delete-mini";
    remove.textContent = "✕";
    remove.setAttribute("aria-label", "Delete chapter");
    remove.addEventListener("click", () => {
      if (!confirmAction("Delete chapter: " + chapter.name + "?")) return;

      state.nda.chapters[ndaSubject] =
        state.nda.chapters[ndaSubject].filter(item => item.id !== chapter.id);

      saveState();
      renderNDA();
      renderHome();
    });

    row.append(check, details, remove);
    container.appendChild(row);
  });

  $$(".study-subnav [data-nda-tab]").forEach(button => {
    button.classList.toggle("active", button.dataset.ndaTab === ndaSubject);
  });

  renderResources();
}

$$("[data-nda-tab]").forEach(button => {
  button.addEventListener("click", () => {
    ndaSubject = button.dataset.ndaTab;
    renderNDA();
  });
});

$("#addNdaChapter").addEventListener("click", () => {
  const name = window.prompt("Enter the chapter name:");
  if (!name || !name.trim()) return;

  state.nda.chapters[ndaSubject].push({
    id: makeId(),
    name: name.trim(),
    done: false
  });

  saveState();
  renderNDA();
  renderHome();
  toast("Chapter added.");
});

$("#saveNdaNotes").addEventListener("click", () => {
  state.nda.notes = $("#ndaNotes").value;
  saveState();
  toast("NDA notes saved.");
});

$("#saveNdaTargets").addEventListener("click", () => {
  const maths = Number($("#ndaMathTarget").value);
  const gat = Number($("#ndaGatTarget").value);

  if (![maths, gat].every(value =>
    Number.isInteger(value) && value >= 0 && value <= 300
  )) {
    toast("Targets must be between 0 and 300 minutes.");
    return;
  }

  state.nda.targets = { maths, gat };
  saveState();
  toast("Study targets saved.");
});

$("#ndaResourceForm").addEventListener("submit", event => {
  event.preventDefault();

  const name = $("#resourceName").value.trim();
  const urlText = $("#resourceUrl").value.trim();

  try {
    const url = new URL(urlText);
    if (!["https:", "http:"].includes(url.protocol)) throw new Error();

    state.nda.resources.push({ id: makeId(), name, url: url.href });
    saveState();

    $("#resourceName").value = "";
    $("#resourceUrl").value = "";

    renderResources();
    toast("Resource added.");
  } catch {
    toast("Enter a valid HTTP or HTTPS link.");
  }
});

function renderResources() {
  const container = $("#ndaResources");
  container.replaceChildren();

  if (!state.nda.resources.length) {
    container.innerHTML = '<p class="tiny muted">No saved resources yet.</p>';
    return;
  }

  state.nda.resources.forEach(resource => {
    const row = document.createElement("div");
    row.className = "resource-item";

    const link = document.createElement("a");
    link.href = resource.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = resource.name;

    const remove = document.createElement("button");
    remove.textContent = "Delete";
    remove.addEventListener("click", () => {
      state.nda.resources = state.nda.resources.filter(item => item.id !== resource.id);
      saveState();
      renderResources();
    });

    row.append(link, remove);
    container.appendChild(row);
  });
}

/* =========================================
   11TH PUC PCMC
========================================= */

function renderPUC() {
  const chapters = state.puc.chapters[pucSubject] || [];

  $("#pucSubjectTitle").textContent = pucSubject;
  $("#pucNotes").value = state.puc.notes[pucSubject] || "";

  const container = $("#pucChapterList");
  container.replaceChildren();

  chapters.forEach(chapter => {
    const row = document.createElement("div");
    row.className = "chapter-item" + (chapter.done ? " completed" : "");

    const check = document.createElement("input");
    check.type = "checkbox";
    check.checked = !!chapter.done;
    check.setAttribute("aria-label", "Complete " + chapter.name);

    check.addEventListener("change", () => {
      chapter.done = check.checked;
      saveState();
      renderPUC();
      renderHome();
    });

    const details = document.createElement("div");
    details.className = "chapter-details";

    const title = document.createElement("strong");
    title.textContent = chapter.name;

    const status = document.createElement("small");
    status.textContent = chapter.done ? "Completed" : "Pending revision";

    details.append(title, status);

    const remove = document.createElement("button");
    remove.className = "delete-mini";
    remove.textContent = "✕";
    remove.setAttribute("aria-label", "Delete chapter");

    remove.addEventListener("click", () => {
      if (!confirmAction("Delete this chapter?")) return;
      state.puc.chapters[pucSubject] =
        state.puc.chapters[pucSubject].filter(item => item.id !== chapter.id);
      saveState();
      renderPUC();
      renderHome();
    });

    row.append(check, details, remove);
    container.appendChild(row);
  });

  $$(".puc-subnav [data-puc-subject]").forEach(button => {
    button.classList.toggle("active", button.dataset.pucSubject === pucSubject);
  });

  const overview = $("#pucOverview");
  overview.replaceChildren();

  Object.entries(state.puc.chapters).forEach(([subject, list]) => {
    const row = document.createElement("div");
    row.style.marginBottom = "13px";

    const top = document.createElement("div");
    top.style.display = "flex";
    top.style.justifyContent = "space-between";
    top.style.gap = "8px";
    top.style.fontSize = "11px";
    top.style.marginBottom = "6px";

    const title = document.createElement("span");
    title.textContent = subject;

    const percent = document.createElement("strong");
    percent.textContent = progressPercent(list) + "%";
    percent.style.color = "var(--gold)";

    const track = document.createElement("div");
    track.className = "progress-track";

    const fill = document.createElement("div");
    fill.className = "progress-fill";
    fill.style.width = progressPercent(list) + "%";

    top.append(title, percent);
    track.appendChild(fill);
    row.append(top, track);
    overview.appendChild(row);
  });
}

$$("[data-puc-subject]").forEach(button => {
  button.addEventListener("click", () => {
    pucSubject = button.dataset.pucSubject;
    renderPUC();
  });
});

$("#addPucChapter").addEventListener("click", () => {
  const name = window.prompt("Enter the chapter name for " + pucSubject + ":");
  if (!name || !name.trim()) return;

  state.puc.chapters[pucSubject].push({
    id: makeId(),
    name: name.trim(),
    done: false
  });

  saveState();
  renderPUC();
  renderHome();
  toast("Chapter added.");
});

$("#savePucNotes").addEventListener("click", () => {
  state.puc.notes[pucSubject] = $("#pucNotes").value;
  saveState();
  toast(pucSubject + " notes saved.");
});

/* =========================================
   NOTES AND REMINDERS
========================================= */

function clearNoteForm() {
  $("#noteId").value = "";
  $("#noteTitle").value = "";
  $("#noteCategory").value = "Study";
  $("#noteBody").value = "";
}

$("#noteForm").addEventListener("submit", event => {
  event.preventDefault();

  const id = $("#noteId").value;
  const title = $("#noteTitle").value.trim();
  const category = $("#noteCategory").value;
  const body = $("#noteBody").value.trim();

  if (!title || !body) {
    toast("Enter a title and note.");
    return;
  }

  const existing = state.notes.find(note => note.id === id);

  if (existing) {
    existing.title = title;
    existing.category = category;
    existing.body = body;
    existing.updatedAt = new Date().toISOString();
  } else {
    state.notes.unshift({
      id: makeId(),
      title,
      category,
      body,
      createdAt: new Date().toISOString()
    });
  }

  saveState();
  clearNoteForm();
  renderNotes();
  toast("Note saved.");
});

$("#clearNoteForm").addEventListener("click", clearNoteForm);

function renderNotes() {
  const container = $("#notesList");
  container.replaceChildren();
  $("#noteCount").textContent = state.notes.length + " notes";

  if (!state.notes.length) {
    container.innerHTML = '<div class="empty-state">No notes yet. Create your first note above.</div>';
    return;
  }

  state.notes.forEach(note => {
    const card = document.createElement("article");
    card.className = "note-card";

    const tag = document.createElement("span");
    tag.className = "category-tag";
    tag.textContent = note.category;

    const title = document.createElement("h3");
    title.textContent = note.title;

    const body = document.createElement("p");
    body.textContent = note.body;

    const date = document.createElement("small");
    date.className = "tiny";
    date.textContent = note.updatedAt
      ? "Updated " + new Date(note.updatedAt).toLocaleDateString("en-IN")
      : "Saved " + new Date(note.createdAt).toLocaleDateString("en-IN");

    const actions = document.createElement("div");
    actions.className = "note-actions";

    const edit = document.createElement("button");
    edit.textContent = "Edit";
    edit.addEventListener("click", () => {
      $("#noteId").value = note.id;
      $("#noteTitle").value = note.title;
      $("#noteCategory").value = note.category;
      $("#noteBody").value = note.body;
      $("#noteForm").scrollIntoView({ behavior: "smooth" });
      $("#noteTitle").focus();
    });

    const remove = document.createElement("button");
    remove.textContent = "Delete";
    remove.addEventListener("click", () => {
      if (!confirmAction("Delete this note permanently?")) return;
      state.notes = state.notes.filter(item => item.id !== note.id);
      saveState();
      renderNotes();
      toast("Note deleted.");
    });

    actions.append(edit, remove);
    card.append(tag, title, body, date, actions);
    container.appendChild(card);
  });
}

/* =========================================
   FOCUS TIMER
========================================= */

function updateFocusDisplay() {
  $("#focusClock").textContent = formatTime(focus.remaining);

  $("#focusStatus").textContent = focus.active
    ? "FOCUS IN PROGRESS"
    : focus.paused
      ? "SESSION PAUSED"
      : focus.remaining === 0
        ? "SESSION COMPLETE"
        : "READY TO FOCUS";

  $("#focusStart").disabled = focus.active;
  $("#focusPause").disabled = !focus.active && !focus.paused;
  $("#focusPause").textContent = focus.paused ? "▶ Resume" : "Ⅱ Pause";
  $("#focusReset").disabled = false;
}

function startFocus() {
  if (focus.remaining <= 0) {
    focus.duration = Number($("#focusDuration").value) * 60;
    focus.remaining = focus.duration;
  }

  focus.active = true;
  focus.paused = false;
  focus.deadline = Date.now() + focus.remaining * 1000;

  updateFocusDisplay();
  toast("Focus session started.");
}

function pauseFocus() {
  if (focus.active) {
    focus.remaining = Math.max(
      0,
      Math.ceil((focus.deadline - Date.now()) / 1000)
    );
    focus.active = false;
    focus.paused = true;
  } else if (focus.paused) {
    startFocus();
    return;
  }

  updateFocusDisplay();
}

function resetFocus() {
  focus.active = false;
  focus.paused = false;
  focus.duration = Number($("#focusDuration").value) * 60;
  focus.remaining = focus.duration;
  updateFocusDisplay();
}

$("#focusDuration").addEventListener("change", () => {
  if (!focus.active) resetFocus();
});

$("#focusStart").addEventListener("click", startFocus);
$("#focusPause").addEventListener("click", pauseFocus);
$("#focusReset").addEventListener("click", resetFocus);

/* =========================================
   CHATGPT HANDOFF
========================================= */

$("#askChatGPT").addEventListener("click", () => {
  const question = $("#aiQuestion").value.trim();

  if (!question) {
    toast("Type a question first.");
    $("#aiQuestion").focus();
    return;
  }

  const fullPrompt =
    "I am preparing for NDA-2 2027 alongside 11th PUC PCMC. " +
    "Teach me in simple Hinglish, step by step, starting from basics. " +
    "Use examples and practice questions. My question: " + question;

  const url = "https://chatgpt.com/?q=" + encodeURIComponent(fullPrompt);

  const opened = window.open(url, "_blank", "noopener,noreferrer");

  if (!opened) {
    // Fallback for browsers that block new tabs.
    window.location.href = url;
  }

  toast("ChatGPT opened. Submit your question there if prompted.");
});

/* =========================================
   SETTINGS, BACKUP AND LOCAL DATA
========================================= */

function renderSettings() {
  updateProfileDisplay();

  const container = $("#settingsProgress");
  container.replaceChildren();

  const groups = [
    ["NDA Maths", state.nda.chapters.Maths],
    ["NDA GAT", state.nda.chapters.GAT],
    ...Object.entries(state.puc.chapters)
  ];

  groups.forEach(([name, chapters]) => {
    const line = document.createElement("p");
    line.style.fontSize = "12px";
    line.textContent = name + ": " +
      completedCount(chapters) + "/" + chapters.length + " chapters";
    container.appendChild(line);
  });

  const workoutLine = document.createElement("p");
  workoutLine.style.fontSize = "12px";
  workoutLine.textContent = "Workout sessions: " + state.workoutHistory.length;
  container.appendChild(workoutLine);

  $("#themeSelect").value = state.theme;
  $("#settingsRepeat").checked = state.settings.repeat;
  $("#settingsWorkoutMusic").checked = state.settings.workoutMusic;
}

$("#exportBackup").addEventListener("click", () => {
  try {
    const backup = {
      app: "SHAURYAM",
      version: 1,
      exportedAt: new Date().toISOString(),
      data: state
    };

    const blob = new Blob(
      [JSON.stringify(backup, null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "shauryam-backup-" + todayKey() + ".json";
    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast("Backup export requested.");
  } catch (error) {
    console.error(error);
    toast("Could not export backup.");
  }
});

$("#importBackupButton").addEventListener("click", () => {
  $("#importBackupFile").click();
});

$("#importBackupFile").addEventListener("change", async event => {
  const file = event.target.files[0];
  event.target.value = "";

  if (!file) return;

  try {
    if (file.size > 5 * 1024 * 1024) {
      toast("Backup file is too large.");
      return;
    }

    const parsed = JSON.parse(await file.text());
    const imported = parsed.data || parsed;

    if (
      !imported ||
      typeof imported !== "object" ||
      !Array.isArray(imported.timetable) ||
      !Array.isArray(imported.notes) ||
      !imported.nda ||
      !imported.puc
    ) {
      toast("This does not look like a SHAURYAM backup.");
      return;
    }

    if (!confirmAction("Import this backup? Your current saved data will be replaced.")) {
      return;
    }

    // Reuse the normal state loader's default structure for missing fields.
    state = {
      ...clone(DEFAULT_STATE),
      ...imported,
      settings: { ...DEFAULT_STATE.settings, ...(imported.settings || {}) },
      missions: imported.missions || {},
      exerciseChecks: imported.exerciseChecks || {},
      workoutHistory: Array.isArray(imported.workoutHistory) ? imported.workoutHistory : [],
      timetable: imported.timetable,
      notes: imported.notes,
      nda: {
        ...clone(DEFAULT_STATE.nda),
        ...imported.nda,
        chapters: {
          ...clone(DEFAULT_STATE.nda.chapters),
          ...(imported.nda.chapters || {})
        },
        targets: {
          ...DEFAULT_STATE.nda.targets,
          ...(imported.nda.targets || {})
        },
        resources: Array.isArray(imported.nda.resources) ? imported.nda.resources : []
      },
      puc: {
        ...clone(DEFAULT_STATE.puc),
        ...imported.puc,
        chapters: {
          ...clone(DEFAULT_STATE.puc.chapters),
          ...(imported.puc.chapters || {})
        },
        notes: imported.puc.notes || {}
      }
    };

    if (!saveState()) return;

    setTheme(state.theme);
    $("#settingsRepeat").checked = state.settings.repeat;
    $("#settingsWorkoutMusic").checked = state.settings.workoutMusic;
    $("#workoutMusic").checked = state.settings.workoutMusic;

    updateProfileDisplay();
    renderScreen(currentScreen);
    renderHome();

    toast("Backup imported.");
  } catch (error) {
    console.error(error);
    toast("Could not read this backup file.");
  }
});

$("#signOut").addEventListener("click", () => {
  if (!confirmAction("Sign out of this local profile? Your saved data will remain on this device.")) {
    return;
  }

  state.name = "";
  saveState();

  $("#nameInput").value = "";
  $("#nameModalTitle").textContent = "What should we call you?";
  $("#nameModal").classList.remove("hidden");
  $("#nameInput").focus();
});

$("#resetData").addEventListener("click", () => {
  if (!confirmAction("Reset ALL SHAURYAM data on this browser? This cannot be undone. Export a backup first if needed.")) {
    return;
  }

  if (!confirmAction("Final confirmation: permanently delete your saved profile, timetable, notes and progress?")) {
    return;
  }

  audio.pause();
  audio.removeAttribute("src");
  audio.load();

  if (currentAudioURL) URL.revokeObjectURL(currentAudioURL);
  currentAudioURL = null;
  playlist = [];
  currentTrack = -1;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn(error);
  }

  state = clone(DEFAULT_STATE);

  workout = {
    active: false,
    paused: false,
    elapsed: 0,
    duration: 900,
    startedAt: 0,
    savedAudioTime: 0,
    wasPlaying: false,
    trackIndex: -1
  };

  resetFocus();
  setTheme("navy");

  $("#nameInput").value = "";
  $("#nameModal").classList.remove("hidden");

  renderHome();
  renderPlaylist();
  renderExercise();
  renderTimetable();
  renderNDA();
  renderPUC();
  renderNotes();
  renderSettings();
  updateWorkoutSongOptions();
  updateWorkoutDisplay();

  toast("Local data reset.");
});

/* =========================================
   CENTRAL TICKER
   One lightweight interval for both timers.
========================================= */

setInterval(() => {
  if (workout.active && !workout.paused) {
    workout.elapsed = Math.floor((Date.now() - workout.startedAt) / 1000);

    if (workout.elapsed >= workout.duration) {
      workout.elapsed = workout.duration;
      endWorkout(true);
    } else {
      updateWorkoutDisplay();
    }
  }

  if (focus.active) {
    focus.remaining = Math.max(
      0,
      Math.ceil((focus.deadline - Date.now()) / 1000)
    );

    if (focus.remaining <= 0) {
      focus.remaining = 0;
      focus.active = false;
      focus.paused = false;
      updateFocusDisplay();
      toast("Focus session complete. Take a short break.");
    } else {
      updateFocusDisplay();
    }
  }
}, 1000);

/* =========================================
   INITIALISE
========================================= */

updateRepeatButton();
updateWorkoutSongOptions();
startApp();