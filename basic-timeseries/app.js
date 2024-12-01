/**
 * Starter code
 *
 */
/* globals Vue, p5, Tracker */
// GLOBAL VALUES, CHANGE IF YOU WANT

const MUSIC_SCHEMA = new StreamSchema({
	id: "fftmusic",
	count: 100,
	dim: 1,
	range: [0,256],
})

const HSLA_SCHEMA = new StreamSchema({
	id: "hsla360",
	dim: 4,
	ranges: [[0,360], [0,100], [0,100], [0,1]],
})

const RGB_SCHEMA = new StreamSchema({
	id: "rgb256",
	dim: 3,
	range: [0, 256],
})

const TRACKABLE_SCHEMA = new StreamSchema({
	id: "trackable",
	dim: 3,
	dimensionKeys: ["x", "y", "z"],
	range: [-100, 100],
})

// Get the body/face/hand tracker
	
let tracker = new Tracker({
    maxHistory: 10,
    numHands: 2,
    numPoses: 0,
    numFaces: 1,
    doAcquireFaceMetrics: true,
    doAcquirePoseMetrics: true,
    doAcquireHandMetrics: true,
    modulePath: "../vendor/mediapipe/",
    modelPaths: {
        face: "../vendor/mediapipe/face_landmarker.task",
        hand: "../vendor/mediapipe/hand_landmarker.task",
        // pose: "../vendor/mediapipe/"
    },
    gpu: true,
    createLandmark: (x, y, z) => new KVector(x, y, z) // Assuming KVector is defined
})




let app = {
	

	tracker,

	// What trackables do we have?
	// stuff with different inputs
	// dataFusion: new DataFusion(),
	dataSlice: new DataSlice(),



	streams: [
		// new Stream({id:"music", schema:MUSIC_SCHEMA}),
		// new Stream({id:"color0", schema:HSLA_SCHEMA, count:3}),
		// new Stream({id:"color1", schema:RGB_SCHEMA, count:5}),
		new Stream({
				id:"hand0", 
				schema: TRACKABLE_SCHEMA, 
				data: tracker.hands[0].landmarks
			})
	],

	
	

	init({p}) {

		// Create teh capture
		createP5Capture({p}).then(capture => {
			this.tracker.source = capture
			this.tracker.isActive = true
			console.log("Created capture", capture)
		}).catch(error => {
          console.log("p5", p)
          console.warn("Error on creating capture", error)
        })


		// Make some slices
		this.streams.forEach(stream => {
			this.dataSlice.addStreamSlice({
				stream,
				label: stream.id + "_0",
				indices: [0,stream.length],
				dimensions: stream.dimensions
			})
		})

		// Make some starting data
		for (var i = 0; i < 30; i++) {
			this.time.t += .1
			this.streams.forEach((stream,index) => {
				stream.schema.setToNoise({data: stream.data, t:this.time.t + index*.1, offset:index})
			})
			this.dataSlice.update(this.time)
		}

	},

	async update() {
		this.time.update()

		// Update the landmarks based on the tracker, but then override them with any data

		await this.tracker.detect({
			afterLandmarkUpdate: ({newData, tracker, trackable}) => {
				console.log("  after landmark, but before meta")
				// Playback the trackers
			}
		})



		console.log(" -  finished tracker stuff")
					
		// console.log(this.tracker.source, this.tracker.trackables)

		// Set evertyhing to noise
		// this.streams.forEach((stream,index) => {
		// 	stream.schema.setToNoise({data: stream.data, t:this.time.t, offset:index})
		// })



		// This dataslice may have its own overlay, controlled by the recorder, 
		// and be writing to the world
		// Or it might be drawing data from the world
		this.dataSlice.update(this.time)

		// Oh no, the trackables are asynchronous... so I need to turn them off if they have an overlay? 
		// Or make sure the overlay fires afterward
	},

	time:{
		start: Date.now(),
		t: 0,
		dt: 0,
		frameCount:0,
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
			this.frameCount++
		}
	}
}



document.addEventListener("DOMContentLoaded", (event) => {
	console.log("DOM fully loaded and parsed");

	new Vue({
		template: `<div id="app">
			<div class="columns"> 
				<div class="column">
					<dataslice-editor :dataslice="app.dataSlice" /> 
					<data-recorder 
						:slice="app.dataSlice" 
						:globalTime="app.time"
					/>
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
				draw :(p) => {
					// Update
					this.app.update()

					p.background(100)

					let x = 0
					let y = 0
					let size = 10
					this.app.streams.forEach(stream => {
						stream.data.forEach((item,i) => {
							let data = stream.schema.normalizeItem(item)
							data.forEach((v,j) => {
								p.fill(v*100)
								p.rect(x + size*i, y + size*j, size, size)
							})
							if (stream.schema.id == "hsla360") {
								p.fill(...item)
								p.rect(x + size*i, y + size*4 + 3, size, size)
							}
							if (stream.schema.id == "rgb256") {
								p.colorMode(p.RGB)
								p.fill(...item)
								p.rect(x + size*i, y + size*3 + 3, size, size)
								p.colorMode(p.HSLA)
							}
						})



						y += size*stream.dim + 20
						// console.log(y)
					})


					// this.app.tracker.trackables.map(tr => console.log(tr.id, tr.isActive))
					let trackerDrawing = {
						flip:true,
						scale: .6,
						x: 10,
						y: 120.
					}

					console.log("  draw landmarks")
					// We dont know when the prediction is happening
					this.app.tracker.drawSource({p, ...trackerDrawing})
					this.app.tracker.drawDebugData({p, ...trackerDrawing})
				}, 
				setup(p) {

				}
			})

			// Make the capture and start tracking
			.then(p => {
				app.init({p})
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
