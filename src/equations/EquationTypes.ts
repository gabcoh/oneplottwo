/*
 * This is an enum with a list of possible equation types which should be passed to
 * parse equation so it knows how to interpet raw equations which can potentially be
 * ambiguous
 */

export enum EquationTypes {
  Rectangular,
  Spherical,
  Cylindrical,
}
