
class Recorder { 
    // Handle recordings and playback

    constructor() {
        this.channelMap = []
        this.playback = undefined
        this.activeRecord = undefined
        this.isRecording = false
        this.isPlaying = false
        this.isPaused = false

        this.savedRecords = {}
        
        this.loadSavedRecords()
       
        console.log(`Loaded ${this.savedRecordIDs.length} records`)
    }

    get savedRecordIDs() {
        
        return Object.keys(this.savedRecords)
    }

    async loadData(metadata) {
        return localStorage.getItem("record_frames_"+ metadata.id)
    }

    async loadAndPlay(id) {
        if (!id)
            id = Object.keys(this.savedRecords)[0]

        // Here's the metadata, 
        let metadata = this.savedRecords[id]

        // Load the data
        let frameData = await this.loadData(metadata)
        // Get the raw data frames, is this the size we expect?
        let arr = base64ToFloatArray(frameData)

        
        // Create a playback object to control the playback and hold the mapping
        if (metadata.frameSize*metadata.framecount === arr.length) {
            let frames = splitArrayIntoChunks(arr, metadata.frameSize)
        
            // Ok, now we have frames, time to play them back on the right channels
            // Set the active record to this
            this.activeRecord = {...metadata, frames}
            
            this.playback = {
                metadata,
                index: 0,
                record: this.activeRecord,
                // We need a map from the channels in this 
                channelMapping: metadata.channels.map(recordedChannel => {
                    let ch = this.channelMap.find(controlChannel => controlChannel.channel.id === recordedChannel.id)
                    return {
                        recordedChannel,
                        controlChannel: ch
                    }
                })
            }

            this.isPlaying = true
            this.isRecording = false
        } else {
            console.warn("Wrong size to play back")
        }
        // console.log(metaData, arr)

    }

    async loadSavedRecords() {
        this.savedRecords = {}; // Reset storage
    
        for (let i = 0; i < localStorage.length; i++) {
            let key = localStorage.key(i);
    
            if (key.startsWith("record_meta_")) {
                try {
                    let metaData = JSON.parse(localStorage.getItem(key));
                    this.savedRecords[metaData.id] = metaData
                } catch (error) {
                    console.error(`Error parsing ${key} from localStorage:`, error);
                    this.savedRecords[key] = null; // Indicate corruption
                }
            }
        }
    
        console.log("Records", this.savedRecords, Object.keys(this.savedRecords))

    }

    saveRecord() {
        let record = this.activeRecord

        let metaID = "record_meta_" + record.id
        let frameID = "record_frames_" + record.id

        let { frames, ...metaData } = record; // Extract frames, store the rest as metadata
        
        metaData.framecount = frames.length
        let frameJSON0 = arrayToFixed(frames, 3)
    
        let frameJSON1 = floatArrayToBase64(frames.flat())
        let data1 = base64ToFloatArray(frameJSON1)

        // console/.log(data1)
        let metaJSON = JSON.stringify(metaData)
        console.log("SAVE", record.id, metaJSON.length, "fixed", frameJSON0.length, "b64", frameJSON1.length)
  
        

        
        localStorage.setItem(metaID, metaJSON)
        localStorage.setItem(frameID, frameJSON1)
    }

    update({time}) {
        if (this.isRecording && !this.isPaused) {
            this.recordFrame({record: this.activeRecord, time})
        }

        if (this.isPlaying && !this.isPaused) {

            let record = this.activeRecord
            // Set to this frame
            let frameData = record.frames[this.playback.index]
            // console.log(this.activeRecord)
            // TODO - get the right channels for this particular recording, by id
            // split into the right length for channels
            
            this.playback.index = (this.playback.index + 1)%record.framecount

            this.playback.channelMapping.forEach(({recordedChannel, controlChannel}) => {
                // Get the appropriate slice?
                // console.log("Slice from ", recordedChannel)
                let chData =  frameData.slice(recordedChannel.startIndex, recordedChannel.endIndex)
                controlChannel.channel.setToNormalizedArray(chData)
                
            })

        }
            
    }

    get status() {
        return this.isPaused
    }

