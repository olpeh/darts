import * as SETTINGS from "./Settings";
import utils from "./utils";
import Arrow from "./Arrow";
import SimpleBoard from "./SimpleBoard";

import landscape_bg from "./../img/landscape_bg.jpg";
import portrait_bg from "./../img/portrait_bg.jpg";

const PORTRAIT = "portrait";
const LANDSCAPE = "landscape";

const DEFAULT_TRACKER = {
  x: 0,
  y: 0,
  start: 0,
  set: false,
};

export default function Game(canvasId) {
  this.canvas = document.getElementById(canvasId);
  this.ctx = canvas.getContext("2d");
  this.Arrow = null;
  this.Board = null;
  this.Paused = true;
  this.background = {
    portrait: null,
    landscape: null,
  };
  this.startTime = 0;
  this.tracker = {};

  this.isPaused = () => this.Paused;

  this.init = () => {
    this.Board = new SimpleBoard(SETTINGS.BOARD_DEFAULT);
    this.Arrow = new Arrow(SETTINGS.ARROW_DEFAULT);
    this.Arrow.loadArrowImages();

    this.background.portrait = new Image();
    this.background.portrait.src = portrait_bg;

    this.background.landscape = new Image();
    this.background.landscape.src = landscape_bg;

    Object.assign(this.tracker, DEFAULT_TRACKER);

    this.setSize();
    addEventListener("resize", this.setSize);
  };

  this.stopBoardMovement = () => this.Board.stopMove();

  this.startBoardMovement = () => {
    this.startTime = new Date().getTime();
    this.Board.startMove();
  };

  this.play = () => {
    this.Paused = false;
    Object.assign(this.tracker, DEFAULT_TRACKER);
    this.setArrowPosition();
    this.Arrow.set();
  };

  this.pause = () => {
    this.clearRect;
    this.Paused = true;
    this.Arrow.hide();
  };

  this.startThrow = (e) => {
    if (this.tracker.set || this.Arrow.hasTarget() || this.Paused) return;

    this.tracker.set = true;
    this.tracker.x = e.clientX || e.changedTouches[0].clientX;
    this.tracker.y = e.clientY || e.changedTouches[0].clientY;
    this.tracker.start = new Date().getTime();
  };

  this.endThrow = (e) => {
    if (this.Arrow.hasTarget() || !this.tracker.set || this.Paused)
      return false;

    const x = e.clientX || e.changedTouches[0].clientX;
    const y = e.clientY || e.changedTouches[0].clientY;

    const distanceX = x - this.tracker.x;
    const distanceY = y - this.tracker.y;
    const endtime = new Date().getTime();
    const duration = endtime - this.tracker.start;

    const durationAmplifier = duration / SETTINGS.SWIPE_DURATION_BASE_MS;

    const directDistance = Math.abs(
      utils.distance(x, y, this.tracker.x, this.tracker.y)
    );

    // check if the swipe has a minimal distance
    if (directDistance < innerHeight * SETTINGS.MIN_DISTANCE) {
      Object.assign(this.tracker, DEFAULT_TRACKER);
      return false;
    }

    // calculate the endpoint
    const target = {
      x: this.Arrow.x + SETTINGS.DISTANCE_AMPLIFIER_X * distanceX,
      y:
        this.Arrow.y +
        SETTINGS.DISTANCE_AMPLIFIER_Y * distanceY -
        durationAmplifier * distanceY,
    };

    // ask the scoreboard what points this target gives
    const score = this.Board.setTarget(target);
    this.Arrow.setTarget(target);

    this.Paused = true;
    return score;
  };

  this.drawBackground = () => {
    // landscape or portrait
    const mode = innerHeight > innerWidth ? PORTRAIT : LANDSCAPE;

    const bgWidth =
      mode === PORTRAIT
        ? SETTINGS.BG_PORTRAIT_WIDTH
        : SETTINGS.BG_LANDSCAPE_WIDTH;
    const bgHeight =
      mode === PORTRAIT
        ? SETTINGS.BG_PORTRAIT_HEIGHT
        : SETTINGS.BG_LANDSCAPE_HEIGHT;

    const scale = Math.max(innerWidth / bgWidth, innerHeight / bgHeight);
    const x = innerWidth / 2 - (bgWidth / 2) * scale;
    const y = innerHeight / 2 - (bgHeight / 2) * scale;

    this.ctx.drawImage(
      mode === PORTRAIT ? this.background.portrait : this.background.landscape,
      x,
      y,
      bgWidth * scale,
      bgHeight * scale
    );
  };

  this.setSize = () => {
    this.canvas.width = innerWidth;
    this.canvas.height = innerHeight;

    this.setBackground();
    this.setBoardPosition();
    this.setArrowPosition();
  };

  this.setBoardPosition = () => {
    const r = innerHeight * SETTINGS.BOARD_RADIUS_SCALE;
    const x = innerWidth * SETTINGS.BOARD_X_OFFSET;
    const y = r + innerHeight * SETTINGS.BOARD_Y_OFFSET;

    this.Board.setRadius(r);
    this.Board.setPosition(x, y);
    this.Arrow.setBoardPosition(x, y);
  };

  this.setArrowPosition = () => {
    const x = innerWidth * SETTINGS.ARROW_X_OFFSET;
    const y = innerHeight * SETTINGS.ARROW_Y_OFFSET;
    const scale = (innerHeight / SETTINGS.ARROW_HEIGHT) * SETTINGS.ARROW_SCALE;
    this.Arrow.setScale(scale);
    this.Arrow.setPosition(x, y);
  };

  this.setBackground = () => {
    this.ctx.fillStyle = "#d7e7ef";
    this.ctx.fillRect(0, 0, innerWidth, innerHeight);
  };

  this.draw = () => {
    const time = new Date().getTime() - this.startTime;
    this.ctx.clearRect(0, 0, innerWidth, innerHeight);
    this.drawBackground();

    this.Board.draw(this.ctx, time);
    this.Arrow.draw(this.ctx, time);
  };
}
