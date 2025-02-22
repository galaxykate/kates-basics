// Kate-brand vectors
// A vector class that allows both v.x, v.y, v.z and spread notation [...v]
// With a hack at the end to avoid needing to do inheritance so we don't mess up Vue2
// (no indexing v[0], which is a bit annoying)
class KVector {
	static getClosest({ arr, pt, range = 1000, getRadius }) {
		if (!arr)
			throw("No array")
		if (!pt)
			throw("No target pt")
		let r0 = getRadius?.(pt) || 0
		let closest = undefined
		arr.forEach(pt0 => {
			let d = this.distance(pt, pt0)
			if (getRadius)
				d -= getRadius(pt0)
			if (d < range) {
				range = d
				closest = pt0
			}
		})
		// console.log(closest, range)
		
		return closest
	}

	static getDistancesTo({ arr, pt }) {
		return arr.map(pt0 => [pt0, this.distance(pt0, pt1)])
	}


	static toPolarOffsetArray({pt,  r=0, theta=1, phi = 0, x = 0, y = 0, z = 0, dim=3}) {
		return [pt.x + x + r*Math.cos(phi) * Math.cos(theta),
			 pt.y + y + r*Math.cos(phi) * Math.cos(theta),
			pt.z + z + r*Math.sin(phi)]
	}

	static polar({ r, theta, phi = 0, x = 0, y = 0, z = 0, dim=3}) {
	
		let pt =  new KVector(r * Math.cos(phi) * Math.cos(theta) + x, r * Math.cos(phi) * Math.sin(theta) + y, r * Math.sin(phi) + z);
		pt.dim = dim
		return pt
	}

	static sub(pt0, pt1) {
		return new KVector(pt0.x - pt1.x, pt0.y - pt1.y, pt0.z - pt1.z);
	}

	static lerp(pt0, pt1, pct) {
		let p = new KVector(0, 0, 0);
		p.setToLerp(pt0, pt1, pct)
		return p
	}


	static edgePoint(...args) {
		return new KVector().setToEdgePoint(...args);
	}

	static distance(v1, v2) {
		if (!isNaN(v1.z) && !isNaN(v2.z))
		return Math.sqrt((v1.x - v2.x) ** 2 + (v1.y - v2.y) ** 2 + (v1.z - v2.z) ** 2);
		return Math.sqrt((v1.x - v2.x) ** 2 + (v1.y - v2.y) ** 2);
	}

	static addMultiple(...args) {
		return new KVector().addMultiple(...args);
	}

	static lerpVertex({ p, v0, v1, pct = 0.5, n = 0 }) {
		if (Array.isArray(v0))
			v0 = { x: v0[0], y: v0[1], z: v0[2] || 0 };
		if (Array.isArray(v1))
			v1 = { x: v1[0], y: v1[1], z: v1[2] || 0 };
		let dx = v1.x - v0.x;
		let dy = v1.y - v0.y;
		let dz = v1.z - v0.z;
		let m = Math.sqrt(dx * dx + dy * dy + dz * dz);
		let x = v0.x + pct * dx + dy * n / m;
		let y = v0.y + pct * dy + -dx * n / m;
		let z = v0.z + pct * dz;

		p.vertex(x, y, z);
	}


	static bezierVertex({ p, v0, v1, r0, theta0, r1, theta1 }) {
		p.bezierVertex(
			v0.x + r0 * Math.cos(theta0), v0.y + r0 * Math.sin(theta0),
			v1.x + r1 * Math.cos(theta1), v1.y + r1 * Math.sin(theta1),
			v1.x, v1.y)
	}

	static drawLineBetween({ p, v0, v1, normalOffset = 0, startOffset = 0, endOffset = 0, color }) {
		// TODO normal and offsets
		p.line(v0.x, v0.y, v1.x, v1.y)
	}

	/**
	 * ===========================================================================
	 * Constructors
	 **/

	constructor(x = 0, y = 0, z) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.dim = z !== undefined? 3:2
		

