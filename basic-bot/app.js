


window.onload = function(e) { 
	console.log("Load!")
	
	

	new Vue({
		template: `
		<div id="app"> 
			<div class="bot-area">

				<!-- this part is just HTML with templating -->
				<div class="header">
					<h1>{{title}}</h1>
					<h2>{{subtitle}}</h2>
				</div>

				<div class="messages" ref="messages">
					<div v-for="message in messages" class="message-row">
						<div class="message" v-html="message" />
					</div>
				</div>

				<div class="footer">
					<button @click="addMessage">more!</button>
					<select v-model="selectedVoice">
						<option v-for="voice in voices">{{voice.name}}</option>
					</select>

					<input type="checkbox" v-model="useVoice" ><label>🗣️</label>
				</div>
			</div>
		</div>`,
		mounted() {
			this.addMessage()

			// Wait for the 'voiceschanged' event to ensure the voices are loaded
		  speechSynthesis.onvoiceschanged = () => {
		    this.voices = speechSynthesis.getVoices();
		  
		    // Example: Log the name and language of each voice
		    this.voices.forEach((voice, index) => {
		      console.log(index + 1, voice.name, voice.lang);
		    });
		  };
	
		},

		computed: {
	
		},

		methods: {
			addMessage() {
				// Generate the text
				let text = this.grammar.flatten("#origin#")

				// Add it to our messages
				this.messages.push(text)

				// Scroll to the bottom
				Vue.nextTick(() => {
							const element = this.$refs.messages;
    		element.scrollTop = element.scrollHeight;
				}) 
		
				// Speak the text!
				if (this.selectedVoice && this.useVoice) {
					speakText(text, this.selectedVoice)
				}
			}
		},

		
		data() {

			return {
				messages: [],
				grammar: tracery.createGrammar(myGrammar),
				subtitle: myBotSubtitle,
				title: myBotTitle,
				voices: [],
				selectedVoice: myBotVoice,
				useVoice: false,
			}
			
		},


		el: "#app",

		
	})

	
}


// From GPT
function speakText(text, voiceName) {
  // Create a new instance of SpeechSynthesisUtterance
  var utterance = new SpeechSynthesisUtterance(text);

  // Get the list of available voices
  var voices = speechSynthesis.getVoices();

  // Find the voice by name
  var selectedVoice = voices.find(voice => voice.name === voiceName);

  // Set the voice of the utterance if found
  if (selectedVoice) {
    utterance.voice = selectedVoice;
  } else {
  	utterance.voice = voices[0]
    console.log("Voice not found:", voiceName, "using", voices[0].name);
    
  }

  // Speak the text
  speechSynthesis.speak(utterance);
}

