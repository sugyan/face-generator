import React, { useCallback, useEffect, useRef, useState } from "react";
import { generator } from "./utils/generator";

interface ImageProps {
  imagedata: ImageData;
}

const Image: React.FC<ImageProps> = (props) => {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (canvas && canvas.current) {
      const ctx = canvas.current.getContext("2d")!;
      ctx.putImageData(props.imagedata, 0, 0);
    }
  }, [props.imagedata]);
  return (
    <div className="column is-narrow pr-0 pb-0">
      <canvas ref={canvas} height={256} width={256} />
    </div>
  );
};

const App: React.FC = () => {
  const [images, setImages] = useState<JSX.Element[]>([]);
  const generate = useCallback(async () => {
    const imagedata = await generator.generate();
    setImages([
      ...images,
      <Image imagedata={imagedata} key={`image-${images.length}`} />,
    ]);
  }, [images]);
  return (
    <div className="App">
      <div className="container">
        <button className="button is-primary my-3" onClick={generate}>
          generate
        </button>
        <div className="columns is-desktop is-multiline">{images}</div>
      </div>
    </div>
  );
};

export default App;
