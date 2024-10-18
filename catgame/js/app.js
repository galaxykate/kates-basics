
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
					<input type="range" v-model="globalSpeed"  min=".2" max="2" step=".1" />{{globalSpeed}}
				</div>
				<div hidden>
					KATE {{loveEmoji}} JONAS
					<div>
						LOVE: {{love}}
						<button @click="love++">{{emoji}}</button>
						<select v-model="emoji">
							<option  v-for="em in emojiChoices">{{em}}</option>
						</select>
					</div>
				</div>
				<div>
					<div v-for="system in systems">
						{{system.id}}: {{system.t.toFixed(2)}}
						<div>
							Draw forces:<input type="checkbox" v-model="system.flags.drawForces" /> 
							<input type="color" v-model="system.color0" />
							<input type="color" v-model="system.color1" />
							<div><input type="range" v-model.number="system.val0" min=0 max=1 step=".02" /> {{system.val0}}</div>
							<div><input type="range" v-model.number="system.val1" min=0 max=1 step=".02" /> {{system.val1}}</div>
						</div>
					</div>
				</div>
				<div ref="p5"></div>	
				</div>	
				
			</div>

			
		</div>`, 
		computed: {
			loveEmoji() {
				return this.emoji.repeat(this.love);
			}
		},
		mounted() {


			createP5({
				el: this.$refs.p5,
				w: 600,
				h: 400,

				draw: (p) => {
					var perSecond = this.globalSpeed / 3
					var t = p.millis()/5000

					this.systems.forEach(system => system.update({t, dt: perSecond, p}))
					
					// DRAW STUFF
					// p.background(180, 100, 90)
					

					p.push()
					

					this.systems.forEach(system => {
						// TODO fix when we have more systems
						let bgHSL = hexToHSL(system.color0)
						p.fill(...bgHSL, .1)
						p.rect(0, 0, p.width, p.height)


						if (system.flags.drawForces)
							system.drawForces({p})
					})
					this.systems.forEach(system => system.draw({p}))


					p.pop()
	

					// DEBUG INFO
					var DEBUG = true
					// var DEBUG = false

					

					
				}
			}).then(p => {
				// This is setup down here
				this.p = p
				p.textSize(6)

				// Create a bunch of particles

				// let friendsSystem = new ParticleSystem({
				// 	id: "rain",
				// 	count: 20,

				// 	forces: [
				// 		{
				// 			name: "gravity",
				// 			active: false,
				// 			color: [0, 0, 20],
				// 			calculate({forceVector, pt, system}) {}
				// 		},

				// 		{
				// 			name: "border",
				// 			active: false,
				// 			color: [120, 100, 40],
				// 			calculate({forceVector, pt, system}) {

				// 				// Get the offset to the center 
				// 				let center = new KVector(p.mouseX-p.width/2, p.mouseY-p.height/2)

				// 				// Create the offset vector TOWARDS the center
				// 				let offset = KVector.sub(center, pt)

				// 				// Update my border force
				// 				let d = offset.magnitude
				// 				let range = 5
				// 				// No force until you get outside
				// 				let strength = .01*Math.max(0, d-range)
				// 					// console.log(d)
				// 				if (d) {

				// 					forceVector.setToMultiple(strength/d, offset)
				// 					// console.log(pt.borderForce, strength/d, pt)
				// 				}
				// 			}
				// 		},
						
				// 		{
				// 			name: "wind",
				// 			active: false,
							
				// 			color: [220, 100, 40],
				// 			calculate({forceVector, pt, system}) {

				// 				let t= system .t

				// 				// windforce!!
				// 				let windMultiplier = 10
				// 				// pt.windForce.x = (p.noise(t) - .5)*3 
				// 				forceVector.x = p.noise(t)*2 
				// 				forceVector.y = p.noise((1+t)/2)/3
				// 			}
				// 		},
						
				// 		{
				// 			name: "personality",
				// 			color: [320, 100, 40],
				// 			active: false,
				// 			calculate({forceVector, pt, system}) {
				// 				// Polar wander
				// 				forceVector.setToPolar(0.34, 60*p.noise(pt.idNumber, system.t*.01))

				// 			}
				// 		},
						
				// 	],

				// 	initParticle: ({pt, index}) => {
				// 		console.log("Make particle", index, pt)

				// 		// r, theta
				// 		pt.setToPolar(40 + 5*index, index*.3)
				// 		// Go 100 fast, in some direction
				// 		pt.velocity.setToPolar(1, Math.random()*100)
				// 	}, 
				// 	calculateForces: ({t, pt, index}) => {
						

				// 	}, 
				// 	afterMove: ({t, pt, index}) => {

				// 		pt.velocity.mult(.99)
				// 	}, 
				// 	drawParticle: ({p,pt}) => {
				// 		// console.log("draw", pt)

				// 		// et the angle I'm going (in radians)
				// 		let angle = pt.velocity.angle
						
				// 		// Body
				// 		p.push()
				// 		p.translate(pt.x, pt.y)
						
				// 		// p.line(0, 0, ...pt.velocity)
				// 		// pt.forces.forEach((f, index) => {
				// 		// 	// p.stroke(index*50, 100,50,1)
				// 		// 	// p.line(0, 0, f.x*50,f.y*50)
				// 		// })
				// 		p.stroke(0)

				// 		p.rotate(angle - Math.PI/2)
				// 		p.circle(0, 0, 20)

				// 		p.fill(0)
				// 		p.textSize(25)
				// 		p.text(this.emoji, 0,0)
				// 		p.circle(5, 5, 6)
				// 		p.circle(-5, 5, 6)
				// 		// Eye
				// 		p.pop()

				// 	}, 
				// 	drawSystem: ({p}) => {
				// 		// p.circle(0, 0, 300)
				// 	}
				// })

				// this.systems.push(friendsSystem)


				let rainSystem = new ParticleSystem({
					id: "rain",
					count: 20,

					forces: [
						{
							name: "gravity",
							active: false,
							color: [0, 0, 20],
							calculate({forceVector, pt, system}) {
								forceVector.setTo(0, 2)
							}
						},

						
						{
							name: "wind",
							active: false,
							
							color: [220, 100, 40],
							calculate({forceVector, pt, system}) {
								let m = .00003
								let t= system.t*.001*system.val1
								let r = system.val0*10
								let theta = 100*noise(pt.x*m, pt.y*m, t)
								forceVector.setToPolar(r, theta)
							}
						},
						
						
					],

					initParticle: ({pt, index}) => {
						pt.x = Math.random()*p.width
						pt.velocity.setTo(0, 10 + Math.random()*10)
						pt.size = 10*Math.random()**2

						pt.hue = Math.random()*360
					}, 

					preUpdate({system}) {
						if (this.particles.length < 100)
							system.addParticle()
					},
					
					afterMoveParticle: ({system, t, pt, index}) => {
						// console.log("After moove")
						pt.velocity.mult(.98)

						if (pt.y > p.height) {
							
							if (pt.size > 5) {
								// SPLAT IN TWO
								
								pt.velocity.y *= -.5
								pt.y = p.height - 10
								pt.size *= .5

								let baby = system.addParticle({cloneParticle:pt})
								baby.size = pt.size 
								baby.velocity.x += 10*(Math.random() - .5)
								baby.velocity.y *= Math.random()

							} else {
								// DEAD
								pt.isDead = true
							}
							
						}
					}, 

					postUpdate: ({system}) => {
						// Delete all the dead particles
						system.particles = system.particles.filter(pt => !pt.isDead)
					},

					drawParticle: ({p,pt, system}) => {
						let ptHSL = hexToHSL(system.color1)

						p.noStroke()
						// p.fill(pt.hue, 100, 50)

						p.fill(...ptHSL)
						p.circle(pt.x, pt.y, pt.size + 3)
						if (pt.isDead)
							p.circle(pt.x, pt.y, 50)
					}, 
					drawSystem: ({p}) => {
						
					}
				})

				this.systems.push(rainSystem)
			})

			initMidi({
				onFader: ({id, val}) => {
					console.log(id, val)
					this.systems.forEach(system => {
						system.val0 = val/128
					})
				}	
			}) 
			
		},
		data() {

			
			return {
				globalSpeed: 1,
				systems: [],
				love: 1,
				emojiChoices: ["💕", "💖", "💙", "💞"],
				emoji: "💖"
			}
		},

		el:"#app"
	})

};

