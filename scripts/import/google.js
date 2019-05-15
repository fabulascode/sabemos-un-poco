require("dotenv").config();
const fetch = require("node-fetch");

export const askGoogleForLocation = async place => {
  const url = new URL(
    `https://maps.googleapis.com/maps/api/place/findplacefromtext/json`
  );
  url.searchParams.set("key", process.env.GOOGLE_MAPS_API_KEY);
  url.searchParams.set("input", `${place} detention`);
  url.searchParams.set("inputtype", "textquery");
  url.searchParams.set(
    "fields",
    "formatted_address,id,place_id,geometry,icon,name,photos"
  );

  const init = await fetch(url.href);
  const result = await init.json();

  if (result.status !== "OK") {
    return {
      [place]: {}
    };
  }

  const [local, ...rest] = result.candidates;

  return {
    [place]: {
      name: local.name,
      googleId: local.id,
      placeId: local.place_id,
      photos: { set: local.photos || {} },
      formatted_address: local.formatted_address,
      geometry: { set: local.geometry || {} }
    }
  };
};
