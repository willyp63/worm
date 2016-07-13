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
