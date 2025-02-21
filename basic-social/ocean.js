let tileSize = 40
let tileCols = 5
let tileRows = 5
class Ocean {
    constructor() {
        this.id = "ocean"
        // New Ocean game
        /**
         * There will be tiles created acros a huge space , 
         * 
         *  Given any space, we can create their boundaries
         */

        this.center = new KVector(Math.random()*1000, Math.random()*1000)
        this.activeTiles = []
    }
    draw({p, time}) {
        p.push()
        p.translate(-this.center.x + p.width/2, -this.center.y + p.height/2)
        this.activeTiles.forEach(tile => {
            p.fill(...tile.color)
            p.circle(...tile.center, 20)
        })
        p.fill(0)
        p.circle(...this.center, 30)

        p.pop()
    }
    
    update({p, time}) {
        this.center.addPolar({r:1, theta:100*noise(time.t*.0005)})
        this.updateTiles()
        
    }

    start() {
        this.updateTiles()
    }

    getCenterFor(i,j) {
        let pt = new KVector(tileSize*i, tileSize*j)
        if (j%2 == 0)
        pt.x += tileSize*.5
        pt.addPolar({r:tileSize*.2, theta:20*noise(i, j)})
        return pt
    }

    updateTiles() {
        
        let x = Math.round(this.center.x/tileSize)
        let y = Math.round(this.center.y/tileSize)

        
        // console.log(x, y)

        let activeCenters = []
        // Figure out which tiles are on an off screen
        // Check all the tiles around me
        // Rehydrate tiles
        // When a tile's neighbors all exist, calculate its boundaries
    
        for (var i = -tileCols; i < tileCols; i++) {
            for (var j = -tileRows; j < tileRows; j++) {
               let pos = [x+i, y+j]
              
               let center = this.getCenterFor(...pos)
               center
                // console.log(center)
                activeCenters.push({
                    center,
                    pos,
                    color: [noise(...pos)*150, 100, 50]
                })
            }
        }
        this.activeTiles = activeCenters

    }
}

Vue.component("controls-ocean", {
    template: `<div class="section">
			{{ocean.center}}
		</div>`,

        computed: {
            ocean() {
                return this.app.game
            }
        },
    
        props: ["app"]
    })