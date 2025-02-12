/* globals Vue, p5, Tracker */

const CONTROLS = {


}

let p = undefined
let app = {
	id: "ships",
	box: new Box({w:500,h:400}),

	time:new AppTime(),
	

	...APP_STORAGE_MIXIN,

	controls: {	
		tuningValues: {	
			speed: {min:0,max:1,default:.5},
			spawnRate: {min:0,max:1,default:.5},
			curveEase: {min:0,max:1,default:.5}
		},
		options: {
			game: ["ships", "bubbles", "selfie", "mapping"]
		},
		flags: {
			drawDebug: true
		}
	},

	game:undefined,

	init() {
		this.game = new ShipsGame()
		this.setToDefaultSettings()
	
		this.loadSettings()
		this.saveSettings()
		console.log("OPTIONS", this.options)
		console.log("TUNING VALUES", this.tuningValues)
		console.log("FLAGS", this.flags)
		

	},

	start({p}) {
		// Once all p5 stuff has been set up
		this.p = p
	},

	update({p}) {
		this.time.update()
		this.game.update({p:this.p,time:this.time})
	},

	draw({p}) {
		
		p.background(50)
		this.game.draw({p})
	}
}
app.init()


document.addEventListener("DOMContentLoaded", (event) => {
	console.log("DOM fully loaded and parsed");

	new Vue({
		template: `<div id="app">
			<div class="columns"> 
				<div ref="p5" />	
				<div class="controls">
					{{app.time.t.toFixed(2)}}
					<!-- SETTINGS -->
					<table class="tuning">
						<tr v-for="val,key in app.tuningValues">
							<td>{{key}}</td><td>{{val.toFixed(2)}}</td>
							<td><input type="range" @change="app.saveSettings()" v-model.number="app.tuningValues[key]" 
								:min="app.controls.tuningValues[key].min" :max="app.controls.tuningValues[key].max" step=".01" /></td>
						</tr>
					</table>
					
					<select v-model="app.options.game" @change="app.saveSettings()">
						<option  v-for="game in app.controls.options.game" >{{game}}</option>
					</select>

				</div>
				
			</div>
		</div>`,
		

		mounted() {
			

			// Create processing
			createP5({
				el: this.$refs.p5,
				w:app.box.w,
				h:app.box.h,
				draw: (p) => {
					app.update({p})
					app.draw({p})
				},
				getTouchables() {
					return app.game.touchables
				},
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

				app.start({p})
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
