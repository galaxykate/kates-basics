//https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle(array) {
    let currentIndex = array.length;
  
    // While there remain elements to shuffle...
    while (currentIndex != 0) {
  
      // Pick a remaining element...
      let randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  }

function overlap(a, b, match=(a,b)=>a===b) {
    
    // Get the things that are only a or b
    let onlyA=[]
    let both= []
    
    a.forEach(a0 => {
        let b0 = b.find(b0 => match(a0, b0))
        if (b0 !==undefined) 
            both.push([a0, b0]) 
        else
            onlyA.push(a0) 
    }) 
    let onlyB = b.filter(b0 => a.find(a0 => match(a0, b0)) !== undefined)
      
    return [onlyA, onlyB, both]
}
  

function floatArrayToBase64(arr) {
    let buffer = new Float32Array(arr).buffer;
    let binary = new Uint8Array(buffer);
    let binaryString = Array.from(binary).map(byte => String.fromCharCode(byte)).join('');
    return btoa(binaryString);
}


function base64ToFloatArray(str) {
    let binaryString = atob(str);
    let len = binaryString.length;
    let bytes = new Uint8Array(len);
    
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    
    return new Float32Array(bytes.buffer);
}



function arrayToFixed(arr, n) {
    if (Array.isArray(arr)) {
        return "[" + arr.map(item => arrayToFixed(item,n)).join(",") + "]"
    }

    
    if (typeof arr === "string") {
        return '"' + arr + '"'
    }
        
    return arr.toFixed?arr.toFixed(n):arr
   
}

function splitArrayIntoChunks(array, N) {
    return Array.from({ length: Math.ceil(array.length / N) }, (_, i) =>
        array.slice(i * N, (i + 1) * N)
    );
}

// LOCAL STORAGE STUFF
const APP_STORAGE_MIXIN = {	
	options: {},
	tuningValues: {},
	flags: {},


    setToDefaultSettings() {
        Object.keys(this.controls).forEach(setID => {
            // Go through each control and set us to the default
            Object.entries(this.controls[setID]).forEach(([key,val]) => {
                if (val.default !== undefined)
                    Vue.set(this[setID], key, val.default)
                else if (Array.isArray(val))
                    Vue.set(this[setID], key, val[0])
                else 
                    Vue.set(this[setID], key, val)
            })
            // this[setID] = 
        })
    },

	setFlag(key, val) {
		Vue.set(this.flags, key, val)
		this.saveSettings()
	},
	setTuningValue(key, val) {
		Vue.set(this.tuningValues, key, val)
		this.saveSettings()
	},
	saveSettings() {
        console.log("save settings")
		let json = JSON.stringify({
			flags:this.flags, options:this.options, tuningValues:this.tuningValues
		})
		localStorage.setItem(this.id + "_settings", json)
	},
	loadSettings() {
		let json = localStorage.getItem(this.id + "_settings")
		if (json) {
			let {tuningValues, flags, options} = JSON.parse(json)
			console.log("Loaded settings")
			console.log(tuningValues, flags, options)
			Object.assign(this.tuningValues, tuningValues)
			Object.assign(this.flags, flags)
			Object.assign(this.options, options)
		}
	},}

class AppTime {
    constructor() {
        let t = Date.now()
        this.start = t
        this.t = 0
        this.dt = 0
        this.frameCount = 0
        this.lastUpdate = t
        this.maxElapsed = .1
        this.paused = false
        this.rate = 1
        this.fps = 30
        this.frameTimes = []
    }

 

    update({t, dt}={}) {

        t = t ?? Date.now()
        dt = dt ?? (t - this.lastUpdate)
        // console.log(dt)
        this.fps = 1000/dt

        this.lastUpdate = t
       
        dt = Math.min(this.maxElapsed, dt)*this.rate
        if (!this.paused) {
            this.dt = dt
            this.t += this.dt 
            this.frameCount++
        }
    }
}

function createNoiseData({range, count=10, speed=1, offset}) {
    offset = offset??Math.random()*1000

    return Array.from({length:count}, (_, i) => {

        let v = .5 + .5*noise(speed*i, offset)
        return range[0] + v*(range[1] - range[0])
    })

}



class Box {
    constructor({x, y, z, x0, y0, z0, x1, y1, z1, w=100, h=100,d=100 }={}) {

        this.x0 = x ?? x0 ?? 0;
        this.y0 = y ?? y0 ?? 0;
        this.z0 = z ?? z0 ?? 0;

        // You need an x1 or w
        this.x1 = x1 ?? this.x0 + w ?? 100;
        this.y1 = y1 ?? this.y0 + h ?? 100;
        this.z1 = z1 ?? this.z0 + d ?? 100;
      
        
        if (isNaN(this.x0) || isNaN(this.y0) || isNaN(this.x1) || isNaN(this.y1))
            throw new Error("Invalid box definition");
        
    }

    offset(m) {
        this.x0 -= m
        this.y0 -= m
        this.x1 += m
        this.y1 += m
        return this
    }

    split({ splits0 = [], splits1 = [], horizontal = false }) {
        // Determine which properties to use based on the split direction
        let [d0, d1, v0, v1] = horizontal ? ["w", "h", "x", "y"] : ["h", "w", "y", "x"];
        let v = this[v0]; // Start position
        let boxes = [];
    
        // Sum of initial splits
        let totalSplit0 = splits0.reduce((sum, d) => sum + d, 0);
        let totalSplit1 = splits1.reduce((sum, d) => sum + d, 0);
    
        // Calculate the remaining space before splits1
        let remaining = this[d0] - (totalSplit0 + totalSplit1);
        
        // If the splits exceed the total box size, throw an error
        if (remaining < 0) {
            throw new Error("Invalid split: The sum of splits0 and splits1 exceeds the box size.");
        }
    
        // Process the first set of splits
        splits0.forEach(d => {
            boxes.push(new Box({
                [v0]: v,
                [v1]: this[v1],
                [d0]: d,
                [d1]: this[d1]
            }));
            v += d; // Move the position forward
        });
    
        // Add the remaining space as a box if there's any left
        if (remaining > 0) {
            boxes.push(new Box({
                [v0]: v,
                [v1]: this[v1],
                [d0]: remaining,
                [d1]: this[d1]
            }));
            v += remaining;
        }
    
        // Process the second set of splits
        splits1.forEach(d => {
            boxes.push(new Box({
                [v0]: v,
                [v1]: this[v1],
                [d0]: d,
                [d1]: this[d1]
            }));
            v += d;
        });
    
        return boxes;
    }
    

    splitEvenly({ sections = 2, horizontal = false }) {
        if (sections < 1) {
            throw new Error("Sections must be at least 1.");
        }
    
        // Determine dimension properties based on the split direction
        let [d0, d1, v0, v1] = horizontal ? ["w", "h", "x", "y"] : ["h", "w", "y", "x"];
    
        // Calculate the size of each section
        let sectionSize = this[d0] / sections;
        
        // Ensure the division does not create negative or zero-sized sections
        if (sectionSize <= 0) {
            throw new Error("Invalid split: Box size too small for the requested number of sections.");
        }
    
        let v = this[v0]; // Start position
        let boxes = [];
    
        for (let i = 0; i < sections; i++) {
            boxes.push(new Box({
                [v0]: v,
                [v1]: this[v1],
                [d0]: sectionSize,
                [d1]: this[d1]
            }));
            v += sectionSize; // Move to the next section
        }
    
        return boxes;
    }

