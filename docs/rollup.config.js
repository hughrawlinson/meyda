import nodePolyfills from "rollup-plugin-node-polyfills";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
import commonjs from "@rollup/plugin-commonjs";
import babel from "@rollup/plugin-babel";

export default {
  input: "./src/main.js",
  output: {
    file: "./assets/main.js",
    format: "iife",
    name: "meydaDemo",
  },
  plugins: [
    nodePolyfills(),
    nodeResolve({
      browser: true,
    }),
    commonjs(),
    babel({ babelHelpers: "bundled" }),
    terser(),
  ],
};
