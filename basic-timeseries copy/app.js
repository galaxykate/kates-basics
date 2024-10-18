/**
 * Starter code
 *
 */
/* globals Vue, p5, Tracker */
// GLOBAL VALUES, CHANGE IF YOU WANT



let app = {
	
	timeSeries: null,
	timeSeriesController: null,

	trackables: {
		hand0: {
			id:"hand0",
			idNumber: 2,
			landmarkCount: 25
		},
		hand1: {
			id:"hand1",
			idNumber: 3,
			landmarkCount: 25
		},
		face0: {
			id:"face0",
			idNumber: 5,
			landmarkCount: 420
		},
	},

	init() {
		
		console.log("INIT")
		this.world = {
			items: []
		}

		let propTypes = [{
			id: "hairColor", 
			dim: 3,
			type: "HSL"
		}, {
			id: "age", 
		}, {
			id: "handPos", 
			dim: 3,
			count: 25,
			type: "xyz"
		}]

		function createProp(type) {
			if (type.count !== undefined) {
				const { count, ...baseType } = type
				return Array.from({length:count}, () => createProp(baseType))
			} 
			if (type.dim) {
				return Array.from({length:type.dim}, () => 0)
			}
			return 0
		}

		for (var i = 0; i < 10; i++) {
			let item = {
				properties: [],
				uid: words.getRandomSeed()
			}

			propTypes.forEach(type => {
				item.properties[type.id] = createProp(type)
			}) 

			this.world.items.push(item)
		}

		console.log(this.world)
		
		
		// Time series should be data agnostic. 
		// But we need to be able to display things about the data
		// so we need a data type that tells us how to convert it
		// into arrays of floats and back

		
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
					<div>t:{{app.time.t.toFixed(2)}}</div>
					test
					
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
				
				}
			})

			// Make the capture and start tracking
			.then(p => {
				app.init()
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
