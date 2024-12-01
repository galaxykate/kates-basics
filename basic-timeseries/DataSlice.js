

class DataSubSlice {
	constructor({id, indices, dimensionKeys}) {
		this.id = id
		this.indices
	}
	get count() {
		return this.indices[1] - this.indices[0]
	}
	get size() {
		return this.count*this.dimensionKeys.length
	}

	apply(object, array) {

	}
}

class DataSlice {
	/**
	 * a class for turning many streams of data into an array (for recording)
	 * and then using those arrays to control/overlay the streams (for playback)
	 **/

	constructor(slices) {

		this.slices = slices.map(slice => new DataSubSlice(this, slice))
	}

	apply(world, array) {
		// split this array into its pieces

		this.slices.forEach(slice => {
			let sliceArray = data.slice(slice.dataStart, slice.dataEnd)

			// Get the right stream
			let obj = world.getObject[slice.id]

		})
	}
}

Vue.component("dataslice", {
	template: `<div>
		<table>
			<tr v-for="subslice in slice">
				<td>{{subslice.id}}
			</tr>
		</table>
	</div>`
})