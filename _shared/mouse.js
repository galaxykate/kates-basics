class Mouse {
    constructor({getObjectFromElement}) {
        // What obejcts are we in, and with what offsets?
        this.held = null;
        this.offsetX = 0;
        this.offsetY = 0;
        this.over = null;
        this.dragEvent = undefined

        this.getObjectFromElement = getObjectFromElement

        document.addEventListener("mousemove", (e) => this.onMouseMove(e));
        document.addEventListener("mousedown", (e) => this.onMouseDown(e));
        document.addEventListener("mouseup", (e) => this.onMouseUp(e));
    }

    addObject(object, el) {
        // Know when we enter/exit/move within this object
    }

    get isDown() {
        return this.dragEvent = undefined
    }

    onMouseDown(e) {
        // Get all elements under the mouse
        const elementsUnderMouse = document.elementsFromPoint(e.clientX, e.clientY);
        
        // Filter for elements with class "draggable"
        const draggableElements = elementsUnderMouse.filter(el => el.classList.contains("draggable"));

        console.log("draggables", draggableElements)
        if (draggableElements.length > 0) {
            
            this.held = draggableElements.map(el => {
                // console.log(el)
                let obj = this.getObjectFromElement?.(el)
                let grip =  {
                    x:  e.clientX - el.offsetLeft,
                    y:  e.clientY - el.offsetTop,
                }
                let hold = {
                    
                        obj,
                        el,
                        grip
                    
                }
                
                return hold
            })

            this.held = this.held.slice(0, 1)
            this.held.forEach(hold => hold.obj.pickUp?.({hold}))
        
        }

        this.dragEvent = {
            steps: [{ x: e.clientX, y: e.clientY }],
            totalDistance: 0,
            start: Date.now(),
            get isDrag() {
                return this.totalDistance > 3;
            }
        };
      
    }

    getPositionIn(el) {
        return {
            mouse:this,
            el:el, 
            x: e.clientX - el.offsetLeft,
            y: e.clientX - el.offsetLeft,
        }

    }

    onMouseMove(e) {
        this.pos = {x:e.clientX, y:e.clientY}
        // Drag?
        // Most things are dragged relative to a parent, or to the screen
      
        this.held?.forEach((hold) => {
            // console.log(obj.id, offset.x, offset.y)

            // let x = e.clientX - grip.x
            // let y = e.clientY - grip.y
            // obj.position.setTo(x, y)
            hold.obj.drag({hold, pos:this.pos})
        })
       
    }

    onMouseUp(e) {
        console.log("DROP")
        this.pos = {x:e.clientX, y:e.clientY}
        this.held?.forEach((hold) => {
          
            hold.obj.drop({hold, pos:this.pos})
        })

        this.held = null
        
    }
}
