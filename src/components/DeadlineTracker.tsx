import { useState, useMemo, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, Plus, Trash2, Bell, BellOff, CheckCircle2, AlertTriangle, CalendarDays, GraduationCap } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { universityDatabase } from "@/lib/universityData";
import { useToast } from "@/hooks/use-toast";
import { useDeadlines, Deadline } from "@/hooks/useDeadlines";

interface NotificationSettings {
  enabled: boolean;
  defaultReminderDays: number[];
}

const DEADLINE_TYPES = [
  { value: 'early-decision', label: 'Early Decision', color: 'bg-destructive' },
  { value: 'early-action', label: 'Early Action', color: 'bg-warning' },
  { value: 'regular', label: 'Regular Decision', color: 'bg-primary' },
  { value: 'financial-aid', label: 'Financial Aid', color: 'bg-success' },
  { value: 'scholarship', label: 'Scholarship', color: 'bg-accent' },
  { value: 'test', label: 'Test Date', color: 'bg-muted' },
  { value: 'custom', label: 'Custom', color: 'bg-secondary' }
];

const REMINDER_OPTIONS = [
  { value: 1, label: '1 day before' },
  { value: 3, label: '3 days before' },
  { value: 7, label: '1 week before' },
  { value: 14, label: '2 weeks before' },
  { value: 30, label: '1 month before' },
];

