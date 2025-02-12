let channelCount = 0
class Channel {
    /**
     * Manages structured data connections based on schemas.
     */
    constructor({ id, schema, schemaName, count = 1, dataObject, ItemClass }) {
        this.id = id;
        this.idNumber = channelCount++

        // Determine schema
        if (schemaName) {
            if (!Schema.schemas[schemaName]) {
                throw new Error(`Schema '${schemaName}' not found in Schema.schemas.`);
            }
            this.schema = Schema.schemas[schemaName];
        } else if (schema instanceof Schema) {
            this.schema = schema;
        } else if (typeof schema === "object") {
            this.schema = new Schema(schema);
        } else {
            throw new Error("Invalid schema provided.");
        }

        this.count = count;
        // console.log("CHANNEL", id, this.count, this.schema.id);

        // Attach to an existing data object or create a new one
        if (Array.isArray(dataObject)) {
            this.dataObject = dataObject;
            this.count = dataObject.length;
        } else {

            this.dataObject = Array.from({ length: this.count }, () =>
                ItemClass ? new ItemClass() : Array.from({ length: this.schema.dimensions }, () => 0)
            );

            this.setToNoise(Math.random()); // Provide default noise function
        }

        // console.log("Setup schema:", this.schema, this.dataObject);
        // console.log(this.auditData());
    }

    get range() {
        
        return this.schema.keys.map((key) => [
            Math.min(...this.dataObject.map(item=> item[key])), 
            Math.max(...this.dataObject.map(item=> item[key]))
        ])
    }

    get size() {
        return this.count * this.schema.dimensions
    }

    toNormalizedArray() {
       return this.schema.objectToNormalizedArrays(this.dataObject) 
    }

    setToNormalizedArray(data) {
       this.schema.setDataToNormalizedArray(this.dataObject, data)
    }

    /**
     * Sets data values to noise.
     */
    setToNoise(t = 0) {
        this.schema.setDataToNoise(this.dataObject, t);
    }

    /**
     * Audits the current dataObject against the schema.
     */
    auditData() {
        const issues = [];
        const stats = Array.from({ length: this.schema.dimensions }, () => ({
            min: Infinity,
            max: -Infinity,
            sum: 0,
            validCount: 0,
        }));

        let totalItemCount = this.dataObject.length;
        let hasKeys = this.schema.keys?.length > 0;

        this.dataObject.forEach((item, itemIndex) => {
            let values = hasKeys ? this.schema.keys.map((key) => item[key]) : item;

            if (!Array.isArray(values) || values.length !== this.schema.dimensions) {
                issues.push(`Item ${itemIndex} has incorrect dimensions. Expected ${this.schema.dimensions}, found ${values.length}`);
                return;
            }

            values.forEach((value, dimIndex) => {
                const [minRange, maxRange] = this.schema.ranges[dimIndex];

                if (typeof value !== "number" || isNaN(value)) {
                    issues.push(`Item ${itemIndex}, Dimension ${dimIndex}: Invalid number`);
                    return;
                }

                if (value < minRange || value > maxRange) {
                    issues.push(`Item ${itemIndex}, Dimension ${dimIndex}: Value ${value} out of range [${minRange}, ${maxRange}]`);
                }

                // Update statistics
                const stat = stats[dimIndex];
                stat.min = Math.min(stat.min, value);
                stat.max = Math.max(stat.max, value);
                stat.sum += value;
                stat.validCount += 1;
            });
        });

        // Compute averages
        stats.forEach((stat) => {
            stat.average = stat.validCount > 0 ? stat.sum / stat.validCount : null;
            delete stat.sum;
        });

        console.log(`Audit Report for Schema '${this.schema.id}':`);
        console.log(`Total Items: ${totalItemCount}`);
        console.log(`Issues Found: ${issues.length}`);
        issues.forEach((issue) => console.warn("⚠️ " + issue));

        return { totalItemCount, issues, stats };
    }

    toFixed(n) {
        return arrayToFixed(this.dataObject, n);
    }
}


Vue.component("channel-view", {
    template: `<tr>
        <td>{{channel.id}}</td> 

        <td>
            <div>   <div>{{channel.startIndex}}-{{channel.endIndex}}</div>
                <div class="item" v-for="(item,itemIndex) in channel.dataObject">
                    
                    <div class="bargraph horizontal">
                        <div  class="cell"  
                            v-for="key,keyIndex in channel.schema.keys"
                            :style="channel.schema.getCellBGStyle({key,keyIndex})"
                             >

                            <div class="fill" 
                                :style="channel.schema.getCellFillStyle({key,keyIndex,val:item[key]})"></div>
                                
                        </div>
                     
                      
                    </div>
                </div>
            </div>
        </td>
    </tr>`,

    computed: {
        channel() {
            return this.channelSettings.channel
        }
    },

    props: {
        channelSettings: {}
    }
})