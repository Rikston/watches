function CreateCanvas() {
  let canvas = document.createElement("canvas");
  canvas.ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas._children = [];
  canvas.idAnimate = null;
  canvas.startAnimate = function() {
    if (this.idAnimate) {
      throw {
        name: "Error: Start Animate",
        message: "Before start new animation close old animation"
      };
    }
    this.idAnimate = setInterval(
      function() {
        this.ctx.clearWithAlpha("rgba(102, 51, 153, 1)");
        this._children.forEach(
          function(item) {
            if (item.nowDraw) {
              item.update();
              item.draw();
            }
          }.bind(this)
        );
      }.bind(this),
      1
    );
  };
  canvas.stopAnimate = function() {
    clearInterval(this.idAnimate);
    this.idAnimate = null;
  };
  canvas.addChildren = function() {
    if (arguments.length >= 1) {
      Array.prototype.forEach.call(
        arguments,
        function(child) {
          if (!(child instanceof UIElement_Canvas)) {
            throw {
              name: "Error: Canvas _children add",
              message: "Object is not extend UIElement_Canvas functionality"
            };
          }

          this._children.push(child);
        }.bind(this)
      );
    }
  };
  canvas.clearChildren = function() {
    this._children.length = 0;
  };
  return canvas;
}

function ReplaceDOMCanvas(name, createCanvasFunction) {
  let replacElem = document.querySelector(name);

  let canvas = createCanvasFunction();

  replacElem.parentNode.replaceChild(canvas, replacElem);
  return canvas;
}

function AddCanvas(createFunction) {
  let canvas = createFunction();
  document.body.appendChild(canvas);
  return canvas;
}

CanvasRenderingContext2D.prototype.line = function(position, rotate) {
  return new Line({ position: position, rotate: rotate, ctx: ctx });
};
CanvasRenderingContext2D.prototype.clearHolst = function() {
  this.clearRect(0, 0, this.canvas.width, this.canvas.height);
};
CanvasRenderingContext2D.prototype.clearWithAlpha = function(color, alpha) {
  this.save();
  this.fillStyle = color;
  this.fillRect(0, 0, this.canvas.width, this.canvas.height);
  this.restore();
};
CanvasRenderingContext2D.prototype.rotateD = function(degr) {
  this.rotate((degr * Math.PI) / 180);
};
CanvasRenderingContext2D.prototype.circle = function(x, y, radius) {
  this.arc(x, y, radius, 0, 6.28, false);
};
CanvasRenderingContext2D.prototype.circleLine = function(x, y, radius) {
  this.beginPath();
  this.arc(x, y, radius, 0, 6.28, false);
  this.stroke();
};
CanvasRenderingContext2D.prototype.circleFill = function(x, y, radius) {
  this.beginPath();
  this.arc(x, y, radius, 0, 6.28, false);
  this.fill();
};
