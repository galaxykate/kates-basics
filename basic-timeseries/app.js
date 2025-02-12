/**
 * Starter code
 *
 */
/* globals Vue, p5, Tracker */
// GLOBAL VALUES, CHANGE IF YOU WANT



let app = {
	
	tracker:new Tracker({
	    maxHistory: 10,
	    numHands: 2,
	    numPoses: 0,
	    numFaces: 1,
	    modulePath: "../vendor/mediapipe/",
	    modelPaths: {
	        face: "../vendor/mediapipe/face_landmarker.task",
	        hand: "../vendor/mediapipe/hand_landmarker.task",
	        // pose: "../vendor/mediapipe/"
	    },
	    gpu: true,
	    createLandmark: (x, y, z) => new KVector(x, y, z) // Assuming KVector is defined
		}),
	streams: [],
	time:new AppTime(),
	fusion: new DataFusion(),
	recorder: new Recorder({
		getData() {
			return app.fusion.array
		},
		setData(data) {
			// do something with this data
		}
	}),

	// Various streams
	streams: {
		music: new DataStream({
			schema: SCHEMA.fftmusic
		}),
		color0: new DataStream({
			count: 3,
			schema: SCHEMA.rgb256,
		}),
		color1: new DataStream({
			count: 4,
			schema: SCHEMA.hsla360,
		}),
	},
	
	init({p}) {
		// Initialize the p5 capture
		createP5Capture({p}).then(capture => {
			this.tracker.source = capture
			this.tracker.isActive = true
			console.log("Created capture", capture)
		}).catch(error => {
          console.log("p5", p)
          console.warn("Error on creating capture", error)
        })


		this.tracker.trackables.forEach(tr => {
			let id = tr.id
			this.streams[id] = new DataStream({
				source: tr,
				count: tr.landmarks.length,
				schema: SCHEMA.trackable,
				data: tr.landmarks
			})
		})
		
		// Give then the id (useful for debugging)
		Object.entries(this.streams).forEach(([key, stream]) => {
    		stream.id = key;
		});

		// Create a datafusion out of some test set of the streams
		// IRL we might have any number of slices (e.g, eyes, fingers, etc)
		Object.values(this.streams).map(stream => {
			let indices = undefined
			if (stream.id.includes("face")) {
				indices = {start:0,end:10}
			}
			if (stream.id.includes("music"))
				indices = [2,3,5,6,10,11]
				
			this.fusion.addSlice({
				id: stream.id,
				stream,
				indices
			})
		})

	},

	
	async update() {
		this.time.update()

		// Update the landmarks based on the tracker, but then override them with any data
		this.tracker.detect({
			afterLandmarkUpdate: ({trackable, type}) => {
				// Ok, we just updated the trackable from the MediaPipe detection model
				// Now we need to apply any playback overlays on it

				if (this.recorder.activeFrame) {
					let stream = this.streams.find(str => str.source === trackable)
					this.recorder.applyToStream(stream)
				}
				
			}
		})
		
		// Set some streams to noise

		this.streams.music.setToNoise(this.time.t*2)
		this.streams.color0.setToNoise(this.time.t*2)
		this.streams.color1.setToNoise(this.time.t*2)

		this.fusion.update(this.time)
		this.recorder.update(this.time)
	},

}



document.addEventListener("DOMContentLoaded", (event) => {
	console.log("DOM fully loaded and parsed");

	new Vue({
		template: `<div id="app">
			<div class="columns"> 
				<div class="column">	
					<div>{{app.time.t.toFixed(4)}}</div>
					<data-recorder :recorder="app.recorder" /> 				
					<datastreams :streams="app.streams" /> 				
					<datafusion :fusion="app.fusion" /> 
				</div>

				<div class="column">	
					<button @click="printTrackerPos">print trackerpos</button>				
					<div ref="p5" />						
				</div>
			</div>
		</div>`,
		methods: {
			printTrackerPos() {
				let arr = app.tracker.faces[0].axisNormalizedLandmarks
				console.log(arr.length)
				let text = arrayOfArraysToFixed(arr, 3)
				console.log(text)
			}
		},

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

					// Draw the tracker
					let trackerDrawing = {
						flip:true,
						scale: 1, x: 0,y: 0,
						drawIndices: true
					}

					this.app.tracker.drawSource({p, ...trackerDrawing})
					// this.app.tracker.drawDebugData({p, ...trackerDrawing})

					let face = app.tracker.faces[0]

					app.tracker.activeTrackables.forEach(trackable => {
						trackable.landmarks.forEach((pt,i) => {
							// console.log(pt)
							p.fill(100, 100, 50)
							p.noStroke()
							p.circle(pt.x, pt.y, 10)

							p.stroke(100)
							// Draw lines to neighbors
						
							trackable.constructor.MAP[i]?.neighbors.forEach(neighbor => {
								let pt2 = trackable.landmarks[neighbor.index]
							
								// pt.drawLineTo({p, pt:pt2})

							})

							p.stroke(100, 100, 50)
							pt.drawLineTo({p, v:pt.dir0, multiplyLength:20})
							p.stroke(300, 100, 50)
							pt.drawLineTo({p, v:pt.dir1, multiplyLength:20})
						})

					})
					


					p.stroke(0)
					// console.log(face.constructor.MAP)
					face.constructor.MAP.forEach(pt => {
						
						p.circle(pt.x*100, pt.y*100, 2)
						pt.neighbors?.forEach(pt2 => {
							// console.log(pt2)
							pt.drawLineTo({p, pt:pt2})

						})
					})
					
					// console.log(arrayOfArraysToFixed(lmks3, 2))

					
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
