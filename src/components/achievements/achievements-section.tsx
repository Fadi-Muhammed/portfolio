import type { Achievement } from "@/lib/content/queries";
import { InviteToSpeak } from "./invite-to-speak";
import { Timeline } from "./timeline";

/**
 * The Achievements stop on the deck (B2 item 4).
 *
 * A traceroute rather than a grid of cards, because unlike Products and Engineering this
 * content is a sequence: the entries are in an order, the order is time, and the order is
 * information a card grid would throw away.
 *
 * There is no intro line, which the other two sections have. The deck header's teaser
 * already says what this section holds, and the sentence that stood here described the
 * timeline's own columns to someone who was looking straight at them. It was the accessory
 * removed in the B13 pass, and the route got its height back.
 */
export function AchievementsSection({ achievements }: { achievements: Achievement[] }) {
  if (achievements.length === 0) {
    return (
      <div className="section-body" data-inner-scroll>
        <p className="text-body text-ink measure">
          Nothing here yet. The competitions, talks and programmes are being written up.
        </p>
      </div>
    );
  }

  const hasTalk = achievements.some((entry) => entry.type === "talk");

  return (
    <div className="section-body" data-inner-scroll>
      <Timeline achievements={achievements} />

      {hasTalk ? <InviteToSpeak /> : null}
    </div>
  );
}
