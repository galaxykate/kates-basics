
/** 
 * Records a (probalby) normalized array of numbers, and plays them back
 * Annotations?
 **/

class Recorder {
	constructor({getData, setData}) {
		this.mode = "none"
		this.isPaused = false
		this.activeFrameIndex = 0

		this.getData = getData
		this.setData = setData
		this.startNewRecording()
	}

	
	startNewRecording() {
		this.isPaused = false
		this.recording = new Recording()
		this.mode = "recording"
		this.time = 0
	}

	update({t, dt, frameCount, speed=1}) {
		
		// Get the time since we started this recording
		this.time += dt*speed

		switch(this.mode) {
		case "recording": 

			// Every frame, get all the numbers, labels, etc, and store them
			this.recording.frames.push({
				metadata: {
					index: Recorder.frameCount++,
					time: this.time
				},
				data: this.getData()
			})
			this.recording.frames = this.recording.frames.slice(-30)
			this.activeFrameIndex = this.recording.frames.length
			break
		case "playback": 
			let frame = undefined // TODO
			this.setData(frame.data, frame.metadata)
		} 

		
	}
}

Recorder.frameCount = 0

class Recording {
	constructor({uid,startedOn, frames}={}) {
		
		this.uid = uid || uuidv4()
		this.startedOn = startedOn || Date.now()
		this.frames = frames || []

		
	}

	get saveData() {
		return []
	}

	toRawData() {
		// console.log(this.frames)
		let data = this.frames.map(f => arrayToFixed(f.data, 2)).join("\n")
		return data
	}

	fromRawData(raw) {
		let data = raw.split("\n").map(row => row.split(",").map(v => parseFloat(v)))
		this.frames = data.map((sliceData,index) => {
			// TODO - something for metadata like timestamps and indices
			return {
				index,
				data: sliceData
			}
		})
	}
}

/**
 * How do I pass in a recording so that I have access to it?
 * I wnat other code to be able to save/load from it (for python comms, eg)
 * active recording object?
 * app object?
 **/

Vue.component("data-recorder", {
	template: `<div class="widget widget datarecorder" >
		RECORDER
		<div>
			mode:{{recorder.mode}}
			<span v-if="recorder.isPaused">(paused)</span>
		</div>
		<div v-if="recording" class="section">
			RECORDING: {{recording.id}}
				
				
			<timeline 

				:frames="recording.frames" 
				:activeFrameIndex="recorder.activeFrameIndex" 
				mode="contain"
				@focus="startControl" 
				@blur="stopControl"
				@setActiveFrame="setActiveFrame"
				@setTimespan="setTimespan"
				/>
		</div>
		
		
	</div>`,
	computed: {
		recording() {
			return this.recorder.recording
		}

	},

	watch: {


		
	},


	methods: {
		startControl() {

		},

		stopControl() {

		},

		setTimespan() {

		},

		setActiveFrame() {
			
		},



		copyToClipboard() {
			 const textarea = this.$refs.savedata; // Reference the textarea
		      textarea.select(); // Select its content
		      document.execCommand("copy"); // Copy the selected content to the clipboard
		    console.log("copy?")
		},

	


		handleKeydown(event) {
			
			// Check if the target is a text input or textarea
			if (
				event.target.tagName !== "INPUT" &&
				event.target.tagName !== "TEXTAREA" &&
				!event.target.isContentEditable
			) {
				console.log(event.code)
				switch(event.code) {
				case "Space": 
					event.preventDefault(); // Prevent default behavior (e.g., page scroll)
					this.isPaused = !this.isPaused;
					break;
				case "KeyR":
					// use R to toggle recording
					// Shift R to start a new recording
					 if (event.shiftKey || this.recording === undefined) {
                    	this.recorder.startNewRecording();
	                } else {
	                    console.log("Toggling recording...");
	                    this.recorder.isPaused = !this.recorder.isPaused;
	                   	this.recorder.mode = "recording"
	                }
	                break;
				}
				
			}
		},

	},

	mounted() {
		window.addEventListener("keydown", this.handleKeydown);
	
	},

	data() {
		return {}
	},
	
	props: { 

		recorder:{

		},
			

		
	}
});
