let DrawFunction = (function() {
  function drawFunction() {}

  drawFunction.prototype = Object.create(UIElement_Canvas.prototype);
  drawFunction.prototype.constructor = drawFunction;
  return drawFunction;
})();
