class TimeSeriesController {
	// Move over a time series
	// Think of it like the head of a tape, or a record player needle
	// It can move back and forth, loop, read, or write

	constructor({timeSeries}) {
		this.timeSeries = timeSeries
		this.time = {
			t: 0,
			last: 0,
			update({dt}) {
				this.last = this.t
				this.t += dt
			} 
		}
		
		this.frame = 0
		this.mode = "none"
		this.looping = true


		// Playback frames by framerate or by time
		this.playByFrameTime = false
	}

	get isRecording() {
		return this.mode === "recording"
	}
	get isPlaying() {
		return this.mode === "playing"
	}

	update({dt, t}) {
		// update the playback time
		// this is a time RELATIVE to the start of playing
		// so all recordings start at 0 (and we can pause playback)
		

		switch(this.mode) {
		case "recording": 
			this.time.update({dt})
			
			console.log("Record frame")

			// Todo - what time is it in the recording?
			this.timeSeries.recordFrame(this.time)
			this.frame = this.timeSeries.frameCount - 1
			break;
		case "playing": 
			this.time.update({dt})

			// Set the frame to the correct playback frame for this time
			let fr = Math.floor(this.time.t*this.timeSeries.frameRate)
			if (this.playByFrameTime)
				fr = 0

			this.frame = fr

			// LOOP?
			if (this.frame === this.timeSeries.frameCount && this.looping) {
				this.time.t = 0
				this.time.last = 0
				this.frame = 0
			}

			// We are moving between two times, 
			// - do we have a new frame?
			// - do we have any new events?
			

			break;
			
		}

	}

	

	pause() {
		this.mode = "none"
	}

	play() {
		console.log("Play")
		this.mode = "playing"
		this.t = 0
	}

	record() {
		// Jump to the end
		this.mode = "recording"
		this.frame = this.timeSeries.frameCount
		this.t = this.timeSeries.lastTime
	}
}
