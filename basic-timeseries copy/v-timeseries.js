
Vue.component("time-series-channel", {
	template: `<div class="widget widget-timeseries">

		CHANNEL {{channel.id}} {{channel.data.length}} {{drawablePoints.length}}
		<div ref="p5" />

	</div>`,
	methods: {
		drawFrames(p) {
			this.drawablePoints.forEach(pt => {
				p.fill(0)
				p.circle(pt.x, pt.y, 5)
				if (pt.label)
					p.text(pt.label, pt.x, pt.y)
				
			})
		},

		getPctFromT(t) {
			return (t - this.timeSlice.start)/(this.timeSlice.end - this.timeSlice.start)
		},

		getX(t) {
			return this.getPctFromT(t)*this.p.width
		}

		getClosestPoint(query) {
			this.drawablePoints.forEach(pt => {
				
			})
		}
	},
	computed: {
		// Convert all the data into points
		drawablePoints() {
			console.log("Channel data", this.channel.id, this.channel.data.length)
			return this.channel.data.map((pt) => {
				
				let x = this.getX(pt.t)
				// console.log(pt.t)
				let y = Math.random()*100

				let label = pt.value.label
				// if (pt.value.label)
				// 	console.log(pt.value.label)	
			
				return {x,y,pt,label}
			})
		}
	},
	mounted() {
		createP5({
			w:270,
			h:80, 
			el:this.$refs.p5,  
			draw: (p) => {
				p.background(180, 100, 90)
				this.drawFrames(p)

			}
		}).then(p => {
			this.p = p
			
		})
	},
	props: ["channel", "timeSlice"]
})
Vue.component("time-series-viewer", {
	template: `<div class="widget widget-timeseries">

		<time-series-channel v-for="ch in timeSeries.channels" :channel="ch" :timeSlice="timeSlice"/> 
	</div>`,

	

	mounted() {
	
	},
	data() {
		return {
			mode: "none",
			width: 400,
			timeSlice: {
				start: 0, 
				end: 3,
			}
		}
	},
	props: {
		timeSeries: {
		  required: true,
	      type: Object,
	      validator: function (value) {
	        return value instanceof TimeSeries;
	      }
	    },
	    // controller: {
	    //   required: true,
	    //   type: Object,
	     
	    // },
	   
	}
})

