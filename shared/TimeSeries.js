// A set of channels



class TimeChannel {
	static channelCount = 0

	constructor({id, series,pins, points}) {
		this.idNumber = TimeChannel.channelCount++

		// Does this have pins, frame-by-frame-data, or what?
		this.pins = pins===undefined?[]:pins
		this.points = points===undefined?[]:points
		this.regions = []

		if (this.pins) {
			
			for (var i = 0; i < this.pins.length - 1; i++) {
				let pin0 = this.pins[i]
				let pin1 = this.pins[i + 1]

				if (Math.random()> .5) {
					this.regions.push({
						pin0,
						pin1,
					})
				}
			}
		}

		this.frames = []
		this.id = id
	}

	remove({obj,type}) {
		
		switch(type) {
		case "point":
			this.points = this.points.filter(item => item!== obj)
			break;
		case "region":
			this.regions = this.regions.filter(item => item!== obj)
			break;
		case "pin":
			this.pins = this.pins.filter(item => item!== obj)
			// Clear any newly 
			break;
		}

	}

	sortPoints() {
		this.points.sort((a,b) => a.xPct - b.xPct)
	}

	draw(p, box, {selected,hovered,held}={}) {
		p.fill(this.idNumber*34, 100, 90)
		p.rect(box.x, box.y, box.w, box.h)

		function setStyle(obj) {
			p.fill(0)
			p.noStroke()
			if (obj === hovered) {
				p.fill(30)
				p.strokeWeight(3)
				p.stroke(100, 0, 0, .4)
			}
			if (obj === selected) {
				p.fill(40)
				p.strokeWeight(8)
				p.stroke(100, 0, 0, 1)
			}
			if (obj === held) {
				p.fill(60)
				p.strokeWeight(10)
				p.stroke(100, 0, 0, 1)
			}
		}

		this.regions.forEach(({pin0,pin1},index) => {
			let [x0,y0] = box.getPositionByPct(pin0.xPct, 0)
			let [x1,y1] = box.getPositionByPct(pin1.xPct, 1)
			
			p.fill(index*56, 100, 50, .4)
			p.stroke(index*56, 0, 30)
			p.rect(x0,y0,x1-x0,y1-y0)
		})

		this.pins.forEach(pin => {
			let [x,y] = box.getPositionByPct(pin.xPct, 0)
			
			setStyle(pin)
			p.rect(x, y, 3, box.h)
		})

		this.points.forEach(pt => {
			let [x,y] = box.getPositionByPct(pt.xPct, pt.yPct)

			setStyle(pt)
			p.circle(x, y, 3)
			
		})

		p.noFill()
		p.stroke(0)
		p.strokeWeight(1)
		p.beginShape()
		this.points.forEach(pt => {
			let [x,y] = box.getPositionByPct(pt.xPct, pt.yPct)
			p.vertex(x,y)
		})
		p.endShape()
	}
}

class TimeSeries {
	static channelCount = 0

	constructor({frameCount}) {
		this.channels = []	
		this.frameCount = frameCount
		
		let pinCount = 10
		let pins = Array.from({length:pinCount}, () => {
			return {
				xPct: Math.random(),
				val: Math.random()
			}
		})


		pins.sort((a,b) => a.xPct - b.xPct)
		
		for (var i = 0; i < 10; i++) {
			let points = Array.from({length:pinCount}, (_,index) => {
				return {
					xPct: Math.random(),
					yPct: .5 + .5*noise(index*.1, i)
				}
			})
			points.sort((a,b) => a.xPct - b.xPct)
			points[0].xPct = 0
			points[points.length - 1].xPct = 1
		
			let channel = {
				pins: Math.random()>.5?pins:undefined,
				points: Math.random()>.5?points:undefined,
				id: "Channel" + i,
				series: this
			}
			this.channels.push(new TimeChannel(channel))
		}



 	}

 	
}

class TimeSeriesDisplay {
	/**
	 * Control the display of time-series data
	 * Useful for converting between pct-style positions and xy
	 **/

	constructor({channels}) {
		// Given a bunch of channels
		// draw them

		this.channelHeight = 30

		this.box = new Box(box)

		// We want to automatically update the box for each channel, 
		// if we add and remove channels
		this.channelDisplays = channels.map((channel,index) => {
			return {
				channel,
				box:new Box({
					x:box.x, 
					y:box.y + index*channelHeight,
					w:box.y,
					height: channelHeight
				})
			}			
		})
	}


	draw(p, heldObjs) {

		
		p.fill(0)
		p.rect(this.box.x, this.box.y, this.box.w, this.box.h)

		this.channelDisplays.forEach(({channel,box},index) => {
			ch.draw({p, 
				...box,
				
			})
		})
	}
}