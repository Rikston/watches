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
        this.ctx.clearHolst();
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

function UIElement_Canvas() {}
UIElement_Canvas.prototype.draw = function() {};
UIElement_Canvas.prototype.clear = function() {};
UIElement_Canvas.prototype.update = function() {};
UIElement_Canvas.prototype.nowDraw = true;
Object.defineProperties(UIElement_Canvas.prototype, {
  width: {
    get: function() {
      return this.appearance.lineWidth;
    },
    set: function(newW) {
      this.appearance.lineWidth = newW;
    }
  },
  color: {
    get: function() {
      return this.appearance.strokeStyle;
    },
    set: function(color) {
      this.appearance.strokeStyle = color;
    }
  }
});
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
  console.log(stepH);
  console.log(maxLH, " " + maxLM, " " + maxLS, " " + stepL, " " + h);
  console.log("h: " + h, " m: " + m, " s: " + s);
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
Clock.cow = function() {
  console.log(125851);
};
function relation(val1_100, val_x, val2_100) {
  return (val_x * val2_100 * 100) / (val1_100 * 100);
}

let Time = (function() {
  let hours = 0;
  let minutes = 0;
  let seconds = 0;
  function time(value) {
    if (typeof value == "string") {
      let h_m_s = value.split(":");
      hours = h_m_s[0];
      minutes = h_m_s[1];
      seconds = h_m_s[2];
    }

    Object.defineProperties(this, {
      hours: {
        get: function() {
          return hours;
        },
        set: function(val) {
          hours = val;
        },
        enumerable: true
      },
      minutes: {
        get: function() {
          return minutes;
        },
        set: function(val) {
          minutes = val;
        },
        enumerable: true
      },
      seconds: {
        get: function() {
          return seconds;
        },
        set: function(val) {
          seconds: val;
        },
        enumerable: true
      }
    });
  }
  time.prototype.set;
  return time;
})();

function createDate(value) {
  let resutl = null;
  result = new Date(value);
  return result;
}
