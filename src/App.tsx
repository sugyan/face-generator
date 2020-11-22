import React, { useRef, useState } from "react";
import { Generator } from "./lib/generator";

const generator = new Generator(256);

const App: React.FC = () => {
    const canvas = useRef<HTMLCanvasElement>(null);
    const [loaded, setLoaded] = useState<boolean>(false);
    const [generating, setGenerating] = useState<boolean>(false);
    const loadModel = async () => {
        try {
            await generator.loadModel();
            setLoaded(true);
        } catch (err) {
            console.error(err);
        }
    };
    const generateFace = async () => {
        setGenerating(true);
        const imageData: ImageData = await generator.generate();
        const ctx = canvas.current?.getContext("2d");
        ctx?.putImageData(imageData, 0, 0);
        setGenerating(false);
    };
    return (
      <div>
        <p>
          {loaded
            ? <button disabled={generating} onClick={() => { generateFace(); }}>Generate</button>
            : <button autoFocus onClick={() => { loadModel(); }}>load model</button>}
        </p>
        <canvas height={256} width={256} ref={canvas} style={{ border: "black 1px solid" }}></canvas>
      </div>
    );
};

export default App;
