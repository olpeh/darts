import Game from "./js/Game";
import { ENCRYPTION_ENABLE } from "./js/Settings";

import "./js/helpsystem.js";
import "./js/animate.js";
import "./style.css";

const STATE_IDLE = 10;
const STATE_PRACTICE_THROW_START = 11;
const STATE_PRACTICE_THROW_FINISHED = 12;
const STATE_PLAYING_THROW_START = 13;
const STATE_PLAYING_THROW_FINISHED = 14;

let Score = 0;
let PractiseScore = 0;
let PractiseArrows = 0;
let Arrows = 3;
let PracticeMode = false;
const Darts = new Game("canvas");

const loadingbox = document.getElementById("loading");
const controlsBox = document.getElementById("controls");
let scoreBoardUrl = "http://aslaksen.bcc.no/";

const totalScoreCount = document.getElementById("totalScoreCount");
const scoreLabel = document.getElementById("scoreLabel");
const buttons = document.getElementById("buttons");
const practiceModeBtn = document.getElementById("practiceModeBtn");
const menuBtn = document.getElementById("returnBtn");
const homeBtn = document.getElementById("homeBtn");
const scoreBoardBtn = document.getElementById("scoreBoardBtn");
const playBtn = document.getElementById("playBtn");
const playBtnWrapper = document.getElementById("playBtnWrapper");
const arrowCounter = document.getElementById("arrowCounterSpan");

function setState(state) {
  switch (state) {
    case STATE_PRACTICE_THROW_START:
      PracticeMode = true;
      buttons.classList.add("hide");
      menuBtn.classList.add("show");
      homeBtn.classList.remove("show");

      Darts.play();
      break;
    case STATE_PRACTICE_THROW_FINISHED:
      Darts.play();
      break;
    case STATE_PLAYING_THROW_START:
      PracticeMode = false;

      menuBtn.classList.add("show");
      homeBtn.classList.remove("show");
      buttons.classList.add("hide");
      Darts.play();
      break;
    case STATE_PLAYING_THROW_FINISHED:
      if (Arrows === 0) {
        setState(STATE_IDLE);
      } else {
        setState(STATE_PLAYING_THROW_START);
      }
      break;
    case STATE_IDLE:
      Darts.pause();
      Darts.stopBoardMovement();
      endPractice();

      menuBtn.classList.remove("show");
      homeBtn.classList.add("show");
      buttons.classList.remove("hide");

      if (Arrows <= 0) {
        playBtnWrapper.classList.add("hide");
      } else {
        playBtnWrapper.classList.remove("hide");
      }

      break;
  }

  setUI();
}

playBtn.addEventListener("click", startPlay);
playBtn.addEventListener("touchstart", startPlay);
function startPlay(e) {
  Darts.startBoardMovement();
  if (Arrows < 1) {
    return false;
  }
  setState(STATE_PLAYING_THROW_START);
  e.preventDefault();
  e.stopPropagation();
}

practiceModeBtn.addEventListener("click", startPractice);
practiceModeBtn.addEventListener("touchstart", startPractice);
function startPractice(e) {
  Darts.startBoardMovement();
  setState(STATE_PRACTICE_THROW_START);
  e.preventDefault();
  e.stopPropagation();
}

function endPractice() {
  PractiseScore = 0;
  PractiseArrows = 0;
  PracticeMode = false;
}

menuBtn.addEventListener("click", clickMenu);
menuBtn.addEventListener("touchstart", clickMenu);
function clickMenu(e) {
  setState(STATE_IDLE);
  e.preventDefault();
  e.stopPropagation();
}

homeBtn.addEventListener("click", clickHome);
homeBtn.addEventListener("touchstart", clickHome);
function clickHome(e) {
  window.location.href = window.homeUrl || "http://aslaksen.bcc.no/";
  e.preventDefault();
  e.stopPropagation();
}

