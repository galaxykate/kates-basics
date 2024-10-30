/**
 * Starter code
 *
 */
/* globals Vue, p5, Tracker */
// GLOBAL VALUES, CHANGE IF YOU WANT


// Example configuration
const trackerConfig = {
    maxHistory: 10,
    numHands: 2,
    numPoses: 0,
    numFaces: 1,
    doAcquireFaceMetrics: true,
    doAcquirePoseMetrics: true,
    doAcquireHandMetrics: true,
    modulePath: "../vendor/mediapipe/",
    modelPaths: {
        face: "../vendor/mediapipe/face_landmarker.task",
        hand: "../vendor/mediapipe/hand_landmarker.task",
        // pose: "../vendor/mediapipe/"
    },

    // handLandmarkerPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/",
    // faceLandmarkerPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/",
    // poseLandmarkerPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker/float16/1/"
  
    gpu: true,
    createLandmark: (x, y, z) => new KVector(x, y, z) // Assuming KVector is defined
};

const DEFAULT_FRAME_RATE = 30;

let tasks = [];
let p;
const WIDTH = 600;
const HEIGHT = 400;

let tracker = new Tracker(trackerConfig);


document.addEventListener("DOMContentLoaded", (event) => {
  console.log("DOM fully loaded and parsed");

  new Vue({
    template: `<div id="app">
      
      <div id="p5" ref="p5"></div>
      <div>
        <div v-for="tr in tracker.trackables">
          {{tr.id}} 
          <table>
            <tr v-for="i in ['x', 'y', 'z']">
              <td>{{i}}</td>
              <td>{{tr.boundingBox[0][i].toFixed(2)}}</td>
              <td>{{tr.boundingBox[1][i].toFixed(2)}}</td>
            </tr>
          </table>
        </div>
      </div>
		</div>`,

    methods: {
      
    },

    computed: {
     
    },

    watch: {
     
    },

    mounted() {
      // Create processing
      createP5({
        w: 700,
        h: 500,
        el: this.$refs.p5,
        draw: (p) => {

        
          //===============
          // DRAW
          p.background(320, 100, 50)
          this.tracker.detect()
          this.tracker.drawSource({p,x:0,y:0,flip:true})
          this.tracker.drawDebugData(p)
          

          this.tracker.hands.forEach(hand => {


            hand.fingers.forEach((finger,index) => {
               p.circle(finger.tip.x, finger.tip.y, finger.scale*10)
            if (index > 0) {
                  p.circle(finger.tip.x, finger.tip.y, 4*finger.pinchAmt)
                  // let pinch = Math.max(5,finger.thumbPinch.magnitude)
             
               
                // if (finger.pinch) {
                //   finger.pinch.pts.forEach(pt => {
                //     p.circle(pt.x, pt.y, 5)
                //   })
                // }
              }
              
            })
          })
          

             
        }
    })

      // Make the capture and start tracking
      .then(p => {
        // Make the P5 capture
        
        createP5Capture({p}).then(capture => {
          this.tracker.source = capture
          this.tracker.isActive = true
        }).catch(error => {
          console.log("p5", p)
          console.warn("Error on creating capture", error)
        })
        

      })
    },

    data() {
      
      return {
       
        tracker,

      };
    },
    el: "#app",
  });
});
