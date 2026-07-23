import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";
import { Plus, Send, Loader2, Trash2, Users, Megaphone, BarChart3, Star, Mail, Clock, CheckCircle, X, Search, UserPlus, MessageCircle, TrendingUp, FileText } from "lucide-react";
import MessageThread from "@/components/messages/MessageThread";
import PollCard from "@/components/messages/PollCard";
import ContactsTab, { buildWhatsAppPhone } from "@/components/admin/ContactsTab";
import TemplatesTab from "@/components/admin/TemplatesTab";

const audienceGroups = [
  { id: "all", label: "Tous les utilisateurs" },
  { id: "new", label: "Nouveaux utilisateurs (7 jours)" },
  { id: "inactive_30", label: "Inactifs depuis 30 jours" },
  { id: "active", label: "Utilisateurs actifs" },
  { id: "no_credits", label: "Sans crédits" },
  { id: "never_purchased", label: "Jamais acheté de crédits" },
  { id: "premium", label: "Premium" },
];

export default function MessagesAdmin() {
  const [tab, setTab] = useState("contacts");
  const [loading, setLoading] = useState(true);

  // Conversations
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [convSearch, setConvSearch] = useState("");

  // Campaigns
  const [campaigns, setCampaigns] = useState([]);
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [campaignForm, setCampaignForm] = useState({ title: "", content: "", audience_type: "all", audience_group: "all", userSearch: "", selectedUsers: [], schedule_mode: "now", scheduled_date: "" });
  const [allUsers, setAllUsers] = useState([]);
  const [sendingCampaign, setSendingCampaign] = useState(false);

  // Polls
  const [polls, setPolls] = useState([]);
  const [showPollForm, setShowPollForm] = useState(false);
  const [pollForm, setPollForm] = useState({ question: "", options: ["", ""], end_date: "" });

  // Feedback
  const [feedbacks, setFeedbacks] = useState([]);

  // Stats
  const [stats, setStats] = useState(null);

  // Templates (for campaign form picker)
  const [campaignTemplates, setCampaignTemplates] = useState([]);

  useEffect(() => { loadData(tab); }, [tab]);

  const loadData = async (tab) => {
    setLoading(true);
    try {
      if (tab === "contacts") {
        const users = await base44.entities.User.list("-created_date", 500);
        setAllUsers(users || []);
      } else if (tab === "conversations") {
        const [convs, users] = await Promise.all([
          base44.entities.Conversation.list("-last_message_at", 200),
          base44.entities.User.list("-created_date", 500),
        ]);
        const userMap = {};
        (users || []).forEach((u) => { userMap[u.id] = u; });
        setConversations((convs || []).map((c) => ({ ...c, _user: userMap[c.owner_id || c.created_by_id] })));
        setAllUsers(users || []);
      } else if (tab === "campaigns") {
        const [cmps, users, tmpls] = await Promise.all([
          base44.entities.Campaign.list("-created_date", 200),
          base44.entities.User.list("-created_date", 500),
          base44.entities.MessageTemplate.list("-created_date", 200),
        ]);
        setCampaigns(cmps || []);
        setAllUsers(users || []);
        setCampaignTemplates(tmpls || []);
      } else if (tab === "polls") {
        setPolls(await base44.entities.Poll.list("-created_date", 100));
      } else if (tab === "feedback") {
        setFeedbacks(await base44.entities.Feedback.list("-created_date", 200));
      } else if (tab === "stats") {
        const [convs, msgs, cmps, polls, feedbacks, users] = await Promise.all([
          base44.entities.Conversation.list("-created_date", 500),
          base44.entities.Message.list("-created_date", 500),
          base44.entities.Campaign.list("-created_date", 100),
          base44.entities.Poll.list("-created_date", 100),
          base44.entities.Feedback.list("-created_date", 200),
          base44.entities.User.list("-created_date", 500),
        ]);
        const userReadMessages = (msgs || []).filter((m) => m.read).length;
        const userReplies = (msgs || []).filter((m) => m.sender_role === "user").length;
        const avgApp = (feedbacks || []).length ? (feedbacks.reduce((s, f) => s + (f.app_rating || 0), 0) / feedbacks.length).toFixed(1) : "—";
        const avgVideo = (feedbacks || []).length ? (feedbacks.reduce((s, f) => s + (f.video_quality_rating || 0), 0) / feedbacks.length).toFixed(1) : "—";
        const avgSpeed = (feedbacks || []).length ? (feedbacks.reduce((s, f) => s + (f.speed_rating || 0), 0) / feedbacks.length).toFixed(1) : "—";
        const avgUx = (feedbacks || []).length ? (feedbacks.reduce((s, f) => s + (f.ux_rating || 0), 0) / feedbacks.length).toFixed(1) : "—";
        setStats({
          totalConversations: (convs || []).length,
          totalMessages: (msgs || []).length,
          totalCampaigns: (cmps || []).length,
          totalPolls: (polls || []).length,
          readRate: (msgs || []).length ? Math.round((userReadMessages / msgs.length) * 100) : 0,
          replyRate: (msgs || []).length ? Math.round((userReplies / msgs.length) * 100) : 0,
          activeUsers: (users || []).filter((u) => u.last_login && new Date(u.last_login) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
          totalUsers: (users || []).length,
          feedbackCount: (feedbacks || []).length,
          avgApp, avgVideo, avgSpeed, avgUx,
        });
      }
    } catch { /* ignore */ }
    setLoading(false);
  };

  const filterUsersByGroup = (group, users) => {
    const now = Date.now();
    if (group === "all") return users;
    if (group === "new") return users.filter((u) => u.created_date && new Date(u.created_date) > new Date(now - 7 * 24 * 60 * 60 * 1000));
    if (group === "inactive_30") return users.filter((u) => !u.last_login || new Date(u.last_login) < new Date(now - 30 * 24 * 60 * 60 * 1000));
    if (group === "active") return users.filter((u) => u.last_login && new Date(u.last_login) > new Date(now - 7 * 24 * 60 * 60 * 1000));
    if (group === "no_credits") return users.filter((u) => (u.diamonds || 0) === 0);
    if (group === "never_purchased") return users.filter((u) => !u.has_purchased);
    if (group === "premium") return users.filter((u) => u.is_premium);
    return users;
  };

  const handleSendCampaign = async () => {
    const { title, content, audience_type, audience_group, selectedUsers, schedule_mode, scheduled_date } = campaignForm;
    if (!title.trim() || !content.trim()) return;

    let targetUsers = [];
    if (audience_type === "all") targetUsers = allUsers;
    else if (audience_type === "group") targetUsers = filterUsersByGroup(audience_group, allUsers);
    else if (audience_type === "specific") targetUsers = allUsers.filter((u) => selectedUsers.includes(u.id));

    if (targetUsers.length === 0) {
      toast({ title: "Aucun utilisateur", description: "L'audience sélectionnée est vide.", variant: "destructive" });
      return;
    }

    if (schedule_mode === "schedule" && !scheduled_date) {
      toast({ title: "Date manquante", description: "Sélectionnez une date d'envoi.", variant: "destructive" });
      return;
    }

    setSendingCampaign(true);
    try {
      const isScheduled = schedule_mode === "schedule";
      const campaign = await base44.entities.Campaign.create({
        title: title.trim(),
        content: content.trim(),
        audience_type,
        audience_criteria: audience_type === "group" ? audience_group : JSON.stringify(selectedUsers),
        status: isScheduled ? "scheduled" : "sent",
        scheduled_date: isScheduled ? new Date(scheduled_date).toISOString() : undefined,
        sent_count: isScheduled ? 0 : targetUsers.length,
        read_count: 0,
        conversion_count: 0,
      });

      // If scheduled, skip sending now — the workflow will process it automatically
      if (isScheduled) {
        toast({ title: "Campagne programmée !", description: `Envoi automatique prévu le ${new Date(scheduled_date).toLocaleString("fr-FR")} vers ${targetUsers.length} utilisateur(s).` });
        setShowCampaignForm(false);
        setCampaignForm({ title: "", content: "", audience_type: "all", audience_group: "all", userSearch: "", selectedUsers: [], schedule_mode: "now", scheduled_date: "" });
        loadData("campaigns");
        setSendingCampaign(false);
        return;
      }

      // Create conversations + initial messages for each user
      const batchSize = 20;
      for (let i = 0; i < targetUsers.length; i += batchSize) {
        const batch = targetUsers.slice(i, i + batchSize);
        const convs = await base44.entities.Conversation.bulkCreate(
          batch.map((u) => ({
            subject: title.trim(),
            category: "other",
            type: "campaign",
            status: "open",
            campaign_id: campaign.id,
            owner_id: u.id,
            last_message_at: new Date().toISOString(),
            unread_count: 1,
          }))
        );
        const messages = [];
        for (const conv of convs) {
          messages.push({
            conversation_id: conv.id,
            content: content.trim(),
            sender_role: "admin",
            owner_id: conv.owner_id,
            read: false,
          });
        }
        await base44.entities.Message.bulkCreate(messages);
      }

      toast({ title: "Campagne envoyée !", description: `${targetUsers.length} utilisateur(s) ciblé(s).` });
      setShowCampaignForm(false);
      setCampaignForm({ title: "", content: "", audience_type: "all", audience_group: "all", userSearch: "", selectedUsers: [], schedule_mode: "now", scheduled_date: "" });
      loadData("campaigns");
    } catch {
      toast({ title: "Erreur", description: "Impossible d'envoyer la campagne.", variant: "destructive" });
    }
    setSendingCampaign(false);
  };

  const quickScheduleInactive = () => {
    setCampaignForm({
      title: "Relance - Utilisateurs inactifs",
      content: "Bonjour ! Cela fait un moment que nous ne vous avons pas vu sur Story221. Vos diamants vous attendent pour créer de nouveaux contenus. Revenez profiter de nos dernières fonctionnalités !",
      audience_type: "group",
      audience_group: "inactive_30",
      userSearch: "",
      selectedUsers: [],
      schedule_mode: "schedule",
      scheduled_date: "",
    });
    setShowCampaignForm(true);
  };

  const handleCreatePoll = async () => {
    const { question, options, end_date } = pollForm;
    const cleanOptions = options.map((o) => o.trim()).filter(Boolean);
    if (!question.trim() || cleanOptions.length < 2) return;
    try {
      await base44.entities.Poll.create({
        question: question.trim(),
        options: cleanOptions,
        status: "active",
        end_date: end_date ? new Date(end_date).toISOString() : undefined,
      });
      toast({ title: "Sondage créé !" });
      setShowPollForm(false);
      setPollForm({ question: "", options: ["", ""], end_date: "" });
      loadData("polls");
    } catch {
      toast({ title: "Erreur", description: "Impossible de créer le sondage.", variant: "destructive" });
    }
  };

  const handleClosePoll = async (pollId) => {
    await base44.entities.Poll.update(pollId, { status: "closed" });
    loadData("polls");
    toast({ title: "Sondage clôturé" });
  };

  const handleDeleteCampaign = async (campaignId) => {
    if (!confirm("Supprimer cette campagne ? Les conversations envoyées ne seront pas supprimées.")) return;
    try {
      await base44.entities.Campaign.delete(campaignId);
      loadData("campaigns");
      toast({ title: "Campagne supprimée" });
    } catch {
      toast({ title: "Erreur", description: "Impossible de supprimer la campagne.", variant: "destructive" });
    }
  };

  const handleDeletePoll = async (pollId) => {
    if (!confirm("Supprimer ce sondage ?")) return;
    await base44.entities.Poll.delete(pollId);
    loadData("polls");
    toast({ title: "Sondage supprimé" });
  };

  const filteredConvs = conversations.filter((c) => {
    const q = convSearch.toLowerCase().trim();
    if (!q) return true;
    return c.subject?.toLowerCase().includes(q) || c._user?.email?.toLowerCase().includes(q) || c._user?.username?.toLowerCase().includes(q);
  });

  const filteredUsers = allUsers.filter((u) => {
    const q = campaignForm.userSearch.toLowerCase().trim();
    if (!q) return true;
    return u.email?.toLowerCase().includes(q) || u.username?.toLowerCase().includes(q);
  });

  const tabs = [
    { id: "contacts", label: "Contacts & Relance", icon: UserPlus },
    { id: "templates", label: "Modèles", icon: FileText },
    { id: "conversations", label: "Conversations", icon: Mail },
    { id: "campaigns", label: "Campagnes", icon: Megaphone },
    { id: "polls", label: "Sondages", icon: BarChart3 },
    { id: "feedback", label: "Avis", icon: Star },
    { id: "stats", label: "Statistiques", icon: Users },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-6">Centre de Messagerie</h2>

      <div className="flex items-center gap-1 mb-6 overflow-x-auto scrollbar-hide">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              tab === t.id ? "bg-primary text-white" : "bg-card text-muted-foreground hover:text-white border border-border"
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
      ) : (
        <>
          {/* CONTACTS TAB */}
          {tab === "contacts" && (
            <ContactsTab allUsers={allUsers} onRefresh={() => loadData("contacts")} />
          )}

          {/* TEMPLATES TAB */}
          {tab === "templates" && (
            <TemplatesTab />
          )}

          {/* CONVERSATIONS TAB */}
          {tab === "conversations" && (
            <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4 h-[600px]">
              <div className="rounded-xl bg-card border border-border overflow-hidden flex flex-col">
                <div className="p-3 border-b border-border">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      value={convSearch}
                      onChange={(e) => setConvSearch(e.target.value)}
                      placeholder="Rechercher par nom, email..."
                      className="w-full h-9 pl-8 pr-3 rounded-lg bg-secondary text-sm text-white outline-none"
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {filteredConvs.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">Aucune conversation</p>
                  ) : (
                    filteredConvs.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setSelectedConv(c)}
                        className={`w-full flex flex-col gap-1 px-3 py-3 text-left border-b border-border/50 transition-colors ${
                          selectedConv?.id === c.id ? "bg-primary/10" : "hover:bg-secondary/50"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium text-white truncate flex-1">{c.subject}</span>
                          {c.unread_count > 0 && (
                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">{c.unread_count}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {c._user && (
                            <span className="text-[10px] text-muted-foreground truncate">
                              @{c._user.username || c._user.email?.split("@")[0]}
                            </span>
                          )}
                          {c.type === "campaign" && (
                            <span className="text-[10px] text-primary font-medium">Annonce</span>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
              <div className="rounded-xl bg-card border border-border overflow-hidden">
                {selectedConv ? (
                  <MessageThread conversation={selectedConv} isAdmin onBack={() => setSelectedConv(null)} />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-20">
                    <Mail className="w-8 h-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Sélectionnez une conversation pour répondre</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CAMPAIGNS TAB */}
          {tab === "campaigns" && (
            <div>
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <p className="text-sm text-muted-foreground">Envoyez des annonces à vos utilisateurs</p>
                <div className="flex gap-2">
                  <button
                    onClick={quickScheduleInactive}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary text-white text-sm font-medium border border-border"
                  >
                    <Clock className="w-4 h-4" />Relance inactifs 30j
                  </button>
                  <button
                    onClick={() => setShowCampaignForm(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />Nouvelle campagne
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {campaigns.length === 0 ? (
                  <div className="rounded-2xl bg-card border border-border p-8 text-center">
                    <Megaphone className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">Aucune campagne. Créez votre première annonce.</p>
                  </div>
                ) : (
                  campaigns.map((c) => (
                    <div key={c.id} className="rounded-xl bg-card border border-border p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-bold text-white">{c.title}</h3>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                              c.status === "sent" ? "bg-green-500/20 text-green-400" :
                              c.status === "scheduled" ? "bg-yellow-500/20 text-yellow-400" :
                              "bg-secondary text-muted-foreground"
                            }`}>{c.status}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-secondary text-muted-foreground">
                              {c.audience_type === "all" ? "Tous" : c.audience_type === "group" ? "Groupe" : "Spécifique"}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">{c.content}</p>
                          <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground flex-wrap">
                            <span><Users className="w-3 h-3 inline mr-1" />{c.sent_count || 0} destinataires</span>
                            <span><CheckCircle className="w-3 h-3 inline mr-1" />{c.read_count || 0} lus</span>
                            {c.status === "sent" && (
                              <span className="text-primary font-medium"><TrendingUp className="w-3 h-3 inline mr-1" />{c.conversion_count || 0} conversions ({c.sent_count > 0 ? Math.round(((c.conversion_count || 0) / c.sent_count) * 100) : 0}%)</span>
                            )}
                            {c.status === "scheduled" && c.scheduled_date && (
                              <span className="text-yellow-400 font-medium"><Clock className="w-3 h-3 inline mr-1" />Programmée: {new Date(c.scheduled_date).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                            )}
                            <span><Clock className="w-3 h-3 inline mr-1" />{new Date(c.created_date).toLocaleDateString("fr-FR")}</span>
                          </div>
                        </div>
                        <button onClick={() => handleDeleteCampaign(c.id)} className="flex-shrink-0 w-8 h-8 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* POLLS TAB */}
          {tab === "polls" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">Créez des sondages pour votre communauté</p>
                <button
                  onClick={() => setShowPollForm(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />Nouveau sondage
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {polls.length === 0 ? (
                  <div className="col-span-2 rounded-2xl bg-card border border-border p-8 text-center">
                    <BarChart3 className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">Aucun sondage.</p>
                  </div>
                ) : (
                  polls.map((p) => (
                    <div key={p.id} className="relative">
                      <PollCard poll={p} isAdmin />
                      <div className="flex gap-2 mt-2">
                        {p.status === "active" && (
                          <button onClick={() => handleClosePoll(p.id)} className="flex-1 px-3 py-1.5 rounded-lg bg-secondary text-muted-foreground text-xs font-medium hover:text-white">
                            Clôturer
                          </button>
                        )}
                        <button onClick={() => handleDeletePoll(p.id)} className="w-9 h-9 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* FEEDBACK TAB */}
          {tab === "feedback" && (
            <div>
              {feedbacks.length === 0 ? (
                <div className="rounded-2xl bg-card border border-border p-8 text-center">
                  <Star className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Aucun avis pour le moment.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                    {[
                      { label: "App", val: stats?.avgApp || (feedbacks.length ? (feedbacks.reduce((s, f) => s + (f.app_rating || 0), 0) / feedbacks.length).toFixed(1) : "—") },
                      { label: "Vidéos", val: feedbacks.length ? (feedbacks.reduce((s, f) => s + (f.video_quality_rating || 0), 0) / feedbacks.length).toFixed(1) : "—" },
                      { label: "Rapidité", val: feedbacks.length ? (feedbacks.reduce((s, f) => s + (f.speed_rating || 0), 0) / feedbacks.length).toFixed(1) : "—" },
                      { label: "UX", val: feedbacks.length ? (feedbacks.reduce((s, f) => s + (f.ux_rating || 0), 0) / feedbacks.length).toFixed(1) : "—" },
                    ].map((s) => (
                      <div key={s.label} className="rounded-xl bg-card border border-border p-4 text-center">
                        <p className="text-2xl font-bold text-white">{s.val}<span className="text-sm text-muted-foreground">/5</span></p>
                        <p className="text-xs text-muted-foreground">{s.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {feedbacks.map((f) => (
                      <div key={f.id} className="rounded-xl bg-card border border-border p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className={`w-3.5 h-3.5 ${s <= (f.app_rating || 0) ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"}`} />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">{new Date(f.created_date).toLocaleDateString("fr-FR")}</span>
                        </div>
                        {f.comment && <p className="text-sm text-white">{f.comment}</p>}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* STATS TAB */}
          {tab === "stats" && stats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Conversations", value: stats.totalConversations, icon: Mail },
                { label: "Messages envoyés", value: stats.totalMessages, icon: Send },
                { label: "Campagnes", value: stats.totalCampaigns, icon: Megaphone },
                { label: "Sondages", value: stats.totalPolls, icon: BarChart3 },
                { label: "Taux de lecture", value: `${stats.readRate}%`, icon: CheckCircle },
                { label: "Taux de réponse", value: `${stats.replyRate}%`, icon: Star },
                { label: "Utilisateurs actifs", value: `${stats.activeUsers}/${stats.totalUsers}`, icon: Users },
                { label: "Avis reçus", value: stats.feedbackCount, icon: Star },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl bg-card border border-border p-5">
                  <s.icon className="w-5 h-5 text-primary mb-2" />
                  <p className="text-2xl font-bold text-white">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Campaign form modal */}
      {showCampaignForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setShowCampaignForm(false)}>
          <div className="w-full max-w-lg rounded-2xl bg-card border border-border p-5 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Nouvelle campagne</h2>
              <button onClick={() => setShowCampaignForm(false)} className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Titre</label>
                <input value={campaignForm.title} onChange={(e) => setCampaignForm({ ...campaignForm, title: e.target.value })} placeholder="Ex: Nouvelle fonctionnalité" className="w-full h-10 rounded-lg bg-secondary border border-border px-3 text-sm text-white" />
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Message</label>
                {campaignTemplates.length > 0 && (
                  <div className="mb-2">
                    <label className="text-[10px] text-muted-foreground mb-1 block flex items-center gap-1"><FileText className="w-3 h-3" />Utiliser un modèle</label>
                    <select
                      value=""
                      onChange={(e) => {
                        const t = campaignTemplates.find((tpl) => tpl.id === e.target.value);
                        if (t) setCampaignForm((prev) => ({ ...prev, title: t.name, content: t.content }));
                      }}
                      className="w-full h-9 rounded-lg bg-secondary border border-border px-3 text-sm text-white"
                    >
                      <option value="">— Sélectionner un modèle —</option>
                      {campaignTemplates.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                <textarea value={campaignForm.content} onChange={(e) => setCampaignForm({ ...campaignForm, content: e.target.value })} placeholder="Contenu du message..." rows={4} className="w-full rounded-lg bg-secondary border border-border px-3 py-2.5 text-sm text-white resize-none outline-none" />
              </div>

              {/* Schedule mode */}
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Mode d'envoi</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setCampaignForm({ ...campaignForm, schedule_mode: "now" })} className={`h-9 rounded-lg text-xs font-medium transition-colors ${campaignForm.schedule_mode === "now" ? "bg-primary text-white" : "bg-secondary text-muted-foreground"}`}>
                    Envoyer maintenant
                  </button>
                  <button type="button" onClick={() => setCampaignForm({ ...campaignForm, schedule_mode: "schedule" })} className={`h-9 rounded-lg text-xs font-medium transition-colors ${campaignForm.schedule_mode === "schedule" ? "bg-primary text-white" : "bg-secondary text-muted-foreground"}`}>
                    Programmer l'envoi
                  </button>
                </div>
                {campaignForm.schedule_mode === "schedule" && (
                  <input type="datetime-local" value={campaignForm.scheduled_date} onChange={(e) => setCampaignForm({ ...campaignForm, scheduled_date: e.target.value })} className="w-full h-10 mt-2 rounded-lg bg-secondary border border-border px-3 text-sm text-white" />
                )}
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Audience</label>
                <div className="grid grid-cols-3 gap-2">
                  {["all", "group", "specific"].map((t) => (
                    <button key={t} onClick={() => setCampaignForm({ ...campaignForm, audience_type: t })} className={`h-9 rounded-lg text-xs font-medium transition-colors ${campaignForm.audience_type === t ? "bg-primary text-white" : "bg-secondary text-muted-foreground"}`}>
                      {t === "all" ? "Tous" : t === "group" ? "Groupe" : "Spécifique"}
                    </button>
                  ))}
                </div>
              </div>

              {campaignForm.audience_type === "group" && (
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Critère de ciblage</label>
                  <select value={campaignForm.audience_group} onChange={(e) => setCampaignForm({ ...campaignForm, audience_group: e.target.value })} className="w-full h-10 rounded-lg bg-secondary border border-border px-3 text-sm text-white">
                    {audienceGroups.map((g) => <option key={g.id} value={g.id}>{g.label}</option>)}
                  </select>
                  <p className="text-xs text-muted-foreground mt-1.5">{filterUsersByGroup(campaignForm.audience_group, allUsers).length} utilisateur(s) ciblé(s)</p>
                  <div className="max-h-32 overflow-y-auto space-y-1 mt-2">
                    {filterUsersByGroup(campaignForm.audience_group, allUsers).slice(0, 20).map((u) => {
                      const waPhone = buildWhatsAppPhone(u);
                      if (!waPhone) return null;
                      return (
                        <div key={u.id} className="flex items-center gap-2 p-1.5 rounded-lg bg-secondary/50">
                          <span className="text-xs text-white truncate flex-1">@{u.username || u.email?.split("@")[0]}</span>
                          <span className="text-[10px] text-muted-foreground truncate">{u.phone_country} {u.phone}</span>
                          <a
                            href={`https://wa.me/${waPhone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-shrink-0 w-6 h-6 rounded-lg bg-green-500/10 text-green-400 flex items-center justify-center hover:bg-green-500/20 transition-colors"
                            title={`WhatsApp: ${u.phone_country || ""} ${u.phone}`}
                          >
                            <MessageCircle className="w-3 h-3" />
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {campaignForm.audience_type === "specific" && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs text-muted-foreground">Rechercher des utilisateurs</label>
                    <button
                      type="button"
                      onClick={() => {
                        const allFilteredIds = filteredUsers.map((u) => u.id);
                        const allSelected = allFilteredIds.every((id) => campaignForm.selectedUsers.includes(id));
                        setCampaignForm({
                          ...campaignForm,
                          selectedUsers: allSelected
                            ? campaignForm.selectedUsers.filter((id) => !allFilteredIds.includes(id))
                            : [...new Set([...campaignForm.selectedUsers, ...allFilteredIds])],
                        });
                      }}
                      className="text-[11px] text-primary font-medium"
                    >
                      {filteredUsers.length > 0 && filteredUsers.every((u) => campaignForm.selectedUsers.includes(u.id)) ? "Tout désélectionner" : "Tout sélectionner"}
                    </button>
                  </div>
                  <div className="relative mb-2">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input value={campaignForm.userSearch} onChange={(e) => setCampaignForm({ ...campaignForm, userSearch: e.target.value })} placeholder="Nom ou email..." className="w-full h-9 pl-8 pr-3 rounded-lg bg-secondary text-sm text-white outline-none" />
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {filteredUsers.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-3">Aucun utilisateur trouvé</p>
                    ) : (
                      filteredUsers.map((u) => {
                        const waPhone = buildWhatsAppPhone(u);
                        return (
                          <div key={u.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary">
                            <label className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer">
                              <input type="checkbox" checked={campaignForm.selectedUsers.includes(u.id)} onChange={(e) => {
                                const checked = e.target.checked;
                                setCampaignForm({
                                  ...campaignForm,
                                  selectedUsers: checked ? [...campaignForm.selectedUsers, u.id] : campaignForm.selectedUsers.filter((id) => id !== u.id),
                                });
                              }} className="accent-primary" />
                              <span className="text-sm text-white truncate">@{u.username || u.email?.split("@")[0]}</span>
                              {u.phone && <span className="text-[10px] text-muted-foreground truncate">{u.phone_country} {u.phone}</span>}
                            </label>
                            {waPhone && (
                              <a
                                href={`https://wa.me/${waPhone}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="flex-shrink-0 w-7 h-7 rounded-lg bg-green-500/10 text-green-400 flex items-center justify-center hover:bg-green-500/20 transition-colors"
                                title={`WhatsApp: ${u.phone_country || ""} ${u.phone}`}
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                  {campaignForm.selectedUsers.length > 0 && (
                    <p className="text-xs text-primary mt-1.5">{campaignForm.selectedUsers.length} utilisateur(s) sélectionné(s)</p>
                  )}
                </div>
              )}

              {/* Target preview */}
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-primary/10 border border-primary/20">
                <Users className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-sm text-white">
                  <span className="font-bold">{(() => {
                    if (campaignForm.audience_type === "all") return allUsers.length;
                    if (campaignForm.audience_type === "group") return filterUsersByGroup(campaignForm.audience_group, allUsers).length;
                    return campaignForm.selectedUsers.length;
                  })()}</span> destinataire(s)
                </span>
              </div>

              <button onClick={handleSendCampaign} disabled={!campaignForm.title.trim() || !campaignForm.content.trim() || (campaignForm.schedule_mode === "schedule" && !campaignForm.scheduled_date) || sendingCampaign} className="w-full h-11 rounded-xl bg-primary text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-40">
                {sendingCampaign ? <Loader2 className="w-4 h-4 animate-spin" /> : campaignForm.schedule_mode === "schedule" ? <Clock className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                {campaignForm.schedule_mode === "schedule" ? "Programmer la campagne" : "Envoyer la campagne"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Poll form modal */}
      {showPollForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setShowPollForm(false)}>
          <div className="w-full max-w-lg rounded-2xl bg-card border border-border p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Nouveau sondage</h2>
              <button onClick={() => setShowPollForm(false)} className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Question</label>
                <input value={pollForm.question} onChange={(e) => setPollForm({ ...pollForm, question: e.target.value })} placeholder="Ex: Quel nouveau style souhaitez-vous ?" className="w-full h-10 rounded-lg bg-secondary border border-border px-3 text-sm text-white" />
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Options de réponse</label>
                <div className="space-y-2">
                  {pollForm.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...pollForm.options];
                          newOpts[i] = e.target.value;
                          setPollForm({ ...pollForm, options: newOpts });
                        }}
                        placeholder={`Option ${i + 1}`}
                        className="flex-1 h-10 rounded-lg bg-secondary border border-border px-3 text-sm text-white"
                      />
                      {pollForm.options.length > 2 && (
                        <button onClick={() => setPollForm({ ...pollForm, options: pollForm.options.filter((_, idx) => idx !== i) })} className="w-9 h-9 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {pollForm.options.length < 6 && (
                  <button onClick={() => setPollForm({ ...pollForm, options: [...pollForm.options, ""] })} className="mt-2 flex items-center gap-1 text-xs text-primary">
                    <Plus className="w-3 h-3" />Ajouter une option
                  </button>
                )}
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Date de fin (optionnel)</label>
                <input type="datetime-local" value={pollForm.end_date} onChange={(e) => setPollForm({ ...pollForm, end_date: e.target.value })} className="w-full h-10 rounded-lg bg-secondary border border-border px-3 text-sm text-white" />
              </div>

              <button onClick={handleCreatePoll} disabled={!pollForm.question.trim() || pollForm.options.filter((o) => o.trim()).length < 2} className="w-full h-11 rounded-xl bg-primary text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-40">
                <BarChart3 className="w-4 h-4" />Créer le sondage
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}