import { exchangeCSVForJSON, writeJSONToDisk } from "./csv";
import { askGoogleForLocation } from "./google";
import {
  conformPropertyNames,
  returnSetOfUniquePropertyValues,
  mapHearingLocationsToBondHearings,
  parseHearingLocations
} from "./helpers";
import {
  createJudge,
  createHearingLocation,
  parseJudgeName,
  parseHearingLocationName,
  createBondHearing
} from "./api";
import _ from "lodash";
const logger = require("../logger");

export default class Migrate {
  constructor(params) {
    this.params = params;
    this.migrationStarted = Date.now();
    this.migrationCount = 0;
    this.initMigrate();
  }

  async initMigrate() {
    try {
      this.csv = await this.loadCSV();
      this.raw = this.conformRawData();
      this.hearingLocations = await this.parseHearingLocations();
      this.data = await this.mapHearingLocations();
      this.judges = await this.migrateJudges();
      this.locations = await this.migrateHearingLocations();
      this.hearings = await this.migrateBondHearings();
    } catch (err) {
      logger.error({
        message: err
      });
    }
  }

  async mapHearingLocations() {
    try {
      return mapHearingLocationsToBondHearings({
        result: this.raw,
        hearingLocations: this.hearingLocations
      });
    } catch (err) {
      logger.error({
        message: err
      });
    }
  }

  async parseHearingLocations() {
    const { pathToHearingLocationJsonFile } = this.params;
    try {
      return parseHearingLocations(pathToHearingLocationJsonFile);
    } catch (err) {
      logger.error({
        message: err
      });
    }
  }

  conformRawData() {
    return conformPropertyNames(this.csv);
  }

  async loadCSV() {
    const { pathToCSVFile } = this.params;
    try {
      return exchangeCSVForJSON({ pathToCSVFile });
    } catch (err) {
      logger.error({
        message: err
      });
    }
  }

  async migrateJudges() {
    let judgeMap = {};
    const judges = returnSetOfUniquePropertyValues(this.data, "judge");
    for (const judge of judges) {
      try {
        const result = await createJudge(judge, logger);
        judgeMap = Object.assign({}, judgeMap, { ...result });
      } catch (err) {
        logger.log({
          level: "error",
          message: err
        });
      }
    }
    return judgeMap;
  }

  async migrateHearingLocations() {
    let hearingMap = {};
    const listOfHearingLocationNames = Object.keys(this.hearingLocations);
    for (const location of listOfHearingLocationNames) {
      try {
        const temp = _.find(this.data, f => f.hearingLocation === location);
        const result = await createHearingLocation(temp);
        hearingMap = Object.assign({}, hearingMap, { ...result });
      } catch (err) {
        logger.log({
          level: "error",
          message: err
        });
      }
    }
    return hearingMap;
  }

  async migrateBondHearings() {
    const hearingResults = [];
    const timeStart = Date.now();
    for (const hearing in this.data) {
      const data = this.data[hearing];
      const judgeName = parseJudgeName(data.judge);
      const hearingLocation = parseHearingLocationName(data);
      const params = {
        judge: { connect: { id: this.judges[judgeName.iceName].id } },
        location: {
          connect: { id: this.locations[hearingLocation.iceName].id }
        },
        determination: {
          create: {
            determinationId: data.determinationId,
            determinationDescription: data.determinationDescision,
            determinationDate: data.determinationDate,
            determinationRevised: data.newBond ? true : false,
            determinationAmount: data.newBond
              ? data.newBond
              : data.initialBond
              ? data.initialBond
              : null
          }
        }
      };
      try {
        const result = await createBondHearing(params);
        this.migrationCount = this.migrationCount + 1;
        const percentDone = this.migrationCount / this.data.length;
        console.clear();
        console.log(`Total Records To Migrate: ${this.data.length}`);
        console.log(`Total Done: ${this.migrationCount}`);
        console.log(`Percent Done: ${percentDone * 100}%`);
        console.log(
          `Time Elapsed: ${Math.abs(timeStart - Date.now()) / 1000} seconds`
        );
        const secEl = Math.abs(timeStart - Date.now()) / 1000;
        console.log(
          `Migration Rate: ${this.migrationCount / secEl} per second`
        );
      } catch (err) {
        console.log(err);
      }
    }
  }
}

async function getGoogleLocationForHearingLocations(result) {
  /*
   * You shouldn't need to, but, just in case, to run this function you must:
   * (1) have a GoogleMaps API key;
   * (2) create a file named `.env` in the project root; and
   * (3) add the following line: GOOGLE_MAPS_API_KEY="< YOUR API KEY GOES HERE >"
   */

  let hearingLocations = returnSetOfUniquePropertyValues(
    result,
    "hearingLocation"
  );
  hearingLocations = Array.from(hearingLocations).map(location =>
    askGoogleForLocation(location)
  );

  hearingLocations = await Promise.all(hearingLocations)
    .then(data => data)
    .catch(err => console.log(err));

  writeJSONToDisk({
    filename: "../../data/detcenters.json",
    json: JSON.stringify(hearingLocations)
  });
}
