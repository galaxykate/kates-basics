
/**
 * A slice of multiple streams of data
 * 
 * It can be set to 
 **/
class DataSlice {
	constructor() {
		this.size = 0
		this.slices = []
		this.currentArray  = undefined
		this.overlayData = undefined
	}

	setOverlay(data) {
		if (data === undefined) {
			console.warn("No data for dataslice, can't set overlay")
			return
		}
		console.log("Overlay", data)
		this.overlayData = data
	}

	clearOverlay() {
		
	}

	addStreamSlice({stream,label,indices,dimensionKeys}) {
		
		// How many indices will this occupy in the final array?
		indices = indices === undefined?[0,stream.length]:indices
		dimensionKeys = dimensionKeys === undefined?stream.dimensionKeys:dimensionKeys
		let length = indices[1] - indices[0]
		let size = length*dimensionKeys.length
		// console.log("Slice ", label, length, size)

		let settings = {
			label,
			stream,
			indices,
			dimensionKeys,
			size,

		}
		let start = this.size
		let end = this.size + settings.size
		settings.dataIndices = [start, end]

		console.log(label, start, end, stream.length, dimensionKeys)

		this.slices.push(settings)
		this.size = end
	}

	update({t,dt}) {

		// Are we pulling the current value from the world, 
		// or setting it to data (e.g. a frame of a recording?)
		// While we have overlay data, write that to the world
		this.applyOverlays()

		this.currentArray = this.createArray()
	}

	applyOverlays() {
		if (this.overlayData) {
			console.log("Apply overlay")
			this.setToData(this.overlayData.data)
		}
	}

	// Create the normalized array for this slice
	createArray() {
		let arrs = this.slices.map((slice,i) => {
			
			// Get the flattened data
			let items = slice.stream.data.slice(...slice.indices).map(item => {
				return slice.stream.schema.normalizeItem(item)
			})
			// console.log(index, items, index.start, index.end, slice.stream.data.length)
			return items.flat()
		})

		
		return arrs.flat()
	}

	setToData(data) {
		if (!data)
			throw("No data provided")
		// Check if this is the right size, etc
		// console.log("expected ", this.size, "got", data.length)

		// Does everyone get their data?
		this.slices.forEach(({
			label,
			stream,
			indices,
			dimensionKeys,
			size,
			dataIndices,
		}, index) => {
			// console.log(index, label, size, indices, dataIndices)
			let subdata = data.slice(...dataIndices)

			// Set items!
			// for (var i = indices[0]; i < indices[1]; i++) {
			// 	stream.data[i].x = 200
			// }
			// stream.data.forEach(item => {

			// })
			let items = stream.data.slice(...indices)
			items.forEach((item,i) => {
				
				
				let dim = dimensionKeys.length
				// console.log(dimensionKeys)

				// Use the schema's knowledge about ranges 
				// 		
				let itemData = subdata.slice(i*dim, (i+1)*dim)
				// console.log(item, itemData)
				// item[0] = 200
				// to set the data from this normalized form
				stream.schema.setItemFromNormalized({
					item:item, 
					data:itemData, 
					dimensionKeys
				})
				
			})


		})
	}
}

class Stream {
	constructor({id, schema,data, count}) {
		this.data = data ? data: schema.createValues(count)
		// console.log(this.toFixed())
		this.schema = schema
		this.id = id
	}

	get length() {
		return this.data.length
	}

	get dim() {
		// TODO figure out dicts
		return this.data[0].length
	}

	get dimensionKeys() {
		return this.schema.dimensionKeys
	}

	toFixed(n) {
		return this.data.map(item => "[" + item.map(v => v.toFixed(n)).join(",") + "]").join("\n")
	}
}
