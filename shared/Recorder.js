/** 
 * A suite of tools for doing recording and playback
 **/



Vue.component("recorder-widget", {
	template: `<div class="widget widget-recorder">
		<button @click="save">save & copy to clipboard</button> 
		<input v-model="recordingText" @change="loadRecording" @keyup="loadRecording" />
		<div v-if="recorder.activeRecording">	

			<table>
				<tr v-for="({data,channel}) in recorder.activeRecording.channelData">
					<td>{{channel.path.join('.')}}</td>
					<td v-if="false">{{data.slice(-5).map(s => s.toFixed(2)).join('')}}</td>
					<!-- wee graph! -->
					<td><line-graph :data="data" /></td>
					
				</tr>
			
			</table>
		</div>

	</div>`,

	methods: {
		loadRecording() {
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
	}

	startRecording({channels}) {
		console.log("New recording", channels)
		this.activeRecording = new Recording({
			recorder: this, 
			channels
		})
	}

	loadRecording() {

	}


	update({t}) {
		// If we are recording, add a frame to the the recording
	
	}


}

class Recording {
	/**
	 * a set of channels, recorded over time
	 * _t is always the timestamp
	 * Each channel can be whatever, arrays, strings, or something else 
	 * (but should be a seperate copy if its mutable like an instance)
	 **/


	constructor({recorder, channels}={}) {

		this.recorder = recorder
		this.frames = []
		this.channelData = channels.map(channel => {
			return {
				channel,
				data: []
			}
		})

		// What are the channels that we are recording?
		

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

	}

	toData() {
		console.log("to data")
		let data = this.channelData.map(({channel,data}) => data)
		console.log(data)

	    // Flatten the array of arrays
	    const flattened = data.reduce((acc, val) => acc.concat(val), []);

	    // Create a TypedArray
	    const typedArray = new Float32Array(flattened);

	    // Convert TypedArray to ArrayBuffer
	    const buffer = typedArray.buffer;

	    // Convert ArrayBuffer to Base64
	    const base64String = btoa(String.fromCharCode.apply(null, new Uint8Array(buffer)));
	    console.log(data[0].length, base64String.length)

	    return base64String



	}

	fromData(base64String) {

	    // Convert Base64 to ArrayBuffer
	    const binaryString = atob(base64String);
	    const len = binaryString.length;
	    const bytes = new Uint8Array(len);
	    for (let i = 0; i < len; i++)        {
	        bytes[i] = binaryString.charCodeAt(i);
	    }

	    // Convert ArrayBuffer to TypedArray
	    const typedArray = new Float32Array(bytes.buffer);
	    console.log("array", typedArray)
	}
}