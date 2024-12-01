/**
 * A class fortracking hand/face/etc data
 * and playing or recording data
 *
 **/

const Tracker = (function () {

	const FACE_LANDMARK_COUNT = 478;
	const HAND_LANDMARK_COUNT = 21;
	const POSE_LANDMARK_COUNT = 32;

	function magnitude(v) {
		return Math.sqrt(v.x*v.x + v.y*v.y + v.z*v.z )
	}

	function setTo(v, v2) {
		v.x = v2.x
		v.y = v2.y
		v.z = v2.z
	}

	function setToDifference(v, v0, v1) {
		v.x = v0.x - v1.x
		v.y = v0.y - v1.y
		v.z = v0.z - v1.z
	}

	function setToAverage(v, vs) {
		v.x = 0
		v.y = 0
		v.z = 0
		for (var i = 0; i < vs.length; i++) {
			let v2 = vs[i]
			v.x += v2.x
			v.y += v2.y
			v.z += v2.z
		}
		v.x /= vs.length
		v.y /= vs.length
		v.z /= vs.length
	}

  // Individual lists of
	const CONTOURS = {
		fingers: [
			[1, 2, 3, 4],
			[5, 6, 7, 8],
			[9, 10, 11, 12],
			[13, 14, 15, 16],
			[17, 18, 19, 20],
			],

		centerLine: [
			10, 151, 9, 8, 168, 6, 197, 195, 5, 4, 1, 19, 94, 2, 164, 0, 11, 12, 13, 14,
			15, 16, 17, 18, 200, 199, 175, 152,
			],
		mouth: [
			[
				287, 436, 426, 327, 326, 2, 97, 98, 206, 216, 57, 43, 106, 182, 83, 18,
				313, 406, 335, 273,
				],
			[
				291, 410, 322, 391, 393, 164, 167, 165, 92, 186, 61, 146, 91, 181, 84, 17,
				314, 405, 321, 375,
				],
			[
				306, 409, 270, 269, 267, 0, 37, 39, 40, 185, 76, 77, 90, 180, 85, 16, 315,
				404, 320, 307,
				],
			[
				292, 408, 304, 303, 302, 11, 72, 73, 74, 184, 62, 96, 89, 179, 86, 15,
				316, 403, 319, 325,
				],
			[
				308, 407, 310, 311, 312, 13, 82, 81, 80, 183, 78, 95, 88, 178, 87, 14,
				317, 402, 318, 324,
				],
			],

		sides: [
	// RIGHT
		{
			irisCenter: [468],
			irisRing: [469, 470, 471, 472],

			faceRings: [
				[
					10, 109, 67, 103, 54, 21, 162, 127, 234, 93, 132, 58, 172, 136, 150,
					149, 176, 148, 152,
					],
				[
					151, 108, 69, 104, 68, 71, 139, 34, 227, 137, 177, 215, 138, 135, 169,
					170, 140, 171, 175,
					],
				[
					9, 107, 66, 105, 63, 70, 156, 143, 116, 123, 147, 213, 192, 214, 210,
					211, 32, 208, 199,
					],
				],
			eyeRings: [
				[
					122, 168, 107, 66, 105, 63, 70, 156, 143, 116, 123, 50, 101, 100, 47,
					114, 188,
					],
				[
					245, 193, 55, 65, 52, 53, 46, 124, 35, 111, 117, 118, 119, 120, 121,
					128,
					],
				[
					244, 189, 221, 222, 223, 224, 225, 113, 226, 31, 228, 229, 230, 231,
					232, 233,
					],
				[243, 190, 56, 28, 27, 29, 30, 247, 130, 25, 110, 24, 23, 22, 26, 112],
				[
					133, 173, 157, 158, 159, 160, 161, 246, 33, 7, 163, 144, 145, 153,
					154, 155,
					],
				],
		},
	// LEFT
		{
			faceRings: [
				[
					10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365,
					379, 378, 400, 377, 152,
					],
				[
					151, 337, 299, 333, 298, 301, 368, 264, 447, 366, 401, 435, 367, 364,
					394, 395, 369, 396, 175,
					],
				[
					9, 336, 296, 334, 293, 300, 383, 372, 345, 352, 376, 433, 416, 434,
					430, 431, 262, 428, 199,
					],
				],

			irisCenter: [473],
			irisRing: [476, 475, 474, 477],

			eyeRings: [
				[
					351, 168, 336, 296, 334, 293, 300, 383, 372, 345, 352, 280, 330, 329,
					277, 343, 412,
					],
				[
					465, 417, 285, 295, 282, 283, 276, 353, 265, 340, 346, 347, 348, 349,
					350, 357,
					],
				[
					464, 413, 441, 442, 443, 444, 445, 342, 446, 261, 448, 449, 450, 451,
					452, 453,
					],
				[
					463, 414, 286, 258, 257, 259, 260, 467, 359, 255, 339, 254, 253, 252,
					256, 341,
					],
				[
					362, 398, 384, 385, 386, 387, 388, 466, 263, 249, 390, 373, 374, 380,
					381, 382,
					],
				],
		},
		],

  // [10 109 87 103]
	};

	function checkValidLandmarkData(count, data) {
		if (!Array.isArray(data)) {
			console.log(data);
			throw "Landmark data should be an array";
		}
		data.forEach((pt) => {
			if (pt.length !== 2) {
				console.log("Wrong dimensions on point!", pt);
			}

			if (isNaN(pt[0]) || isNaN(pt[1])) {
				console.log("Non-numbers in point!", pt);
			}
		});
	}

	function printFrameInfo(frame) {
		if (!Array.isArray(frame.hands)) {
			console.warn("Bad tracking frame", frame);
			throw "Tracking frames should have hands";
		}
		if (!Array.isArray(frame.faces)) {
			console.warn("Bad tracking frame", frame);
			throw "Tracking frames should have faces";
		}
		console.log("Faces:", frame.faces.length, "Hands:", frame.hands.length);

		frame.faces.forEach((data) =>
			checkValidLandmarkData(FACE_LANDMARK_COUNT, data)
			);
		frame.hands.forEach((data) =>
			checkValidLandmarkData(HAND_LANDMARK_COUNT, data)
			);
	}



	let trackableCount = 0;


	class Trackable {
		constructor({type, tracker, landmarkCount, dimensionality}) {

			this.type = type
			this.tracker = tracker
			this.landmarkCount = landmarkCount

			this.idNumber = trackableCount++;
			this.uid = uuidv4()
			
			this.id = type + this.idNumber
			this.idColor = [(this.idNumber * 73) % 360, 100, 50];
			this.isActive = false;

			this.metaVectors = []

			this.boundingBox = [this.createMetaVector("bbMin"),this.createMetaVector("bbMax")]
			this.center = this.createMetaVector("center")
	// Create the landmarks
			this.landmarks = Array.from(
				{ length: landmarkCount },
				(x, i) => {
		  // Custom landmark maker
					let lmk = this.tracker.createLandmark(0,0,0)
					lmk.index = i
					lmk.id = this.id + "_" + i
					lmk.history = []
					return lmk


				}
				);

	// Record the landmarks
			this.metaVectors = []
		}



		toArray() {
			return this.landmarks.map(lmk => lmk.toArray())
		}


		toNormalizedArray() {
			// TODO
			return this.landmarks.map(lmk => lmk.toArray())
		}

		get dimensionality() {
			return this.landmarks[0].toArray().length
		}


		get flatDataSize() {
			return this.landmarkCount*this.dimensionality
		}

		get flatData() {
			return this.data.flat()
		}

		set flatData(data) {
			let dim = data.length/this.landmarks.length
			if (dim%1 !== 0)
				throw(`Mismatched array size for ${this}: expected multiple of ${this.landmarks.length}, got ${data.length}`)
			

			this.landmarks.forEach((lmk,index) => {
				let arr = data.slice(index*dim, (index+1)*dim)
				lmk.setTo(arr)
			})
		}

		getFlatDataByIndices({indices, dimensionality}) {
			return indices.map(index => {
				this.landmarks[index].toArray().slice(0, dimensionality)
			}).flat()
		}

		setFromFlatDataByIndices({data, indices, dimensionality}) {
			return indices.map((lmkIndex, index) => {
				let arr = data.slice(index*dimensionality, (index+1)*dimensionality)
				this.landmarks[lmkIndex].setTo(arr)
			})
		}


		get w() {
			return this.boundingBox[1].x - this.boundingBox[0].x
		}
		get h() {
			return this.boundingBox[1].y - this.boundingBox[0].y
		}

		get x() {
			return this.boundingBox[0].x 
		}
		get y() {
			return this.boundingBox[0].y 
		}
		get flatStringData() {
			return this.flatData.map(s => s.toFixed(2)).join(",")
		}

		set flatStringData(data) {
			this.flatData = data.split(",").map(s => parseFloat(s))
		}

		createMetaVector(id) {
	// create a vector that is not one of the landmarks
			let v = this.tracker.createLandmark()
			v.id = id
			v.history = []
			this.metaVectors.push(v)
			return v
		}

		toData(indices) {

	// Just some indices
			if (indices)
				return indices.map((index) => this.landmarks[index].map(tracker.vectorToData))
			return this.landmarks.map(tracker.vectorToData)
		}


		setLandmarksFromTracker(landmarks, imageDimensions) {
			if (landmarks === undefined) {

				this.isActive = false
				return
			}

			this.isActive = true
	// console.log("set to landmarks", landmarks)

	// Store the history of this landmark
			this.landmarks.forEach((pt, index) => {


	  // Scale and mirror the positions, so they are in screen space
				pt.x = (1 - landmarks[index].x) * imageDimensions[0]*this.tracker.scale
				pt.y = landmarks[index].y * imageDimensions[1]*this.tracker.scale
				pt.z = landmarks[index].z * imageDimensions[1]*this.tracker.scale


			});

			this.landmarks.concat(this.metaVectors).forEach(v => {
				v.history.unshift({
					x: v.x,
					y: v.y,
					z: v.z
				})
				v.history = v.history.slice(0, this.tracker.maxHistory)
			})

		}

		drawDebugData({p, flip=false, x = 0, y = 0, scale = 1.0}) {

			p.fill(...this.idColor);
			p.noStroke()
	// console.log(this.landmarks)
			this.landmarks.forEach((pt) => {
	  // Landmarks are relative to the image size
				let x0 = x + pt.x*scale
				let y0 = y + pt.y*scale
				p.circle(x0, y0, 3);
			});
		}

		calculateMetaTrackingData() {
			if (this.isActive) {
		// console.log(this.boundingBox)
				this.boundingBox[0].setTo(999999,999999)
				this.boundingBox[1].setTo(-999999,-999999)

				this.landmarks.forEach(lmk => {
		  // console.log(lmk.x, lmk.y)
					this.boundingBox[0].x = Math.min(this.boundingBox[0].x, lmk.x)
					this.boundingBox[0].y = Math.min(this.boundingBox[0].y, lmk.y)
					this.boundingBox[0].z = Math.min(this.boundingBox[0].z, lmk.z)
					this.boundingBox[1].x = Math.max(this.boundingBox[1].x, lmk.x)
					this.boundingBox[1].y = Math.max(this.boundingBox[1].y, lmk.y)
					this.boundingBox[1].z = Math.max(this.boundingBox[1].z, lmk.z)
					

				})

		// console.log(this.boundingBox[0].toFixed(2), this.boundingBox[1].toFixed(2))

			}
		}


	}

	const CATEGORIES = [
		"_neutral",
		"browDownLeft",
		"browDownRight",
		"browInnerUp",
		"browOuterUpLeft",
		"browOuterUpRight",
		"cheekPuff",
		"cheekSquintLeft",
		"cheekSquintRight",
		"eyeBlinkLeft",
		"eyeBlinkRight",
		"eyeLookDownLeft",
		"eyeLookDownRight",
		"eyeLookInLeft",
		"eyeLookInRight",
		"eyeLookOutLeft",
		"eyeLookOutRight",
		"eyeLookUpLeft",
		"eyeLookUpRight",
		"eyeSquintLeft",
		"eyeSquintRight",
		"eyeWideLeft",
		"eyeWideRight",
		"jawForward",
		"jawLeft",
		"jawOpen",
		"jawRight",
		"mouthClose",
		"mouthDimpleLeft",
		"mouthDimpleRight",
		"mouthFrownLeft",
		"mouthFrownRight",
		"mouthFunnel",
		"mouthLeft",
		"mouthLowerDownLeft",
		"mouthLowerDownRight",
		"mouthPressLeft",
		"mouthPressRight",
		"mouthPucker",
		"mouthRight",
		"mouthRollLower",
		"mouthRollUpper",
		"mouthShrugLower",
		"mouthShrugUpper",
		"mouthSmileLeft",
		"mouthSmileRight",
		"mouthStretchLeft",
		"mouthStretchRight",
		"mouthUpperUpLeft",
		"mouthUpperUpRight",
		"noseSneerLeft",
		"noseSneerRight",
		];

  /*
  ====================================================================================

  POSES
  ====================================================================================
  */

	class Face extends Trackable {
  // Data for one face
		constructor(tracker) {
			super({
				type:"Face", 
				tracker, 
				landmarkCount:FACE_LANDMARK_COUNT, 
				dimensionality:3
			});
			
			this.blendShapes = {};
			CATEGORIES.forEach((c) => (this.blendShapes[c] = 0));

	// useful points
			let singleKeys = [ "center", "dirLength", "dirWidth"]
			singleKeys.forEach(key => {
				this[key] = this.createMetaVector(key)
			})




	// Easy access
			this.forehead = this.landmarks[CONTOURS.centerLine[0]]
			this.nose = this.landmarks[CONTOURS.centerLine[9]]
			this.chin = this.landmarks[CONTOURS.centerLine[26]]

			this.side = [{},{}]
			this.side.forEach((side,i) => {
				let sideKeys = ["irisDir",
					"eyeCenter",
					"eyeDirOut", "eyeDirUp",
					"earDirOut", "earDirUp",]

				sideKeys.forEach(key => {
					side[key] = this.createMetaVector(key + "-" + i)
				})

				side.irisCenter = this.landmarks[CONTOURS.sides[i].irisCenter]
				side.irisRing = CONTOURS.sides[i].irisRing.map(i => this.landmarks[i])

	  // Set up names for some side landmarks
				side.ear = this.landmarks[CONTOURS.sides[i].faceRings[0][8]]
				side.earTop = this.landmarks[CONTOURS.sides[i].faceRings[0][7]]
				side.earBottom = this.landmarks[CONTOURS.sides[i].faceRings[0][9]]
				side.eyeRings = CONTOURS.sides[i].eyeRings.map(ring => {
					return ring.map(index => this.landmarks[index])
				})

				let eyeContour = CONTOURS.sides[i].eyeRings[4];
				side.eyeInner = this.landmarks[eyeContour[1]]
				side.eyeOuter = this.landmarks[eyeContour[8]]
				side.eyeTop = this.landmarks[eyeContour[4]]
				side.eyeBottom = this.landmarks[eyeContour[12]]

				side.blink = 0
				side.eyeSize = 0



			})
		}


		forEachSide(fxn) {
	// Do something for each side
	// TODO, put the correct side forward
			for (var i = 0; i < 2; i++) {
				fxn(CONTOURS.sides[i], i);
			}
		}


  // Do meta calculations
		calculateMetaTrackingData() {
			super.calculateMetaTrackingData()

			const setToLandmark = (v, index) => {
				setTo(v, this.landmarks[index])
			}

			const setToAverageOfIndices = (v, indices) => {
				setToAverage(v, indices.map(index => this.landmarks[index]))
			}


			this.side.forEach((side,i) => {
				setToDifference(side.earDirOut, side.ear, this.nose)

	  // Calculate eye metadata
				let eyeContour = CONTOURS.sides[i].eyeRings[4];

				setToAverage(side.eyeCenter, [side.eyeOuter, side.eyeInner])


				setToDifference(side.eyeDirOut, side.eyeOuter, side.eyeInner)
				setToDifference(side.eyeDirUp, side.eyeTop, side.eyeBottom)

				side.eyeSize = magnitude(side.eyeDirOut)
				side.eyeBlink = magnitude(side.eyeDirUp)
				setToDifference(side.irisDir, side.irisCenter, side.eyeCenter)

			})

			setToDifference(this.dirWidth, this.side[1].ear, this.side[0].ear)
			setToDifference(this.dirLength, this.chin, this.forehead)


			this.center.x = this.x + this.w/2
			this.center.y = this.y + this.h/2
		}
	}
  /*
  ====================================================================================

  POSES
  ====================================================================================
  */
	class Pose extends Trackable {
  // Data for one face
		constructor(tracker) {
			super({
				type:"Pose", 
				tracker, 
				landmarkCount:POSE_LANDMARK_COUNT, 
				dimensionality:3
			});

		}

		calculateMetaTrackingData() {
			super.calculateMetaTrackingData()
		}
	}

  /*
  ====================================================================================

  HANDS
  ====================================================================================
  */
	class Hand extends Trackable {
  // Data for one face
		constructor(tracker) {
			super({
				tracker, 
				type:"Hand", 
				landmarkCount:HAND_LANDMARK_COUNT, 
				dimensionality:3
			});
			
			this.handedness = undefined;

			this.fingers = Array.from({length:5}, (x, i)=> {
				let joints = CONTOURS.fingers[i].map(index => this.landmarks[index])
				return {
					pinchAmt: 0,
					dir:this.createMetaVector("dir" + i) ,
					joints,
					tip: joints[joints.length - 1],
					thumbPinch: this.createMetaVector("thumbPinch" + i),
				}

			})

			this.pinches = []

		}

		calculateMetaTrackingData() {
			super.calculateMetaTrackingData()



	// console.log("hand data")
			this.fingers.forEach((finger,index) => {


				let scale = remap(finger.tip.z, -50, 300, 1, 0)
				finger.scale = scale**4
				// How much bigger are x y than they seem?
				
				let thumbTip = this.landmarks[4]
				setToDifference(finger.dir, finger.tip, finger.joints[2])
				setToDifference(finger.thumbPinch, finger.tip, thumbTip)

				// Is this finger pinching?

				// pixels are more distance at the back than at the front?
				
				finger.pinchAmt = Math.max(0, 40 - finger.thumbPinch.magnitude/finger.scale)
				if (finger.pinchAmt > 0) {

					if (!finger.isPinching) {
						// start pinch
						finger.isPinching = true
						finger.onStartPinch?.(finger)
						let start = KVector.lerp(thumbTip, finger.tip, .5)
						finger.pinch = {
							start,
							pts: [],
						}
					}
					finger.onPinchMove?.(finger)
					finger.pinch.pts.push(KVector.lerp(thumbTip, finger.tip, .5))
				} else {
					// Stop pinch
					finger.isPinching = false
					finger.onStopPinch?.(finger)
					finger.pinch = undefined
				}
				

				// Check for pinching
				// Are any fingers pinching with the thumb?
			
			})

			let square = this.fingers.map(f => f.joints[0]).concat(this.fingers.map(f => f.joints[0]))
			this.center.setToAverage(square)
		}


	}




	class Tracker {
		constructor({
			maxHistory=  10,
			numHands= 6,
			numPoses= 3,
			numFaces= 3,
			doAcquireFaceMetrics=false,
			doAcquirePoseMetrics=false,
			doAcquireHandMetrics=false,

			modulePath,
			modelPaths,

			gpu=true,
			createLandmark

		} = {}) {

			if (!createLandmark)
				createLandmark = function(x,y,z) {
					return new KVector(x, y, z)
				}

			this.scale = 1

			if (modulePath && modelPaths)
				this.loadModels({modulePath, modelPaths})
			else {
				console.log(`Missing module path ${modulePath} or model paths (${modelPaths})`)
			}

			this.rawLandmarkData = {
				"hand":undefined,
				"pose":undefined,
				"face":undefined,
			}

			this.createLandmark = createLandmark

			this.vToData = (v) => {
				return `[${[pt.x,pt.y,pt.z].map(s => s.toFixed(3).join(","))}]`;
			}


			this.isActive = true;
			this.config = {
				doAcquireFaceMetrics: true,
				cpuOrGpuString:gpu?"GPU":CPU /* "GPU" or "CPU" */,
				numHands,
				numFaces,
				numPoses,
				doAcquireFaceMetrics,
				doAcquireHandMetrics,
				doAcquirePoseMetrics,

			};
			// console.log(this.config)

			console.log(`Tracker loaded, watching for ${numHands} hands, ${numFaces} faces, ${numPoses} poses, `)
			this.faces = Array.from({length:numFaces}, ()=> new Face(this))
			this.hands = Array.from({length:numHands}, ()=> new Hand(this))
			this.poses = Array.from({length:numPoses}, ()=> new Pose(this))

			// A place to store the landmarking models
			this.landmarkerModels = {}

			this.playbackInterval = undefined;
			this.frameIndex = 0;
		}

		get sourceDimensions() {
			return [this.source.width, this.source.height]
		}


		drawSource({p, flip=false, x = 0, y = 0, scale = 1.0}) {

			if (this.source) {
				// console.log(this.source.width, this.source.height)
				p.push()
				p.translate(x, y)
				p.scale(scale)
				p.push()
				if (flip) {
					p.translate(this.source.width, 0)
					p.scale(-1, 1)
				}
				p.image(this.source, 0,0)
				p.pop()
				p.pop()
			}
		}

		drawDebugData(settings) {
			this.trackables.forEach(trackable => {
				if (trackable.isActive) trackable.drawDebugData(settings)
			})
		}

		get trackables() {
			return [].concat(this.faces, this.hands, this.poses)
		}

		get activeTrackables() {
			return this.trackables.filter(tr => tr.isActive)
		}


		async loadModels({modulePath,modelPaths}) {
	/**
	 * Load the models
	 **/

			let visionBundlePath = modulePath  + "vision_bundle.js"
			console.log("Load tracker modules:")
			console.log("  Module path", modulePath, visionBundlePath, modelPaths)

			this.mediapipe_module = await import(visionBundlePath);
			this.vision = await this.mediapipe_module
			.FilesetResolver.forVisionTasks(modulePath);
			
	// Load all the model files
			Object.entries(modelPaths).forEach(([type,path]) => {
		// Load this model
				let modelAssetPath = modelPaths[type]

				let typeCap = type.charAt(0).toUpperCase() + type.slice(1)
				let LandmarkerClass = this.mediapipe_module[typeCap + "Landmarker"]
				
				LandmarkerClass.createFromOptions(
					this.vision,
					{
						...this.config,
						runningMode: "VIDEO",
						baseOptions: {
							delegate: this.config.cpuOrGpuString,
							modelAssetPath
						},
					}).then(landmarker => {
						// console.log("  Loaded landmarker and model for ", type)
						this.landmarkerModels[type] = landmarker
					}) ;

				})
			
		}

		async runAllLandmarkModels() {
		    let data = {};

		    for (let key of ["hand", "face", "pose"]) {
		        // Detect this model from the source
		        let model = this.landmarkerModels[key];
		        let startTimeMs = performance.now();

		        if (model) {
		            // Await the asynchronous operation
		            let detectionResult = await model.detectForVideo(this.source.elt, startTimeMs);

		            // Store the raw data
		            // Some models store it differently
		            let lmKey = key=="face"?"faceLandmarks":"landmarks"
		            data[key] = detectionResult[lmKey]
		        }
		    }

		    return data;
		}

		async detect({afterLandmarkUpdate,afterMetaUpdate}) {
			if (!this.source) {
				console.warn("no video source provided!")
				return
			}
			let t = performance.now();
			// Make sure we are not making double predictions?
			if (t - this.lastPredictionTime > 10) {

				console.log("\nStart prediction");

				// First, get the raw landmark predictions
			    let allLandmarks = await this.runAllLandmarkModels()
			    console.log("-  prediction complete");


			    Object.entries(allLandmarks).forEach(([type,newLandmarkData]) => {
			    	// Ok, we are looking at all of a type (hands, faces, etc)
			    	// For each active landmark data we have, 
			    	let trackables = this[type + "s"]
			    	
			    	trackables.forEach((trackable, index) => {
			    		// find the right trackable and update its landmark data
			    		let newData = newLandmarkData[index]
			    		// The goal here is to never have a time when 
			    		// the data has not gotten overridden via the afterLandmarkUpdate,
			    		// e.g. if we have playback overlays
			    		trackable.setLandmarksFromTracker(newData, this.sourceDimensions)
			    		
			    	})
			    })

			    afterLandmarkUpdate?.({tracker:this})
			    		

			    this.trackables.forEach(trackable => {
			    	trackable.calculateMetaTrackingData()
			    	
			    })
			    afterMetaUpdate?.({tracker:this})

			    // // Assign the predicted landmarks to each trackable
			    // ["hand", "face", "pose"].forEach(key => {
			    // 	let allTrackables
			    // 	this[key + 's'].forEach((trackable,index) => {
			    // 		let data =
			    // 		console.log(key, trackable.id)
			    // 	})
			    // })
			}

			this.lastPredictionTime = t;
		}



	// 	async predictHand() {
			
	// 	}

	// 	async predictFace() {

	// 		let startTimeMs = performance.now();
	// 		let data = this.landmarkers.face?.detectForVideo(this.source.elt, startTimeMs);
		
	// 		if (data) {
	// 			this.faces.forEach((face, faceIndex) => {
	// 				let landmarks = data.faceLandmarks[faceIndex];
	// 				let blendShapes = data.faceBlendshapes[faceIndex];

	// 	// Set the face to these landmarks
	// 				if (landmarks) {
	// 					face.isActive = true;
	// 					face.setLandmarksFromTracker(landmarks, this.sourceDimensions);
	// 				} else {
	// 	  // No face active here
	// 					face.isActive = false;
	// 				}
	// 			});
	// 		}
	// 	}

	// 	async predictPose() {
	// 		let startTimeMs = performance.now();
	// 		let data = this.landmarkers.pose?.detectForVideo(
	// 			this.source.elt,
	// 			startTimeMs
	// 			);

	// 		if (data) {

	  // // Set each pose to the right data
	// 			this.poses.forEach((pose, poseIndex) => {
	// 				let landmarks = data.landmarks[poseIndex];

	// 	// Set the face to these landmarks
	// 				if (landmarks) {
	// 					pose.isActive = true;
	// 					pose.setLandmarksFromTracker(landmarks, this.sourceDimensions);
	// 				} else {
	// 	  // No pose active here
	// 					pose.isActive = false;
	// 				}
	// 			});
	// 		}

	// 	}

	}

	return Tracker
})();
