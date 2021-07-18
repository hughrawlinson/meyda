import { Transform } from "stream";

export class SampleBufferStream<
  T extends ArrayLike<any>,
  U extends ArrayLike<any>
> extends Transform {
  bufferSize: number;
  hopSize: number;
  buffer: U[];
  constructor(bufferSize: number, hopSize: number) {
    super();
    this.buffer = [];
    this.bufferSize = bufferSize;
    // cli accepts the hop size between frames, here we want it as an offset
    // of the current frame position
    this.hopSize = hopSize - bufferSize;
    if (this.hopSize < -bufferSize + 1) {
      throw new Error(
        "Hop size must be greater than -bufferSize - we can't stand still or go backwards."
      );
    }
  }

  transform(
    chunk: T,
    _encoding: string,
    callback: (error?: any, data?: U[]) => void
  ) {
    this.buffer = this.buffer.concat(chunk);

    if (this.buffer.length >= this.bufferSize) {
      if (this.hopSize > 0) {
        // positive hop size means skipping some samples
        this.buffer = this.buffer.slice(this.hopSize);
      }
      this.push(this.buffer.slice(0, this.bufferSize));
      if (this.hopSize < 0) {
        // negative hop size means keeping some samples around for longer than one buffer
        this.buffer = this.buffer.slice(this.bufferSize - this.hopSize);
      }
    }

    callback();
  }
}
