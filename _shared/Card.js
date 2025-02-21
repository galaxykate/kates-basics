class Card {
    static count = 0;
    static highestZIndex = 10; // Keep track of the highest z-index

    constructor({ image, data }) {
        this.idNumber = Card.count++;
        this.id = "card" + this.idNumber;
        this.position = new KVector(Math.random() * 500, Math.random() * 400);
        this.image = image;
        this.data = data;
        this.hold = null;
        this.lastInteraction = 0;
        this.angle = 90 * (Math.random() - 0.5);
        this.tilt = [0, 0];
        this.zIndex = 10; // Default z-index
        
    }

    get isHeld() {
        return this.hold !== null;
    }

    get style() {
        let style0 = this.position.cssPosition;
        let scale = this.isHeld ? 1.8 : 1;
        
        let perspective = 800;
        let depth = this.isHeld ? 50 : 0;

        style0.transform = `
            perspective(${perspective}px) 
            rotate3d(1, 0, 0, ${this.tilt.x}deg) 
            rotate3d(0, 1, 0, ${this.tilt.y}deg) 
            translateZ(${depth}px) 
            scale(${scale}, ${scale}) 
            rotate(${this.angle.toFixed(2)}deg)
        `;
        console.log(style0)

        // Ensure highest z-index when held
        style0.zIndex = this.zIndex;

        return style0;
    }

    get classes() {
        return {
            held: this.isHeld
        };
    }

    pickUp({ hold }) {
        this.tilt = {
            x: (Math.random() - 0.5) * 60,
            y: (Math.random() - 0.5) * 60,
        };
        this.angle = 120 * (Math.random() - 0.5);
        this.hold = hold;

        // Increase z-index to be the highest when picked up
        this.zIndex = ++Card.highestZIndex;
    }

    drag({ hold, pos }) {
        this.position.setTo(pos.x - hold.grip.x, pos.y - hold.grip.y);
    }

    drop({ hold }) {
        this.tilt = { x: 0, y: 0 };
        console.log("DROP CARD", this.id);
        this.hold = null;

        // Keep the z-index high but allow other cards to be placed above in future interactions
        this.zIndex = ++Card.highestZIndex;
    }
}

Vue.component("card", {
    template: `<div :id="card.id" :key="card.id" class="card draggable " :style="card.style" :class="card.classes">
        <img class="card-img tarot-img" :src="card.image.src"  draggable="false">
    
    </div>`,
    props: ["card"]
})