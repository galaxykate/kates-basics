class WaterClock {
  /**
   * This class can have lots of different event listeners.
   * May have thresholds and the amount of leeway for going up or down.
   **/
  constructor(options = {}) {
    this._value = 0;  // Initialize the internal value
    this.lastValue = this._value;
  }

  get value() {
    return this._value;
  }

  set value(newValue) {
    if (newValue !== this._value) {
      console.log(`Value changed from ${this._value} to ${newValue}`);
      this.lastValue = this._value; // Update lastValue before changing to new value
      this._value = newValue;
      this.update(); // Call the update method whenever the value changes
    }
  }

  update() {
    // Actions to take on updating the value can be defined here
    console.log(`Updated value to ${this._value}`);
    // This could be where you trigger events, handle thresholds, etc.
  }

  valueOf() {
    return this._value;
  }

  toString() {
    return `WaterClock(${this._value})`;
  }

  add(number) {
    this.value += number; // Uses the setter to update and log changes
    return this;
  }

  subtract(number) {
    this.value -= number; // Uses the setter to update and log changes
    return this;
  }

  multiply(number) {
    this.value *= number; // Uses the setter to update and log changes
    return this;
  }

  divide(number) {
    if (number === 0) {
      throw new Error("Cannot divide by zero.");
    }
    this.value /= number; // Uses the setter to update and log changes
    return this;
  }

  power(exponent) {
    this.value **= exponent; // Uses the setter to update and log changes
    return this;
  }
}
