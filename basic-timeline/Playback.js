function validateChannelCompatibility({channels, data}) {
    console.log(typeof data)
    console.log(`Validate ${channels.length} channels and ${data.length} frames of data`)

    data.forEach(frame => {
        console.log(frame)
    })
}

class Playback {
    /**
     * A set of channels over time
     **/

    constructor() {
        
        this.recording = undefined
        
        this.isPlaying = false

        this.frameRate = 40
        this.t = 0
        this.frameIndex = 0
        this.timeInFrame = 0
        // Where do we find the length of the history?

    }

    get frameCount() {
       
        return this.recording.frames.length
    }

    start({recording, channels}) {
        // What are we playing, and on what channels?
        this.channels = channels
        this.recording = recording
        this.frameIndex = 0
        this.t = 0
        this.isPlaying = true
    }



    //=========================================================
    // Fake data
    

    setToFrame(frameIndex, wrap=false) {
        
        // Clamp and set the frame index
        frameIndex = Math.floor(frameIndex)
        if (wrap)
            frameIndex = (frameIndex + this.frameCount)%this.frameCount
        else 
            frameIndex = Math.min(this.frameCount - 1, Math.max(0, frameIndex))
        
        // Set the channels to the frames data, and anys
        this.frameIndex = frameIndex
        let frame = this.recording.frames[this.frameIndex]
            
        
        this.channels.forEach((ch,index) => {
            let frameChannel = frame.data[index]
            let chData = frameChannel.data
            // console.log(this.frameIndex, index, ch.id, arrayToFixed(chData, 2))
            ch.schema.setToData({target:ch.data, data:chData, normalized:true})
        })

        // Activate any events we pass
        // TODO
    }

    hasFrame(index) {
        
        return index >= 0 && index < this.frameCount
    }

    update({dt}) {
        // if (this.frames) {
        //     let t0 = this.t
        //     let t1 = this.t + dt

        //     this.timeInFrame += dt
        //     while (this.timeInFrame > 1/this.frameRate) {
        //         this.timeInFrame -= 1/this.frameRate
        //         this.setToFrame(this.frame + 1)

        //         // Set all the channels to the new frame data
                
        //         // console.log(this.frame, frameData)
                
        //     }


            
        //     // What frame are we in? did we hit any events along the way?

        //     this.t = t1
        // }
    }

   
 }


