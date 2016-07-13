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
