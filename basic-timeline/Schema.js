(function (global) {
    function normalize([min, max], v) {
        return v !== undefined ? (v - min) / (max - min) : 0; // Prevent NaN if v is undefined
    }

    function denormalize([min, max], v) {
        return v * (max - min) + min;
    }

    class Schema {
        /**
         * Constructs a Schema object and unpacks its properties.
         * @param {Object} options - Schema definition.
         */
        constructor(rawSchema) {
            this.rawSchema = rawSchema;
    
            // Validate ID
            if (!rawSchema.id) {
                throw new Error("Schema must have an 'id'.");
            }
            this.id = rawSchema.id;
    
            // Determine if items are objects based on the presence of keys
            this.itemsAreObjects = rawSchema.keys !== undefined;
            this.keys = rawSchema.keys || 
                Array.from({ length: rawSchema.dimensions || (rawSchema.ranges ? rawSchema.ranges.length : 0) }, (_, i) => i);
    
            this.dimensions = this.keys.length;
    
            // Ensure schema defines dimensions
            if (!this.dimensions) {
                throw new Error("Unable to determine dimensions from provided schema.");
            }
    
            // Determine the ranges for each dimension
            if (Array.isArray(rawSchema.ranges)) {
                if (rawSchema.ranges.length !== this.dimensions) {
                    throw new Error("Mismatch between 'ranges' length and determined dimensions.");
                }
                this.ranges = rawSchema.ranges;
            } else if (Array.isArray(rawSchema.range)) {
                this.ranges = Array.from({ length: this.dimensions }, () => rawSchema.range);
            } else {
                throw new Error("Schema must define either 'ranges' or 'range'.");
            }
    
            // Labels are optional; default to an empty array
            this.labels = rawSchema.labels || [];
    
            // Assign colors using a KVector (Hue rotation based on index)
            this.colors = this.keys.map((key, index) => new KVector((29 * index) % 360, 100, 50));
    
            // Additional properties (optional but useful)
            this.defaultValues = rawSchema.defaultValues || Array(this.dimensions).fill(0);
            this.description = rawSchema.description || "No description provided.";
    
          }

        /**
         * Converts object-based data into a normalized array.
         * @param {Array} objectData - The dataset to normalize.
         * @returns {Array} - Normalized array representation of the data.
         */
        objectToNormalizedArrays(objectData) {
            return objectData.map((item) => {
                return this.keys.map((key, index) => {
                    let v = this.itemsAreObjects ? item[key] : item[index]; // Handle object-based and array-based items
                    return normalize(this.ranges[index], v);
                });
            });
        }

        /**
         * Converts a normalized array back to an object dataset.
         * @param {Array} objectData - The dataset to update.
         * @param {Array} normalizedArray - The normalized dataset to restore.
         */
        setDataToNormalizedArray(objectData, normalizedArray) {
            let sections = splitArrayIntoChunks(normalizedArray, this.dimensions)
            objectData.forEach((item, i) => {
                this.setItemToNormalizedArray(item, sections[i]);
            });
        }

        /**
         * Converts a normalized item back to original values.
         * @param {Object|Array} item - The data item to restore.
         * @param {Array} normalizedArray - The normalized values.
         */
        setItemToNormalizedArray(item, normalizedArray) {
            
            this.keys.forEach((key, index) => {
                if (this.itemsAreObjects) {
                    item[key] = denormalize(this.ranges[index], normalizedArray[index]);
                } else {
                    item[key] = denormalize(this.ranges[index], normalizedArray[index]);
                }
            });
        }

        /**
         * Sets object data to noise values.
         * @param {Array} objectData - The dataset to modify.
         * @param {number} offset - Noise seed.
         * @param {Function} noiseFunction - External noise function (assumed globally available).
         */
        setDataToNoise(objectData, offset, noiseFunction = noise) {
            if (typeof noiseFunction !== "function") {
                throw new Error("Missing noise function. Pass a valid noise generator.");
            }

            objectData.forEach((item, i) => {
                let noiseArray = Array.from({ length: this.dimensions }, (_, index) =>
                    .5 + .5*noiseFunction(offset, i * 190 + index * 100)
                );

                this.setItemToNormalizedArray(item, noiseArray);
            });
        }

        getCellBGStyle({key,keyIndex}) {
            let style = {
                backgroundColor: this.colors[keyIndex].toCSS({shade:-.8})
            }
            return style
        }
        getCellFillStyle({key,keyIndex, val}) {
            let pct = normalize(this.ranges[keyIndex], val)
            let style = {
                height: 100*pct + "%",

                backgroundColor: this.colors[keyIndex].toCSS({shade:pct})
            }
            return style
        }

 
        // Static property to store predefined schemas
        static schemas = {
            trackingPoints: new Schema({
                id: "trackingPoints",
                keys: ["x", "y", "z"],
                ranges: [
                    [0, 640],
                    [0, 480],
                    [0, 400],
                ],
            }),
            hsla360: new Schema({
                id: "hsla360",
                labels: ["h", "s", "l", "a"],
                ranges: [
                    [0, 360],
                    [0, 100],
                    [0, 100],
                    [0, 1],
                ],
            }),
            rgb256: new Schema({
                id: "rgb256",
                labels: ["r", "g", "b"],
                ranges: [
                    [0, 256],
                    [0, 256],
                    [0, 256],
                ],
            }),
        };
    }

    global.Schema = Schema;
})(typeof window !== "undefined" ? window : global);
