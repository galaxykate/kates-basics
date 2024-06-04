/**
 * Starter code
 *
 */
/* globals Vue, p5, Tracker */
// GLOBAL VALUES, CHANGE IF YOU WANT

let app = {
  useCapture: false,
  grid: new Grid({width:15,height:10,depth:3}),

  gridSize: {
    displayLayer: 0,
    cellSize: 20,
    cellPadding: 5,
    offset: {x:10, y:10}
  },

  input: new InputTracker({
    drag: {
      start() {
        
      }
    }
  }),
    
  tracker:new Tracker({
    maxHistory: 10,
    modulePath:"/widgets/mediapipe/",
    // landmarkerPath: "https://storage.googleapis.com/mediapipe-models/[TYPE]_landmarker/[TYPE]_landmarker/float16/1/"
    modelPaths: {
      // hand: "/widgets/mediapipe/hand_landmarker.task",
      // face: "/widgets/mediapipe/face_landmarker.task",
      // pose: "/widgets/mediapipe/pose_landmarker_full.task",
    },
    
    createLandmark() {
      return new KVector(0,0,0)
    }
  }),
}

Vue.component({
    template: `<div class="recorder-widget">
        <button>record</button>
        <button>playback</button>
        
    </div>`,

    props: ["tracker"],

  })



document.addEventListener("DOMContentLoaded", (event) => {
  console.log("DOM fully loaded and parsed");

  new Vue({
    template: `<div id="app">
      <div class="columns"> 
        <div class="column">
          <recorder-widget :tracker="app.tracker" />
          <div ref="p5" /> 
          <grid-view v-if="true"  class="overlay" :gridSize="app.gridSize" :grid="app.grid"  />

          <pre v-if="false" class="overlay">{{grid.toTextLines()}}</pre>

          <img v-if="false"  :src="grid.toImage()" :width="grid.width" :height="grid.height" />
        </div>

        <div class="column">
          <div class="controls">
            <input v-model.number="app.gridSize.cellSize" type="range" min="10" max="30" />{{app.gridSize.cellSize}}</label>
            <input v-model.number="app.gridSize.displayLayer" type="range" min="0" max="3" />{{app.gridSize.displayLayer}}</label>
          </div>
        </div>
      </div>
    </div>`,



    mounted() { 

      setInterval(() => {
        app.grid.selectRandom()
      }, 10000)

      // Create processing
      createP5({
        w: 500,
        h: 400,
        el: this.$refs.p5
      })

      // Make the capture and start tracking
      .then(p => {
        
        // Make the P5 capture
        if (app.useCapture) {
          createP5Capture({p,w:400, h:300}).then(capture => {
            app.tracker.source = capture
            app.tracker.isActive = true
          })
        }
        
        app.faceCursor = new KVector()

        p.draw = () => {
          p.background(320, 100, 50)

          // // Tracker drawing
          // app.tracker.drawSource({p,x:0,y:0,flip:true})
          // // Are we in detection or playback mode?
          // if (app.tracker.isActive) {
          //   app.tracker.detect()
          // }
            
          // app.tracker.drawDebugData(p)
          // app.tracker.faces.filter(face => face.isActive).forEach(face => {
            
          //     face.landmarks.forEach(pt => {
          //       p.fill(100)
          //       // console.log(pt.history.length)
          //       pt.history.forEach((pt0,index) => {
          //         p.circle(pt0.x, pt0.y, 10-index)
          //       })
                
          //     })
            
          // }) 
          // console.log(app.grid)
          app.grid.draw({p, ...app.gridSize})
        }
      })
     
    },

    methods: {
      
    },

    data() {

      return {
        app,
        
      };
    },
    el: "#app",
  });
});
