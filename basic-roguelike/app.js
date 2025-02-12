/**
 * Starter code
 *
 */
/* globals Vue, p5, Tracker */
// GLOBAL VALUES, CHANGE IF YOU WANT

let app = {
	
}



document.addEventListener("DOMContentLoaded", (event) => {
	console.log("DOM fully loaded and parsed");

	new Vue({
		template: `<div id="app">
			<div class="columns"> 
				<div class="column">
				</div>

				<div class="column">
		
				</div>
			</div>
		</div>`,



		mounted() { 
			app.init()

			

			setInterval(() => {
				// app.grid.selectRandom()

			}, 10000)

			let time = {
				t: 0,
				dt: 0,
				frame:0
			}
			// Create processing
			createP5({
				w: 500,
				h: 400,
				el: this.$refs.p5,
				draw(p) {

					// Update
					let t = p.millis()*.001
					time.dt = t - time.t
					time.t = t
					time.frame++

					// Update
					app.update(time)

					//===============
					// DRAW
					p.background(320, 100, 50)

					app.tracker.drawSource({p,x:0,y:0,flip:true})
					app.tracker.drawDebugData(p)
					app.tracker.hands[0].landmarks[8].draw(p, 10)
				

					app.particles.forEach(pt => {
						p.fill(...pt.color)
						p.circle(pt.pos.x, pt.pos.y, pt.radius)
					})
						 
				}
		})

			// Make the capture and start tracking
			.then(p => {
				console.log(p)
				// Make the P5 capture
				if (app.useCapture) {
					createP5Capture({p}).then(capture => {
						app.tracker.source = capture
						app.tracker.isActive = true
					}).catch(error => {
						console.log("p5", p)
						console.warn("Error on creating capture", error)
					})
				}

			})

		},

		methods: {

		},

		data() {

			return {
				app,
				
			};
		},
		el: "#app",
	});
});