    draw({p, border=0}) {
        p.rect(this.x0 - border, this.y0 - border, this.w + border*2, this.h + border*2)
    }

    set w(v) {
        this.x1 = this.x0 + v
    }
    set h(v) {
        this.y1 = this.y0 + v
    }

    set x(v) {
        this.x1 = v + this.w
        this.x0 = v
        
    }


    set y(v) {

        this.y1 = v + this.h
        this.y0 = v
    }

    get w() {
        return this.x1 - this.x0
    }
    get h() {
        return this.y1 - this.y0
    }
    get d() {
        return this.z1 - this.z0
    }
    get x() {
        return this.x0
    }
    get y() {
        return this.y0
    }

    get z() {
        return this.z0
    }
    

    get xMin() {
        return Math.min(this.x0, this.x1);
    }

    get xMax() {
        return Math.max(this.x0, this.x1);
    }

    get yMin() {
        return Math.min(this.y0, this.y1);
    }

    get yMax() {
        return Math.max(this.y0, this.y1);
    }
     get zMin() {
        return Math.min(this.z0, this.z1);
    }

    get zMax() {
        return Math.max(this.z0, this.z1);
    }

    get xRange() {
        return this.xMax -  this.xMin
    }

    get yRange() {
        return this.yMax -  this.yMin
    }

    get zRange() {
        return this.zMax -  this.zMin
    }

    toBoxSpaceFromNormalized(v, v0) {
        v0 = v0 ?? new v.prototype.constructor()
        v0.x = this.x + this.width*v.x
    }

    getPct(pt) {
        const [x, y] = Array.isArray(pt) ? pt : (pt?.x !== undefined && pt?.y !== undefined ? [pt.x, pt.y] : (() => { throw new Error("Unknown pt type " + typeof(pt)); })());
        return [(x - this.xMin)/(this.xRange), (y - this.yMin)/(this.yRange)]
    }

    getPositionByPct(pctX, pctY) {
        let x = pctX*this.xRange + this.xMin
        let y = pctY*this.yRange + this.yMin
        return [x,y]
    }

   


    contains(pt) {
        const [x, y] = Array.isArray(pt) ? pt : (pt?.x !== undefined && pt?.y !== undefined ? [pt.x, pt.y] : (() => { throw new Error("Unknown pt type " + typeof(pt)); })());
        // Use getters to ensure correct bounds

        let contains = x >= this.xMin && x <= this.xMax && y >= this.yMin && y <= this.yMax;
        return contains
    }

    constrain(pt) {
        if (Array.isArray(pt)) {
            pt[0] = Math.min(Math.max(pt[0], this.xMin), this.xMax);
            pt[1] = Math.min(Math.max(pt[1], this.yMin), this.yMax);
        } else if (pt?.x !== undefined && pt?.y !== undefined) {
            pt.x = Math.min(Math.max(pt.x, this.xMin), this.xMax);
            pt.y = Math.min(Math.max(pt.y, this.yMin), this.yMax);
        } else {
            throw new Error("Invalid point type " + typeof(pt));
        }
    }

    remap({pt, originalBox = [0, 0, 1, 1]}) {
        const extractBounds = (box) => Array.isArray(box) ? box : [box.x0, box.y0, box.x1, box.y1];
        const [oX0, oY0, oX1, oY1] = extractBounds(originalBox);
        const [tX0, tY0, tX1, tY1] = extractBounds(this);
        const [x, y] = Array.isArray(pt) ? pt : (pt?.x !== undefined && pt?.y !== undefined ? [pt.x, pt.y] : (() => { throw new Error("Unknown pt type " + typeof(pt)); })());
        
        let newX = ((x - oX0) / (oX1 - oX0)) * (tX1 - tX0) + tX0;
        let newY = ((y - oY0) / (oY1 - oY0)) * (tY1 - tY0) + tY0;
        return [newX, newY];
    }

    toFixed(n=2) {
        return `[${this.x.toFixed(n)}-${this.x1.toFixed(n)}] [${this.y.toFixed(n)}-${this.y1.toFixed(n)}] ${this.w.toFixed(n)}x${this.h.toFixed(n)} `
    }
}


function forEachInObj({obj, fxn, path=[], parent, key}) {
    if (!isNaN(obj)) {
        fxn({
            val:obj, 
            path,
            parent,
            key,
        })
    }
    else if (Array.isArray(obj))
        obj.forEach((val,index) => forEachInObj({
            fxn, 
            obj:val, 
            path:path.concat([index]),
            parent: obj,
            key: index
        }))
    else if (typeof obj === "object")
        Object.entries(obj).forEach(([key,val]) => forEachInObj({
            fxn, 
            obj:val, 
            path:path.concat([key]),
            parent: obj,
            key: key
        }))
    else {
        // console.log(path,typeof obj)
    }
}


// =============================
// Handling tag sets
// Store them as data

function addTag(tagSet, tag) {
    if (!tagSet.includes(tag))
        tagSet.push(tag)
    tagSet.sort()
    return tagSet
}

function removeTag(tagSet, tag) {
    let index = tagSet.indexOf(tag);
    if (index !== -1) {
        tagSet.splice(index, 1); // Remove the element at the found index
    }
    return tagSet
}


function toCamelCase(str) {
    return str
        .replace(/[-_ ]+([a-zA-Z0-9])/g, (_, char) => char.toUpperCase()) // Convert after -, _, or space
        .replace(/^[A-Z]/, match => match.toLowerCase()); // Ensure first letter is lowercase
}


function getAtPath(obj, path) {
    path.forEach(key => {
        let uidObj = obj.getObjectByUID?.(key)
        obj = uidObj === undefined?obj[key]:uidObj
    })
    return obj
}


function setAtPath(obj, path, val) {
    let lastKey = path[path.length - 1]
    let subPath = path.slice(0, path.length - 1)
    let lastObj = getAtPath(obj, subPath)
    lastObj[lastKey] = val
}

/**
 * Doing mouse interactions on various objects, where we care about XY positions 

 * 
 * 
 */

class OrbitalCamera extends THREE.Object3D {
    constructor({w, h, radius, phi, theta, renderer}) {
        super();
        this.r = radius;
        this.phi = phi;
        this.theta = theta;
        this.renderer = renderer;
        
        this.camera = new THREE.PerspectiveCamera(75, w/h, 0.1, 1000);
        
        // Attach the camera to this Object3D (itself a scene object)
        this.position.set(0, 0, 0);
        this.camera.position.set(0, 0, radius);
        this.add(this.camera);
        
        this.isDragging = false;
        this.previousMouseX = 0;
        this.previousMouseY = 0;

        this.renderer.domElement.addEventListener("mousedown", this.onMouseDown.bind(this));
        document.addEventListener("mouseup", this.onMouseUp.bind(this));
        document.addEventListener("mousemove", this.onMouseMove.bind(this));

        this.updateCameraPosition()
    }
    
    updateCameraPosition() {
        // Apply rotation to the parent object
       this.rotation.z = this.theta;
        this.rotation.x = this.phi;
        this.rotation.order = "ZXY";
        
        
        // this.rotation.eulerOrder = "XYZ"
        // Move the camera along the orbital radius
        this.camera.position.set(0, 0, this.r);
        this.updateMatrixWorld(true);
    }

    set({theta, phi,radius}) {
        this.r = radius??this.r
        this.theta = theta??this.theta
        this.phi = phi??this.phi
        this.updateCameraPosition()
        return this
    }

