// UTILITIES

class Schema {
	constructor({ id, count, dim, range = [0, 1], ranges, ItemClass, labels }) {
	    this.id = id
	    this.count = count;
	    this.dim = dim;
	    this.ItemClass = ItemClass;
	    this.labels = labels;
	    
	    // Set ranges for each dimension: use provided ranges or default to the given range for all dimensions
	    this.ranges = ranges !== undefined ? ranges : Array.from({ length: this.dim }, () => [...range]);
    	console.log(id, JSON.stringify(this.ranges))
    }


	createValues() {
		return Array.from({ length: this.count }, () =>
			this.ItemClass
				? new this.ItemClass()
				// Make a new random array
				: Array.from({ length: this.dim }, (_, i) => {
						remap(Math.random(), ...this.ranges[i], 0, 1)
				  })
		);
	}


	toNormalizedArray(values) {
		// Given an object in this schema, give us a normalize array format of it
		// (e.g, for HSLA(0-360,0-100,0-100,0-1), give an array-of-arrays [0,1])

		return values.map(item => item.map((v,i) => {
			return remap(v, ...this.ranges[i], 0, 1)
		}))
	}

	setToNoise(values, t=0, offset=0) {

		for (var i = 0; i < this.count; i++) {
			for (var j = 0; j < this.dim; j++) {
				let n = noise(i + offset, j + offset, t)
				values[i][j] = remap(n, -1, 1, ...this.ranges[i])
			}
		}

		console.log(offset, t, JSON.stringify(values))
	}
}

//=======================================================
// Fuse multiple streams of data

class DataFusionStream {
	constructor({ id, schema, values }) {
		this.schema = schema;
		this.id = id;
		this.idNumber = Math.floor(Math.random() * 1000);
		this.values = values || this.schema.createValues();

		if (!this.schema) console.warn(id, "No schema attached");
	}



	setToNoise(t, offset) {
		this.schema.setToNoise(this.values, t + offset)
	}



	draw({ p, x = 0, y = 0, size = 10 }) {
		const box = { x, y, w: this.schema.count * size, h: this.schema.dim * size };
		p.fill(0);
		p.text(`id: ${this.id}`, 5, y);
		

		let slice = this.schema.toNormalizedArray(this.values)

		slice.forEach((row, i) =>
			row.forEach((v, j) => {
				if (v !== undefined) {
					p.fill(v * 100);
					p.rect(size * i, y + size * j, size, size);
				}
			})
		);

		return box;
	}


}

class DataFusion {
	constructor() {
		this.streams = [];
	}

	addStream(streamSetup) {
		const stream = new DataFusionStream(streamSetup);
		this.streams.push(stream);
		return stream;
	}

	setToNoise(t) {
		this.streams.forEach(stream => stream.setToNoise(t, stream.idNumber));
	}

	draw({ p, w, h }) {
		p.fill(100);
		p.rect(0, 0, w, h);
		let y = 20;
		let size = 10;

		this.streams.forEach(stream => {
			const box = stream.draw({ p, x: 0, y });
			y += box.h + 18;
		});
	}
}

Vue.component("datafusion", {
	template: `<div>
		<div>
			<datafusion-stream v-for="stream in fusion.streams" :key="stream.id" :stream="stream" />
		</div>
	</div>`,
	props: { fusion: { required: true } }
});

Vue.component("datafusion-stream", {
	template: `<div>
		id: {{ stream.id }}
		Schema: {{ stream.schema }}
	</div>`,
	props: { stream: { required: true } }
});
