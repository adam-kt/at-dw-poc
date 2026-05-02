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

function extractContext(feature: MapboxGeocodingResponse["features"][number]) {
  let city = "";
  let stateCode = "";
  let zipcode = "";

  for (const ctx of feature.context ?? []) {
    if (ctx.id.startsWith("place")) {
      city = ctx.text;
    } else if (ctx.id.startsWith("region")) {
      stateCode = ctx.short_code?.replace("US-", "") ?? "";
    } else if (ctx.id.startsWith("postcode")) {
      zipcode = ctx.text;
    }
  }

  return { city, stateCode: stateCode.toUpperCase(), zipcode };
}

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
  const { city, stateCode } = extractContext(postcodeFeature);

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
    stateCode,
    state: STATE_CODES[stateCode] ?? stateCode,
    streetAddress,
    zipcode,
  };
}

async function geocodeAddress(address: string) {
  const encoded = encodeURIComponent(address);
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json?types=address&country=US&limit=1&access_token=${MAPBOX_TOKEN}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Mapbox API error: ${res.status}`);
  }

  const data: MapboxGeocodingResponse = await res.json();

  if (!data.features || data.features.length === 0) {
    throw new Error(`No results found for address: ${address}`);
  }

  const feature = data.features[0];
  const { city, stateCode, zipcode } = extractContext(feature);
  const streetAddress = feature.place_name.replace(/, United States$/, "");

  return {
    city,
    stateCode,
    state: STATE_CODES[stateCode] ?? stateCode,
    streetAddress,
    zipcode,
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

  const data = await res.json();
  return data?.data?.authorities?.[0] ?? null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const query: string = (body.query ?? body.zipcode ?? body.address ?? "")
      .toString()
      .trim();

    if (!query) {
      return NextResponse.json(
        { error: "Please enter an address or 5-digit US ZIP code." },
        { status: 400 }
      );
    }

    if (!MAPBOX_TOKEN) {
      return NextResponse.json(
        { error: "Mapbox access token is not configured." },
        { status: 500 }
      );
    }

    const isZip = /^\d{5}$/.test(query);
    const geo = isZip
      ? await geocodeZipcode(query)
      : await geocodeAddress(query);

    if (!geo.streetAddress) {
      return NextResponse.json(
        { error: "Could not resolve a street address for this input." },
        { status: 422 }
      );
    }

    if (!geo.stateCode) {
      return NextResponse.json(
        { error: "Could not determine a US state for this input." },
        { status: 422 }
      );
    }

    // Build a DW-friendly address (no commas, state abbreviation)
    // Mapbox returns: "123 Main St, Denver, Colorado 80202"
    // DW expects:     "123 Main St Denver CO 80202"
    const dwAddress = geo.state
      ? geo.streetAddress
          .replace(/, /g, " ")
          .replace(new RegExp(`\\b${geo.state}\\b`), geo.stateCode)
      : geo.streetAddress.replace(/, /g, " ");

    const [allElections, authority] = await Promise.all([
      fetchElections(dwAddress),
      fetchStateAuthority(geo.stateCode),
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const elections = (allElections as Array<{ date?: string }>).filter((e) => {
      if (!e.date) return false;
      const d = new Date(e.date);
      return !Number.isNaN(d.getTime()) && d >= today;
    });

    const response = {
      address: {
        city: geo.city,
        state: geo.state,
        stateCode: geo.stateCode,
        zipcode: geo.zipcode,
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
