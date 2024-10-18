
// URL parameters, eg: mypage.html?x=5&page=6
const urlSearchParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlSearchParams.entries());


window.onload = (event) => {
	Vue.config.ignoredElements = [/^a/];

	new Vue({
		template: `<div id="app">
			<div id="main-columns">
				<div class="column">

					<div ref="p5"></div>	
					</div>	
				</div>
				
			</div>

			
		</div>`, 
		computed: {
			
		},
		mounted() {


			createP5({
				el: this.$refs.p5,
				w: 600,
				h: 400,

				setup: (p) => {
					this.time.lastUpdate = p.millis()
					// console.log("SETUP")
					// Make a city zine
					this.universe.systems.push(createCity({p}))

				},

				draw: (p) => {
					p.background(50)
					// Update the time
					let t = p.millis()
					this.time.dt = t - this.time.lastUpdate
					this.time.lastUpdate = t
					this.time.t += this.time.dt
					
					this.universe.update({...this.time, p})
					this.universe.draw({...this.time, p})

					// Get which elements are closest
					
					
					p.mouse.hovered.forEach(({d, obj}) => {
						p.noFill()
						p.stroke(0)
						p.circle(obj.x, obj.y, 40)
					})

					p.mouse.held.forEach(({d, obj}) => {
						p.fill(100)
						p.stroke(0)
						p.circle(obj.x, obj.y, 40)
					})
	
				},

				getClosest: ({x,y, radius}) => {
					console.log("get closest", x, y)

					let found = this.universe.getInRange({
						x, y,
						range: 1000,
						max: 5
					})

					// Sort the hovered by how close they are
					console.log(found.map(h => h.d))
					return found
				},
				startDrag: () => {
					
					console.log("start drag")
					this.held = this.hovered.slice()
				},
				drag: (mouse) => {
					// console.log("drag")
					// console.log(mouse.dragOffset.x, mouse.dragOffset.y)
				},
				stopDrag: () =>  {
					console.log("stop drag")
					this.held = []
				}
			}).then(p => {
				
			})

			// Do midi things?
			initMidi({
				
			}) 
			
		},
		data() {

			
			return {
				held: [],
				hovered: [],
				time: {
					lastUpdate: 0,
					dt: 0,
					t: 0
				},
				universe: new ParticleUniverse(),
			
			}
		},

		el:"#app"
	})

};

