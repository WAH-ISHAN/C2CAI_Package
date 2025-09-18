"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/config.ts
var config_exports = {};
__export(config_exports, {
  env: () => env,
  loadConfig: () => loadConfig
});
module.exports = __toCommonJS(config_exports);
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config({ path: ".env.c2cai" });
function loadConfig() {
  const p = import_path.default.resolve(process.cwd(), "c2cai.config.json");
  const cfg = JSON.parse(import_fs.default.readFileSync(p, "utf8"));
  return cfg;
}
var env = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  MODEL: process.env.C2CAI_MODEL || "gpt-4o-mini",
  EMBED_MODEL: process.env.C2CAI_EMBED_MODEL || "text-embedding-3-small"
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  env,
  loadConfig
});
//# sourceMappingURL=config.cjs.map