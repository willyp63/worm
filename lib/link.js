const Link = function (location, radius) {
  this.location = location;
  this.radius = radius;
  this.count = 16;
};

Link.prototype.step = function (minRadius) {
  if (this.count > 0) {
    this.count--;
    return;
  }
  if (this.radius > minRadius) {
    this.radius -= 0.15;
  }
  if (this.radius < minRadius) {
    this.radius = minRadius;
  }
};

Link.prototype.x = function () { return this.location[0]; };
Link.prototype.y = function () { return this.location[1]; };

module.exports = Link;
