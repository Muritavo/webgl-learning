/// <reference types="react-scripts" />

declare module "*.vert" {
  const src: string;
  export default src;
}

declare module "*.frag" {
  const src: string;
  export default src;
}

type Coordinate = [number, number, number];