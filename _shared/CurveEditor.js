
Vue.component("curve-editor", {
    // Display some section of a curve, agnostically in P5

    // Can display many curves, 
    // Each curve has its databox, 
    // the view box is shared

    template: `<div>
        <div class="chip">{{p?.id}}</div>
        <div class="chip">{{schema.id}}</div>
        <div v-for="curve in curves">{{curve.points.length}} {{curve.dataBox.toFixed(0)}}</div>
        <div ref="p5" />	
        
    </div>`,

   
		mounted() {
		
			// Create processing
			createP5({
				
				w: this.w,
				h: this.h,
				el: this.$refs.p5,
				draw: (p) => {
                    p.background(50)
                    p.noStroke()
                    // this.sections.forEach(({start,end})=> {
                    //     p.fill(100, 100, 50, .4)
                    //     p.rect(start, 0, end-start, p.height)

                    //     let x = start
                    //     this.playbackPoint = getPointAtCurveByX({curvePoints:this.curve, x})
                      
                    //     // console.log(start, 0, end-start, p.height)
                    // }) 
                      // if (this.playbackPoint) {
                    //     p.stroke(320, 100, 50)
                    //     p.circle(this.playbackPoint.x, this.playbackPoint.y, 20)
                    //   }

                    p.strokeWeight(1)
                    // console.log(this.drawableCurves)
                    this.drawableCurves.forEach(({points,color}) => {
                        // console.log(color.toFixed(2), color)
                        p.noFill()
                        p.stroke(...color)
                        drawCurve({p,curvePoints:points, color})
                        drawHandles({p,curvePoints:points, color})
                    })
                    
                    // Select segment
                    p.noFill()
                    p.strokeWeight(2)
                    p.stroke(100, 100, 50)
                    if (this.selectedSegment) {
                       drawCurveSegment({p, ...this.selectedSegment})
                       if (this.selectedPoint) {
                         p.circle(this.selectedPoint.x, this.selectedPoint.y, 20)
                       }                    
                    }

                    p.mouse.drawDebug({p})
                    // p.mouse.hovered?.draw(p, 40)
				},
                

                mouseMove: (mouse) => {
                    // console.log("Curve", this.curve)
                    // console.log("Mouse move", getValueAtX({curvePoints: this.curve, x:mouse.x}))
                    // this.selectedSegment = getSegmentByX({curvePoints: this.curve, x:mouse.x})
                    // this.selectedPoint = getPointAtSegmentByX({...this.selectedSegment, x:mouse.x})
                },
                getTouchables: () => this.allHandles,
	

                startDrag: (mouse) => {
                   
                },

				drag: (mouse) =>  {
                   mouse.held.forEach(cp => cp.moveTo(mouse))
                   // Update the original points
				},
				mousePress(mouse) {

				},

				setup: (p2) => {
					this.p = p2
				}
			}).then((p) => {
				
			})

		},

    computed: {

      
        drawableCurves() {
            return this.viewCurves
        },
        allHandles() {
            return this.drawableCurves.map(curve => curve.points.map(pt => [pt, pt.cp0, pt.cp1]).flat()).flat()
        },

      
    },

    watch: {
        curves: {
            handler(newValue, oldValue) {
                console.log("New or changed curves")

                this.viewCurves = this.curves.map(({points, dataBox, color}) => {
                    let newPoints = points.map(pt => {
                        let pt2  = new CurvePoint(pt)
                        pt2.original = pt
                        return pt2
                    })
                    return {
                        color: new KVector(color.getColor({shade:.3})),
                        points:newPoints
                    }
                })
            //   console.log("Watch triggered:", newValue, oldValue);
            },
            immediate: true // Runs on first load

          }
    },


    methods: {
        getClosest(pt) {
            // return KVector.getClosest({ arr:this.viewPoints, pt, range:20 })              
        },
        setStartPoint(x) {
            let x0 = this.dataBox.x 
            this.dataBox.x = x
            this.$emit("timeScroll", {lastX:x0, x:x})
        },

        constrainViewBox() {
            
            let min = Math.min(...this.curve.map(pt => pt.y))
            let max = Math.max(...this.curve.map(pt => pt.y))
            this.dataBox.y = min
            this.dataBox.h = max - min
            // console.log("constrain", min, max, this.dataBox)
            
        }
    },
    props: {
        sections: {},
        w: {
            default: 400
        },
        h: {
            default: 90
        },
        xOverride:{},
        curves:{},
        schema:{}
    },

    data() {
        return {
            viewCurves: [],
            selectedSegment: undefined,
            selectedPoint: new KVector(0, 0),
            p:undefined,
            dataBox: new Box({x:0, y:50, w: 300, h: 100}),
            viewBox: new Box({x:0, y:0, w: this.w, h: this.h})
        }
    }
    
})
Vue.component("timeline-editor", {
    // Display some section of a curve, agnostically in P5
    template: `<div>
       <div>override={{xOverride}}, count:{{curves.length}}</div>
        <curve-editor v-for="curveSet in curves" 
            :w="w" :h="h" :curves="curveSet.curves" :schema="curveSet.schema"
            :xOverride="xOverride"
            @timeScroll="({x,lastX}) => scrollCurve(curve, x,lastX)"
            :sections="sections"
            /> 
    </div>`,

    mounted() {
    setInterval(() => {
        this.sections[0].start += 2
        this.sections[0].start = this.sections[0].start%400
        this.sections[0].end = this.sections[0].start + 40
    }, 50)   
    },
    methods:{
        
        scrollCurve(curve, x,lastX) {
            // console.log(x, lastX, curve)
            if (this.isXLinked)
            this.xOverride = x
        }
    },

  
   
    props: {
       
        w: {
            default: 400
        },
        h: {
            default: 90
        },
        
        curves: {
            default() {
                // Make one HSL [0-360, 100, 100] and one rgba(0-255, 0-1) and one numerical
               
                return schemaList.map(schema => {
                    // Make curves for this data
                    let curves = schema.dimensions.map(({range}, dimIndex) => {
                        let w = 300
                        let count = Math.floor(Math.random()*6 + 2)
                        let data = createNoiseData({range, count, offset:dimIndex + Math.random()*100})
                        let points = data.map((y,i) => new CurvePoint({x:w*i/(count-1), y}))
                       
                        return {
                            color: new KVector(Math.random()*360, 100, 50),
                            points, 
                            dataBox: new Box({x:0, w, y0:range[0], y1:range[1]})
                        }
                    })

                    return {
                        schema,
                        curves,
                    }


                })
                
            }
        }
    },
    data() {
        
        return { xOverride: undefined,isXLinked:true, sections: [{start:0,end:0}],}
    }
    
})
