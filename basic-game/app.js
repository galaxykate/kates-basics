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
  cards: [],
  time: new AppTime(),
  svg: "",

  init() {
    // fetch("../_assets/svg/Welsh_Dragon.svg") // Change to your actual SVG file path
    fetch("../_assets/svg/Welsh_Dragon.svg") // Change to your actual SVG file path
      .then((response) => response.text()) // Get the raw SVG content
      .then((svgData) => {
        app.svg = svgData;
        // console.log(svgData)
        //   document.getElementById("svg-container").innerHTML = svgData;
        //   let svgElement = document.getElementById("svg-container").querySelector("svg");

        //   // Example: Change the color of all circles
        //   let circles = svgElement.querySelectorAll("circle");
        //   circles.forEach(circle => {
        // 	circle.setAttribute("fill", "blue");
        //   });

        //   console.log("SVG Loaded & Modified!");
      })
      .catch((error) => console.error("Error loading SVG:", error));

    // // utility to create all tarot card

    let suits = ["w", "s", "c", "p", "m"];
    suits.forEach((suit) => {
      let count = suit === "m" ? 21 : 14;
      for (var i = 0; i < count; i++) {
        let index = (i + 1 + "").padStart(2, "0");
        let idNumber = app.cards.length;
        app.cards.push(
          new Card({
            image: {
              src: `../_assets/tarot/${suit}${index}.jpg`,
            },
            data: {
				suit,
				index: i,
			},
          })
        );
       
      }
    });
    console.log("CARDS", app.cards);
  },

  async update() {},
};

document.addEventListener("DOMContentLoaded", (event) => {
  console.log("DOM fully loaded and parsed");

  new Vue({
    template: `<div id="app">
			<div class="columns"> 
				<div class="column">	
					CARDS {{app.cards.length}}
					<card v-for="card in app.cards" :card="card" />
					
					

				</div>

				<div class="column">	
									
				</div>
			</div>
		</div>`,

    mounted() {
      app.init();
      setInterval(() => {
        app.time.update();
        app.update();
      });
    },

    data() {
      return {
        app,
      };
    },
    el: "#app",
  });
});
