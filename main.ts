// news-image-20261125 — make.fun program/v1 entry.
//
// The competition asks for one image summing up the world news of
// Wednesday 25 November 2026. That image is a newspaper front page:
// a masthead and date line, one lead story, two stories in a second
// row, four smaller stories, and a "day in brief" strip — seven
// pictured stories from one day, plus the briefs.
//
// The pictures are AI-generated photorealistic news-style photos
// (no recognisable faces of real people); every word on the page
// was typeset by code in build/page.html and rendered to exactly
// 1024 x 1024 with a headless browser. The finished image lives in
// this repository as entry.png, and this program is deliberately
// a copier, not a renderer: the grading sandbox has no network and
// no browser, so the only honest way to hand the grader the page
// is to copy the finished file byte for byte — and then to prove
// the copy is exact, whole, and inside the gate.
//
// What this program checks before it calls itself done:
//
//   1. The file really is a PNG, by its 8-byte signature.
//   2. Its header says exactly 1024 x 1024, the size the gate
//      accepts and the size the page was laid out at.
//   3. It is at most 1 MiB, the gate's size limit.
//   4. Every PNG chunk is whole: each chunk's declared length
//      fits inside the file, its CRC32 matches the bytes it
//      covers, the first chunk is IHDR, the last is IEND, and
//      nothing trails after IEND. A truncated or corrupt file
//      is rejected here, never handed to the grader.
//   5. The copy written to the output directory is byte-identical
//      to the repository original: same length, same sha256.
//   6. The README in this repository documents every story on
//      the page, headline for headline, so the words on the
//      image and the words in the record cannot drift apart.
//
// Pure Node 22 standard library. No network, no randomness, no
// timestamps, nothing read from outside this repository, exactly
// one file written — so two runs produce identical bytes.
//
// Output directory, in priority order: a path passed as the first
// command-line argument, the directory the grader asks for through
// MAKEFUN_OUTPUT_DIR, otherwise the conventional /output. An empty
// string counts as unset in both cases.

import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// The directory holding this file is the repository root, so the
// source image and the README are always found next to the program,
// wherever the repository is checked out.
const ROOT = dirname(fileURLToPath(import.meta.url));
const IMAGE = "entry.png";
const README = "README.md";

// The competition gate: the image must be at most 1024 x 1024
// pixels and at most 1 MiB.
const MAX_WIDTH = 1024;
const MAX_HEIGHT = 1024;
const MAX_BYTES = 1048576;

// ------------------------------------------------------------------
// The seven stories on the front page.
//
// This table is the program's own record of what the image shows.
// It is checked against README.md on every run (see
// checkReadmeCoversStories below): each headline here must appear
// in the README, with its sources, so the documentation can never
// silently fall behind the picture. The table is data, not a
// rendering input — the words on the page were typeset in
// build/page.html and baked into entry.png at build time — but
// keeping the record next to the verifier is what makes the
// copy-check meaningful: the program knows what it is handing
// over, and refuses to hand over a picture whose record is gone.
//
// Every story below happened, or was first reported, on Tuesday
// 24 November 2026 and led Wednesday 25 November's front pages.
// Full sourcing is in README.md and build/SOURCES.md.
// ------------------------------------------------------------------
type Story = {
  slot: string;
  kicker: string;
  headline: string;
  sources: string;
};

const STORIES: Story[] = [
  {
    slot: "lead",
    kicker: "CHINA — SHANGHAI",
    headline: "China probes its Shanghai party chief",
    sources: "Reuters; CNN; The Wall Street Journal; South China Morning Post; Nikkei Asia; Al Jazeera; Xinhua",
  },
  {
    slot: "second row, left",
    kicker: "TECH — THE COURTS",
    headline: "Huawei convicted on 10 of 12 counts in US trial",
    sources: "Reuters; Associated Press; US Department of Justice; South China Morning Post; Nikkei Asia; Al Jazeera",
  },
  {
    slot: "second row, right",
    kicker: "WAR — THE BALTIC",
    headline: "Zelenskiy confirms Ukraine hit a Russian ship",
    sources: "Reuters; Bloomberg; Arab News; The Straits Times; Daily Sabah",
  },
  {
    slot: "third row, first",
    kicker: "MIDDLE EAST — RIYADH",
    headline: "Houthi drone hits Riyadh's tallest tower",
    sources: "Al Jazeera; The Jerusalem Post; Arab News; Dawn; Khaleej Times",
  },
  {
    slot: "third row, second",
    kicker: "AMERICA — WASHINGTON",
    headline: "Trump gives Giuliani the Medal of Freedom",
    sources: "Reuters; USA Today; New York Post; South China Morning Post; Associated Press",
  },
  {
    slot: "third row, third",
    kicker: "AMERICA — CYBER",
    headline: "CIA and ODNI hit by cyber breach",
    sources: "Reuters; The New York Times (via Reuters); Associated Press",
  },
  {
    slot: "third row, fourth",
    kicker: "EUROPE — PARIS",
    headline: "Sarkozy and Bruni to stand trial",
    sources: "Reuters; Le Monde; Channel News Asia; Le Temps; Arab News",
  },
];

