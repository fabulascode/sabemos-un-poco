const csv = require("csvtojson/v2");
const path = require("path");
const fs = require("fs");

export async function exchangeCSVForJSON({ pathToCSVFile }) {
  try {
    return await csv().fromFile(path.resolve(__dirname, pathToCSVFile));
  } catch (error) {
    console.log("ERROR IN CSV XC", error);
  }
}

export async function writeJSONToDisk({ filename, json }) {
  fs.writeFile(path.resolve(__dirname, filename), json, err => {
    if (err) {
      console.log(err);
      return;
    }
    console.log(`Data Saved: ${path.resolve(__dirname, filename)}`);
  });
}

export async function readJSONFromDisk({ pathToJSONFile }) {
  const rawData = fs.readFileSync(path.resolve(__dirname, pathToJSONFile));
  return await JSON.parse(rawData);
}
