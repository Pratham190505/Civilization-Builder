import { useState, useEffect } from "react";
import { HiOutlinePlus, HiOutlinePaperAirplane, HiXMark } from "react-icons/hi2";
import { Card } from "../../components/common/Page.jsx";
import { getConversations, getMessages, sendMessage, getOrCreateConversation, getChatContacts } from "../../api/messages";
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
      const res = await getChatContacts();
      if (res.success) {
        setAdminsList(res.data || []);
      }
    } catch (err) {
      toast.error("Failed to load contacts list");
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
      <div className="grid h-48 place-items-center bg-background text-foreground rounded-2xl border border-border">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-xs text-muted-foreground">Loading Messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[340px_1fr]">
      {/* Sidebar conversation list */}
      <Card className="flex flex-col">
        <div className="flex items-center justify-between p-5 pb-3">
          <h3 className="text-base font-semibold text-foreground">Messages</h3>
          <button
            onClick={openNewChatModal}
            className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 text-white shadow-md shadow-blue-500/30 cursor-pointer border-0"
            title="Start new conversation"
          >
            <HiOutlinePlus className="h-4 w-4" />
          </button>
        </div>
        
        <div className="space-y-1 p-3 pt-0 overflow-y-auto max-h-[500px]">
          {conversations.length === 0 ? (
            <div className="px-3 py-8 text-center text-xs text-muted-foreground">
              No conversations started yet. Click "+" to start chatting.
            </div>
          ) : (
            conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => handleSelectActive(c)}
                className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition cursor-pointer border-0 bg-transparent ${
                  active?.id === c.id ? "bg-primary/15" : "hover:bg-muted"
                }`}
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-xs font-semibold text-white">
                  {c.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-sm font-semibold text-foreground">{c.name}</p>
                    <span className="text-[10px] text-muted-foreground">
                      {c.time ? new Date(c.time).toLocaleDateString() : ""}
                    </span>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{c.preview}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </Card>

      {/* Main chat window */}
      <Card className="flex flex-col">
        {active ? (
          <>
            <div className="flex items-center gap-3 border-b border-border p-5">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-xs font-semibold text-white">
                {active.initials}
              </span>
              <div>
                <p className="font-semibold text-foreground">{active.name}</p>
                <p className="text-xs text-muted-foreground">{active.role || "Admin"} {active.stateName ? `· ${active.stateName}` : ""}</p>
              </div>
            </div>
            
            <div className="flex-1 space-y-3 overflow-y-auto p-5 min-h-[400px] max-h-[500px]">
              {thread.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                  Send a message to start the conversation.
                </div>
              ) : (
                thread.map((m, i) => (
                  <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                      m.from === "me" ? "bg-primary text-white font-medium shadow-sm" : "bg-muted text-foreground"
                    }`}>
                      <p className="whitespace-pre-wrap">{m.text}</p>
                      <p className={`mt-1 text-[9px] ${m.from === "me" ? "text-white/70" : "text-muted-foreground"}`}>
                        {m.time}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <form onSubmit={handleSend} className="border-t border-border p-4">
              <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2">
                <input
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="Type your message…"
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
                <button
                  type="submit"
                  className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 text-white cursor-pointer border-0"
                >
                  <HiOutlinePaperAirplane className="h-4 w-4" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <span className="text-3xl">💬</span>
            <p className="mt-2 text-sm font-semibold text-foreground">No Chat Selected</p>
            <p className="text-xs text-muted-foreground mt-0.5">Choose a conversation or start a new chat with an administrator or coordinator</p>
            <button
              onClick={openNewChatModal}
              className="mt-4 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:opacity-90 cursor-pointer border-0"
            >
              Start New Chat
            </button>
          </div>
        )}
      </Card>

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
            <p className="text-xs text-muted-foreground mt-1">Select a contact to start messaging</p>
            
            <div className="mt-4 max-h-64 overflow-y-auto space-y-1">
              {loadingAdmins ? (
                <div className="py-8 text-center text-xs text-muted-foreground">Loading contacts...</div>
              ) : adminsList.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">No contacts available.</div>
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
                      <p className="text-xs text-muted-foreground truncate">{admin.role} · {admin.stateName || admin.schoolName || ""}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
