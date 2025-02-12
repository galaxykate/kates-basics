
function initMidi({onKeyUp, onKeyDown, onFader}) {
  console.log("INIT MIDI")

  if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess({
      sysex: false
    }).then(onMIDISuccess, onMIDIFailure);
  } else {
    console.warn("No MIDI support in your browser.");
  }

  function onMIDISuccess(midiAccess) {
    console.log("Connected to MIDI")
    var inputs = midiAccess.inputs.values();
    // console.log(inputs)

    for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
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
    console.log(command, channel, "id:", id, "val:", val)
    switch(command) {
    case 11:
       console.log("🎶Fader", command, channel, val, id)
       onFader?.({id, val})
      return 
    case 14:
       console.log("🎶Pitch", command, channel, val, id)
        onFader?.({id:0, val})
       return
    case 9:
       console.log("🎶KeyDown", val, id)
       onKeyDown?.({note: id, velocity: val})
      return
    case 8:
       console.log("🎶KeyUp", val, id)
       onKeyUp?.({note: id, velocity: val})
       return
    default:
      console.log("unknown", command)
      return
    }
  
  

    // onMessage({command,channel,note,value})
    // ... Handle other MIDI commands ...
  }
}
