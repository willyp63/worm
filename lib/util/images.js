const Locations = require('./locations.js');

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
