import { useState } from "react";
import { HiOutlinePlus, HiOutlinePaperAirplane } from "react-icons/hi2";
import { Card } from "../../components/common/Page.jsx";
<<<<<<< Updated upstream
import { conversations, messageThread } from "../../data/adminData.js";

export default function Messages() {
  const [active, setActive] = useState(conversations[0]);
=======
import { getConversations, getMessages, sendMessage, getOrCreateConversation, getChatUsers } from "../../api/messages";
import { toast } from "sonner";

export default function Messages() {
  const [conversations, setConversations] = useState([]);
  const [active, setActive] = useState(null);
  const [thread, setThread] = useState([]);
  const [inputVal, setInputVal] = useState("");
  const [loading, setLoading] = useState(true);
  
  // New conversation modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [adminsList, setAdminsList] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);

  // Fetch conversations on load
  const loadConversations = async (autoSelectId = null) => {
    try {
      setLoading(true);
      const res = await getConversations();
      if (res.success && Array.isArray(res.data)) {
        setConversations(res.data);
        
        // Auto-select conversation
        if (res.data.length > 0) {
          const toSelect = autoSelectId 
            ? res.data.find(c => c.id === autoSelectId) || res.data[0]
            : res.data[0];
          setActive(toSelect);
          loadThread(toSelect.id);
        } else {
          setActive(null);
          setThread([]);
        }
      }
    } catch (err) {
      toast.error("Failed to load conversations list");
    } finally {
      setLoading(false);
    }
  };

  const loadThread = async (convId) => {
    try {
      const res = await getMessages(convId);
      if (res.success && Array.isArray(res.data)) {
        setThread(res.data);
      }
    } catch (err) {
      console.error("Failed to load message thread:", err);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  // Poll for new messages every 8 seconds when active conversation is set
  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      loadThread(active.id);
    }, 8000);
    return () => clearInterval(interval);
  }, [active]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!inputVal.trim() || !active) return;

    const textToSend = inputVal.trim();
    setInputVal("");

    try {
      const res = await sendMessage(active.id, textToSend);
      if (res.success) {
        // Refresh local thread immediately
        loadThread(active.id);
        
        // Update last message preview in conversations list
        setConversations((prevList) =>
          prevList.map((c) =>
            c.id === active.id
              ? { ...c, preview: textToSend, time: new Date().toISOString() }
              : c
          )
        );
      }
    } catch (err) {
      toast.error("Failed to send message: " + err.message);
    }
  };

  const handleSelectActive = (conv) => {
    setActive(conv);
    loadThread(conv.id);
  };

  const openNewChatModal = async () => {
    setShowAddModal(true);
    setLoadingAdmins(true);
    try {
      const res = await getChatUsers();
      if (res.success) {
        setAdminsList(res.data || []);
      }
    } catch (err) {
      toast.error("Failed to load users list");
    } finally {
      setLoadingAdmins(false);
    }
  };

  const handleStartChat = async (adminId) => {
    try {
      const res = await getOrCreateConversation(adminId);
      if (res.success && res.data?.conversationId) {
        setShowAddModal(false);
        // Reload conversations list and select the new/existing conversation
        await loadConversations(res.data.conversationId);
        toast.success("Conversation opened");
      }
    } catch (err) {
      toast.error("Failed to open conversation: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="grid h-48 place-items-center bg-[#0b0c10] text-white rounded-2xl border border-border">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-xs text-slate-400">Loading Messages...</p>
        </div>
      </div>
    );
  }
>>>>>>> Stashed changes

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[340px_1fr]">
      <Card className="flex flex-col">
        <div className="flex items-center justify-between p-5 pb-3">
          <h3 className="text-base font-semibold text-foreground">Messages</h3>
          <button className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 text-white shadow-md shadow-blue-500/30">
            <HiOutlinePlus className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-1 p-3 pt-0">
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => setActive(c)}
              className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition ${
                active.id === c.id ? "bg-primary/15" : "hover:bg-muted"
              }`}
            >
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br ${c.color} text-xs font-semibold text-white`}>
                {c.initials}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="truncate text-sm font-semibold text-foreground">{c.name}</p>
                  <span className="text-[10px] text-muted-foreground">{c.time}</span>
                </div>
                <p className="truncate text-xs text-muted-foreground">{c.preview}</p>
              </div>
              {c.unread > 0 && (
                <span className="grid h-5 w-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-white">{c.unread}</span>
              )}
            </button>
          ))}
        </div>
      </Card>

<<<<<<< Updated upstream
      <Card className="flex flex-col">
        <div className="flex items-center gap-3 border-b border-border p-5">
          <span className={`grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br ${active.color} text-xs font-semibold text-white`}>
            {active.initials}
          </span>
          <div>
            <p className="font-semibold text-foreground">{active.name}</p>
            <p className="text-xs text-muted-foreground">{active.role}</p>
=======
      {/* New Conversation dialog */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground hover:bg-muted"
            >
              <HiXMark className="h-4 w-4" />
            </button>
            <h3 className="text-lg font-semibold text-foreground">Start New Chat</h3>
            <p className="text-xs text-muted-foreground mt-1">Select a Regional Admin to start messaging</p>
            
            <div className="mt-4 max-h-64 overflow-y-auto space-y-1">
              {loadingAdmins ? (
                <div className="py-8 text-center text-xs text-muted-foreground">Loading admins...</div>
              ) : adminsList.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">No regional admins available.</div>
              ) : (
                  adminsList.map((admin) => (
                  <button
                    key={admin.id}
                    onClick={() => handleStartChat(admin.id)}
                    className="w-full flex items-center gap-3 rounded-xl p-2.5 text-left transition hover:bg-muted border-0 bg-transparent cursor-pointer"
                  >
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-xs font-semibold text-white">
                      {admin.initials}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{admin.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {admin.roles?.join(', ') || admin.stateName || 'Admin'} · {admin.email}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
>>>>>>> Stashed changes
          </div>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto p-5 min-h-[400px]">
          {messageThread.map((m, i) => (
            <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${
                m.from === "me" ? "bg-primary text-white" : "bg-muted text-foreground"
              }`}>
                <p>{m.text}</p>
                <p className={`mt-1 text-[10px] ${m.from === "me" ? "text-white/70" : "text-muted-foreground"}`}>{m.time}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2">
            <input placeholder="Type your reply…" className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" />
            <button className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 text-white">
              <HiOutlinePaperAirplane className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
