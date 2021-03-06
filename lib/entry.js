const Game = require('./game.js');
const GameView = require('./game_view.js');
const Images = require('./util/images');

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
