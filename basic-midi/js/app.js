
// URL parameters, eg: mypage.html?x=5&page=6
const urlSearchParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlSearchParams.entries());

window.onload = (event) => {
	Vue.config.ignoredElements = [/^a/];

	new Vue({
		template: `<div id="app">
			<div id="main-columns">
				 <a-scene v-if="false">
			      <!-- Sky -->
			      <a-sky color="#6EBAA7"></a-sky>

			      <!-- Ground -->
			      <a-plane color="#7BC8A4" height="200" width="200" rotation="-90 0 0"></a-plane>

			      <!-- Box -->
			      <a-box position="-1 0.5 -3" rotation="0 45 0" color="#4CC3D9" shadow="cast: true"></a-box>

			      <!-- Sphere -->
			      <a-sphere position="2 1 -5" radius="1.25" color="#EF2D5E" shadow="cast: true"></a-sphere>

			      <!-- Cylinder -->
			      <a-cylinder position="0 0.75 -2" radius="0.5" height="1.5" color="#FFC65D" shadow="cast: true"></a-cylinder>

			      <!-- Animation -->
			      <a-animation attribute="rotation"
			                   dur="10000"
			                   fill="forwards"
			                   to="0 360 0"
			                   repeat="indefinite"></a-animation>
			    </a-scene>
				<div ref="three" /> 
				Hello!
			</div>

			
		</div>`, 
		mounted() {
			// createTHREE({
			// 	el: this.$refs.three,
			// 	w: 300,
			// 	h: 200
			// })
			initMidi({
				onKeyUp:({note,velocity}) => {
				}, 
				onKeyDown:({note,velocity}) => {

				}, 
				onFader:({note,velocity}) => {

				}
			})
		},
		data() {
			return {
				
			}
		},

		el:"#app"
	})

};

