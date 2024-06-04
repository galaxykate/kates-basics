/**
 * A class fortracking hand/face/etc data
 * and playing or recording data
 *
 **/

const FACE_LANDMARK_COUNT = 478;
const HAND_LANDMARK_COUNT = 21;

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

function convertFrame({ scaleX, scaleY, offsetX, offsetY, frame }) {
  let fields = ["hands", "faces", "bodies"]
  fields.forEach(key => {
    if (frame[key]){
      frame[key].forEach((pts) => {
        pts.forEach((pt) => {
          pt[0] = pt[0] * scaleX + offsetX;
          pt[1] = pt[1] * scaleY + offsetY;
        });
      });
    }
  })

}

function convertFromOGRecording() {
  //TEST_FACE_DATA array of frames
  //TEST_HAND_DATA array of frames
  console.log(TEST_FACE_DATA.length);

  function convertPts(pt) {
    (pt[0] = pt[0] * 1.2 + 300), (pt[1] = pt[1] * 200);
  }

  // Make a set of frames
  let frames = [];
  for (var i = 0; i < TEST_FACE_DATA.length; i++) {
    let hands = TEST_HAND_DATA[i];
    let face = TEST_FACE_DATA[i];
    // Filter out empty faces/hands
    hands = hands.filter((hand) =>
      hand.some((pt) => pt[0] !== 0 || pt[1] !== 0)
      );
    
    let frame = {
      index: i,
      hands,
      faces: [face],
    }
    convertFrame({frame, scaleX:1.2, scaleY: 1, offsetX:300, offsetY: 200})
    frames.push(frame);
  }

  frames.forEach((fr) => printFrameInfo(fr));

  saveTemplateAsFile("testData.json", {
    name: "test recording",
    label: "",
    timestamp: Date.now(),
    frames
  });


  //   landmarks[index][0] * scale * 1.2 + 300,
  // 	landmarks[index][1] * scale + 200
}


let trackableCount = 0;


class Trackable {
  constructor(tracker, landmarkCount) {
    this.tracker = tracker

    this.idNumber = trackableCount++;
    this.idColor = [(this.idNumber * 73) % 360, 100, 50];
    this.isActive = false;
    
    // Create the landmarks
    this.landmarks = Array.from(
      { length: landmarkCount },
        (x, i) => {
          return {
            x:0,y:0,z:0, 
            index:i,
            history: []
          }
        }
      );

    // Record the landmarks
    this.metaVectors = []
  }

  createMetaVector(id) {
    // create a vector that is not one of the landmarks
    let v = {
      id: id,
      x:0,y:0,z:0,
      history: []
    }
    this.metaVectors.push(v)
    return v
  }

  toData(indices) {
    
    // Just some indices
    if (indices) 
      return indices.map((index) => this.landmarks[index].map(tracker.vectorToData))
    return this.landmarks.map(tracker.vectorToData)
  }

  contourToPoints(contour) {
    return contour.map((index) => this.landmarks[index]);
  }

  setLandmarksFromRecording(landmarks) {
    this.landmarks.forEach((pt, index) => {
      // Scale and mirror the positions, so they are in screen space
      let scale = 1;
      // The new Golan version has 2 more points ¯\_(ツ)_/¯
      if (index < landmarks.length) {
        pt.setTo(landmarks[index][0] * scale, landmarks[index][1] * scale);
      }
    });
    this.calculateMetaTrackingData?.();
  }

