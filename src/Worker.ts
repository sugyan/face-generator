import * as tf from "@tensorflow/tfjs";

const ctx: Worker = self as any; // eslint-disable-line no-restricted-globals

(async () => {
  const [mapping_model, synthesis_model] = await Promise.all([
    tf.loadGraphModel(process.env.REACT_APP_MAPPING_MODEL_URL!),
    tf.loadGraphModel(process.env.REACT_APP_SYNTHESIS_MODEL_URL!),
  ]);
  const generate = async (): Promise<ImageData> => {
    console.time("generate");
    const data = tf.tidy(() => {
      const z = tf.randomNormal([1, 512]);
      const ws = mapping_model.execute(z);
      const results = synthesis_model.execute(ws) as tf.Tensor;
      const nhwc = tf.transpose(results, [0, 2, 3, 1]);
      const image = tf.squeeze(nhwc, [0]);
      const rgb = tf.clipByValue(
        tf.cast(
          tf.mul(tf.add(image, tf.scalar(1.0)), tf.scalar(127.5)),
          "int32"
        ),
        0,
        255
      );
      const rgba = tf.pad(
        rgb,
        [
          [0, 0],
          [0, 0],
          [0, 1],
        ],
        255
      );
      return rgba.dataSync();
    });
    console.timeEnd("generate");
    return new ImageData(new Uint8ClampedArray(data), 256, 256);
  };
  ctx.addEventListener("message", async () => {
    ctx.postMessage({ imagedata: await generate() });
  });
})();

export {};