		if (x.x !== undefined) {
			// console.log("cline")
			this.x = x.x
			this.y = x.y
			this.z = x.z ?? 0
		}

		if (Array.isArray(x)) {
			
			this.x = x[0]
			this.y = x[1]
			this.z = x[2] ?? 0
			this.dim = x.length
		}
		// console.log(x, y, z)
	}

	clone() {
		return new KVector(this.x, this.y, this.z);
	}

	clonePolar({r, theta=Math.PI, phi=0, x=0, y=0, z=0}) {
		let x0 = x + this.x + r*Math.cos(theta)*Math.cos(phi)
		let y0 = y + this.y + r*Math.sin(theta)*Math.cos(phi)
		let z0 = z + this.z + r*Math.sin(phi)
		
		return new KVector(x0, y0, z0);
	}

	

	/**
	   * ===========================================================================
	   * Getters 
	   **/

	// Iterate over properties including z
	[Symbol.iterator]() {
		let index = 0;

		const properties = this.dim == 3?[this.x, this.y, this.z]:[this.x, this.y];

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

	map(fxn) {
		return [this.x, this.y, this.z].map(fxn)
	}

	// Remap this point between spaces
	remap(bb0, bb1) {
		function remap(v, v0, v1, nv0, nv1) {
			let pct = (v - v0) / (v1 - v0)
			return pct * (nv1 - nv0) + nv0
		}

		// Is this bounding box {xywh} or [[x0,][x1,]

		this.x = remap(this.x, bb0.x, bb0.x + bb0.w, bb1.x, bb1.x + bb1.w)
		this.y = remap(this.y, bb0.y, bb0.y + bb0.h, bb1.y, bb1.y + bb1.h)
		this.z = remap(this.z, bb0.z, bb0.z + bb0.d, bb1.z, bb1.z + bb1.d)
		return this
	}

	get isValid() {
		if (this.dim === 3)
		return !isNaN(this.x) && !isNaN(this.y) && !isNaN(this.z)


		return !isNaN(this.x) && !isNaN(this.y)
	}

	get angle() {
		return Math.atan2(this.y, this.x)
	}

	get magnitude() {
		return Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2)
	}

	getDistanceTo(v) {
		let d = (this.x - v.x) ** 2 + (this.y - v.y) ** 2

		if (!isNaN(v.z) && !isNaN(this.z))
			d += (this.z - v.z) ** 2

		// console.log(this.x, v.x, d)
		return Math.sqrt(d)
	}

	getAngleTo(v) {
		return Math.atan2(v.y - this.y, v.x - this.x)
	}

	getNormal() {
		let m = this.magnitude() || 1
		return new KVector(this.y / m, -this.x / m)
	}

	getClosest(pts, { getPosition, getRadius, range = 20 } = {}) {
		let closest = undefined;
		let closestDistance = range;
		pts.forEach(pt => {
			let pos = getPosition ? getPosition(pt) : pt
			const radius = getRadius ? getRadius(pt) : pt.radius || 0; // Default radius to 0 if not provided

			// Calculate the distance between the point and the particle
			const distance = Math.sqrt((this.x - pos.x) ** 2 + (this.y - pos.y) ** 2) - radius;

			// Update the closest particle if this particle is closer
			if (distance < closestDistance) {
				closestDistance = distance;
				closest = pt;
			}


		})

		return closest;
	}

	isWithin(x0, x1, y0, y1, z0, z1) {
		let v0 = this.x >= x0 && this.x <= x1 && this.y >= y0 && this.y <= y1

		if (z0 !== undefined) {
			v0 = v0 && this.z >= z0 && this.z <= z1
		}
	}

	/**
	* ===========================================================================
	* Setters 
	**/

	setTo(...args) {
		// Convert this arg into x,y,z

		let x = args[0]
		let y = args[1]
		let z = args[2]

		if (!isNaN(args[0]) && !isNaN(args[1])) {
			// Number args?
			// Do nothing
		} else if (typeof args[0] == "object" && !isNaN(args[0].x) && !isNaN(args[0].y)) {
			// We think its {x:5,y:10} e.g.
			x = args[0].x
			y = args[0].y
			z = args[0].z
		} else if (Array.isArray(args[0]) && !isNaN(args[0][0]) && !isNaN(args[0][1])) {
			// we think its [5,10]
			x = args[0][0]
			y = args[0][1]
			z = args[0][2]
		} else {
			console.warn("non-vector args:", args)
		}

		this.x = x
		this.y = y
		if (z !== undefined)
			this.z = z

		return this
	}


	setToAverage(pts) {
		if (pts.length > 0) {
			this.mult(0)
			pts.forEach(pt => this.add(pt))
			this.mult(1 / pts.length)
		}
		return this
	}


	setToEdgePoint({ pt0, pt1, v, pct = 0, edgeOffset = 0, normalOffset = 0 }) {
		// Set to a point on the edge, somewhere (pct) between pt0, and pt1, 
		// Or from pt0 along a vector v
		// it may be offset some distance with the normal (n) 
		// it may be offset some distance along the direction of the edge (m) 
		// console.log(this.magnitude)

		// No vector, just use the two endpoints
		if (!v)
			v = new KVector(pt1.x - pt0.x, pt1.y - pt0.y)


		let mag = v.magnitude || 1


		let ex = v.x / mag
		let ey = v.y / mag

		let nx = ey
		let ny = -ex

		this.x = pt0.x + v.x * pct + nx * normalOffset + ex * edgeOffset
		this.y = pt0.y + v.y * pct + ny * normalOffset + ey * edgeOffset
		this.z = pt0.z + v.z * pct
		return this
	}

	setToPolar({ r, theta, phi=0, x=0, y=0, z=0 }) {
		this.x = r * Math.cos(theta) * Math.cos(phi) + x
		this.y = r * Math.sin(theta) * Math.cos(phi) + y
		// this.z = r * Math.sin(phi) + z
		return this
	}


	setToLerp(v0, v1, pct) {
		this.x = v0.x * (1 - pct) + v1.x * pct
		this.y = v0.y * (1 - pct) + v1.y * pct
		this.z = v0.z * (1 - pct) + v1.z * pct
		return this
	}

	setToAddMultiple(...args) {
		this.mult(0)
		this.addMultiple(...args)
		return this
	}

	setToMultiple(m, v) {
		if (isNaN(m)) {
			throw ("Non numeric m", m)
		}
		this.x = m * v.x
		this.y = m * v.y
		if (v.z !== undefined)
			this.z = m * v.z
		return this
	}

	setToAdd(...args) {
		this.mult(0)
		this.add(...args)

		return this
	}

	setToSub(pt0, pt1) {
		this.x = pt0.x - pt1.x
		this.y = pt0.y - pt1.y
		this.z = pt0.z - pt1.z
		return this
	}


	setToDifference(pt1, pt0) {
		this.x = pt0.x - pt1.x
		this.y = pt0.y - pt1.y
		this.z = pt0.z - pt1.z
		return this
	}

	// =========
	// Adders/Multipliers

	constrain(min, max) {
		let m = this.magnitude
		let m2 = Math.min(max, Math.max(min, m))

		// skip if mag 0
		if (m)
			this.mult(m2 / m)
		return this
	}

	wrap(x0, y0, x1, y1, z0, z1) {
		// Off right
		if (this.x > x1)
			this.x = x0

		// Off left
		if (this.x < x0)
			this.x = x1

		// Off the bottom
		if (this.y > x1)
			this.y = y0

		// Off the top
		if (this.y < y0)
			this.y = y1
		return this


		// Off the back
		if (this.z > z1 && z1 !== undefined)
			this.z = z0

		// Off the front
		if (this.z < z0 && z0 !== undefined)
			this.z = z1
		return this
	}

	lerpTo(pt, pct) {
		this.x = (1 - pct) * this.x + pct * pt.x
		this.y = (1 - pct) * this.y + pct * pt.y
		this.z = (1 - pct) * this.z + pct * pt.z
		return this
	}

	normalize() {
		let m = this.magnitude || 1
		this.div(m)
		return this
	}

	div(m) {
		this.x /= m
		this.y /= m
		this.z /= m
		return this
	}


	mult(m) {
		this.x *= m
		this.y *= m
		this.z *= m
		return this
	}

	invert() {
		this.x *= -1
		this.y *= -1
		this.z *= -1
		return this
	}



	/**
	 * ===========================================================================
	 * Adding
	 **/

	addPolar({ r, theta, x = 0, y = 0 }) {
		this.x += r * Math.cos(theta) + x;
		this.y += r * Math.sin(theta) + y;
		return this;
	}

	addMultiple(...args) {

		// Takes alternating params of KVector (or anything with x,y) and scalars

		// Ensure we have an even number of arguments
		if (args.length % 2 !== 0) {
			throw new Error("Expecting an even number of arguments. Pairs of KVector (or similar) and scalars are required.");
		}

		for (let i = 0; i < args.length / 2; i++) {
			// Expecting a Point instance at even indices
			let v = args[i * 2]
			let m = args[i * 2 + 1]

			// Check if the vector has x and y properties
			if (typeof v.x !== 'number' || typeof v.y !== 'number') {
				console.warn(v)
				throw new Error(`Expecting an object with x and y properties at index ${i * 2}.`);
			}

			// Check if the scalar is a number
			if (typeof m !== 'number') {
				console.warn(m)
				throw new Error(`Expecting a number at index ${i * 2 + 1}. Got ${typeof m}`);
			}


			this.x += m * v.x;
			this.y += m * v.y;
			if (v.z !== undefined)
				this.z += m * v.z;
		}
		return this
	}

	offset(x, y, z) {
		this.x += x
		this.y += y

		if (z !== undefined)
			this.z += z
		return this
	}

	add(...points) {
		// Takes parameters of KVector (or anything with x,y)
		for (const point of points) {
			this.x += point.x;
			this.y += point.y;
			if (point.z !== undefined)
				this.z += point.z;
		}


		return this
	}

	sub(...points) {
		// Takes parameters of KVector (or anything with x,y)
		for (const point of points) {
			this.x -= point.x;
			this.y -= point.y;
			if (point.z !== undefined)
				this.z -= point.z;
		}


		return this
	}

	rotate(theta) {
		let x = this.x
		let y = this.y
		this.x = x * Math.cos(theta) - y * Math.sin(theta)
		this.y = x * Math.sin(theta) + y * Math.cos(theta)
		return this
	}

	inRegion(pts) {
		let { x, y } = this;
		let inside = false;
		
		for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
		  let xi = pts[i].x, yi = pts[i].y;
		  let xj = pts[j].x, yj = pts[j].y;
		  
		  let intersect = ((yi > y) !== (yj > y)) &&
						  (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
		  if (intersect) inside = !inside;
		}
	
		return inside;
	}

	/**
	* ===========================================================================
	* Drawing
	**/


	polarOffsetVertex(p, r, theta) {
		p.vertex(this.x + r * Math.cos(theta), this.y + r * Math.sin(theta))
	}

	offsetVertex(p, v, m) {
		p.vertex(this.x + m * v.x, this.y + m * v.y)
	}

	vertex({p, v, m=1, r=0, theta=0, lerpTo, lerpPct=0, curve}) {
		let mx = v?m*v.x:0
		let my = v?m*v.y:0
		let dx = lerpTo?lerpTo.x - this.x:0
		let dy = lerpTo?lerpTo.y - this.y:0

		
		
		p[curve?"curveVertex":"vertex"](
			this.x + mx + r * Math.cos(theta) + dx*lerpPct, 
			this.y + my + r * Math.sin(theta) + dy*lerpPct)
		
	}

	draw({p, radius = 10, r=0, theta=0, x=0, y=0, vMult=0, v, uMult=0, u}) {
		let x0 = this.x + r*Math.cos(theta) + x
		let y0 = this.y + r*Math.sin(theta) + y

		if (vMult) {
			x0 += v.x*vMult
			y0 += v.y*vMult
		}	
		
		if (uMult) {
			x0 += u.x*uMult
			y0 += u.y*uMult
		}
		
		p.circle(x0, y0, radius)
	}

	drawLineTo({ p, pt, v,
		multiplyLength = 1,
		n0 = 0, n1 = 0, m0 = 0, m1 = 0,
		color,
		arrowHeadStart = 0, arrowHeadEnd = 0 }) {
		// TODO normal and offsets

		let dx = pt ? pt.x - this.x : v.x * multiplyLength
		let dy = pt ? pt.y - this.y : v.y * multiplyLength
		let d = Math.sqrt(dx * dx, dy * dy)


		p.line(
			this.x + m0 * dx / d + n0 * dy / d,
			this.y + m0 * dy / d + -n0 * dx / d,
			this.x + dx + -m1 * dx / d + n1 * dy / d,
			this.y + dy + -m1 * dy / d + -n1 * dy / d)
	}

	drawArrow({ p, v, multiplyLength = 1, normalOffset = 0, startOffset = 0, endOffset = 0, color, headSize = 10 }) {

		// Make points
		let start = KVector.edgePoint({ pt0: this, v, pct: 0, normalOffset, edgeOffset: startOffset })
		let end = KVector.edgePoint({ pt0: this, v, pct: multiplyLength, normalOffset, edgeOffset: endOffset })

		// Draw the line
		if (color)
			p.stroke(...color)

		p.line(start.x, start.y, end.x, end.y)

		p.noStroke()
		if (color)
			p.fill(...color)

		// Draw the arrowhead
		p.push()
		p.translate(...end)
		p.rotate(v.angle)
		let d = headSize
		let w = headSize * .4
		p.quad(0, 0,
			-d, w,
			-d * .6, 0,
			-d, -w)

		// p.translate(v)
		p.pop()

	}


	getColor({shade=0, fade=0, hueShift=0}) {
		
		var h1 = (this.x + hueShift + 36000)%360;
		var s1 = this.y;
		var b1 = this.z;


		if (shade !== undefined) {
			if (shade > 0) {
				// Lerp to 0
				b1 = lerp(b1, 100, shade)
				
			} else {
				
				b1 = lerp(b1, 0, -shade)
			}

			// h1 = (h1 + -.06 * shade + 1) % 1;
		}

		// console.log(s1, h1, b1)
		return [h1, s1, b1]
	}

	toCSSColor({shade=0, fade=0, hueShift=0}) {
		return hslToCSS(this.getColor({shade,fade, hueShift}))
	}
	
	get cssPosition() {
		return {
			left: this.x.toFixed(2) + "px",
			top: this.y.toFixed(2) + "px",
		}
	}
	
	get cssTranslate() {
		return `translate(${this.x.toFixed(2)}px, ${this.y.toFixed(2)}px)`
	}
	

		
	/**
	 * ===========================================================================
	 * Data
	 **/

	toArray() {
		return [this.x, this.y, this.z]
	}

	toObj() {
		return {
			x: this.x, y: this.y, z: this.z
		}
	}

	toFixed(n = 3) {
		if (this.dim === 3)
			return `[${this.x.toFixed(n)}, ${this.y.toFixed(n)}, ${this.z.toFixed(n)}]`
		return `[${this.x.toFixed(n)}, ${this.y.toFixed(n)}]`
	}

	toArray2D() {
		return [this.x, this.y]
	}

	toFixed2D(n = 3) {
		return `[${this.x.toFixed(n)}, ${this.y.toFixed(n)}]`
	}



}