    offset({theta=0, phi=0,radius=0}) {
        this.r += radius
        this.theta += theta
        this.phi += phi
        this.updateCameraPosition()
         return this
    }
    onMouseDown(event) {
        if (event.target !== this.renderer.domElement) return;
        this.isDragging = true;
        this.previousMouseX = event.clientX;
        this.previousMouseY = event.clientY;
    }
    
    onMouseUp() {
        this.isDragging = false;
    }
    
    onMouseMove(event) {
        if (!this.isDragging) return;
        
        let deltaX = event.clientX - this.previousMouseX;
        let deltaY = event.clientY - this.previousMouseY;
        
        this.theta -= deltaX * 0.01;
        this.phi -= deltaY * 0.01;
        
        this.phi = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, this.phi));
        
        this.previousMouseX = event.clientX;
        this.previousMouseY = event.clientY;
        
        this.updateCameraPosition();
    }

   
}

function createTHREE({w=200,h=200, el, update, setup, addTestGeo, addLights=true}) {
    // Create a scene
    const scene = new THREE.Scene();

    // Create a renderer and add it to the document
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(w, h);
    el.appendChild(renderer.domElement);

    if (addTestGeo) {
        // Add a box geometry and a basic material
        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshStandardMaterial({ color: 0x0077ff });
    
        for (var i = 0; i < 100; i++) {
            let r = 20
            let cube = new THREE.Mesh(geometry, material);
            cube.position.set(Math.random()*r*2 - r, Math.random()*r*2 - r, Math.random()*r)
            scene.add(cube);
        }

        let cube = new THREE.Mesh(geometry, material);
        cube.scale.set(100, 100, 1)
        scene.add(cube);
    }

    /**
     * LIGHTS
     */

    if (addLights) {
        // Add a basic ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 2); // soft white light
        scene.add(ambientLight);

        // Add a point light
        const pointLight = new THREE.PointLight(0xffffff, 1, 100);
        pointLight.position.set(10, 10, 10);
        scene.add(pointLight);
    }

    const camera = new OrbitalCamera({w, h, radius:100, phi:.9, theta:2.4, renderer})


    // Animation loop
    function animate() {
        update({renderer, camera, scene})
        // console.log(app.time.t)
        requestAnimationFrame(animate);
      
        camera.updateMatrixWorld(true);
        camera.camera.updateMatrixWorld(true);
        renderer.render(scene, camera.camera);

    }

    animate();
    setup?.({scene, camera, renderer})
    return {scene, camera, renderer}
}

function createP5Capture({p}) {
    /**
     * Creating the P5 capture can be a bit async
     * so wrap it in a promise
     **/

    // start creating the capture

    let capture = p.createCapture(p.VIDEO)
    console.log(capture)

    capture.hide()
    console.log("Create capture!", capture.width, capture.height)

    return new Promise((resolve, reject) => {
        let count = 0
        let maxCount = 250
        const intervalId = setInterval(() => {
            if (capture.elt.width > 0) 
                resolve(capture)
            else if (count >= maxCount) {
                clearInterval(intervalId);
                reject("Capture timeout!")
            }
            count++;
        }, 40)
    })

    // We have to wait until P5 has started the capture,
    // - but it doesn't give us a callback, so we're doing it the bad way by waiting
    let count = 0;
    const maxCount = 100;
    const interval = 50;
    const intervalId = setInterval(() => {

      if (this.capture.elt.width > 0) {
      // WE HAVE A CAPTURE
      // If the condition is met, stop the loop

        clearInterval(intervalId);
        console.log("Condition met, stopping loop.");

      // Set our video source
        this.video = this.capture

      // NOW start tracking
        this.initTracking();
      }

      else if (count >= maxCount) {
      // If 100 iterations have occurred without meeting the condition, stop the loop
        clearInterval(intervalId);
        console.warn("No capture created");
      }

      count++;
    }, interval);
}

let p5Count = 0;

