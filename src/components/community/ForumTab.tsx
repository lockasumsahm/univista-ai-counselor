import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, ExternalLink, Plus, Pin, MessageCircle, Eye, X, Send, ThumbsUp, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FORUM_TOPICS } from "./data";

interface ForumReply {
  author: string;
  content: string;
  time: string;
  likes: number;
}

const MOCK_REPLIES: Record<string, ForumReply[]> = {
  "1": [
    { author: "admissions_guru", content: "SAT scores are becoming less important with test-optional policies, but a strong score (1500+) still helps at Ivy League schools. Focus on your essays and extracurriculars!", time: "1 hour ago", likes: 24 },
    { author: "harvard_2025", content: "I got into Harvard with a 1480 SAT. What mattered more was my research experience and community service leadership.", time: "45 min ago", likes: 18 },
    { author: "counselor_mike", content: "Think of SAT as one factor in a holistic review. A 1550+ won't guarantee admission, and a 1400 won't disqualify you if everything else is strong.", time: "30 min ago", likes: 31 },
  ],
  "2": [
    { author: "dr_future", content: "Look into NIH summer internship programs (SIP). They're incredibly competitive but amazing for pre-med students.", time: "4 hours ago", likes: 15 },
    { author: "bio_researcher", content: "Cold-emailing professors at local universities for research positions worked for me. Start sophomore year if possible.", time: "3 hours ago", likes: 22 },
  ],
  "3": [
    { author: "fin_aid_expert", content: "Be honest and detailed in your CSS Profile. Include any special circumstances. Many schools are need-blind for internationals now.", time: "20 hours ago", likes: 45 },
    { author: "intl_success", content: "I'm from Nigeria and received full funding at Williams College. The key was applying to schools known for being generous to internationals.", time: "18 hours ago", likes: 38 },
  ],
  "4": [
    { author: "strategy_pro", content: "ED gives you the biggest boost, but only if you're 100% sure about the school. Don't waste it on a 'maybe' choice.", time: "2 hours ago", likes: 29 },
    { author: "admitted_2025", content: "I did EA to several schools and ED to my top choice. The EA results gave me confidence while waiting for ED.", time: "1 hour ago", likes: 17 },
  ],
  "5": [
    { author: "essay_mentor", content: "The best 'Why Us' essays mention specific professors, programs, clubs, or traditions. Visit campus or watch YouTube tours for authentic details.", time: "5 hours ago", likes: 42 },
  ],
  "6": [
    { author: "scholarship_winner", content: "Check out Mastercard Foundation Scholars Program, DAAD for Germany, and Chevening for UK. All fully funded for developing country students.", time: "30 min ago", likes: 56 },
    { author: "funding_guru", content: "Many Nordic countries offer free tuition even for international students. Consider Finland, Norway, and Germany.", time: "20 min ago", likes: 33 },
  ],
};

export const ForumTab = () => {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [newTopicOpen, setNewTopicOpen] = useState(false);
  const [replyInput, setReplyInput] = useState("");
  const [replies, setReplies] = useState<Record<string, ForumReply[]>>(MOCK_REPLIES);

  const topic = FORUM_TOPICS.find(t => t.id === selectedTopic);
  const displayedTopics = FORUM_TOPICS;

  const handlePostReply = () => {
    if (!replyInput.trim() || !selectedTopic) return;
    const newReply: ForumReply = {
      author: "you",
      content: replyInput.trim(),
      time: "just now",
      likes: 0,
    };
    setReplies(prev => ({
      ...prev,
      [selectedTopic]: [...(prev[selectedTopic] || []), newReply],
    }));
    setReplyInput("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold">Popular Discussions</h3>
          <p className="text-sm text-muted-foreground">{FORUM_TOPICS.reduce((s, t) => s + t.replies, 0)}+ replies across {FORUM_TOPICS.length} topics</p>
        </div>
        <Button size="sm" onClick={() => setNewTopicOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Topic
        </Button>
      </div>

      {displayedTopics.map((topic) => (
        <Card
          key={topic.id}
          className="p-4 hover:shadow-md transition-all cursor-pointer group"
          onClick={() => setSelectedTopic(topic.id)}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {topic.pinned && <Pin className="w-3.5 h-3.5 text-accent" />}
                <h4 className="font-medium group-hover:text-primary transition-colors">
                  {topic.title}
                </h4>
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span>by {topic.author}</span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-3.5 h-3.5" />
                  {topic.replies}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  {topic.views.toLocaleString()}
                </span>
                <span>{topic.lastActive}</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {topic.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
          </div>
        </Card>
      ))}

      {/* Topic Detail Dialog */}
      <Dialog open={!!selectedTopic} onOpenChange={(open) => { if (!open) setSelectedTopic(null); }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {topic && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  {topic.pinned && <Pin className="w-4 h-4 text-accent" />}
                  <DialogTitle className="text-lg">{topic.title}</DialogTitle>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                  <span>by <strong>{topic.author}</strong></span>
                  <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" />{topic.replies}</span>
                  <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{topic.views.toLocaleString()}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{topic.lastActive}</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {topic.tags.map(tag => <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>)}
                </div>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <h4 className="font-semibold text-sm text-muted-foreground">Replies</h4>
                {(replies[topic.id] || []).map((reply, i) => (
                  <Card key={i} className="p-4 border-border/50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {reply.author[0].toUpperCase()}
                        </div>
                        <span className="text-sm font-medium">{reply.author}</span>
                        <span className="text-xs text-muted-foreground">{reply.time}</span>
                      </div>
                      <Button variant="ghost" size="sm" className="text-xs gap-1 text-muted-foreground">
                        <ThumbsUp className="w-3 h-3" /> {reply.likes}
                      </Button>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">{reply.content}</p>
                  </Card>
                ))}

                {(!replies[topic.id] || replies[topic.id].length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">No replies yet. Be the first to contribute!</p>
                )}

                <div className="flex gap-2 mt-4">
                  <Textarea
                    placeholder="Write a reply..."
                    value={replyInput}
                    onChange={(e) => setReplyInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); handlePostReply(); } }}
                    className="min-h-[60px]"
                  />
                  <Button size="icon" aria-label="Post reply" className="shrink-0 self-end" disabled={!replyInput.trim()} onClick={handlePostReply}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* New Topic Dialog */}
      <Dialog open={newTopicOpen} onOpenChange={setNewTopicOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Start a New Discussion</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-sm font-medium mb-1 block">Topic Title</label>
              <Input placeholder="What would you like to discuss?" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Your Message</label>
              <Textarea placeholder="Share your thoughts, questions, or experiences..." className="min-h-[120px]" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Tags</label>
              <Input placeholder="e.g. Essays, Scholarships, Strategy" />
            </div>
            <Button className="w-full gap-2" onClick={() => setNewTopicOpen(false)}>
              <Plus className="w-4 h-4" /> Post Discussion
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
