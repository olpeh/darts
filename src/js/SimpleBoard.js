import * as SETTINGS from "./Settings";
import utils from "./utils";

const COLOR_RED = "255,102,102";
const COLOR_BLUE = "93, 188, 194";

export default function RealBoard(settings) {
  this.X = settings.x;
  this.Y = settings.y;
  this.radius = settings.radius;

  this.amplitudeY = settings.amplitudeY;
  this.amplitudeX = settings.amplitudeX;
  this.periodY = settings.periodY;
  this.periodX = settings.periodX;

  this.isMoving = false;

  // gets updated every draw cycle
  this.time = 0;

  this.setPosition = (x, y) => {
    this.X = x;
    this.Y = y;
  };

  this.startMove = () => {
    this.isMoving = true;
  };

  this.stopMove = () => {
    this.isMoving = false;
  };

  this.getX = () =>
    !this.isMoving
      ? this.X
      : utils.wave(this.X, this.amplitudeX, this.periodX, this.time);

  this.getY = () => this.Y;

  this.setRadius = (r) => {
    this.radius = r;
  };

  this.getRingSize = () => {
    return this.radius / SETTINGS.BOARD_RINGS;
  };

  this.getTextColor = (i) => (i % 2 ? "black" : "white");
  this.getInnerColor = (i) => (i % 2 ? "white" : "black");

  this.drawCircle = (ctx, x, y, radius, color, shadowBlur) => {
    ctx.restore();
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    if (shadowBlur) {
      ctx.shadowBlur = shadowBlur;
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    } else {
      ctx.shadowBlur = 0;
    }
    ctx.fill();
  };

  this.target = false;

  this.setTarget = (target) => {
    const distance = utils.distance(
      target.x,
      target.y,
      this.getX(),
      this.getY()
    );
    const score = Math.max(
      0,
      SETTINGS.BOARD_RINGS + 1 - Math.ceil(distance / this.getRingSize())
    );

    target.score = score;
    target.setAt = new Date().getTime();
    target.isAHit = score > 0;
    target.hidden = false;
    target.offsetX = Math.round(target.x - this.getX());
    target.offsetY = Math.round(target.y - this.getY());
    this.target = target;

    return score;
  };

  this.drawHit = (ctx) => {
    if (!this.target || this.target.hidden) {
      return;
    }

    const duration = new Date().getTime() - this.target.setAt;
    if (duration < 200) {
      return;
    }

    const y = this.target.y - duration * SETTINGS.HIT_SPEED;

    const opacityMinus = duration < 1000 ? 0.1 : (duration - 1000) / 750;
    if (opacityMinus > 0.9) {
      this.target.hidden = true;
      return;
    }

    const opacityText = 1 - opacityMinus;
    const opacityBg = 1 - opacityMinus;

    const x = this.target.x;
    const text = "+" + this.target.score;
    const font = "25px mr-eaves-modern";
    const textColor = `rgba(255,255,255,${opacityText})`;
    const bgColor = `rgba(${
      this.target.score === 10 ? COLOR_RED : COLOR_BLUE
    },${opacityBg})`;

    this.drawCircle(ctx, x, y, 20, bgColor, 20);
    this.drawText(ctx, x, y + 7.5, text, font, textColor);
  };

  this.drawText = (ctx, x, y, text, font, color) => {
    ctx.restore();
    ctx.font = font;
    ctx.textAlign = "center";
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
  };

  this.drawRingScore = (ctx, score) => {
    ctx.restore();
    const text = score + 1;
    const size = Math.round(this.getRingSize());
    const font = size + "px serif";
    const color = this.getTextColor(score);
    const padding = this.getRingSize() * SETTINGS.BOARD_TEXT_PADDING;
    const dist = Math.round(
      (SETTINGS.BOARD_RINGS - score - 1) * this.getRingSize() + padding
    );

    const xd = dist + padding * 3;
    const yd = size / 3;
    const southY = this.getY() + size - padding * 2 + dist;

    if (score === SETTINGS.BOARD_RINGS - 1) {
      // this.drawText(ctx, this.getX(), this.getY() + yd, text, size, "red"); //north
      return;
    }

    this.drawText(ctx, this.getX(), this.getY() - dist, text, font, color); //north
    this.drawText(ctx, this.getX(), southY, text, font, color); //south

    this.drawText(ctx, this.getX() - xd, this.getY() + yd, text, font, color); //west
    this.drawText(ctx, this.getX() + xd, this.getY() + yd, text, font, color); //east
  };

  this.draw = (ctx, time) => {
    this.time = time;
    for (var i = 0; i < SETTINGS.BOARD_RINGS; i++) {
      this.drawCircle(
        ctx,
        this.getX(),
        this.getY(),
        this.radius - this.getRingSize() * i,
        this.getInnerColor(i)
      );
      this.drawRingScore(ctx, i);
    }

    this.drawCircle(
      ctx,
      this.getX(),
      this.getY(),
      this.getRingSize() / 2,
      `rgba(${COLOR_RED})`
    );

    this.drawHit(ctx);
  };
  return this;
}
