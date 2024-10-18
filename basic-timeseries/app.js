/**
 * Starter code
 *
 */
/* globals Vue, p5, Tracker */
// GLOBAL VALUES, CHANGE IF YOU WANT

const HAND_SCHEMA = {
	count: 21,
	dimensions: ["x", "y", "z"],
	range: [-1,1]
}

const FACE_SCHEMA = {
	count: 478,
	dimensions: ["x", "y", "z"],
	range: [-1,1]
}

let app = {
	
	timeSeries: null,
	timeSeriesController: null,

	// What trackables do we have?
	// stuff with different inputs
	trackables: [
		{
			id: "noises",
			schema: {
				count: 3,
				dimensions: 5,
				range: [-1,1]
			}
		},
		{
			id: "music",
			schema: {
				count: 100,
				dimensions: 1,
				range: [0,255]
			}
		},
		{
			id:"hand0",
			schema: HAND_SCHEMA
		},
		{
			id:"hand1",
			schema: HAND_SCHEMA
		},
		{
			id:"face0",
			schema: FACE_SCHEMA
		},
	],

	init() {
		
	},

	update() {
		this.time.update()
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
