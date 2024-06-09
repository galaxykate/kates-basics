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
		constructor(tracker, landmarkCount) {


			this.tracker = tracker

			this.idNumber = trackableCount++;
			this.uid = uuidv4()
			
			this.id = this.type + this.idNumber
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

		get dimensionality() {
			return this.landmarks[0].toArray().length
		}

		get flatData() {

			let data = this.landmarks.map(lmk => lmk.toArray()).flat()
			return data
		}

		set flatData(data) {
			let dim = this.dimensionality
			let count = data.length/dim
			this.landmarks.forEach((lmk,index) => {
				let arr = data.slice(index*dim, (index+1)*dim)
		  // arr[0] += 20
				lmk.setTo(arr)
		  // if (this.isActive)
		  //   console.log(arr)
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

	// Save out the past data
			this.calculateMetaTrackingData?.();
		}

		drawDebugData(p) {

			p.fill(...this.idColor);
			p.stroke(0);
	// console.log(this.landmarks)
			this.landmarks.forEach((pt) => {
	  // Landmarks are relative to the image size
				p.circle(pt.x, pt.y, 6);
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
					this.boundingBox[1].x = Math.max(this.boundingBox[1].x, lmk.x)
					this.boundingBox[1].y = Math.max(this.boundingBox[1].y, lmk.y)
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
			super(tracker, FACE_LANDMARK_COUNT);
			this.name = "Face" + this.idNumber
			this.type = "face"

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
			super(tracker, POSE_LANDMARK_COUNT);
			this.name = "Pose" + this.idNumber
			this.type = "pose"
			this.tracker = tracker

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
			super(tracker, HAND_LANDMARK_COUNT);
			this.name = "Hand" + this.idNumber
			this.type = "hand"
			this.handedness = undefined;
			this.tracker = tracker

			this.fingers = Array.from({length:5}, (x, i)=> {
				let joints = CONTOURS.fingers[i].map(index => this.landmarks[index])
				return {
					dir:this.createMetaVector("dir" + i) ,
					joints,
					tip: joints[joints.length - 1]
				}

			})
		}

		calculateMetaTrackingData() {
			super.calculateMetaTrackingData()
	// console.log("hand data")
			this.fingers.forEach((finger,index) => {

				setToDifference(finger.dir, finger.tip, finger.joints[2])
			})

			let square = this.fingers.map(f => f.joints[0]).concat(this.fingers.map(f => f.joints[0]))
			this.center.setToAverage(square)
		}


	}




	class Tracker {
		constructor({
			maxHistory=  10,
			maxNumHands= 6,
			maxNumPoses= 3,
			maxNumFaces= 3,
			doAcquireFaceMetrics=false,
			doAcquirePoseMetrics=false,
			doAcquireHandMetrics=false,

			modulePath,
			modelPaths,

			gpu=true,
			createLandmark

		} = {}) {

			this.scale = 1


			this.loadModels({modulePath, modelPaths})

			this.maxHistory = maxHistory

			this.createLandmark = createLandmark

			this.vToData = (v) => {
				return `[${[pt.x,pt.y,pt.z].map(s => s.toFixed(3).join(","))}]`;
			}


			this.isActive = false;
			this.config = {
				doAcquireFaceMetrics: true,
		cpuOrGpuString:gpu?"GPU":CPU /* "GPU" or "CPU" */,
				maxNumHands,
				maxNumPoses,
				maxNumFaces,
				doAcquireFaceMetrics,
				doAcquireHandMetrics,
				doAcquirePoseMetrics,

			};

	// Support up to 3 faces and 6 hands.
	// We don't know whose is whose though

			this.faces = Array.from({length:maxNumFaces}, ()=> new Face(this))
			this.hands = Array.from({length:maxNumHands}, ()=> new Hand(this))
			this.poses = Array.from({length:maxNumHands}, ()=> new Pose(this))

			this.landmarkers = {}

			this.afterDetectFxns = []

			this.playbackInterval = undefined;
			this.frameIndex = 0;
		}

		get sourceDimensions() {
			return [this.source.width, this.source.height]
		}

	// Subscribe to detections
		onDetect(fxn) {
			this.afterDetectFxns.push(fxn)
		}

		drawSource({p, flip=false, x = 0, y = 0, scale = 1.0}) {
			if (this.source) {
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

		drawDebugData(p) {


			this.faces.forEach((face) => {
				if (face.isActive) face.drawDebugData(p);
			});
			this.hands.forEach((hand) => {
				if (hand.isActive) hand.drawDebugData(p);
			});

			this.poses.forEach((pose) => {
				if (pose.isActive) pose.drawDebugData(p);
			});
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
			console.log("Module path", modulePath, visionBundlePath, modelPaths)

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
						["num" + typeCap]: 3,
						runningMode: "VIDEO",
						baseOptions: {
							delegate: this.cpuOrGpuString,
							modelAssetPath
						},
					}).then(landmarker => {
						console.log("Loaded landmarker and model for ", type)
						this.landmarkers[type] = landmarker
					}) ;

				})
			console.log("modules loaded")
		}


		async detect() {
			let t = performance.now();
	// Make sure we are not making double predictions?
			if (t - this.lastPredictionTime > 10) {

				this.predictFace();
				this.predictHand();
				this.predictPose();


				this.afterDetect()

	  // Probably wrong with async, may be a frame behind
				this.afterUpdate();
			}

			this.lastPredictionTime = t;
		}

		async afterUpdate() {

		}

		async afterDetect() {
			this.afterDetectFxns.forEach(fxn => fxn(this))
		}


		async predictHand() {
			let startTimeMs = performance.now();
			let data = this.landmarkers.hand?.detectForVideo(this.source.elt, startTimeMs);
			if (data) {
				this.hands.forEach((hand, handIndex) => {
					let landmarks = data.landmarks[handIndex];

					if (landmarks) {
						hand.isActive = true;
						hand.handedness = data.handednesses[handIndex];

						hand.setLandmarksFromTracker(landmarks, this.sourceDimensions);
					} else {
		  // No face active here
						hand.isActive = false;
					}
				});
			}
		}

		async predictFace() {

			let startTimeMs = performance.now();
	// console.log(this.landmarkers)
			let data = this.landmarkers.face?.detectForVideo(this.source.elt, startTimeMs);

			if (data) {
				this.faces.forEach((face, faceIndex) => {
					let landmarks = data.faceLandmarks[faceIndex];
					let blendShapes = data.faceBlendshapes[faceIndex];

		// Set the face to these landmarks
					if (landmarks) {
						face.isActive = true;
						face.setLandmarksFromTracker(landmarks, this.sourceDimensions);
					} else {
		  // No face active here
						face.isActive = false;
					}
				});
			}
		}

		async predictPose() {
			let startTimeMs = performance.now();
			let data = this.landmarkers.pose?.detectForVideo(
				this.source.elt,
				startTimeMs
				);

			if (data) {

	  // Set each pose to the right data
				this.poses.forEach((pose, poseIndex) => {
					let landmarks = data.landmarks[poseIndex];

		// Set the face to these landmarks
					if (landmarks) {
						pose.isActive = true;
						pose.setLandmarksFromTracker(landmarks, this.sourceDimensions);
					} else {
		  // No pose active here
						pose.isActive = false;
					}
				});
			}

		}

	}

	return Tracker
})();
