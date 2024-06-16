
Vue.component("gradient-widget", {
	template: `<div class="widget widget-gradient">
		<div ref="p5" />
		<div v-for="f in followers">
			{{f.mode}} <span v-if="f.modePct"> {{f.modePct.toFixed(2)}} {{f.loopCount}}</span>
		</div>
	</div>`,

	computed: {
		boxes() {
			let dw = this.p.width/this.gradients.length
			let h = this.p.height
			console.log(dw, h)
			let boxes = this.gradients.map((gr,index) => {
				let box = new Box({
					x:dw*index,
					x1:dw*(index + 1),
					y:0,
					y1:h
				})
				box.gradient = gr
				box.index = index
				return box
			})

			return boxes
		},

		

		handles() {
			let pts = []
			this.boxes.forEach((box) => {
				// Get all the gradients in this box (that we are looking at)
				let gradients = this.getDisplayGradients(box.gradient)
				
				// Get all of the points as positions
				gradients.forEach(gr => {
					gr.points.forEach(pt => {

						pts.push({
							pos: box.remap({pt}),
							pt, box,
						})
					})
				})
				
			})
			// console.log(pts)
			return pts
		},

		
		pctBox() {
			return new Box({x:0,y:0,x1:1,y1:1})
		}
	},

	methods: {

		getDisplayGradients(gr) {
			if (gr.subgradients)
					return gr.subgradients
			return gr

		},

		getClosest([x,y], range=100) {
        	let closest = undefined

        	this.handles.forEach((handle) => {
        		let [x,y] = handle.pos
    			let d = Math.sqrt((this.p.mouseX - x)**2 + (this.p.mouseY - y)**2)
        		// console.log(d)
        		if (d < range) {
        			range = d 
        			closest = handle
        		}
	        
        	})
        	return closest
        },

        getBoxPctAt(x,y=0) {
        	// Given the x pos, figure out which box we are in 
        	let pos = [x,y]
			let box = this.boxes.find(box => box.contains(pos))
			if (box) {
				let [pctX, pctY] = box.getPct(pos)
        		return {box,pctX,pctY}
			}
        	return {

        	}
        }
	},

	mounted() {
		createP5({
        w: 500,
        h: 200,
        el: this.$refs.p5,

        keyReleased: (key) => {
        	console.log("key", key)
        	if (key.keyCode == 8 || key.keyCode == 46) {
        		console.log("delete")
        		if (this.selected) {
        			// No deleting the first or last
        			let pts = this.selected.box.gradient.points
        			let index = pts.indexOf(this.selected.pt)
        			
        			if (index !== 0 && index !== pts.length - 1)
        				this.selected.box.gradient.removePoint(this.selected.pt)
        		}
        	}
        },

        getClosest: ({x,y,range}) => this.getClosest([x,y],10),

        mouseClicked: (mouseX, mouseY) => {
        	let {box,pctX, pctY} = this.getBoxPctAt(this.p.mouseX, this.p.mouseY)
        	this.selected = this.getClosest([mouseX, mouseY], 10)
        	// todo: Toggle?
        	if (!this.selected) {
        		// Add a point
        		console.log(box,pctX, pctY)
        		box.gradient.points.push({x:pctX, y:pctY})
        		box.gradient.resort()
        	}
        },

        mouseMoved: (mouseX, mouseY) => {
        	// console.log(mouseX, mouseY)
        	// let pos = [mouseX, mouseY]
        	// let gr = this.getDisplayGradientAt(pos)
        	
        	// let val = this.getValue(pos, gr)
        	// this.hovered = this.getClosest(pos, 10)

        	// gr.gradient.getValueAt(val[0])
        },

        startDrag: ({held, totalDist, lastDist, startDrag}, p) => {
        	this.selected = held 
        },

        drag: ({held, totalDist, lastDist, startDrag}, p) => {
        	// Which box are we in and where?
        	if (held) {
				const [pctX, pctY] = held.box.getPct([this.p.mouseX, this.p.mouseY])
				
				// disallow out-of-bounds
	        	held.pt.x = Math.max(0, Math.min(pctX,1))
				held.pt.y = Math.max(0, Math.min(pctY,1))
			
				held.box.gradient.resort()
			}
        },

        stopDrag: ({held, totalDist, lastDist, startDrag}, p) => {
        	
        },


        
        draw: (p) => {
        	p.background(200, 100, 50)

        	// Draw the curve
        	p.noFill()
        	// console.log(this.gradients)

        	this.boxes.forEach(box => {
        		let gradients = this.getDisplayGradients(box.gradient)
        		gradients.forEach(gr => {
        			p.beginShape()
        			gr.points.forEach(({x,y}) => {
        				let pos = box.getPositionByPct({pctX:x, pctY:y})
        				// ./console.log(pos)
        				p.vertex(...pos)
        			})
        			p.endShape() 
        		})
        	})
        	
				
        	
   	

        	// Check that we have the right position from a pct
   			let {pctX, pctY, box} = this.getBoxPctAt(p.mouseX, p.mouseY)
   			if (box) {
   				pctY = box.gradient.getValueAt(pctX)
   				let pos = box.getPositionByPct({pctX, pctY})
   				p.fill(0)
   				p.circle(...pos, 10)
   			}
   			
        	
        	this.handles.forEach(({pos, pt, box}) => {
        		// console.log(pos)
        		p.strokeWeight(1)
        		
        		if (this.hovered?.pt === pt) {
        			p.strokeWeight(2)
        		}
        		if (this.selected?.pt === pt) {
        			p.strokeWeight(5)
        		}
        		p.fill(box.index*90, 100, 50)
				p.circle(...pos, 20)
	        	
        	})

        	this.followers.forEach((f,index) => {

        		let gradient = f.envelopeMode?.gradient
        		if (gradient) {
	        		// Find the box for this gradient
	        		let box = this.boxes.find(box => gradient === box.gradient)
	        		let {h, s, l, y} = f.value
	        		// console.log(h, s, l, y)

	        		// let pos = box.getPositionByPct({pctX:f.modePct, pctY})
	        		// // console.log(f.modePct, pos)
	        		// p.circle(...pos, 20)

	        		let x = p.width*.9 + 10*index
	        		let py = y*p.height

	        		p.fill(h*360, s*100, l*100)
	        		p.circle(x, py, 30)
	        	}


	        	
        	})


        	
        }
      })

      // Make the capture and start tracking
      .then(p => {	
        this.p = p

      })
	},
	data() {
		return {
			selected: undefined,
			hovered: undefined
		}
	},

	props: {
		"gradients": {},
		"followers": {},
	}
})

