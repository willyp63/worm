const Link = function (location, radius) {
  this.location = location;
  this.radius = radius;
};

Link.prototype.x = function () { return this.location[0]; };
Link.prototype.y = function () { return this.location[1]; };

module.exports = Link;
