const Worm = require('./worm');
const Apple = require('./apple');
const Locations = require('./util/locations');
const Images = require('./util/images');

const Game = function (size) {
  this.size = size;
  this.wormRadius = this.size / Game.WORM_SCALE;
  this.appleRadius = this.size / Game.APPLE_SCALE;
  this.keysPressed = [];
  this.dirtImage = Images.generateDirtImage(this.size, Game.BORDER_WIDTH);
  this.reset();
};

Game.FONT = "64px Arial";
Game.BORDER_WIDTH = 4;

Game.WORM_SCALE = 40;
Game.APPLE_SCALE = 60;

Game.prototype.reset = function () {
  this.worm = new Worm([this.size / 2, this.size / 2], this.wormRadius);
  this._resetApple();
  this.score = 0;
  this.state = 'PLAYING';
};

Game.prototype.togglePause = function () {
  if (this.state === 'PLAYING') {
    this.state = 'PAUSED';
  } else if (this.state === 'PAUSED') {
    this.state = 'PLAYING';
  }
};

Game.prototype.step = function (timeDelta) {
  if (this.state !== 'PLAYING') { return; }

  // check if worm is off board
  const center = [this.size / 2, this.size / 2];
  let dist = Locations.distance(this.worm.head(), center) + this.worm.radius;
  if (dist > (this.size / 2) - Game.BORDER_WIDTH) {
    return;
  }

  // check for self collision
  if (this.worm.collidedWithSelf()) {
    this.state = 'GAME_OVER';
    return;
  }

  // check for worm-apple collision
  dist = Locations.distance(this.worm.head(), this.apple.location);
  if (dist < this.worm.radius + this.apple.radius) {
    this.worm.grow();
    this._resetApple();
    return;
  }

  this.worm.step(timeDelta);
};

Game.prototype._resetApple = function () {
  const radius = ((this.size - Game.BORDER_WIDTH) / 2) - this.appleRadius;
  do {
    if (this.apple) {
      this.apple.location = Locations.randomLocation(this.size / 2, radius);
    } else {
      this.apple = new Apple(Locations.randomLocation(this.size / 2, radius), this.appleRadius);
    }
  } while (this.worm.collidedWith(this.apple.location, this.appleRadius));
};

Game.prototype.draw = function (ctx) {
  // draw game state label
  if (this.state === 'PAUSED') {
    this._drawCenteredText(ctx, 'Paused');
    return;
  } else if (this.state === 'GAME_OVER') {
    this._drawCenteredText(ctx, 'Game Over');
    return;
  }

  // clear canvas
  ctx.clearRect(0, 0, this.size, this.size);

  // draw background circle
  ctx.drawImage(this.dirtImage, 0, 0);

  this.worm.draw(ctx);
  this.apple.draw(ctx);
};

Game.prototype._drawCenteredText = function (ctx, text) {
  ctx.font = Game.FONT;
  ctx.fillStyle = '#000000';
  const x = (this.size - ctx.measureText(text).width) / 2;
  const y = this.size / 2;
  ctx.fillText(text, x, y);
};

Game.prototype.handleKeyDown = function (e) {
  let i;
  switch (e.keyCode) {
    case 65: // A
      i = this.keysPressed.indexOf('a');
      if (i < 0) { this.keysPressed.push('a'); }
      break;
    case 68: // D
      i = this.keysPressed.indexOf('d');
      if (i < 0) { this.keysPressed.push('d'); }
      break;
  }
  this._updateWormState();
};

Game.prototype.handleKeyUp = function (e) {
  let i;
  switch (e.keyCode) {
    case 65: // A
      i = this.keysPressed.indexOf('a');
      if (i >= 0) { this.keysPressed.splice(i, 1); }
      break;
    case 68: // D
      i = this.keysPressed.indexOf('d');
      if (i >= 0) { this.keysPressed.splice(i, 1); }
      break;
  }
  this._updateWormState();
};

Game.prototype._updateWormState = function () {
  const a = (this.keysPressed.indexOf('a') >= 0);
  const d = (this.keysPressed.indexOf('d') >= 0);
  if (a && d) {
    this.worm.swivel();
  } else if (a) {
    this.worm.leanLeft();
  } else if (d) {
    this.worm.leanRight();
  } else {
    this.worm.swivel();
  }
};

Game.prototype.handleClick = function (e) {
  switch (this.state) {
    case 'PAUSED':
      this.state = 'PLAYING';
      break;
    case 'PLAYING':
      this.state = 'PAUSED';
      break;
    case 'GAME_OVER':
      this.reset();
      break;
  }
};
module.exports = Game;
