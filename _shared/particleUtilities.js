
const PARTICLES_MIXIN = {
    maxParticles: 300,
    
        // Upgrade this point without overwriting existing properties
    upgradeToParticle(pt) {
        pt.idNumber = pt.idNumber ?? pointCount++;
        pt.id = "PT_" + pt.idNumber 
        pt.radius = pt.radius ?? 20;
        pt.v = pt.v ?? new KVector(0, 0);
        pt.totalForce = pt.totalForce ?? new KVector(0, 0);
        
        // Ensure forces array exists with 7 elements
        if (!pt.forces) {
            pt.forces = Array.from({ length: 7 }, () => new KVector());
        }

        pt.age = pt.age ?? 0;
        
        // Assign a random color if not already assigned
        if (!pt.color) {
            let h = Math.random() * 360;
            pt.color = new KVector(h, 100 * Math.random() ** 2, 0);
        }

   
    },



    updateParticles(time) {
       
        this.preUpdateParticles(time)
        this.updateParticleForces(time)
        this.moveParticles(time)

        this.particles.forEach(pt => {
            if (pt.isDead)
                pt.radius -= 1
            if (pt.radius < 1)
                pt.deleted = true
        })
        this.particles = this.particles.filter(pt => !pt.deleted)
        this.postUpdate(time)
        
    },

    preUpdateParticles(time) {},
    postUpdateParticles(time) {},
    
    updateParticleForces({t, dt}) {
       
        this.particles.forEach(pt => {
            pt.age += dt
            pt.totalForce.mult(0)
            this.forces.forEach((force, index) => {
                
                // Apply all the forces
                let fVector = pt.forces[index]
            
                force.apply({ pt, fVector, force, t })
                if (fVector.isValid)
                    pt.totalForce.add(fVector)
                else {
                    console.log("Bad vector", fVector, force.id)
                }
            })

        })
    },

    moveParticles({dt}) {

        this.particles.forEach(pt => {
            pt.v.addMultiple(pt.totalForce, dt)
            pt.addMultiple(pt.v, dt)
        })
    }
}


function applyAttractionForce({ pt, points, fVector, range, powerFxn }) {
    fVector.mult(0)

    // Add an attraction to all these points
    points.forEach(pt1 => {

        let dx = pt.x - pt1.x
        let dy = pt.y - pt1.y
        let d = Math.sqrt(dx ** 2 + dy ** 2)
        let pct = (d - range[0]) / (range[1] - range[0])
        // 
        if (pct >= 0 && pct <= 1) {
            // console.log(d, pct)
            let theta = Math.atan2(dy, dx)

            let power = powerFxn({pct, d, pt1, pt0:pt})
            fVector.addPolar({ r: power, theta })
        }


    })
}

function drawAsGem({p, t, pt, shade, curve=false}) {
    p.fill(...pt.color.getColor({shade:-.7}), .3)
    drawRegion({p, center:pt, region:pt.region, curve,     
        lerpFxn({pt, theta}) {
            return -.1*Math.sin(theta)
    },})

    if (curve) {
        drawRegion({p, center:pt, region:pt.region, curve,     
            lerpFxn({pt, theta}) {
                return .1 + -.1*Math.cos(theta)
        },})
    } else {
        drawTriangleRegion({p, center:pt, region:pt.region,
            lerpFxn({pt, theta}) {
                return .2
            },
            fillFxn({pt0, theta0}) {
                let pastel = noise(theta0, t*.01 + .01*pt.x)
                return [...pt.color.getColor({shade:pastel}), .4]
            }})
    }
  

    p.fill(...pt.color.getColor({shade:.4}), .3)
    drawRegion({p, center:pt, region:pt.region, curve,     
        lerpFxn({pt, theta}) {
            return .5 + .2*Math.sin(theta)
    },})
}


function drawRegionAsSpace({p, center, region, lerpFxn, curve}) {
    p.beginShape()

    // let region1 = region
    // if (curve) {
    //     region1.push(region[0])
    //     region1.push(region[1])
    // }
        
    
    region.forEach((v,i) => {
       
        let theta = center.getAngleTo(v)
        let lerp = lerpFxn?lerpFxn({pt:center, v, theta:theta}):0
      
        v.vertex({p, lerpTo:center, lerpPct:lerp, theta, curve})
    })
    p.endShape()
} 



function drawDebugParticles({particles,  p, time }) {
    particles.forEach(pt => {
        if (app.flags.debugArrows) {
            pt.drawArrow({p, v:pt.v, multiplyLength:10, color:[100, 100, 50]}) 
            pt.drawArrow({p, v:pt.totalForce, multiplyLength:10, color:[100, 100, 50]}) 
            pt.forces.forEach((f, index) => {
                if (f.magnitude> 0)
                    pt.drawArrow({ p, v: f, multiplyLength: 2, color: [index * 30, 100, 50] })
            })
        }
    })
}


function drawRegion({p, center, region, lerpFxn, curve}) {

    let region1 = region.slice()
    if (curve && region.length > 0) {
        region1.push(region[0])
        region1.push(region[1])
        // region1.push(region[2])
    }
        
    // console.log(curve)
    p.beginShape()
    region1.forEach((v,i) => {
       
        let theta = center.getAngleTo(v)
        let lerp = lerpFxn?lerpFxn({pt:center, v, theta:theta}):0
       
        v.vertex({p, lerpTo:center, lerpPct:lerp, theta, curve: i === 0?curve:false})
    })
    p.endShape(p.CLOSE)
} 

function drawTriangleRegion({p, center, region, fillFxn, strokeFxn, lerpFxn}) {
    for (var i = 0; i < region.length; i++) {
        let v = center
        let v0 = region[i]
        let v1 = region[(i + 1)%region.length]
        let theta0 = v.getAngleTo(v0)
        let theta1 = v.getAngleTo(v1)
        let lerp0 = lerpFxn?lerpFxn({pt:v0, theta:theta0}):0
        let lerp1 = lerpFxn?lerpFxn({pt:v0, theta:theta0}):0
       
        if (fillFxn)
            p.fill(fillFxn({theta0, center, v0, v1}))
        if (strokeFxn)
            p.stroke(strokeFxn({theta0, center, v0, v1}))
        p.beginShape()
        v.vertex({p})
        v0.vertex({p, lerpTo:v, lerpPct:lerp0})
        v1.vertex({p, lerpTo:v, lerpPct:lerp1})
        p.endShape()
    }
}