class EnvelopeFollower {
	constructor(envelope, loopAll) {
		this.envelope = envelope

		this.times = {
			attack: undefined,
			firstSustain: undefined,
			sustain: undefined,
			release: undefined,
			end: undefined
		}

		this.mode = undefined
		this.t = undefined
		this.loopCount = 0

		this.loopAll = loopAll
	}

	setMode(mode) {
		this.times[mode] = this.t
		this.mode = mode
	}

	start(t) {
		this.t = t
		this.setMode("attack")
		
	}

	get value() {
		// Current value at this point
		if (this.envelopeMode) {
			return this.envelopeMode.gradient.getValueAt(this.modePct)
		}
	}

	get modeStartTime() {
		return 
	}

	get timeInMode() {
		return this.t - this.times[this.mode]
	}

	get envelopeMode() {
		return this.envelope[this.mode]
	}
	get modePct() {
		if (this.envelopeMode) {
			return this.timeInMode / this.envelopeMode.length
		}  
	}

	update(t) {
		this.t = t

		if (this.mode === "attack") {
			// In attack mode.  Are we past it?
			if (this.modePct > 1) {
				this.times.firstSustain = this.t
				this.setMode("sustain")
			}
		}

		if (this.mode === "sustain") {
			if (this.modePct > 1) {
				
				this.loopCount += 1
				this.times.sustain = this.t

				if (this.envelopeMode.loop >= 0 && this.loopCount > this.envelopeMode.loop) {
					this.setMode("release")
				}
			}
		}
		if (this.mode === "release") {
			if (this.modePct > 1) {
				console.log("END")
				this.setMode("end")

				if (this.loopAll) {
					this.setMode("attack")
				}
			}
		}
		
	}

	
}



class MultiGradient {
	constructor(channels) {
		this.subgradientsByChannel = {}
		this.subgradients = channels.map((channel) => {
			let gr = new Gradient({
				channel
			})
			this.subgradientsByChannel[channel] = gr
			return gr
		})



	}

	getValueAt(pct) {
		return mapObject(this.subgradientsByChannel, (gr, channel) => gr.getValueAt(pct))
	}

	
}

class Gradient {
	constructor({channel}) {
		this.channel = channel
		this.points = []

		let x = 0
		let offset = Math.random()*10000
		for (var i = 0; i < 3; i++) {
			let y = .5 + .5*noise(i*.07 + offset)
			this.points.push({x,y})
			x += Math.random()*.5
			if (x >= 1) {
				break;
			}
		}
		this.points.push({x:1,y:Math.random()})
	}

	getSegmentPct(x) {
		let v0 = undefined
		let v1 = this.points[0]
		if (x < v1.x)
			return {
				index: -1,
				v1,
				pct: 1,
				y: v1.y
			}

		for (var i = 1; i < this.points.length; i++) {
			v0 = v1
			v1 = this.points[i]
			if (x < v1.x) {
				let pct = (x - v0.x)/(v1.x - v0.x)
				if (v1.x === v0.x)
					pct = 0
				let y = pct*(v1.y - v0.y) + v0.y
				return {
					index: i - 1,
					v0, v1,
					pct,
					y
				}
			}
		}
		return {
			index: i,
			v0: v1,
			pct: 0,
			y: v1.y
		}
	}

	getValueAt(x) {
		let segment = this.getSegmentPct(x)
		return segment.y
	}

	removePoint(pt) {
		console.log("Remove point", pt)
		this.points = this.points.filter(v => v!== pt)
	}

	resort() {
		this.points = this.points.sort((a,b) => a.x - b.x)
	}
}