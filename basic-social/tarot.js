class Tarot {
    constructor() {
        let suits = ["w", "s", "c", "p", "m"];
        suits.forEach((suit) => {
        let count = suit === "m" ? 21 : 14;
        for (var i = 0; i < count; i++) {
            let index = (i + 1 + "").padStart(2, "0");
            let idNumber = app.cards.length;
            app.cards.push(
            new Card({
                image: {
                src: `../_assets/tarot/${suit}${index}.jpg`,
                },
                data: {
                    suit,
                    index: i,
                },
            })
            );
        
        }
        });
    }
}