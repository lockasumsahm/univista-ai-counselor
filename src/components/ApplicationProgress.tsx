import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ClipboardCheck, Plus, ChevronDown, ChevronRight, Trash2, 
  GraduationCap, FileText, Award, Calendar, CheckCircle2,
  Circle, AlertCircle
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useApplications } from '@/hooks/useApplications';

const PRESET_UNIVERSITIES = [
  'Harvard University', 'MIT', 'Stanford University', 'Yale University',
  'Princeton University', 'Columbia University', 'University of Chicago',
  'Duke University', 'Northwestern University', 'Brown University',
  'University of Pennsylvania', 'Cornell University', 'Dartmouth College',
  'Johns Hopkins University', 'Rice University', 'Vanderbilt University',
  'UCLA', 'UC Berkeley', 'University of Michigan', 'NYU'
];

const CATEGORY_ICONS = {
  documents: FileText,
  essays: FileText,
  tests: Award,
  financial: Calendar,
  misc: Circle,
};

const CATEGORY_COLORS: Record<string, string> = {
  documents: 'bg-primary/10 text-primary',
  essays: 'bg-accent/10 text-accent',
  tests: 'bg-success/10 text-success',
  financial: 'bg-warning/10 text-warning',
  misc: 'bg-muted text-muted-foreground',
};

