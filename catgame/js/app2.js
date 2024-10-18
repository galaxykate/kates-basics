
// URL parameters, eg: mypage.html?x=5&page=6
const urlSearchParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlSearchParams.entries());

function LoopAroundEdges(pt, p){

		if(pt[0] > p.width){
			pt[0] = 0;
		} else if(pt[0] < 0){
			pt[0] = p.width;
		}
		if(pt[1] > p.height){
			pt[1] = 0;
		} else if(pt[1] < 0){
			pt[1] = p.height;
		}
		return pt;
}

window.onload = (event) => {
	Vue.config.ignoredElements = [/^a/];

	new Vue({
		template: `<div id="app">
			<div id="main-columns">
				<div class="column">
				<div>
					<input type="range" v-model="globalSpeed"  min=".2" max="2" step=".1" />{{globalSpeed}}
				</div>
				KATE {{loveEmoji}} JONAS
				<div>
					LOVE: {{love}}
					<button @click="love++">{{emoji}}</button>
					<select v-model="emoji">
						<option  v-for="em in emojiChoices">{{em}}</option>
					</select>
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

					// UPDATE PARTICLE STUFF
					this.particles.forEach((pt, index) => {
						
						// let's invent some new forces! 
						// each intent 'flee', 'wanna f***' can be a force vector!
						pt.acc[0] = p.noise(index,t)-0.5;
						pt.acc[1] = p.noise(index+100,t)-0.5;

						// constant 
						// use acceleration per second to alter the velocity
						pt.velocity[0] += pt.acc[0] * perSecond;
						pt.velocity[1] += pt.acc[1] * perSecond;
						// use velocity actual move
						pt[0] += pt.velocity[0] * perSecond;
						pt[1] += pt.velocity[1] * perSecond;


						// apply drag forces
						pt.velocity = pt.velocity.map(n => n * 0.95) 

						// do looping
						pt = LoopAroundEdges(pt, p)

					})

					// DRAW STUFF
					p.background(180, 100, 90)
					
					
					// DEBUG INFO
					var DEBUG = true
					// var DEBUG = false

					// draw particle
					this.particles.forEach(pt => {
						p.stroke(0)
						p.strokeWeight(0.5)
						p.circle(...pt, 5)
						var [x,y] = pt;
						var [velX,velY] = pt.velocity;
						var [accX,accY] = pt.acc;

						var accScale = 100;
						p.strokeWeight(2)

						// draw velocity vector
						p.stroke(200,100,30,0.1,8)
						if(DEBUG)
						{
							p.text("velocity \n(" + velX.toFixed(1) + "," + velY.toFixed(1) + ")", x-15, y-10)
						}
						p.stroke(200,100,30,1)
						p.line(x,y,velX+x, velY+y)
						
						// draw acceleration vector
						p.stroke(100,100,30,1)
						accX_display = accX * accScale + x 
						accY_display = accY * accScale + y
						p.line(x,y,accX_display,accY_display)

						// draw line between particles
						// var shortestPt2 = null
						this.particles.forEach(pt2 =>
						{
							//if (isCloserThan(pt2,shortesPt2){
							//  shortestPt2 = pt2;
							//}
							// p.line(...pt2, ...pt)
						})
						// p.line(...shortestPt2, ...pt)
					})


					
				}
			}).then(p => {
				// This is setup down here
				this.p = p
				p.textSize(6)

				// Create a bunch of particles

				for (var i = 0; i < 100; i++) {
					let x = Math.random()*p.width
					let y = Math.random()*p.height
					let pt = [x,y]

					let pt2 = new Particle({position: [x,y], velocity:[0,0]})
					

					pt.velocity = [0,0]
					pt.acc = [0,0.20]
					this.particles.push(pt)

				}
			})
			
		},
		data() {

			
			return {
				globalSpeed: 1,
				particles: [],
				love: 1,
				emojiChoices: ["💕", "💖", "💙", "💞"],
				emoji: "💖"
			}
		},

		el:"#app"
	})

};