scoreBoardBtn.addEventListener("click", navigateToScoreBoard);
scoreBoardBtn.addEventListener("touchstart", navigateToScoreBoard);
function navigateToScoreBoard(e) {
  window.location.href = scoreBoardUrl;
  e.preventDefault();
  e.stopPropagation();
}

function setUI() {
  scoreLabel.innerText = PracticeMode ? "Practice score" : "Total score";
  totalScoreCount.innerText = PracticeMode ? PractiseScore : Score;
  arrowCounter.innerHTML = PracticeMode ? PractiseArrows : Arrows;
}

function handleThrowStart(e) {
  if (!e.isTrusted) return;
  Darts.startThrow(e);
}

function handleThrowEnd(e) {
  if (!e.isTrusted || Darts.isPaused()) return;

  const points = Darts.endThrow(e);

  if (points === false) {
    return;
  }

  if (!PracticeMode) {
    sendPoints(points, Score);
    return;
  }

  PractiseScore += points;
  PractiseArrows++;

  setTimeout(function () {
    setState(STATE_PRACTICE_THROW_FINISHED);
  }, 500);
}

function animate() {
  Darts.draw();
  requestAnimFrame(animate);
}

const helpText = document.getElementById("helpText");
function setHelpText(text) {
  helpText.innerText = text;
}

function init(data) {
  Arrows = data.arrowsLeft;
  setHelpText(data.help);
  scoreBoardUrl = data.leaderboard;
  Score = data.totalScore;

  Darts.init();
  Darts.startBoardMovement();
  document.addEventListener("mousedown", handleThrowStart, false);
  document.addEventListener("touchmove", handleThrowStart, false);
  document.addEventListener("mouseup", handleThrowEnd, false);
  document.addEventListener("touchend", handleThrowEnd, false);

  const parameters = new URL(document.location).searchParams;

  if (parameters.get("practice")) {
    setState(STATE_PRACTICE_THROW_START);
  } else {
    setState(STATE_IDLE);
  }

  controlsBox.classList.remove("hide");
  animate();
  setTimeout(() => {
    loadingbox.classList.add("hide");
  }, 500);
}

function crypt(data) {
  const body = JSON.stringify(data);
  if (!ENCRYPTION_ENABLE) {
    return body;
  }

  const CryptoJS = require("crypto-js");
  const key = CryptoJS.enc.Hex.parse(CryptoJS.MD5(window.WPNounce).toString());
  const iv = CryptoJS.enc.Hex.parse("abcdef9876543210abcdef9876543210");
  const encrypted = CryptoJS.AES.encrypt(body, key, {
    iv,
    padding: CryptoJS.pad.ZeroPadding,
  });

  return encrypted.toString();
}

function sendPoints(points, score) {
  fetch(`${window.sendApi}?_wpnonce=${window.WPNounce}`, {
    method: "POST",
    body: crypt({ p: points, s: score }),
  })
    .then((r) => {
      if (r.status !== 200) {
        throw new Error();
      }
      return r.json();
    })
    .then((data) => {
      Score = data.score;
      Arrows = data.arrows;
      setState(STATE_PLAYING_THROW_FINISHED);
    })
    .catch(gameError);
}

function gameError(e) {
  loadingbox.classList.add("error");
  console.log(e);
}

// check for IE
if (!!window.MSInputMethodContext && !!document.documentMode) {
  gameError();
} else {
  if (process.env.NODE_ENV === "production") {
    fetch(`${window.initApi}?_wpnonce=${window.WPNounce}`, {
      headers: {
        "content-type": "application/json",
      },
    })
      .then((r) => {
        if (r.status !== 200) {
          throw new Error();
        }
        return r.json();
      })
      .then((data) => init(data))
      .catch(gameError);
  } else {
    init({
      arrowsLeft: 3,
      totalScore: 0,
      leaderboard: "http://aslaksen.bcc.no/scoreboard/",
      help: "This is the help message which will going to be updated soon!",
    });
  }
}
