import { Eye, MessageSquarePlus, Send, Users } from 'lucide-react';
import { useState } from 'react';
import { Badge, Button, Card, Input, PageHeader } from '../../components/ui';

type CommentTopic = 'Question' | 'Cultural Tip' | 'Recipe Note';

interface CommunityComment {
  id: string;
  author: string;
  topic: CommentTopic;
  message: string;
  createdAt: string;
}

const COMMENTS_STORAGE_KEY = 'boma_community_comments_v1';
const VISITOR_STORAGE_KEY = 'boma_visitor_count_v1';
const VISITOR_SESSION_KEY = 'boma_visitor_counted_session';
const BASE_VISITOR_COUNT = 1248;

const SEED_COMMENTS: CommunityComment[] = [
  {
    id: 'seed-1',
    author: 'Amina K.',
    topic: 'Cultural Tip',
    message:
      'In coastal Mombasa kitchens, "tui la nazi" (fresh coconut milk) is used in everything from samaki wa kupaka to maharagwe!',
    createdAt: '2026-11-20T09:30:00.000Z',
  },
  {
    id: 'seed-2',
    author: 'Daniel M.',
    topic: 'Question',
    message:
      'What is the difference between "kupika" and "kukaanga"? Still mixing them up in the quiz!',
    createdAt: '2026-11-22T14:15:00.000Z',
  },
  {
    id: 'seed-3',
    author: 'Wanjiku N.',
    topic: 'Recipe Note',
    message:
      'Practiced "Koroga ugali kwa mwiko" while making dinner tonight—saying it aloud really helps it stick.',
    createdAt: '2026-11-24T18:05:00.000Z',
  },
];

function readComments(): CommunityComment[] {
  try {
    const raw = window.localStorage.getItem(COMMENTS_STORAGE_KEY);
    if (!raw) return SEED_COMMENTS;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return SEED_COMMENTS;
    return parsed as CommunityComment[];
  } catch {
    return SEED_COMMENTS;
  }
}

function writeComments(comments: CommunityComment[]): void {
  try {
    window.localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(comments));
  } catch {
    // Ignore storage errors
  }
}

const TOPIC_TONE: Record<CommentTopic, 'green' | 'terracotta' | 'ochre'> = {
  Question: 'ochre',
  'Cultural Tip': 'green',
  'Recipe Note': 'terracotta',
};

function readAndIncrementVisitorCount(): number {
  try {
    const storedRaw = window.localStorage.getItem(VISITOR_STORAGE_KEY);
    let count = storedRaw ? Number.parseInt(storedRaw, 10) : BASE_VISITOR_COUNT;
    if (Number.isNaN(count) || count < BASE_VISITOR_COUNT) {
      count = BASE_VISITOR_COUNT;
    }

    if (!window.sessionStorage.getItem(VISITOR_SESSION_KEY)) {
      count += 1;
      window.sessionStorage.setItem(VISITOR_SESSION_KEY, '1');
      window.localStorage.setItem(VISITOR_STORAGE_KEY, String(count));
    }

    return count;
  } catch {
    return BASE_VISITOR_COUNT;
  }
}

export function CommunityPage() {
  const [comments, setComments] = useState<CommunityComment[]>(() => readComments());
  const [author, setAuthor] = useState('');
  const [topic, setTopic] = useState<CommentTopic>('Cultural Tip');
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [visitorCount] = useState<number>(() => readAndIncrementVisitorCount());

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const cleanAuthor = author.trim();
    const cleanMessage = message.trim();

    if (!cleanAuthor || !cleanMessage) {
      setFormError('Please enter your name and a message before posting.');
      return;
    }

    const newComment: CommunityComment = {
      id: `c-${Date.now()}`,
      author: cleanAuthor,
      topic,
      message: cleanMessage,
      createdAt: new Date().toISOString(),
    };

    const updated = [newComment, ...comments];
    setComments(updated);
    writeComments(updated);

    setAuthor('');
    setMessage('');
    setFormError(null);
  };

  return (
    <div className="space-y-12">
      <PageHeader
        tone="ochre"
        icon={<Users className="size-5" aria-hidden="true" />}
        eyebrow="Jamii"
        title="Learner Community"
        description="Share Swahili questions, Kenyan culinary notes, and study tips with fellow learners."
        action={
          <p className="inline-flex items-center gap-2 text-xs font-medium text-charcoal-muted">
            <Eye className="size-4 text-savanna-green" aria-hidden="true" />
            <span className="tabular-nums">
              {visitorCount.toLocaleString()} learners visited
            </span>
          </p>
        }
      />

      <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
        {/* Comment Form */}
        <Card className="h-fit space-y-6 lg:col-span-5">
          <div className="flex items-center gap-2">
            <MessageSquarePlus
              className="size-5 text-terracotta"
              aria-hidden="true"
            />
            <h2 className="text-xl font-semibold leading-snug text-charcoal">Leave a Note</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Your Name"
              placeholder="e.g. Kamau or Sarah"
              value={author}
              onChange={(event) => setAuthor(event.target.value)}
              maxLength={40}
            />

            <div className="space-y-2.5">
              <span className="block text-sm font-medium text-charcoal">Topic</span>
              <div className="flex flex-wrap gap-2">
                {(['Cultural Tip', 'Question', 'Recipe Note'] as const).map(
                  (itemTopic) => {
                    const active = topic === itemTopic;
                    return (
                      <button
                        key={itemTopic}
                        type="button"
                        onClick={() => setTopic(itemTopic)}
                        aria-pressed={active}
                        className={
                          active
                            ? 'rounded-full border border-savanna-green bg-savanna-green px-3.5 py-1.5 text-xs font-medium text-cream'
                            : 'rounded-full border border-warm-border/70 bg-cream px-3.5 py-1.5 text-xs font-medium text-charcoal-muted hover:bg-cream-dark'
                        }
                      >
                        {itemTopic}
                      </button>
                    );
                  },
                )}
              </div>
            </div>

            <div className="space-y-2.5">
              <label
                htmlFor="community-message"
                className="block text-sm font-medium text-charcoal"
              >
                Message
              </label>
              <textarea
                id="community-message"
                rows={5}
                maxLength={320}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Ask a Kiswahili question or share a phrase you practiced today..."
                className="w-full rounded-2xl border border-warm-border bg-surface p-4 text-sm leading-relaxed text-charcoal placeholder:text-charcoal-muted/70 focus:border-savanna-green focus:outline-none"
              />
            </div>

            {formError && (
              <p role="alert" className="text-xs font-medium text-terracotta">
                {formError}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="md"
              leftIcon={<Send className="size-4" aria-hidden="true" />}
              className="w-full"
            >
              Post to Community
            </Button>
          </form>
        </Card>

        {/* Comments Feed */}
        <section
          aria-labelledby="community-feed-heading"
          className="space-y-5 lg:col-span-7"
        >
          <h2
            id="community-feed-heading"
            className="text-xl font-semibold leading-snug text-charcoal"
          >
            Recent Notes ({comments.length})
          </h2>

          <div className="space-y-5">
            {comments.map((comment) => (
              <Card key={comment.id} className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-full bg-savanna-green-soft text-xs font-bold text-savanna-green">
                      {comment.author.charAt(0).toUpperCase()}
                    </span>
                    <span className="text-sm font-semibold text-charcoal">
                      {comment.author}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge tone={TOPIC_TONE[comment.topic]}>{comment.topic}</Badge>
                    <span className="text-xs text-charcoal-muted">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-charcoal-muted">
                  {comment.message}
                </p>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
