/**
 * Starter code
 *
 */
/* globals Vue, p5, Tracker */
// GLOBAL VALUES, CHANGE IF YOU WANT

let app = {
	particles: [],

	useCapture: true,


	// grid: new Grid({width:15,height:10,depth:3}),
	// gridSize: {
	//   displayLayer: 0,
	//   cellSize: 20,
	//   cellPadding: 5,
	//   offset: {x:10, y:10}
	// },

	// Recording stuff
	// We probably need to play back the recording with the same settings
	objectDirectory: {},
	recorder: new Recorder(),
	playback: new Playback(),
	recordingPrefix: "recording-",

	// Functions that allow custom behavior for recording stuff
	recordingHandlers: {
		getFrameData() {
			app.serializer.getData()
		},
		setFrameData(data) {
			app.serializer.setToData(data)
		},
		load(recording) {
			return new Promise((resolve, reject) => {
			let key = app.recordingPrefix + recording.id
			let json = localStorage.getItem(key)
			if (json) {
					let data = JSON.parse(json)
					let processedData = flatDataRowsFromBinary(data, recording.frameCount)
					resolve(processedData)
				}
				reject("No data found for ", metadata.id)	
			})
		},
		save(recording) {
			return new Promise((resolve, reject) => {
				let key = app.recordingPrefix + recording.id
				let processedData = flatDataRowsToBinary(recording.data)
				
				// Save out the data and metadata separately
				localStorage.setItem(key + "-data", JSON.stringify(processedData))
				localStorage.setItem(key + "-meta", JSON.stringify(recording.saveData))
				resolve()
			})
		},
		loadAllRecordings() {
			return new Promise((resolve, reject) => {
				console.log("Load all recordings")
				// Load recordings ending with -meta
				const items = [];
				const suffix = "-meta";
				const regex = new RegExp(`^${app.recordingPrefix}(.*)${suffix}$`);

				for (let i = 0; i < localStorage.length; i++) {
						const key = localStorage.key(i);
						const match = key.match(regex);
						
						if (match) {
								let metadata = JSON.parse(localStorage.getItem(key));
								let id = match[1]
								
								let recording = new Recording({
									// Extract the id from the regex match
									id,
									metadata, 
									config: {
										handlers:app.recordingHandlers
									},
								})
								items.push(recording);
						}
				}
				resolve(items);
			})
			
		},
	},

	// Make a way to convert the world into numerical records
	serializer: undefined,


	
	
	
// What are we recording
	get recordSchema() {
				// Make the data storage schema
		return Object.entries(this.objectDirectory).map(([key,val]) => {
			if (val.landmarkCount) {
				return {
					key,
					dimensionality: val.dimensionality,
					count: val.landmarkCount 
					// Do indices here if you need only a subset
				}
			}
			// Otherwise a particle
			return {
				key,
				count: 2,
				dimensionality: 3,
				keys: ["pos", "color"]
			}
		})
	},
	


	// face/hand tracking stuff
	tracker:new Tracker({
		maxHistory: 10,
		modulePath:"../vendor/mediapipe/",
		// landmarkerPath: "https://storage.googleapis.com/mediapipe-models/[TYPE]_landmarker/[TYPE]_landmarker/float16/1/"
		modelPaths: {
			hand: "../vendor/mediapipe/hand_landmarker.task",
			face: "../vendor/mediapipe/face_landmarker.task",
			// pose: "/widgets/mediapipe/pose_landmarker_full.task",
		},

		numHands: 6,
		numPoses: 3,
		numFaces: 3,
	
		createLandmark() {
			return new KVector(0,0,0)
		}
	}),


	init() {

		

		// app.objectDirectory.hand0 = this.tracker.hands[0]
		// app.objectDirectory.hand1 = this.tracker.hands[1]
		app.objectDirectory.face0 = this.tracker.faces[0]

		

		
		class Particle {
			constructor() {
				this.pos = new KVector(Math.random()*400, Math.random()*400)
				this.color = new KVector(Math.random()*360, 100, 50)
				this.radius = Math.random()**2*20 + 10
			}

			setFrom(data) {
				console.log("Particle", data)
			} 

			get data() {
				return [this.pos.toArray(), this.color.toArray()]
			}

			get flatData() {
				return this.data.flat()
			}
			set flatData(data) {
				this.pos.setTo(data.slice(0,3))
				 this.color.setTo(data.slice(3,6))

			}
		}

		for (var i = 0; i < 3; i++) {
			let pt = new Particle()
			pt.id = "particle" + i
			app.particles.push(pt)
			app.objectDirectory[pt.id] = pt
		}
		
		this.recorder.config.handlers = app.recordingHandlers
		this.playback.config.handlers = app.recordingHandlers

		this.serializer = new ObjectDataSerializer({
				objectDirectory:app.objectDirectory,
				schema:app.recordSchema
		})
		
		this.playback.loadAllRecordings().then(() => {
			this.playback.loadAndPlay(this.playback.availableRecordings[0])
		})

	},

	update(time) {
		// PLAYING? PLAYBACK!
		if (app.playback.isActive) {
			app.playback.update(time)
		} 

		// NOT PLAYING? ANIMATE!
		else {
			
			// Update particles
			app.particles.forEach((pt,index) => {
				pt.pos.lerpTo({x:200, y:200,z:0}, .1)
				let r = 10
				let theta = 10*noise(index, time.t*.1)
				pt.pos.addPolar(r, theta)
			})
			
			// Update tracker
			if (app.tracker.isActive) {
				app.tracker.detect()
			}

			app.recorder.update(time)
		}
	 
	}
}



document.addEventListener("DOMContentLoaded", (event) => {
	console.log("DOM fully loaded and parsed");

	new Vue({
		template: `<div id="app">
			<div class="columns"> 
				<div class="column">
					<div v-if="app.dataMaker">
						{{app.dataMaker}}
						<div v-for="({id,start,end}, index) in app.dataMaker.indices">
							{{id}} {{start}}-{{end}} 
							<div>{{app.dataMaker.getSlice(id).map(f => f.toFixed(2)).join(" ")}}</div>
							
						</div>
						
					</div>
					<div ref="p5"  /> 
					<div class="grid" v-if="false">

						
						<grid-view class="overlay" :gridSize="app.gridSize" :grid="app.grid"  />
						<pre class="overlay">{{app.grid.toTextLines()}}</pre>
						<img :src="app.grid.toImage()" :width="app.grid.width" :height="app.grid.height" />
					</div>
				</div>

				<div class="column">
			
					<div class="controls">
						COTNROLS
					 <recorder-widget :recorder="app.recorder" :playback="app.playback"  v-show="true" />
					
					</div>
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
