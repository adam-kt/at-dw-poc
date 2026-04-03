import { NextRequest, NextResponse } from "next/server";
import type { MapboxGeocodingResponse } from "../../types";

const MAPBOX_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;
const DW_API_KEY = process.env.DW_API_KEY;

// US state abbreviation → full name mapping for display
const STATE_CODES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia",
  HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
  KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
  MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi",
  MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire",
  NJ: "New Jersey", NM: "New Mexico", NY: "New York", NC: "North Carolina",
  ND: "North Dakota", OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania",
  RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota", TN: "Tennessee",
  TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia", WA: "Washington",
  WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming", DC: "District of Columbia",
};

async function geocodeZipcode(zipcode: string) {
  // Step 1: Forward geocode zipcode → get center coordinates
  const postcodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${zipcode}.json?types=postcode&country=US&access_token=${MAPBOX_TOKEN}`;
  const postcodeRes = await fetch(postcodeUrl);

  if (!postcodeRes.ok) {
    throw new Error(`Mapbox API error: ${postcodeRes.status}`);
  }

  const postcodeData: MapboxGeocodingResponse = await postcodeRes.json();

  if (!postcodeData.features || postcodeData.features.length === 0) {
    throw new Error(`No results found for zipcode: ${zipcode}`);
  }

  const postcodeFeature = postcodeData.features[0];
  const [lng, lat] = postcodeFeature.center;

  let city = "";
  let stateCode = "";

  for (const ctx of postcodeFeature.context) {
    if (ctx.id.startsWith("place")) {
      city = ctx.text;
    }
    if (ctx.id.startsWith("region")) {
      stateCode = ctx.short_code?.replace("US-", "") ?? "";
    }
  }

  // Step 2: Reverse geocode the coordinates → get a real street address
  const reverseUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?types=address&limit=1&access_token=${MAPBOX_TOKEN}`;
  const reverseRes = await fetch(reverseUrl);

  let streetAddress = "";
  if (reverseRes.ok) {
    const reverseData: MapboxGeocodingResponse = await reverseRes.json();
    if (reverseData.features?.length > 0) {
      // place_name is e.g. "123 Main St, Denver, Colorado 80202, United States"
      // Strip ", United States" suffix — DW API doesn't accept it
      streetAddress = reverseData.features[0].place_name
        .replace(/, United States$/, "");
    }
  }

  return {
    city,
    stateCode: stateCode.toUpperCase(),
    state: STATE_CODES[stateCode.toUpperCase()] ?? stateCode,
    streetAddress,
  };
}

async function fetchElections(address: string) {
  if (!DW_API_KEY) return [];

  const url = new URL("https://api.democracy.works/v2/elections");
  url.searchParams.set("address", address);
  url.searchParams.set("includeBallotData", "true");
  url.searchParams.set("includeQuestionAndAnswer", "true");
  const res = await fetch(url, {
    headers: {
      "x-api-key": DW_API_KEY,
      "Accept": "application/json",
      "Accept-Language": "en",
    },
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`[DW] Elections API error: ${res.status}`, body);
    return [];
  }

  const data = await res.json();
  return data?.data?.elections ?? [];
}

async function fetchStateAuthority(stateCode: string) {
  if (!DW_API_KEY) return null;

  const url = `https://api.democracy.works/v2/authorities/state/${stateCode.toLowerCase()}?includeQuestionAndAnswer=true`;
  const res = await fetch(url, {
    headers: {
      "x-api-key": DW_API_KEY,
      "Accept": "application/json",
      "Accept-Language": "en",
    },
  });

  if (!res.ok) {
    console.error(`DW Authority API error: ${res.status} ${await res.text()}`);
    return null;
  }

  return res.json();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const zipcode = body.zipcode?.trim();

    if (!zipcode || !/^\d{5}$/.test(zipcode)) {
      return NextResponse.json(
        { error: "Please enter a valid 5-digit US zipcode." },
        { status: 400 }
      );
    }

    if (!MAPBOX_TOKEN) {
      return NextResponse.json(
        { error: "Mapbox access token is not configured." },
        { status: 500 }
      );
    }

    // Step 1: Geocode zipcode → coordinates → reverse geocode → full street address
    const geo = await geocodeZipcode(zipcode);

    if (!geo.streetAddress) {
      return NextResponse.json(
        { error: "Could not resolve a street address for this zipcode." },
        { status: 422 }
      );
    }

    // Step 2: Build a DW-friendly address (no commas, state abbreviation)
    // Mapbox returns: "123 Main St, Denver, Colorado 80202"
    // DW expects:     "123 Main St Denver CO 80202"
    const dwAddress = geo.streetAddress
      .replace(/, /g, " ")
      .replace(new RegExp(`\\b${geo.state}\\b`), geo.stateCode);

    // Step 3: Fetch elections (using full address) + authority (using state code) in parallel
    const [elections, authority] = await Promise.all([
      fetchElections(dwAddress),
      fetchStateAuthority(geo.stateCode),
    ]);

    const response = {
      address: {
        city: geo.city,
        state: geo.state,
        stateCode: geo.stateCode,
        zipcode,
        street: geo.streetAddress,
      },
      elections,
      authority,
    };

    return NextResponse.json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : "An unexpected error occurred.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
