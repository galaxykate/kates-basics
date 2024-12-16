
const SCHEMA = {
	trackable: {
		ranges: {
			x: [-10,10],
			y: [-10,10],
			z: [-10,10],
		}
	},
	rgb256: {
		dimensions: 3,
		range: [0, 256],
	},
	hsla360: {
		ranges: [[0,360], [0,100], [0,100], [0,1]],
	},
	fftmusic: {
		count: 100,
		dimensions: 1,
		range: [0,256],	
	}
}

// Cleanup schemas
Object.entries(SCHEMA).forEach(([id,schema]) => {
	schema.id = id

	if (schema.ranges) {
		if (Array.isArray(schema.ranges)) {
			schema.dimensions = schema.ranges.length
			
		} else {
			// Object ranges
			schema.dimensionKeys = Object.keys(schema.ranges);
		}
    }
	schema.dimensions = schema.dimensions ?? schema.dimensionKeys.length 
    schema.dimensionKeys = schema.dimensionKeys ?? Array.from({ length: schema.dimensions }, (_, i) => i);

	// console.log(JSON.stringify(schema, null, 2))
})



class DataStream {
	constructor({id, schema, data, count, source}) {
		this.id = id 
		this.idNumber = Math.floor(Math.random()*1000)
		this.schema = schema
		this.source = source

		// Where do we get the count from?
		this.data = data
		this.count = count ?? schema.count ?? data.count
		
		if (this.data === undefined) {
			// Create our own data for this
			this.data = Array.from({length:this.count}, () => Array.from({length:this.dimensions}, (_,i) => {
				let key = this.dimensionKeys[i]
				let range = this.ranges[key]
				
				return remap(Math.random(), 0, 1, ...range)
			}))
		}	
	}

	setToNoise(t) {

		for (var i = 0; i < this.dimensionKeys.length; i++) {
			let key = this.dimensionKeys[i]
			let range = this.ranges[key]
			for (var j = 0; j < this.count; j++) {
				this.data[j][i] = remap(.5 + 1.5*noise(.03*t*(.50 + .4*Math.sin(t*.03 + j + this.idNumber)), j*100 + i + this.idNumber), 0, 1, ...range)
			}
		}
	}

	get ranges() {
		// Convert the ranges from whatever our shorthand is
		return this.schema.ranges !== undefined ? this.schema.ranges : Array.from({ length: this.dimensions }, () => [...this.schema.range]);	
	}

	get dimensions() {
		return this.schema.dimensions
	}
	get dimensionKeys() {

		return this.schema.dimensionKeys ?? Array.from({length:this.dimensions}, (_,i)=>i)
	}
}

Vue.component("datastreams", {
	template: `<div>
		STREAMS
		<table>
			<tr v-for="stream in streams">
				<td>{{stream.id}}</td>
				<td>{{stream.schema.id}}</td>
				<td>{{stream.count}}</td>
				<td>{{stream.dimensions}}</td>
				<td>Keys:{{stream.schema.dimensionKeys}}</td>
			</tr>
		</table>
	</div>`,
	props: ["streams"]
})