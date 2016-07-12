const Apple = function (location, radius) {
  this.radius = radius;
  this.location = location;
  this.image = new Image();
  this.imageLoaded = false;
  this.image.onload = () => {
    this.imageLoaded = true;
  };
  this.image.src = 'assets/apple.png';
  this.image.width = this.radius * 2;
  this.image.height = this.radius * 2;
};

Apple.COLOR = '#ff0000';
Apple.BORDER_WIDTH = 2;

Apple.prototype.draw = function (ctx) {
  if (!this.imageLoaded) { return; }
  const x = this.location[0] - this.radius * 3 / 2;
  const y = this.location[1] - this.radius * 3 / 2;
  const size = this.radius * 3;
  ctx.drawImage(this.image, x, y, size, size);
  // ctx.fillStyle = Apple.COLOR;
  // ctx.strokeStyle = '#000000';
  // ctx.lineWidth = Apple.BORDER_WIDTH;
  //
  // ctx.beginPath();
  // ctx.arc(this.location[0], this.location[1], this.radius, 0, 2 * Math.PI);
  // ctx.fill();
  // ctx.stroke();
  // ctx.closePath();
};

module.exports = Apple;
