import powerSpectrum from './powerSpectrum';
import freqToMel from './../utilities';
import melToFreq from './../utilities';

var dct = require('dct');

export default function(args) {
  if (typeof args.ampSpectrum !== 'object') {
    throw new TypeError('Valid ampSpectrum is required to generate MFCC');
  }
  if (typeof args.melFilterBank !== 'object') {
    throw new TypeError('Valid melFilterBank is required to generate MFCC');
  }
  if (typeof args.numberOfMFCCCoefficients !== 'number') {
    throw new TypeError('Number of MFCC Coeficcients is required to generate MFCC');
  }

  let numberOfMFCCCoefficients = 13;

  if (args.numberOfMFCCCoefficients) {
    if (args.numberOfMFCCCoefficients > 40) {
      numberOfMFCCCoefficients = 40;
    } else if (args.numberOfMFCCCoefficients < 1) {
      numberOfMFCCCoefficients = 1;
    } else {
      numberOfMFCCCoefficients = args.numberOfMFCCCoefficients;
    }
  }

  // Tutorial from:
  // http://practicalcryptography.com/miscellaneous/machine-learning
  // /guide-mel-frequency-cepstral-coefficients-mfccs/
  let powSpec = powerSpectrum(args);
  let numFilters = args.melFilterBank.length;
  let filtered = Array(numFilters);

  let loggedMelBands = new Float32Array(numFilters);

  for (let i = 0; i < loggedMelBands.length; i++) {
    filtered[i] = new Float32Array(args.bufferSize / 2);
    loggedMelBands[i] = 0;
    for (let j = 0; j < (args.bufferSize / 2); j++) {
      //point-wise multiplication between power spectrum and filterbanks.
      filtered[i][j] = args.melFilterBank[i][j] * powSpec[j];

      //summing up all of the coefficients into one array
      loggedMelBands[i] += filtered[i][j];
    }

    //log each coefficient.
    loggedMelBands[i] = Math.log(loggedMelBands[i] + 1);
  }

  //dct
  let loggedMelBandsArray = Array.prototype.slice.call(loggedMelBands);
  let mfccs = dct(loggedMelBandsArray).slice(0, numberOfMFCCCoefficients);

  return mfccs;
}
