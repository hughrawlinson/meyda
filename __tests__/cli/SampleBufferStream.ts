import {SampleBufferStream} from "../../src/cli/SampleBufferStream";

describe(SampleBufferStream, () => {
  it("should be able to create a SampleBufferStream", () => {
    const stream = new SampleBufferStream(10, 10);
    expect(stream).toBeDefined();
  });

  it("should be able to write to a SampleBufferStream", () => {
    const stream = new SampleBufferStream(10, 10);
    const buffer = new Float32Array(10);
    stream.write(buffer);
    expect(stream.buffer).toBe(buffer);
  });

  it("should be able to read from a SampleBufferStream", () => {
    const stream = new SampleBufferStream<Float32Array, Float32Array>(10, 10);
    const buffer = new Float32Array(10);
    stream.write(buffer);
    const readBuffer = stream.read(10);
    expect(readBuffer).toBe(buffer);
  });

  it("should be able to read from a SampleBufferStream with offset", () => {
    const stream = new SampleBufferStream(10, 10);
    const buffer = new Float32Array(10);
    stream.write(buffer);
    const readBuffer = new Float32Array(10);
    stream.read(readBuffer, 5);
    expect(readBuffer).toBe(buffer.subarray(5));
  });

  it("should be able to read from a SampleBufferStream with offset and length", () => {
    const stream = new SampleBufferStream(10, 10);
    const buffer = new Float32Array(10);
    stream.write(buffer);
    const readBuffer = new Float32Array(10);
    stream.read(readBuffer, 5, 5);
    expect(readBuffer).toBe(buffer.subarray(5, 10));
  });

  it("should be able to read from a SampleBufferStream with offset and length and end", () => {
    const stream = new SampleBufferStream(10, 10);
    const buffer = new Float32Array(10);
    stream.write(buffer);
    const readBuffer = new Float32Array(10);
    stream.read(readBuffer);
    expect(readBuffer).toBe(buffer.subarray(5, 10));
  });
});