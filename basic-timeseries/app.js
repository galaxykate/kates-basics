/**
 * Starter code
 *
 */
/* globals Vue, p5, Tracker */
// GLOBAL VALUES, CHANGE IF YOU WANT

const MUSIC_SCHEMA = new Schema({
	id: "fftmusic",
	count: 100,
	dim: 1,
	range: [0,256],
})

const HSLA_SCHEMA = new Schema({
	id: "hsla360",
	dim: 4,
	ranges: [[0,360], [0,100], [0,100], [0,1]],
})

const RGB_SCHEMA = new Schema({
	id: "rgb256",
	dim: 3,
	range: [0, 256],
})




let app = {
	
	tracker: new Tracker({
		numFaces:1,
		numHands:2,
		numPoses: 0,
	}),

	// What trackables do we have?
	// stuff with different inputs
	dataFusion: new DataFusion(),

	init() {
		console.log(this.tracker.trackables)
		
		

		this.tracker.trackables.forEach((trackable,index) => {
			console.log(index, trackable)

			let trackerSchema = new Schema({
				id: "trackable",
				count: trackable.landmarks.length,
				dim: 3,
			})

			this.dataFusion.addStream({
				id: trackable.id,
				data: trackable.landmarks,
				schema: trackerSchema
			})
		})

	
		// Create and store the music stream
		app.music = this.dataFusion.addStream({
			id: "music",
			data: app.music,
			schema: MUSIC_SCHEMA
		}).data

		
		
		this.dataFusion.setToNoise(this.time.t)
		
	},

	update() {
		this.time.update()

		// console.log(this.time.frame)
		let t0 = Date.now()
		let count = 10
		
		let t1 = Date.now()
		// console.log(t1-t0)
	},

	time:{
		start: Date.now(),
		t: 0,
		dt: 0,
		frame:0,
		lastUpdate: Date.now(),
		update(dt) {
			let now = Date.now()
			// Did we gain time?
			if (dt === undefined) {
				// update in realtime
				let elapsed = now - this.lastUpdate
				this.lastUpdate = now
				dt = elapsed*.001

			}
			
			this.dt = dt
			this.t += dt
			this.frame++
		}
	}
}



document.addEventListener("DOMContentLoaded", (event) => {
	console.log("DOM fully loaded and parsed");

	new Vue({
		template: `<div id="app">
			<div class="columns"> 
				<div class="column">
					<datafusion :fusion="app.dataFusion" /> 
				</div>

				<div class="column">
					<div ref="p5" />	
				</div>
			</div>
		</div>`,



		mounted() { 
			// Create processing
			createP5({
				w: 500,
				h: 400,
				el: this.$refs.p5,
				draw(p) {
					// Update
					app.update()

					app.dataFusion.draw({p, w:p.width,h:p.height})
				}, 
				setup(p) {

				}
			})

			// Make the capture and start tracking
			.then(p => {
				app.init()
			})

		},

		data() {
			return {
				app,	
			};
		},
		el: "#app",
	});
});
