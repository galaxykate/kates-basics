/**
 * Starter code
 *
 */
/* globals Vue, p5, Tracker */
// GLOBAL VALUES, CHANGE IF YOU WANT


document.addEventListener("DOMContentLoaded", (event) => {
  console.log("DOM fully loaded and parsed");

  new Vue({
    template: `<div id="app">
      <div ref="p5" />
      <svg viewBox="-10 -10 120 120">
        <rect x="-10" y="-10" width="120" height="120" fill="blue" />
        
        <mask id="myMask">
          <!-- Everything under a white pixel will be visible -->
          <rect x="0" y="0" width="100" height="100" fill="white" />

          <!-- Everything under a black pixel will be invisible -->
          <path
            d="M10,35 A20,20,0,0,1,50,35 A20,20,0,0,1,90,35 Q90,65,50,95 Q10,65,10,35 Z"
            fill="black" />
        </mask>

        <polygon points="-10,110 110,110 110,-10" fill="orange" />

        <!-- with this mask applied, we "punch" a heart shape hole into the circle -->
        <circle cx="50" cy="50" r="50" fill="purple" mask="url(#myMask)" />
      </svg>
        
    </div>`,



    mounted() {


      // new p5((pNew) => {
      //   p = pNew

      //   p.setup = () => {
      //     p.createCanvas(400, 300);
      //     p.colorMode(p.HSL);

      //   };

      //   p.draw = () => {

      //   };
      // }, this.$refs.p5);
    },

    methods: {
      
    },

    data() {

      return {

      };
    },
    el: "#app",
  });
});
