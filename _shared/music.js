/* globals Vue, p5, tasks, CONTOURS, Vector2D, ml5, recorder, predictionToClassification, MUSIC */

/**
 * Assorted musical utilities from Galaxykate
 globals: p, p5
 **/
const MUSIC = (function () {
  function getRandom(arr) {
    return arr[Math.floor(arr.length * Math.random())];
  }

  const CHORDS = {
    "C Major": ["C", "E", "G"],
    "D Major": ["D", "F#", "A"],
    "E Major": ["E", "G#", "B"],
    "F Major": ["F", "A", "C"],
    "G Major": ["G", "B", "D"],
    "A Major": ["A", "C#", "E"],
    "B Major": ["B", "D#", "F#"],
    "A# Major": ["A#", "D", "F"],  // Added
    "D# Major": ["D#", "G", "A#"],  // Added
    "C# Major": ["C#", "F", "G#"],
    "F# Major": ["F#", "A#", "C#"],
    "G# Major": ["G#", "C", "D#"],


    "C Minor": ["C", "D#", "G"],
    "D Minor": ["D", "F", "A"],
    "E Minor": ["E", "G", "B"],
    "F Minor": ["F", "G#", "C"],
    "G Minor": ["G", "A#", "D"],
    "A Minor": ["A", "C", "E"],
    "B Minor": ["B", "D", "F#"],
    "C# Minor": ["C#", "E", "G#"],
    "D# Minor": ["D#", "F#", "A#"],
    "F# Minor": ["F#", "A", "C#"],
    "G# Minor": ["G#", "B", "D#"],
    "A# Minor": ["A#", "C#", "F"],

    "C7": ["C", "E", "G", "A#"],
    "D7": ["D", "F#", "A", "C"],
    "E7": ["E", "G#", "B", "D"],
    "F7": ["F", "A", "C", "D#"],
    "G7": ["G", "B", "D", "F"],
    "A7": ["A", "C#", "E", "G"],
    "B7": ["B", "D#", "F#", "A"],
    "C#7": ["C#", "F", "G#", "B"],
    "F#7": ["F#", "A#", "C#", "E"],
    "G#7": ["G#", "C", "D#", "F#"],
    "D#7": ["D#", "G", "A#", "C#"],
    "A#7": ["A#", "D", "F", "G#"],

    "C Major 7": ["C", "E", "G", "B"],
    "D Major 7": ["D", "F#", "A", "C#"],
    "E Major 7": ["E", "G#", "B", "D#"],
    "F Major 7": ["F", "A", "C", "E"],
    "G Major 7": ["G", "B", "D", "F#"],
    "A Major 7": ["A", "C#", "E", "G#"],
    "B Major 7": ["B", "D#", "F#", "A#"],
    "C# Major 7": ["C#", "F", "G#", "C"],
    "D# Major 7": ["D#", "G", "A#", "D"],
    "F# Major 7": ["F#", "A#", "C#", "F"],
    "G# Major 7": ["G#", "C", "D#", "G"],
    "A# Major 7": ["A#", "D", "F", "A"],

    "C Minor 7": ["C", "D#", "G", "A#"],
    "D Minor 7": ["D", "F", "A", "C"],
    "E Minor 7": ["E", "G", "B", "D"],
    "F Minor 7": ["F", "G#", "C", "D#"],
    "G Minor 7": ["G", "A#", "D", "F"],
    "A Minor 7": ["A", "C", "E", "G"],
    "B Minor 7": ["B", "D", "F#", "A"],
    "C# Minor 7": ["C#", "E", "G#", "B"],
    "D# Minor 7": ["D#", "F#", "A#", "C#"],
    "F# Minor 7": ["F#", "A", "C#", "E"],
    "G# Minor 7": ["G#", "B", "D#", "F#"],
    "A# Minor 7": ["A#", "C#", "F", "G#"],

    "Cdim": ["C", "D#", "F#"],
    "Ddim": ["D", "F", "G#"],
    "Edim": ["E", "G", "A#"],
    "Fdim": ["F", "G#", "B"],
    "Gdim": ["G", "A#", "C#"],
    "Adim": ["A", "C", "D#"],
    "Bdim": ["B", "D", "F"],

    "D Minor 7♭5": ["D", "F", "G#", "C"],
    "E Minor 7♭5": ["E", "G", "A#", "D"],
    "F# Minor 7♭5": ["F#", "A", "C", "E"],
    "B Minor 7♭5": ["B", "D", "F", "A"],
    "G# Minor 7♭5": ["G#", "B", "D", "F#"]
};


const KEYS = {
  "C Major": {
      name: "C Major",
      base_note: "C",
      notes: ["C", "D", "E", "F", "G", "A", "B"],
      chords: {
          tonic: "C Major",
          dominant: "G Major",
          subdominant: "F Major",
          relative_minor: "A Minor",
      },
      progressions: {
          pop: ["C Major", "G Major", "A Minor", "F Major"],
          jazz: ["D Minor 7", "G7", "C Major 7"],
          blues: ["C7", "F7", "G7"],
      },
      description: "Gay and warlike",
      color: [0, 85, 60],
  },
  "D Major": {
      name: "D Major",
      base_note: "D",
      notes: ["D", "E", "F#", "G", "A", "B", "C#"],
      chords: {
          tonic: "D Major",
          dominant: "A Major",
          subdominant: "G Major",
          relative_minor: "B Minor",
      },
      progressions: {
          pop: ["D Major", "A Major", "B Minor", "G Major"],
          jazz: ["E Minor 7", "A7", "D Major 7"],
          blues: ["D7", "G7", "A7"],
      },
      description: "Joyous and very warlike",
      color: [30, 85, 55],
  },
  "E Major": {
      name: "E Major",
      base_note: "E",
      notes: ["E", "F#", "G#", "A", "B", "C#", "D#"],
      chords: {
          tonic: "E Major",
          dominant: "B Major",
          subdominant: "A Major",
          relative_minor: "C# Minor",
      },
      progressions: {
          pop: ["E Major", "B Major", "C# Minor", "A Major"],
          jazz: ["F# Minor 7", "B7", "E Major 7"],
          blues: ["E7", "A7", "B7"],
      },
      description: "Quarrelsome and boisterous",
      color: [50, 90, 50],
  },
  "F# Major": {
      name: "F# Major",
      base_note: "F#",
      notes: ["F#", "G#", "A#", "B", "C#", "D#", "E#"],
      chords: {
          tonic: "F# Major",
          dominant: "C# Major",
          subdominant: "B Major",
          relative_minor: "D# Minor",
      },
      progressions: {
          pop: ["F# Major", "C# Major", "D# Minor", "B Major"],
          jazz: ["G# Minor 7", "C#7", "F# Major 7"],
          blues: ["F#7", "B7", "C#7"],
      },
      description: "Sharp and energetic",
      color: [200, 85, 55],
  },
  "C Minor": {
      name: "C Minor",
      base_note: "C",
      notes: ["C", "D", "D#", "F", "G", "G#", "A#"],
      chords: {
          tonic: "C Minor",
          dominant: "G Minor",
          subdominant: "F Minor",
          relative_major: "D# Major",
      },
      progressions: {
          pop: ["C Minor", "G Minor", "A# Major", "F Minor"],
          jazz: ["D Minor 7♭5", "G7", "C Minor 7"],
          blues: ["C Minor 7", "F Minor 7", "G7"],
      },
      description: "Obscure and sad",
      color: [280, 40, 30],
  },
  "D Minor": {
      name: "D Minor",
      base_note: "D",
      notes: ["D", "E", "F", "G", "A", "A#", "C"],
      chords: {
          tonic: "D Minor",
          dominant: "A Minor",
          subdominant: "G Minor",
          relative_major: "F Major",
      },
      progressions: {
          pop: ["D Minor", "A# Major", "C Major", "F Major"],
          jazz: ["E Minor 7♭5", "A7", "D Minor 7"],
          blues: ["D Minor 7", "G Minor 7", "A7"],
      },
      description: "Serious and pious",
      color: [250, 50, 40],
  },
  "E Minor": {
      name: "E Minor",
      base_note: "E",
      notes: ["E", "F#", "G", "A", "B", "C", "D"],
      chords: {
          tonic: "E Minor",
          dominant: "B Minor",
          subdominant: "A Minor",
          relative_major: "G Major",
      },
      progressions: {
          pop: ["E Minor", "C Major", "G Major", "D Major"],
          jazz: ["F# Minor 7♭5", "B7", "E Minor 7"],
          blues: ["E Minor 7", "A Minor 7", "B7"],
      },
      description: "Amorous, plaintive",
      color: [270, 60, 35],
  }
};

  const KEY_HUES = {
    C: 10,
    "C#": 20,
    D: 30,
    "D#": 40,
    E: 50,
    F: 60,
    "F#": 180,
    G: 210,
    "G#": 240,
    A: 290,
    "A#": 310,
    B: 340,
  };

  const MIDI_KEYS = {
    48: "C3",
    49: "C#3",
    50: "D3",
    51: "D#3",
    52: "E3",
    53: "F3",
    54: "F#3",
    55: "G3",
    56: "G#3",
    57: "A3",
    58: "A#3",
    59: "B3",
    60: "C4",
    61: "C#4",
    62: "D4",
    63: "D#4",
    64: "E4",
    65: "F4",
    66: "F#4",
    67: "G4",
    68: "G#4",
    69: "A4",
    70: "A#4",
    71: "B4",
    72: "C5",
    73: "C#5",
    74: "D5",
    75: "D#5",
    76: "E5",
    77: "F5",
    78: "F#5",
    79: "G5",
    80: "G#5",
    81: "A5",
    82: "A#5",
    83: "B5",
    84: "C6",
  };

  const NOTE_FREQUENCIES = {
    C3: 130.81, // Frequency for C3
    "C#3": 138.59, // Frequency for C#3 / Db3
    D3: 146.83, // Frequency for D3
    "D#3": 155.56, // Frequency for D#3 / Eb3
    E3: 164.81, // Frequency for E3
    F3: 174.61, // Frequency for F3
    "F#3": 185.0, // Frequency for F#3 / Gb3
    G3: 196.0, // Frequency for G3
    "G#3": 207.65, // Frequency for G#3 / Ab3
    A3: 220.0, // Frequency for A3
    "A#3": 233.08, // Frequency for A#3 / Bb3
    B3: 246.94, // Frequency for B3
    C4: 261.63, // Frequency for C4
    "C#4": 277.18, // Frequency for C#4 / Db4
    D4: 293.66, // Frequency for D4
    "D#4": 311.13, // Frequency for D#4 / Eb4
    E4: 329.63, // Frequency for E4
    F4: 349.23, // Frequency for F4
    "F#4": 369.99, // Frequency for F#4 / Gb4
    G4: 392.0, // Frequency for G4
    "G#4": 415.3, // Frequency for G#4 / Ab4
    A4: 440.0, // Frequency for A4
    "A#4": 466.16, // Frequency for A#4 / Bb4
    B4: 493.88, // Frequency for B4
    C5: 523.25, // Frequency for C5
    "C#5": 554.37, // Frequency for C#5 / Db5
    D5: 587.33, // Frequency for D5
    "D#5": 622.25, // Frequency for D#5 / Eb5
    E5: 659.26, // Frequency for E5
    F5: 698.46, // Frequency for F5
    "F#5": 739.99, // Frequency for F#5 / Gb5
    G5: 783.99, // Frequency for G5
    "G#5": 830.61, // Frequency for G#5 / Ab5
    A5: 880.0, // Frequency for A5
    "A#5": 932.33, // Frequency for A#5 / Bb5
    B5: 987.77, // Frequency for B5
    // C6: 1046.5, // Frequency for C6
    // // Add even more notes as needed
  };

  let AVAILABLE_NOTES = Object.keys(NOTE_FREQUENCIES);

  //====================================================================================================================================
  // MIDI

  function initMidi({ onKeyUp, onKeyDown, onFader }) {
    console.log("INIT MIDI");

    if (navigator.requestMIDIAccess) {
      navigator
        .requestMIDIAccess({
          sysex: false,
        })
        .then(onMIDISuccess, onMIDIFailure);
    } else {
      console.warn("No MIDI support in your browser.");
    }

    function onMIDISuccess(midiAccess) {
      var inputs = midiAccess.inputs.values();
      console.log("Connected to MIDI, with inputs", inputs);

      var input = inputs.next();

      if (input.value) input.value.onmidimessage = onMIDIMessage;
      for (
        var input = inputs.next();
        input && !input.done;
        input = inputs.next()
      ) {
        // Each time there is a MIDI message, this event will be triggered
        input.value.onmidimessage = onMIDIMessage;
      }

      midiAccess.onstatechange = function (e) {
        console.log("MIDI device state changed:", e.port);
      };
    }

    function onMIDIFailure(error) {
      console.error("Could not access your MIDI devices.", error);
    }

    function onMIDIMessage(event) {
      var data = event.data;
      // console.log("MIDI message received:", data);

      var command = data[0] >> 4;
      var channel = data[0] & 0xf;
      var id = data[1];
      var val = data[2];

      switch (command) {
        case 11:
          console.log("Fader", command, channel, val, id);
          onFader?.({ id, val });
          return;
        case 14:
          console.log("Pitch", command, channel, val, id);
          onFader?.({ id: 0, val });
          return;
        case 9:
          onKeyDown?.({ note: MIDI_KEYS[id.toString()], velocity: val, id });
          return;
        case 8:
          onKeyUp?.({ note: MIDI_KEYS[id.toString()], velocity: val, id });
          return;
        default:
          console.log("unknown", command);
          return;
      }

      // onMessage({command,channel,note,value})
      // ... Handle other MIDI commands ...
    }
  }

  //====================================================================================================================================
  // JUKEBOX

  const SONG_FILES = {
    lofiguitar: {
      fileName: "203932__aptbr__lofi-guitar.wav",
      glitchURL: null,
    },
    solarfi: {
      fileName: "557815__alittlebitdrunkguy__solar-fi.mp3",
      glitchURL:
        "https://cdn.glitch.global/cd78ff0d-0493-47a7-ade8-5d278fa2af3b/557815__alittlebitdrunkguy__solar-fi.mp3?v=1698364779726",
    },
    piratedancer: {
      fileName: "Rolemusic - The Pirate And The Dancer.mp3",
      glitchURL:
        "https://cdn.glitch.global/cd78ff0d-0493-47a7-ade8-5d278fa2af3b/Rolemusic%20-%20The%20Pirate%20And%20The%20Dancer.mp3?v=1698364807294",
    },
    hotsalsatrip: {
      fileName: "arsonist - Hot salsa trip.mp3",
      glitchURL:
        "https://cdn.glitch.global/cd78ff0d-0493-47a7-ade8-5d278fa2af3b/arsonist%20-%20Hot%20salsa%20trip.mp3?v=1698364793492",
    },

    colorfulever: {
      fileName: "Broke For Free - As Colorful As Ever.mp3",
      glitchURL:
        "https://cdn.glitch.global/cd78ff0d-0493-47a7-ade8-5d278fa2af3b/Broke%20For%20Free%20-%20As%20Colorful%20As%20Ever.mp3?v=1698364797206",
    },
    songo21: {
      fileName: "SONGO 21 - Opening para Songo 21.mp3",
      glitchURL:
        "https://cdn.glitch.global/cd78ff0d-0493-47a7-ade8-5d278fa2af3b/SONGO%2021%20-%20Opening%20para%20Songo%2021.mp3?v=1698364811208",
    },
    purplecatflourish: {
      fileName: "purrple-cat-flourish.mp3",
      glitchURL:
        "https://cdn.glitch.global/cd78ff0d-0493-47a7-ade8-5d278fa2af3b/purrple-cat-flourish.mp3?v=1698364803369",
    },
    chiptunemelody: {
      fileName: "403372__emceeciscokid__chiptune-melody.wav",
      glitchURL: null,
    },
    lastones: {
      fileName: "Jahzzar - The last ones.mp3",
      glitchURL:
        "https://cdn.glitch.global/cd78ff0d-0493-47a7-ade8-5d278fa2af3b/Jahzzar%20-%20The%20last%20ones.mp3?v=1698364798827",
    },
    holidayinstrumental: {
      fileName: "Silence Is Sexy - Holiday (instrumental).mp3",
      glitchURL:
        "https://cdn.glitch.global/cd78ff0d-0493-47a7-ade8-5d278fa2af3b/Silence%20Is%20Sexy%20-%20Holiday%20(instrumental).mp3?v=1698364809631",
    },

    exotica: {
      fileName: "Juanitos - Exotica.mp3",
      glitchURL:
        "https://cdn.glitch.global/cd78ff0d-0493-47a7-ade8-5d278fa2af3b/Juanitos%20-%20Exotica.mp3?v=1698364801110",
    },
    brazilianrhythm: {
      fileName: "Sunsearcher - Brazilian Rhythm.mp3",
      glitchURL:
        "https://cdn.glitch.global/cd78ff0d-0493-47a7-ade8-5d278fa2af3b/Sunsearcher%20-%20Brazilian%20Rhythm.mp3?v=1698364813483",
    },
  };
  class Jukebox {
    constructor() {
      this.useGlitch = false;
      this.songAssetPrefix = "../_assets/songs/";

      try {
        this.fft = new p5.FFT();
      } catch {
        console.warn("No FFT, be sure to load P5 Sound as well.");
      }

      this.activeSong = null;

      // Store all song info, including loaded state
      this.songs = {};
      Object.entries(SONG_FILES).forEach(([name, { glitchURL, fileName }]) => {
        this.songs[name] = {
          name,
          fileName,
          glitchURL,
          asset: null, // Will store p5.SoundFile when loaded
          loaded: false, // Tracks if the sound has been loaded
        };
      });
    }

    get songNames() {
      return Object.keys(this.songs);
    }

    loadSound(name) {
      return new Promise((resolve, reject) => {
        let song = this.songs[name];
        if (song.loaded) {
          console.log("Already loaded!");
          resolve(song); // If already loaded, return it
          return;
        }

        let url = this.useGlitch
          ? song.glitchURL
          : this.songAssetPrefix + song.fileName; // Use glitch URL if available

        let sound = new p5.SoundFile(
          url,
          () => {
            song.asset = sound;
            song.loaded = true; // Mark as loaded
            resolve(song);
          },
          (error) => {
            console.error(`Error loading sound: ${name}`, error);
            reject(error);
          }
        );
      });
    }

    async play(name) {
      console.log("play", name);
      if (!name) name = Object.keys(this.songs)[0]; // Default to first song

      // Stop current song if playing
      this.activeSong?.asset.stop();

      try {
        this.activeSong = await this.loadSound(name);
        this.activeSong.asset.play();
      } catch (error) {
        console.error(`Error playing sound: ${name}`, error);
      }
    }

    get isPlaying() {
      return this.activeSong.asset?.isPlaying();
    }

    toggle() {
      if (!this.activeSong) {
        this.play();
        return;
      }
      if (this.activeSong) {
        console.log(this.isPlaying);
        if (this.isPlaying) {
          this.activeSong?.asset.pause(); // Pause if playing
        } else {
          this.activeSong?.asset.play(); // Resume if paused
        }
      }
    }

    stop() {
      this.activeSong?.asset.stop();
    }

    draw(p) {
      this.analyze();

      let bandCount = this.spectrum.length - 800;
      p.fill(0);
      p.push();
      p.translate(0, p.height);
      p.rect(0, 0, p.width, -100);

      let dx = p.width / bandCount;
      for (let i = 0; i < bandCount; i++) {
        let x = dx * i;
        let h = -this.spectrum[i] * 0.3;
        p.fill((i * 23) % 360, 100, 50);
        p.rect(x, 0, dx, h);
      }
      p.pop();
    }
  }

  //====================================================================================================================================
  // INSTRUMENTS

  class Instrument {
    /**
     * an insturment, with a sample that it can play at different frequencies
     **/
    constructor(name) {
      this.name = name;
      // console.log("New instrument", name);
      instruments[name] = this;
    }

    load(p, assetURL) {
      this.sound = p.loadSound(assetURL);
      return this;
    }

    play(note) {
      let ratio = Math.random() * 1 + 0.3;

      // Get a random note
      if (!note || NOTE_FREQUENCIES[note] === undefined) {
        console.log("RANDOM NOTE", note);
        note = getRandom(Object.keys(NOTE_FREQUENCIES));
      }
      ratio = NOTE_FREQUENCIES[note] / NOTE_FREQUENCIES.C4;

      let vol = 0.3 + Math.random() * 0.5;
      // vol = .01
      // console.log("playing note:", this.name, note, vol)
      if (this.sound) {
        this.sound.play();
        this.sound.setVolume(vol);
        this.sound.rate(ratio);
      } else
        console.warn("Can't play", this.name, "no sound loaded/enabled yet");
    }
  }

  const prefix = "../_assets/hits/";
  const assetNames = {
    // pianoA: "piano-c_C_major.wav",
    // pianoB: "piano-C4.wav",
    pianoC: "piano-key-c-major_C_major.wav",
    pianoD: "piano-key-note-c_109bpm_C_major.wav",
    // violin: "violin-C4.wav",
    // trumpet: "trumpet-C4.wav?v=1698338301641",
    // flute: "flute-C4.wav?v=1698338301081",
    xylophone: "Xylophone.rosewood.ff.C5.stereo.wav",
    bells: "bells.plastic.ff.C5.stereo.wav",
    bellsBrass: "bells.brass.ff.C5.stereo.wav",
    xylophoneRubber: "Xylophone.hardrubber.ff.C5.stereo.wav",
    tabla: "689551__shototsu__tabla-short.wav",
    conga: "455508__mrrentapercussionist__lp-congas-quinto-open-tone.wav",
    bongo: "219157__jagadamba__bongo01.wav",
  };

  // Make an instrument for each asset
  let instruments = {};
  Object.keys(assetNames).forEach((name) => new Instrument(name));

  function loadInstruments(p) {
    if (!p) throw "No p5???";
    console.log("Load instruments");

    Object.values(instruments).forEach((inst) => {
      let path = prefix + assetNames[inst.name];
      console.log("Load", path);
      inst.load(p, path);
    });
    console.log(instruments);
  }

  class OscNoise {
    constructor() {
      this.asdr = [0.1, 0.7, 0.3, 0.1];

      this.envelope = new p5.Envelope(...this.asdr);
      this.oscillator = new p5.Oscillator("sine");
    }

    randomizeASDR() {
      for (var i = 0; i < this.asdr.length; i++) {
        this.asdr[i] = Math.random();
      }
    }

    play() {
      // this.oscillator.freq(Math.random() * 400 + 100);
      this.randomizeASDR();
      console.log("asdr", this.asdr.map((val) => val.toFixed(2)).join(","));
      this.oscillator.start();
      this.envelope.setADSR(...this.asdr);
      this.envelope.play(this.oscillator);
    }
  }

  // Drums from https://sampleswap.org/
  // Other samples from https://theremin.music.uiowa.edu/MIS.html
  // Music from CCMixter

  let pianoKeys = Object.entries(MIDI_KEYS).map(([key, val]) => {
    return {
      midi: key,
      name: val,
      downEnergy: 0,
    };
  });

  let keyboardCount = 0;
  class PianoKeyboard {
    constructor({ instrumentName, name }) {
      this.idNumber = keyboardCount++;
      this.name = name ?? "keyboard" + this.idNumber;
      this.instrumentName = instrumentName ?? "pianoD";
      this.activeKey = getRandom(Object.values(KEYS));
      let pos = 0;
      this.keys = Object.entries(MIDI_KEYS).map(([midi, name], index) => {
        let color = name.length === 3 ? "black" : "white";
        let octave = name.slice(name.length - 1);
        let pitch = name.slice(0, name.length - 1);
        pos += color === "white" ? 1 : 0;
        // console.log(color, pos)
        let key = {
          index,
          midi,
          name,
          octave,
          pitch,
          down: undefined,
          color,
          pos: color === "white" ? pos : pos + 0.7,
        };
        return key;
      });

      // console.log(this.keys.map(key => key.name + key.midi + key.color))
    }

    update() {
      this.keys.forEach((key) => {
        if (key.down) {
          key.down.energy -= 1;
          if (key.down.energy <= 0) key.down = undefined;
        }
      });
    }

    setActiveKey({ key, source }) {
      console.log(key);
      if (this.activeKey !== key) {
        this.activeKey = key;

        let progType = getRandom(Object.keys(key.progressions));
        this.progression = {
          style: progType,
          chords: key.progressions[progType],
          index: 0,
        };
      }
      
      this.playChord({ source });
    }

    onPlay(fxn) {
      console.log("Set handler for", this.name);
      this.playFxn = fxn;
    }

    playProgressionChord({source}) {
      let chordName = this.progression.chords[this.progression.index];
      console.log(this.progression.style, chordName)
      this.progression.index = (this.progression.index+1)%this.progression.chords.length
      this.playChord({chordName, source})
    }

    playChord({ chordName, source } = {}) {
      // Get a set of random keys that form this chord
      let notes = [];
      if (this.progression && !chordName) {
        this.playProgressionChord({source})
        return
      }
      console.log(chordName, source)

      let chordNotes = CHORDS[chordName];
      if (!chordNotes) console.warn("Chord ", chordName, " not found", CHORDS);
      else {
        console.log("Play chord", chordName, chordNotes);
        let notesToPlay = MUSIC.getRandomChordNotes(chordNotes);

        console.log("CHORD", chordName, chordNotes, notesToPlay);

        // MUSIC.getAvailableNotes()
        notesToPlay.forEach((keyName) => {
        
          this.play({ keyName, source });
        });
      }
    }

    play({ key, keyName, source, instrumentName }) {
      
      if (keyName) {
        key = this.keys.find((key) => key.name === keyName);
        if (!key) {
          console.warn("Note not found", keyName);
        }
      }

      if (!key) key = getRandom(this.keys);

      let inst = instrumentName ?? this.instrumentName;

      MUSIC[inst].play(key.name);
      key.down = {
        energy: 10,
      };

      // Do whatever happens on this, but tell it where it came from
      this.playFxn({
        keyboard: this,
        key,
        keyName,
        instrumentName: inst,
        source,
      });
    }

    get whiteKeyCount() {
      return this.keys.filter((key) => key.color === "white").length;
    }
  }
  Vue.component("piano-keyboard", {
    template: `
    <div class="piano-keyboard" :style="{ width: width + 'px', height: height + 'px' }">

    <div class="keyboard-keys">
      <div 
        v-for="key in keyboard.keys" 
        :key="key.midi"
        :class="['piano-key', key.color, { active: key.down }]" 
        :style="getKeyStyle(key)"
        @click="keyboard.play({ key, source: 'widget' })"
      >
        <div v-if="labelKeys">{{ key.name }} {{ key.midi }}</div>
      </div>
    </div>
  
    <div> 
      <div class="keyselection">
        <div class="chip">{{ keyboard.activeInstruments }}</div>
        
        <button 
          v-for="key in keys" 
          :style="colorStyle(key.color)"
          @click="setActiveKey(key)"
        >
          {{ key.name }}
          <div class="subtitle">{{ key.description }}</div>
        </button>
      </div>
  
      <div class="base-chords section">
        <button 
          v-for="chordName in keyboard.activeKey.chords" 
          @click="keyboard.playChord({ chordName, source: 'widget' })"
        >
          {{ chordName }}
        </button> 
      </div>
  
      <div class="progression-chords section">
        <div 
          v-for="(progression, progName) in keyboard.activeKey.progressions" 
          :key="progName"
        >
          {{progName}}
          <button 
            v-for="chordName in progression" 
            :key="chordName"
            @click="keyboard.playChord({  chordName, source: 'widget' })"
          >
            {{ chordName }}
          </button> 
        </div>
      </div>
  
      <div class="all-chords section">
       
        <button 
          v-for="(chord, chordName) in chords" 
          @click="keyboard.playChord({ chordName, source:'widget' })"
        >
          {{ chordName }}
        </button> 
      </div>
  
      <div class="instrument-selection">
        <h3>Select Instrument</h3>
        <select v-model="keyboard.instrumentName">
          <option v-for="name in instrumentNames" :key="name">{{ name }}</option>
        </select>
      </div>
    </div>
  
  </div>
  
    `,
    computed: {
      instrumentNames() {
        return MUSIC.instrumentNames;
      },

      keysInKey() {
        return this.keyboard.keys.filter((key) => this.inKey(key));
      },

      keyColor() {
        return new KVector(this.keyboard.activeKey.color);
      },
    },
    props: {
      keyboard: {
        type: Object,
        required: true,
      },
      width: {
        type: Number,
        default: 400, // Default keyboard width
      },
      height: {
        type: Number,
        default: 100, // Default keyboard height
      },
    },

    methods: {
      setActiveKey(key) {
        this.keyboard.setActiveKey({ key, source: "widget" });
      },
      inKey(key) {
        return this.keyboard.activeKey.notes.includes(key.pitch);
      },
      colorStyle,
      getKeyStyle(key) {
        const whiteKeyWidth = this.width / this.keyboard.whiteKeyCount;
        const blackKeyWidth = whiteKeyWidth * 0.6;
        const blackKeyHeight = this.height * 0.6;

        let style = {};

        if (key.color === "white") {
          style = {
            width: whiteKeyWidth + "px",
            height: this.height + "px",
            left: key.pos * whiteKeyWidth + "px",
          };
        } else if (key.color === "black") {
          style = {
            width: blackKeyWidth + "px",
            height: blackKeyHeight + "px",
            left: key.pos * whiteKeyWidth + "px",
          };
        }

        let inKey = this.inKey(key);
        let color = inKey ? this.keyColor : new KVector(0, 0, 50);

        let shade = key.color === "black" ? -0.6 : 0.2;
        let borderShade = key.down ? 0.4 : -0.9;

        if (key.down) shade += 0.2;
        Object.assign(style, {
          backgroundColor: color.toCSS({ shade }),
          border: "1px solid " + color.toCSS({ shade: borderShade }),
        });

        return style;
      },
    },
    mounted() {
      // window.addEventListener("keydown", this.handleKeyPress);

      initMidi({
        onKeyDown: ({ note, velocity, id }) => {
          this.keyboard.play({ keyName: note });
        },
      });
    },

    beforeDestroy() {
      window.removeEventListener("keydown", this.handleKeyPress);
    },

    data() {
      return {
        labelKeys: false,
        keys: KEYS,
        chords: CHORDS,
      };
    },
  });

  const FFT_LENGTH = 256;
  return {
    chords: CHORDS,
    keyHues: KEY_HUES,
    keys: KEYS,
    PianoKeyboard,
    initMidi,
    OscNoise,

    fft: new p5.FFT(0.5, FFT_LENGTH),
    analyzeFFT(p) {
      let rawSpectrum = this.fft.analyze();
      let sp = this.spectrum;

      let smooth = 0.9;
      rawSpectrum.forEach((value, i) => {
        if (value > 256) console.log(value);
        let avg0 = sp.average[i] || 0; // Ensure previous value exists
        let avg = smooth * avg0 + (1 - smooth) * value; // Proper weighted moving average
        let spike = value - avg;

        Vue.set(sp.values, i, Math.min(256, value));
        Vue.set(sp.average, i, Math.min(256, avg));
        // sp.average[i] = avg
        Vue.set(sp.spikes, i, Math.min(256, spike));
      });
      // console.log(sp.average)
    },
    spectrum: {
      values: Array.from({ length: FFT_LENGTH }, () => 0),
      average: Array.from({ length: FFT_LENGTH }, () => 0),
      spikes: Array.from({ length: FFT_LENGTH }, () => 0),
    },
    jukebox: new Jukebox(),
    loadInstruments,
    ...instruments,
    randomInstrument() {
      return instruments[getRandom(Object.keys(instruments))];
    },

    getAvailableNotes(pitches) {
      let found = AVAILABLE_NOTES.filter((name) =>
        pitches.includes(name.slice(0, name.length - 1))
      );

      return found;
    },

    getRandomChordNotes(chord) {
      return chord.map((pitch) => {
        let match = this.getAvailableNotes([pitch]);
        // console.log(pitch, match)
        return getRandom(match);
      });
    },

    getRandomNoteInKey(keyName) {
      return this.getAvailableNotes(KEYS[keyName].notes);
    },

    randomPitch(keys) {
      let key = getRandom(keys);
      let matching = AVAILABLE_NOTES.filter(
        (key) =>
          key.toLowerCase() === key.slice(0, key.length - 1).toLowerCase()
      );
      return getRandom(matching);
    },
    instrumentNames: Object.keys(instruments),
  };
})();
