/**
 * Another crack at reusable serialization
 * 
 * Given a dict of uid-ed objects, with attributes, 
 * and each attribute is a vector or number or string or boolean, or array thereof
 * 
 * First - get a list of all the headers
 * objuid1_propid_index_dim 
 * 
 * Given a header (objuid1_propid_index_dim) set the appropriate prop
 **/



function setProp(world, string, val) {
	let path = string.split("_")
	let obj = world

	// Walk a path, id by id, and set when we run out of path
	for (var i = 0; i < path.length - 1; i++) {
		let key = path[i]

		// Get the thing at this location

		let nextObj = obj.items?.[key] || obj.properties?.[key] || obj[key] 
		if (!nextObj)
			throw("No idea how to go next")
	}
}