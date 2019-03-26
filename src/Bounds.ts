/*
 * TODO improve this header with documentation
 */
// Not really sure how I'm going to implement different types of graphing, but
// its probably not a bad idea to specify rectangular bounds here now.
export interface RectangularBounds {
  minX: number;
  maxX: number;

  minY: number;
  maxY: number;

  minZ: number;
  maxZ: number;
}
