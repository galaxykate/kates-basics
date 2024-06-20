/**
 * Starter code
 *
 */
/* globals Vue, p5, Tracker */
// GLOBAL VALUES, CHANGE IF YOU WANT

let app = {


  useCapture: true,


  // grid: new Grid({width:15,height:10,depth:3}),
  // gridSize: {
  //   displayLayer: 0,
  //   cellSize: 20,
  //   cellPadding: 5,
  //   offset: {x:10, y:10}
  // },

  // Recording stuff
  // We probably need to play back the recording with the same settings
  recorder: new Recorder(),
  recording: undefined,
  player: new RecordingPlayer(),



  // We can only record fixed objects anyways, no 
  dataKeys: [],
  objectDirectory: {
   
  },

  // Get and load data as a frame (allows us to save strings?)
  get dataFrame() {

      // Get data for this frame
      return app.dataKeys.map((id) => {
        let obj = this.objectDirectory[id]

        if (!obj)
          console.warn(`No object for id ${id}`, this.objectDirectory)
        else {
          let dataCopy = JSON.parse(JSON.stringify(obj.data))
          return {
            id,
            data: dataCopy // Double check for non-JSON data
          }
        }
      })
  },

  set dataFrame(frame) {
    frame.forEach(({id,data}) => {
      this.objectDirectory[id].set(data)
    })
  },

  set dataFrame(frame) {
    frame.forEach(({id,data}) => {
      this.objectDirectory[id].set(data)
    })
  },

  get numericalFrame() {
    // Returns {data (Array of numbers), indices: [{id,len,start,end}]}
      // Get flat numerical for this frame
      let frame = {
        indices:[]
      }
      let startIndex = 0

      let arrs = ids.map((id,index) => {
        let obj = this.objectDirectory[id]
        let flatData = obj.flatData
        
        frame.indices[index] = {
          id: id,
          len: flatData.length,
          start: startIndex, 
          end: startIndex + flatData.length
        }
        return flatData
      })
      frame.data = arrs.flat
      return frame
  },




  // face/hand tracking stuff
  tracker:new Tracker({
    maxHistory: 10,
    modulePath:"../vendor/mediapipe/",
    // landmarkerPath: "https://storage.googleapis.com/mediapipe-models/[TYPE]_landmarker/[TYPE]_landmarker/float16/1/"
    modelPaths: {
      hand: "../vendor/mediapipe/hand_landmarker.task",
      face: "../vendor/mediapipe/face_landmarker.task",
      // pose: "/widgets/mediapipe/pose_landmarker_full.task",
    },

    numHands: 6,
    numPoses: 3,
    numFaces: 3,
  
    createLandmark() {
      return new KVector(0,0,0)
    }
  }),


  init() {


    app.objectDirectory.hand0 = this.tracker.hands[0]
    app.objectDirectory.hand1 = this.tracker.hands[1]
    app.dataKeys = ["hand0", "hand1"]

    console.log(app.dataFrame)

    app.recorder = new Recorder({
      getDataFrame: () => {
    
      },
    })

    
    // let v0 = new WaterClock({})

    // // Example usage
    // let clock = new WaterClock();

    // console.log(v0)

    // let attack = new MultiGradient(["h", "s", "l", "y"])
    // let sustain = new MultiGradient(["h", "s", "l", "y"])
    // let release = new MultiGradient(["h", "s", "l", "y"])
    // app.gradients = [attack, sustain, release]
    // let t = Date.now()*.001
    // for (var i = 0; i < 3; i++) {
    //   let f = new EnvelopeFollower({

    //     attack: {
    //       gradient:attack,
    //       length: Math.random()*.5 + .5
    //     },
    //     sustain: {
    //       gradient:sustain,
    //       loop: 5,
    //       length: Math.random()*.5 + .5
    //     },
    //     release: {
    //       gradient:release,
    //       length: Math.random()*.5 + .5
    //     }

    //   }, true)
    //   app.followers.push(f)
    //   f.start(t)
    // }

  },



  update() {
    let t = Date.now()*.001

    if (app.recorder.isPlaying) {

    } 
    else {
       let index = 0
      forEachInObj({  
        obj:this.objectsByUID, 
        fxn: ({val, path, parent, key}) => {
          index++
          if (key !== "index") {
            parent[key] = .4*noise(index, t*2) + .5*noise(t*4)
          }
        }
      })

      

    }

    app.recorder.update({t, frame: app.frame})
    // app.followers.forEach(f => f.update(t))
   
  }
}



document.addEventListener("DOMContentLoaded", (event) => {
  console.log("DOM fully loaded and parsed");

  new Vue({
    template: `<div id="app">
      <div class="columns"> 
        <div class="column">

          <recorder-widget :recorder="app.recorder"  v-show="false" />
          <div class="grid" v-if="false">

            <div ref="p5"  /> 
            <grid-view class="overlay" :gridSize="app.gridSize" :grid="app.grid"  />
            <pre class="overlay">{{app.grid.toTextLines()}}</pre>
            <img :src="app.grid.toImage()" :width="app.grid.width" :height="app.grid.height" />
          </div>
        </div>

        <div class="column">
      
          <div class="controls">
           
          </div>
        </div>
      </div>
    </div>`,



    mounted() { 
      app.init()

      

      setInterval(() => {
        app.grid.selectRandom()
      }, 10000)

      // Create processing
      createP5({
        w: 500,
        h: 400,
        el: this.$refs.p5,
        draw(p) {
           p.background(320, 100, 50)
          app.update()

          // // Tracker drawing

          // Are we in detection or playback mode?
          if (app.tracker.isActive) {
            app.tracker.detect()
          }
            
          app.tracker.drawSource({p,x:0,y:0,flip:true})
          app.tracker.drawDebugData(p)
          app.tracker.hands[0].landmarks[8].draw(p, 10)
          app.tracker.faces.filter(face => face.isActive).forEach(face => {
            
              // face.landmarks.forEach(pt => {
              //   p.fill(100)
              //   // console.log(pt.history.length)
              //   pt.history.forEach((pt0,index) => {
              //     p.circle(pt0.x, pt0.y, 10-index)
              //   })
                
              // })
            
          }) 

          // console.log(app.grid)
          // app.grid.draw({p, ...app.gridSize})
        }
      })

      // Make the capture and start tracking
      .then(p => {
        
        // Make the P5 capture
        if (app.useCapture) {
          createP5Capture({p,w:p.width, h:p.height}).then(capture => {
            app.tracker.source = capture
            app.tracker.isActive = true
          })
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
