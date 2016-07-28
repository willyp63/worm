const Worm = require('./worm');
const Apple = require('./apple');
const Locations = require('./util/locations');
const Images = require('./util/images');
const DOM = require('./util/dom');

const Game = function (size) {
  this.size = size;
  this.wormRadius = this.size / Game.WORM_SCALE;
  this.appleRadius = this.size / Game.APPLE_SCALE;
  this.keysPressed = [];
  this.dirtImage = Images.generateDirtImage(this.size, Game.BORDER_WIDTH);
  this.score = 0;
  this.state = 'NEW_GAME';
};

Game.BORDER_WIDTH = 2;
Game.WORM_SCALE = 40;
Game.APPLE_SCALE = 60;

Game.prototype.step = function (timeDelta) {
  if (this.state !== 'PLAYING') { return; }

  DOM.setScore(this.worm.length());

  if (this.worm.collidedWithSelf() || this.offBoard()) {
    this.state = 'GAME_OVER';
    return;
  }

  if (this.wormAppleCollision()) {
    this.worm.grow();
    this.worm.swallow();
    this._resetApple();
    return;
  }

  this.worm.step(timeDelta);
};

Game.prototype.offBoard = function () {
  const center = [this.size / 2, this.size / 2];
  let dist = Locations.distance(this.worm.head().location, center);
  dist += this.worm.head().radius;
  return (dist > (this.size / 2) - Game.BORDER_WIDTH);
};

Game.prototype.wormAppleCollision = function () {
  const dist = Locations.distance(this.worm.head().location, this.apple.location);
  return (dist < this.worm.head().radius + this.apple.radius);
};

Game.prototype.draw = function (ctx) {
  switch (this.state) {
    case 'PAUSED':
      DOM.showPopUp('PAUSED', 'Click to resume');
      break;
    case 'GAME_OVER':
      DOM.showPopUp('GAME OVER', 'Click to play again');
      break;
    case 'NEW_GAME':
      DOM.showPopUp('NEW GAME', 'Click to start');
      ctx.drawImage(this.dirtImage, 0, 0);
      break;
    case 'PLAYING':
      DOM.hidePopUp();
      ctx.clearRect(0, 0, this.size, this.size);
      ctx.drawImage(this.dirtImage, 0, 0);
      this.apple.draw(ctx);
      this.worm.draw(ctx);
  }
};

Game.prototype._reset = function () {
  this.worm = new Worm([this.size / 2, this.size / 2], this.wormRadius);
  this._resetApple();
  this.score = 0;
  this.state = 'PLAYING';
};

Game.prototype._resetApple = function () {
  const maxRadius = ((this.size - Game.BORDER_WIDTH) / 2) - (this.appleRadius * 2);
  do {
    const loc = Locations.randomLocation(this.size / 2, maxRadius);
    if (this.apple) {
      this.apple.location = loc;
    } else {
      this.apple = new Apple(loc, this.appleRadius);
    }
  } while (this.worm.collidedWith(this.apple.location, this.appleRadius));
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
    case 'NEW_GAME':
    debugger
    break
    case 'GAME_OVER':
      DOM.flipBoard();
      this._reset();
  }
};

module.exports = Game;
