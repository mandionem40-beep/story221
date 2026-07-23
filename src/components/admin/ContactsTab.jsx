import { useState, useMemo, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";
import { Search, MessageCircle, Mail, Inbox, Send, Loader2, Users, Phone, X, CheckSquare, Square, FileText } from "lucide-react";

const CHANNELS = [
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle, color: "bg-green-500/10 text-green-400" },
  { id: "email", label: "Email", icon: Mail, color: "bg-blue-500/10 text-blue-400" },
  { id: "internal", label: "Boîte interne", icon: Inbox, color: "bg-primary/10 text-primary" },
];

export function buildWhatsAppPhone(user) {
  let phone = (user.phone || "").trim();
  if (!phone) return null;
  phone = phone.replace(/[\s\-\(\)]/g, "");
  if (user.phone_country && !phone.startsWith("+") && !/^\d{10,}$/.test(phone)) {
    phone = user.phone_country + phone;
  }
  if (user.phone_country && !phone.startsWith("+") && !phone.startsWith(user.phone_country)) {
    phone = user.phone_country + phone;
  }
  phone = phone.replace(/^\+/, "");
  return /^\d{6,15}$/.test(phone) ? phone : null;
}

export default function ContactsTab({ allUsers, onRefresh }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [channel, setChannel] = useState("whatsapp");
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [sending, setSending] = useState(false);
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    base44.entities.MessageTemplate.list("-created_date", 200).then(setTemplates).catch(() => {});
  }, []);

  const usersWithPhone = useMemo(() => {
    return (allUsers || []).filter((u) => u.phone);
  }, [allUsers]);

  const usersWithEmail = useMemo(() => {
    return (allUsers || []).filter((u) => u.email);
  }, [allUsers]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return allUsers || [];
    return (allUsers || []).filter((u) =>
      u.email?.toLowerCase().includes(q) ||
      u.username?.toLowerCase().includes(q) ||
      u.phone?.toLowerCase().includes(q) ||
      u.full_name?.toLowerCase().includes(q)
    );
  }, [allUsers, search]);

  const toggleSelect = (userId) => {
    setSelected((prev) => prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]);
  };

  const selectAll = () => {
    if (selected.length === filtered.length) {
      setSelected([]);
    } else {
      setSelected(filtered.map((u) => u.id));
    }
  };

  const targetUsers = useMemo(() => {
    return (allUsers || []).filter((u) => selected.includes(u.id));
  }, [allUsers, selected]);

  const handleSend = async () => {
    if (!message.trim()) {
      toast({ title: "Message vide", description: "Saisissez un message.", variant: "destructive" });
      return;
    }
    if (selected.length === 0) {
      toast({ title: "Aucun destinataire", description: "Sélectionnez au moins un utilisateur.", variant: "destructive" });
      return;
    }

    setSending(true);
    try {
      if (channel === "whatsapp") {
        const waUsers = targetUsers.filter((u) => buildWhatsAppPhone(u));
        if (waUsers.length === 0) {
          toast({ title: "Aucun numéro valide", description: "Aucun utilisateur sélectionné n'a de numéro WhatsApp.", variant: "destructive" });
          setSending(false);
          return;
        }
        const encoded = encodeURIComponent(message.trim());
        waUsers.forEach((u, i) => {
          const phone = buildWhatsAppPhone(u);
          setTimeout(() => {
            window.open(`https://wa.me/${phone}?text=${encoded}`, "_blank");
          }, i * 300);
        });
        toast({ title: "WhatsApp ouvert", description: `${waUsers.length} conversation(s) WhatsApp ouverte(s).` });
      }

      else if (channel === "email") {
        const emailUsers = targetUsers.filter((u) => u.email);
        if (emailUsers.length === 0) {
          toast({ title: "Aucun email", description: "Aucun utilisateur sélectionné n'a d'email.", variant: "destructive" });
          setSending(false);
          return;
        }
        let sent = 0;
        for (const u of emailUsers) {
          try {
            await base44.integrations.Core.SendEmail({
              to: u.email,
              subject: subject.trim() || "Message de Story221",
              body: message.trim(),
            });
            sent++;
          } catch (e) { /* continue */ }
        }
        toast({ title: "Emails envoyés", description: `${sent}/${emailUsers.length} email(s) envoyé(s).` });
      }

      else if (channel === "internal") {
        const convs = await base44.entities.Conversation.bulkCreate(
          targetUsers.map((u) => ({
            subject: subject.trim() || "Message de Story221",
            category: "other",
            type: "campaign",
            status: "open",
            owner_id: u.id,
            last_message_at: new Date().toISOString(),
            unread_count: 1,
          }))
        );
        const messages = convs.map((conv) => ({
          conversation_id: conv.id,
          content: message.trim(),
          sender_role: "admin",
          owner_id: conv.owner_id,
          read: false,
        }));
        await base44.entities.Message.bulkCreate(messages);
        toast({ title: "Messages envoyés", description: `${targetUsers.length} message(s) interne(s) envoyé(s).` });
      }

      setMessage("");
      setSubject("");
      setSelected([]);
      if (onRefresh) onRefresh();
    } catch (e) {
      toast({ title: "Erreur", description: e.message || "Échec de l'envoi.", variant: "destructive" });
    }
    setSending(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
      {/* User list */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-white">Contacts ({filtered.length})</h3>
            <span className="text-[11px] text-muted-foreground">{usersWithPhone.length} avec téléphone · {usersWithEmail.length} avec email</span>
          </div>
          <button onClick={selectAll} className="text-xs text-primary font-medium">
            {selected.length === filtered.length && filtered.length > 0 ? "Tout désélectionner" : "Tout sélectionner"}
          </button>
        </div>

        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, email, téléphone..."
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-card border border-border text-sm text-white"
          />
        </div>

        <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Aucun utilisateur trouvé.</p>
          ) : (
            filtered.map((u) => {
              const waPhone = buildWhatsAppPhone(u);
              const isSelected = selected.includes(u.id);
              return (
                <div
                  key={u.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-colors cursor-pointer ${
                    isSelected ? "bg-primary/10 border-primary/50" : "bg-card border-border hover:bg-secondary/50"
                  }`}
                  onClick={() => toggleSelect(u.id)}
                >
                  <div className="flex-shrink-0">
                    {isSelected ? <CheckSquare className="w-4 h-4 text-primary" /> : <Square className="w-4 h-4 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate font-medium">
                      {u.full_name || u.username || u.email?.split("@")[0]}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                      {u.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {u.phone_country ? `${u.phone_country} ` : ""}{u.phone}
                        </span>
                      )}
                      {u.email && <span className="truncate">{u.email}</span>}
                    </div>
                  </div>
                  {waPhone && (
                    <a
                      href={`https://wa.me/${waPhone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex-shrink-0 w-9 h-9 rounded-lg bg-green-500/10 text-green-400 flex items-center justify-center hover:bg-green-500/20 transition-colors"
                      title="Ouvrir WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Message composer */}
      <div className="lg:sticky lg:top-4 h-fit">
        <div className="rounded-2xl bg-card border border-border p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Send className="w-4 h-4 text-primary" />
            Relancer ({selected.length} sélectionné{selected.length > 1 ? "s" : ""})
          </h3>

          {/* Channel selector */}
          <label className="text-xs text-muted-foreground mb-2 block">Canal d'envoi</label>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {CHANNELS.map((ch) => (
              <button
                key={ch.id}
                onClick={() => setChannel(ch.id)}
                className={`flex flex-col items-center gap-1.5 py-2.5 rounded-lg border transition-colors ${
                  channel === ch.id ? "border-primary bg-primary/10" : "border-border bg-secondary/50"
                }`}
              >
                <ch.icon className={`w-4 h-4 ${channel === ch.id ? ch.color.split(" ")[1] : "text-muted-foreground"}`} />
                <span className={`text-[10px] font-medium ${channel === ch.id ? "text-white" : "text-muted-foreground"}`}>{ch.label}</span>
              </button>
            ))}
          </div>

          {/* Subject (for email/internal) */}
          {channel !== "whatsapp" && (
            <div className="mb-3">
              <label className="text-xs text-muted-foreground mb-1.5 block">Sujet</label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={channel === "email" ? "Sujet de l'email" : "Titre du message"}
                className="w-full h-10 rounded-lg bg-secondary border border-border px-3 text-sm text-white"
              />
            </div>
          )}

          {/* Message */}
          <div className="mb-3">
            <label className="text-xs text-muted-foreground mb-1.5 block">Message</label>
            {templates.length > 0 && (
              <div className="mb-2">
                <label className="text-[10px] text-muted-foreground mb-1 block flex items-center gap-1"><FileText className="w-3 h-3" />Utiliser un modèle</label>
                <select
                  value=""
                  onChange={(e) => {
                    const t = templates.find((tpl) => tpl.id === e.target.value);
                    if (t) {
                      setMessage(t.content);
                      if (channel !== "whatsapp") setSubject(t.name);
                    }
                  }}
                  className="w-full h-9 rounded-lg bg-secondary border border-border px-3 text-sm text-white"
                >
                  <option value="">— Sélectionner un modèle —</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            )}
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Saisissez votre message..."
              rows={5}
              className="w-full rounded-lg bg-secondary border border-border px-3 py-2.5 text-sm text-white resize-none outline-none"
            />
          </div>

          {/* Channel info */}
          {channel === "whatsapp" && (
            <p className="text-[11px] text-muted-foreground mb-3">
              ℹ️ Ouvre une conversation WhatsApp par utilisateur avec le message pré-rempli. Vérifiez que les numéros sont au format international.
            </p>
          )}
          {channel === "email" && (
            <p className="text-[11px] text-muted-foreground mb-3">
              ℹ️ Envoie un email à chaque utilisateur sélectionné ayant une adresse email enregistrée.
            </p>
          )}
          {channel === "internal" && (
            <p className="text-[11px] text-muted-foreground mb-3">
              ℹ️ Crée une conversation dans la boîte de réception interne de chaque utilisateur sur la plateforme.
            </p>
          )}

          {/* Selected count by channel */}
          <div className="flex items-center gap-2 mb-4 text-[11px]">
            {channel === "whatsapp" && (
              <span className="px-2 py-1 rounded bg-green-500/10 text-green-400">
                {targetUsers.filter((u) => buildWhatsAppPhone(u)).length} avec WhatsApp
              </span>
            )}
            {channel === "email" && (
              <span className="px-2 py-1 rounded bg-blue-500/10 text-blue-400">
                {targetUsers.filter((u) => u.email).length} avec email
              </span>
            )}
            {channel === "internal" && (
              <span className="px-2 py-1 rounded bg-primary/10 text-primary">
                {targetUsers.length} destinataires
              </span>
            )}
          </div>

          <button
            onClick={handleSend}
            disabled={!message.trim() || selected.length === 0 || sending}
            className="w-full h-11 rounded-xl bg-primary text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );
}