import { SketchPlugin } from "@components/page-partials/pages/experimental/2d-canvas/2d-sketch/init";

export function GraphPlugin(): SketchPlugin {
  let disposed = false;
  const numPoints = 1001;
  const numGrad = 1;
  const xRange = 6;
  let xStep;

  function createGraph(ctx: CanvasRenderingContext2D) {
    const graph = new Graph(
      ctx,
      -5,
      5,
      -5,
      5,
      window.innerWidth / 2,
      window.innerHeight / 2,
      window.innerWidth,
      window.innerHeight
    );
    graph.drawGrid(10, 0.2, 2, 0.5);
    graph.drawAxes("x", "y");
    const xA = [];
    const yA = [];
    // calculate function
    xStep = xRange / (numPoints - 1);
    for (let i = 0; i < numPoints; i++) {
      xA[i] = (i - numPoints / 2) * xStep;
      yA[i] = f(xA[i]);
    }
    graph.plot(xA, yA, "#ff0000", false, true); // plot function
    // calculate gradient function using forward method
    const xAr = [];
    const gradA = [];
    for (let j = 0; j < numPoints - numGrad; j++) {
      xAr[j] = xA[j];
      gradA[j] = grad(xA[j], xA[j + numGrad]);
    }

    graph.plot(xAr, gradA, "#0000ff", false, true); // plot gradient function
    // calculate integral using forward method
    const xAi = [];
    const integA = [];
    xAi[0] = -3;
    integA[0] = 9;
    for (let k = 1; k < numPoints; k++) {
      xAi[k] = xA[k];
      integA[k] = integA[k - 1] + f(xA[k - 1]) * (xA[k] - xA[k - 1]);
    }
    graph.plot(xAi, integA, "#00ff00", false, true); // plot integral
  }

  return {
    id: "graph",
    name: "Graph",
    mount(ctx) {
      createGraph(ctx);
    },
    frame() {
      if (disposed) return;
      // статичний — нічого в кадрі не робить
    },
    onResize(ctx) {
      createGraph(ctx);
    },
    dispose() {
      disposed = true;
      // тут можна звільнити ресурси
    },
  };
}

function f(x: number) {
  const y = 2 * x;
  return y;
}
function grad(x1: number, x2: number) {
  return (f(x1) - f(x2)) / (x1 - x2);
}
// function integ(x1: number, x2: number) {
//   return (f(x1) - f(x2)) / (x1 - x2);
// }

class Graph {
  // canvas context on which to draw graph instance
  private ctx: CanvasRenderingContext2D;
  // location of origin (in pixels) in parent document
  private x_orig: number;
  private y_orig: number;
  // min and max of x and y relative to origin (in pixels)
  private x_min_rel: number;
  private x_max_rel: number;
  private y_min_rel: number;
  private y_max_rel: number;
  // obvious
  private x_tick_major!: number;
  private x_tick_minor!: number;
  private y_tick_major!: number;
  private y_tick_minor!: number;
  // scaling used in displaying values on the axes
  private x_displ_scal: number;
  private y_displ_scal: number;
  // width and height of textbox used for displaying values on the axes
  // this should not have to be tampered with (I hope)
  private tw: number = 15;
  private th: number = 20;
  // declarations for quantities to be used later
  private x_min: number;
  private x_max: number;
  private y_min: number;
  private y_max: number;
  private x_displ!: number;
  private y_displ!: number;
  private txpos: number;
  private typos: number;
  constructor(
    context: CanvasRenderingContext2D,
    xmin: number,
    xmax: number,
    ymin: number,
    ymax: number,
    x0: number,
    y0: number,
    xwidth: number,
    ywidth: number
  ) {
    // assign parameter values based on specified arguments
    this.ctx = context;
    this.x_orig = x0;
    this.y_orig = y0;
    //
    this.x_displ_scal = (xmax - xmin) / xwidth;
    this.y_displ_scal = (ymax - ymin) / ywidth;
    //
    this.x_min_rel = xmin / this.x_displ_scal;
    this.x_max_rel = xmax / this.x_displ_scal;
    this.y_min_rel = ymin / this.y_displ_scal;
    this.y_max_rel = ymax / this.y_displ_scal;
    // convert to absolute coordinates
    this.x_min = this.x_min_rel + this.x_orig;
    this.x_max = this.x_max_rel + this.x_orig;
    this.y_min = this.y_orig - this.y_min_rel;
    this.y_max = this.y_orig - this.y_max_rel;
    this.txpos = this.x_orig - this.tw;
    this.typos = this.y_orig;
  }

