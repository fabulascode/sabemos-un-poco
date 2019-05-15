import Migrate from "./import";

const params = {
  pathToCSVFile: "../../data/bonds.csv",
  pathToHearingLocationJsonFile: "../../data/detcenters.json"
};

async function main() {
  const migrator = new Migrate(params);
}

main();
