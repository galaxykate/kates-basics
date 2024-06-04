// Utilities
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