    setChannels(channels) {
        let index = 0
        this.channelMap = channels.map(channel => {
            let size = channel.count*channel.schema.dimensions
            let ch = {
                channel,
                isActive: false,
                startIndex: index,
                endIndex: index + size,
                size,

            }
            index += size
            return ch
        })
    }

    startNewRecord() {
        if (this.activeRecord)
            this.stopRecording()

        let title = words.getRandomTitle()
     
        let frameSize = this.channelMap.map(ch => ch.channel.size).reduce((a, b) => a + b, 0)
        
        
        let record = {
            name: title,
            id: toCamelCase(title),
            start: Date.now(),
            stop: undefined,
            frameSize,
            channels: this.channelMap.map(({channel, startIndex, endIndex}) => {
                return {
                    size: channel.size,
                    id: channel.id,
                    schema: channel.schema.rawSchema,
                    startIndex: startIndex,
                    endIndex: endIndex,
                }                
            }),
            
            frames: []
        }
        console.log(record.channels.map(ch => ch.id + " " + ch.startIndex + "-" + ch.endIndex))
        // console.log("Start new recording", title, frameSize, record)
        this.activeRecord = record
        this.isRecording = true
    }

    stopRecording() {
        this.activeRecord = undefined
    }

    recordFrame({record, time}) {
        // Add these channels to the recording
        // console.log(`record ${this.channelsToString()}`)

        let slices = this.channelMap.map(({channel, size}) => {
            // console.log(channel)
            let data = channel.toNormalizedArray().flat()
            // console.log(data.length, size)
            return data
        })
        let fullSlice = slices.flat()
        record.frames.push(fullSlice)
        // console.log(full)
        // Given these channels, get all the current data, and concatenate it into a slice

        // if (record.frames.length % 10 === 0) 
        //     this.saveRecord(record)
    }

    channelsToString() {
        return this.channelMap.map(({channel}) => `${channel.id} (${channel.count}x${channel.schema.dimensions})`).join(",")
    }

    togglePause() {

        this.isPaused = !this.isPaused
        // console.log("pause", this.isPaused)
    }    
}


Vue.component("recorder", {
    template: `<div class="widget recorder-widget">
           
            <div class="controls">
                <button @click="toggleRecording()" >record</button>
                <select @change="loadRecording">
                    <option v-for="record in recorder.savedRecords" :value="record.id">{{record.name}} ({{record.framecount}} frames)</option> 
                </select>
            </div>

             <div v-if="record" class="active-record" :class="{paused:recorder.isPaused,recording:recorder.isRecording}">
            
             <table>
                    <tr><td>{{record.name}}</td><td><span v-if="recorder.playback">{{recorder.playback.index}}/</span>{{record.frames?.length}}</td></tr>
                    <tr><td>
                        <div v-for="channel in record.channels" class="channel-row row">
                            <div>
                                <div class="chip">{{channel.id}}</div>
                            </div>
                           
                        </div>
                    </td></tr>
                    <tr><td>{{record.start}} - {{record.stop}} </td></tr>
                </table>
             </div>

    </div>`,
    mounted() {
        window.addEventListener("keydown", this.handleSaveShortcut);
        
    },
    
    beforeDestroy() {
        window.removeEventListener("keydown", this.handleSaveShortcut);
    },
 
    watch: {

        "recorder.channelMap": {
            immediate:true,
            handler(){
            console.log("Channels changed", this.recorder.channelMap)
            this.recorder.startNewRecord()
            }
        }
    },
    computed: {
        record() {
            return this.recorder.activeRecord
        }
    },
    methods: {
        loadRecording(ev) {
            
            this.recorder.loadAndPlay(ev.target.value)

        },
        toggleRecording() {
            if ( this.recorder.activeRecord) {
                this.recorder.togglePause()
          
            } else {
                this.recorder.startNewRecord()
            }
        },

        handleSaveShortcut(event) {
            if ((event.ctrlKey || event.metaKey) && event.key === "s") {
                event.preventDefault(); // Prevent browser's default "Save Page" action
                this.recorder.saveRecord()
            }
        },
    
      
    },
    props: {
        recorder: {}
    }
})