function createP5({
    w = 200,
    h = 200,
    el,
    colorMode = "HSL",
    draw,
    setup,
    getTouchables,
    getDistance,
    isSelectable,
    isHoldable,
    isHoverable,
    keyRelease,
    keyPress,
    click,
    dblClick,
    mouseMove,
    mousePress,
    mouseRelease,
    longPress,
    getClosest,
    startDrag, 

    stopDrag,
    drag,
    
}) {
    return new Promise((resolve, reject) => {
        new p5(p => {
            p.id = "P5_" + p5Count++;

            p.mouse = {
                p,
                t:0,
                touchRange: 30,
                isDown: false,
                dragEvent:undefined,
      
                last: { x: 0, y: 0 },
                x: 0,
                y: 0,

                hovered: [],
                selected: [],
                held: [],

                get shiftPressed() {
                    return p.keyIsDown(p.SHIFT);
                },
                get metaPressed() {
                    return p.keyIsDown(p.CONTROL);
                },
                get altPressed() {
                    return p.keyIsDown(p.ALT);
                },
               
                deselectAll() {
                    this.selected = [];
                },
                dropAll() {
                    this.held = [];
                },
                hold(obj) {
                    this.held = [obj];
                },
                addHold(obj) {
                    this.held.push(obj);
                },
                select(obj) {
                    this.selected = [obj];
                },
                addSelect(obj) {
                    this.selected.push(obj);
                },
                isHovered(obj) {
                    return this.hovered.includes(obj);
                },
                isSelected(obj) {
                    return this.selected.includes(obj);
                },
                isHeld(obj) {
                    return this.held.includes(obj);
                },
                getDistance(obj0, obj1) {
                    // Base case if no custom "getDistance" is provided
                    if (typeof getDistance === "function") return getDistance(obj0, obj1);
                    let d = Math.sqrt((obj0.x - obj1.x) ** 2 + (obj0.y - obj1.y) ** 2);
                    if (obj0.radius) d -= obj0.radius;
                    if (obj1.radius) d -= obj1.radius;
                    return d;
                },


                get t() {
                    return p.millis()
                },

                get hovered() {
                    return this.touchables.filter(({d, pct}) => pct > 0)
                },

                get touchables() {
                    return typeof getTouchables === "function"
                        ? getTouchables()
                              .map(obj => {
                                  let d = this.getDistance(obj, p.mouse);
                                  let pct = (this.touchRange - d) / this.touchRange;
                                  return { d, pct, obj };
                              })
                              .sort((a, b) => a.d - b.d)
                        : [];
                },
                get hoverables() {
                    return this.touchables.filter(typeof isHoverable === "function" ? isHoverable : () => true);
                },
                get selectables() {
                    return this.touchables.filter(typeof isSelectable === "function" ? isSelectable : () => true);
                },

                get closestTouchable() {
                    
                    return this.hovered[0]
                },

                // Pickup what's here
                pickUp() {
                    // What's the closest object I can pick up?
                    if (this.closestTouchable) {
                        this.held = [this.closestTouchable.obj]
                        this.held.forEach(obj => obj.pickup?.(this))
                    }
                },


             

                startDragEvent() {
                  
                    let mouse = this
                    this.dragEvent = { 
                        start: Date.now(),
                        log: [],
                        stop: undefined,
                        totalDist:0,
                        isActivated: false,
                        get timeDown() {
                            return  Date.now() - this.start
                        },
                        update: () => {
                            let ev = this.dragEvent
                            // Start the drag, now that its moved
                            if (!ev.isActivated && ev.totalDist > 5) {
                                // console.log("Activate drag")
                                if (typeof startDrag === "function") startDrag(p.mouse);
                                ev.isActivated = true
                            }
                            ev.log.push({
                                x:mouse.x, y:mouse.y, t:mouse.t,
                                d: this.totalDist
                            })
                            ev.totalDist += this.lastMoveDistance;
                            // Do the drag behavior
                            if (typeof drag === "function") drag(p.mouse);
                            // Also drag any individual objects
                            this.held.forEach(obj => {
                                // console.log("Drag", obj)
                                obj.dragTo?.(mouse)
                            })
                        }
                    }
                },

                get dragStart() {
                    return this.dragEvent?this.dragEvent.log[0]: undefined
                },

                get dragOffset() {
                    return this.dragEvent?
                         {x:this.x - this.dragStart.x, y:this.y - this.dragStart.y}
                         :undefined
                },

         
                get lastMoveDistance() {
                    return Math.sqrt(this.lastOffset.x**2 + this.lastOffset.y**2)
                },

                get lastOffset() {
                    return {
                        x: this.x - this.last.x,
                        y: this.y - this.last.y
                    };
                },
                get isInCanvas() {
                    return this.x >= 0 && this.y >= 0 && this.x <= p.width && this.y <= p.height;
                },

                get belongsToCanvas() {
                    return this.isInCanvas || this.dragEvent
                },

                drawDebug({ p }) {
                    p.noFill()
                    p.strokeWeight(1)
                    p.stroke(0, 0, 0, .1)
                    p.circle(this.x, this.y, 30)
                   
                    this.touchables.forEach(({ obj }) => {
                        p.stroke(0, 0, 0, .2);
                        p.noFill();
                        obj.draw({ p, radius: 20 });
                    });
                    this.hovered.forEach(({ obj, d, pct }) => {
                        p.stroke(0);
                        p.fill(100, 100, 50, 0.2);
                        obj.draw({ p, radius: 50 * Math.sin(pct * Math.PI / 2) });
                    });

                    this.held.forEach((obj) => {
                        p.stroke(0);
                        p.fill(100, 100, 50, 1);
                        obj.draw({ p, radius:20});
                    });


                    p.fill(100, 100, 50, 0.8);
                    this.hovered[0]?.obj.draw({p, radius: 10})
                },
                updatePosition() {
                    this.last = { x: this.x, y: this.y };
                    this.x = p.mouseX;
                    this.y = p.mouseY;
                }
            };

            // Overwriting methods while preserving 'this'
            Object.assign(p, {
                setup() {
                    p.createCanvas(w, h);
                    p.colorMode(p[colorMode]);
                    if (typeof setup === "function") setup(p);
                    resolve(p);
                },
                draw() {
                    if (typeof draw === "function") draw(p);
       
                },
                keyReleased(key) {
                    if (typeof keyRelease === "function") keyRelease(key, p.mouse.isInCanvas);
                },
                keyPressed(key) {
                    if (typeof keyPress === "function") keyPress(key, p.mouse.isInCanvas);
                },

                // Mouse movement is only listened to if it's in the canvas
                // UNLESS there's an active dragging happeing
                mouseMoved() {
                    p.mouse.updatePosition();
                    if (p.mouse.isInCanvas && typeof mouseMove === "function") mouseMove(p.mouse);
                },
               
                doubleClicked() {
                    if (p.mouse.isInCanvas && typeof dblClick === "function") dblClick(p.mouse);
                },
                mousePressed() {
                    if (p.mouse.isInCanvas) {
                        // We don't know if we are picking up or starting to drag
                        p.mouse.pickUp()
                        p.mouse.startDragEvent()
                    }
                    p.mouse.isDown = true;
                },
                mouseDragged() {
                    p.mouse.updatePosition();
                    if (this.mouse.belongsToCanvas) {
                        p.mouse.dragEvent?.update()
                    } 
                },

                mouseReleased() {
                    // What are we releasing on?
                    // A drag event?
                    if (this.mouse.belongsToCanvas) {
                        
                         // Are we dropping or clicking?
                        p.mouse.held.forEach(obj => {
                            if (p.mouse.dragEvent.isActivated)
                                obj.drop?.(this)
                            else
                                obj.click?.(this)
                        })
                            
                        this.held = []     
                        
                        // We've been dragging
                        if (p.mouse.dragEvent.isActivated)   {
                            console.log("Drag")
                            stopDrag?.(p.mouse)
                        }
                        // We've been down for a while, but not moved
                        else if (p.mouse.dragEvent.timeDown > 200) {
                            console.log("Long press")
                            longPress?.(p.mouse)
                        }
                        // We've neither moved nor been down long
                        else {
                            console.log("Click")
                            click?.(p.mouse)
                        }
                          

                        p.mouse.dragEvent = undefined
                    }
                    p.mouse.isDown = false;
                    
                }
            });
        }, el);
    });
}


// FROM GPT
function hexToHSL(hex) {
    // Remove the hash at the start if it's there
    hex = hex.replace(/^#/, '');

    // Parse r, g, b values
    let r = parseInt(hex.substring(0, 2), 16) / 255;
    let g = parseInt(hex.substring(2, 4), 16) / 255;
    let b = parseInt(hex.substring(4, 6), 16) / 255;

    // Find the maximum and minimum values of r, g, b
    let max = Math.max(r, g, b);
    let min = Math.min(r, g, b);
    let h, s, l;

    // Calculate lightness
    l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatic
    } else {
        let d = max - min;

        // Calculate saturation
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        // Calculate hue
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }

        h *= 60;
    }

    // Convert to percentages
    s = s * 100;
    l = l * 100;

    return [Math.round(h), Math.round(s), Math.round(l)];
}


function makePixelsOutsideCircleTransparent(img, cx, cy, radius) {
    // console.log(img.width, img.height);
    // Load the pixels array of the image
    img.loadPixels();

   
    // Loop through all pixels
    for (let i = 0; i < img.width; i++) {
        for (let j = 0; j < img.height; j++) {
            let x = i
            let y = j
            // Calculate distance from the center of the circle
            let dx = x - cx;
            let dy = y - cy;
            let d = Math.sqrt(dx * dx + dy * dy);
            let index = (x + y * img.width) * 4; // Get the pixel index
            
            // If the distance is greater than the radius, set alpha to 0 (transparent)
            if (d > radius) {
                img.pixels[index + 3] = 0; // Set alpha value to 0 (transparent)
            }
           
        }
    }

    // Update the image with the modified pixels
    img.updatePixels();
}

// function circleCutout(p) {
//     clippingMask.loadPixels()

//         let w = clippingMask.width
//         let h = clippingMask.width
//         for (var i = 0; i < clippingMask.width; i++) {
//         for (var j = 0; j < clippingMask.height; j++) {
//           let dx = i/clippingMask.width

//         }
//         }
//     clippingMask.updatePixels()
// }

// function transparentSlice(p, source, x, y, scale) {
//     // Take a slice of this image at a location
//     p.push()
//     p.translate(p.width, 0)
//     p.scale(-1, 1)

//     // Draw the source image offset
//     p.scale(scale, scale)
//     p.translate(-x, -y)
//     p.image(source, 0, 0)
//     p.pop()
// }

// Useful fxns
function remap(v, v0, v1, nv0, nv1) {
    let pct = (v - v0)/(v1 - v0)
    return pct*(nv1 - nv0) + nv0
}