export const DeadlineTracker = () => {
  const { toast } = useToast();
  const { deadlines, loading, addDeadline, updateDeadline, removeDeadline, addMultipleDeadlines } = useDeadlines();
  const [newDeadline, setNewDeadline] = useState({
    university: '',
    type: 'regular' as Deadline['type'],
    date: '',
    notes: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    enabled: false,
    defaultReminderDays: [1, 7, 14]
  });
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast({ title: "Not Supported", description: "Push notifications are not supported in this browser.", variant: "destructive" });
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        setNotificationSettings(prev => ({ ...prev, enabled: true }));
        toast({ title: "Notifications Enabled", description: "You'll receive reminders for your deadlines." });
      }
    } catch (error) {
      console.error('Notification permission error:', error);
    }
  };

  const checkAndNotify = useCallback(() => {
    if (!notificationSettings.enabled || notificationPermission !== 'granted') return;
    const now = new Date();
    deadlines.forEach(deadline => {
      if (deadline.completed || !deadline.reminder) return;
      const daysUntil = Math.ceil((new Date(deadline.date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      deadline.reminderDays.forEach(reminderDay => {
        if (daysUntil === reminderDay) {
          new Notification(`Deadline Reminder: ${deadline.university}`, {
            body: `${DEADLINE_TYPES.find(t => t.value === deadline.type)?.label} deadline is in ${daysUntil} day${daysUntil > 1 ? 's' : ''}!`,
            tag: `deadline-${deadline.id}-${reminderDay}`
          });
        }
      });
    });
  }, [deadlines, notificationSettings.enabled, notificationPermission]);

  useEffect(() => {
    checkAndNotify();
    const interval = setInterval(checkAndNotify, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [checkAndNotify]);

  const handleAddDeadline = async () => {
    if (!newDeadline.university || !newDeadline.date) return;
    await addDeadline({
      university: newDeadline.university,
      type: newDeadline.type,
      date: newDeadline.date,
      notes: newDeadline.notes,
      completed: false,
      reminder: true,
      reminderDays: notificationSettings.defaultReminderDays
    });
    setNewDeadline({ university: '', type: 'regular', date: '', notes: '' });
    setShowAddForm(false);
  };

  const handleToggleComplete = async (id: string) => {
    const dl = deadlines.find(d => d.id === id);
    if (dl) await updateDeadline(id, { completed: !dl.completed });
  };

  const handleToggleReminder = async (id: string) => {
    const dl = deadlines.find(d => d.id === id);
    if (dl) await updateDeadline(id, { reminder: !dl.reminder });
  };

  const handleAddFromDatabase = async (uniName: string) => {
    const uni = universityDatabase.find(u => u.name === uniName);
    if (!uni) return;
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    const newDeadlines: Omit<Deadline, "id">[] = [];

    if (uni.deadlines.earlyDecision) {
      newDeadlines.push({
        university: uni.name, type: 'early-decision',
        date: `${currentYear}-${uni.deadlines.earlyDecision.includes('Nov') ? '11' : '10'}-01`,
        notes: `Early Decision: ${uni.deadlines.earlyDecision}`,
        completed: false, reminder: true, reminderDays: notificationSettings.defaultReminderDays
      });
    }

    if (uni.deadlines.earlyAction) {
      newDeadlines.push({
        university: uni.name, type: 'early-action',
        date: `${currentYear}-${uni.deadlines.earlyAction.includes('Nov') ? '11' : '10'}-01`,
        notes: `Early Action: ${uni.deadlines.earlyAction}`,
        completed: false, reminder: true, reminderDays: notificationSettings.defaultReminderDays
      });
    }

    newDeadlines.push({
      university: uni.name, type: 'regular',
      date: `${nextYear}-01-${uni.deadlines.regularDecision.includes('Jan 1') ? '01' : '15'}`,
      notes: `Regular Decision: ${uni.deadlines.regularDecision}`,
      completed: false, reminder: true, reminderDays: notificationSettings.defaultReminderDays
    });

    newDeadlines.push({
      university: uni.name, type: 'financial-aid',
      date: `${nextYear}-${uni.deadlines.financialAid.includes('Feb') ? '02' : '03'}-15`,
      notes: `Financial Aid: ${uni.deadlines.financialAid}`,
      completed: false, reminder: true, reminderDays: notificationSettings.defaultReminderDays
    });

    await addMultipleDeadlines(newDeadlines);
    toast({ title: "Deadlines Added", description: `Added ${newDeadlines.length} deadlines for ${uni.name}.` });
  };

  const getDaysUntil = (dateStr: string) => Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  const getUrgencyColor = (days: number, completed: boolean) => {
    if (completed) return 'bg-success/10 border-success/30';
    if (days < 0) return 'bg-destructive/10 border-destructive/30';
    if (days <= 7) return 'bg-destructive/10 border-destructive/30';
    if (days <= 30) return 'bg-warning/10 border-warning/30';
    return 'bg-card border-border';
  };

  const upcomingDeadlines = useMemo(() => deadlines.filter(d => !d.completed && getDaysUntil(d.date) >= 0), [deadlines]);
  const completedDeadlines = useMemo(() => deadlines.filter(d => d.completed), [deadlines]);
  const overdueDeadlines = useMemo(() => deadlines.filter(d => !d.completed && getDaysUntil(d.date) < 0), [deadlines]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="shadow-card border-border/50">
        <CardHeader className="bg-gradient-primary text-primary-foreground p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-foreground/10 flex items-center justify-center">
                <CalendarDays className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-display font-bold">Deadline Tracker</h2>
                <p className="text-primary-foreground/80">Never miss an important deadline</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Notification settings" className={`${notificationSettings.enabled ? 'text-primary-foreground' : 'text-primary-foreground/60'}`}>
                    {notificationSettings.enabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Push Notifications</Label>
                        <p className="text-xs text-muted-foreground">Get reminders before deadlines</p>
                      </div>
                      <Switch
                        checked={notificationSettings.enabled}
                        onCheckedChange={(checked) => {
                          if (checked && notificationPermission !== 'granted') requestNotificationPermission();
                          else setNotificationSettings(prev => ({ ...prev, enabled: checked }));
                        }}
                      />
                    </div>
                    {notificationPermission === 'denied' && (
                      <p className="text-xs text-destructive">Notifications are blocked. Enable them in your browser settings.</p>
                    )}
                    <div className="space-y-2">
                      <Label className="text-xs">Default Reminder Times</Label>
                      <div className="flex flex-wrap gap-2">
                        {REMINDER_OPTIONS.map(option => (
                          <Badge
                            key={option.value}
                            variant={notificationSettings.defaultReminderDays.includes(option.value) ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => setNotificationSettings(prev => ({
                              ...prev,
                              defaultReminderDays: prev.defaultReminderDays.includes(option.value)
                                ? prev.defaultReminderDays.filter(d => d !== option.value)
                                : [...prev.defaultReminderDays, option.value].sort((a, b) => a - b)
                            }))}
                          >
                            {option.label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              <Button onClick={() => setShowAddForm(!showAddForm)} className="bg-primary-foreground/10 hover:bg-primary-foreground/20 border-0">
                <Plus className="w-4 h-4 mr-2" /> Add Deadline
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground self-center mr-2">Quick add:</span>
            {universityDatabase.slice(0, 5).map(uni => (
              <Button key={uni.name} variant="outline" size="sm" onClick={() => handleAddFromDatabase(uni.name)} className="text-xs">
                <GraduationCap className="w-3 h-3 mr-1" /> {uni.name.split(' ')[0]}
              </Button>
            ))}
          </div>

          {showAddForm && (
            <Card className="p-4 bg-muted/30 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Input placeholder="University name" value={newDeadline.university} onChange={e => setNewDeadline({ ...newDeadline, university: e.target.value })} />
                <Select value={newDeadline.type} onValueChange={(value: Deadline['type']) => setNewDeadline({ ...newDeadline, type: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DEADLINE_TYPES.map(type => (<SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>))}
                  </SelectContent>
                </Select>
                <Input type="date" value={newDeadline.date} onChange={e => setNewDeadline({ ...newDeadline, date: e.target.value })} />
                <Input placeholder="Notes (optional)" value={newDeadline.notes} onChange={e => setNewDeadline({ ...newDeadline, notes: e.target.value })} />
              </div>
              <div className="flex justify-end mt-4 gap-2">
                <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
                <Button onClick={handleAddDeadline}>Add Deadline</Button>
              </div>
            </Card>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-primary/10 text-center">
              <div className="text-2xl font-bold text-primary">{deadlines.length}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
            <div className="p-4 rounded-xl bg-warning/10 text-center">
              <div className="text-2xl font-bold text-warning">{upcomingDeadlines.length}</div>
              <div className="text-xs text-muted-foreground">Upcoming</div>
            </div>
            <div className="p-4 rounded-xl bg-success/10 text-center">
              <div className="text-2xl font-bold text-success">{completedDeadlines.length}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
            <div className="p-4 rounded-xl bg-destructive/10 text-center">
              <div className="text-2xl font-bold text-destructive">{overdueDeadlines.length}</div>
              <div className="text-xs text-muted-foreground">Overdue</div>
            </div>
          </div>

          <div className="space-y-3">
            {deadlines.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No deadlines yet</h3>
                <p className="text-sm mb-4">Add your first deadline to start tracking</p>
                <Button onClick={() => setShowAddForm(true)}>
                  <Plus className="w-4 h-4 mr-2" /> Add Deadline
                </Button>
              </div>
            ) : (
              deadlines.map(deadline => {
                const daysUntil = getDaysUntil(deadline.date);
                const urgencyColor = getUrgencyColor(daysUntil, deadline.completed);
                const typeConfig = DEADLINE_TYPES.find(t => t.value === deadline.type);

                return (
                  <Card key={deadline.id} className={`p-4 transition-all border ${urgencyColor}`}>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <button onClick={() => handleToggleComplete(deadline.id)} className="flex-shrink-0">
                          {deadline.completed ? (
                            <CheckCircle2 className="w-6 h-6 text-success" />
                          ) : (
                            <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30 hover:border-primary transition-colors" />
                          )}
                        </button>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className={`font-semibold ${deadline.completed ? 'line-through text-muted-foreground' : ''}`}>
                              {deadline.university}
                            </h4>
                            <Badge variant="outline" className="text-xs">{typeConfig?.label}</Badge>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(deadline.date).toLocaleDateString()}
                            </span>
                            {!deadline.completed && (
                              <span className={`font-medium ${daysUntil < 0 ? 'text-destructive' : daysUntil <= 7 ? 'text-destructive' : daysUntil <= 30 ? 'text-warning' : 'text-muted-foreground'}`}>
                                {daysUntil < 0 ? `${Math.abs(daysUntil)}d overdue` : `${daysUntil}d left`}
                              </span>
                            )}
                          </div>
                          {deadline.notes && <p className="text-xs text-muted-foreground mt-1">{deadline.notes}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button variant="ghost" size="icon" aria-label={deadline.reminder ? "Disable reminder" : "Enable reminder"} onClick={() => handleToggleReminder(deadline.id)} className="h-8 w-8">
                          {deadline.reminder ? <Bell className="w-4 h-4 text-primary" /> : <BellOff className="w-4 h-4 text-muted-foreground" />}
                        </Button>
                        <Button variant="ghost" size="icon" aria-label="Delete deadline" onClick={() => removeDeadline(deadline.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
