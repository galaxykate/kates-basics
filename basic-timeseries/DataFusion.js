
/**
 * A class for handling data fusions
 * it can:
 * - Convert all data to a saveable format (normalized + classes)
 * - Display all data (in whatever what the schemas want)
 * - Load all data from a saveable format
 * 
 * 
 * multiplexes data
 **/

class DataFusion {

    constructor() {
        this.array = [];

        // Slices of data, may contain numbers or classes/strings
        this.sources = [];
        this.size = 0;
    }

    addSlice({ id, indices, dimensionKeys, stream }) {
        // Turn all the indices to [1, 2, 3, ...] if undefined
        if (indices === undefined)
            indices = Array.from({ length: stream.data.length }, (_, i) => i);
        if (indices.start !== undefined)
            indices = Array.from({ length: indices.end - indices.start }, (_, i) => i + indices.start);

        dimensionKeys = dimensionKeys ?? stream.dimensionKeys;

        let size = dimensionKeys.length * indices.length
        this.sources.push({
            id,
            stream,
            dimensionKeys,
            indices,
            size,
            startIndex: this.size,
            endIndex: this.size + size,
            array: Array.from({ length: size }, () => 0),
            hue: (this.sources.length*35)%360
        });

        // Resize the array
        this.size += size
        this.array = Array.from({ length: this.size }, () => 0);
    }

    update() {
        let offset = 0;

        // Update all the arrays with the current data
        this.sources.forEach(source => {
            const { stream, indices, dimensionKeys } = source;

            // Extract the relevant data from the stream for the given indices and dimensionKeys
            indices.forEach(index => {
                dimensionKeys.forEach((key, dimIndex) => {
                    const value = stream.data[index][key]; // Assuming stream.data is an array of objects
                    this.array[offset] = value;
                    offset++;
                });
            });
        });
    }

    setFromArray(arr) {
        if (arr.length !== this.array.length) {
            throw new Error("Input array size does not match the size of the data fusion array.");
        }

        let offset = 0;

        // Distribute this back to all the source streams (in-place)
        this.sources.forEach(source => {
            const { stream, indices, dimensionKeys } = source;

            indices.forEach(index => {
                // Ensure the data structure exists
                if (!stream.data[index]) {
                   throw(`No index ${index} for source ${source.id}`)
                }

                dimensionKeys.forEach((key, dimIndex) => {
                    stream.data[index][key] = arr[offset];
                    offset++;
                });
            });
        });
    }
}


Vue.component("datafusion", {
	template: `<div>
		FUSION
		<table>
			<tr v-for="(source,i) in fusion.sources">
				<td>{{source.id}}</td>
				<td>{{source.stream.id}}</td>
				
				<td>{{source.indices.length}} * {{source.dimensionKeys.join(",")}}={{source.size}}</td>
			</tr>
		</table>

		<div ref="p5" />
	</div>`,

	

	mounted() {
		let w = 3
		let h = 15
		createP5({
			w: 600,
			h: (this.fusion.sources.length+2)*h,
			el: this.$refs.p5,
			draw :(p) => {
				// Update
			

				let arr = this.fusion.array


				drawData({p, x:0, y: 0, data: arr, w,h})
				this.fusion.sources.forEach((source,index) => {
					let x = source.startIndex*w
					p.fill(source.hue, 100, 50, .3)
					p.stroke(source.hue, 100, 50)
					p.rect(x, 0, source.size*w, h*2)

					p.noStroke()
					p.fill(source.hue, 100, 30, 1)
					p.text(source.id, x, h*2)
				})

				let x = 0
				let y = h
				this.fusion.sources.forEach(source => {
					drawData({p, x, y, data: source.array, w,h})
					y += h
				})

			},
			setup: (p) => {
				p.background(40)
			}
		})
	},

	props: ["fusion"]
})
