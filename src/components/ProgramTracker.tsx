import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { usePrograms, Program } from "@/hooks/usePrograms";
import {
  GraduationCap, Plus, Trash2, CheckCircle2, Clock, AlertCircle,
  Calendar, MapPin, DollarSign, BookOpen, Target,
  ChevronDown, ChevronUp, Filter
} from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  researching: { label: "Researching", color: "bg-muted text-muted-foreground", icon: BookOpen },
  preparing: { label: "Preparing", color: "bg-warning/10 text-warning", icon: Clock },
  submitted: { label: "Submitted", color: "bg-primary/10 text-primary", icon: Target },
  accepted: { label: "Accepted 🎉", color: "bg-success/10 text-success", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "bg-destructive/10 text-destructive", icon: AlertCircle },
  waitlisted: { label: "Waitlisted", color: "bg-accent/10 text-accent", icon: Clock },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  reach: { label: "Reach", color: "bg-destructive/10 text-destructive" },
  match: { label: "Match", color: "bg-warning/10 text-warning" },
  safety: { label: "Safety", color: "bg-success/10 text-success" },
};

export const ProgramTracker = () => {
  const { programs, loading, addProgram, updateProgram, removeProgram } = usePrograms();
  const [showAdd, setShowAdd] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [newProg, setNewProg] = useState({ university: "", program: "", deadline: "", country: "", tuition: "", priority: "match" as Program["priority"] });

  const handleAddProgram = async () => {
    if (!newProg.university.trim() || !newProg.program.trim()) return;
    await addProgram(newProg);
    setNewProg({ university: "", program: "", deadline: "", country: "", tuition: "", priority: "match" });
    setShowAdd(false);
  };

  const handleUpdateStatus = async (id: string, status: Program["status"]) => {
    await updateProgram(id, { status });
  };

  const handleToggleChecklist = async (prog: Program, idx: number) => {
    const checklist = [...prog.checklist];
    checklist[idx] = { ...checklist[idx], done: !checklist[idx].done };
    await updateProgram(prog.id, { checklist });
  };

  const filtered = filterStatus === "all" ? programs : programs.filter(p => p.status === filterStatus);

  const stats = {
    total: programs.length,
    submitted: programs.filter(p => p.status === "submitted").length,
    accepted: programs.filter(p => p.status === "accepted").length,
    pending: programs.filter(p => !["accepted", "rejected"].includes(p.status)).length,
  };

  const getChecklistProgress = (p: Program) => {
    if (p.checklist.length === 0) return 0;
    return Math.round((p.checklist.filter(c => c.done).length / p.checklist.length) * 100);
  };

  const getDaysUntil = (deadline: string) => {
    if (!deadline) return null;
    return Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-card border-border/50 overflow-hidden">
        <CardHeader className="bg-gradient-primary text-primary-foreground p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm flex items-center justify-center">
                <GraduationCap className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-display font-bold">Program Tracker</h2>
                <p className="text-primary-foreground/80">Track all your university applications in one place</p>
              </div>
            </div>
            <Button onClick={() => setShowAdd(!showAdd)} variant="secondary" size="sm">
              <Plus className="w-4 h-4 mr-1" /> Add Program
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {programs.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Total", value: stats.total, icon: BookOpen, color: "text-primary" },
                { label: "Submitted", value: stats.submitted, icon: Target, color: "text-accent" },
                { label: "Accepted", value: stats.accepted, icon: CheckCircle2, color: "text-success" },
                { label: "Pending", value: stats.pending, icon: Clock, color: "text-warning" },
              ].map((s, i) => (
                <Card key={i} className="p-4 text-center border-border/50">
                  <s.icon className={`w-5 h-5 mx-auto mb-1 ${s.color}`} />
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </Card>
              ))}
            </div>
          )}

          <AnimatePresence>
            {showAdd && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                <Card className="p-5 border-2 border-primary/20">
                  <h3 className="font-semibold mb-4">Add New Program</h3>
                  <div className="grid md:grid-cols-2 gap-3 mb-4">
                    <Input placeholder="University name *" value={newProg.university} onChange={e => setNewProg(p => ({ ...p, university: e.target.value }))} />
                    <Input placeholder="Program / Major *" value={newProg.program} onChange={e => setNewProg(p => ({ ...p, program: e.target.value }))} />
                    <Input type="date" placeholder="Deadline" value={newProg.deadline} onChange={e => setNewProg(p => ({ ...p, deadline: e.target.value }))} />
                    <Input placeholder="Country" value={newProg.country} onChange={e => setNewProg(p => ({ ...p, country: e.target.value }))} />
                    <Input placeholder="Tuition (e.g. $50,000/yr)" value={newProg.tuition} onChange={e => setNewProg(p => ({ ...p, tuition: e.target.value }))} />
                    <Select value={newProg.priority} onValueChange={v => setNewProg(p => ({ ...p, priority: v as Program["priority"] }))}>
                      <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="reach">🔴 Reach</SelectItem>
                        <SelectItem value="match">🟡 Match</SelectItem>
                        <SelectItem value="safety">🟢 Safety</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddProgram} className="bg-gradient-primary hover:shadow-glow">
                      <Plus className="w-4 h-4 mr-1" /> Add Program
                    </Button>
                    <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {programs.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-muted-foreground" />
              {["all", ...Object.keys(STATUS_CONFIG)].map(s => (
                <Button key={s} variant={filterStatus === s ? "default" : "outline"} size="sm" onClick={() => setFilterStatus(s)}>
                  {s === "all" ? "All" : STATUS_CONFIG[s].label}
                </Button>
              ))}
            </div>
          )}

          {filtered.length === 0 && programs.length === 0 && (
            <div className="text-center py-16">
              <GraduationCap className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No programs yet</h3>
              <p className="text-muted-foreground mb-4">Start tracking your university applications</p>
              <Button onClick={() => setShowAdd(true)} className="bg-gradient-primary hover:shadow-glow">
                <Plus className="w-4 h-4 mr-2" /> Add Your First Program
              </Button>
            </div>
          )}

          <div className="space-y-3">
            {filtered.map((prog, i) => {
              const expanded = expandedId === prog.id;
              const daysLeft = getDaysUntil(prog.deadline);
              const progress = getChecklistProgress(prog);
              const statusCfg = STATUS_CONFIG[prog.status];
              const priorityCfg = PRIORITY_CONFIG[prog.priority];

              return (
                <motion.div key={prog.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className={`border-border/50 overflow-hidden ${prog.status === "accepted" ? "ring-2 ring-success/30" : ""}`}>
                    <div className="p-4 cursor-pointer hover:bg-muted/20 transition-colors" onClick={() => setExpandedId(expanded ? null : prog.id)}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <GraduationCap className="w-5 h-5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-semibold truncate">{prog.university}</h4>
                            <p className="text-sm text-muted-foreground truncate">{prog.program}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge className={priorityCfg.color}>{priorityCfg.label}</Badge>
                          <Badge className={statusCfg.color}>{statusCfg.label}</Badge>
                          {daysLeft !== null && daysLeft > 0 && daysLeft <= 30 && (
                            <Badge variant="outline" className="text-destructive border-destructive/30">
                              <AlertCircle className="w-3 h-3 mr-1" />{daysLeft}d
                            </Badge>
                          )}
                          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                        </div>
                      </div>
                      <div className="mt-3">
                        <Progress value={progress} className="h-1.5" />
                      </div>
                    </div>

                    <AnimatePresence>
                      {expanded && (
                        <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                          <div className="px-4 pb-4 space-y-4 border-t border-border/30 pt-4">
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              {prog.deadline && <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />Deadline: {new Date(prog.deadline).toLocaleDateString()}</span>}
                              {prog.country && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{prog.country}</span>}
                              {prog.tuition && <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" />{prog.tuition}</span>}
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm text-muted-foreground">Status:</span>
                              <Select value={prog.status} onValueChange={v => handleUpdateStatus(prog.id, v as Program["status"])}>
                                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <h5 className="text-sm font-medium mb-2">Application Checklist ({prog.checklist.filter(c => c.done).length}/{prog.checklist.length})</h5>
                              <div className="space-y-1.5">
                                {prog.checklist.map((item, idx) => (
                                  <label key={idx} className="flex items-center gap-2 cursor-pointer text-sm group">
                                    <input type="checkbox" checked={item.done} onChange={() => handleToggleChecklist(prog, idx)} className="rounded border-border" />
                                    <span className={item.done ? "line-through text-muted-foreground" : "text-foreground group-hover:text-primary transition-colors"}>{item.label}</span>
                                  </label>
                                ))}
                              </div>
                            </div>

                            <Button variant="destructive" size="sm" onClick={() => removeProgram(prog.id)}>
                              <Trash2 className="w-3 h-3 mr-1" /> Remove
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
