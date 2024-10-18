/**
 * Challenge: We may have lots of kinds of data over time:
 * - discrete events 
 * - regions from a start time to stop time
 * - values sampled at a frame
 * 
 * These can have many different kinds of values
 * - booleans
 * - floating point numbers (in a range)
 * - one of N classifications
 * - strings
 * - dict of values {x,y,z} {h,s,l}
 * - arrays of any of these
 * 
 * We want to use these for
 * - recording data
 * - displaying graphs
 * - editing or adding data
 * - saving and playing back data
 * - machine-learning (export as two flat arrays, for "input" and "labels" (optional))
 * 
 * We may have one or many channels with different data types
 * A lot of this wants to be controllable 
 * ie, data export for ML may want to have different slices as "input" vs labels
 * 
 * Graphical editor
 * Show each channel... but how?
 * each channel may be editable, drawn as a graph/line/events, etc
 **/

class TimeSeries {
	constructor() {
		this.channels = []
		this.frameCount = 0
	}

	addChannel(id) {
		this.channels.push({
			id: id,
			data: []
		})
	}

	recordFrame(recordingFxns, time) {
		this.frameCount++
		/**
		 * Record data for this frame
		 **/
		this.channels.forEach(ch => {
			// if we have a recording function
			let fxn = recordingFxns[ch.id]
			if (fxn) {
				ch.data.push({
					frame: this.frameCount,
					t:time.t,
					value: fxn(time)
				})	
			}
		})
	}

	addPoint(channelID, t, value) {
		let ch = this.channels.find(ch => ch.id === channelID)
		let pt = {
			t,
			value
		}
		console.log(pt)
		ch.data.push(pt)	
	}

	// Construct a data representation
	toData(dataFxns) {
		let data = Object.keys(this.channels).map(id => {
			// Get the result of running the data fxn on this
			return {
				id,
				data: dataFxns[id]?.(this.channels[id])
			}
		})
		return data
	}
	// Set from a data representation
	fromData(dataFxns, data) {
		data.forEach(({id,data})=> {
			// Call the right fxn to set this data
			dataFxns[id]?.(this.channels[id])
		})
	}

	getEvents(t0, t1) {
		// Get all events between two times

	}
}

