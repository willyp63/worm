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
	const GameView = __webpack_require__(7);
	const Images = __webpack_require__(6);
	
	window.addEventListener('DOMContentLoaded', function () {
	  // init game canvas
	  const gameCanvas = document.getElementById('game-canvas');
	  const gameCanvasBack = document.getElementById('game-canvas-back');
	  const gameView = document.getElementsByClassName('game-view')[0];
	  const gameHeight = window.innerHeight - 50;
	  gameCanvas.width = gameHeight;
	  gameCanvas.height = gameHeight;
	  gameCanvasBack.width = gameHeight;
	  gameCanvasBack.height = gameHeight;
	  gameView.style.width = `${gameHeight}px`;
	  gameView.style.height = `${gameHeight}px`;
	
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
	const Apple = __webpack_require__(5);
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
	Game.BORDER_WIDTH = 2;
	
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
	
	  // update score
	  const scoreEl = document.getElementById('score');
	  scoreEl.innerHTML = `Score: ${this.worm.length()}`;
	
	  // check if worm is off board
	  const center = [this.size / 2, this.size / 2];
	  let dist = Locations.distance(this.worm.head().location, center);
	  dist += this.worm.head().radius;
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
	  if (dist < this.worm.head().radius + this.apple.radius) {
	    this.worm.grow();
	    this.worm.swallow();
	    this._resetApple();
	    return;
	  }
	
	  this.worm.step(timeDelta);
	};
	
	Game.prototype._resetApple = function () {
	  const radius = ((this.size - Game.BORDER_WIDTH) / 2) - (this.appleRadius * 2);
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
	    const popup = document.getElementById('game-popup');
	    popup.className = '';
	    const popupText = document.getElementById('game-popup-text');
	    popupText.innerHTML = 'PAUSED';
	    const popupSubtext = document.getElementById('game-popup-subtext');
	    popupSubtext.innerHTML = 'Click to resume';
	    return;
	  } else if (this.state === 'GAME_OVER') {
	    const popup = document.getElementById('game-popup');
	    popup.className = '';
	    const popupText = document.getElementById('game-popup-text');
	    popupText.innerHTML = 'GAME OVER';
	    const popupSubtext = document.getElementById('game-popup-subtext');
	    popupSubtext.innerHTML = 'Click to play again';
	    return;
	  } else {
	    const popup = document.getElementById('game-popup');
	    popup.className = 'hidden';
	  }
	
	  // clear canvas
	  ctx.clearRect(0, 0, this.size, this.size);
	
	  // draw background circle
	  ctx.drawImage(this.dirtImage, 0, 0);
	
	  this.apple.draw(ctx);
	  this.worm.draw(ctx);
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
	      this.flipBoard();
	      this.reset();
	      break;
	  }
	};
	
	Game.prototype.flipBoard = function () {
	  const backCanvas = document.getElementById('game-canvas-back');
	  const canvas = document.getElementById('game-canvas');
	  const backCtx = backCanvas.getContext("2d");
	  backCtx.drawImage(canvas, 0, 0);
	
	  const gameBoard = document.getElementById('game-board');
	  backCanvas.style.transform = 'rotateY( 0deg )';
	  canvas.style.transform = 'rotateY( 180deg )';
	  gameBoard.style.transition = 'transform 0.75s';
	  gameBoard.className = 'flipped';
	
	  setTimeout(function () {
	    gameBoard.style.transition = 'transform 0s';
	    gameBoard.className = '';
	    backCanvas.style.transform = 'rotateY( 180deg )';
	    canvas.style.transform = 'rotateY( 0deg )';
	  }, 1000);
	};
	
	module.exports = Game;


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	const Locations = __webpack_require__(3);
	const Link = __webpack_require__(4);
	
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
	  if (this.swallowCount < -Worm.SWALLOW_PERIOD / 3) {
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
	  if (this.swallowing) {
	    if (this.swallowCount > 0) {
	      this.swallowCount *= -1;
	    }
	  } else {
	    this.swallowing = true;
	    this.swallowCount = -Worm.SWALLOW_PERIOD;
	    this.platoCount = 0;
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
/***/ function(module, exports) {

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
	    this.radius -= 0.05;
	  }
	  if (this.radius < minRadius) {
	    this.radius = minRadius;
	  }
	};
	
	Link.prototype.x = function () { return this.location[0]; };
	Link.prototype.y = function () { return this.location[1]; };
	
	module.exports = Link;


/***/ },
/* 5 */
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
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	const Locations = __webpack_require__(3);
	
	const Images = {
	  PEBBLE_COLORS: ['#E69849', '#EB9034', '#F0B57A', '#F5AF69', '#DE9B57'],
	  PEBBLE_BORDER_COLOR: '#6E3C0A',
	  DIRT_COLOR: "#F7A654",
	  DIRT_BORDER_COLOR: "#7A3E00",
	  GRASS_COLORS: ['#148C14', '#0BB80B', '#038503', '#4C6B15', '#598C00']
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
	    ctx.strokeStyle = Images.DIRT_BORDER_COLOR;
	    ctx.lineWidth = borderWidth;
	    ctx.arc(size / 2, size / 2, (size - borderWidth) / 2, 0, 2 * Math.PI);
	    ctx.fill();
	    ctx.stroke();
	    ctx.closePath();
	
	    for (let i = 0; i < 50; i++) {
	      const randomRadius = Math.random() * 3 + 2;
	      const radius = ((size - borderWidth) / 2) - (randomRadius * 2);
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
	    for (let i = 0; i < 20000; i++) {
	      ctx.lineWidth = Math.random() * 2 + 1;
	      const k = Math.floor(Math.random() * Images.GRASS_COLORS.length);
	      ctx.strokeStyle = Images.GRASS_COLORS[k];
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
	    appleImage.src = 'assets/images/apple.png';
	  }
	};


/***/ },
/* 7 */
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
	  const popup = document.getElementById('game-popup');
	  popup.addEventListener('click', game.handleClick.bind(game));
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


/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map