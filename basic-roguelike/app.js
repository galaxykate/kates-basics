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
    
  // Recording stuff
  recorder: new Recorder(),

  objectsByUID: {},

  registerUID(obj, uid) {
    if (!uid)
      uid = uuidv4()
    Vue.set(this.objectsByUID, uid, obj)
    // this.objectsByUID[uid] = obj
  },

  getObjectByUID(uid) {
    return this.objectsByUID[uid]
  },

  get frame() {
    return this.recordingChannels.map(channel => {
      let val = getAtPath(this, channel.path)
      return {channel,val}
    })
  },

  set frame(frame) {
    // console.log("SET FRAME", frame)

    return frame.map(({path, val}) => {
      // console.log(path, val)
      setAtPath(this, path, val)
    })
  },

  // face/hand tracking stuff
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

  noiseValues: {
    a: 0,
    b: 0,
    c: [0, 0, 0]
  },

  get recordingChannels() {
    let channels = []
    forEachInObj({
        obj:this.objectsByUID, 
        fxn:({obj, fxn, path, parent, key}) => {
          // Add this channel, as a ...path?
          channels.push({
            path:["objectsByUID"].concat(path)
          })
        }
    })
    return channels
  },



  init() {

      // Add all the trackables to the recorder
      // this.tracker.trackables.forEach(trackable => {
      //   this.recorder.addTrackableLandmarks({trackable})
      // })

    this.recorder.onPlaybackFrame((frame) => {
      this.frame = frame
    })
    // this.recorder.addChannels(this.noiseValues)
    let path =  ["noiseValues", "c", 1]
    let val = getAtPath(this, path)
    
    this.registerUID({
      x:Math.random(),
      y:Math.random(),
      z:Math.random(),
    }, "test")

    this.registerUID({
      x:Math.random(),
      y:Math.random(),
      z:Math.random(),
    }, "test2")

    let val2 = []
    for (var i = 0; i < 5; i++) {
      val2.push({
        index: i,
        x:Math.random(),
        y:Math.random(),
        z:Math.random(),
      })
    }

    this.registerUID({
      pts: val2,
    }, "arr")

    app.recorder.startRecording({channels: app.recordingChannels})

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
   
  }
}



document.addEventListener("DOMContentLoaded", (event) => {
  console.log("DOM fully loaded and parsed");

  new Vue({
    template: `<div id="app">
      <div class="columns"> 
        <div class="column">
     
          <recorder-widget :recorder="app.recorder" />
          <div class="grid" v-show="false">

            <div ref="p5"  /> 
            <grid-view v-if="true"  class="overlay" :gridSize="app.gridSize" :grid="app.grid"  />

            <pre class="overlay">{{app.grid.toTextLines()}}</pre>

            <img :src="app.grid.toImage()" :width="app.grid.width" :height="app.grid.height" />
          </div>
        </div>

        <div class="column">
          <number-trackers :obj="app.noiseValues" />
          <number-trackers :obj="app.objectsByUID" />
          <div class="controls">
            <input v-model.number="app.gridSize.cellSize" type="range" min="10" max="30" />{{app.gridSize.cellSize}}</label>
            <input v-model.number="app.gridSize.displayLayer" type="range" min="0" max="3" />{{app.gridSize.displayLayer}}</label>
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
        el: this.$refs.p5
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
        
        app.faceCursor = new KVector()

        p.draw = () => {
          p.background(320, 100, 50)

          app.update()

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
