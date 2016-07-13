const Images = require('./util/images');

const Apple = function (location, radius) {
  this.radius = radius;
  this.location = location;
  Images.loadAppleImage(appleImage => {
    this.image = appleImage;
  });
};

Apple.COLOR = '#ff0000';
Apple.BORDER_WIDTH = 2;

Apple.prototype.draw = function (ctx) {
  if (!this.image) { return; }
  const x = this.location[0] - this.radius * 3 / 2;
  const y = this.location[1] - this.radius * 3 / 2;
  const size = this.radius * 3;
  ctx.drawImage(this.image, x, y, size, size);
};

module.exports = Apple;
