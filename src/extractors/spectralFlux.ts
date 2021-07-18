export default function (args) {
  if (
    typeof args.complexSpectrum.real !== "object" ||
    typeof args.previousComplexSpectrum.real != "object"
  ) {
    throw new TypeError();
  }

  let sf = 0;
  for (let i = 0; i < args.complexSpectrum.real.length; i++) {
    let x =
      Math.abs(args.complexSpectrum.real[i]) -
      Math.abs(args.previousComplexSpectrum.real[i]);
    sf += Math.pow(x, 2);
  }

  return Math.sqrt(sf);
}
