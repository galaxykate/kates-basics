/** 
 * A suite of tools for doing recording and playback
 **/



Vue.component("recorder-widget", {
	template: `<div class="widget widget-recorder">
		<button @click="save">save & copy to clipboard</button> 
		<input v-model="recordingText" @input="loadRecording" @keyup="loadRecording" />
		<input type="range" 
			min="0" max="1" step=".02" 
			v-model.number="recorder.playbackPct" 
			@input="setTime"  />
		{{recorder.playbackPct}}
		<div>
			Mode: {{recorder.mode}}
			<div v-if="recording">
			{{recorder.playbackFrameNumber}}/{{recording.frameCount}}
			</div>
		</div>
		<div v-if="recording">	

			<table>
				<tr v-for="({data,channel}) in recording.channelData">
					<td>{{channel.path.join('.')}}</td>
					<td v-if="false">{{data.slice(-5).map(s => s.toFixed(2)).join('')}}</td>
					<!-- wee graph! -->
					<td><line-graph :data="data" 
						:markers="[{x:recorder.playbackFrameNumber}]" 
						:yRange="[-1,1]" 
						/></td>
					
				</tr>
			
			</table>
		</div>

	</div>`,

	computed: {
		recording() {

			return this.recorder.activeRecording
		}
	},

	methods: {
		setTime() {
			this.recorder.startPlaying()
		},
		loadRecording() {
			this.recorder.mode = 1
			this.recorder.activeRecording.fromData(this.recordingText)
		},

		save() {
			let text = this.recorder.activeRecording.toData()
			this.recordingText = text
			navigator.clipboard.writeText(text);
		}
	},
	data() {
		return {
			recordingText: ""
		}
	},

	props: ["recorder"]
})

class Recorder {
	/**
	 * 
	 **/


	constructor() {
		this.activeRecording = undefined

		this.frame = 0
		this.isPaused = false
		this.playbackPct = 0

		// We can be either playing or recording or neither
		this.mode = 0

		this.playbackHandlers = []
	}

	onPlaybackFrame(fxn) {
		this.playbackHandlers.push(fxn)
	}

	startPlaying() {
		this.mode = 1
	}

	
	get isPlaying() {
		return this.mode === 1
	}

	get isRecording() {
		return this.mode === 2
	}

	startRecording({channels}) {

		this.mode = 2
		console.log("New recording", channels)
		this.activeRecording = new Recording({
			recorder: this, 
			channels,
			frameStart: this.frame
		})
	}

	get playbackFrameNumber() {
		// console.log("playbackframe", this.activeRecording)
		if (!this.activeRecording)
			return 0
		// If we are at pct%
		let frameNum = Math.floor(this.activeRecording.frameCount*this.playbackPct) + this.activeRecording.frameStart
		// console.log(frameNum, this.activeRecording.frameCount, this.playbackPct)
		return frameNum
	}

	loadRecording() {

	}


	update({t, frame}) {
		// If we are recording, add a frame to the the recording
		this.frame += 1

		if (this.isRecording)
    		this.activeRecording.addFrame(frame)


    	if (this.isPlaying) {
    		let frame = this.activeRecording.getFrame(this.playbackFrameNumber)
    		this.playbackHandlers.forEach(fxn => fxn(frame,this.playbackFrameNumber))
    	}
	}


}

class Recording {
	/**
	 * a set of channels, recorded over time
	 * _t is always the timestamp
	 * Each channel can be whatever, arrays, strings, or something else 
	 * (but should be a seperate copy if its mutable like an instance)
	 **/


	constructor({recorder, channels, frameStart}={}) {
		this.frameStart = frameStart
		this.recorder = recorder
		this.frames = []
		this.frameCount = 0
		this.channelData = channels.map(channel => {
			return {
				channel,
				data: []
			}
		})

		// What are the channels that we are recording?
		

	}

	getFrame(index) {
		// return in [{ch, val}]
		return this.channelData.map(({channel,data}) => {
			return {
				path:channel.path,
				val:data[index]
			}
		})
	}
	

	addFrame(frame) {
		// console.log("add frame", frame)
		frame.forEach(({path,val}, index) => {
			let ch = this.channelData[index]
			ch.data.push(val)
		})
		// 
		// this.recorder.channels.forEach(ch => {
		// 	// console.log(ch)
		// })

		this.frameCount++

	}

	toData() {
	    console.log("to data");
	    let data = this.channelData.map(({channel, data}) => data);
	    console.log(data);

	    // Store lengths of sub-arrays
	    const lengths = data.map(subarray => subarray.length);

	    // Number of channels
	    const numChannels = data.length;

	    // Flatten the array of arrays
	    const flattened = data.reduce((acc, val) => acc.concat(val), []);

	    // Prepend number of channels and lengths to the flattened data
	    const completeData = [numChannels].concat(lengths).concat(flattened);

	    // Create a TypedArray
	    const typedArray = new Float32Array(completeData);

	    // Convert TypedArray to ArrayBuffer
	    const buffer = typedArray.buffer;

	    // Convert ArrayBuffer to Base64
	    const base64String = btoa(String.fromCharCode.apply(null, new Uint8Array(buffer)));
	    console.log(data[0].length, base64String.length);

	    return base64String;
	}

	fromData(base64String) {
	    // Convert Base64 to ArrayBuffer
	    const binaryString = atob(base64String);
	    const len = binaryString.length;
	    const bytes = new Uint8Array(len);
	    for (let i = 0; i < len; i++) {
	        bytes[i] = binaryString.charCodeAt(i);
	    }

	    // Convert ArrayBuffer to TypedArray
	    const typedArray = new Float32Array(bytes.buffer);

	    // Extract the number of channels
	    const numChannels = typedArray[0];
	    const lengths = Array.from(typedArray.slice(1, numChannels + 1));
	    let remainingData = typedArray.slice(numChannels + 1);

	    // Reconstruct the original array of arrays using lengths
	    // this.channelData = [];  // Clear previous data or initialize
	    for (let i = 0; i < numChannels; i++) {
	        const length = lengths[i];
	        const subArray = remainingData.slice(0, length);
	        remainingData = remainingData.slice(length);

	        // // Assuming you have a way to match channels to their data
	        // this.channelData.push({
	        //     data: Array.from(subArray)
	        // });
	        this.channelData[i].data = subArray

	        console.log(i, subArray.length);
	        console.log(subArray);
	    }
	}

}