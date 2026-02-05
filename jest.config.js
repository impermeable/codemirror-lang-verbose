const { createDefaultEsmPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultEsmPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg
  },
  testMatch: ["**/__tests__/**/?(*.)+(spec|test).?([mc])[jt]s?(x)"]
};