Vue.component("timeseries-annotation-widget", {
	template: `<div class="widget timeseries-annotation-widget">

		<div ref="p5" />
		Mouse: {{p?.mouse.x}},{{p?.mouse.y}}, {{p?.mouse.isInCanvas}}
		hovered:{{hovered}}

	</div>`,

	computed: {
		boxes() {
			// Convert each channel into a box of the right location
			let boxes = []
			let y = 0
			this.channels.forEach(channel => {
				let h = 30
				boxes.push({
					channel,
					box: new Box({	
						x: 0,
						y,
						h,
						w: this.p.width
					})
				})
				y += h

			})
			return boxes
		},

		overBoxes() {
			return this.boxes.filter(box => box.box.contains(mouse))
		}

		holdables() {
			
		},

		hovered() {
			let findClosest = (arr, toDist, type, dist = 10) => {
				let obj = undefined
				arr.forEach(item => {
					let d = toDist(item)
					if (d < dist) {
						dist = d
						obj = item
					}
				})
				if (obj)
					return {obj,dist}
			}

			// What are we over?

			if (this.p) {
				let mouse = this.p.mouse
				
				

				let closestPin = findClosest(channel.pins, (item) => {
					let xPct = item.xPct 
					let [x,y] = box.getPositionByPct(,item.yPct)
					let d = Math.abs(x - mouse.x)
					return d
				})
				
			}
		}	
	},

	methods: {
		

	
	},

	mounted() {
		
		createP5({
			w: 500,
			h: 300,
			el: this.$refs.p5,

			keyReleased: (key) => {
				console.log(key)
				if (key.key === "Backspace" || key.key === "Delete") {
					console.log("remove", this.selected)
					this.selected?.channel?.remove(this.selected)
				}
			},
			mouseMoved: (p, mouse) => {
				// console.log(this.hovered)
			},
			draw: (p) => {
				// Draw the display with the appropriate held,selected,hovered objects
				this.boxes.forEach(({channel,box}, index) => {
					// console.log(box)

					p.fill(index*23, 100, 90)
					p.rect(box.x, box.y, box.w, box.h)
					
					channel.draw(p, box)
					// console.log(box.x, box.y, box.w, box.h)
				})
			},

			startDrag: (mouse) => {
				// Dragging modes:
				// - annotate a section
				// - move a pin
				// - move the playback head
				// - move a section boundary
		

			},

			stopDrag: (mouse) => {
				
			},
			

			drag: (mouse) => {
				
				


			}
		}).then((p) => {
			this.p = p
		})
	},

	data() {
		return {
			p: undefined,
			
			selected: undefined,
			held: undefined,
			// newChannelName: "new channel name",
			// display: new TimeSeriesDisplay({timeSeries:this.timeSeries, metaPins:this.pins})
		}
	},

	props: ["channels"]
})