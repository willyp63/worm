/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	const Game = __webpack_require__(1);
	const GameView = __webpack_require__(5);
	const Images = __webpack_require__(6);
	
	window.addEventListener('DOMContentLoaded', function () {
	  // init game canvas
	  const gameCanvas = document.getElementById('game-canvas');
	  const gameHeight = window.innerHeight - 50;
	  gameCanvas.width = gameHeight;
	  gameCanvas.height = gameHeight;
	
	  // init bg canvas
	  const bgCanvas = document.getElementById('bg-canvas');
	  bgCanvas.width = window.innerWidth;
	  bgCanvas.height = window.innerHeight;
	  Images.drawGrassImage(bgCanvas);
	
	  // init panes
	  const leftPane = document.getElementsByClassName('left-pane')[0];
	  leftPane.style.height = `${gameHeight}px`;
	  const rightPane = document.getElementsByClassName('right-pane')[0];
	  rightPane.style.height = `${gameHeight}px`;
	
	  // init game
	  const ctx = gameCanvas.getContext("2d");
	  const game = new Game(gameCanvas.width);
	  new GameView(game, ctx).start();
	});


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	const Worm = __webpack_require__(2);
	const Apple = __webpack_require__(4);
	const Locations = __webpack_require__(3);
	const Images = __webpack_require__(6);
	
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
	  let dist = Locations.distance(this.worm.head().location, center) + this.worm.radius;
	  if (dist > (this.size / 2) - Game.BORDER_WIDTH) {
	    this.state = 'GAME_OVER';
	    return;
	  }
	
	  // check for self collision
	  if (this.worm.collidedWithSelf()) {
	    this.state = 'GAME_OVER';
	    return;
	  }
	
	  // check for worm-apple collision
	  dist = Locations.distance(this.worm.head().location, this.apple.location);
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


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	const Locations = __webpack_require__(3);
	const Link = __webpack_require__(7);
	
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


/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = {
	  randomLocation (center, size) {
	    const radius = Math.random() * size;
	    const theta = Math.random() * Math.PI * 2;
	    const dx = Math.cos(theta) * radius;
	    const dy = Math.sin(theta) * radius;
	    return [dx + center, dy + center];
	  },
	  randomPoint (width, height) {
	    return [Math.random() * width, Math.random() * height];
	  },
	  randomDirection () {
	    return Math.random() * Math.PI * 2;
	  },
	  advance (location, direction, distance, delta) {
	    const c = distance * delta;
	    const x = location[0] + (Math.cos(direction) * c);
	    const y = location[1] + (Math.sin(direction) * c);
	    return [x, y];
	  },
	  distance (location1, location2) {
	    const dx = location2[0] - location1[0];
	    const dy = location2[1] - location1[1];
	    return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
	  },
	  direction (location1, location2) {
	    return Math.atan2(location2[1] - location1[1], location2[0] - location1[0]);
	  }
	};


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	const Images = __webpack_require__(6);
	
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


/***/ },
/* 5 */
/***/ function(module, exports) {

	const GameView = function (game, ctx) {
	  this.ctx = ctx;
	  this.game = game;
	};
	
	GameView.prototype.bindKeyHandlers = function () {
	  const game = this.game;
	  window.addEventListener('keydown', game.handleKeyDown.bind(game));
	  window.addEventListener('keyup', game.handleKeyUp.bind(game));
	  const canvas = document.getElementById('game-canvas');
	  canvas.addEventListener('click', game.handleClick.bind(game));
	
	  const restart = document.getElementById('restart-button');
	  restart.addEventListener('click', game.reset.bind(game));
	  const pause = document.getElementById('pause-button');
	  pause.addEventListener('click', game.togglePause.bind(game));
	};
	
	GameView.prototype.start = function () {
	  this.bindKeyHandlers();
	  this.lastTime = 0;
	  // start the animation
	  requestAnimationFrame(this.animate.bind(this));
	};
	
	const NORMAL_FRAME_TIME_DELTA = 1000 / 60;
	GameView.prototype.animate = function (time) {
	  const timeDelta = (time - this.lastTime) / NORMAL_FRAME_TIME_DELTA;
	
	  this.game.step(timeDelta);
	  this.game.draw(this.ctx);
	  this.lastTime = time;
	
	  // every call to animate requests causes another call to animate
	  requestAnimationFrame(this.animate.bind(this));
	};
	
	module.exports = GameView;


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	const Locations = __webpack_require__(3);
	
	const Images = {
	  PEBBLE_COLORS: ['#E69849', '#EB9034', '#F0B57A', '#F5AF69', '#DE9B57'],
	  PEBBLE_BORDER_COLOR: '#6E3C0A',
	  DIRT_COLOR: "#F7A654"
	};
	
	module.exports = {
	  generateDirtImage (size, borderWidth) {
	    const dirtImage = document.createElement("canvas");
	    dirtImage.width = size;
	    dirtImage.height = size;
	    const ctx = dirtImage.getContext("2d");
	
	    // draw dirt circle
	    ctx.beginPath();
	    ctx.fillStyle = Images.DIRT_COLOR;
	    ctx.strokeStyle = '#000000';
	    ctx.lineWidth = borderWidth;
	    ctx.arc(size / 2, size / 2, (size - borderWidth) / 2, 0, 2 * Math.PI);
	    ctx.fill();
	    ctx.stroke();
	    ctx.closePath();
	
	    for (let i = 0; i < 50; i++) {
	      const randomRadius = Math.random() * 4 + 2;
	      const radius = ((size - borderWidth) / 2) - randomRadius;
	      const randomLocation = Locations.randomLocation(size / 2, radius);
	      ctx.beginPath();
	      const k = Math.floor(Math.random() * Images.PEBBLE_COLORS.length);
	      ctx.fillStyle = Images.PEBBLE_COLORS[k];
	      ctx.strokeStyle = Images.PEBBLE_BORDER_COLOR;
	      ctx.lineWidth = 1;
	      ctx.arc(randomLocation[0], randomLocation[1], randomRadius, 0, 2 * Math.PI);
	      ctx.fill();
	      ctx.stroke();
	      ctx.closePath();
	    }
	    return dirtImage;
	  },
	  drawGrassImage (canvas) {
	    const ctx = canvas.getContext("2d");
	    ctx.strokeStyle = '#006600';
	    ctx.lineWidth = 4;
	    for (let i = 0; i < 10000; i++) {
	      ctx.beginPath();
	      const p1 = Locations.randomPoint(canvas.width, canvas.height);
	      const p2 = Locations.advance(p1, Locations.randomDirection(), 25, 1);
	      ctx.moveTo(...p1);
	      ctx.lineTo(...p2);
	      ctx.stroke();
	      ctx.closePath();
	    }
	  },
	  loadAppleImage (callback) {
	    const appleImage = new Image();
	    appleImage.onload = function () {
	      callback(appleImage);
	    };
	    appleImage.src = 'assets/apple.png';
	  }
	};


/***/ },
/* 7 */
/***/ function(module, exports) {

	const Link = function (location, radius) {
	  this.location = location;
	  this.radius = radius;
	};
	
	Link.prototype.x = function () { return this.location[0]; };
	Link.prototype.y = function () { return this.location[1]; };
	
	module.exports = Link;


/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map