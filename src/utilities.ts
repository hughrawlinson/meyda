import * as windowing from "./windowing";

let windows = {};

export function isPowerOfTwo(num) {
  while (num % 2 === 0 && num > 1) {
    num /= 2;
  }

  return num === 1;
}

export function error(message) {
  throw new Error("Meyda: " + message);
}

export function pointwiseBufferMult(a, b) {
  let c: number[] = [];
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    c[i] = a[i] * b[i];
  }

  return c;
}

export function applyWindow(signal, windowname) {
  if (windowname !== "rect") {
    if (windowname === "" || !windowname) windowname = "hanning";
    if (!windows[windowname]) windows[windowname] = {};

    if (!windows[windowname][signal.length]) {
      try {
        windows[windowname][signal.length] = windowing[windowname](
          signal.length
        );
      } catch (e) {
        throw new Error("Invalid windowing function");
      }
    }

    signal = pointwiseBufferMult(signal, windows[windowname][signal.length]);
  }

  return signal;
}

export function createBarkScale(length, sampleRate, bufferSize) {
  let barkScale = new Float32Array(length);

  for (var i = 0; i < barkScale.length; i++) {
    barkScale[i] = (i * sampleRate) / bufferSize;
    barkScale[i] =
      13 * Math.atan(barkScale[i] / 1315.8) +
      3.5 * Math.atan(Math.pow(barkScale[i] / 7518, 2));
  }

  return barkScale;
}

export function typedToArray(t) {
  // utility to convert typed arrays to normal arrays
  return Array.prototype.slice.call(t);
}

export function arrayToTyped(t) {
  // utility to convert arrays to typed F32 arrays
  return Float32Array.from(t);
}

export function _normalize(num, range) {
  return num / range;
}

export function normalize(a, range) {
  return a.map(function (n) {
    return _normalize(n, range);
  });
}

export function normalizeToOne(a) {
  var max = Math.max.apply(null, a);

  return a.map(function (n) {
    return n / max;
  });
}

export function mean(a) {
  return (
    a.reduce(function (prev, cur) {
      return prev + cur;
    }) / a.length
  );
}

const MEL_CONSTANT = 1127;

function _melToFreq(melValue) {
  var freqValue = 700 * (Math.exp(melValue / MEL_CONSTANT) - 1);
  return freqValue;
}

function _freqToMel(freqValue) {
  var melValue = MEL_CONSTANT * Math.log(1 + freqValue / 700);
  return melValue;
}

export function melToFreq(mV) {
  return _melToFreq(mV);
}

export function freqToMel(fV) {
  return _freqToMel(fV);
}

export function createMelFilterBank(numFilters, sampleRate, bufferSize) {
  //the +2 is the upper and lower limits
  let melValues = new Float32Array(numFilters + 2);
  let melValuesInFreq = new Float32Array(numFilters + 2);

  //Generate limits in Hz - from 0 to the nyquist.
  let lowerLimitFreq = 0;
  let upperLimitFreq = sampleRate / 2;

  //Convert the limits to Mel
  let lowerLimitMel = _freqToMel(lowerLimitFreq);
  let upperLimitMel = _freqToMel(upperLimitFreq);

  //Find the range
  let range = upperLimitMel - lowerLimitMel;

  //Find the range as part of the linear interpolation
  let valueToAdd = range / (numFilters + 1);

  let fftBinsOfFreq = Array(numFilters + 2);

  for (let i = 0; i < melValues.length; i++) {
    // Initialising the mel frequencies
    // They're a linear interpolation between the lower and upper limits.
    melValues[i] = i * valueToAdd;

    // Convert back to Hz
    melValuesInFreq[i] = _melToFreq(melValues[i]);

    // Find the corresponding bins
    fftBinsOfFreq[i] = Math.floor(
      ((bufferSize + 1) * melValuesInFreq[i]) / sampleRate
    );
  }

  var filterBank = Array(numFilters);
  for (let j = 0; j < filterBank.length; j++) {
    // Create a two dimensional array of size numFilters * (buffersize/2)+1
    // pre-populating the arrays with 0s.
    filterBank[j] = new Array(bufferSize / 2 + 1).fill(0);

    //creating the lower and upper slopes for each bin
    for (let i = fftBinsOfFreq[j]; i < fftBinsOfFreq[j + 1]; i++) {
      filterBank[j][i] =
        (i - fftBinsOfFreq[j]) / (fftBinsOfFreq[j + 1] - fftBinsOfFreq[j]);
    }

    for (let i = fftBinsOfFreq[j + 1]; i < fftBinsOfFreq[j + 2]; i++) {
      filterBank[j][i] =
        (fftBinsOfFreq[j + 2] - i) /
        (fftBinsOfFreq[j + 2] - fftBinsOfFreq[j + 1]);
    }
  }

  return filterBank;
}

