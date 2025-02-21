// A reusable way to save and reload stuff (locally for now)
class Settings {
    constructor(prefix) {
        this.tuning = {}
        this.prefix = prefix
        // Load from local storage
        
        let data = JSON.parse(localStorage.getItem(prefix) || "{}")
    }



    
}

