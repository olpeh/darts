const BLOCK_WIDTH = 0.1; // 20 blocks (2/20)

export default function RealBoard(settings) {
  this.x = settings.x;
  this.y = settings.y;
  this.radius = settings.radius;

  this.setPosition = (x, y) => {
    this.x = x;
    this.y = y;
  };
  this.setRadius = (r) => {
    this.radius = r;
  };

  this.getBorderColor = (i) => (i % 2 ? "green" : "red");
  this.getInnerColor = (i) => (i % 2 ? "white" : "black");

  this.drawCircleWithBlockElement = (ctx, radius, start, end, width, color) => {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(this.y, this.x, radius, start * Math.PI, end * Math.PI);
    ctx.arc(
      this.y,
      this.x,
      radius - width,
      end * Math.PI,
      start * Math.PI,
      true
    );
    ctx.fill();
  };

  this.drawCircle = (ctx, radius, color) => {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(this.y, this.x, radius, 0, 2 * Math.PI);
    ctx.fill();
  };

  this.draw = (ctx) => {
    const startPosition = 1.85;
    const blocksize = this.radius * 0.066;
    for (var i = 0; i < 20; i++) {
      const start = startPosition + BLOCK_WIDTH * i;
      const end = start + BLOCK_WIDTH;

      // outer most cicle (2x score)
      this.drawCircleWithBlockElement(
        ctx,
        this.radius,
        start,
        end,
        blocksize,
        this.getBorderColor(i)
      );
      // outer body
      this.drawCircleWithBlockElement(
        ctx,
        this.radius - blocksize,
        start,
        end,
        blocksize * 5,
        this.getInnerColor(i)
      );
      // inner border circle (3x score)
      this.drawCircleWithBlockElement(
        ctx,
        this.radius - blocksize * 6,
        start,
        end,
        blocksize,
        this.getBorderColor(i)
      );
      // outer body
      this.drawCircleWithBlockElement(
        ctx,
        this.radius - blocksize * 7,
        start,
        end,
        blocksize * 7,
        this.getInnerColor(i)
      );
      this.drawCircle(ctx, this.radius - blocksize * 13.2, "green");
      this.drawCircle(ctx, this.radius - blocksize * 14.2, "red");
    }
  };
}
