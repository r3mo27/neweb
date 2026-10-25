import { createPaperPath } from "./crumple-path";

type Job = {
  id: number;
  rest: Float32Array;
  triangles: number[];
  shortSide: number;
  density: number;
  sharpness: number;
  depth: number;
  seed: number;
};

const scope = self as unknown as {
  onmessage: ((event: MessageEvent<Job>) => void) | null;
  postMessage: (message: unknown, transfer: Transferable[]) => void;
};

scope.onmessage = ({ data }) => {
  const path = createPaperPath(
    data.rest,
    data.triangles,
    data.shortSide,
    data.density,
    data.sharpness,
    data.depth,
    data.seed,
  );
  scope.postMessage({ id: data.id, path }, [
    ...path.samples.map((sample) => sample.buffer),
    path.creased.buffer,
  ]);
};
