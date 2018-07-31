function timer(func, args) {
  let startTime = performance.now();

  func(args);

  let endTime = performance.now();

  return endTime - startTime;
}
let ctx = null;
let line = null;
let clock = null;
let clock1 = null;
let df = null;
window.addEventListener("load", function() {
  ctx = AddCanvas(CreateCanvas).ctx;
  line = ctx.line({ x1: 50, y1: 50, x2: 80, y2: 100 });

  clock1 = new Clock({
    position: {
      x: 500,
      y: 360
    },
    radius: 100,
    ctx: ctx
  });
  clock = new Clock({
    position: {
      x: 500,
      y: 150
    },
    radius: 100,
    ctx: ctx
  });
  df = new DrawFunction();
  df.draw = function() {
    this.update();
  };
  clock.update = function() {
    this.updateDate();
  };
  clock1.update = clock.update;
  ctx.canvas.addChildren(df);
  //ctx.canvas.startAnimate();
  ctx.canvas.addEventListener("click", function(e) {
    let clock = new Clock({
      position: {
        x: e.clientX,
        y: e.clientY
      },
      radius: Math.random() * (100 - 10) + 10,
      ctx: ctx
    });
    Clock.CreateAnimateFunc(clock, function() {
      this.updateDate();
    });
    ctx.canvas.addChildren(clock);
  });
});