export function hzToOctaves(freq, A440) {
  return Math.log2((16 * freq) / A440);
}

export function normalizeByColumn(a) {
  var emptyRow = a[0].map(() => 0);
  var colDenominators = a
    .reduce((acc, row) => {
      row.forEach((cell, j) => {
        acc[j] += Math.pow(cell, 2);
      });
      return acc;
    }, emptyRow)
    .map(Math.sqrt);
  return a.map((row, i) => row.map((v, j) => v / (colDenominators[j] || 1)));
}

export function createChromaFilterBank(
  numFilters,
  sampleRate,
  bufferSize,
  centerOctave = 5,
  octaveWidth = 2,
  baseC = true,
  A440 = 440
) {
  var numOutputBins = Math.floor(bufferSize / 2) + 1;

  var frequencyBins = new Array(bufferSize)
    .fill(0)
    .map(
      (_, i) => numFilters * hzToOctaves((sampleRate * i) / bufferSize, A440)
    );

  // Set a value for the 0 Hz bin that is 1.5 octaves below bin 1
  // (so chroma is 50% rotated from bin 1, and bin width is broad)
  frequencyBins[0] = frequencyBins[1] - 1.5 * numFilters;

  var binWidthBins = frequencyBins
    .slice(1)
    .map((v, i) => Math.max(v - frequencyBins[i]), 1)
    .concat([1]);

  var halfNumFilters = Math.round(numFilters / 2);

  var filterPeaks = new Array(numFilters)
    .fill(0)
    .map((_, i) =>
      frequencyBins.map(
        (frq) =>
          ((10 * numFilters + halfNumFilters + frq - i) % numFilters) -
          halfNumFilters
      )
    );

  var weights = filterPeaks.map((row, i) =>
    row.map((_, j) =>
      Math.exp(-0.5 * Math.pow((2 * filterPeaks[i][j]) / binWidthBins[j], 2))
    )
  );

  weights = normalizeByColumn(weights);

  if (octaveWidth) {
    var octaveWeights = frequencyBins.map((v) =>
      Math.exp(
        -0.5 * Math.pow((v / numFilters - centerOctave) / octaveWidth, 2)
      )
    );
    weights = weights.map((row) =>
      row.map((cell, j) => cell * octaveWeights[j])
    );
  }

  if (baseC) {
    weights = [...weights.slice(3), ...weights.slice(0, 3)];
  }

  return weights.map((row) => row.slice(0, numOutputBins));
}

export function frame(buffer, frameLength, hopLength) {
  if (buffer.length < frameLength) {
    throw new Error("Buffer is too short for frame length");
  }
  if (hopLength < 1) {
    throw new Error("Hop length cannot be less that 1");
  }
  if (frameLength < 1) {
    throw new Error("Frame length cannot be less that 1");
  }

  const numFrames = 1 + Math.floor((buffer.length - frameLength) / hopLength);

  return new Array(numFrames)
    .fill(0)
    .map((_, i) => buffer.slice(i * hopLength, i * hopLength + frameLength));
}
