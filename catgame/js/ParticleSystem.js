// Make some particles that are ... rain
// and some are cats
// and some are leaves

// Particle update order
// preUpdate

// postUpdate

class ParticleSystem {

	// What are things that particle systems do?
	// Make starting particles
	// Set the forces
	// Move the particles according to the forces (every system does this the same)
	// Do interactions stuff after moving
	// Draw the particles

	constructor({
		id, count, forces, 
		initParticle, 
		preUpdate, postUpdate, 
		afterMoveParticle, afterMoveSystem, 
		drawParticle, drawSystem
	}) {

		this.id = id

		this.preUpdate = preUpdate
		this.postUpdate = postUpdate
		this.initParticle = initParticle
		this.afterMoveParticle = afterMoveParticle
		this.drawSystem = drawSystem
		this.drawParticle = drawParticle
		this.forces = forces

		this.color0 = "#3498db"
		this.color1 = "#b000b5"
		this.val0 = .5
		this.val1 = .5
		this.t = 0

		this.particles = []

		for (var i = 0; i < count; i++) {

			// Make this particle
			this.addParticle()
		}

		this.flags = {
			drawForces: false
		}

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
			force.init?.({pt,system:this,index})
  			forceVector.force = force
  			return forceVector
		})
		


		this.initParticle({pt, system: this, index:this.particles.length})

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