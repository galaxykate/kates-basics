/** 
 * A suite of tools for doing recording and playback
 **/

// Frames are recorded as 
// {objects,data}
// Where objects is [{type,id,landmarkCount,dimensions}], 
// and data is the flat datastructure


class Recording {
	constructor({id, metadata, config}) {
		this.id = id
		this.config = config

		this.metadata = metadata
		this.metadata.id = id

		this.annotations = new TimeSeries({frameCount:metadata.frameCount})
	}

	

	get frameCount() {
		return this.metadata.frameCount
	}

	recordFrame() {
		this.serializer.setFromData(this.frame)
	}

	toData() {

	}

	fromData() {

	}

	addFakeEvents() {
		// this.metadata.labels = []
		// this.metadata.events = []
		// this.metadata.events = Array.from({length})

		// let count = this.metadata.frameCount
		// recording.metadata.events = Array.from({length:10}, (_, index) => {
		// 	return {
		// 		label: getRandom(["x", "y", "z"]),
		// 		val: Math.random(),
		// 		frame: Math.floor(Math.random()*recording.metadata.frameCount)
		// 	}
		// })
		
		// for (var i = 0; i < 3; i++) {
		// 	recording.metadata.labels[i] = {
		// 		label: "x" + i,
		// 		frames: Array.from({length:recording.metadata.frameCount}, (_,index) => noise(index*.1, i) > 0)
		// 	} 
		// }
	}

	load() {
		return this.config.handlers.load(this).then(data => {
			this.data = data
			console.log("Loaded data", data)
		})
	}

	save() {

	// Do additional annotations
		let metadata = {
			...this.recording.metadata,
			frameCount: this.recording.data.length
		}

		if (metadata.id === undefined)
			metadata.id = uuidv4()
			
		// Save...somehow? Call a fxn?
		this.saveRecordingFxn({metadata,data})
	}
}

class Playback {
	constructor(config = {}) {
		this.config = config
		this.recording = undefined
		this.isPlaying = false
		
		this.pointer = {
			frame: 0,
			isScrubbing: false
		}
		
		this.availableRecordings = []
		
	}

	loadAllRecordings() {
		console.log(this.config)
		return this.config.handlers.loadAllRecordings().then((recordings) => {
			console.log("Loaded all recordings", recordings)
			// Loaded all the metadata!
			this.availableRecordings = recordings
			
		})
	}

	loadAndPlay(recording)  {
		console.log("LOAD AND PLAY ", recording)
		this.recording = recording
		this.recording.load().then(() => {
			this.startPlayback()
		})
		
	}

	
	startPlayback() {
		console.log("PLAYBACK")
		this.isPlaying = true
		
		this.playbackTime = 0
	}

	pause() {
		this.isPlaying = false
	}

	incrementFrame({t,dt}) {

		// Amount of time that has passed since this animation started
		this.playbackTime += dt
		
		if (this.playbackTime > this.frameTime || this.frameTime === undefined) {
			// console.log("next frame", this.frameIndex, this.recording)
			this.pointer.frame++
			if (this.pointer.frame >= this.recording.frameCount) {
				// Loop! 
				this.playbackTime = 0
				this.pointer.frame = 0
			}
		}
	}

	update({t,dt, frame}) {
		if (this.isPlaying) {
			// if (frame%3 === 0)
			// 	this.incrementFrame({t,dt})

			// If we are in control, set the world to this frame data
			
			
		} 

		
	}

	get frameCount() {
		if (!this.recording)
			return 0
		return this.recording.frameCount
	}

	get frame() {
		let frame = this.recording.data[this.frameIndex]
		return frame
	}

	get pct() {
		if (this.recording)
			return this.frameIndex/this.frameCount
		return 0
	}

	set pct(pct) {
		this.frameIndex = Math.floor(pct*this.frameCount)
	}

	get isActive() {
		return this.isPlaying || this.isScrubbing
	}
}
class Recorder {
	/**
	 * 
	 **/

	constructor(config={}) {
		this.config = config
		this.recording = undefined
		this.isRecording = false
		this.maxFrames = 100
		// TODO - track pause time
	}

	get frameCount() {
		if (!this.recording)
			return 1
		return this.recording.data.length
	}

	startRecording() {
		this.recording = new Recording({
			id: "newRecording", 
        	config: this.config
		})
		this.isRecording = true
		return this.recording
	}

	stopRecording() {
		this.isRecording = false
	}

	update({t}) {
		if (this.isRecording) {
			this.recording.recordFrame()
		}
	}


}