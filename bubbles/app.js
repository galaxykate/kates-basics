/* globals Vue, p5, Tracker */

let p = undefined
let app = {
	id: "bubbles",
	...APP_STORAGE_MIXIN,
	
	music: MUSIC,
	keyboards: [
		new MUSIC.PianoKeyboard({name:"WidgetA"}), 
		// new MUSIC.PianoKeyboard({name:"WidgetB"}), 
		// new MUSIC.PianoKeyboard({name:"WidgetC"})
	],
	gameTypes: [BubbleGame],
	
	game: undefined,
	time: new AppTime(),
	box: new Box({ w: 800, h: 500, x: 0, y: 0 }),

	settings: {
		instrumentName: "piano"
	}, 
	flags: {
		tracking: true,
		debugArrows: false,
	},

	get handPoints() {
		return this.tracker.activeHandPoints
	},

	tracker: new Tracker({
		maxHistory: 10,
		numHands: 8,
		numPoses: 0,
		numFaces: 0,
		modulePath: "../_vendor/mediapipe/",
		modelPaths: {
			face: "../_vendor/mediapipe/face_landmarker.task",
			hand: "../_vendor/mediapipe/hand_landmarker.task",
			// pose: "../vendor/mediapipe/"
		},
		gpu: true,
		createLandmark: (x, y, z) => new KVector(x, y, z) // Assuming KVector is defined
	}),

	start(p) {
		
		this.p = p
		this.startGame(this.gameTypes[0])
		MUSIC.loadInstruments(p)

	},

	startGame(gameClass) {
		app.game = new gameClass({box:this.box})
		app.game.init()
		app.keyboards.forEach(keyboard => {
			keyboard.onPlay((...args) => app.game.onPlayNote(...args))
		})
	}

}



document.addEventListener("DOMContentLoaded", (event) => {
	console.log("DOM fully loaded and parsed");

	new Vue({
		template: `<div id="app">
			<div class="columns"> 
				<div ref="p5" />	
				<div class="controls">
					<div>
						<button v-for="gameClass in app.gameTypes">{{gameClass.name}}</button>
						
					</div>
					<div id="game-controls" v-if="app.game">
						
						<button @click="app.game.clearPoints()">CLEAR</button>

						<div v-for="(val,flag) in app.flags"  v-if="false">
							<input type="checkbox" v-model="app.flags[flag]" />{{flag}}
						</div>
						
						<div v-for="force in app.game.forces" v-if="false">
							{{force.id}}:{{force.strength.toFixed(2)}}
							<input type="range" v-model.number="force.strength" step=".02" min="0" max="1" />
						</div>
					</div>
					<div class="instrumentControls">
					
						
						<piano-keyboard v-for="keyboard in app.keyboards" :keyboard="keyboard" />
					
					</div>
					
					
				</div>
			</div>
		</div>`,
		
		methods: {
		
		},

		mounted() {
			

			// Create processing
			createP5({
				
				w: app.box.w,
				h: app.box.h,
				el: this.$refs.p5,
				draw: (p) => {
					// Update
					app.time.update()
					if (app.flags.tracking) {
						app.tracker?.detect({
							afterLandmarkUpdate: ({ trackable, type }) => {
							}
						})
					}

					app.keyboards.forEach(keyboard => keyboard.update())

					app.game?.update({ time: app.time })
					app.game?.draw({ box: app.box, p, time: app.time })

					
					if (app.tracker) {
						// Draw the tracker
						let trackerDrawing = {
							flip: true,
							scale: 1, x: 0, y: 0,
							// drawIndices: true
						}
						
						app.tracker.drawSource({ p, ...trackerDrawing, opacity: .1, blendMode:p.ADD })
						app.tracker.drawDebugData({ p, ...trackerDrawing })
						// console.log(tracker.faces[0].landmarks[0])
					}

					p.noStroke()
					p.fill(0, 0, 0, .2)
					p.rect(0, 0, 100, 20)
					p.fill(100)
					p.text(app.time.fps.toFixed(3), 0, 20)
					p.mouse.drawDebug({p})
				},

				getTouchables() {
					return app.game.particles
				}

			}).then((p) => {
				// Initialize the p5 capture
				if (app.tracker) {
					createP5Capture({ p }).then(capture => {
						app.tracker.source = capture
						app.tracker.isActive = true
					}).catch(error => {
						console.warn("Error on creating capture", error)
					})
				}

				app.start(p)
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
