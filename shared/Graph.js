// Nodes and edges

class Edge {
	constructor({start, end, baseLength=50}) {
		this.baseLength = baseLength
		this.start = start
		this.end = end
		this.v = new KVector(0,0)
		this.stretch = (Math.random() - .5)*200
	}

	update() {
		this.v.setToSub(this.end, this.start)
		this.stretch = this.v.length - this.baseLength
	}

	applyForce() {

	}

	ease(amt) {

	}

	draw({p}) {
		p.strokeWeight(this.stretch*.2 + 2)
		p.stroke(this.stretch + 100, 100, 50)
		// KVector.drawLineBetween({p, v0:this.start, v1:this.end})

		this.start.drawArrow({
			p,
			headSize: 30,
			v: this.v,
			color: [100, 100, 50]
		})
	}
}

class Graph {
	constructor({nodes}) {
		this.nodes = nodes
		this.edges = []
		this.updateVoronoi()
	}

	update() {
		this.edges.forEach(edge => edge.update())
	}


	updateVoronoi() {
		
		var voronoi = new Voronoi();
		var bbox = {xl: 0, xr: 800, yt: 0, yb: 600}; // xl is x-left, xr is x-right, yt is y-top, and yb is y-bottom
		let v = voronoi.compute(this.nodes, bbox);
		
		// Do we already have all these edges?
		v.edges.forEach(edge => {
			// console.log(edge)
			if (edge.lSite&&edge.rSite) {
				// Real edge
				
				let e2 = this.getEdgeBetween(edge.lSite, edge.rSite)
				if (!e2) {
					console.log("Make edge", edge.lSite.idNumber, edge.rSite.idNumber)
					this.edges.push(new Edge({
						start: edge.lSite,
						end: edge.rSite
					}))
				}
			}
		})
	}

	getEdgeBetween(v0, v1) {
		return this.edges.filter(e => (e.start === v0 && e.end === v1) || (e.start === v1 && e.end === v0))[0]
	}

	draw({p}) {
		p.circle(100, 100, 100)
		this.edges.forEach(edge => {
			edge.draw({p})
		})
	}
}