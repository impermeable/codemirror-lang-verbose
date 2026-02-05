#!/usr/bin/env node
import process from "process";
import * as esbuild from "esbuild";

const watch = process.argv.includes("--watch");
const minify = process.argv.includes("--minify") || process.argv.includes("--release");
const disableSourcemap = process.argv.includes("--sourcemap=no");
const genSourcemap = disableSourcemap ? null : { sourcemap: "inline" };

const sharedConfig = {
  entryPoints: ["src/index.ts"],
  outfile: "dist/index.js",
  bundle: true,
  format: "cjs",
  ...genSourcemap,
  platform: "browser",
  minify,
  plugins: [
    {
      name: "log build status",
      setup(build) {
        build.onEnd(result => {
          const errCount = result.errors.length;
          if (errCount > 0) {
            console.error(`❌ Build failed with ${errCount} error${errCount > 1 ? "s" : ""}`);
          } else {
            console.log("✅ Build finished");
          }
        });
      }
    },
  ]
}

if (!watch) {
  // This builds, bundles and optionally minifies the editor package
  await esbuild.build(sharedConfig);
} else {
  const ctx = await esbuild.context(sharedConfig);
  console.log("Watching for file changes...");
  ctx.watch();
}

