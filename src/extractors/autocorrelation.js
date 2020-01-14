function zeroIfOutOfBound(i, f) {
  if (i < 0) {
    return 0;
  }
  if (i >= f.length - 1) {
    return 0;
  }
  return f[i];
}

function phi(t, f) {
  var acc = 0;
  for (var i = 0; i < f.length; i++) {
    acc += f[i] * zeroIfOutOfBound(i + t, f);
  }
  return acc;
}

export default function autocorrelation() {
  if (typeof arguments[0].signal !== 'object') {
    throw new TypeError();
  }

  const arr = arguments[0].signal;

  var ac = new Float32Array(arr.length*2);
  for (var lag = -1*arr.length; lag < arr.length; lag++) {
    ac[lag + arr.length] = phi(lag, arr);
  }
  return ac;
};
