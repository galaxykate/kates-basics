let pointCount = 0
class Game {
    constructor() {
        this.maxPoints = 30
       
        this.box = app.box
        this.center = new KVector(this.box.x + this.box.w/2, this.box.y + this.box.h/2)
        this.mode = "pop"
        this.selected = undefined
    }

    clearPoints() {
        this.particles = []
    }
    
    getRegion(pt0) {
        return this.voronoiSites.filter(pt => pt.region).find(pt => pt0.inRegion(pt.region))
    }

    init() {
        // Make the particles
        
    }

    get voronoiSites() {
        return this.particles
    }

    updateVoronoi() {
        VORONOI.recycle(this.diagram);
        try {
            this.diagram = VORONOI.compute(this.voronoiSites,
            { xl: this.box.x, xr: this.box.x1, yt: this.box.y, yb: this.box.y1 });
            this.diagram.cells.forEach(({ site, halfedges }) => {
                halfedges.sort((a, b) => a.angle - b.angle)
                site.region = halfedges.map(({ edge }) => {
                    // console.log(edge)
                    return new KVector((edge.lSite === site) ? edge.va : edge.vb)
                })
                if (this.isWeirdRegion(site.region))
                    site.region = []
            })
        } catch(err) {
            console.warn(err)
        }

    }

    update({time}) {
      
        this.preUpdate(time)
        this.updateParticles(time)
        this.updateVoronoi()
        this.postVoronoi(time)
        
    }

    postVoronoi(time) {}


    isWeirdRegion(region) {
       let {minX, minY, maxX, maxY} = region.reduce(
            (acc, point) => {
              return {
                minX: Math.min(acc.minX, point.x),
                maxX: Math.max(acc.maxX, point.x),
                minY: Math.min(acc.minY, point.y),
                maxY: Math.max(acc.maxY, point.y)
              };
            },
            {
              minX: Infinity,
              maxX: -Infinity,
              minY: Infinity,
              maxY: -Infinity
            }
          );
          if (minX < this.box.x0 - 500 || minY > this.box.x1 + 500
            || minX < this.box.x0 - 500 || minY > this.box.x1 + 500)
        return true

        if (Math.abs((maxX - minX) - (maxY - minY)) > 300)
            return true
        return false
    }

    


}

Object.assign(Game.prototype, PARTICLES_MIXIN);
