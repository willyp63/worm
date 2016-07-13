const Locations = require('./util/locations');
const Link = require('./link');

const Worm = function (location, radius) {
  this.radius = radius;
  this.links = [new Link(location, this.radius)];
  this.direction = 0;
  this.alpha = 0; // angular acceleration
  this.growing = Worm.INITIAL_LENGTH - 1; // number of links to grow

  this.swiveling = true;
  this.swivelCount = 0;

  this.swallowing = false;
};

// physical properties
Worm.SPEED = 2;
Worm.LEAN_ALPHA = Math.PI / 36;
Worm.INITIAL_LENGTH = 10;
Worm.GROW_LENGTH = 30;
Worm.SWIVEL_PERIOD = 8;

// astetic properties
Worm.COLOR = '#ff33cc';
Worm.BORDER_WIDTH = 2;

Worm.prototype.length = function () { return this.links.length; };
Worm.prototype.head = function () { return this.links[0]; };
Worm.prototype.tail = function () { return this.links[this.length() - 1]; };

Worm.prototype.step = function (timeDelta) {
  // change direction
  if (this.swiveling) {
    this.swivelStep();
  } else {
    this.direction += this.alpha;
  }

  // advance in direction
  const oldLocation = this.head().location;
  const newLocation = Locations.advance(oldLocation, this.direction, Worm.SPEED, timeDelta);
  const newHead = new Link(newLocation, this.radius);
  this.links.unshift(newHead);

  // drop tail or grow
  if (this.growing) {
    this.growing--;
  } else {
    this.links.pop();
  }
};

Worm.prototype.swivelStep = function () {
  if (this.swivelCount < 0) {
    this.direction += Worm.LEAN_ALPHA;
  } else {
    this.direction -= Worm.LEAN_ALPHA;
  }

  this.swivelCount++;
  if (this.swivelCount >= Worm.SWIVEL_PERIOD) {
     this.swivelCount = -Worm.SWIVEL_PERIOD;
  }
};

Worm.prototype.draw = function (ctx) {
  // draw circle for head and tail
  ctx.fillStyle = Worm.COLOR;
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = Worm.BORDER_WIDTH;
  ctx.beginPath();
  ctx.arc(this.head().x(), this.head().y(), this.radius, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();
  ctx.closePath();
  ctx.beginPath();
  ctx.arc(this.tail().x(), this.tail().y(), this.radius, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();
  ctx.closePath();

  // draw body
  ctx.beginPath();
  ctx.moveTo(this.head().x(), this.head().y());
  for (let i = 1; i < this.length(); i++) {
    ctx.lineTo(this.links[i].x(), this.links[i].y());
  }
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = this.radius * 2 + Worm.BORDER_WIDTH;
  ctx.stroke();
  ctx.closePath();

  // fill body
  const adjustedHead = Locations.advance(this.head().location, this.direction, 1, 1);
  const secondTail = this.links[this.length() - 2];
  const tailDirection = Locations.direction(secondTail.location, this.tail().location);
  const adjustedTail = Locations.advance(this.tail().location, tailDirection, 1, 1);
  ctx.beginPath();
  ctx.moveTo(adjustedHead[0], adjustedHead[1]);
  for (let i = 1; i < this.length() - 1; i++) {
    ctx.lineTo(this.links[i].x(), this.links[i].y());
  }
  ctx.lineTo(adjustedTail[0], adjustedTail[1]);
  ctx.strokeStyle = Worm.COLOR;
  ctx.lineWidth = this.radius * 2 - Worm.BORDER_WIDTH;
  ctx.stroke();
  ctx.closePath();
};

Worm.prototype.collidedWith = function (location, radius) {
  for (let i = 0; i < this.length(); i++) {
    const dist = Locations.distance(this.links[i].location, location);
    if (dist < this.radius + radius) {
      return true;
    }
  }
  return false;
};

Worm.prototype.collidedWithSelf = function () {
  const offset = Math.floor(this.radius / Worm.SPEED) * 3;
  const head = this.head();
  for (let i = offset; i < this.length(); i++) {
    const dist = Locations.distance(this.links[i].location, head.location);
    if (dist < this.radius * 2) {
      return true;
    }
  }
  return false;
};

Worm.prototype.grow = function () {
  this.growing += Worm.GROW_LENGTH;
};

Worm.prototype.leanRight = function () {
  this.swiveling = false;
  this.alpha = Worm.LEAN_ALPHA;
};

Worm.prototype.leanLeft = function () {
  this.swiveling = false;
  this.alpha = -Worm.LEAN_ALPHA;
};

Worm.prototype.swivel = function () {
  if (this.swiveling) { return; }
  this.swiveling = true;
  if (this.alpha > 0) {
    this.swivelCount = Worm.SWIVEL_PERIOD / 2;
  } else {
    this.swivelCount = -Worm.SWIVEL_PERIOD / 2;
  }
};

module.exports = Worm;
