function createCity({p}) {
	let citySystem = new ParticleSystem({
		p,
		id:"city", 
		count:20, 
		forces: [], 
		initSystem({p, system}) {
			// Create edges
			this.graph = new Graph({nodes: this.particles})
		},

		initParticle({pt, p, system}) {
			// nice radial layout
			pt.setToPolarOffset({
				x: p.width/2,
				y: p.height/2,
				z: 0,
				r: 70*pt.idNumber**.55 + 10, 
				theta: 2.3*pt.idNumber**.6
			})
		}, 
		
		preUpdate({p, system}) {
			this.graph.update()
		},

		postUpdate({p, system}) {
			this.graph.update()
			// console.log("post")
			// this.graph 
		},

		// afterMoveParticle({pt, p, system}) {
		// }, 
		
		drawParticle({pt, p, system}) {
			p.circle(pt.x, pt.y, 20)
		}, 
		drawSystem({p, system}) {
			this.graph.draw({p})

			p.fill(0)
			p.noStroke()
			p.circle(0, 0, 200)
			// console.log(this)
			
		}
	})

	

	
	return citySystem
}