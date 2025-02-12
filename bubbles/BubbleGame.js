let VORONOI = new Voronoi();
let AGE_ANIM = 1;
let POP_AGE = 1;

let particleCount = 0;
class BubbleGame extends Game {
  constructor() {
    super();

    (this.activeInstruments = ["bongo", "pianoC"]),
      // All the applicable forces
      (this.forces = [
        {
          id: "push",
          strength: 1,
          apply: ({ pt, fVector, force }) => {
            applyAttractionForce({
              points: this.particles,
              pt,
              fVector,
              range: [1, 200],
              powerFxn({ pct, d, pt0, pt1 }) {
                let boost = 0;

                if (pt1.age < AGE_ANIM)
                  boost = (100 * (AGE_ANIM - pt1.age)) / AGE_ANIM;
                // push based on the radius pushing me
                // return pt1.radius**2 * (1 - pct) ** 5
                return 0.2 * (pt1.radius ** 2 * (1 - pct)) + boost;
              },
            });
          },
        },
        // {
        //     id: "hands",
        //     strength: 1,
        //     apply: ({ pt, fVector, force }) => {
        //         applyAttractionForce({
        //             points: app.handPoints, pt, fVector, range: [0, 150],
        //             powerFxn({ pct, d }) {
        //                 return -.1 * Math.min(d, 100)
        //             }
        //         })
        //     }
        // },
        {
          id: "gravity",
          strength: 1,
          apply: ({ pt, fVector, force }) => {
            fVector.setToDifference(pt, this.center);

            // f.mult(.1)
            let range = 300;
            let m = fVector.magnitude;
            let d = Math.max(0, m - range);
            if (m > 0) {
              fVector.mult((force.strength * 2.3 * d) / m);
            }
          },
        },
        {
          id: "drag",
          strength: 1,
          apply: ({ pt, fVector, force }) => {
            fVector.setToMultiple(-0.9 * force.strength, pt.v);
            // pt.v.mult(1 - .02 * force.strength)
          },
        },
      ]);
  }

  init() {
    this.handPts = app.tracker.hands.map((hand) => hand.landmarks).flat();

    // Make random particles
    this.particles = [];
    Array.from({ length: 20 }, (_, index) => {
      let theta = 2.5 * index ** 0.7;
      let pt = KVector.polar({
        r: 10 * index ** 0.7,
        theta,
        ...this.center,
      });
      this.addParticle(pt);
    });

    console.log("Made", this.particles.length, "particles", this.particles);
  }

  onPlayNote({ key, keyName, source, instrumentName }) {
    if (source === "widget") {
      // Create a new point somewhere
      let pt = this.addParticle({ keyName, instrumentName });
    }
  }

  addParticle({ pt, keyName, instrumentName } = {}) {
    if (!pt)
      pt = new KVector(Math.random() * this.box.w, Math.random() * this.box.h);
    this.upgradeToParticle(pt);

    pt.lifespan = Math.random() * 10 + 1500;

    pt.dragTo = ({ x, y, dragEvent }) => {
      // pt.setTo(x,y)
      // console.log(pt)
      console.log(dragEvent);
      console.log("Drag!" + pt);
    };
    pt.click = () => {
      console.log("Click!" + pt);
      this.popPoint({ pt });
    };

    pt.toString = function () {
      return `${pt.id} ${pt.note.instrumentName} ${pt.note.note}`;
    };

    pt.note = this.getRandomNote({});

    let hue = MUSIC.keyHues[pt.note.pitch];
    // console.log("HUE", pt.note.pitch, hue)
    pt.color = new KVector(
      hue,
      100 - 20 * Math.random(),
      20 + 70 * Math.random()
    );

    this.particles.push(pt);
    return pt;
  }

  get keyboard() {
    return app.keyboards[0];
  }

  getRandomNote({ name, instrumentName } = {}) {
    // Get a valid note in this key
    // In the key, but also in our available list
    // What's our main piano?
    console.log();
    let notes = this.keyboard.activeKey.notes;

    if (name === undefined) {
      let availableNotes = MUSIC.getAvailableNotes(notes);
      name = getRandom(availableNotes);
    }

    let pitch = name.slice(0, -1);
    let octave = name.slice(-1);

    return {
      pitch,
      octave,
      instrument: instrumentName ?? this.getRandomInstrument(),
      name,
    };
  }

  getRandomInstrument() {
    return getRandom(this.activeInstruments);
  }

  drag(mouse) {
    let mousePos = new KVector(mouse.x, mouse.y);
    if (this.mode === "add") {
      this.addPoint(mousePos);
    }
    if (this.mode === "pop") {
      // If the mouse is in a region pop it
      let pt = this.getRegion(mousePos);
      this.selected = pt;
      this.popPoint({ pt: this.selected });
    }
  }

  preUpdate({ t, dt }) {
    // console.log("PREUPDATE")

    app.tracker.activeHands.forEach((hand) => {
      // console.log("PREUPDATE")
      // hand.thumb = hand.landmarks[4]
      // hand.tip = hand.landmarks[8]
      // hand.pinch = KVector.distance(hand.tip, hand.thumb) < 15
      // // Which region are the fingers in
      // console.log(hand.fingerTips)

      // if (hand.pinch) {
      //     let v = new KVector(hand.tip.x, hand.tip.y)
      //     // console.log(pt, v)
      //     this.addPoint(v)
      // } else {
      //     let pt = this.getRegion(hand.tip)

      //     this.popPoint(pt)

      // }

      hand.fingerTips.forEach((tip) => {
        let pt = this.getRegion(tip);
        if (pt) {
            if (!tip.region || tip.region.pt !== pt) {
                // console.log("Enter!", pt)
                // console.log(tip.region)
                tip.region = {
                    pt,
                    timeEntered: app.time.t
                }
            }

            if (tip.region) {
                // console.log(tip, pt)
                tip.region.d = pt.getDistanceTo(tip)
                tip.region.pct = Math.max(0, 1 - tip.region.d/200)
                // console.log(tip.region.d, tip.region.pct )
                this.popPoint({pt: tip.region.pt, source:"fingertip"})
            }
        }
        
       
      });
    });
  }