let noise = (() => {
    let noiseFxn = new SimplexNoise(0)
    return function noiseAny() {
        if ( arguments.length == 1)
            return noiseFxn.noise2D(arguments[0],0)
        if ( arguments.length == 2)
            return noiseFxn.noise2D(arguments[0],arguments[1])
        if ( arguments.length == 3)
            return noiseFxn.noise3D(arguments[0],arguments[1],arguments[2])
        if ( arguments.length == 4)
            return noiseFxn.noise4D(arguments[0],arguments[1],arguments[2], arguments[3])
        return 0
    }
})()

function randInt(min, max) {
  if (max === undefined) {
    max = min;
    min = 0;
}
return Math.floor(Math.random() * (max - min + 1)) + min;
}

function lerp(c0, c1, pct) {
    return c0 + pct*(c1 - c0)
}
function constrain(x, min, max) {
    return Math.min(max, Math.max(x, min))
}

function lerpColors(c0, c1, pct) {
    if (!c0)
        console.warn("Not a color", c0)
    if (!c1)
        console.warn("Not a color", c1)
    return [lerp(c0[0], c1[0], pct),
        lerp(c0[1], c1[1], pct),
        lerp(c0[2], c1[2], pct)]
}

// https://stackoverflow.com/questions/105034/how-do-i-create-a-guid-uuid
function uuidv4() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
    (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
  );
}

function colorStyle([h,s,l], brighten=0) {
    return {
        borderRadius: "10px",
        backgroundColor: hslToCSS([h, s, l - 10 + brighten*20]),
        color: hslToCSS([h, s, l+ 30 + brighten*20]),
    }
}

function hslToCSS(c, alpha=1) {
    return `hsla(${(c[0]).toFixed(2)}, ${(c[1]).toFixed(2)}%, ${(c[2]).toFixed(2)}%, ${alpha})`
}

function objToInlineStyle(styleObj) {
  // FROM GPT
    // Define a mapping of style properties that should use HSL notation
    const hslProperties = ['background-color', 'color', 'border-color'];

    // Initialize the inline style string
    let inlineStyle = '';

    // Loop through the properties in the style object
    for (const property in styleObj) {
        if (styleObj.hasOwnProperty(property)) {
            const value = styleObj[property];

            // Check if the property should use HSL notation
            if (hslProperties.includes(property)) {
                if (Array.isArray(value) && value.length === 3) {
                    // Convert the array to an HSL color string
                    const hslColor = `hsl(${value[0]}, ${value[1]}%, ${value[2]}%)`;
                    inlineStyle += `${property}: ${hslColor}; `;
                }
            } else {
                // Use pixel units for other properties
                inlineStyle += `${property}: ${value}px; `;
            }
        }
    }

    return inlineStyle;
}


function map(x, y0, y1, z0, z1) {
    let pct = (x - y0)/(y1 - y0) 
    return pct*(z1-z0) + z0
}


// https://stackoverflow.com/questions/19721439/download-json-object-as-a-file-from-browser
const saveTemplateAsFile = (filename, dataObjToWrite) => {
  const blob = new Blob([JSON.stringify(dataObjToWrite)], {
    type: "text/json",
});
  const link = document.createElement("a");

  link.download = filename;
  link.href = window.URL.createObjectURL(blob);
  link.dataset.downloadurl = ["text/json", link.download, link.href].join(":");

  const evt = new MouseEvent("click", {
    view: window,
    bubbles: true,
    cancelable: true,
});

  link.dispatchEvent(evt);
  link.remove();
};

function oneHotFromLabels(label, labels) {
  let index = labels.indexOf(label);
  if (index < 0) console.warn(`No label '${label}' found in labels: ${labels}`);
  let arr = new Array(labels.length).fill(0);
  arr[index] = 1;
  return arr;
}

function oneHot(count, index) {
  let arr = new Array(count).fill(0);
  arr[index] = 1;
  return arr;
}

function indexOfMax(arr) {
  if (arr.length === 0) {
    return -1;
}

var max = arr[0];
var maxIndex = 0;

for (var i = 1; i < arr.length; i++) {
    if (arr[i] > max) {
      maxIndex = i;
      max = arr[i];
  }
}

return maxIndex;
}

function predictionToClassification(labels, rawPrediction) {
  // Make the ML5 prediction into something more useable
  let classification = {
    scoresByLabel: {},
    sorted: [],
};

rawPrediction.forEach((option, index) => {
    let label = labels[index];
    classification.scoresByLabel[label] = option.value;
    classification.sorted.push({
      label,
      score: option.value,
  });
});
classification.sorted.sort((a, b) => b.score - a.score);
classification.winner = classification.sorted[0]
return classification
}

function getRandom(arr) {
    return arr[Math.floor(arr.length*Math.random())]
}

function mapObject(obj, fxn) {

    let obj2 = {}
    for (var key in obj) {
        obj2[key] = fxn(obj[key], key)
    }
    return obj2
}


// for (var i = 0; i < 3; i++) {
//  let s = `${getRandom(testGrammar.greeting)}, ${getRandom(testGrammar.color)} ${getRandom(testGrammar.animal)}!`
//  if (i == 0)
//      s = "hello, white cat"

//  console.log(s)
//  console.log(detectGrammarMatch(testGrammar, `#color# #animal#`, s))
//  console.log(detectGrammarMatch(testGrammar, `#greeting#.*#animal#`, s))
// }

function detectGrammarMatch(grammar, rule, s) {

    let rx = ruleToRegex(rule, grammar)
    let match = s.match(new RegExp(rx, "i"));
    return match
}

function ruleToRegex(rule, grammar) {
    
    let sections = rule.split("#")
    return sections.map((s,sindex) => {
        if (sindex %2 == 0) {
            // Plaintext
            return s
        } else {
             let rules = grammar[s]
             return `(${rules.join('|')})`
        }
    }).join("")
}


