import * as tf from "@tensorflow/tfjs";

const modelUrl = "http://localhost:3000/data/tfjs/model.json";

export class Generator {
    private size: number;
    private model?: tf.GraphModel;
    public constructor (size: number) {
        this.size = size;
    }
    public async loadModel(): Promise<void> {
        this.model = await tf.loadGraphModel(modelUrl);
        await this.generate();
    }
    public async generate(): Promise<ImageData> {
        const now = new Date().getTime();
        const data: tf.TypedArray = tf.tidy(() => {
            const inputs: tf.Tensor = tf.randomNormal([1, 512]);
            const outputs: tf.Tensor = this.model?.execute(inputs) as tf.Tensor;
            return tf.squeeze(outputs, [0]).pad([[0, 0], [0, 0], [0, 1]], 256).reshape([-1]).dataSync();
        });
        console.log(`${new Date().getTime() - now} ms`);
        return new ImageData(new Uint8ClampedArray(data), this.size, this.size);
    }
}
