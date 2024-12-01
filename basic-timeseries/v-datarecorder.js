Vue.component("dataslice-editor", {
	template: `<div>
		<div>{{dataslice.slices.length}}</div>

		<table>
			<tr v-for="slice in dataslice.slices">
				<td>{{slice.stream.id}}</td>
				<td>{{slice.length}}</td>
				<td>{{slice.label}}</td>
				<td>{{slice.indices}}</td>
				<td>{{slice.dimensions}}</td>
				<td>{{slice.flatIndices}}</td>
			</tr>
		</table>

		
	</div>`,

	mounted() {
		
	},

	props: { dataslice: { required: true }}
});


class Recording {
	constructor({uid,startedOn, frames}={}) {
		this.uid = uid || uuidv4()
		this.startedOn = startedOn || Date.now()
		this.frames = frames || []
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

	recordFrame(dataSlice, time) {
		if (dataSlice == undefined)
			console.warn("Trying to record dead frame")
		this.frames.push({
			time: time||Date.now(),
			index: this.frames.length,
			data:dataSlice
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
			mode:{{mode}}
			<span v-if="isPaused">(paused)</span>
		</div>
		<div v-if="recording" class="section">
			RECORDING: {{recording.id}}
				<div>filesize: {{saveData.length}}, {{recording.frames.length*slice.size}}</div>
				<textarea ref="savedata" @input="loadData" :value="saveData" /><button @click="copyToClipboard">copy to clipboard</button>
			
			<timeline 
				:frames="recording.frames" 
				:activeFrameIndex="activeFrameIndex" 
				mode="contain"
				@focus="startControl" 
				@blur="stopControl"
				@setActiveFrame="setActiveFrame"
				@setTimespan="setTimespan"
				/>
		</div>
		
		
	</div>`,
	computed: {


	},

	watch: {


		"globalTime.frameCount"() {
			// console.log("new frame!", this.globalTime.frameCount)
			// Record or playback
			if (!this.isPaused && this.recording) {

				switch(this.mode) {

					case "playback":
						this.incrementPlayback()
						break;

					case "recording":
						this.recordFrame()
						break;
				}
			}
		},

		
	},

	computed: {
		frameCount() {
			return this.recording.frames.length
		}
	},
	methods: {

		incrementPlayback() {
			
			let newFrameIndex = (this.activeFrameIndex + 1)%this.frameCount
			this.setActiveFrame(newFrameIndex)
			return this
		},

		recordFrame() {
			this.recording.recordFrame(this.slice.currentArray) 
			this.activeFrameIndex = this.frameCount - 1
			this.saveData = this.recording.toRawData()
			return this
		},

		loadData() {
			let raw = this.$refs.savedata.value
			this.recording = new Recording().fromRawData(raw)
			
			this.startNewRecording({frames})
			return this

		},

		copyToClipboard() {
			 const textarea = this.$refs.savedata; // Reference the textarea
		      textarea.select(); // Select its content
		      document.execCommand("copy"); // Copy the selected content to the clipboard
		    console.log("copy?")
		},

		setActiveFrame(activeFrameIndex) {
			if (this.recording) {
				this.activeFrameIndex = activeFrameIndex
				let activeFrame = this.recording.frames[this.activeFrameIndex]
				this.slice.setOverlay(activeFrame)
			}
		},

		setTimespan({start,end}) {
			// console.log(start, end)
		},

		startNewRecording({frames}={}) {
			console.log("Starting a new recording...");
	        this.activeFrameIndex = 0
			this.mode = "recording"
			this.isPaused = false
			this.recording = new Recording()
		},

		startControl() {
			console.log("start control")
			this.isPaused = true
			this.mode = "playback"
			// this.mode = "control"
		},

		stopControl() {
			// Go pack to playback, but paused
			// this.isPaused = true
			
		},


		startPlayback() {
			// Set the data slice's overlay
			// As we change the current frame, the slice uses this value instead
			
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
                    	this.startNewRecording();
	                } else {
	                    console.log("Toggling recording...");
	                    this.isPaused = !this.isPaused;
	                   	this.mode = "recording"
	                }
	                break;
				}
				
			}
		},

	},

	mounted() {
		window.addEventListener("keydown", this.handleKeydown);
		this.startNewRecording()
	},

	data() {
		return {
			recording: undefined,
			mode:"none",
			activeFrameIndex:0,
			isPaused: true,
			saveData:"",
		}
	},
	
	props: { 

		globalTime: {},
		slice:{} 
	}
});