let words = {
    getRandom: getRandom,

    handEmoji: ("🤲 👐 🙌 👏 🤝 👍 👎 👊 ✊ 🤛 🤜 🤞 ✌️ 🤟 🤘 👌 🤏 👈 👉 👆 👇 ☝️ ✋ 🤚 🖐 🖖 🤙 💪 🖕 ✍️ 🙏 💅 🤝 🤗 🙋‍♀️ 🙆‍♂️ 🤦‍♂️").split(" "),
    emoji: ("😎 🤓 😍 😀 😭 😡 😳 😱 😈 😺 👎 👍 🎃 🤖 👻 ☠️ 👽 👾 🤠 ✍️ 👀 🧠 👩‍🚀 🧝‍♀️ 🦹‍♂️ 🧙‍♀️ 👸 👩‍💻 🕵️‍♀️ 🧶 🧵 👗 🥼 👕 👘 👖 👠 👞 🧤 🧦 🧢 🎩 👑 💍 👓 🕶 🥽 🐶 🐱 🐭 🐰 🦊 🐻 🐼 🐨 🐯 🦁 🐮 🐷 🐸 🐵 🐣 🦆 🦅 🦉 🦇 🐗 🐴 🦄 🐝 🐛 🦋 🐌 🐞 🐜 🦟 🐢 🐍 🕷 🦂 🐍 🦎 🦖 🐙 🦑 🦞 🦀 🐋 🦈 🐟 🐬 🐡 🐊 🐅 🐆 🦓 🦍 🐘 🦛 🦏 🐪 🐫 🦒 🦘 🐃 🐂 🐄 🐎 🐖 🐏 🐑 🦙 🐐 🦌 🐕 🐩 🐈 🐓 🦃 🦚 🦜 🦢 🐇 🦝 🦡 🐁 🐀 🐿 🦔 🐾 🐉 🌵 🎄 🌲 🌳 🌴 🌱 🌿 ☘️ 🍃 🍂 🍁 🍄 🐚 🌾 🌷 🥀 🌺 🌹 🌸 🌼 🌻 🌞 🌛 ⭐️ 💫 🌟 ✨ ⚡️ ☄️ 💥 🔥 🌪 🌈 ☀️ ☁️ 🌧 🌩 ❄️ ☃️ 💨 💧 💦 ☂️").split(" "),

    syllables: {
        first: "M N K R L P S T B P T T T N M M M B C D F G Ph J K L M N P Qu R S T V W X Y Z St Fl Bl Pr Kr Ll Chr Sk Br Sth Ch Dhr Dr Sl Sc Sh Thl Thr Pl Fr Phr Phl Wh".split(" ").map(s => s.toLowerCase()),
        middle: "an un in ikl op up an on een a e ie as att it ot out ill all ar ir er od ed ack ock ax ox off is it in im am om all aff en em aw an ad in an on ion ill oop ack ist all ar art air aean eun eun euh esqu aphn arl ifn ast ign agn af av ant app ab er en eor eon ent enth iar ein irt ian ion iont ill il ipp in is it ik ob ov orb oon ion uk uf un ull urk".split(" "),
        composites: "estr antr okl ackl".split(" "),
        last: "ant ent art ert e a i ie ei a a ae ea e e ea a ae ea e e ea a ae ea e e e y yay oy y a ia ea u y as en am us is art on in ath oll an o ang ing io i el ios ius ae ie ee i".split(" "),
        lastVerb: "ade ay ate ify ize ant ise y aze ise int ard ord ip".split(" "),
    },
    
    wordSets: ["occupation", "flavor", "musicGenre", "instrument", "colors", "material", "adventures","firstNames", "lastNames", "object", "objAdj", "actions", "adj", "places", "stuff", "animals", "moods"],
    instrument: ["ukulele", "vocals", "guitar", "clarinet", "piano", "harmonica", "sitar", "tabla", "harp", "dulcimer", "violin", "accordion", "concertina", "fiddle", "tamborine", "bagpipe", "harpsichord", "euphonium"],
    musicGenre: ["metal", "electofunk", "jazz", "salsa", "klezmer", "zydeco", "blues", "mariachi", "flamenco", "pop", "rap", "soul", "gospel", "buegrass", "swing", "folk"],
    occupation: ["professor", "inventor", "spy", "chef", "hacker", "artist", "sculptor", "insurance salesman", "fashion designer", "web developer", "game programmer", "lumberjack", "firefighter", "scientist", "spy", "wizard", "radio broadcaster", "smuggler", "mechanic", "astronaut", "adventurer", "pirate", "cowboy", "vampire", "detective", "soldier", "marine", "doctor", "ninja", "waitress", "burlesque dancer", "ballerina", "opera singer", "gogo dancer", "rollerskater"],
    flavor : ["special", "dark", "light", "bitter", "burnt", "savory", "flavorful", "aromatic", "fermented", "herbal", "pleasant", "harsh", "smoky", "sweet", "fresh", "refreshing", "somber", "bright", "perky", "sullen", "acidic", "sour", "peaty", "juicy", "perfumed", "buttery", "lush", "brisk", "strong", "weak", "tart", "tangy", "bold", "overpowering", "light", "faint", "subtle", "bright", "zesty", "austere", "round", "big", "buttery", "oaky", "peaty", "seedy", "gritty", "creamy", "smooth", "rustic", "complex", "chewy", "sweet", "crisp", "dense", "bold", "elegant", "sassy", "opulent", "massive", "wide", "flamboyant", "fleshy", "approachable", "jammy", "juicy", "refined", "silky", "structured", "steely", "rich", "toasty", "burnt", "velvety", "unctuous", "oily"],
    firstNames: ["Steve", "Michael", "Michaela", "Bob", "Chloe", "Zora", "Nikki", "Nia", "Sal", "Greta", "Zola", "Miki", "Kendra", "Kyle", "Mike", "Rob", "April", "Gregory", "Nathaniel", "Jim", "Arnav", "Noah", "Daniel", "David", "Cindy", "Stella", "Jonathan", "Gabriel", "Lucia", "Hollis", "Holly", "Maisie", "Jasper", "Lane", "Lincoln", "Sterling", "Summer", "Miranda", "Maria", "Shane", "Min", "Minnie", "Mariah", "Gus", "Dani", "Darius", "Elena", "Eduardo", "Elías", "Rajesh", "Ranjit", "Rex", "Rez", "Rey", "Yew", "Reba", "Jae-woo", "Ken", "Kira", "Jae", "Shah", "Josef", "Jørn", "Autumn", "Brandy", "Copper", "Cooper", "Harrow", "Manhattan", "Jo", "Jodi", "Karim", "Raf", "January", "Aku", "Juraj", "Yuri", "Kåre", "Lyn", "Jahan", "Mitch", "Alda", "Aimee", "Zoe", "London", "Paris", "Zuzu", "Zara", "Micah", "Song", "Sparrow", "Miguel", "Mikey", "Monette", "Michelina", "Agave", "Robyn", "Saffron", "Zeke", "Garth", "Rae", "Sebastian", "Seb", "Jake", "Bastion", "Luna", "Apple", "Delilah", "Jeremiah", "Finn", "Milo", "Finley", "April", "May", "September", "Kim", "Phineas", "Quincy", "Saul", "Rudy", "Cleo", "Noel", "Frankie", "June", "Rocky", "Pearl", "Harris", "Braxton", "Hamilton", "Ace", "Duke", "Rowan", "Stella", "Stevie", "Juniper", "Ryder", "Kai", "Judd", "Rhody", "Rho", "Sven", "Hazel", "Byron", "Edie", "Lola", "Poppy", "Jo", "Whisper", "Kaya", "Karim", "Kit", "Luca", "Rafa", "Miriam", "Aya", "Carmen", "Omar", "Anika", "Shan", "Luka", "Theo", "Emma", "Julian", "Adrian", "Ari", "Noah", "Maya", "Ariel"],
    lastNames: ["Stevens", "Chao", "Fillmore", "García", "Bond", "Bogg", "Wong", "Wei", "Goldsmith", "Tran", "Chu", "Baudin", "Montagne", "Moulin", "Villeneuve", "Victor", "Rodríguez", "Smith", "Johnson", "Williams", "Miller", "Stockton", "Patel", "Chaudri", "Jahan", "Christiansen", "Whittington", "Austen", "Johnson", "Cheval", "McCulloch", "Shane", "Jones", "Stein", "Hirviniemi", "Kiuru", "Øvregard", "Singh", "Noriega", "Pine", "Clarion", "Belden", "Jaware", "Keita", "Kanu", "Geary", "Norton", "Kearny", "Aliyev", "Sato", "Tanaka", "Kim", "Lee", "Gray", "Yang", "Li", "Çelik", "Davis", "Knox", "Griffin", "Leon", "Finch", "Yoo", "Gupta", "Flores", "Lopez", "Moon", "Sun", "Castro", "Suzuki", "Torres", "Pineda", "Tsao", "Romero", "Wolf"],
    object: ["toaster", "teacup", "teapot", "rug","basket", "thimble", "ottoman", "cushion", "pen", "pencil", "mug","egg", "chair", "sun", "cloud", "bell", "bucket", "lemon", "glove", "moon", "star", "seed", "card", "pancake", "waffle", "car", "train", "spoon", "fork", "potato"],
    objAdj: ["wooden","old","vintage","woven", "antique","broken","tiny", "giant", "little", "upside-down","dented","imaginary","glowing","curséd","glittery","organic", "rusty", "multi-layered", "complicated", "ornate", "dusty", "gleaming", "fresh", "ancient", "forbidden", "milky", "upholstered", "comfortable", "dynamic", "solar-powered", "coal-fired", "warm", "cold", "frozen", "melted", "boxy", "well-polished", "vivid", "painted", "embroidered", "enhanced", "embellished", "collapsible", "simple", "demure"],
    actions: ["sing", "become", "come", "leave", "remain", "see", "look", "behold", "cry", "sleep", "love", "dance", "betray", "need"],
    preposition: ["for", "until", "before", "up", "on", "above", "below", "against", "upon", "inside", "outside", "in"],
    article: ["any", "no", "one", "her", "his", "our", "my", "your", "the", "every"],
    adj: ["windy","wasted", "drunken", "gleaming",  "knowing", "beloved", "all-seeing", "forgiving", "betraying", "forgotten", "western", "eastern", "starlit", "forgotten", "lost", "haunted", "blessed", "remembered","forsaken", "unknowing", "innocent", "short-lived", "loving", "rejoicing", "fearful", "experienced", "vengeful", "forgiving", "joyful", "mournful", "sorrowful", "angry", "cruel", "fierce", "unbent", "broken", "unbroken", "foolish", "bewildered", "curious", "knowing", "everliving", "everloving", "hard-hearted", "careless", "carefree",  "bright", "dangerous", "fearless", "open-hearted", "generous", "prideful", "foolhardy", "brave", "bold", "wise", "wizened", "old", "young"],
    places: ["room", "sea", "room", "forest", "pagoda", "waste", "temple", "sanctuary", "ocean", "wall", "parlor", "hall", "dungeon", "cave", "sky", "house", "mountain", "sanctum", "palace", "river", "place", "desert", "island", "castle", "house", "inn", "tavern", "tower", "oasis", "tent"],
    stuff: ["stone", "sorrow","eyes", "flowers", "time", "fog", "sun", "clouds", "music", "songs", "stories", "tales", "storms", "rhyme", "freedom", "rhythm", "wind", "life", "ice", "gold", "mysteries", "song", "waves", "dreams", "water", "steel", "iron", "memories", "thought", "seduction", "remembrance", "loss", "fear", "joy", "regret", "love", "friendship", "sleep", "slumber", "mirth"],
    animals: "cobra okapi moose amoeba mongoose capybara yeti dragon unicorn sphinx kangaroo boa nematode sheep quail goat corgi agouti zebra giraffe rhino skunk dolphin whale bullfrog okapi sloth monkey orangutan grizzly moose elk dikdik ibis stork finch nightingale goose robin eagle hawk iguana tortoise panther lion tiger gnu reindeer raccoon opossum".split(" "),
    moods: "vexed indignant impassioned wistful astute courteous benevolent convivial mirthful lighthearted affectionate mournful inquisitive quizzical studious disillusioned angry bemused oblivious sophisticated elated skeptical morose gleeful curious sleepy hopeful ashamed alert energetic exhausted giddy grateful groggy grumpy irate jealous jubilant lethargic sated lonely relaxed restless surprised tired thankful".split(" "),
    colors: "ivory silver ecru scarlet red burgundy ruby crimson carnelian pink rose grey pewter charcoal slate onyx black mahogany brown green emerald blue sapphire turquoise aquamarine teal gold yellow carnation orange lavender purple magenta lilac ebony amethyst jade garnet".split(" "),
    material: "fire water cybernetic steampunk jazz steel bronze brass leather pearl cloud sky great crystal rainbow iron gold silver titanium".split(" "),
    adventures: "lament cry wail tale myth story epic tears wish desire dance mystery enigma drama path training sorrows joy tragedy comedy riddle puzzle regret victory loss song adventure question quest vow oath tale travels".split(" "),
    witchNames: "Gertrude Baba Hildebrand Ingrid Morgana Morraine".split(" "),

    capitaliseFirstLetter: function(s) {
        return s[0].toUpperCase() + s.substring(1)
    },

    getRandomCode: function() {
        let code = this.getRandom(this.colors) + " " + this.getRandom(this.material) + " " + this.getRandom(this.object)
        return code 
    },

    getRandomSentence: function(count) {
        count = count || Math.floor(Math.random()*10 + 1)
        let srcs = ["firstNames", "lastNames", "moods", "colors", "material", "objAdj", "object", "places", "stuff", "adventures", "animals", "adj"]
        let words = []
        for (var i = 0; i < count; i++) {
            let src = this[this.getRandom(srcs)]
            let word = this.getRandom(src)
            words.push(word)
        }

        return this.capitaliseFirstLetter(words.join(" ")) + ".";
    },
    getRandomParagraph: function(count = 8) {
        let s = []
        for (var i = 0; i < count; i++) {
            s.push(this.getRandomSentence())
        }
        return s.join(" ");
    },
    getRandomSeed: function(count = 8) {
        let s = ""
        for (var i = 0; i < count; i++) {
            if (Math.random() > .5) {
                s += String.fromCharCode(Math.floor(Math.random() * 26 + 65))
            } else {
                s += String.fromCharCode(Math.floor(Math.random() * 10 + 48))

            }
        }
        return s;
    },

    
    getHumanName: function() {
        let s = this.getRandom(this.firstNames);
        s += " " + this.getRandom(this.lastNames);
        if (Math.random() > .8) {
            return this.capitaliseFirstLetter(this.getRandom(this.animals)) + " " + this.getRandom(this.lastNames)
        }
        if (Math.random() > .8) {
            return this.capitaliseFirstLetter(this.getRandom(this.animals)) + " "  +this.getRandom(this.firstNames)
        }
        if (Math.random() > .8) {
            return this.getRandom(this.firstNames) + Math.floor(Math.random()*2000)
        }
        return s
    },
    getObject: function() {
        let s = this.getRandom(this.object);
        
        if (Math.random() > .9) {
            return s + " of " + this.getRandom(this.stuff)
        }
        if (Math.random() > .3) {
            let adj = this.getRandom(["colors", "material", "adj", "moods", "objAdj", "objAdj"])
            return  this.getRandom(this[adj]) +  " " + s
        }
        
        return s
    },



    getUserName: function() {
        let sections = []
        let count = Math.floor(Math.random()*Math.random()*3 + 1)
        for (var i = 0; i < count; i++) {
            let s = this.getRandomWord(Math.random()*Math.random()*3)
            if (Math.random() > .4) {
                let set = words.getRandom(["object", "adj", "firstNames", "lastNames", "animals", "moods", "colors", "material", "adventures", "places", "stuff"])
                s = this.getRandom(this[set])

            }
            s = s.toLowerCase()
            if (Math.random() > .8)
                s = this.capitaliseFirstLetter(s)

            sections[i] = s
        }
        
        let s = sections.join("");
        if (s.length < 10 && Math.random() > .5)
            s += Math.floor(Math.random()*2000)
        if (s.length < 6)
            s += this.getRandomWord(1).toUpperCase()
        s = s.substring(0,15)
        if (s.length < 8)
            s += Math.floor(Math.random()*Math.random()*2000)
        return s
    },

    getStatement: function() {
        return "This " + this.getRandom(this.moods) + " " + this.getRandom(this.adventures) + " made me " + this.getRandom(this.moods);
    },

    getRandomTimestamp: function(startTime, timeFromNow) {
        let date = new Date(startTime + Math.random()*timeFromNow) 

        return date.toLocaleString()
    },

    getRandomPlace: function() {
        let adj = this.capitaliseFirstLetter(this.getRandom(this.adj));
        let adv = this.capitaliseFirstLetter(this.getRandom(this.adventures));
        let animal = this.capitaliseFirstLetter(this.getRandom(this.animals));
        let stuff = this.capitaliseFirstLetter(this.getRandom(this.stuff));
        let place = this.capitaliseFirstLetter(this.getRandom(this.places));
        let material = this.capitaliseFirstLetter(this.getRandom(this.material));

        if (Math.random() > .4)
            material = this.capitaliseFirstLetter(this.getRandom(this.colors));

        let fxns = [() => material + " " + place,() => place + " of " + adj + " " + stuff, () => adj + " " + place, () => "The " + material + " " + place, () => place + " of " + stuff]

        return this.getRandom(fxns)()

    },

    getRandomTitle: function() {
        let adv = this.capitaliseFirstLetter(this.getRandom(this.adventures));
        let animal = this.capitaliseFirstLetter(this.getRandom(this.animals));
        let stuff = this.capitaliseFirstLetter(this.getRandom(this.stuff));
        let place = this.capitaliseFirstLetter(this.getRandom(this.places));
        let material = this.capitaliseFirstLetter(this.getRandom(this.material));
        var adj = this.getRandom(this.moods);
        if (Math.random() > .5)
            adj = this.getRandom(this.colors);
        if (Math.random() > .4)
            adv = place
        adj = this.capitaliseFirstLetter(adj)
        

        var thing = this.getRandom(this.places);
        if (Math.random() > .5)
            thing = this.getRandom(this.animals);
        if (Math.random() > .5)
            thing = this.getRandom(this.adventures);
        if (Math.random() > .4)
            thing = this.getRandom(this.object);
        thing = this.capitaliseFirstLetter(thing)
        

        let prefix = "";
        if (Math.random() > .4) {
            prefix = this.capitaliseFirstLetter(this.getRandom([this.getRandomWord(1) + "'s", this.getRandomWord(.5) + "'s", this.getRandomWord(.5) + "'s", "a", "every", "any", "that", "my", "our", "his", "her", "some", "the", "a", "last", "no"]));
            prefix += " "
        }

        


        let prefix2 = "";
        if (Math.random() > .4) {
            prefix2 = this.capitaliseFirstLetter(this.getRandom([this.getRandomWord(1) + "'s", this.getRandomWord(.5) + "'s", this.getRandomWord(.5) + "'s", "a", "every", "any", "that", "my", "our", "his", "her", "some", "the", "a", "last", "no"]));
            prefix2 += " "
        }

        let word = this.capitaliseFirstLetter(this.getRandomWord(.5));

        if (Math.random() > .94)
            return "The " + adj + " " + adv;
        if (Math.random() > .9)
            return prefix + adj + " " + place;

        if (Math.random() > .9) {
            return this.capitaliseFirstLetter(this.getRandom(this.preposition)) + " " + this.getRandom(this.article) + " " + adj + " " + thing;

        }
        if (Math.random() > .8) {
            return this.capitaliseFirstLetter(adj + " " + thing);
        }
        if (Math.random() > .8) {
            return this.capitaliseFirstLetter(this.getRandom(this.actions) + " " + this.getRandom(this.article) + " " + adj + " " + thing);
        }

        if (Math.random() > .7)
            return prefix + adv + " " + this.getRandom(["of", "for", "under", "in", "beyond"]) + " " + prefix2 + stuff;
        if (Math.random() > .8)
            return animal + "'s " + adv;
        if (Math.random() > .7)
            return prefix + adv + " of " + stuff;
        if (Math.random() > .5)
            return word + "'s " + adv;
        if (Math.random() > .4)
            return prefix + word;
        return "The " + adv + " of the " + adj + " " + animal;
    },

    getRandomWord: function(lengthMult) {
        if (Math.random() > .5)
            return this.getRandom(this.syllables.first) + this.getRandom(this.syllables.last);

        if (!lengthMult)
            lengthMult = 1;
        var s = ""
        if (Math.random() > .3)
            s += this.getRandom(this.syllables.first);

        s += this.getRandom(this.syllables.middle);

        var count = Math.floor(Math.random() * Math.random() * lengthMult * 5);
        for (var i = 0; i < count; i++) {
            var mid = this.getRandom(this.syllables.middle);
            s += mid;

        }

        if (Math.random() > .3)
            s += this.getRandom(this.syllables.last);

        return s;
    },
    getRandomVerb: function() {

        var s = this.getRandom(this.syllables.first);

        var count = Math.floor(Math.random() * 3);
        for (var i = 0; i < count; i++) {
            var mid = this.getRandom(this.syllables.middle);
            s += mid;
        }
        s += this.getRandom(this.syllables.lastVerb);

        return s;
    },
    getRandomID: function(count = 8) {
        let s = ""
        for (var i = 0; i < count; i++) {
            if (Math.random() > .4)
                s += String.fromCharCode(Math.random() * 26 + 65);
            else
                s += String.fromCharCode(Math.random() * 10 + 48);
        }

        return s
    }
}


