/**
 * The user asked to avoid ending up with packs where image generations all
 * failed (they're cumbersome to delete afterwards), but explicitly does NOT
 * want success discarded: if even one sticker was generated, the pack is kept.
 * After the first create-and-generate run, only a total-loss batch removes it.
 *
 * @param succeeded Count of items that produced a usable sticker.
 * @param failed    Number of items that errored (unused — kept for signature clarity).
 * @returns true only when NOTHING succeeded (i.e. every generation failed).
 */
export function shouldDiscardFailedBatch(succeeded: number, failed: number): boolean {
  // Keep unless every attempted generation failed (at least one attempt, zero wins).
  return failed > 0 && succeeded === 0;
}