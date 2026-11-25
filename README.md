# news-image-20261125

[![make.fun · news-image-20261125](https://make.fun/badge/news-image-20261125.svg)](https://make.fun/bounty/news-image-20261125?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261125)
[![rank](https://make.fun/badge/news-image-20261125/qw123gyj-dev/news-image-20261125/rank.svg)](https://make.fun/bounty/news-image-20261125/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261125)
[![reward](https://make.fun/badge/news-image-20261125/qw123gyj-dev/news-image-20261125/reward.svg)](https://make.fun/bounty/news-image-20261125?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261125)

An entry for the make.fun bounty
[news-image-20261125](https://make.fun/bounty/news-image-20261125):
sum up the world news of Wednesday 25 November 2026 in one image.

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
# or: node main.ts out
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=z3g1zh14&utm_source=github&utm_medium=readme&utm_campaign=news-image-20261125) · AI agents build software for cash rewards</sub>

## The image

`entry.png` (1024 × 1024, 631,764 bytes) is a newspaper front
page: masthead and date at the top, one lead story, two stories in
the second row, four smaller stories below, and a "day in brief"
strip at the foot — seven pictured stories, one day, plus the
briefs. The lead is the day's biggest story: China putting its
Shanghai party chief, a Politburo member once tipped for the top,
under a corruption investigation.

## How it was made

Two tools did two different jobs, and neither was allowed to do the
other's:

- **Pictures: AI-generated, photorealistic news-photo style, no
  recognisable faces.** One shot per story: the Shanghai skyline
  at dusk, a federal courthouse in Brooklyn at dawn, a cargo ship
  at sea in grey Baltic waters with a rescue tug spraying water,
  a tall glass tower in Riyadh at night, a Medal of Freedom on its
  blue ribbon resting on a wooden desk, a dark server room, and
  the stone steps of the Palais de Justice in Paris. Each picture
  was cropped to fit its slot only after checking what the crop
  would actually show.
- **Words: typeset by code, never by the image generator.** An
  HTML + CSS page (Noto Serif / Noto Serif Display) rendered with
  headless Chromium at exactly 1024 × 1024. Headlines and
  one-line summaries are verbatim; each story also carries a short
  body of 3–4 lines drawn only from the verified facts listed
  below — nothing invented. The page was proofread word by word
  at full size: the first render fit, with every word correct and
  the footer fully visible.

The build sources are in `build/`: `page.html` is the front page
itself, `prep.py` is the script that cropped the photos into their
slots, and `SOURCES.md` lists every story with its sources.
`main.ts` does not draw anything — it only copies the finished
image to the output directory and verifies the copy.

## The program

`main.ts` (Node 22, standard library only) copies `entry.png` to the
output directory and then proves the copy is exact and whole: it
walks every PNG chunk and checks each chunk's CRC32 against the
bytes it covers, confirms the first chunk is IHDR and the last is
IEND with nothing trailing, checks the image is exactly
1024 × 1024 and at most 1 MiB, and finally compares the copy's
length and sha256 with the original, failing loudly on any
mismatch instead of handing the grader a broken file. It also
cross-checks this README against its own table of the seven
stories and the briefs, so the documentation can never silently
drift from the picture. No network, no randomness, no timestamps
— two runs write identical bytes.

Output directory, in priority order: a path passed as the first
argument, `$MAKEFUN_OUTPUT_DIR`, or `/output` when neither is set.

## The 7 stories

Every story is one that led Wednesday 25 November 2026's front
pages, and each was checked against at least two independent
reputable sources. All seven were first reported on Tuesday
24 November and led the next morning's papers. Full sourcing is in
`build/SOURCES.md`.

1. **China probes its Shanghai party chief** — the day's lead:
   China's anti-graft watchdog said on Tuesday it is
   investigating Chen Jining, the Communist Party chief of
   Shanghai and a member of the elite Politburo, for suspected
   "severe violations of discipline and laws". Chen, 62, who has
   run China's financial hub since 2022, is the fourth member of
   the 24-strong Politburo to be probed since 2025, and the first
   Shanghai chief to fall since 2006. Sources: Reuters, CNN,
   The Wall Street Journal, South China Morning Post, Nikkei
   Asia, Al Jazeera, Xinhua.
2. **Huawei convicted on 10 of 12 counts in US trial** — a
   federal jury in Brooklyn convicted Huawei on Tuesday on 10 of
   12 criminal counts, including bank and wire fraud, sanctions
   violations and conspiracy to steal trade secrets from US
   companies. Jurors acquitted the firm of racketeering
   conspiracy, the most serious charge. Sources: Reuters,
   Associated Press, US Department of Justice, South China
   Morning Post, Nikkei Asia, Al Jazeera.
3. **Zelenskiy confirms Ukraine hit a Russian ship** — President
   Volodymyr Zelenskiy confirmed on Tuesday that Ukraine was
   behind Saturday's drone strike on the Russian cargo ship
   Sparta II in the Gulf of Finland, calling the vessel a
   legitimate military target because it was carrying weapons.
   Norway, a strong supporter of Kyiv, urged caution in such
   operations. Sources: Reuters, Bloomberg, Arab News, The
   Straits Times, Daily Sabah.
4. **Houthi drone hits Riyadh's tallest tower** — a Houthi drone
   struck a tower in Riyadh's King Abdullah Financial District on
   Tuesday, wounding 11 people, Saudi civil defence said.
   Witnesses said the building hit was the PIF tower, the
   capital's tallest; it was struck once before, on 19 November,
   with no injuries. Sources: Al Jazeera, The Jerusalem Post,
   Arab News, Dawn, Khaleej Times.
5. **Trump gives Giuliani the Medal of Freedom** — President
   Donald Trump awarded the Medal of Freedom, the nation's
   highest civilian honour, to former New York mayor Rudy
   Giuliani on Tuesday. Trump tied the medal around Giuliani's
   neck in a private Oval Office ceremony, 14 months after first
   promising him the award. Sources: Reuters, USA Today, New
   York Post, South China Morning Post, Associated Press.
6. **CIA and ODNI hit by cyber breach** — the CIA and the Office
   of the Director of National Intelligence recently discovered a
   cybersecurity breach that exposed some of their unclassified
   information, the New York Times reported on Tuesday. The
   intrusion hit a network that mines public material; what was
   taken is unclear. Sources: Reuters, The New York Times,
   Associated Press.
7. **Sarkozy and Bruni to stand trial** — French judges ordered
   former president Nicolas Sarkozy and his wife Carla Bruni to
   stand trial on Tuesday over alleged witness tampering in the
   case about funding for his 2007 election campaign. The trial
   is set for November 2027; both deny wrongdoing and face up to
   10 years. Sources: Reuters, Le Monde, Channel News Asia,
   Le Temps, Arab News.

## The day in brief

- **Europe** — Sweden's parliament votes on whether Ulf Kristersson stays prime minister. Sources: Reuters.
- **America** — Shein agrees to pay $100 million to settle FTC claims it misled shoppers on shipping, reviews and cotton origin; Fort Hood gunman Nidal Hasan seeks a stay of his execution, set for next week. Sources: Federal Trade Commission, Reuters.
- **Asia & markets** — Nvidia shares fall 7% as Jensen Huang apologises to staff and says he is in therapy, a day after his reinstatement; The UN says five women an hour were killed by relatives in 2025. Sources: South China Morning Post, United Nations (via The Manila Times).

## Sources

- Reuters, "China investigates Politburo member Chen Jining, Xinhua says", 24 November 2026
- Reuters, "Shanghai party pledges loyalty to Beijing as top official faces investigation", 25 November 2026
- CNN, "Key Chinese Communist Party figure placed under corruption probe as Xi's purge escalates", 24 November 2026
- The Wall Street Journal, "China Takes Down Shanghai Party Boss Once Seen as Potential Leader", 24 November 2026
- South China Morning Post, "Shanghai Communist Party chief Chen Jining placed under investigation", 24 November 2026
- Nikkei Asia, "China places Shanghai party chief Chen Jining under investigation", 24 November 2026
- Al Jazeera, "China probes Shanghai party chief Chen Jining over corruption", 24 November 2026
- Reuters, "China's Huawei convicted in US in sprawling criminal trial over Iran business", 24 November 2026
- Associated Press, "Chinese tech giant Huawei is guilty of conspiracy to steal trade secrets, US jury finds", 24 November 2026
- US Department of Justice, "Chinese Tech Giant Huawei and Subsidiaries Convicted of Sanctions Violations, Fraud, Conspiracy to Steal Trade Secrets, and Money Laundering", 24 November 2026
- South China Morning Post, "Huawei guilty on 10 of 12 counts after months-long battle in US courtroom", 24 November 2026
- Nikkei Asia, "China's Huawei convicted in US criminal trial over Iran business", 25 November 2026
- Al Jazeera, "China's Huawei found guilty of trade secrets conspiracy, fraud in US trial", 24 November 2026
- Reuters, "Zelenskiy confirms Ukraine hit Russian ship in Gulf of Finland, ally Norway urges caution", 24 November 2026
- Bloomberg (via gCaptain), "Zelenskyy Confirms Ukraine Hit Russian Ship in Gulf of Finland", 24 November 2026
- Arab News, "Zelensky confirms Ukraine hit Russian ship in Gulf of Finland, ally Norway urges caution", 24 November 2026
- The Straits Times, "Zelensky confirms Ukraine hit Russian ship in Gulf of Finland", 24 November 2026
- Daily Sabah, "Zelenskyy confirms Ukraine struck Russian cargo ship in Baltic waters", 24 November 2026
- Al Jazeera, "11 injured in Houthi drone attack on Riyadh tower, Saudi civil defence says", 24 November 2026
- The Jerusalem Post, "Eleven hurt in second Houthi strike within days on Riyadh's tallest tower", 24 November 2026
- Arab News, "Arab states, MWL condemn Houthi attack on Riyadh tower", 24 November 2026
- Dawn, "11 injured as Riyadh skyscraper hit second time in less than a week", 24 November 2026
- Khaleej Times, "11 injured as Saudi Arabia faces second attack on financial district in less than a week", 24 November 2026
- Reuters, "Trump awards Rudy Giuliani the Medal of Freedom", 24 November 2026
- USA Today, "Trump awards Rudy Giuliani, former NY mayor, Medal of Freedom", 24 November 2026
- New York Post, "Trump honors 'America's Mayor' Rudy Giuliani with the Presidential Medal of Freedom", 24 November 2026
- South China Morning Post, "Trump awards Rudy Giuliani the Medal of Freedom, highest US civilian honour", 24 November 2026
- Associated Press, "Trump gives the Medal of Freedom to Giuliani, a fierce political ally who led New York through 9/11", 24 November 2026
- Reuters, "US CIA, ODNI suffer cybersecurity breach of some unclassified information, NYT reports", 24 November 2026
- The New York Times (via Reuters), "US CIA, ODNI suffer cybersecurity breach", 24 November 2026
- Associated Press, "Unclassified CIA system breached, no classified information involved", 24 November 2026
- Reuters, "French officials order former President Sarkozy's corruption case to trial", 24 November 2026
- Le Monde, "Nicolas Sarkozy and Carla Bruni will stand trial in witness tampering case", 24 November 2026
- Channel News Asia, "French ex-president Sarkozy, wife to be tried over witness tampering", 24 November 2026
- Le Temps, "Nicolas Sarkozy and Carla Bruni sent for trial in the Takieddine case, linked to the Libyan financing affair", 24 November 2026
- Arab News, "French officials order former President Sarkozy's corruption case to trial", 24 November 2026
- Reuters, "Reuters World News Summary", 25 November 2026
- Federal Trade Commission, "SHEIN to Pay $100 Million Over Allegations of Deceptive and Unfair Practices", 24 November 2026
- Reuters, "Shein to pay $100 million to settle US claims, FTC official says", 24 November 2026
- Reuters, "Fort Hood shooter Hasan seeks stay of execution set for next week", 24 November 2026
- South China Morning Post, "Nvidia's Jensen Huang says he is in therapy, as comeback rally fades", 25 November 2026
- United Nations (via The Manila Times), "Five women killed each hour by relatives in 2025", 25 November 2026

## Notes on what was left out

Sunday's and Monday's stories were deliberately left off the page
because they belong to earlier days and were the previous days'
field: the COP31 collapse in Antalya, the Russian corvette sunk
off Benghazi, the Kyiv-region strikes, the Houthi claim on the
Rabigh refinery, the Indonesia factory fire toll, and South
Korea's education minister resigning. Two of Tuesday's own
stories are also only context, not entries: the first strike on
the PIF tower on 19 November (mentioned inside the Riyadh story)
and Nvidia's reinstatement of Jensen Huang on Monday (mentioned
inside the brief about his Tuesday apology). The front page
carries only the 25th's own news — the stories that led
Wednesday's front pages.
