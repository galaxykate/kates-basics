
// URL parameters, eg: mypage.html?x=5&page=6
const urlSearchParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlSearchParams.entries());

window.onload = (event) => {
	Vue.config.ignoredElements = [/^a/];

	new Vue({
		template: `<div id="app">
			<div id="main-columns">
				<div class="column">
				<div>
					<div v-for="force,forceName in forces">
					{{forceName}}
					<input type="range" v-model.number="force.strength" min="0" max="10" step=".1" />
					</div>
				</div>
				<div ref="p5"></div>	
				</div>	
			</div>

			
		</div>`, 
		mounted() {



			createP5({
				el: this.$refs.p5,
				w: 300,
				h: 200,
				draw: (p) => {

					p.background(180, 100, 90)
					this.points.forEach(pt => {
						pt.draw(p)
						pt.drawForces(p)
					})
					this.edges.forEach(edge => {
						edge.draw(p)
					})

					this.points.forEach(pt => {
						pt.update({dt:.01})
					})
				}
			}).then(p => {
				this.p = p

				this.forces.border.center.setTo(p.width/2, p.height/2)
			})
			
		},
		data() {

			// How to use particles
			// Create some forces

			let forces = {
				border: new BorderForce({center:new KVector(0, 0)})
			}

			// Make some particles or particle systems
			// A particle system is like a particle except we can apply 
			// forces to many particles at once so its parallelizable

			let ps = new ParticleSystem({
				forces: {
					border: new BorderForce({center:new KVector(0, 0)})
				},	
			})

			function calculateForces() {
			
				if (this.forces.border === undefined)
					this.forces.border = new KVector(0,0)
				forces.border.applyForce(this, this.forces.border)
				// console.log(forces.border, this.forces.border)
			}

			let points = Array.from({length:10}, () => {
				return new Particle({
					x:Math.random()*200, 
					y:Math.random()*200,
					calculateForces
				})
			})

			let edges = points.map((pt,index) => {
				let i0 = Math.floor(Math.random()*10 + 1)
				return new Edge(pt, points[i0%points.length])

			})

			return {
				forces,
				points,
				edges
			}
		},

		el:"#app"
	})

};