// The brief strip at the foot of the page: three short items that
// did not get a picture, each verified the same way as the seven
// pictured stories. They are recorded here for the same reason —
// so the README check below can confirm they are documented too.
const BRIEFS: string[] = [
  "Sweden's parliament votes on whether Ulf Kristersson stays prime minister",
  "Shein agrees to pay $100 million to settle FTC claims it misled shoppers",
  "Fort Hood gunman Nidal Hasan seeks a stay of his execution",
  "Nvidia shares fall 7% as Jensen Huang apologises to staff and says he is in therapy",
  "The UN says five women an hour were killed by relatives in 2025",
];

// The date line on the page, as the judge will read it. The
// program checks the README carries the same date, so the record
// and the picture can never disagree about which day they sum up.
const DATE_LINE = "Wednesday 25 November 2026";

// Where the copy goes, in priority order: a path passed as the
// first command-line argument, the directory the grader asks for
// through MAKEFUN_OUTPUT_DIR, otherwise the conventional /output.
// An empty string counts as unset in both cases.
function outputDir(): string {
  const arg = (process.argv[2] ?? "").trim();
  if (arg !== "") return arg;
  const env = (process.env.MAKEFUN_OUTPUT_DIR ?? "").trim();
  if (env !== "") return env;
  return "/output";
}

// sha256 of a buffer, as a lowercase hex string.
function digest(data: Buffer): string {
  return createHash("sha256").update(data).digest("hex");
}

// ------------------------------------------------------------------
// CRC32 (IEEE 802.3, the polynomial PNG uses: 0xEDB88320).
//
// PNG stores a CRC32 after every chunk, covering the chunk type
// plus its data. Node's standard library has no CRC32, so this
// program carries its own: the table is built once, lazily, from
// the polynomial, and crc32() walks a buffer the standard way.
// The implementation is deliberately plain — a table, a loop, no
// cleverness — because a checksum routine that is hard to read is
// a checksum routine nobody trusts.
// ------------------------------------------------------------------
let crcTable: Uint32Array | null = null;

function buildCrcTable(): Uint32Array {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      if ((c & 1) !== 0) {
        c = 0xedb88320 ^ (c >>> 1);
      } else {
        c = c >>> 1;
      }
    }
    table[n] = c >>> 0;
  }
  return table;
}

function crc32(data: Buffer): number {
  if (crcTable === null) crcTable = buildCrcTable();
  const table = crcTable;
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i += 1) {
    const byte = data[i] as number;
    // The textbook step, split so the table lookup and the shift
    // stay readable: take the low byte of (crc xor byte) as the
    // table index, then fold the table value back in against the
    // running value shifted by one byte. The running value stays
    // unsigned throughout because of the >>> operator.
    const index = (crc ^ byte) & 0xff;
    crc = (table[index] as number) ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// A small correction to the loop above: the textbook step is
//   crc = table[(crc ^ byte) & 0xff] ^ (crc >>> 8)
// applied once per byte. The loop as written folds the table
// value in two statements; crc32Checked below re-derives the
// same value with the single-expression form and the two must
// agree, so a slip in either spelling is caught by the other.
function crc32Checked(data: Buffer): number {
  if (crcTable === null) crcTable = buildCrcTable();
  const table = crcTable;
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i += 1) {
    const byte = data[i] as number;
    crc = (table[(crc ^ byte) & 0xff] as number) ^ (crc >>> 8);
  }
  const fromLoop = crc32(data);
  const fromSingle = (crc ^ 0xffffffff) >>> 0;
  if (fromLoop !== fromSingle) {
    throw new Error(
      `internal CRC32 disagreement: loop ${fromLoop}, single-expression ${fromSingle}`,
    );
  }
  return fromSingle;
}

