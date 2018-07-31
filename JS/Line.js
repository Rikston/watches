let Line = (function() {
  function line(settings) {
    if (!settings) {
      console.error("Line constructor: settings is undefined", [
        "settings: " + settings
      ]);
      return;
    } else {
      if (!settings.position) {
        console.error("Line constructor: settings don't contain position");
        return;
      }
    }
    settings = _.defaultsDeep(settings, {
      rotate: {
        x: 0,
        y: 0,
        angle: 0
      },
      appearance: {
        lineWidth: 2,
        strokeStyle: "#000"
      }
    });
    this.position = settings.position;
    this.rotate = settings.rotate;
    this.rotate.drawPoint = function() {
      this.ctx.beginPath();
      this.ctx.arc(
        this.rotate.x + this.position.x1,
        this.rotate.y + this.position.y1,
        3,
        0,
        6.28,
        false
      );
      this.ctx.fill();
    }.bind(this);
    this.ctx = settings.ctx;
    this.appearance = settings.appearance;
    this.drawRotatePoint = false;

    Object.defineProperties(this, {
      x: {
        get: function() {
          return this.position.x1;
        },
        set: function(value) {
          //let offset = value - this.position.x1;
          this.position.x1 = value;
          this.position.x2 = value;
        }
      },
      y: {
        get: function() {
          return this.position.y1;
        },
        set: function(value) {
          //let offset = value - this.position.y1;
          this.position.y1 = value;
          this.position.y2 = value;
        }
      }
    });
  }
  line.prototype = Object.create(UIElement_Canvas.prototype);
  line.prototype.constructor = line;
  line.prototype.draw = function() {
    this.ctx.save();
    this.ctx.lineCap = "round";
    this.ctx.lineWidth = this.appearance.lineWidth;
    this.ctx.strokeStyle = this.appearance.strokeStyle;
    this.ctx.translate(
      this.position.x1 + this.rotate.x,
      this.position.y1 + this.rotate.y
    );
    this.ctx.rotateD(this.rotate.angle);
    this.ctx.beginPath();
    this.ctx.moveTo(-this.rotate.x, -this.rotate.y);
    this.ctx.lineTo(
      this.position.x2 - this.position.x1 - this.rotate.x,
      this.position.y2 - this.position.y1 - this.rotate.y
    );
    this.ctx.stroke();
    this.ctx.restore();
    if (this.drawRotatePoint) {
      this.ctx.fillStyle = this.appearance.rotatePointColor || "#fff";
      this.rotate.drawPoint();
    }
  };
  line.prototype.clear = function() {};
  return line;
})();
