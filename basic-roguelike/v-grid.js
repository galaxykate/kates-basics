// Vue components for the grid

Vue.component("grid-view", {
	template: `<div>
		<div class="grid-layer" v-for="(layer,i) in displayLayers" :key="i">
			<div class="grid-row" v-for="(row,j) in layer" :key="j">
				<div class="grid-cell" 
					v-for="(cell,k) in row" :key="k" 
					:style="cellStyle(cell)"
					@mouseenter="enterCell(cell)"
					>
					<div v-for="(item,itemIndex) in cell.contents" :style="contentsStyle(item, itemIndex, cell.contents.length, cell)">{{item.emoji}}</div>

				</div>
			</div>
		</div>
	</div>`,
	computed: {
		displayLayers() {
			return this.grid.values.slice(this.gridSize.displayLayer, this.gridSize.displayLayer+1)
		}
	},

	methods: {
		enterCell(cell) {
			this.grid.selectCell(cell)
			// console.log(cell)
		},
		cellStyle(cell) {
			// console.log({
			// 	gridSize:this.gridSize, 
			// 	i:cell.x, 
			// 	j:cell.y
			// })
			let pos = this.grid.getCellLocation({
				...this.gridSize, 
				i:cell.x, 
				j:cell.y
			})
			
			let posStyle = {
				position: "absolute",
				border: "1px solid hsla(0, 0%, 0%, .1)",
				left: pos.x.toFixed(2) + this.units,
				top: pos.y.toFixed(2) + this.units,
				width: pos.w.toFixed(2) + this.units,
				height: pos.h.toFixed(2) + this.units,
				zIndex: cell.isSelected?100:50
			}

			if (cell.isSelected) {
				posStyle.backgroundColor = "green"
			}
			return posStyle
		},

		contentsStyle(item, index, count, cell) {
			let selected = cell.isSelected

			let dx = selected?index*30 + 10:0
			let dy = selected?index*-5 - 10:0
			let w = (selected?40:this.gridSize.cellSize.toFixed(2)) + this.units
			let fontSize= selected?"30px":"12px";
			let boxShadow = selected?"2px 2px 6px rgba(0, 0, 0, .5)":""
			let bgColor = selected?"hsla(0,100%, 100%, 1)":"hsla(0,100%, 100%, .1)"
			let posStyle = {
				transition: "all ease-in-out .1s",
				position: "absolute",
				backgroundColor: bgColor,
				left: dx + "px",
				top: dy  + "px",
				fontSize,
				boxShadow,
				width: w,
				height: w
			}
			return posStyle
		}
	},
	props: {
		gridSize: {
		default: {

		}
		},
		grid: {

		},
		units: {
		default: "px"
		}
	}
})