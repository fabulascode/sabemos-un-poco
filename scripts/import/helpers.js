import { readJSONFromDisk } from "./csv";

export function conformPropertyNames(rawJson) {
  return rawJson.map(item => ({
    determinationId: item.IDNASSOCBOND,
    judge: item.JUDGE_NAME ? item.JUDGE_NAME : "JUDGE NAME MISSING",
    hearingLocation: item["HEARING LOC NAME"],
    ccgBaseCityName: item["CCG BASE CITY NAME"],
    determinationDate: item.COMP_DATE,
    initialBond: item.INITIAL_BOND,
    newBond: item.NEW_BOND,
    determinationDecision: item["Bond Decision Description"]
  }));
}

export function returnSetOfUniquePropertyValues(arr, property) {
  const result = arr.map(item => item[property]);
  return new Set(result);
}

export function mapHearingLocationsToBondHearings({
  result,
  hearingLocations
}) {
  return result.map(item => {
    return {
      ...item,
      enhancedHearingLocation: hearingLocations[item.hearingLocation]
    };
  });
}

export async function parseHearingLocations(pathToHearingLocationJsonFile) {
  const hearingLocations = await readJSONFromDisk({
    pathToJSONFile: pathToHearingLocationJsonFile
  });

  const hearingLocationMap = {};
  hearingLocations.forEach(item => {
    for (let key in item) {
      hearingLocationMap[key] = item[key];
    }
  });

  return hearingLocationMap;
}
