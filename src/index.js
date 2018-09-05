#! /usr/bin/env node

const commandLineArgs = require("command-line-args");
const isValid = require("is-valid-path");
const fileSystem = require("fs");
const globals = require("node-global-storage");

let _path = globals.get("path");

const cmds = commandLineArgs([{ name: "command", defaultOption: true }], {
  stopAtFirstUnknown: true
});

const argv = cmds._unknown || [];

switch (cmds.command) {
  case "create": {
    const args = commandLineArgs(
      [
        {
          name: "path",
          type: String,
          alias: "p"
        },
        { name: "languages", type: String, multiple: true, defaultOption: true }
      ],
      { argv }
    );

    create(args.path, args.languages);
    break;
  }

  case "insert": {
    const args = commandLineArgs(
      [
        { name: "path", type: String, alias: "p" },
        { name: "key", type: String, alias: "k" },
        { name: "values", type: String, multiple: true, alias: "v" }
      ],
      { argv }
    );

    if (args.path === undefined) {
      if (!isValid(_path)) throw Error("Selected path seems to be invalid.");

      if (_path === undefined)
        throw Error("Select a path before inserting translations.");
    } else {
      if (!isValid(args.path)) throw Error("Path seems to be invalid.");
    }

    if (args.key === undefined) throw Error("Key has to be defined.");
    if (args.values === undefined) throw Error("Values have to be defined.");

    if (args.values.length > 1) {
      bulkInsert(args.path || _path, args.key, args.values);
    } else {
      insert(args.path || _path, args.key, args.values[0]);
    }
    break;
  }

  case "select": {
    const args = commandLineArgs(
      [{ name: "path", type: String, alias: "p", defaultOption: true }],
      { argv }
    );

    if (args.path === undefined) throw Error("Path has to be defined.");

    if (!fileSystem.existsSync(args.path))
      throw Error("File under " + args.path + " does not exist.");

    select(args.path);
    break;
  }

  case "selected": {
    if (_path === undefined) return console.log("There is no selected file.");
    console.log("Selected file: " + _path + ".");
    break;
  }

  case "exists": {
    console.log("Exists command is coming soon...");
    break;
  }

  default:
    return console.log("Usage: \n  insert - Some text\n  select - Some text");
}

/**
 *
 * @param {*} path
 * @param {*} languages
 */
function create(path = "./langlations.json", languages) {
  if (languages === undefined)
    throw Error("There is not a single language selected.");

  if (fileSystem.existsSync(path))
    throw Error("File under " + path + " already exists.");

  let structure = {};

  for (var i = 0; i < languages.length; i++) {
    const key = languages[i];

    structure[key] = {};
  }

  fileSystem.appendFile(path, JSON.stringify(structure), function(err) {
    if (err) throw err;

    console.log("File " + path + " created with", languages);
    select(path, false);
  });
}

/**
 *
 * @param {*} path
 * @param {*} log
 */
function select(path, log = true) {
  if (!fileSystem.existsSync(path))
    throw Error("File under " + path + " does not exist.");

  var __path = require("path");

  _path = __path.resolve(path);
  globals.set("path", _path, { protected: true });
  if (log) console.log("File under " + _path + " has been selected.");
}

/**
 *
 * @param {*} path
 * @param {*} key
 * @param {*} language
 * @param {*} value
 */
function insert(path, key, language, value) {
  var fileName = path;
  var file = require(fileName);

  file[language][key] = value;

  fileSystem.writeFile(fileName, JSON.stringify(file), function(err) {
    if (err) throw err;

    console.log("Added " + _key + " to " + _path + ".");
  });
}

/**
 *
 * @param {*} path
 * @param {*} key
 * @param {*} values
 */
function bulkInsert(path, key, values) {
  for (var i = 0; i < values.length; i++) insert(path, key, values[i]);
}
