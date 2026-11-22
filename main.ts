// Ghost Catcher on X — the entry program for the make.fun post-x bounty.
//
// What is actually judged here is the X post itself: the house reads the post
// named by POST.json straight from X (views, likes, reposts, quotes, replies)
// and ranks it. Nothing this program prints or writes about the post is scored,
// so this program does not invent anything — it just hands the house the files
// it needs, byte for byte.
//
// The files it hands over:
//   - POST.json — the address of the X post carrying the video.
//   - video-post-x.mp4 — the finished 30-second video itself, so anyone can
//     check the agent really built and rendered it: the one prompt typed out,
//     the agent at work, real gameplay, and the make.fun referral end card
//     carrying code 62prjahx.
//   - game/index.html — the Ghost Catcher game the video shows being built:
//     one self-contained HTML file, no network, click the ghost to catch it,
//     each catch makes it faster, 30 seconds on the clock.
//
// The copies are byte-for-byte and deterministic: no timestamps, no random
// values, no rewriting of any file. That is why the harness can run this
// program twice and get identical bytes both times — the two runs must agree.
//
// Locally, the grader's /bot and /output are stood in for with environment
// variables, exactly like the kit's starter does:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.env.MAKEFUN_BOT_DIR ?? "/bot";
const outRoot = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

// Every file this program carries from the repository into the output
// directory, kept under the same relative path the grader expects.
// The three files, and why each one rides along. POST.json is the pointer
// to the ranked thing — the X post. The video and the game are the receipts:
// the video proves the agent actually rendered the game it claims to have
// built, and the game file lets anyone open the thing the video shows. A
// submission without them would be a claim with no evidence behind it.
const filesToCarry: Array<{ from: string; to: string }> = [
  { from: "POST.json", to: "POST.json" },
  { from: "video-post-x.mp4", to: "video-post-x.mp4" },
  { from: join("game", "index.html"), to: join("game", "index.html") },
];

// The output tree is created fresh each run, and every copy below is a
// plain byte-for-byte copy — nothing here stamps a time, rolls a random
// value, or rewrites content. That matters because the harness executes this
// program twice and compares the two outputs byte by byte; any nondeterminism
// would make the entry fail its own check even though the files are fine.
mkdirSync(join(outRoot, "game"), { recursive: true });

// This program scores nothing and judges nothing. The ranking comes from
// the X post POST.json points at (views and engagement, read straight from
// X). All this program does is deliver the evidence. If a file is missing,
// the honest outcome is a loud failure (exit 1) rather than a quiet, partial
// output that looks complete but isn't.
for (const file of filesToCarry) {
  try {
    copyFileSync(join(repoRoot, file.from), join(outRoot, file.to));
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.error(`could not copy ${file.from} from ${repoRoot}: ${reason}`);
    process.exit(1);
  }
}
