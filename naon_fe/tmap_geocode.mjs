import fs from "node:fs/promises";

const fetchFn = globalThis.fetch ?? (await import("node-fetch")).default;

// ---- CLI & ENV 설정 ----
function getArg(name) {
  const i = process.argv.indexOf(name);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : null;
}
const INPUT_PATH =
  process.env.INPUT_PATH || getArg("--input") || "./cctv_by_region_10_each_parsed.json";
const OUTPUT_PATH =
  process.env.OUTPUT_PATH || getArg("--output") || "./cctv_geocoded_tmap.json";
const SLEEP_MS = Number(process.env.SLEEP_MS || getArg("--sleep-ms") || 200);
const TMAP_KEY = process.env.TMAP_APP_KEY;

if (!TMAP_KEY) {
  console.error("ERROR: TMAP_APP_KEY 환경변수를 설정하세요.");
  process.exit(1);
}

// ---- 상수 ----
const TMAP_GEOCODE_URL = "https://apis.openapi.sk.com/tmap/geo/fullAddrGeo";

// ---- 유틸 ----
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

function toNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

// 주소 질의 생성: (지역 + CCTV 명칭) 기반으로 전처리
function buildQuery(region, rawName) {
  if (!rawName) return `부산광역시 ${region}`.trim();
  let s = String(rawName);

  // 앞쪽 (10차) 같은 괄호 코드/차수 제거
  s = s.replace(/^\([^)]*\)\s*/g, "");
  // 앞쪽 숫자/언더스코어 코드 제거
  s = s.replace(/^[0-9_-]+/g, "");
  // 언더스코어 → 공백
  s = s.replace(/_/g, " ");
  // 한글-숫자 사이/숫자-한글 사이 공백
  s = s.replace(/([가-힣])(\d)/g, "$1 $2").replace(/(\d)([가-힣])/g, "$1 $2");
  // (고1), (돔) 같은 노이즈 제거
  s = s.replace(/\(고\d+\)|\(돔\)/g, "");
  // 공백 정리
  s = s.replace(/\s+/g, " ").trim();

  return `부산광역시 ${region} ${s}`.trim();
}

// Tmap 응답에서 위경도 추출
function extractLatLng(json) {
  const ci = json?.coordinateInfo;
  if (ci) {
    const lat = toNum(ci.lat);
    const lon = toNum(ci.lon);
    if (lat != null && lon != null) return { lat, lng: lon };

    if (Array.isArray(ci.coordinate) && ci.coordinate.length > 0) {
      const c0 = ci.coordinate[0];
      const candidates = [
        { lat: toNum(c0?.lat), lng: toNum(c0?.lon) },
        { lat: toNum(c0?.newLat), lng: toNum(c0?.newLon) },
        { lat: toNum(c0?.frontLat), lng: toNum(c0?.frontLon) },
      ];
      for (const c of candidates) {
        if (c.lat != null && c.lng != null) return c;
      }
    }
  }

  // 어디에 있을지 몰라 깊이 탐색
  const stack = [json];
  while (stack.length) {
    const cur = stack.pop();
    if (cur && typeof cur === "object") {
      if ("lat" in cur && "lon" in cur) {
        const la = toNum(cur.lat),
          lo = toNum(cur.lon);
        if (la != null && lo != null) return { lat: la, lng: lo };
      }
      if ("newLat" in cur && "newLon" in cur) {
        const la = toNum(cur.newLat),
          lo = toNum(cur.newLon);
        if (la != null && lo != null) return { lat: la, lng: lo };
      }
      for (const v of Object.values(cur)) stack.push(v);
    }
  }
  return null;
}

async function geocodeOne(query) {
  const url = new URL(TMAP_GEOCODE_URL);
  url.searchParams.set("version", "1");
  url.searchParams.set("format", "json");
  url.searchParams.set("coordType", "WGS84GEO");
  url.searchParams.set("fullAddr", query);

  const res = await fetchFn(url, {
    method: "GET",
    headers: { appKey: TMAP_KEY },
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`HTTP ${res.status} - ${txt}`);
  }
  const data = await res.json();
  const ll = extractLatLng(data);
  if (!ll) throw new Error(`No lat/lng in response for "${query}"`);
  return ll;
}

async function main() {
  const rows = JSON.parse(await fs.readFile(INPUT_PATH, "utf-8"));
  const out = [];
  let ok = 0,
    fail = 0;

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const region = r["지역"] ?? "";
    const name = r["CCTV 명칭"] ?? "";
    const query = buildQuery(region, name);

    try {
      const { lat, lng } = await geocodeOne(query);
      out.push({
        ...r,
        query,
        lat,
        lng,
        geocodeProvider: "TMAP",
        geocodeStatus: "OK",
      });
      ok++;
    } catch (e) {
      out.push({
        ...r,
        query,
        geocodeProvider: "TMAP",
        geocodeStatus: "ERROR",
        geocodeError: String(e),
      });
      fail++;
    }

    process.stdout.write(`\r[${i + 1}/${rows.length}] OK=${ok} FAIL=${fail}`);
    await sleep(SLEEP_MS);
  }

  await fs.writeFile(OUTPUT_PATH, JSON.stringify(out, null, 2), "utf-8");
  console.log(`\nSaved → ${OUTPUT_PATH}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});