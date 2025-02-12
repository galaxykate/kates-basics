/* globals Vue, p5, Tracker */

/**
 * Create a fusion of multiple data channels 
 * 	 - a channel is an object (where the data is) + a schema (how the data is shaped)
 * 
 */


let app = {
	
	music: MUSIC,
	// Make (and hook up) channels for sound, tracking, etc
	channels: [
		// HSLA channel
		new Channel({
			id: "color1",
			count: 4,
			schemaName: "hsla360"
		}),

		new Channel({
			id: "hand0",
			count: 21,
			schemaName: "trackingPoints"
		}),

		new Channel({
			id: "hand1",
			count: 21,
			schemaName: "trackingPoints"
		}),


		// FFT channel for music playing
		// new Channel({
		// 	id: "music",
		// 	schema: {
		// 		id: "musicFrequencies",
		// 		dimensions: 128, 
		// 		range:[0,256]
		// 	}
		// }),
		// new Channel({
		// 	id: "music1",
		// 	schema: {
		// 		id: "musicFrequencies",
		// 		dimensions: 128, 
		// 		range:[0,256]
		// 	}
		// }),
		// new Channel({
		// 	id: "music2",
		// 	schema: {
		// 		id: "musicFrequencies",
		// 		dimensions: 128, 
		// 		range:[0,65]
		// 	}
		// }),

		// // channel for MIDI sliders
		// new Channel({
		// 	id: "sliders",
		// 	schema:{
		// 		id: "sliders",
		// 		dimensions: 20, 
		// 		range:[0,128],
		// 	}
		// }),

		// RGB channel
		// new Channel({
		// 	id: "color0",
		// 	count: 4,
		// 	schemaName: "rgb256"
		// }),

		
	],

	getChannelByID(id) {
		return this.channels.find(ch=> ch.id === id)
	},

	initializeChannels() {
		let m0 = this.getChannelByID("music")
		let m1 = this.getChannelByID("music1")
		let m2 = this.getChannelByID("music2")
		// Vue.set(m0.dataObject, 0,  app.music.spectrum.values)
		// Vue.set(m1.dataObject, 0,  app.music.spectrum.average)
		// Vue.set(m2.dataObject, 0,  app.music.spectrum.spikes)

		app.recorder.setChannels(this.channels)

		let c0 = this.getChannelByID("color1")
		Vue.set(app, "colors", c0.dataObject)
		// console.log(app.colors)

		let hand0 = this.getChannelByID("hand0")
		hand0.dataObject = this.tracker.hands[0].landmarks
		let hand1 = this.getChannelByID("hand1")
		hand1.dataObject = this.tracker.hands[1].landmarks
	
	},
	
	recorder:new Recorder(),

	time: new AppTime(),
	tracker:new Tracker({
	    maxHistory: 10,
	    numHands: 6,
	    numPoses: 0,
	    numFaces: 3,
	    modulePath: "../_vendor/mediapipe/",
	    modelPaths: {
	        face: "../_vendor/mediapipe/face_landmarker.task",
	        hand: "../_vendor/mediapipe/hand_landmarker.task",
	        // pose: "../vendor/mediapipe/"
	    },
	    gpu: true,
	    createLandmark: (x, y, z) => new KVector(x, y, z) // Assuming KVector is defined
		}),
	
	init({p}) {
			

		// Initialize the p5 capture
		createP5Capture({p}).then(capture => {
			console.log("Capture size", capture.width, capture.height)
			if (this.tracker) {
				this.tracker.source = capture
				this.tracker.isActive = true
			}
		}).catch(error => {
          console.warn("Error on creating capture", error)
        })

		this.initializeChannels()
		// this.recorder.loadAndPlay()
	},

	
	
	async update({time}) {
		this.time.update()
		// console.log("Update", app.music.jukebox)
		
		app.music.analyzeFFT(app.p)

		let c0 = this.getChannelByID("color1")
		c0.setToNoise(time.t*.01)
		// console.log(c0.toFixed(2))

		

		// if (this.playback.isPlaying) {
		// 	console.log("PLAYING")
			
		// } else {
		// 	// Update
			
		// 	// Update the landmarks based on the tracker, but then override them with any data
		this.tracker?.detect({
			afterLandmarkUpdate: ({trackable, type}) => {
				app.recorder.update({time})
			}
		})
		
		// console.log(JSON.stringify(this.getChannelByID("hand0").range))
		let musicChannel = this.getChannelByID("music")
		// console.log(musicChannel.dataObject)
		// console.log(musicChannel.dataObject[0].slice(0, 20))
	},

	async draw({p, time}) {
		// console.log(app.colors)
		// app.colors?.forEach((c, index) => {
		// 	// console.log(c)
		// 	p.fill(...c)
		// 	p.rect(100*index, 0, 100, 100)
		// })
		// console.log("DRAW>", this.tracker)
		if (this.tracker) {
			// Draw the tracker
		let trackerDrawing = {
			flip:true,
			scale: 1, x: 0,y: 0,
			// drawIndices: true
		}
		this.tracker.drawSource({p, ...trackerDrawing})
		this.tracker.drawDebugData({p, ...trackerDrawing})
		}
		
	},

	toggleRecording() {
	
		this.recorder.toggleRecording()
	}

}



document.addEventListener("DOMContentLoaded", (event) => {
	console.log("DOM fully loaded and parsed");

	new Vue({
		template: `<div id="app">
			<div class="columns"> 
				<div class="column">	
					<recorder :recorder="app.recorder" />

				
					
					<button @click="app.music.jukebox.toggle()">play</button>
					<select @change="ev => app.music.jukebox.play(ev.target.value)">
					<option v-for="name in app.music.jukebox.songNames" :value="name">
						{{ name }}
					</option>
					</select>
					<div>
						<table>
							<channel-view 
								v-for="channelSettings in app.recorder.channelMap"  
								:key="channelSettings.channel.id" 
								:channelSettings="channelSettings" />
						
						</table>

					</div>
				

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
				h: 800,
				el: this.$refs.p5,
				draw :(p) => {
					// Update
					app.update({p, time:app.time})

					// Draw stuff
					p.background(50)

					app.draw({p, time:app.time})
					
				
					
				}, 
				setup(p) {
					app.p = p
					app.init({p})
				},

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
