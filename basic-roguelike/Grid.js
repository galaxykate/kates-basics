// A bunch of stuff in a grid of cells



class Cell {
	constructor({x,y,z,grid}) {
		this.x = x
		this.y = y
		this.z = z
		this.grid = grid
		this.contents = []

		this.color = [x*10, y*10, 100]

		if (Math.random() < .2) {
			this.contents.push({x,y, emoji:getRandom(words.emoji)})
		}
		if (Math.random() < .2) {
			this.contents.push({x,y, emoji:getRandom(words.emoji)})
		}
		if (Math.random() < .2) {
			this.contents.push({x,y, emoji:getRandom(words.emoji)})
		}
		if (Math.random() < .2) {
			this.contents.push({x,y, emoji:getRandom(words.emoji)})
		}
		// console.log(this.contents)
	}

	get isSelected() {
		return this.grid.selected === this
	}

	toText() {
		return this.contents.length
	}
}

class Grid {

	// Make a grid of things
	constructor({width=20,height=20,depth=1}={}) {
		this.width = width
		this.height = height
		this.depth = depth

		// Big array o' arrays
		this.values = Array.from({ length: this.depth }, (_, i) =>
        	Array.from({ length: this.width }, (_, j) =>
            Array.from({ length: this.height }, (_, k) => new Cell({grid:this, x:j,y:k,z:i}))
        ));

        this.selected = undefined
	}

	selectAtScreenPos(pos) {
		let x = Math.floor(pos.x/20)
		let y = Math.floor(pos.y/20)
		// console.log(x, y)
		this.selectCell(this.getCellAt({x, y}))
	} 

	selectRandom() {
		let x = Math.floor(Math.random()*this.width)
		let y = Math.floor(Math.random()*this.height)
		this.selectCell(this.getCellAt({x, y}))
	}

	selectCell(cell) {
		this.selected = cell
	}
	getCellAt({x,y}) {
		if (x < this.width && y < this.height && x >= 0 && y >= 0)
		return this.values[0][x][y]
	}

	toTextLines(layer=0) {

		return this.values[layer].map(row => row.map(cell => cell.toText()).join(" ")).join("\n")
	}

	getCellLocation({i, j, offset={x:0,y:0},cellSize,cellPadding}) {

		return {
			x: offset.x + i*(cellSize + cellPadding),
			y: offset.y + j*(cellSize + cellPadding),
			w: cellSize,
			h: cellSize,
		}
	}

	draw({p, i,j,offset,cellSize, cellPadding}) {
		for (var i = 0; i < this.width; i++) {
			for (var j = 0; j < this.height; j++) {
				let {x,y,w,h} = this.getCellLocation({i,j,offset,cellSize, cellPadding})
				p.fill(0)
				p.rect(x, y, w, h)
			}
		}
	}

	toImage({fxn, canvas}={}) {
		// Create a new canvas element
	    if (!canvas) {
		    canvas = document.createElement('canvas');
		    canvas.width = this.width;
		    canvas.height = this.height;
		}

	    // Get the context for the canvas
	    const ctx = canvas.getContext('2d');

	    // Drawing a simple pattern
	    ctx.fillStyle = 'green';
	    ctx.fillRect(10, 10, 50, 50);

	    ctx.fillStyle = 'red';
	    ctx.fillRect(70, 70, 130, 130);

	    // Optional: Append the canvas to the document if you want it visible
	    // document.body.appendChild(canvas);

	    // Create an image element
	    const img = document.createElement('img');
	    let src = canvas.toDataURL('image/png');
	    // img.src =  // Convert canvas to an image

	    // Append the image to the document
	    return src
	}

	flood({x,y,z}, fillValue, canFill) {

	}
}