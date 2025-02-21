/* globals Vue, p5, Tracker */

/**
 * Create a fusion of multiple data channels
 * 	 - a channel is an object (where the data is) + a schema (how the data is shaped)
 *
 */

let app = {
  mouse: new Mouse({
    getObjectFromElement: (el) => {
      return app.cards.find((card) => card.id === el.id);
    },
  }),
  game: new Ocean(),
  cards: [],
  time: new AppTime(),
  svg: "",

  init() {
	this.game.start()
  },


  async update() {},
};

document.addEventListener("DOMContentLoaded", (event) => {
  console.log("DOM fully loaded and parsed");

  new Vue({
    template: `<div id="app">
			<div class="columns"> 
				<div class="column">	
					<div class="controls">
						<component :app="app" :is="'controls-' + app.game.id"></component>

					</div>
				
					CARDS {{app.cards.length}}
					<card v-for="card in app.cards" :key="card.id" :card="card" />
					
					

				</div>

				<div class="column">	
									
				</div>

			</div>
		</div>`,

    mounted() {
      app.init();


	// Create processing
	createP5({
		w: 500,
		h: 800,
		el: this.$refs.p5,
		draw :(p) => {
			// Update

			app.time.update();
			app.update();
			
			// Draw stuff
			p.background(50)

			app?.draw({p, time:app.time})
			
		
			
		}, 
		setup(p) {
			app.p = p
			app.init({p})
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