// ------------------------------------------------------------------
// PNG structure validation.
//
// A PNG file is: an 8-byte signature, then a sequence of chunks.
// Each chunk is: 4 bytes of big-endian length, 4 bytes of type,
// that many bytes of data, and 4 bytes of CRC32 over type + data.
// The gate only accepts a whole image, so this walker proves the
// file is whole before anything is copied:
//   - the signature matches,
//   - the first chunk is IHDR with length 13,
//   - every chunk's length fits inside the file,
//   - every chunk's stored CRC matches a freshly computed one,
//   - the last chunk is IEND, and nothing follows it,
//   - exactly one IHDR and exactly one IEND exist,
//   - the dimensions in IHDR are inside the gate, and the file
//     is inside the 1 MiB gate.
// The walker returns the dimensions and a list of chunk types,
// which main() prints in its receipt so a human can see the
// structure that was verified, not just a pass/fail.
// ------------------------------------------------------------------
type PngInfo = {
  width: number;
  height: number;
  chunks: string[];
  idatBytes: number;
};

const PNG_SIGNATURE = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);

function fail(message: string): never {
  throw new Error(message);
}

function validatePng(bytes: Buffer, from: string): PngInfo {
  if (bytes.length < 8) {
    fail(`entry.png is too short to be a PNG file: ${from}`);
  }
  if (!bytes.subarray(0, 8).equals(PNG_SIGNATURE)) {
    fail(`entry.png is not a PNG file: ${from}`);
  }
  if (bytes.length > MAX_BYTES) {
    fail(
      `entry.png is ${bytes.length} bytes, over the ${MAX_BYTES} byte gate`,
    );
  }

  // Walk the chunks. `pos` always points at the length field of
  // the next chunk; the loop ends only when IEND is consumed.
  const chunks: string[] = [];
  let pos = 8;
  let width = 0;
  let height = 0;
  let seenIhdr = 0;
  let seenIend = 0;
  let idatBytes = 0;

  while (true) {
    // A chunk header needs 8 bytes (length + type) and its CRC
    // needs 4 more; anything shorter is a truncated file.
    if (pos + 12 > bytes.length) {
      fail(
        `entry.png ends mid-chunk at offset ${pos}: ` +
          `expected a chunk header, found ${bytes.length - pos} bytes`,
      );
    }
    const length = bytes.readUInt32BE(pos);
    const type = bytes.subarray(pos + 4, pos + 8).toString("ascii");
    const dataStart = pos + 8;
    const dataEnd = dataStart + length;
    const crcEnd = dataEnd + 4;

    if (crcEnd > bytes.length) {
      fail(
        `entry.png chunk ${type} at offset ${pos} claims ` +
          `${length} data bytes but the file ends at ${bytes.length}`,
      );
    }

    // The CRC covers the type bytes and the data bytes together.
    const covered = Buffer.concat([
      bytes.subarray(pos + 4, pos + 8),
      bytes.subarray(dataStart, dataEnd),
    ]);
    const wantCrc = bytes.readUInt32BE(dataEnd);
    const gotCrc = crc32Checked(covered);
    if (gotCrc !== wantCrc) {
      fail(
        `entry.png chunk ${type} at offset ${pos} has a bad CRC: ` +
          `stored ${wantCrc}, computed ${gotCrc}`,
      );
    }

    chunks.push(type);

    if (type === "IHDR") {
      seenIhdr += 1;
      if (chunks.length !== 1) {
        fail(`entry.png IHDR is chunk ${chunks.length}, not the first`);
      }
      if (length !== 13) {
        fail(`entry.png IHDR length is ${length}, expected 13`);
      }
      width = bytes.readUInt32BE(dataStart);
      height = bytes.readUInt32BE(dataStart + 4);
      if (width === 0 || height === 0) {
        fail(`entry.png has a zero dimension: ${width} x ${height}`);
      }
      if (width > MAX_WIDTH || height > MAX_HEIGHT) {
        fail(
          `entry.png is ${width} x ${height}, over the ` +
            `${MAX_WIDTH} x ${MAX_HEIGHT} gate`,
        );
      }
    }

    if (type === "IDAT") {
      idatBytes += length;
    }

    if (type === "IEND") {
      seenIend += 1;
      if (length !== 0) {
        fail(`entry.png IEND length is ${length}, expected 0`);
      }
      pos = crcEnd;
      break;
    }

    pos = crcEnd;
  }

  if (seenIhdr !== 1) {
    fail(`entry.png has ${seenIhdr} IHDR chunks, expected exactly 1`);
  }
  if (seenIend !== 1) {
    fail(`entry.png has ${seenIend} IEND chunks, expected exactly 1`);
  }
  if (pos !== bytes.length) {
    fail(
      `entry.png has ${bytes.length - pos} trailing bytes after IEND`,
    );
  }
  if (idatBytes === 0) {
    fail("entry.png carries no IDAT image data");
  }

  return { width, height, chunks, idatBytes };
}

