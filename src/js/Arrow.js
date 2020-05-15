import arrowImages from "./darts";
import * as SETTINGS from "./Settings";
import { wave } from "./utils";

export default function Arrow(settings) {
  this.settings = settings;
  this.x = settings.x;
  this.y = settings.y;
  this.scale = settings.scale;
  this.image = settings.image;
  this.amplitude = settings.amplitude;
  this.period = settings.period;

  // gets updated every drawcycle
  this.time = 0;

  this.shown = false;
  this.targetIsSet = false;
  this.target = null;
  this.targetSetAt = false;
  this.animationStep = 0;
  this.frames = [];
  this.xSpeed = 0;
  this.ySpeed = 0;

  // the position for the board is needed to move the arrow on the board once its hit
  this.BoardX = 0;
  this.BoardY = 0;

  this.hide = () => {
    this.shown = false;
  };

  this.set = () => {
    this.shown = true;
    this.targetIsSet = false;
    this.target = null;
    this.targetSetAt = false;
    this.animationStep = 0;
    this.xSpeed = 0;
    this.ySpeed = 0;
  };

  this.setBoardPosition = (x, y) => {
    this.BoardX = x;
    this.BoardY = y;
  };

  this.setPosition = (x, y) => {
    this.x = x;
    this.y = y;
  };

  this.loadArrowImages = () => {
    for (let frame in arrowImages) {
      const img = new Image();
      img.src = arrowImages[frame];
      this.frames.push(img);
    }
  };

  this.setScale = (scale) => (this.scale = scale);

  this.draw = (context, time) => {
    if (!this.shown) return;

    this.time = time;

    const img = this.frames[this.animationStep];

    if (!this.targetIsSet) {
      this.nextY = wave(this.y, this.amplitude, this.period, this.time);

      this.nextX = this.x;
    } else if (this.animationStep < 12) {
      // the arrow is moving
      this.animationStep++;
      this.scale -= 0.02;

      this.nextX = this.nextX + this.xSpeed;
      this.nextY = this.nextY + this.ySpeed;
    } else if (this.targetIsSet && this.target.isAHit) {
      this.nextX = wave(
        this.BoardX + this.target.offsetX,
        SETTINGS.BOARD_AMPLITUDE_X,
        SETTINGS.BOARD_PERIOD_X,
        this.time
      );
    }

    const dWith = SETTINGS.ARROW_WIDTH * this.scale;
    const dheight = SETTINGS.ARROW_HEIGHT * this.scale;
    const posX = this.nextX - SETTINGS.ARROW_CENTERPOINT_X * this.scale;
    const posY = this.nextY - SETTINGS.ARROW_CENTERPOINT_Y * this.scale;

    context.restore();
    context.shadowBlur = 10;
    context.drawImage(img, posX, posY, dWith, dheight);
  };

  this.setTarget = (target) => {
    this.target = target;
    this.targetSetAt = new Date().getTime();
    this.targetIsSet = true;
    this.animationStep = 0;
    this.xSpeed = (target.x - this.nextX) / 12;
    this.ySpeed = (target.y - this.nextY) / 12;
  };

  this.hasTarget = () => {
    return this.targetIsSet;
  };
  return this;
}
