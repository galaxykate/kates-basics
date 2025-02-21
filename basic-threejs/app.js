/* globals Vue, p5, Tracker */

/**
 * Create a fusion of multiple data channels
 * 	 - a channel is an object (where the data is) + a schema (how the data is shaped)
 *
 */

let app = {
  mouse: new Mouse({
   
  }),

  time: new AppTime(),
  

  init() {
	
  },


  async update() {
    app.time.update()
  },
};

document.addEventListener("DOMContentLoaded", (event) => {
  console.log("DOM fully loaded and parsed");

  new Vue({
    template: `<div id="app">
			<div class="columns"> 
				<div class="column">	
					<div class="controls">
						
					</div>
				
					<div class="three" ref="three" />

				</div>

				<div class="column">	
									
				</div>

			</div>
		</div>`,

    mounted() {
      app.init();


	// Create processing
	createTHREE({
		w: 700,
		h: 500,
		el: this.$refs.three,
    addTestGeo: true,
		update :({scene, camera, renderer}) => {
			app.update()
		}, 
		setup({scene, camera, renderer}) {
      console.log("SETUP???")
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
