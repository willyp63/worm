const Util = require('./util');

const Worm = function (location, radius) {
  this.radius = radius;
  this.links = [location];
  this.direction = 0;
  this.alpha = 0;
  this.growing = Worm.INITIAL_LENGTH - 1;
  this.swiveling = true;
  this.swivelCount = 0;
};

Worm.SPEED = 2;
Worm.SWIVEL_PERIOD = 8;
Worm.COLOR = '#ff33cc';
Worm.BORDER_WIDTH = 2;
Worm.LEAN_ALPHA = Math.PI / 36;
Worm.INITIAL_LENGTH = 10;
Worm.GROW_LENGTH = 30;

Worm.prototype.head = function () {
  return this.links[0];
};

Worm.prototype.step = function (timeDelta) {
  // change direction
  if (this.swiveling) {
    if (this.swivelCount < 0) {
      this.direction += Worm.LEAN_ALPHA;
    } else {
      this.direction -= Worm.LEAN_ALPHA;
    }

    this.swivelCount++;
    if (this.swivelCount >= Worm.SWIVEL_PERIOD) {
       this.swivelCount = -Worm.SWIVEL_PERIOD;
    }
  } else {
    this.direction += this.alpha;
  }

  // advance in direction
  const head = this.links[0];
  const newHead = Util.advance(head, this.direction, Worm.SPEED, timeDelta);
  this.links.unshift(newHead);

  // drop tail or grow
  if (this.growing) {
    this.growing--;
  } else {
    this.links.pop();
  }
};

Worm.prototype.draw = function (ctx) {
  ctx.fillStyle = Worm.COLOR;
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = Worm.BORDER_WIDTH;

  // draw circle for head and tail
  const head = this.links[0];
  ctx.beginPath();
  ctx.arc(head[0], head[1], this.radius, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();
  ctx.closePath();
  const tail = this.links[this.links.length - 1];
  ctx.beginPath();
  ctx.arc(tail[0], tail[1], this.radius, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();
  ctx.closePath();

  // draw body
  ctx.beginPath();
  ctx.moveTo(head[0], head[1]);
  for (let i = 1; i < this.links.length; i++) {
    const link = this.links[i];
    ctx.lineTo(link[0], link[1]);
  }
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = this.radius * 2 + Worm.BORDER_WIDTH;
  ctx.stroke();
  ctx.closePath();

  // fill body
  const adjustedHead = Util.advance(head, this.direction, 1, 1);
  const tailDirection = Util.direction(this.links[this.links.length - 2], tail);
  const adjustedTail = Util.advance(tail, tailDirection, 1, 1);
  ctx.beginPath();
  ctx.moveTo(adjustedHead[0], adjustedHead[1]);
  for (let i = 1; i < this.links.length - 1; i++) {
    const link = this.links[i];
    ctx.lineTo(link[0], link[1]);
  }
  ctx.lineTo(adjustedTail[0], adjustedTail[1]);
  ctx.strokeStyle = Worm.COLOR;
  ctx.lineWidth = this.radius * 2 - Worm.BORDER_WIDTH;
  ctx.stroke();
  ctx.closePath();
};

Worm.prototype.collidedWith = function (location, radius) {
  for (let i = 0; i < this.links.length; i++) {
    const dist = Util.distance(this.links[i], location);
    if (dist < this.radius + radius) {
      return true;
    }
  }
  return false;
};

Worm.prototype.collidedWithSelf = function () {
  const offset = Math.floor(this.radius / Worm.SPEED) * 3;
  const head = this.head();
  for (let i = offset; i < this.links.length; i++) {
    const dist = Util.distance(this.links[i], head);
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
