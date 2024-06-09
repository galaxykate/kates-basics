/** 
 * A suite of tools for doing recording and playback
 **/

Vue.component("recorder-widget", {
	template: `<div class="widget widget-recorder">
		<div v-for="ch in recorder.channels">{{ch}}</div>
	</div>`,

	props: ["recorder"]
})

class Recorder {
	/**
	 * 
	 **/


	constructor({getFromPath,setAtPath}) {
		this.activeRecording  = new Recording()
		this.channels = []
	}

	addChannels(obj, prefix=[]) {
		// Add all the channels here
		// How do we find objects? combination of paths and uids
		Object.entries(obj).forEach(([key,val]) => {
			let path = prefix.concat(key)
			let id = val.uid?val.uid:prefix + key
			if (Array.isArray(val)) {
				val.forEach((index,subval) => {
					this.channels.push({
						path: id + index,
					})
				})
			}
			
			
		})
	}

	addTrackableLandmarks({trackable, startIndex, endIndex, indices}) {
		// Add channels for a single trackable (e.g. a face)

		// Which landmark indices, or all of them?
		trackable.landmarks.forEach((lmk, index) => {
			this.channels.push({
				uid: trackable.uid,
				index: index,
				key: "x"
			})
			this.channels.push({
				uid: trackable.uid,
				index: index,
				key: "y"
			})
			this.channels.push({
				uid: trackable.uid,
				index: index,
				key: "z"
			})
		})
	}

	update({t}) {
		

	}
}

class Recording {
	/**
	 * a set of channels, recorded over time
	 * _t is always the timestamp
	 * Each channel can be whatever, arrays, strings, or something else 
	 * (but should be a seperate copy if its mutable like an instance)
	 **/


	constructor({}={}) {
		this.channels = {}


		// What are the channels that we are recording?
		

	}


	addFrame({t}) {
		// Go through each channels to create a frame (an array of values)
		let frame = this.channels.forEach(ch => {
			// Get the value here
			return ch.obj[key]
		})

	}
}