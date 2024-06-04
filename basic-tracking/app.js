/**
 * Starter code
 *
 */
/* globals Vue, p5, Tracker */
// GLOBAL VALUES, CHANGE IF YOU WANT

const DEFAULT_FRAME_RATE = 30;

let tasks = [];
let p;
const WIDTH = 600;
const HEIGHT = 400;

let tracker = new Tracker({
  mediapipePath:"/mediapipe/",
  // handLandmarkerPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/",
  // faceLandmarkerPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/",
  // poseLandmarkerPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker/float16/1/"
  handLandmarkerPath: "/mediapipe/",
  faceLandmarkerPath: "/mediapipe/",
  poseLandmarkerPath: "/mediapipe/",
});

function toTimeText(timestamp) {
  let date = new Date(timestamp);
  return (
    date.toLocaleDateString("en-us", { month: "short", day: "numeric" }) +
    ", " +
    date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
  );
  return;
}

document.addEventListener("DOMContentLoaded", (event) => {
  console.log("DOM fully loaded and parsed");

  new Vue({
    template: `<div id="app">
      
      <div id="p5" ref="p5"></div>
		</div>`,

    methods: {
      
    },

    computed: {
     
    },

    watch: {
     
    },

    mounted() {
      new p5((pNew) => {
        p = pNew
        // We have a new "p" object representing the sketch
     
        p.frameRate(DEFAULT_FRAME_RATE);

        this.capture;
        p.setup = () => {
          p.createCanvas(WIDTH, HEIGHT);
          p.colorMode(p.HSL);
          tracker.createCaptureAndInitTracking(p)

        };

        p.draw = () => {

          tracker.detect()


          let t = p.millis()*.001
          p.background(100)
          tracker.drawDebugData(p)
         
          function circle(pt, r) {
            p.circle(pt.x, pt.y, r)
          }

          function arrow({pt, v, m, color=[0,0,0]}) {
            p.push()

            let len = 10
            let w = 5
            let dx = m*v.x
            let dy = m*v.y
            let x0 = dx + pt.x
            let y0 = dy + pt.y

            p.noFill()
            p.stroke(...color)
            p.line(pt.x, pt.y, x0, y0)

            p.translate( x0, y0)
            p.noStroke()
            p.fill(...color)
            p.rotate(Math.atan2(dy, dx))
            p.triangle(0, 0, -len, w, -len, -w)

            p.pop()

          }



          p.push()
          // p.scale(7, 7)
          p.fill(0)
          p.noStroke()
          p.textSize(1)

          // p.translate(-100, -60)
          tracker.faces.forEach(face => {
            face.landmarks.forEach((pt, index) => {
              // if (index > 50) {

              //   p.text(pt.index, pt.x, pt.y)
              // }
            })
            face.side.forEach(side => {
              // side.eyeRings.forEach(ring => {
              //   ring.forEach(pt => {
              //     p.noStroke()
              //     p.fill(0)
              //     p.textSize(1)
              //     p.text(pt.index, pt.x, pt.y)
              //     circle(pt, 1)
              //     // p.circle(, 10)
              //   })
              // })

              p.strokeWeight(.2)
              p.stroke(320, 100, 50)
              p.noFill()
              // circle(side.eyeTop, 2)
              p.stroke(200, 100, 50)
              p.noFill()
              // circle(side.eyeBottom, 2)

              circle(side.eyeCenter, 20 + 20*Math.sin(t))

              p.beginShape()
              side.irisRing.map(pt => p.vertex(pt.x, pt.y))
              p.endShape()

              console.log(side.irisDir.history)
              side.irisDir.history.forEach(v => {
                  arrow({pt: side.irisCenter, v, m:100})
              })
              
              

              circle(side.irisCenter, 2)

              
              
            })

          })
          p.pop()

           tracker.hands.forEach(hand => {
            hand.fingers.forEach((f,index) => {
              f.dir.history.forEach((v,hIndex) => {
                  arrow({pt: f.tip, v, m:100, color:[0,0, 0, 1/hIndex]})
              })
              
            })
          })





          // console.log(this.tracker.hands[0].landmarks.length)
          
        };
      }, this.$refs.p5);
    },

    data() {
      
      return {
       
        tracker,

      };
    },
    el: "#app",
  });
});
