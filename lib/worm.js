const Locations = require('./util/locations');
const Link = require('./link');

const Worm = function (location, radius) {
  this.radius = radius;
  this.links = [new Link(location, this.radius)];
  this.direction = 0;
  this.alpha = 0; // angular acceleration
  this.growing = Worm.INITIAL_LENGTH - 1; // number of links to grow
  this.growAlt = true;

  this.swiveling = true;
  this.swivelCount = 0;

  this.swallowing = false;
  this.swallowCount = 0;
  this.platoCount = 0;
};

// physical properties
Worm.SPEED = 2;
Worm.LEAN_ALPHA = Math.PI / 36;
Worm.INITIAL_LENGTH = 10;
Worm.GROW_LENGTH = 60;
Worm.SWIVEL_PERIOD = 8;
Worm.SWALLOW_RATIO = 0.35;
Worm.SWALLOW_SPEED_RATIO = 1.35;
Worm.SWALLOW_PERIOD = 16;
Worm.SWALLOW_PLATO = 16;

// astetic properties
Worm.COLOR = '#ff33cc';
Worm.BORDER_COLOR = '#730056';
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
  const speed = this.swallowCount < 0 ? Worm.SPEED * Worm.SWALLOW_SPEED_RATIO : Worm.SPEED;
  const radius = this.swallowing ? this.swallowRadius() : this.radius;
  const oldLocation = this.head().location;
  const newLocation = Locations.advance(oldLocation, this.direction, speed, timeDelta);
  const newHead = new Link(newLocation, radius);
  this.links.unshift(newHead);

  // drop tail or grow
  if (this.growing) {
    if (this.growAlt) {
      this.growing--;
    } else {
      this.links.pop();
    }
    this.growAlt = !this.growAlt;
  } else {
    this.links.pop();
  }

  this.links.forEach(link => {
    link.step(this.radius);
  });
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

Worm.prototype.swallowRadius = function () {
  if (this.swallowCount === 0) {
    // plato
    this.platoCount++;
    if (this.platoCount >= Worm.SWALLOW_PLATO) {
      this.swallowCount++;
    }
    return this.radius * (1 + Worm.SWALLOW_RATIO);
  } else {
    // ramp up/ramp down
    const ratio = (Worm.SWALLOW_PERIOD - Math.abs(this.swallowCount)) / Worm.SWALLOW_PERIOD;
    const maxDif = Worm.SWALLOW_RATIO * this.radius;
    const radius = this.radius + (maxDif * ratio);

    this.swallowCount++;
    if (this.swallowCount >= Worm.SWALLOW_PERIOD) {
      this.swallowing = false;
    }
    return radius;
  }
};

Worm.prototype.draw = function (ctx) {
  // calc perimeter points
  const topPoints = [];
  const bottomPoints = [];
  let loc = this.head().location;
  const headDir = Locations.direction(loc, this.links[1].location);
  let p1 = Locations.advance(loc, headDir - Math.PI / 2, this.head().radius, 1);
  let p2 = Locations.advance(loc, headDir + Math.PI / 2, this.head().radius, 1);
  topPoints.push(p1);
  bottomPoints.push(p2);
  for (let i = 0; i < this.length() - 2; i++) {
    loc = this.links[i + 1].location;
    const prev = this.links[i].location;
    const next = this.links[i + 2].location;
    const dir = Locations.direction(prev, next);
    p1 = Locations.advance(loc, dir - Math.PI / 2, this.links[i + 1].radius, 1);
    p2 = Locations.advance(loc, dir + Math.PI / 2, this.links[i + 1].radius, 1);
    topPoints.push(p1);
    bottomPoints.push(p2);
  }
  loc = this.tail().location;
  const prev = this.links[this.length() - 2].location;
  const tailDir = Locations.direction(prev, loc);
  p1 = Locations.advance(loc, tailDir - Math.PI / 2, this.tail().radius, 1);
  p2 = Locations.advance(loc, tailDir + Math.PI / 2, this.tail().radius, 1);
  topPoints.push(p1);
  bottomPoints.push(p2);

  // connect the dots
  ctx.beginPath();
  ctx.fillStyle = Worm.COLOR;
  ctx.strokeStyle = Worm.BORDER_COLOR;
  ctx.lineWidth = 2;
  ctx.moveTo(...topPoints[0]);
  for (let i = 1; i < topPoints.length; i++) {
    ctx.lineTo(...topPoints[i]);
  }
  ctx.arc(this.tail().x(), this.tail().y(), this.tail().radius,
            tailDir - Math.PI / 2, tailDir + Math.PI / 2);
  for (let i = bottomPoints.length - 2; i >= 0; i--) {
    ctx.lineTo(...bottomPoints[i]);
  }
  ctx.arc(this.head().x(), this.head().y(), this.head().radius,
            headDir + Math.PI / 2, headDir - Math.PI / 2);
  ctx.fill();
  ctx.stroke();
  ctx.closePath();

  ctx.fillStyle = Worm.BORDER_COLOR;
  // draw mouth if swallowing
  if (this.swallowCount < 0) {
    const mouth = Locations.advance(this.head().location, this.direction, this.head().radius / 3, 1);
    ctx.beginPath();
    ctx.arc(mouth[0], mouth[1], this.head().radius * 2 / 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  } else {
    // draw eyes
    const eye1 = Locations.advance(this.head().location,
                  this.direction + Math.PI / 8, this.head().radius / 2, 1);
    const eye2 = Locations.advance(this.head().location,
                  this.direction - Math.PI / 8, this.head().radius / 2, 1);
    ctx.beginPath();
    ctx.arc(eye1[0], eye1[1], this.head().radius / 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
    ctx.beginPath();
    ctx.arc(eye2[0], eye2[1], this.head().radius / 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  }
};

Worm.prototype.collidedWith = function (location, radius) {
  for (let i = 0; i < this.length(); i++) {
    const link = this.links[i];
    const dist = Locations.distance(link.location, location);
    if (dist < link.radius + radius) {
      return true;
    }
  }
  return false;
};

Worm.prototype.collidedWithSelf = function () {
  const offset = Math.floor(this.radius / Worm.SPEED) * 4;
  const head = this.head();
  for (let i = offset; i < this.length(); i++) {
    const link = this.links[i];
    const dist = Locations.distance(link.location, head.location);
    if (dist < link.radius + head.radius) {
      return true;
    }
  }
  return false;
};

Worm.prototype.grow = function () {
  this.growAlt = true;
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

Worm.prototype.swallow = function () {
  this.swallowing = true;
  this.swallowCount = -Worm.SWALLOW_PERIOD;
  this.platoCount = 0;
};

module.exports = Worm;
