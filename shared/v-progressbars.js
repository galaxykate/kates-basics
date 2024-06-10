Vue.component("line-graph", {
	template: `<div>
		<div ref="p5">
		</div>
	</div>`,



	mounted() {
		createP5({
	        w: 200,
	        h: 30,
	        el: this.$refs.p5
      	}).then(p => {
      		this.p = p


      		p.draw = () => {
      			p.background(100, 50, 90)
      			// console.log(this.data)

      			// Draw this line
      			let data = this.data.slice(-this.dataWindow)
      			
      			p.noFill()
      			p.stroke(0)
      			p.beginShape()
      			for (var i = 0; i < data.length; i++) {
      				let pctX = i/(data.length - 1)
      				let x = pctX*p.width

      				let val = data[i]
      				let pctY = (val - this.min)/(this.max - this.min)
      				let y = (1- pctY)*p.height
      				// console.log(val, pctY, y)
      				p.vertex(x, y)
      			}
      			p.endShape()
      		}
      	})
	},

	props: {
		data: {

		},

		dataWindow: {
			default: 100,
		},

		min: {
			default:-1,
		}, 
		max: {
			default:1,
		}, 
	}
})

Vue.component("number-tracker", {
	template: `<div :style="style" class="inline-block">
		<div class="fill" :style="fillStyle">{{val.toFixed(2)}}</div>
	</div>`,
	computed: {
		pct() {
			return (this.val - this.min)/(this.max - this.min)
		},
		style() {
			return {
				width: this.width,
				height: "1em",
				border: "1px solid blue"
			}
		},
		fillStyle() {
			return {
				backgroundColor: "hsla(100, 100%, 50%, 1)",
				width: (this.pct*100).toFixed(2) + "%"
			}
		}
	},
	props: {
		width: {},
		val: {
			required:true
		},
		min: {
			default: 0,
		},
		max: {
			default: 1,
		}
	},
})


Vue.component("number-trackers", {
	template: `<div>
		<div v-for="(val, valKey) in obj">

			<span>{{valKey}}</span>
			<div v-if="Array.isArray(val)">
				<number-tracker v-for="subval in val" :val="subval" :width="width" :min="-1" />
			</div>
			<div v-else-if="typeof val === 'object'">
				<number-tracker v-for="subval in val" :val="subval" :width="width" :min="-1" />
			</div>
			<span v-else-if="isNaN(val)"  >{{val}}({{typeof val}})</span>
			<number-tracker v-else :val="val" :width="width"  :min="-1" />
		</div>
	</div>`,
	props: ["obj"],
	data() {
		return {
			width:"100px"
		}
	}
})


Vue.component("progress-clock", {
	template: `<div class="progress-clock" :style="style">
		
	</div>`,

	computed: {
		computedPct() {
			if (this.pctObj !== undefined) {
				return this.pctObj[this.pctKey]
			}
			return this.pct
		},
		radius() {
			return "20px"
		},
		style() {
			let pct = this.computedPct*100
			
			let background = ""
			let c0 = this.colorBG
			let c1 = this.color
			
			if (this.direction == "conical") 
				background = `conic-gradient(${c1} 0%, ${c1} ${pct}%,${c0} ${pct}%, ${c0} 100%)`
			else if (this.direction == "horizontal") 
				background = `linear-gradient(to right,${c1} 0%, ${c1} ${pct}%,${c0} ${pct}%, ${c0} 100%)`
			else 
				background = `linear-gradient(to top,${c1} 0%, ${c1} ${pct}%,${c0} ${pct}%, ${c0} 100%)`
			

			
			return {
				display: "inline-block",
				position: "relative",
				borderRadius: "1000px",
				background,
				border: "1px solid magenta",
				width: this.radius,
				height: this.radius,
			}
		}
	},

	props: {
		"colorBG": {
			default: "#000"
		},
		"color": {
			default: "#FFF"
		},
		"direction": {
		default: "conical"
		},
		"pct":{},
		"pctKey": {},
		"pctObj": {},
	},

})