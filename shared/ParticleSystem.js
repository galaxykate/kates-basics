// Make some particles that are ... rain
// and some are cats
// and some are leaves

// Particle update order
// preUpdate

// postUpdate



class ParticleUniverse {
	// Can contain particle systems and edges

	constructor() {
		this.systems = []

	}

	getInRange({x,y,range, max}) {

		// Get a big list of all objects and sort by distance
		let distances = this.interactables.map(obj => {
			return {
				obj,
				d: obj.getDistanceTo({x,y})
			}
		}).filter(d => d.d < range)

		distances = distances.sort((d0, d1) => d0.d - d1.d)
		// console.log(distances.map(d => d.d))
		console.log(range, max, this.interactables.length, distances)
		return distances.slice(0,max)
	}


	get interactables() {
		let objs = this.systems.map(system => system.interactables).flat()
		return objs
	}

	update({p, t, dt}) {
		this.systems.forEach(system => system.update({t, dt, p}))
	}

	draw({p}) {
		// Draw all the particle systems
		
		this.systems.forEach(system => {
			if (system.flags.drawForces)
				system.drawForces({p})
		})
		this.systems.forEach(system => system.draw({p}))
	}
}


class ParticleSystem {

	// What are things that particle systems do?
	// Make starting particles
	// Set the forces
	// Move the particles according to the forces (every system does this the same)
	// Do interactions stuff after moving
	// Draw the particles

	constructor({
		p, // TODO - some way to express the size and mouse pos
		id, count, forces, 
		initSystem, initParticle, 
		preUpdate, postUpdate, 
		afterMoveParticle,
		drawParticle, drawSystem
	}) {

		this.p = p

		this.id = id

		this.preUpdate = preUpdate
		this.postUpdate = postUpdate
		this.initParticle = initParticle
		this.initSystem = initSystem
		this.afterMoveParticle = afterMoveParticle
		this.drawSystem = drawSystem
		this.drawParticle = drawParticle
		this.forces = forces

		this.color0 = "#3498db"
		this.color1 = "#b000b5"
		this.t = 0

		this.particles = []

		for (var i = 0; i < count; i++) {

			// Make this particle
			this.addParticle()
		}

		this.flags = {
			drawForces: false
		}

		this.initSystem({p,system:this})

	}

	get interactables() {
		return this.particles
	}

	addParticle({cloneParticle}={}) {
		let pt = new KVector(0,0)
		pt.idNumber = this.particles.length
		pt.velocity = new KVector(0,0)
		pt.totalForce = new KVector(0,0)
		pt.forces = []

		// Give each particle a Vector to store each force
		pt.forces = this.forces.map((force, index) => {
			let forceVector = new KVector(0,0)
			force.init?.({p, pt,system:this,index})
  			forceVector.force = force
  			return forceVector
		})
		


		this.initParticle({p: this.p, pt, system: this, index:this.particles.length})

		if (cloneParticle) {
			// Copy the parent's velocity and position
			pt.velocity.setTo(cloneParticle.velocity)
			pt.setTo(cloneParticle)
		}


		// Add to my particles!!!!
		this.particles.push(pt)
		return pt
	}

	update({t, dt}) {


		// Update my time!
		this.t += dt

		this.preUpdate?.({system:this})

		// Particle update -> 
		// calculate forces, move, do post-move stuff
		this.particles.forEach((pt,index) => {
			// Go through each force in the particle system, 
			// and update the particles personal vector for it
			this.forces.forEach((force, forceIndex) => force.calculate({
				pt,
				index,
				system:this,
				forceVector:pt.forces[forceIndex],
			}))
		})
		
		this.particles.forEach(pt => {
			// TODO Update velocity and then move

			// Get total force based on all individual forces
			pt.totalForce.mult(0)
			pt.forces.forEach(f => pt.totalForce.add(f))

			// v += f*dt
			pt.velocity.addMultiple(pt.totalForce, dt)
			
			// pos += v*dt
			pt.addMultiple(pt.velocity, dt)
		})

		this.particles.forEach((pt,index) => this.afterMoveParticle?.({system:this, pt, t, index}))


		this.postUpdate?.({system:this})
	}

	draw({p}) {
		// console.log("Draw system", this)
		this.drawSystem({p})
		this.particles.forEach(pt => this.drawParticle({pt, p, system:this}))
	}

	drawForces({p}) {
		
		this.particles.forEach(pt => {
			// Draw the arrow for this force
			pt.forces.forEach(forceVector => {
				pt.drawArrow({
					p, 
					v:forceVector, 
					multiplyLength:100, 
					normalOffset:0,  
					startOffset:0, 
					endOffset:0, 
					color:forceVector.force.color
				}) 
			})
		
		})
	}
	

}