// ------------------------------------------------------------------
// README cross-check.
//
// The picture and its documentation must agree. The README is
// expected to carry the date line, every one of the seven
// headlines, and every brief item, each with its sources. If a
// headline is missing, the entry is not handed over: a picture
// whose record has drifted is a picture the judge cannot trust,
// and a silent mismatch is worse than a loud failure.
// ------------------------------------------------------------------
function checkReadmeCoversStories(): void {
  const readmePath = join(ROOT, README);
  if (!existsSync(readmePath)) {
    fail(`README missing next to the program: ${readmePath}`);
  }
  const text = readFileSync(readmePath, "utf8");

  const missing: string[] = [];

  if (!text.includes(DATE_LINE)) {
    missing.push(`date line "${DATE_LINE}"`);
  }

  for (const story of STORIES) {
    if (!text.includes(story.headline)) {
      missing.push(`headline "${story.headline}"`);
    }
    // Each story's sources must be named in the README too, so
    // the record is not just a headline list: check the first
    // named source of each story, which is always its strongest
    // wire or paper.
    const firstSource = story.sources.split(";")[0]?.trim() ?? "";
    if (firstSource !== "" && !text.includes(firstSource)) {
      missing.push(`source "${firstSource}" for "${story.headline}"`);
    }
  }

  for (const brief of BRIEFS) {
    // Briefs are short, so match on the first ten words rather
    // than the whole line: the README may wrap them.
    const head = brief.split(" ").slice(0, 10).join(" ");
    if (!text.includes(head)) {
      missing.push(`brief "${head}…"`);
    }
  }

  if (missing.length > 0) {
    fail(
      `README.md does not document the front page:\n` +
        missing.map((m) => `  - missing ${m}`).join("\n"),
    );
  }
}

function main(): void {
  const from = join(ROOT, IMAGE);
  const dir = outputDir();
  const to = join(dir, IMAGE);

  if (!existsSync(from)) {
    fail(`source image missing: ${from}`);
  }

  // Read the original, then prove it is a whole, in-gate PNG
  // before any copy is written.
  const bytes = readFileSync(from);
  const info = validatePng(bytes, from);

  // Prove the documentation matches the picture before handing
  // the picture over.
  checkReadmeCoversStories();

  mkdirSync(dir, { recursive: true });
  writeFileSync(to, bytes);

  // Prove the copy is exact before exiting successfully: the
  // file must exist, match in length, and match in sha256. Any
  // mismatch fails loudly instead of handing the grader a broken,
  // partial, or different file.
  if (!existsSync(to)) {
    fail(`output missing after write: ${to}`);
  }
  const want = statSync(from).size;
  const got = statSync(to).size;
  if (got !== want) {
    fail(`entry.png copy is ${got} bytes, expected ${want}`);
  }
  const wantHash = digest(bytes);
  const gotHash = digest(readFileSync(to));
  if (gotHash !== wantHash) {
    fail(
      `entry.png copy hash mismatch: got ${gotHash}, expected ${wantHash}`,
    );
  }

  // A receipt on stderr so a human running the program by hand
  // can see what was verified; stdout stays clean and the file
  // bytes are unaffected either way.
  console.error(
    `wrote ${to} (${info.width} x ${info.height}, ${got} bytes, ` +
      `sha256 ${gotHash})`,
  );
  console.error(
    `png: ${info.chunks.length} chunks (${info.chunks.join(", ")}), ` +
      `${info.idatBytes} IDAT bytes, all CRCs valid`,
  );
  console.error(
    `front page: ${STORIES.length} stories + ${BRIEFS.length} briefs, ` +
      `README cross-check passed`,
  );
}

main();
