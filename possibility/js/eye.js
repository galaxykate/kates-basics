class Eye {
	// An eye with ... some physical characteristics, and some animations
	constructor({center}) {
		this.center = center
		console.log(this.center)
		this.curve = new PolarCurve(Array.from({length: 10}, (_,index) => {
			return KVector.polar({
				r:Math.random()*20 + index*5, 
				theta:index*.5,
				x:this.center.x, 
				y: this.center.y
			})
		}))

	}

	draw(p) {
		p.fill(100)
		// p.circle(this.center.x, this.center.y, 100)

		this.curve.draw(p)
	}
}


// given N points, set their polar control points
class PolarCurve {
	constructor(pts) {
		this.pts = pts.map(pt => new CurvePoint(pt))
	}
	draw(p) {
		this.pts.forEach(pt => pt.draw(p))

		let pts = this.pts
		p.noFill()
		p.stroke(100)
		p.beginShape()
		p.vertex(...pts[0])
		for (var i = 0; i < pts.length - 1; i++) {
			let pt0 = pts[i]
			let pt1 = pts[i + 1]
			p.bezierVertex(...pt0.cp1, ...pt1.cp0, ...pt1)
		}
		p.endShape()
	}
}

class CurvePoint {
	constructor(pt) {
		this.pt = pt
		this.cp0 = new ControlPoint(this.pt, 20, Math.random()*100)
		this.cp1 = new ControlPoint(this.pt, 20, Math.random()*100)
	}

	draw(p) {
		p.noStroke()
		p.fill(0, 100, 50)
		p.circle(this.pt.x, this.pt.y, 5)
		
		p.fill(170, 100, 60)
		p.stroke(170, 100, 30)
		p.line(...this, ...this.cp0)
		p.circle(...this.cp0, 5)

		p.fill(230, 100, 80)
		p.stroke(230, 100, 50)
		p.line(...this, ...this.cp1)
		p.circle(...this.cp1, 5)

	}

	[Symbol.iterator]() {
	    let index = 0;
	    const properties = [this.pt.x, this.pt.y];

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

class ControlPoint {
	constructor(pt, r, theta) {
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

	draw(p) {
		p.circle(this.x, this.y, 10)
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