

let editors = []
// Which editors are we watching? Which are we driving?



// URL parameters, eg: mypage.html?x=5&page=6
const urlSearchParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlSearchParams.entries());

window.onload = (event) => {


	new Vue({
		template: `<div id="app">
			<div id="main-columns">
				
				Hello!
			</div>
			
		</div>`, 
		
		data() {
			return {
				
			}
		},

		el:"#app"
	})

};

