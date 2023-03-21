const PHI = 1.618033;

function dequeue(selections) {
  const ret = selections.shift();
  selections.push(ret);
  return ret;
}

function range(size, startAt = 0) {
  return [...Array(size).keys()].map(i => i + startAt);
}

function getGfxCtx() {
  /** @type {HTMLCanvasElement}  */
  const canvas = document.getElementById("canvas0");
  /** @type {CanvasRenderingContext2D} */
  const ctx = canvas.getContext("2d");
  
  return [canvas, ctx];
}

function fillRect(
  /** @type {CanvasRenderingContext2D}*/ 
  gfx,
  color,
  x,
  y,
  w,
  h
) {
  gfx.fillStyle = color;
  gfx.fillRect(x, y, w, h);
}

const QUADRANT = {
  I: 1,
  II: 2,
  III: 3,
  IV: 4
};

function idRectQuad(x, y) {
  /* coordinates are I (+; +), II (−; +), III (−; −), and IV (+; −).  */

  /* get coordinate of rect not at origin */
  if (y === 0) {
    y--;
  }
  if (x === 0) {
    x++;
  }

  if (x >= 1 && y >= 1) {
    return QUADRANT.I;
  }
  if (x <= -1 && y >= 1) {
    return QUADRANT.II;
  }
  if (x <= -1 && y <= -1) {
    return QUADRANT.III;
  }
  if (x >= 1 && y <= -1) {
    return QUADRANT.IV;
  }

  throw new RangeError("out of range of grid");
  
}

function constructSpiral() {
  /** @type {number[][][]} */ 
  const quadrants = [[], [], [], []];

  const [i, ii, iii, iv] = quadrants;
  
  const cartesianGrid = 
    range(8, -3)
    .map(
      y => [y, range(8, -4)]
    );

  
  for (const [y, xs] of cartesianGrid) {
    for (const x of xs) {
      const id = idRectQuad(x, y);
      switch (id) {
        case QUADRANT.I:
          i.push([x, y]);
          break;
        case QUADRANT.II:
          ii.push([x, y]);
          break;
        case QUADRANT.III:
          iii.push([x, y]);
          break;
        case QUADRANT.IV:
          iv.push([x, y]);
          break;
        default: throw null;
      }
    }
  }

  /*closer to zero up first */
  i.sort((a,b) => a[0] - b[0] + a[1] - b[1]);
  ii.sort((a,b) => b[0] - a[0] + a[1] - b[1]);
  iii.sort((a,b) => b[0] - a[0] + b[1] - a[1]);
  iv.sort((a,b) => a[0] - b[0] + b[1] - a[1]);

  const spiral = [];
  for (let index = 0; index < 16; index++) {
    spiral.push(i[index]);
    spiral.push(ii[index]);
    spiral.push(iii[index]);
    spiral.push(iv[index]);
  }

  return spiral;
}  

const colors =  [
  "black",
  "red",
  "yellow",
  "whitesmoke"
];

function changePhase(phase) {
  const {gfx, spiral, spaceUnit} = phase;

  const fillSpace = (color, x, y) =>
    gfx.clearRect(x*spaceUnit, y*-spaceUnit, spaceUnit, spaceUnit) ||
    fillRect(gfx, color, x*spaceUnit, y*-spaceUnit, spaceUnit, spaceUnit);

  const [x, y] = dequeue(spiral);
  const color = dequeue(colors);
  fillSpace(color, x, y);

  if (phase.index++ >= 63) {
    phase.index = 0;
    dequeue(colors);
  }
}

function codex() {
  const [canvas, gfx] = getGfxCtx();
  const spaceArea = canvas.width / PHI;
  const spaceUnit = spaceArea / 8;
  const origin = spaceUnit * 4;
  gfx.translate(origin, origin);

  const spiral = constructSpiral();
  const phase = {gfx, spiral, spaceUnit, index: 0};
  
  setInterval(changePhase, 1000/13, phase)
}
