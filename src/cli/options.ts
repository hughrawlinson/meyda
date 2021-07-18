import { statSync } from "fs";
const validFormats = ["csv", "json", "stdout"] as const;

function isNumber(n: any): n is number {
  try {
    const m = Number(n);
    return !isNaN(m);
  } catch (e) {
    return false;
  }
}

export interface CliOptions {
  input?: string;
  // TODO: this should reference the discriminated union on Meyda
  features: string[];
  output?: string;
  bufferSize: number;
  hopSize: number;
  mfcc: number;
  // TODO: this should reference the discriminated union in Meyda
  windowing: string;
  format: typeof validFormats[number];
}

function fileExists(filename: string): boolean {
  try {
    return statSync(filename).isFile();
  } catch (e) {
    return false;
  }
}

function isOneOf<T>(options: readonly T[], x: any): x is T {
  return x in options;
}

const p = "a".slice(0);
if (isOneOf(["a", "b"] as const, p)) {
  p;
}

export function parseReceivedOptions(receivedOptions: {
  [key: string]: unknown;
}): CliOptions {
  switch (true) {
    case typeof receivedOptions["input"] !== undefined &&
      !fileExists(receivedOptions["input"] as string):
      throw new Error(`input does not exist: ${receivedOptions["input"]}`);
    case receivedOptions["format"] &&
      receivedOptions["format"] !== "stdout" &&
      receivedOptions["output"] !== undefined:
      throw new Error(
        `You must specify an output file for format ${receivedOptions["format"]}`
      );
    case receivedOptions["format"] &&
      typeof receivedOptions["format"] !== "string":
      throw new Error("Format must be a string");
    case receivedOptions["format"] &&
      typeof receivedOptions["format"] === "string" &&
      !(receivedOptions["format"] in validFormats):
      throw new Error(`Invalid format ${receivedOptions["format"]}`);
    case receivedOptions["bufferSize"] &&
      !isNumber(receivedOptions["bufferSize"]):
      throw new Error(`Invalid buffer size ${receivedOptions["bufferSize"]}`);
    case receivedOptions["hopSize"] && !isNumber(receivedOptions["hopSize"]):
      throw new Error(`Invalid hop size ${receivedOptions["hopSize"]}`);
    case receivedOptions["mfcc"] && !isNumber(receivedOptions["mfcc"]):
      throw new Error(`Invalid mfcc ${receivedOptions["mfcc"]}`);
    case !isOneOf(validFormats, receivedOptions["format"]):
      throw new Error(
        `Invalid format ${receivedOptions["format"]}. Must be one of ${validFormats}`
      );
    // TODO: validate features and windowing like format above
    case typeof receivedOptions["windowing"] !== "string":
      throw new Error("windowing must be a string");
  }

  return {
    input: receivedOptions["input"] as string | undefined,
    features: receivedOptions["features"] as string[],
    output: receivedOptions["output"] as string,
    bufferSize: Number(receivedOptions["bufferSize"]) || 512,
    hopSize: Number(receivedOptions["hopSize"]) || 512,
    mfcc: Number(receivedOptions["mfcc"]) || 13,
    windowing: (receivedOptions["windowing"] as string) || "hanning",
    format:
      (receivedOptions["format"] as typeof validFormats[number]) || "stdout",
  };
}
