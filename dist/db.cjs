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

// src/db.ts
var db_exports = {};
__export(db_exports, {
  cosineSim: () => cosineSim,
  getAllPages: () => getAllPages,
  logChat: () => logChat,
  upsertPage: () => upsertPage
});
module.exports = __toCommonJS(db_exports);
var import_nedb_promises = __toESM(require("nedb-promises"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var dataDir = import_path.default.resolve(".c2cai");
import_fs.default.mkdirSync(dataDir, { recursive: true });
var pagesDB = import_nedb_promises.default.create({ filename: import_path.default.join(dataDir, "pages.db"), autoload: true });
var chatsDB = import_nedb_promises.default.create({ filename: import_path.default.join(dataDir, "chats.db"), autoload: true });
async function upsertPage(p) {
  await pagesDB.update({ url: p.url }, p, { upsert: true });
}
async function getAllPages() {
  return await pagesDB.find({});
}
async function logChat(rec) {
  await chatsDB.insert(rec);
}
function cosineSim(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    const x = a[i], y = b[i];
    dot += x * y;
    na += x * x;
    nb += y * y;
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-8);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  cosineSim,
  getAllPages,
  logChat,
  upsertPage
});
//# sourceMappingURL=db.cjs.map