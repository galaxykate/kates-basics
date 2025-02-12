Vue.component("timeline-widget-channel", {
    template: `<div class="grid-row" >
        <div class="grid-cell">x</div>
        <div v-for="i in frameRange" class="grid-cell">{{ i }}</div>
    </div>`,
    props: ["channel", "recording", "channelIndex", "frameRange"]
});

Vue.component("timeline-widget", {
    template: `<div class="widget">
    
    <div>
        <div>
            <select @change="(evt)=>recorder.load(evt.target.value)" value="none">
                <option v-for="(data,name) in recorder.savedRecordings">{{name}}</option>
            </select>
        </div>
        <div>
            <div class="chip" 
                v-for="tool in tagPalette" :style="colorStyle(tool.color, activeTool === tool)"
                @click="toggleTool(tool)"
                >
                {{tool.label}}</div>
        </div>
        t:{{playback.t.toFixed(2)}}, tool: {{activeTool?.label}}
        <div v-if="drag">
            DRAGGING {{drag.start}}
        </div>
        <div v-if="recording">
            Name:<input v-model="recording.name" />
            <div>channels:{{channels.map(ch => ch.id)}}</div>
            <div>frame:{{playback.frameIndex}}/{{frameCount}}</div>
        </div>
        <div>
            <input type="range" 
                min="0" max="24"
                v-model.number="playback.frameRate" />
                <label>rate:{{playback.frameRate}}</label> 
        </div>

        <div class="grid-container">   
            <div class="grid-header">TOP</div>
            <timeline-widget-channel 
                v-for="(ch,chIndex) in channels" 
                
                :frameRange="frameRange" :channel="ch" />
            <div class="grid-footer">BOTTOM</div>
        </div>
    </div>
        <div ref="timelineP5" />		
    </div>`,

    watch: {
        viewStart() {
            // When the window is moved
            this.currentFrame = Math.min(this.frameCount, Math.max(0, Math.floor(this.viewStart + 2)))
            
        },

        currentFrame() {
            this.playback.setToFrame(this.currentFrame)
        },

        channels() {
            
            console.log("\n!!!! New channels:", this.channels.map(ch => ch.id), "start new recording")
            this.startNewRecording()
        }    
    },


    methods: {
        toggleChannel(ch, chIndex) {
            console.log(chIndex, ch.id)
        },
        save() {
            console.log("save")
        },

        startNewRecording() {
            this.recorder.startNewRecording({name:"test", tags: ["mask", "theatre"], channels:this.channels})
            this.recorder.fakeData({frameCount:20, channels:this.channels})
            this.playback.start({recording: this.recording, channels:this.channels})
        },

        hasFrame(i) {
            return i >= 0 && i < this.frameCount
        },

    
        toggleTool(tool) {
            // Turn off if active, or set the tool to this
            this.activeTool = this.activeTool === tool? undefined:tool
            console.log(this.activeTool)
        },
        colorStyle([h,s,l], isActive) {
            let borderSize = isActive?3:1
            return {
                position: "relative",
                top: isActive?"-2px":undefined,
                backgroundColor: `hsla(${h.toFixed(2)}, ${(s).toFixed(2)}%, ${(l).toFixed(2)}%, 1)`,
                color: `hsla(${h.toFixed(2)}, ${(s).toFixed(2)}%, ${lerp(l, 0, .8).toFixed(2)}%, 1)`,
                border: `${borderSize}px solid hsla(${h.toFixed(2)}, ${(s).toFixed(2)}%, ${lerp(l, 0, .8).toFixed(2)}%, 1)`
            }
        },
        
        frameToX(frame) {
            return (frame - this.viewStart)*this.frameW + this.box.x
        },
        xToFrame(x) {
            return  (x - this.box.x)/this.frameW + this.viewStart
        },    
        
        drawTags({p, getTags, y}) {

            this.forAllDrawableFrames(({x, frameIndex, isCurrent, opacity, frame}) => {
               
              
                
                if (frame) {
              
                    let tagSet = getTags(frame)
                    Array.from(tagSet).sort().forEach((tag,index) => {
                        if (!this.tagPalette[tag])
                            Vue.set(this.tagPalette, tag, {
                                label:tag,
                                color:[Math.random()*360, 100, 50]
                            })
                        let color = this.tagPalette[tag].color
                      
                        
                        p.fill(...color)
                        p.stroke(color.hue, 100, 40)
                        // p.rect(x, 10*index, this.frameW, 10)
                        p.rect(x, y + 10*index, this.frameW, 10)
                    }) 
                }
             })
        },
       
       forAllDrawableFrames(fxn) {
        for (var i = 0; i < this.viewCount + 1; i++) {
            let frameIndex = Math.floor(i + this.viewStart)
            let x = this.frameToX(frameIndex)

            let frame = this.recording?.frames[frameIndex]
            let isCurrent = this.currentFrame === frameIndex
            
  
            let opacity = isCurrent?1:frame?.5:.2

            fxn({x,isCurrent, opacity, frameIndex, frame})
        }
                        
       } 

    },
    mounted() { 
        
        this.startNewRecording()
        
        // Create processing
        createP5({
            w: 500,
            h: 300,
            el: this.$refs.timelineP5,
            draw :(p) => {
                p.fill(0)
                this.box.draw({p})
                
                this.drawTags({p, getTags:(frame) => frame.tags, y:0}) 
                
                // Draw the boxes for each channel
                this.channelBoxes.forEach(({ch,box}, chIndex) => {
                    if (this.channels[chIndex]) {
                        p.fill(chIndex*30, 100, 40, .3)
                        box.draw({p})
                        
                        let y = box.y 
                        
                        // Draw all the tags as colored blocks
                        
                        this.drawTags({p, getTags:(frame) => frame.data[chIndex].tags, y}) 

                        this.forAllDrawableFrames(({x, frameIndex, hasFrame, isCurrent, opacity}) => {
                            p.fill(0, 0, 100, opacity).noStroke()
                            
                            p.text(frameIndex, x, y + 20)
                        
                            p.stroke(0, 0, 100, opacity)
                            p.noFill()
                            p.rect(x, box.y, this.frameW, box.h)

                        })
                    }
                 })

           
            }, 
            setup : (p) => {
              this.p = p
            },

            
            keyPressed: (e, inCanvas) => {
               
                if (e.key === 's' && e.metaKey) {
                    e.preventDefault();
                    console.log("save")  
                    this.save() 
                }
            },
            

            mouseMoved: (mouse) => {
                
            },
            startDrag: (mouse) => {
                if (this.activeTool) {
                    let inChannel = this.channelBoxes.find((chBox) => chBox.box.contains(mouse))
                    if (inChannel) {
                    
                    
                    }
                } else {
                    this.drag = {
                        start: this.viewStart
                    }
                }

                
            },
            drag: (mouse) => {
             
                mouse.inChannel = this.channelBoxes.findIndex((chBox,index) => chBox.box.contains(mouse))
                if (this.drag) {
                    let dt = mouse.dragOffset.x/this.frameW
                    this.viewStart = this.drag.start - dt
                }
                if (this.activeTool) {

                    let frameIndex = Math.floor(this.xToFrame(mouse.x))
                    let frame = this.recording.frames[frameIndex]
                    if (frame) {
                        let tag = this.activeTool.label

                        let tagSet = mouse.inChannel>=0?frame.data[mouse.inChannel].tags:frame.tags 
                        // Add or remove this tag from the frame
                        mouse.shiftPressed?removeTag(tagSet, tag):addTag(tagSet, tag)
                    }
                    // mouse.inChannel.channel.
                }
            },

            stopDrag: () => {
                this.drag = undefined
            }

            
        
        })
    },

    computed: {
        frameRange() {
            return Array.from({length:this.viewCount}, (_,i) => i + this.viewStart)
        },

        frameCount() { return this.recording.frames.length },

        recording() { return this.recorder.activeRecording },

        frameW() { return this.box.w/this.viewCount },

        channelBoxes() {
            console.log("recalculate channel boxes")
            let boxes = this.channelBox.split({
                count:this.channels.length
            })
            return this.channels.map((ch,i) => {
                return {
                    ch,
                    box:boxes[i].offset(-4)
                }
            })
        }
    },
    

    data() {
        let w = 400
        let h = 300
        const topBorder = 40
        const bottomBorder = 40
        let box = new Box({w, h, x:0, y:0})
        
        let topBox = new Box({w:box.w, h:topBorder,y:0, x:0})
        let channelBox = new Box({w:box.w, h:box.h - (topBorder + bottomBorder),y:topBorder, x:0})
        let bottomBox = new Box({w:box.w, h:bottomBorder,y:box.h - bottomBorder, x:0})
        return {
            recorder: new Recorder(),
            playback: new Playback(),

            viewStart: 0,
            viewCount: 30,

            selectedFrame: undefined,
            currentFrame: 0,
            
            activeTool: undefined,
            tagPalette: {},

            box, channelBox, topBox, bottomBox,
            drag: undefined,
        };
    },

    props: {
      
            channels: {

            }
        
    }
   
})
