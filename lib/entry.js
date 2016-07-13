const Game = require('./game.js');
const GameView = require('./game_view.js');

window.addEventListener('DOMContentLoaded', function () {
  const gameHeight = window.innerHeight - 50;
  const canvas = document.getElementById('game-canvas');
  canvas.width = gameHeight;
  canvas.height = gameHeight;

  const leftPane = document.getElementsByClassName('left-pane')[0];
  leftPane.style.height = `${gameHeight}px`;
  const rightPane = document.getElementsByClassName('right-pane')[0];
  rightPane.style.height = `${gameHeight}px`;

  const ctx = canvas.getContext("2d");
  const game = new Game(canvas.width);
  new GameView(game, ctx).start();
});
