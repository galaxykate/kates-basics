Vue.component("timeline", {
  template: `<div class="widget widget-timeline">
  	<div>{{activeFrameIndex}}/{{frames.length}}</div>
    <div>{{start}} - {{end}}</div>
    <div ref="p5"></div>
  </div>`,

  mounted() {
    createP5({
      w: 400,
      h: 200,
      el: this.$refs.p5,
      draw: (p) => this.draw({p}),

      startDrag: (mouse) => {
        // record where we start dragging
       	this.dragPos = {
       		start:this.start,
       		handle: this.xToT(mouse.x)
       	}
       	this.$emit("focus")
      },

      drag: (mouse) => {
      	// The frame under the mouse should always stay the same
      	// Calculate the new start so that the 
      	
      	let dFrame = mouse.dragOffset.x/this.frameWidth
      	this.start = this.dragPos.start - dFrame
      	this.constrainTimespan()
      	

      	// Clamp to window
      	let newActive = Math.round(this.start + 2)
      	let constrainedActive = constrain(newActive, 0, this.frames.length - 1)
      	// console.log("Drag to new frame, mouseX", mouse.dragOffset.x, newActive, constrainedActive)

      	this.$emit("setActiveFrame", constrainedActive)
       	this.$emit("setTimespan", {start:this.start,end:this.end})
       	
      },

      stopDrag: () => {
        // End the dragging action
        this.dragPos = null;
        this.$emit("blur")
      },
    });

    
  },

  watch: {
  	activeFrameIndex() {
  		
  		this.constrainTimespan()

  	}
  },
  computed: {
  	frameWidth() {
  		return this.box.w/this.frameCount
  	},
    end() {
      // The last visible frame
      return this.start + this.frameCount
    },
  },

  methods: {
  	constrainTimespan() {
    	
  		let range = 2

  		// Constrain it *if* we arent dragging
  		if (this.keepActiveFrameInView && !this.dragPos) {
  			let constrainedStart = constrain(this.start, this.activeFrameIndex - (this.frameCount - 4), this.activeFrameIndex - 4)
  			this.start = constrainedStart
  			// console.log(constrainedStart, this.start, this.activeFrameIndex)
  		}

  		let startRange = this.frameCount - 3
    	this.start = constrain(this.start, - startRange, this.frames.length + startRange - this.frameCount)
    },

  	draw({p}) {

  		// Clear and redraw the timeline
        p.background(50);
        p.fill(40);
       
        let border = 2

        for (let i = 0; i < this.frames.length; i++) {
          
          // Just draw the frames in the scene
          if (i >= this.start - border && i < this.end + border) {
            let x = this.tToX(i);
            let fr = this.frames[i]
            // console.log(i, x)

            // this.drawFrame({
            //   p,
            //   x,
            //   frameIndex: fr.index,
            //   data: fr.data,
            //   isActive: this.activeFrameIndex === i,
            // });
          }
        }
  	},
    drawFrame({ p, frameIndex, x, y = 40, isActive, data }) {
      // Draw individual frame on the timeline
      drawData({
        p,
        x,
        y,
        data,
        size: 10,
        horizontal: true,
      });

      if (isActive) {
        p.fill(150, 100, 50, 0.3);
        p.stroke(150, 100, 50, 0.3);
        p.rect(x, 0, 10, 120);
      }

      p.noStroke();
      p.fill(0);
      p.rect(x, 10, 1, 10);
      p.textSize(10)
      p.text(frameIndex, x, 30);
    },

    tToX(t) {
      // Convert frame index to X coordinate
      return remap(t, this.start, this.start + this.frameCount, 
      		this.box.x, this.box.x1);
    },

    xToT(x) {
      // Convert X coordinate to frame index
      return remap(x, this.box.x, this.box.x1, 
      		this.start, this.start + this.frameCount);
    },
  },

  data() {
    return {
      start: 0, // The starting frame, managed internally
      frameCount: 30, // Number of visible frames in the timeline
      dragStartPos: null, // Tracks the state of dragging
    };
  },

  props: {
  	keepActiveFrameInView: {
  	default: true,
  	},
    activeFrameIndex: {
      type: Number,
      required: true,
    },
    frames: {
      type: Array,
      required: true,
    },
    box: {
      type: Object,
      default() {
        return new Box({ x: 0, y: 0, w: 400, h: 150 });
      },
    },
  },
});