export const ApplicationProgress = () => {
  const { t } = useLanguage();
  const { applications, loading, addApplication, updateApplication, removeApplication } = useApplications();
  const [newUniversity, setNewUniversity] = useState('');
  const [expandedApps, setExpandedApps] = useState<Set<string>>(new Set());
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddApplication = async (universityName: string) => {
    if (!universityName.trim()) return;
    const newApp = await addApplication(universityName);
    if (newApp) {
      setNewUniversity('');
      setExpandedApps(prev => new Set([...prev, newApp.id]));
    }
  };

  const handleToggleItem = async (appId: string, itemId: string) => {
    const app = applications.find(a => a.id === appId);
    if (!app) return;
    const checklist = app.checklist.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    await updateApplication(appId, { checklist });
  };

  const handleAddCustomItem = async (appId: string, label: string) => {
    if (!label.trim()) return;
    const app = applications.find(a => a.id === appId);
    if (!app) return;
    const checklist = [...app.checklist, {
      id: Date.now().toString(),
      label: label.trim(),
      completed: false,
      category: 'misc' as const,
    }];
    await updateApplication(appId, { checklist });
  };

  const toggleExpanded = (id: string) => {
    setExpandedApps(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const getProgress = (app: { checklist: { completed: boolean }[] }) => {
    if (app.checklist.length === 0) return 0;
    return Math.round((app.checklist.filter(item => item.completed).length / app.checklist.length) * 100);
  };

  const overallStats = useMemo(() => {
    const total = applications.length;
    const completed = applications.filter(app => getProgress(app) === 100).length;
    const inProgress = applications.filter(app => { const p = getProgress(app); return p > 0 && p < 100; }).length;
    const notStarted = total - completed - inProgress;
    return { total, completed, inProgress, notStarted };
  }, [applications]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="pt-4">
            <div className="text-3xl font-bold text-primary">{overallStats.total}</div>
            <div className="text-sm text-muted-foreground">Total Applications</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-success/10 to-success/5">
          <CardContent className="pt-4">
            <div className="text-3xl font-bold text-success">{overallStats.completed}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-warning/10 to-warning/5">
          <CardContent className="pt-4">
            <div className="text-3xl font-bold text-warning">{overallStats.inProgress}</div>
            <div className="text-sm text-muted-foreground">In Progress</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-muted to-muted/50">
          <CardContent className="pt-4">
            <div className="text-3xl font-bold text-muted-foreground">{overallStats.notStarted}</div>
            <div className="text-sm text-muted-foreground">Not Started</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ClipboardCheck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Application Progress Tracker</CardTitle>
                <CardDescription>Track your application checklist for each university</CardDescription>
              </div>
            </div>
            <Button onClick={() => setShowAddForm(!showAddForm)} variant={showAddForm ? "secondary" : "default"}>
              <Plus className="h-4 w-4 mr-2" /> Add University
            </Button>
          </div>
        </CardHeader>
        
        {showAddForm && (
          <CardContent className="border-t pt-4">
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input placeholder="Enter university name..." value={newUniversity} onChange={(e) => setNewUniversity(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddApplication(newUniversity)} />
                <Button onClick={() => handleAddApplication(newUniversity)} disabled={!newUniversity.trim()}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {PRESET_UNIVERSITIES.slice(0, 10).map(uni => (
                  <Badge key={uni} variant="outline" className="cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => handleAddApplication(uni)}>
                    <Plus className="h-3 w-3 mr-1" /> {uni}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {applications.length === 0 ? (
        <Card className="bg-muted/30">
          <CardContent className="py-12 text-center">
            <GraduationCap className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="font-medium mb-2">No Applications Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Add universities you're applying to and track your progress</p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add Your First University
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[600px]">
          <div className="space-y-4 pr-4">
            {applications.map(app => {
              const progress = getProgress(app);
              const isExpanded = expandedApps.has(app.id);
              
              return (
                <Collapsible key={app.id} open={isExpanded} onOpenChange={() => toggleExpanded(app.id)}>
                  <Card className={`transition-all ${progress === 100 ? 'border-success/50 bg-success/5' : ''}`}>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {isExpanded ? <ChevronDown className="h-5 w-5 text-muted-foreground" /> : <ChevronRight className="h-5 w-5 text-muted-foreground" />}
                            <div>
                              <CardTitle className="text-lg flex items-center gap-2">
                                {app.universityName}
                                {progress === 100 && <CheckCircle2 className="h-5 w-5 text-success" />}
                              </CardTitle>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-sm text-muted-foreground">{app.checklist.filter(i => i.completed).length} / {app.checklist.length} tasks</span>
                                {progress > 0 && progress < 100 && (
                                  <Badge variant="secondary" className="text-xs"><AlertCircle className="h-3 w-3 mr-1" />In Progress</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className={`text-2xl font-bold ${progress === 100 ? 'text-success' : progress >= 50 ? 'text-warning' : 'text-muted-foreground'}`}>{progress}%</div>
                            </div>
                            <Button variant="ghost" size="icon" aria-label="Remove application" onClick={(e) => { e.stopPropagation(); removeApplication(app.id); }} className="text-muted-foreground hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <Progress value={progress} className={`h-2 mt-3 ${progress === 100 ? '[&>div]:bg-success' : progress >= 50 ? '[&>div]:bg-warning' : ''}`} />
                      </CardHeader>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <CardContent className="border-t pt-4 space-y-4">
                        {(['documents', 'essays', 'tests', 'financial', 'misc'] as const).map(category => {
                          const items = app.checklist.filter(item => item.category === category);
                          if (items.length === 0) return null;
                          const Icon = CATEGORY_ICONS[category];
                          const completedInCategory = items.filter(i => i.completed).length;
                          
                          return (
                            <div key={category} className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Badge className={CATEGORY_COLORS[category]}>
                                  <Icon className="h-3 w-3 mr-1" />{category.charAt(0).toUpperCase() + category.slice(1)}
                                </Badge>
                                <span className="text-xs text-muted-foreground">{completedInCategory}/{items.length}</span>
                              </div>
                              <div className="space-y-1 ml-2">
                                {items.map(item => (
                                  <div key={item.id} className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${item.completed ? 'bg-success/5' : 'hover:bg-muted/50'}`}>
                                    <Checkbox checked={item.completed} onCheckedChange={() => handleToggleItem(app.id, item.id)} />
                                    <span className={`text-sm ${item.completed ? 'line-through text-muted-foreground' : ''}`}>{item.label}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                        <div className="pt-2 border-t">
                          <AddCustomItemForm onAdd={(label) => handleAddCustomItem(app.id, label)} />
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

const AddCustomItemForm = ({ onAdd }: { onAdd: (label: string) => void }) => {
  const [value, setValue] = useState('');
  const handleAdd = () => { onAdd(value); setValue(''); };
  
  return (
    <div className="flex gap-2">
      <Input placeholder="Add custom checklist item..." value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAdd()} className="text-sm" />
      <Button size="sm" variant="outline" onClick={handleAdd} disabled={!value.trim()}>
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
};
