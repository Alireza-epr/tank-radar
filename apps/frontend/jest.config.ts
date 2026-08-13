import type { Config } from "jest";

const config: Config = {
  testEnvironment: "jsdom",
  roots: ["<rootDir>/src"],
  testMatch: ["**/test/**/*.test.ts"],
  moduleFileExtensions: ["vue", "ts", "js", "json"],
  transform: {
    "^.+\\.vue$": "@vue/vue3-jest",
    // tsconfig.json (root) is solution-style (files: [], only references) -
    // ts-jest needs the real compilerOptions, which live in tsconfig.app.json.
    "^.+\\.ts$": ["ts-jest", { tsconfig: "tsconfig.app.json" }],
  },
  moduleNameMapper: {
    "\\.css$": "<rootDir>/src/test/styleMock.ts",
    "\\.svg\\?raw$": "<rootDir>/src/test/svgRawMock.ts",
    "^maplibre-gl$": "<rootDir>/src/test/maplibreMock.ts",
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};

export default config;
