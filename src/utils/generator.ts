import Worker from "worker-loader!../Worker"; // eslint-disable-line import/no-webpack-loader-syntax

class Generator {
  private worker: Worker;
  constructor() {
    this.worker = new Worker();
  }
  generate(): Promise<ImageData> {
    return new Promise((resolve) => {
      this.worker.addEventListener(
        "message",
        (event: MessageEvent) => resolve(event.data.imagedata),
        { once: true }
      );
      this.worker.postMessage(null);
    });
  }
}

export const generator = new Generator();
