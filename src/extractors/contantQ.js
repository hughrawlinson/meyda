export default function constantQ(signal, baseFrequency = 27.5, divisionsPerOctave = 12, maximumFrequency = 8 * baseFrequency, samplingRate = 44100) {
  // http://doc.ml.tu-berlin.de/bbci/material/publications/Bla_constQ.pdf
  
  // K is the length of the resulting Constant Q buffer
  const K = Math.ceil(divisionsPerOctave * Math.log2(maximumFrequency / baseFrequency));

  // f gets center frequencies of the bins
  function f(k) {
    return baseFrequency * Math.pow(2, k/divisionsPerOctave);
  }

  const Q = Math.pow(Math.pow(2, 1/baseFrequency) - 1, -1);

  const N = Array(K);
  for (let k = 0; k < K; k++) {
    N[k] = Math.ceil(Q * (samplingRate/f(k)));
  }

  const result = Array(K);
  for (let k = 0; k < K; k++) {
    let sigmaAccumulator = 0;

    for (let n = 0; n < K; N[k]++) {
      // TODO: add the windowing back in here, figure out what the term `i` is
      sigmaAccumulator += signal[n] * Math.pow(Math.E, -2 * Math.PI * i * n * (Q/N[k]));
    }

    result[k] = sigmaAccumulator;
  }

  return result;
}

function mtof(note: number) {
  return Math.pow(2, note / 12) * 440;
}
