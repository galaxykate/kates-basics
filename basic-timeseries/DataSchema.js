
class StreamSchema {
	/**
	 * A schema is a way of describing data
	 * You can use it to do various things to a correctly-shaped data object
	 * like 
	 * - create one
	 * - set it to noise, 
	 * - normalize it
	 * - check or constrain the ranges, etc
	 * etc
	 **/

	constructor({ id, count, dim, range = [0, 1], ranges, ItemClass, labels, dimensionKeys }) {
	    this.id = id
	    this.count = count;
	    this.dim = dim;
	    this.ItemClass = ItemClass;
	    this.labels = labels;
	    this.customDimensionKeys = dimensionKeys
	    // Set ranges for each dimension: use provided ranges or default to the given range for all dimensions
	    this.ranges = ranges !== undefined ? ranges : Array.from({ length: this.dim }, () => [...range]);
    	console.log(id, JSON.stringify(this.ranges))
    }

    get dimensionKeys() {
    	if (this.customDimensionKeys)
    		return this.customDimensionKeys
    	return Array.from({ length: this.dim }, (_, i) => i);
    }



	createValues(count) {
		let toCreateCount = this.count=== undefined?count: this.count
		// console.log("Create", this.id, toCreateCount)
		return Array.from({ length: toCreateCount }, (_, j) => {
			if (this.ItemClass)
				return new this.ItemClass()
			// Make a new random array

			let arr = Array.from({ length: this.dim }, (_, i) => 0)
			this.setItemFromNormalized({item:arr, data:arr})
			return arr
			
		});
	}

	validate(data) {

		if (!data) throw("requires values")
		if (!Array.isArray(data))
			throw("data is not an array" + typeof data)

		if (this.count !== undefined && data.length !== this.count)
			throw("data is wrong length: " + data.length + ", not " + this.count)

		// if (!Array.isArray(data[0])) {
		// 	console.log(data[0])
		// 	throw("data is not an array-of-arrays" + typeof data)
		// }

	}

	normalizeItem(item) {
		return item.map((v,i) => remap(v, ...this.ranges[i], 0, 1))
	} 

	setItemFromNormalized({item, data, dimensionKeys}) {
		if (dimensionKeys) {
			for (var i = 0; i < dimensionKeys.length; i++) {
				let dKey = dimensionKeys[i]
				let oldVal = item[dKey]
			
				let newVal = remap(data[i], 0, 1, ...this.ranges[i])
				item[dKey] = newVal
			}
		} else {
			for (var i = 0; i < item.length; i++) {
				item[i] = remap(data[i], 0, 1, ...this.ranges[i])
			}	
		}	

		return item
	}


	toNormalizedArray(data) {		
		// Given an object in this schema, give us a normalize array format of it
		// (e.g, for HSLA(0-360,0-100,0-100,0-1), give an array-of-arrays [0,1])
		
		return data.map(item => this.normalizeItem(item))
	}

	fromNormalizedArray(data, normalizedArr) {		
		// Take each item in normalizedArr and convert it back to the original range
	    return normalizedArr.map((item,index) => 

	        item.map((v, i) => {
	            // Denormalize each value from [0, 1] back to its original range
	            let [min, max] = this.ranges[i];
	            let denormalized = remap(v, 0, 1, min, max);
	            
	            data[index][i] = denormalized
	        })
	    );
		
	}

	setToNoise({data, t=0, offset=0}) {
		this.validate(data)
		
		for (var i = 0; i < data.length; i++) {
			for (var j = 0; j < this.dim; j++) {
				let n = 1*noise(i*20, j*20, t*  (1 + noise(t*.1, i, j)))

				data[i][j] = remap(n, -1, 1, ...this.ranges[j])
			}
		}
		
		// console.log(offset, t, JSON.stringify(values))
	}
}