let testGrammar = {
    greeting: ["nihao", "hi", "hello", "bonjour", "ciao"],
    animal: ["cat","okapi", "capybara", "emu", "narwhal", "coyote"],
    color: ["pink", "green", "aqua", "silver"],
    mood: ["happy", "elated", "morose", "sleepy", "enigmatic"],
    object: words.object,
    place: words.places,
    objAdj: words.objAdj,
    origin: [
    "#color.a# #animal# was #color#, and said #greeting.capitalize#", 
    "[myObj:#object#][myColor:#color#]#myColor.a.capitalize# #myObj# was in #place.a#. It was #objAdj# for #myObj.a#"]
}


let testMap = {
    id: "Object Adventures",
    states: {

        origin: {
            exits: [
                    "->somewhere '#animal.a# for [a:something]#a#' sdafjsdlaf",
                    // "'e' or 'gallery' or 'east' or wait:5 ->gallery",
                    // "'w' or 'closet' or 'west' ->closet"
                    ]
        },
        gallery: {
            exits: [
            "'examine' ->@ 'You see #painting#'",
            "'w' or 'origin' or 'west' ->origin"]
        },
        void: {
            exits: [
            "->randomRoom{userLvl}(0, random(chaos))"]
        },
        closet: {
            exits: [
            "'examine' ->@ object='#object#' closetObjects.push(object) 'You see #object#, take it?'",
            "('y' or 'yes') object ->@ 'You take the #object#' inventory.push(object) closetObjects.remove(object)",
            // Match some lambda for each object in a list, save the object that matches, 
            //  ie "use spoon on door" may save use, spoon, door
            "selectedObject=[obj for obj in rooms.closet.objects if matches(INPUT,obj.name)][0] ->@ 'you pick up #selectedObject#'",
            // "match(INPUT,) ->@ 'You take the #object#' inventory.push(object) closetObjects.remove(object)",
            "'e' or 'origin' or 'east' ->origin"]
        }
    },
    grammar: testGrammar
}


String.prototype.hashCode = function() {
  var hash = 0, i, chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};
