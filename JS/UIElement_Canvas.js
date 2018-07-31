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