  postUpdate({ t, dt }) {
    // console.log("POST")
    // Randomize the size
    this.particles.forEach((pt) => {
      // pt.radius = 20 * (noise(t * .05, pt.idNumber) + 1) ** 4 + 4

      // Pop old points
      if (pt.age > pt.lifespan) {
        this.popPoint({ pt, source: "oldage" });
      }
    });
  }

  popPoint({ pt, source }) {
    if (pt && !pt.isDead) {
      pt.radius += 40;
      pt.isDead = true;
      pt.deathStart = app.time.t;

      // console.log(pt.clonePolarOffset({r:10, theta:Math.random()}))
      pt.deathParticles = Array.from({ length: 20 }, (_, index) => {
        let theta = Math.random() * 1000;
        let pt2 = pt.clonePolar({ r: pt.radius * 0.2, theta, dim: 2 });
        pt2.theta = theta;
        pt2.radius = Math.random() * 2 + 3;
        return pt2;
      });
      // console.log("Death partcles", pt.deathParticles)
      // console.log(MUSIC)
      // console.log(app.settings.instrumentName)

      // Play which note?

      app.keyboards[0].play({
        volume: source === "oldage" ? 0.1 : 1,
        source: "pop",
        keyName: pt.note.name,
        instrumentName: pt.instrumentName,
      });
    }
  }

  draw({ p, time }) {
    p.background(0);

    // Draw stars
    for (var i = 0; i < 100; i++) {
      let x =
        (0.5 * noise(i + 1000) + 0.5 + 0.1 * Math.sin(i + time.t * 0.01)) *
        this.box.w;
      let y =
        (0.5 * noise(i + 100) + 0.5 + 0.1 * Math.sin(i + time.t * 0.03)) *
        this.box.h;
      let r = 1 + noise(i, time.t * 0.1);
      p.fill(100);
      p.circle(x, y, r ** 2);
      p.fill(100, 0.1);
      p.circle(x, y, r * 10);
      p.fill(100, 0.03);
      p.circle(x, y, r ** 2 * 20);
    }

    this.particles.forEach((pt) => {
      p.fill(100);
      // pt.draw({p, radius:10})
      //

      // p.background(0)
      // Draw the debug arrows to debug forces
      // p.fill(...pt.color, .2)
      // p.stroke(pt.color[0], pt.color[1], pt.color[2]*.6, 1)

      // Solid region

      // Triangle region
      if (pt.region) {
        //

        if (pt.isDead) {
          p.fill(100);
          pt.deathParticles?.forEach((pt) => {
            pt.draw({ p, radius: pt.radius });
            pt.radius -= 0.1;
            pt.addPolar({ r: pt.radius, theta: pt.theta });
          });

          // console.log(pt.deathParticles.length)
          // p.stroke(100)

          // pt.draw(p, 100)
          // drawRegionAsSpace({ p, center: pt, region: pt.region })
        } else {
          if (this.selected === pt) {
            p.fill(100);
            p.stroke(100);
            drawRegion({ p, center: pt, region: pt.region });
          }

          // Draw the pop
          let pop = 0;
          if (pt.age < AGE_ANIM) {
            // console.log(pt.age)
            let pct = (AGE_ANIM - pt.age) / AGE_ANIM;
            pop = 3 * Math.sin(pct * Math.PI);
            // console.log(pct, pop)
          }
          p.fill(...pt.color.getColor({ shade: -1 + 2 * pop }), 0.2 + pop);
          drawRegion({ p, center: pt, region: pt.region });
          p.noStroke();
          drawAsGem({ p, pt, t: time.t, curve: false });
          p.fill(100);
          // p.text(pt.keyName, pt.x, pt.y)
          // p.text(pt.instrumentName, pt.x, pt.y + 10)
        }
      }
    });

    app.handPoints.forEach((pt) => {
      p.fill(100, 0.2);
      pt.draw({ p, radius: 10 });
    });

    app.tracker.activeHands.forEach((hand) => {
      p.stroke(100, 0.3);
      p.strokeWeight(4);
      p.noFill();

      hand.fingers.forEach((finger) => {
        p.beginShape();
        finger.joints.forEach((joint) => joint.vertex({ p }));
        p.endShape();
      });
      // console.log(hand.tip)
      // if (hand.tip) {

      //     hand.tip?.draw({p, radius:2})

      // }
    });

    app.tracker.activeFingerTips.forEach((tip) => {
      
      if (tip.region) {
        let intensity = 1;
        p.fill(...tip.region.pt.color.getColor(0));
        p.circle(...tip, 40*intensity);

       

        // Glitterstar
        let deathAge = tip.region.deathStart
          ? app.time.t - tip.region.deathStart
          : 0;
       
        // p.fill(100, 100, 100, 0.4);
        // p.beginShape();
        // let count = 40;
        // for (var i = 0; i < count; i++) {
        //   let r = 3 * (2 + noise(i + time.t)) ** 2;
        //   tip.vertex({ p, r, theta: (2 * Math.PI * i) / count });
        // }
        // p.endShape();
      }
    });

    drawDebugParticles({ p, time, particles: this.particles });
  }
}
