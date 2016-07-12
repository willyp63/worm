const Util = require('./util.js');

const Images = {};
Images.PEBBLE_COLORS = ['#E69849', '#EB9034', '#F0B57A', '#F5AF69', '#DE9B57'];
Images.PEBBLE_BORDER_COLOR = '#6E3C0A';
Images.DIRT_COLOR = "#F7A654";

module.exports = {
  generateBackground (size, borderWidth) {
    const background = document.createElement("canvas");
    background.width = size;
    background.height = size;
    const ctx = background.getContext("2d");

    // draw background circle
    ctx.beginPath();
    ctx.fillStyle = Images.DIRT_COLOR;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = borderWidth;
    ctx.arc(size / 2, size / 2, (size - borderWidth) / 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();

    for (let i = 0; i < 30; i++) {
      const randomRadius = Math.random() * 4 + 2;
      const radius = ((size - borderWidth) / 2) - randomRadius;
      const randomLocation = Util.randomLocation(size / 2, radius);
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
    return background;
  }
};
