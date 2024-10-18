
Vue.component("recording-tile", {
	template: `<div class="tile recording-tile">
		TIME: {{date}}
		<button @click="$emit('pause')" v-if="isPlaying">⏸️</button>
		<button @click="$emit('play')" v-else>▶️</button>

	</div>
	`,

	computed: {
		date() {
			return formatDate(this.recording.metadata.startedOn)
		}
	},
	props: ["recording", "isPlaying"]
})




Vue.component("recorder-widget", {
	template: `<div class="widget widget-recorder">
			RECORDER
			<button @click="startRecording()">⏺️</button> 	
			<div v-if="playback">
				<div v-if="playback.recording">
					RECORDING:{{playback.recording.id}}
					<timeseries-annotation-widget :channels="channels" />
				</div>
			</div>

			<div v-if="recorder">
				{{recorder.isRecording}}
			</div>	
			
			
			<div v-if="playback">	
				<div v-if="playback.recording">
					
					<input type="range" 
						@focus="playback.isScrubbing=true"
      					@blur="playback.isScrubbing=false"
						v-model.number="playback.frameIndex" min="0" :max="playback.frameCount-1" step="1" />
						<label>{{playback.frameIndex}}</label>
				</div>
				<recording-tile 
					v-for="recording in playback.availableRecordings" 
					@play="playback.loadAndPlay(recording)"
					@pause="pause(recording)"
					:recording="recording" 
					:key="recording.metadata.id"
					:isPlaying="playback.isPlaying && recording===playback.recording"
					/>
			
			</div>
	</div>`,

	computed: {
		recording() {
			if (this.recorder.isRecording)
				return this.recorder.recording
			if (this.playback.isPlaying)
				return this.playback.recording
		},
		channels() {
			console.log(this.playback.recording.annotations.channels)
			let metachannel = new TimeChannel({id:"meta", })
			return this.playback.recording.annotations.channels.concat(metachannel)
		}
	},
	methods: {

		startRecording() {
			// We are looking at this recording now, not a saved one
			let recording = this.recorder.startRecording()
			this.playback.recording = recording
			// Keep the playback frame synced, unless we are scrubbing
		},

		playbackRecording(rec) {
			this.recorder.stopRecording()
			this.playback.startPlayback(rec)
		},
	},

	watch: {
		recorder() {
			this.startRecording({
				app
			})
			

		},

		"recorder.frameCount"() {
			if (!this.playback.isScrubbing) {
				this.playback.frameIndex = this.recorder.frameCount - 1
			}
		}
	},

	mounted() {
		
		// this.recording = this.recorder.startRecording()
	},

	data() {
		return {
			// recording: undefined
		}
	},
	
	props: ["recorder", "playback"]
})
