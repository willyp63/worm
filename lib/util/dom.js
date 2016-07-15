module.exports = {
  flipBoard () {
    // copy front canvas to back
    const backCanvas = document.getElementById('game-canvas-back');
    const canvas = document.getElementById('game-canvas');
    const backCtx = backCanvas.getContext("2d");
    backCtx.drawImage(canvas, 0, 0);

    // flip back to front
    const gameBoard = document.getElementById('game-board');
    backCanvas.style.transform = 'rotateY( 0deg )';
    canvas.style.transform = 'rotateY( 180deg )';
    gameBoard.style.transition = 'transform 0.75s';
    gameBoard.className = 'flipped';

    // swap canvases back again
    setTimeout(function () {
      gameBoard.style.transition = 'transform 0s';
      gameBoard.className = '';
      backCanvas.style.transform = 'rotateY( 180deg )';
      canvas.style.transform = 'rotateY( 0deg )';
    }, 1000);
  },
  showPopUp (mainText, subText) {
    const popup = document.getElementById('game-popup');
    popup.className = '';
    const popupText = document.getElementById('game-popup-text');
    popupText.innerHTML = mainText;
    const popupSubtext = document.getElementById('game-popup-subtext');
    popupSubtext.innerHTML = subText;
  },
  hidePopUp () {
    const popup = document.getElementById('game-popup');
    popup.className = 'hidden';
  },
  setScore (score) {
    const scoreEl = document.getElementById('score');
    scoreEl.innerHTML = `Score: ${score}`;
  }
};