  drawGrid(xmajor: number, xminor: number, ymajor: number, yminor: number) {
    this.x_tick_major = xmajor / this.x_displ_scal;
    this.x_tick_minor = xminor / this.x_displ_scal;
    this.y_tick_major = ymajor / this.y_displ_scal;
    this.y_tick_minor = yminor / this.y_displ_scal;
    // draw major grid lines
    this.ctx.strokeStyle = "#999999";
    this.ctx.lineWidth = 0.3;
    this.ctx.beginPath();

    for (let y = this.y_max; y <= this.y_min; y += this.y_tick_major) {
      this.ctx.moveTo(this.x_min, y);
      this.ctx.lineTo(this.x_max, y);
    }

    for (let x = this.x_min; x <= this.x_max; x += this.x_tick_major) {
      this.ctx.moveTo(x, this.y_min);
      this.ctx.lineTo(x, this.y_max);
    }
    this.ctx.stroke();
    // draw minor grid lines
    this.ctx.strokeStyle = "#cccccc";
    this.ctx.lineWidth = 0.3;
    this.ctx.beginPath();

    for (let y = this.y_max; y <= this.y_min; y += this.y_tick_minor) {
      this.ctx.moveTo(this.x_min, y);
      this.ctx.lineTo(this.x_max, y);
    }

    for (let x = this.x_min; x <= this.x_max; x += this.x_tick_minor) {
      this.ctx.moveTo(x, this.y_min);
      this.ctx.lineTo(x, this.y_max);
    }
    this.ctx.stroke();
    //display values
    this.ctx.font = "10pt Arial";
    this.ctx.fillStyle = "#ffffff";
    this.ctx.textAlign = "right";
    this.ctx.textBaseline = "top";

    for (let y = this.y_max; y <= this.y_min; y += this.y_tick_major) {
      this.y_displ = (this.y_orig - y) * this.y_displ_scal;
      this.ctx.fillText(
        this.y_displ.toString(),
        this.txpos + 5,
        y - this.th / 2
      );
    }
    this.ctx.textAlign = "left";
    this.ctx.textBaseline = "top";

    for (let x = this.x_min; x <= this.x_max; x += this.x_tick_major) {
      this.x_displ = (x - this.x_orig) * this.x_displ_scal;
      this.ctx.fillText(
        this.x_displ.toString(),
        x - this.tw + 10,
        this.typos + 5
      );
    }
  }

  drawAxes(xlabel = "x", ylabel = "y") {
    this.ctx.strokeStyle = "#fff";
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(this.x_min, this.y_orig);
    this.ctx.lineTo(this.x_max, this.y_orig);
    this.ctx.moveTo(this.x_orig, this.y_min);
    this.ctx.lineTo(this.x_orig, this.y_max);
    this.ctx.stroke();
    //axis labels
    this.ctx.font = "12pt Arial";
    this.ctx.fillStyle = "#fff";
    this.ctx.textAlign = "left";
    this.ctx.textBaseline = "top";
    this.ctx.fillText(
      xlabel,
      this.x_max + 0.75 * this.tw,
      this.typos - this.th / 2
    );
    this.ctx.fillText(
      ylabel,
      this.txpos + this.tw / 2 + 5,
      this.y_max - 1.5 * this.th
    );
  }

  plot(
    xArr: number[],
    yArr: number[],
    pColor = "#0000ff",
    pDots = true,
    pLine = true
  ) {
    let xpos = this.x_orig + xArr[0] / this.x_displ_scal;
    let ypos = this.y_orig - yArr[0] / this.y_displ_scal;
    this.ctx.strokeStyle = pColor;
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(xpos, ypos);
    this.ctx.arc(xpos, ypos, 1, 0, 2 * Math.PI, true);
    for (let i = 1; i < xArr.length; i++) {
      xpos = this.x_orig + xArr[i] / this.x_displ_scal;
      ypos = this.y_orig - yArr[i] / this.y_displ_scal;
      if (pLine) {
        this.ctx.lineTo(xpos, ypos);
      } else {
        this.ctx.moveTo(xpos, ypos);
      }
      if (pDots) {
        this.ctx.arc(xpos, ypos, 1, 0, 2 * Math.PI, true);
      }
    }
    this.ctx.stroke();
  }
}
