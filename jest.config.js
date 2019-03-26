module.exports = {
	"roots": [
		"tests"
	],
	"transform": {
		"^.+\\.tsx?$": "ts-jest"
	},
	"testRegex": "(/tests/.*|(\\.|/)(test|spec))\\.tsx?$",
	"moduleFileExtensions": [
		"ts",
		"tsx",
		"js",
		"jsx",
		"json",
		"node"
	],
  "globals": {
    "ts-jest": {
    }
  }
}
