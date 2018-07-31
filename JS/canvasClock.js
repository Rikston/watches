let Clock = (function() {
  function clock(settings) {
    if (!settings) {
      console.error("Clock constructor: settings is undefined");
      return;
    } else {
      if (!settings.position) {
        console.error("Clock settings don't contain position");
        return;
      } else {
        if (!settings.ctx) {
          console.error(
            "Clock constructor: settings don't contain canvas context"
          );
          return;
        } else {
          if (!settings.radius) {
            console.error("Clock constructor: settings don't contain radius");
            return;
          }
        }
      }
    }
    if (settings.updateFunc) this.update = settings.updateFunc;
    Object.defineProperties(this, {
      radius: {
        get: function() {
          return this.size.radius;
        },
        set: function(value) {
          this.size.radius = value;
          this.lineHours.position.y2 = this.position.y - this.radius * 0.9;
          this.lineMinutes.position.y2 = this.position.y - this.radius * 0.8;
          this.lineSeconds.position.y2 = this.position.y - this.radius * 0.7;
        }
      },
      x: {
        get: function() {
          return this.position.x;
        },
        set: function(value) {
          this.position.x = value;
          this.lineHours.x = value;
          this.lineMinutes.x = value;
          this.lineSeconds.x = value;
        }
      },
      y: {
        get: function() {
          return this.position.y;
        },
        set: function(value) {
          this.position.y = value;
          this.lineHours.y = value;
          this.lineMinutes.y = value;
          this.lineSeconds.y = value;
        }
      },
      hours: {
        get: function() {
          return relation(360, this.lineHours.rotate.angle, 12);
        },
        set: function(value) {
          this.lineHours.rotate.angle = relation(12, value, 360);
        }
      },
      minutes: {
        get: function() {
          return relation(360, this.lineMinutes.rotate.angle, 60);
        },
        set: function(value) {
          let hours = Math.floor(value / 60);
          let minutes = 0;
          if (hours >= 1) {
            minutes = value - 60 * hours;
            this.hours += hours;
          } else minutes = value;
          this.lineMinutes.rotate.angle = relation(60, minutes, 360);
        }
      },
      seconds: {
        get: function() {
          return relation(360, this.lineSeconds.rotate.angle, 60);
        },
        set: function(value) {
          let minutes = Math.floor(value / 60);
          let seconds = 0;
          if (minutes >= 1) {
            seconds = value - 60 * minutes;
            this.minutes += minutes;
          } else seconds = value;
          this.lineSeconds.rotate.angle = relation(60, seconds, 360);
        }
      },
      date: {
        get: function() {
          return this.variables.date;
        },
        set: function(newDate) {
          if (!(newDate instanceof Date)) {
            console.error("variable a newDate isn't date");
            return;
          }
          this.variables.date = newDate;
          this.updateDate(this.variables.date);
        }
      }
    });
    this.variables = {
      date: new Date()
    };

    this.ctx = settings.ctx;
    this.position = settings.position;
    this.size = {
      radius: settings.radius
    };
    this.lineHours = this.ctx.line(
      {
        x1: this.position.x,
        y1: this.position.y,
        x2: this.position.x,
        y2: this.position.y - this.radius * 0.9
      },
      {
        angle: relation(12, this.variables.date.getHours(), 360)
      }
    );
    this.lineMinutes = this.ctx.line(
      {
        x1: this.position.x,
        y1: this.position.y,
        x2: this.position.x,
        y2: this.position.y - this.radius * 0.8
      },
      {
        angle: relation(60, this.variables.date.getMinutes(), 360)
      }
    );
    this.lineSeconds = this.ctx.line(
      {
        x1: this.position.x,
        y1: this.position.y,
        x2: this.position.x,
        y2: this.position.y - this.radius * 0.7
      },
      {
        angle: relation(60, this.variables.date.getSeconds(), 360)
      }
    );

    Object.defineProperties(this.lineHours, {
      length: {
        get: function() {
          return this.position.y - this.lineHours.position.y2;
        }.bind(this),
        set: function(value) {
          this.lineHours.position.y2 = this.position.y - value;
        }.bind(this)
      }
    });
    Object.defineProperties(this.lineMinutes, {
      length: {
        get: function() {
          return this.position.y - this.lineMinutes.position.y2;
        }.bind(this),
        set: function(value) {
          this.lineMinutes.position.y2 = this.position.y - value;
        }.bind(this)
      }
    });
    Object.defineProperties(this.lineSeconds, {
      length: {
        get: function() {
          return this.position.y - this.lineSeconds.position.y2;
        }.bind(this),
        set: function(value) {
          this.lineSeconds.position.y2 = this.position.y - value;
        }.bind(this)
      }
    });
  }

  clock.prototype = Object.create(UIElement_Canvas.prototype);
  clock.constructor = clock;
  clock.prototype.draw = function() {
    this.ctx.beginPath();
    this.ctx.circle(this.position.x, this.position.y, this.radius);
    this.ctx.stroke();
    this.lineHours.draw();
    this.lineMinutes.draw();
    this.lineSeconds.draw();
  };
  clock.prototype.updateDate = function(date) {
    this.variables.date = date || new Date();
    this.lineHours.rotate.angle = relation(
      12,
      this.variables.date.getHours(),
      360
    );
    this.lineMinutes.rotate.angle = relation(
      60,
      this.variables.date.getMinutes(),
      360
    );
    this.lineSeconds.rotate.angle = relation(
      60,
      this.variables.date.getSeconds(),
      360
    );
  };
  clock.prototype.clear = function() {
    let length = this.radius * 2 + 2;
    this.ctx.clearRect(
      this.position.x - this.radius - 1,
      this.position.y - this.radius - 1,
      length,
      length
    );
  };
  return clock;
})();
Clock.CreateAnimateFunc = function(clock, endAnimateFunc) {
  let needRadius = clock.radius;
  let maxLH = clock.radius * 0.5;
  let maxLM = clock.radius * 0.7;
  let maxLS = clock.radius * 0.9;
  let h = clock.date.getHours() - Math.floor(clock.date.getHours() / 12) * 12;
  let m = clock.date.getMinutes();
  let s = clock.date.getSeconds();
  let stepL = 0.1;
  let stepH = h / (maxLH / stepL);
  let stepM = m / (maxLM / stepL);
  let stepS = s / (maxLM / stepL);
  let stop = {
    count: 3,
    1: 0,
    2: 0,
    3: 0
  };
  // console.log(stepH);
  // console.log(maxLH, " " + maxLM, " " + maxLS, " " + stepL, " " + h);
  // console.log("h: " + h, " m: " + m, " s: " + s);
  clock.lineHours.length = 0;
  clock.lineMinutes.length = 0;
  clock.lineSeconds.length = 0;
  clock.radius = 0;
  clock.hours = clock.minutes = clock.seconds = 0;
  clock.update = function() {
    if (!stop.count) {
      this.update = endAnimateFunc;
      return;
    }

    if (this.lineHours.length < maxLH) {
      this.lineHours.length += stepL;
    }

    if (this.lineMinutes.length < maxLM) {
      this.lineMinutes.length += stepL;
    }

    if (this.lineSeconds.length < maxLS) {
      this.lineSeconds.length += stepL;
      this.radius += stepL + 0.1;
    }

    if (h > this.hours) {
      this.hours += stepH;
    } else {
      if (stop[1] == 0) {
        --stop.count;
        stop[1] = 1;
      }
    }
    if (m > this.minutes) {
      this.minutes += stepM;
    } else {
      if (stop[2] == 0) {
        --stop.count;
        stop[2] = 1;
      }
    }
    if (s > this.seconds) {
      this.seconds += stepS;
    } else {
      if (stop[3] == 0) {
        --stop.count;
        stop[3] = 1;
      }
    }
  };
};
function relation(val1_100, val_x, val2_100) {
  return (val_x * val2_100 * 100) / (val1_100 * 100);
}

function createDate(value) {
  let resutl = null;
  result = new Date(value);
  return result;
}
