class Edge {
	constructor(p0, p1) {
		this.p0 = p0
		this.p1 = p1
		// Wrap these points with edge controls
		this.cp0 = new ControlPoint(p0, 20, Math.random()*100)
		this.cp1 = new ControlPoint(p1, 20, Math.random()*100)

	}

	draw(p) {
		p.stroke(0)
		p.line(...this.p0, ...this.p1)
	}
}

class ControlPoint {
	constructor(pt, r=0, theta) {
		this.pt = pt
		this.r = r
		this.theta = theta
	}

	get x() {
		return this.pt.x + this.r*Math.cos(this.theta)
	}
	get y() {
		return this.pt.y + this.r*Math.sin(this.theta)
	}

	[Symbol.iterator]() {
    let index = 0;
    const properties = [this.x, this.y];

    return {
      next: () => {
        if (index < properties.length) {
          return { value: properties[index++], done: false };
        } else {
          return { done: true };
        }
      }
    };
  }
}