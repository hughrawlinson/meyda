import { Command } from "commander";
import Meyda from "meyda";
import { CliOptions, parseReceivedOptions } from "./options";
import { createReadStream, createWriteStream } from "fs";
import { resolve } from "path";
import { pipeline, Transform } from "stream";
import { SampleBufferStream } from "./SampleBufferStream";

export const program = new Command();

program
  .arguments("<features...>")
  .option(
    "-i, --input",
    "Path to input file (optional, if not specified reads from stdin)"
  )
  .option(
    "-o, --output",
    "Path to output file (optional, if not specified prints to console)"
  )
  .option(
    "-b, --buffer-size",
    "Number of audio samples in one unit of analysis. Must be a power of two.",
    512
  )
  .option("-h, --hop-size", "Hop size in samples")
  .option(
    "-m, --mfcc",
    "Number of mfcc co-efficients that the mfcc feature extractor should return",
    13
  )
  .option("-w, --windowing", "Windowing function", "hanning")
  .option("-f, --format", "Type of output file", "stdout")
  .action((features) => {
    const options = parseReceivedOptions({
      features,
      ...program.opts(),
    });
    prepareMeyda(options);
    cli(options);
  });

program.parse(process.argv);

function prepareMeyda(options: CliOptions) {
  // @ts-ignore
  Meyda.bufferSize = options.bufferSize;
  // @ts-ignore
  Meyda.hopSize = options.hopSize;
  // @ts-ignore
  Meyda.numberOfMFCCCoefficients = options.mfcc;
  // @ts-ignore
  Meyda.windowingFunction = options.windowing;
}

function getInputStream(filename?: string): NodeJS.ReadableStream {
  if (!filename) {
    return process.stdin;
  }
  return createReadStream(resolve(filename));
}

function getOutputStream(filename?: string): NodeJS.WritableStream {
  if (!filename) {
    return process.stdout;
  }
  return createWriteStream(resolve(filename));
}

class WavDecodeStream extends Transform {}

class MeydaAnalysisStream extends Transform {}

function cli(options: CliOptions) {
  // TODO: stopped here because wav-loader requires a sync read file, not a stream
  // Same with wav-decoder. Don't really want to rewrite the existing one.
  const inputStream = getInputStream(options.input);
  const outputStream = getOutputStream(options.output);
  const meydaAnalysisStream = new MeydaAnalysisStream();

  pipeline(
    inputStream,
    new WavDecodeStream(),
    new SampleBufferStream(options.bufferSize, options.hopSize),
    meydaAnalysisStream,
    outputStream
  );
}
