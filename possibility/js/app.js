
// URL parameters, eg: mypage.html?x=5&page=6
const urlSearchParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlSearchParams.entries());

window.onload = (event) => {
	Vue.config.ignoredElements = [/^a/];

	new Vue({
		template: `<div id="app">
			<div id="main-columns">
				<div ref="p5" />
			</div>

			
		</div>`, 
		mounted() {
			createP5({
				el: this.$refs.p5,
				w: 300,
				h: 200,
				draw: (p) => {
					
					p.background(0)
					p.push()
					p.translate(p.width/2, p.height/2)
					this.eyes.forEach(eye => eye.draw(p))
					p.pop()
				}
			})
			// initMidi({
			// 	onKeyUp:({note,velocity}) => {
			// 	}, 
			// 	onKeyDown:({note,velocity}) => {

			// 	}, 
			// 	onFader:({note,velocity}) => {

			// 	}
			// })
		},
		data() {
			return {
				eyes: Array.from({length:5}, (_,index) => {
					
					
					return new Eye({
						center: KVector.polar({r:100, theta:index})
					})
				})
			}
		},

		el:"#app"
	})

};

