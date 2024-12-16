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

			this.mappingPositions = this.constructor.POSITIONS.map(v => new KVector(v))
			if (mappingPos) {
				console.log("HAS POSITIONS")
				this.landmarks.forEach((lmk,i) => lmk.mappingPosition = mappingPositions[i])

				let voronoi = new Voronoi()
				let diagram = voronoi.compute(mappingPositions, {xl:-1, xr:1, yt: -1, yb: 1});
				console.log(diagram)
			}

			this.metaVectors = []
		}



		toArray() {
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

		//---------------------------------------------------
		// Remapping

		get screenNormalizedLandmarks() {
			return this.landmarks.map(lm => this.screenNormalizeLandmark(lm))
		}

		screenNormalizeLandmark(lm) {
			let src = this.tracker.source
			if (!src)
				return new KVector()

			return new KVector(
				remap(lm.x, 0, src.width, -1, 1), 
				remap(lm.y, 0, src.height, -1, 1),
				remap(lm.z, -100, 100, -1, 1))
		}


		get boundingBoxNormalizedLandmarks() {
			return this.landmarks.map(lm => this.boundingBoxNormalizedLandmark(lm))
		}

		boundingBoxNormalizedLandmark(lm) {
			let bb = this.boundingBox
			return new KVector(
				remap(lm.x, bb[0].x, bb[1].x, -1, 1), 
				remap(lm.y, bb[0].y, bb[1].y, -1, 1),
				remap(lm.z, bb[0].z, bb[1].z, -1, 1))
			
		}

		get axisNormalizedLandmarks() {
			// Rotate all landmarks around the ...nose?
			let angle = this.axis[0].getAngleTo(this.axis[1])
			return this.landmarks.map(lm => {
				let v = KVector.sub(lm, this.center)

				v.mult(.01)
				v.rotate(-angle + Math.PI/2)
				// console.log(v.toFixed(2))
				return v
				
			})
			
		}

		

		//---------------------------------------------------
		
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
		get d() {
			return this.boundingBox[1].z - this.boundingBox[0].z
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
			this.landmarks.forEach((pt) => {
	  // Landmarks are relative to the image size
				let x0 = x + pt.x*scale
				let y0 = y + pt.y*scale
				p.circle(x0, y0, 3);
			});
		}

		calculateMetaTrackingData() {
			if (this.isActive) {
				this.boundingBox[0].setTo(999999,999999, 99999)
				this.boundingBox[1].setTo(-999999,-999999, -99999)

				this.landmarks.forEach(lmk => {
		 			this.boundingBox[0].x = Math.min(this.boundingBox[0].x, lmk.x)
					this.boundingBox[0].y = Math.min(this.boundingBox[0].y, lmk.y)
					this.boundingBox[0].z = Math.min(this.boundingBox[0].z, lmk.z)
					this.boundingBox[1].x = Math.max(this.boundingBox[1].x, lmk.x)
					this.boundingBox[1].y = Math.max(this.boundingBox[1].y, lmk.y)
					this.boundingBox[1].z = Math.max(this.boundingBox[1].z, lmk.z)
					

				})

		
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
				type:"face", 
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
			this.axis = [this.forehead, this.chin]

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

			setToAverage(this.center, [this.chin, this.forehead])

		}
	}
	Face.LANDMARK_COUNT = 478
	Face.POSITIONS = [[0.00,0.33,-0.08],[0.02,0.11,-0.26],[0.01,0.16,-0.11],[0.08,-0.15,-0.20],[0.02,0.04,-0.28],[0.02,-0.07,-0.27],[0.01,-0.33,-0.14],[0.48,-0.44,0.08],[0.01,-0.56,-0.11],[0.01,-0.66,-0.13],[-0.00,-0.95,-0.12],[0.00,0.36,-0.07],[-0.00,0.38,-0.05],[0.00,0.39,-0.03],[-0.00,0.50,-0.00],[-0.00,0.53,-0.01],[-0.00,0.57,-0.02],[-0.00,0.61,-0.01],[-0.00,0.68,0.05],[0.02,0.15,-0.22],[0.09,0.13,-0.15],[0.72,-0.69,0.31],[0.29,-0.37,0.03],[0.36,-0.37,0.03],[0.43,-0.37,0.05],[0.51,-0.41,0.10],[0.23,-0.38,0.03],[0.41,-0.59,0.00],[0.32,-0.57,0.00],[0.49,-0.57,0.02],[0.53,-0.54,0.05],[0.57,-0.36,0.13],[0.29,0.74,0.15],[0.51,-0.47,0.10],[0.75,-0.41,0.36],[0.64,-0.42,0.18],[0.37,-0.03,0.00],[0.10,0.31,-0.07],[0.09,0.37,-0.04],[0.19,0.32,-0.03],[0.25,0.32,0.02],[0.16,0.36,-0.01],[0.22,0.35,0.04],[0.35,0.43,0.14],[0.09,0.11,-0.25],[0.09,0.04,-0.27],[0.62,-0.60,0.06],[0.21,-0.21,-0.02],[0.24,0.04,-0.11],[0.24,-0.00,-0.10],[0.56,-0.06,0.08],[0.09,-0.06,-0.25],[0.48,-0.67,-0.04],[0.57,-0.65,0.00],[0.66,-0.80,0.19],[0.17,-0.59,-0.09],[0.25,-0.53,0.01],[0.40,0.34,0.14],[0.67,0.25,0.58],[0.19,0.09,-0.09],[0.14,0.12,-0.09],[0.32,0.35,0.13],[0.30,0.35,0.12],[0.60,-0.69,0.02],[0.24,0.07,-0.08],[0.36,-0.66,-0.08],[0.37,-0.71,-0.10],[0.40,-0.93,-0.03],[0.64,-0.74,0.09],[0.39,-0.81,-0.07],[0.66,-0.63,0.10],[0.69,-0.65,0.20],[0.10,0.34,-0.06],[0.18,0.34,-0.02],[0.23,0.34,0.03],[0.17,0.10,-0.08],[0.31,0.35,0.13],[0.28,0.41,0.10],[0.29,0.36,0.12],[0.16,0.09,-0.17],[0.21,0.36,0.04],[0.15,0.37,0.01],[0.08,0.38,-0.02],[0.11,0.67,0.06],[0.10,0.60,0.00],[0.10,0.56,-0.01],[0.09,0.52,0.00],[0.08,0.49,0.01],[0.20,0.44,0.06],[0.22,0.45,0.06],[0.23,0.46,0.06],[0.25,0.48,0.07],[0.32,0.24,0.03],[0.74,-0.13,0.61],[0.02,0.16,-0.15],[0.24,0.40,0.10],[0.26,0.41,0.10],[0.11,0.15,-0.09],[0.22,0.10,-0.04],[0.12,0.14,-0.09],[0.28,-0.17,0.00],[0.40,-0.13,0.03],[0.25,0.02,-0.07],[0.57,-0.88,0.07],[0.54,-0.80,0.01],[0.51,-0.73,-0.04],[0.29,0.52,0.11],[0.20,-0.68,-0.12],[0.21,-0.80,-0.11],[0.22,-0.94,-0.10],[0.48,-0.38,0.07],[0.64,-0.31,0.16],[0.19,-0.39,0.04],[0.59,-0.51,0.09],[0.17,-0.24,-0.05],[0.20,0.03,-0.17],[0.70,-0.26,0.23],[0.59,-0.25,0.12],[0.51,-0.22,0.07],[0.38,-0.23,0.04],[0.28,-0.25,0.02],[0.21,-0.28,0.00],[0.08,-0.32,-0.11],[0.69,-0.11,0.23],[0.64,-0.51,0.12],[0.06,0.14,-0.22],[0.21,-0.13,-0.04],[0.77,-0.43,0.53],[0.16,-0.31,-0.01],[0.26,0.02,-0.01],[0.54,-0.46,0.11],[0.20,-0.02,-0.15],[0.71,0.05,0.60],[0.19,-0.41,0.05],[0.15,-0.05,-0.21],[0.56,0.49,0.33],[0.55,0.57,0.42],[0.73,-0.12,0.42],[0.62,0.36,0.37],[0.72,-0.54,0.29],[0.30,0.83,0.19],[0.05,0.16,-0.15],[0.27,-0.08,-0.02],[0.69,-0.41,0.23],[0.42,-0.42,0.05],[0.36,-0.41,0.04],[0.29,0.42,0.11],[0.67,0.03,0.26],[0.17,0.97,0.20],[0.39,0.80,0.30],[0.47,0.70,0.36],[0.00,-0.79,-0.13],[-0.00,1.00,0.18],[0.30,-0.41,0.03],[0.25,-0.41,0.04],[0.21,-0.41,0.05],[0.68,-0.53,0.17],[0.26,-0.48,0.03],[0.32,-0.51,0.02],[0.39,-0.52,0.02],[0.45,-0.52,0.04],[0.48,-0.50,0.06],[0.75,-0.57,0.43],[0.46,-0.43,0.07],[0.01,0.22,-0.09],[0.25,0.21,-0.02],[0.19,0.08,-0.11],[0.12,0.21,-0.08],[0.01,-0.45,-0.11],[0.48,0.61,0.29],[0.40,0.72,0.24],[0.17,0.91,0.14],[0.61,0.43,0.50],[0.22,-0.44,0.04],[0.13,-0.20,-0.12],[0.00,0.95,0.12],[0.29,0.90,0.25],[0.71,0.04,0.43],[0.15,0.47,0.03],[0.16,0.49,0.03],[0.17,0.52,0.02],[0.18,0.55,0.04],[0.22,0.61,0.08],[0.26,0.35,0.08],[0.28,0.34,0.08],[0.29,0.33,0.08],[0.37,0.28,0.08],[0.60,0.09,0.16],[0.12,-0.29,-0.08],[0.15,-0.46,0.00],[0.19,-0.46,0.03],[0.25,0.36,0.09],[0.61,0.26,0.26],[0.10,-0.45,-0.07],[0.25,0.66,0.12],[0.02,-0.16,-0.22],[0.08,-0.23,-0.16],[0.02,-0.24,-0.18],[0.17,-0.09,-0.11],[0.00,0.86,0.08],[0.00,0.76,0.07],[0.13,0.73,0.09],[0.41,0.46,0.17],[0.32,0.07,0.01],[0.34,0.57,0.15],[0.47,0.05,0.04],[0.38,0.14,0.04],[0.52,0.16,0.10],[0.16,0.83,0.10],[0.21,-0.06,-0.07],[0.47,0.52,0.22],[0.38,0.64,0.20],[0.46,0.35,0.16],[0.66,0.16,0.30],[0.54,0.36,0.21],[0.67,0.21,0.43],[0.43,0.22,0.09],[0.17,-0.16,-0.08],[0.18,0.07,-0.18],[0.22,0.07,-0.12],[0.15,0.03,-0.22],[0.21,-0.54,-0.02],[0.34,-0.60,-0.02],[0.44,-0.61,-0.01],[0.52,-0.60,0.01],[0.57,-0.56,0.05],[0.59,-0.44,0.14],[0.75,-0.26,0.39],[0.53,-0.33,0.10],[0.46,-0.30,0.07],[0.37,-0.30,0.05],[0.28,-0.31,0.03],[0.22,-0.33,0.03],[0.17,-0.35,0.02],[0.76,-0.28,0.59],[0.22,0.08,-0.09],[0.13,-0.13,-0.16],[0.14,0.09,-0.22],[0.10,0.12,-0.20],[0.13,0.10,-0.20],[0.20,0.10,-0.07],[0.09,0.14,-0.21],[0.07,0.15,-0.15],[0.17,-0.41,0.04],[0.14,-0.38,0.01],[0.12,-0.36,-0.03],[0.50,-0.48,0.08],[0.55,-0.50,0.08],[-0.04,-0.15,-0.21],[-0.50,-0.43,0.05],[-0.06,0.13,-0.15],[-0.76,-0.68,0.25],[-0.30,-0.36,0.01],[-0.37,-0.36,0.01],[-0.44,-0.36,0.02],[-0.53,-0.40,0.06],[-0.24,-0.37,0.01],[-0.42,-0.57,-0.03],[-0.33,-0.56,-0.02],[-0.50,-0.56,-0.01],[-0.55,-0.52,0.01],[-0.59,-0.35,0.09],[-0.30,0.75,0.13],[-0.53,-0.45,0.06],[-0.79,-0.40,0.31],[-0.67,-0.40,0.13],[-0.37,-0.02,-0.02],[-0.10,0.31,-0.08],[-0.10,0.37,-0.05],[-0.19,0.32,-0.05],[-0.26,0.32,0.00],[-0.17,0.36,-0.02],[-0.24,0.35,0.02],[-0.37,0.44,0.11],[-0.04,0.11,-0.25],[-0.05,0.04,-0.27],[-0.64,-0.58,0.01],[-0.21,-0.20,-0.04],[-0.22,0.05,-0.13],[-0.22,0.00,-0.11],[-0.58,-0.05,0.04],[-0.05,-0.06,-0.25],[-0.48,-0.65,-0.07],[-0.58,-0.63,-0.04],[-0.69,-0.79,0.14],[-0.16,-0.58,-0.10],[-0.26,-0.52,-0.00],[-0.43,0.34,0.11],[-0.74,0.26,0.53],[-0.17,0.09,-0.10],[-0.11,0.12,-0.10],[-0.35,0.35,0.11],[-0.33,0.35,0.10],[-0.61,-0.67,-0.02],[-0.23,0.07,-0.09],[-0.35,-0.64,-0.10],[-0.36,-0.70,-0.12],[-0.41,-0.92,-0.06],[-0.65,-0.73,0.05],[-0.38,-0.80,-0.09],[-0.68,-0.61,0.05],[-0.72,-0.64,0.15],[-0.10,0.34,-0.07],[-0.18,0.34,-0.04],[-0.25,0.34,0.01],[-0.16,0.10,-0.09],[-0.34,0.35,0.10],[-0.30,0.41,0.08],[-0.32,0.36,0.10],[-0.13,0.09,-0.18],[-0.22,0.36,0.03],[-0.16,0.37,-0.00],[-0.09,0.38,-0.02],[-0.12,0.66,0.05],[-0.10,0.60,-0.00],[-0.10,0.56,-0.01],[-0.10,0.52,-0.00],[-0.09,0.49,0.00],[-0.22,0.43,0.05],[-0.24,0.44,0.04],[-0.25,0.46,0.04],[-0.26,0.48,0.05],[-0.33,0.24,0.01],[-0.81,-0.11,0.55],[-0.27,0.40,0.08],[-0.28,0.40,0.08],[-0.09,0.15,-0.10],[-0.21,0.11,-0.05],[-0.10,0.14,-0.10],[-0.28,-0.17,-0.02],[-0.41,-0.13,-0.00],[-0.24,0.03,-0.08],[-0.59,-0.87,0.03],[-0.55,-0.79,-0.03],[-0.51,-0.71,-0.07],[-0.31,0.53,0.09],[-0.19,-0.67,-0.13],[-0.20,-0.80,-0.13],[-0.22,-0.94,-0.11],[-0.50,-0.37,0.04],[-0.66,-0.30,0.12],[-0.20,-0.38,0.02],[-0.61,-0.49,0.05],[-0.16,-0.24,-0.06],[-0.17,0.04,-0.18],[-0.74,-0.25,0.18],[-0.61,-0.24,0.07],[-0.52,-0.21,0.03],[-0.39,-0.22,0.01],[-0.28,-0.25,0.00],[-0.21,-0.27,-0.01],[-0.06,-0.32,-0.12],[-0.73,-0.10,0.18],[-0.66,-0.50,0.07],[-0.02,0.14,-0.22],[-0.20,-0.13,-0.06],[-0.82,-0.42,0.47],[-0.15,-0.30,-0.02],[-0.25,0.02,-0.03],[-0.56,-0.44,0.07],[-0.18,-0.02,-0.17],[-0.78,0.07,0.55],[-0.20,-0.40,0.03],[-0.11,-0.05,-0.22],[-0.60,0.50,0.29],[-0.60,0.58,0.38],[-0.79,-0.11,0.36],[-0.67,0.38,0.33],[-0.76,-0.53,0.24],[-0.32,0.84,0.17],[-0.01,0.16,-0.15],[-0.27,-0.08,-0.03],[-0.73,-0.39,0.18],[-0.43,-0.40,0.02],[-0.37,-0.40,0.01],[-0.31,0.41,0.09],[-0.72,0.04,0.21],[-0.18,0.98,0.19],[-0.41,0.81,0.28],[-0.51,0.71,0.33],[-0.31,-0.40,0.01],[-0.25,-0.40,0.02],[-0.22,-0.40,0.03],[-0.71,-0.51,0.12],[-0.27,-0.47,0.01],[-0.34,-0.50,-0.00],[-0.40,-0.51,-0.00],[-0.46,-0.50,0.01],[-0.50,-0.48,0.02],[-0.80,-0.57,0.37],[-0.47,-0.41,0.04],[-0.25,0.21,-0.03],[-0.17,0.08,-0.12],[-0.10,0.21,-0.08],[-0.51,0.62,0.26],[-0.42,0.73,0.22],[-0.17,0.92,0.13],[-0.67,0.44,0.46],[-0.22,-0.43,0.02],[-0.10,-0.20,-0.13],[-0.31,0.91,0.23],[-0.76,0.06,0.38],[-0.16,0.46,0.02],[-0.17,0.48,0.02],[-0.19,0.52,0.01],[-0.19,0.55,0.02],[-0.23,0.61,0.07],[-0.29,0.35,0.06],[-0.30,0.34,0.06],[-0.31,0.33,0.06],[-0.39,0.28,0.06],[-0.63,0.09,0.11],[-0.10,-0.28,-0.09],[-0.15,-0.45,-0.01],[-0.19,-0.45,0.01],[-0.27,0.36,0.07],[-0.65,0.27,0.22],[-0.08,-0.44,-0.07],[-0.26,0.67,0.10],[-0.05,-0.23,-0.17],[-0.15,-0.09,-0.12],[-0.13,0.74,0.08],[-0.43,0.46,0.14],[-0.32,0.07,-0.01],[-0.36,0.57,0.13],[-0.49,0.06,0.01],[-0.39,0.14,0.02],[-0.54,0.16,0.07],[-0.16,0.83,0.09],[-0.20,-0.06,-0.08],[-0.49,0.53,0.19],[-0.40,0.64,0.17],[-0.48,0.35,0.13],[-0.70,0.17,0.25],[-0.57,0.37,0.17],[-0.73,0.22,0.38],[-0.45,0.22,0.05],[-0.15,-0.16,-0.09],[-0.15,0.07,-0.19],[-0.20,0.08,-0.13],[-0.12,0.03,-0.23],[-0.22,-0.53,-0.03],[-0.34,-0.59,-0.04],[-0.45,-0.60,-0.04],[-0.53,-0.58,-0.02],[-0.58,-0.55,0.01],[-0.61,-0.42,0.09],[-0.80,-0.25,0.34],[-0.55,-0.32,0.06],[-0.47,-0.29,0.04],[-0.38,-0.29,0.02],[-0.29,-0.31,0.01],[-0.22,-0.32,0.01],[-0.17,-0.34,0.00],[-0.82,-0.27,0.53],[-0.20,0.09,-0.10],[-0.10,-0.13,-0.17],[-0.10,0.09,-0.23],[-0.06,0.13,-0.20],[-0.10,0.10,-0.20],[-0.18,0.11,-0.08],[-0.05,0.14,-0.22],[-0.04,0.15,-0.15],[-0.18,-0.40,0.02],[-0.14,-0.38,-0.01],[-0.11,-0.35,-0.04],[-0.51,-0.46,0.04],[-0.57,-0.49,0.04],[0.36,-0.47,0.04],[0.28,-0.46,0.04],[0.35,-0.53,0.04],[0.43,-0.47,0.04],[0.36,-0.40,0.04],[-0.39,-0.45,0.03],[-0.46,-0.46,0.03],[-0.39,-0.52,0.03],[-0.31,-0.45,0.03],[-0.39,-0.39,0.03]]
  /*
  ====================================================================================

  POSES
  ====================================================================================
  */
	class Pose extends Trackable {
  // Data for one face
		constructor(tracker) {
			super({
				type:"pose", 
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
				type:"hand", 
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
				cpuOrGpuString:gpu?"GPU":CPU /* "GPU" or "CPU" */,
				numHands,
				numFaces,
				numPoses,
				doAcquireFaceMetrics:numFaces>0,
				doAcquireHandMetrics:numHands>0,
				doAcquirePoseMetrics:numPoses>0,

			};
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

		async detectType({type, afterLandmarkUpdate,afterMetaUpdate, afterTypeUpdate}) {
			// Detect this type from the source
	        let model = this.landmarkerModels[type];
	        let trackables = this[type + "s"]
		    let startTimeMs = performance.now();

	        if (model) {
	            // Await the asynchronous operation
	            let rawResult = model.detectForVideo(this.source.elt, startTimeMs)

            	// Store the raw data
	            // Some models store it differently
	            let lmKey = type=="face"?"faceLandmarks":"landmarks"
	            let result = rawResult[lmKey]
	           
		    	trackables.forEach((trackable, index) => {
		    		// find the right trackable and update its landmark data
		    		// TODO - more complicated matching?
		    		trackable.setLandmarksFromTracker(result[index], this.sourceDimensions)
		    		afterLandmarkUpdate?.({trackable, type, index})
		    		trackable.calculateMetaTrackingData()
		    		afterMetaUpdate?.({trackable, type, index})
		    	})
	           
	        }
	        afterTypeUpdate?.({trackables, type})
		}


		async detect({afterLandmarkUpdate,afterMetaUpdate, afterTypeUpdate}) {
			if (!this.source) {
				console.warn("no video source provided!")
				return
			}
			let t = performance.now();
			// Make sure we are not making double predictions?
			if (t - this.lastPredictionTime > 10) {

				// Run all the detectors		
		        ["hand", "face", "pose"].forEach(type => this.detectType({type, afterLandmarkUpdate, afterMetaUpdate}))
		    	
			}

			this.lastPredictionTime = t;
		}



	}

	return Tracker
})();
