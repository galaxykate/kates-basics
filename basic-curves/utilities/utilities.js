// Utilities


function makePixelsOutsideCircleTransparent(img, cx, cy, radius) {
    // console.log(img.width, img.height);
    // Load the pixels array of the image
    img.loadPixels();

   
    // Loop through all pixels
    for (let i = 0; i < img.width; i++) {
        for (let j = 0; j < img.height; j++) {
            let x = i
            let y = j
            // Calculate distance from the center of the circle
            let dx = x - cx;
            let dy = y - cy;
            let d = Math.sqrt(dx * dx + dy * dy);
            let index = (x + y * img.width) * 4; // Get the pixel index
            
            // If the distance is greater than the radius, set alpha to 0 (transparent)
            if (d > radius) {
                img.pixels[index + 3] = 0; // Set alpha value to 0 (transparent)
            }
           
        }
    }

    // Update the image with the modified pixels
    img.updatePixels();
}

// function circleCutout(p) {
//     clippingMask.loadPixels()

//         let w = clippingMask.width
//         let h = clippingMask.width
//         for (var i = 0; i < clippingMask.width; i++) {
//         for (var j = 0; j < clippingMask.height; j++) {
//           let dx = i/clippingMask.width

//         }
//         }
//     clippingMask.updatePixels()
// }

// function transparentSlice(p, source, x, y, scale) {
//     // Take a slice of this image at a location
//     p.push()
//     p.translate(p.width, 0)
//     p.scale(-1, 1)

//     // Draw the source image offset
//     p.scale(scale, scale)
//     p.translate(-x, -y)
//     p.image(source, 0, 0)
//     p.pop()
// }

// Useful fxns
function remap(v, v0, v1, nv0, nv1) {
    let pct = (v - v0)/(v1 - v0)
    return pct*(nv1 - nv0) + nv0
}

let noise = (() => {
    let noiseFxn = new SimplexNoise(0)
    return function noiseAny() {
        if ( arguments.length == 1)
            return noiseFxn.noise2D(arguments[0],0)
        if ( arguments.length == 2)
            return noiseFxn.noise2D(arguments[0],arguments[1])
        if ( arguments.length == 3)
            return noiseFxn.noise3D(arguments[0],arguments[1],arguments[2])
        if ( arguments.length == 4)
            return noiseFxn.noise4D(arguments[0],arguments[1],arguments[2], arguments[3])
        return 0
    }
})()

function randInt(min, max) {
  if (max === undefined) {
    max = min;
    min = 0;
}
return Math.floor(Math.random() * (max - min + 1)) + min;
}

function lerp(c0, c1, pct) {
    return c0 + pct*(c1 - c0)
}
function constrain(x, min, max) {
    return Math.min(max, Math.max(x, min))
}

function lerpColors(c0, c1, pct) {
    if (!c0)
        console.warn("Not a color", c0)
    if (!c1)
        console.warn("Not a color", c1)
    return [lerp(c0[0], c1[0], pct),
        lerp(c0[1], c1[1], pct),
        lerp(c0[2], c1[2], pct)]
}


function objToInlineStyle(styleObj) {
  // FROM GPT
    // Define a mapping of style properties that should use HSL notation
    const hslProperties = ['background-color', 'color', 'border-color'];

    // Initialize the inline style string
    let inlineStyle = '';

    // Loop through the properties in the style object
    for (const property in styleObj) {
        if (styleObj.hasOwnProperty(property)) {
            const value = styleObj[property];

            // Check if the property should use HSL notation
            if (hslProperties.includes(property)) {
                if (Array.isArray(value) && value.length === 3) {
                    // Convert the array to an HSL color string
                    const hslColor = `hsl(${value[0]}, ${value[1]}%, ${value[2]}%)`;
                    inlineStyle += `${property}: ${hslColor}; `;
                }
            } else {
                // Use pixel units for other properties
                inlineStyle += `${property}: ${value}px; `;
            }
        }
    }

    return inlineStyle;
}


function map(x, y0, y1, z0, z1) {
    let pct = (x - y0)/(y1 - y0) 
    return pct*(z1-z0) + z0
}


// https://stackoverflow.com/questions/19721439/download-json-object-as-a-file-from-browser
const saveTemplateAsFile = (filename, dataObjToWrite) => {
  const blob = new Blob([JSON.stringify(dataObjToWrite)], {
    type: "text/json",
});
  const link = document.createElement("a");

  link.download = filename;
  link.href = window.URL.createObjectURL(blob);
  link.dataset.downloadurl = ["text/json", link.download, link.href].join(":");

  const evt = new MouseEvent("click", {
    view: window,
    bubbles: true,
    cancelable: true,
});

  link.dispatchEvent(evt);
  link.remove();
};

function oneHotFromLabels(label, labels) {
  let index = labels.indexOf(label);
  if (index < 0) console.warn(`No label '${label}' found in labels: ${labels}`);
  let arr = new Array(labels.length).fill(0);
  arr[index] = 1;
  return arr;
}

function oneHot(count, index) {
  let arr = new Array(count).fill(0);
  arr[index] = 1;
  return arr;
}

function indexOfMax(arr) {
  if (arr.length === 0) {
    return -1;
}

var max = arr[0];
var maxIndex = 0;

for (var i = 1; i < arr.length; i++) {
    if (arr[i] > max) {
      maxIndex = i;
      max = arr[i];
  }
}

return maxIndex;
}

function predictionToClassification(labels, rawPrediction) {
  // Make the ML5 prediction into something more useable
  let classification = {
    scoresByLabel: {},
    sorted: [],
};

rawPrediction.forEach((option, index) => {
    let label = labels[index];
    classification.scoresByLabel[label] = option.value;
    classification.sorted.push({
      label,
      score: option.value,
  });
});
classification.sorted.sort((a, b) => b.score - a.score);
classification.winner = classification.sorted[0]
return classification
}
