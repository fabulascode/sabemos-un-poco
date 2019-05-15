const { prisma } = require("../../generated/prisma-client");

export async function createBondHearing(data) {
  try {
    const result = await prisma.createHearing({
      ...data
    });
    return result;
  } catch (err) {
    console.log(err);
  }
}

export async function createJudge(judge, logger) {
  try {
    const name = parseJudgeName(judge);
    const result = await prisma.createJudge({
      ...name
    });
    return {
      [judge]: result
    };
  } catch (err) {
    logger.log({
      level: "error",
      message: err
    });
  }
}

export function parseHearingLocationName(location) {
  if (!location) {
    return {
      name: "UNKNOWN",
      iceName: "UNKNOWN",
      ccgBaseCityName: "UNKNOWN"
    };
  }
  return {
    name: location.hearingLocation,
    iceName: location.hearingLocation,
    ccgBaseCityName: location.ccgBaseCityName,
    location: location.enhancedHearingLocation
  };
}

export async function createHearingLocation(location, logger) {
  try {
    const data = parseHearingLocationName(location);
    const newLocation = await prisma.createHearingLocation(data);
    return { [newLocation.iceName]: newLocation };
  } catch (err) {
    logger.log({
      level: "error",
      message: err
    });
  }
}

export function parseJudgeName(name) {
  const parts = name.split(" ");
  switch (parts.length) {
    case 1:
      return {
        iceName: name,
        lastName: parts[0],
        firstName: "CORRUPT"
      };
    case 2:
      return {
        iceName: name,
        lastName: parts[1],
        firstName: parts[0]
      };
    case 3:
      return {
        iceName: name,
        lastName: parts[2],
        middleName: parts[1],
        firstName: parts[0]
      };
    default:
      const [firstName, middleName, ...rest] = parts;
      return {
        iceName: name,
        firstName,
        middleName,
        lastName: rest.join(" ")
      };
  }
}