  setLandmarksFromTracker(landmarks, imageDimensions) {
    // console.log("set to landmarks", landmarks)

    // Store the history of this landmark
    this.landmarks.forEach((pt, index) => {
     

      // Scale and mirror the positions, so they are in screen space
      pt.x = (1 - landmarks[index].x) * imageDimensions[0]
      pt.y = landmarks[index].y * imageDimensions[1]
      pt.z = landmarks[index].z * imageDimensions[1]


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

  drawContour({
    p,
    contour, // A list of Vect2d, or list of indices
    contour1 = undefined,
    image = undefined,
    imageScale = 1,
    useCurveVertices = false,
    onlyVertices = false,
    transformPoint = undefined,
    close = false,
  } = {}) {
    let pt2 = new Vector2D();
    if (!onlyVertices) p.beginShape();
    if (image) {
      p.texture(image);
      p.textureMode(p.IMAGE);
    }

    let drawVertex = (pt, index) => {
      if (!isNaN(pt)) pt = this.landmarks[pt];
      let vFxn = useCurveVertices ? "curveVertex" : "vertex";

      pt2.setTo(...pt);
      // Transform the points with a function?
      if (transformPoint) {
        transformPoint(pt2, pt, index);
      }

      if (image) p[vFxn](...pt2, pt2[0] * imageScale, pt2[1] * imageScale);
      else p[vFxn](...pt2);
    };

    contour.forEach(drawVertex);

    if (contour1) {
      contour1.slice().reverse().forEach(drawVertex);
    }
    if (!onlyVertices) p.endShape(close ? p.CLOSE : undefined);
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

class Face extends Trackable {
  // Data for one face
  constructor(tracker) {
    super(tracker, FACE_LANDMARK_COUNT);
    this.name = "Face" + this.idNumber

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

    const setToLandmark = (v, index) => {
      setTo(v, this.landmarks[index])
    }

    const setToAverageOfIndices = (v, indices) => {
      setToAverage(v, indices.map(index => this.landmarks[index]))
    }

    setToAverage(this.center, [this.side[0].ear,this.side[1].ear])


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
    
    
  }
}

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
    // console.log("hand data")
    this.fingers.forEach((finger,index) => {
      
      setToDifference(finger.dir, finger.tip, finger.joints[2])
    })
  }
}




class Tracker {
  constructor({
    maxHistory=  10,
    captureDim= [320, 240],
    maxNumHands= 6,
    maxNumPoses= 1,
    maxNumFaces= 3,
    doAcquireFaceMetrics=false,
    doAcquirePoseMetrics=false,
    doAcquireHandMetrics=false,
    handLandmarkerPath= "/mediapipe/",
    poseLandmarkerPath= "/mediapipe/",
    faceLandmarkerPath= "/mediapipe/",
    mediapipePath= "/mediapipe/",
    gpu=true

  } = {}) {

    this.mediapipePath = mediapipePath
    this.poseLandmarkerPath = poseLandmarkerPath
    this.handLandmarkerPath = handLandmarkerPath
    this.faceLandmarkerPath = faceLandmarkerPath


    this.maxHistory = maxHistory
    
    this.vToData = (v) => {
      return `[${[pt.x,pt.y,pt.z].map(s => s.toFixed(3).join(","))}]`;
    }

    
    this.captureDim = captureDim

    this.mode = "none";
    this.recorder = undefined;

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
    for (var i = 0; i < maxNumFaces; i++) {

    }
    this.faces = Array.from({length:maxNumFaces}, ()=> new Face(this))
    this.hands = Array.from({length:maxNumHands}, ()=> new Hand(this))
    console.log(this.hands)

    this.playbackInterval = undefined;
    this.frameIndex = 0;
  }

  drawDebugData(p) {
    if (this.capture) {
      p.push()
      p.translate(this.captureDim[0], 0)
      p.scale(-1, 1)

      p.image(this.capture, 0,0, ...this.captureDim)
      p.pop()
    }

    this.faces.forEach((face) => {
      if (face.isActive) face.drawDebugData(p);
    });
    this.hands.forEach((hand) => {
      if (hand.isActive) hand.drawDebugData(p);
    });
  }

  
  get activeTrackables() {
    return {
     faces:this.faces.filter((f) => f.isActive),
     hands:this.hands.filter((f) => f.isActive)
   }
 }


 async createCaptureAndInitTracking(p) {
    // Make a camera capture
  this.capture = p.createCapture(p.VIDEO)
  this.capture.size(...this.captureDim)
  this.capture.hide()

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

async initTracking() {
  this.isActive = true;
  console.log("TRACKER - initiate tracking!");

  this.mediapipe_module = await import(
    this.mediapipePath + "vision_bundle.js"
    );

  this.vision = await this.mediapipe_module
    .FilesetResolver.forVisionTasks(this.mediapipePath);

  this.initHandTracking();
  this.initFaceTracking();
  // this.initPoseTracking();
}

afterUpdate() {
  this.onFrame?.();
}

setToRecordingFrame(frame, ogAdjustment) {
  if (frame.faces[0]) {
    this.faces[0].isActive = true;
    this.faces[0].setLandmarksFromRecording(frame.faces[0], ogAdjustment);
  }

  if (frame.hands[0]) {
    this.hands[0].isActive = true;
    this.hands[0].setLandmarksFromRecording(frame.hands[0], ogAdjustment);
  }

  if (frame.hands[1]) {
    this.hands[1].isActive = true;
    this.hands[1].setLandmarksFromRecording(frame.hands[1], ogAdjustment);
  }

  this.afterUpdate();
}

async detect() {
  let t = performance.now();
    // Make sure we are not making double predictions?
  if (t - this.lastPredictionTime > 10) {
    this.predictFace();
    this.predictHand();

      // Probably wrong with async, may be a frame behind
    this.afterUpdate();
  }

  this.lastPredictionTime = t;
}

async predictHand() {
  let startTimeMs = performance.now();
  
  let data = this.handLandmarker?.detectForVideo(this.video.elt, startTimeMs);
  if (data) {
    this.hands.forEach((hand, handIndex) => {
      let landmarks = data.landmarks[handIndex];

      if (landmarks) {
        hand.isActive = true;
        hand.handedness = data.handednesses[handIndex];
        let videoDimensions = [this.video.elt.width, this.video.elt.height];
        hand.setLandmarksFromTracker(landmarks, videoDimensions);
      } else {
          // No face active here
        hand.isActive = false;
      }
    });
  }
}

async predictFace() {
  let startTimeMs = performance.now();

  let data = this.faceLandmarker?.detectForVideo(this.video.elt, startTimeMs);

  if (data) {
    this.faces.forEach((face, faceIndex) => {
      let landmarks = data.faceLandmarks[faceIndex];
      let blendShapes = data.faceBlendshapes[faceIndex];

        // Set the face to these landmarks
      if (landmarks) {
        face.isActive = true;
        let videoDimensions = [this.video.elt.width, this.video.elt.height];
        face.setLandmarksFromTracker(landmarks, videoDimensions);
      } else {
          // No face active here
        face.isActive = false;
      }
    });
  }
}

async predictPose() {
  let startTimeMs = performance.now();
  this.poseLandmarks = this.poseLandmarker?.detectForVideo(
    this.video.elt,
    startTimeMs
    );
}

  //------------------------------------------------------------------------
  // Start hand tracking
  // Hand Landmark Tracking:
  // https://codepen.io/mediapipe-preview/pen/gOKBGPN
  // https://mediapipe-studio.webapps.google.com/studio/demo/hand_landmarker

async initHandTracking() {
    // Create a landmark-tracker we can query for latest landmarks
  this.handLandmarker =
  await this.mediapipe_module.HandLandmarker.createFromOptions(
    this.vision,
        // Handtracking settings
    {
      numHands: this.config.maxNumHands,
      runningMode: "VIDEO",
      baseOptions: {
        delegate: this.config.cpuOrGpuString,
        modelAssetPath: this.handLandmarkerPath +  "hand_landmarker.task",
      },
    }
    );
}

  //------------------------------------------------------------------------
  // Start pose tracking
  // Pose (Body) Landmark Tracking:
  // https://codepen.io/mediapipe-preview/pen/abRLMxN
  // https://developers.google.com/mediapipe/solutions/vision/pose_landmarker

async initPoseTracking() {
    // Which model to use? Options: lite or full

  const poseModelPath = this.poseLandmarkerPath + "pose_landmarker_full.task";

    // Create a landmark-tracker we can query for latest landmarks
  this.poseLandmarker =
  await this.mediapipe_module.PoseLandmarker.createFromOptions(
    this.vision,
    {
      numPoses: this.config.maxNumPoses,
      runningMode: "VIDEO",
      baseOptions: {
        modelAssetPath: poseModelPath,
        delegate: this.config.cpuOrGpuString,
      },
    }
    );
}

async initFaceTracking() {
    // Create a landmark-tracker we can query for latest landmarks
  this.faceLandmarker =
  await this.mediapipe_module.FaceLandmarker.createFromOptions(
    this.vision,
    {
      numFaces: this.config.maxNumFaces,
      runningMode: "VIDEO",
      outputFaceBlendshapes: this.config.doAcquireFaceMetrics,
      baseOptions: {
        delegate: this.config.cpuOrGpuString,
        modelAssetPath:
        this.faceLandmarkerPath + "face_landmarker.task",
      },
    }
    );
}
}
