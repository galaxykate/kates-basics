class ShipsGame {
    // Play as waves...or something

    // Layer many waves


    constructor() { 
        this.waves = Array.from({length: 1}, (_, index) => new Wave({baseY:index*100, w:app.box.w}))
        
        // Each waves point is attracted to its base point
        Object.assign(this, PARTICLES_MIXIN)
    }

    get particles() {
        return this.waves.map(wave => wave.points).flat()
    }

    get touchables() {
        return this.waves.map(wave => wave.points.map(pt => pt.dependents).flat()).flat()
    }

    update({p, time}) {
        this.waves.forEach(w => {
            
            w.points.forEach((pt,index) => {
                let r = .1
                let theta = 40*noise(pt.idNumber, time.t*.001)
                if (!pt.dependents.some(pt => pt.isHeld)) {
                    pt.addPolar({r, theta})
                    pt.updatePosition()
                }
            })
            easeCurve({pts:w.points})
        })
    }

    draw({p}) {
        // Draw
        this.waves.forEach(wave => wave.draw({p}))
        // p.mouse.drawDebug({p})
        
        this.particles.forEach(pt => pt.draw({p, radius: 30}))
        drawDebugParticles({p:this.p, particles:this.particles})
    }
}

class Wave {

    constructor({baseY, w}) {
        let count = 10
        this.points = Array.from({length:count}, (_, index) => {
            let x = w*index/(count - 1)
            let y = 100*Math.random() + baseY
            let pt = new CurvePoint({x,y})
            Object.assign(pt, DRAGGABLE_MIXIN)
            Object.assign(pt.cp0, DRAGGABLE_MIXIN)
            Object.assign(pt.cp1, DRAGGABLE_MIXIN)
            pt.basePoint = new KVector({x,y})
            return pt
        })
        // console.log(this.toString(), this.points.map(pt => pt.toString()))
    }

    draw({p}) {
        this.points.forEach(pt => pt.draw({p, radius: 10}))
        drawCurve({p, pts:this.points})
        // drawHandles({p, pts:this.points})

        let pt0 = new KVector()
        drawRibbon({p, 
            count: 90,
            pts: this.points, 
            startSide(side) {
                p.fill(320 - side*100, 100, 50)
            },
            endSide() {

            },
            forPt(side, {pt,pct,normal}) {
                
                // console.log(pt)
                pt0.setTo(pt)
                pt0.draw({p, radius: 4, vMult:14, v: normal})
            },
         
        })
    }

}