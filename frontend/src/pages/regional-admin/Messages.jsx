import { useState, useEffect } from "react";
import { MessageSquare, Send, Plus, X } from "lucide-react";
import { getConversations, getMessages, sendMessage, getOrCreateConversation, getChatUsers } from "../../api/messages";
import { toast } from "sonner";

export default function RegionalAdminMessages() {
  const [conversations, setConversations] = useState([]);
  const [active, setActive] = useState(null);
  const [thread, setThread] = useState([]);
  const [inputVal, setInputVal] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const loadConversations = async (autoSelectId = null) => {
    try {
      setLoading(true);
      const res = await getConversations();
      if (res.success && Array.isArray(res.data)) {
        setConversations(res.data);
        if (res.data.length > 0) {
          const toSelect = autoSelectId
            ? res.data.find((c) => c.id === autoSelectId) || res.data[0]
            : res.data[0];
          setActive(toSelect);
          loadThread(toSelect.id);
        } else {
          setActive(null);
          setThread([]);
        }
      }
    } catch (err) {
      toast.error("Failed to load conversations");
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
      console.error("Failed to load messages:", err);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  // Poll for new messages every 8s when a conversation is open
  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => loadThread(active.id), 8000);
    return () => clearInterval(interval);
  }, [active]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!inputVal.trim() || !active) return;
    const text = inputVal.trim();
    setInputVal("");
    try {
      const res = await sendMessage(active.id, text);
      if (res.success) {
        loadThread(active.id);
        setConversations((prev) =>
          prev.map((c) =>
            c.id === active.id ? { ...c, preview: text, time: new Date().toISOString() } : c
          )
        );
      }
    } catch (err) {
      toast.error("Failed to send message: " + err.message);
    }
  };

  const openModal = async () => {
    setShowModal(true);
    setLoadingUsers(true);
    try {
      // Fetch all active users from the database (excluding self)
      const res = await getChatUsers();
      if (res.success) {
        setUsersList(res.data || []);
      }
    } catch (err) {
      toast.error("Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleStartChat = async (userId) => {
    try {
      const res = await getOrCreateConversation(userId);
      if (res.success && res.data?.conversationId) {
        setShowModal(false);
        await loadConversations(res.data.conversationId);
        toast.success("Conversation opened");
      }
    } catch (err) {
      toast.error("Failed to open conversation: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="grid h-48 place-items-center rounded-2xl border border-border bg-[var(--glass-card)] text-white">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Loading Messages...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 regional-admin-theme pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            Messages
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            Direct messages with other admins
          </p>
        </div>
        <button
          onClick={openModal}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white border-0 cursor-pointer"
          style={{ background: "linear-gradient(135deg, #3B82F6, #6366F1)" }}
        >
          <Plus className="w-4 h-4" />
          New Chat
        </button>
      </div>

      <div
        className="grid grid-cols-1 lg:grid-cols-[300px_1fr] rounded-2xl overflow-hidden"
        style={{
          background: "var(--glass-card)",
          border: "1px solid var(--glass-border)",
          backdropFilter: "blur(20px)",
          boxShadow: "var(--card-shadow)",
          minHeight: "500px",
        }}
      >
        {/* Conversations Sidebar */}
        <div style={{ borderRight: "1px solid var(--glass-border)" }}>
          <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--glass-border)" }}>
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Conversations ({conversations.length})
            </p>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: "480px" }}>
            {conversations.length === 0 ? (
              <div className="py-10 text-center">
                <MessageSquare className="w-10 h-10 mx-auto mb-2" style={{ color: "var(--text-muted)" }} />
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  No conversations yet
                </p>
                <button
                  onClick={openModal}
                  className="mt-3 text-xs font-semibold"
                  style={{ color: "#3B82F6" }}
                >
                  Start one →
                </button>
              </div>
            ) : (
              conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setActive(c);
                    loadThread(c.id);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all border-0 bg-transparent cursor-pointer"
                  style={{
                    borderBottom: "1px solid var(--glass-border)",
                    background: active?.id === c.id ? "rgba(59, 130, 246, 0.08)" : "transparent",
                  }}
                >
                  <span
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold text-white"
                    style={{ background: "linear-gradient(135deg, #3B82F6, #6366F1)" }}
                  >
                    {c.initials || "?"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                        {c.name}
                      </p>
                      <span className="text-[10px] shrink-0" style={{ color: "var(--text-muted)" }}>
                        {c.time ? new Date(c.time).toLocaleDateString("en-IN") : ""}
                      </span>
                    </div>
                    <p className="text-xs truncate mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {c.preview || "No messages yet"}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex flex-col">
          {active ? (
            <>
              {/* Chat Header */}
              <div
                className="flex items-center gap-3 px-5 py-3"
                style={{ borderBottom: "1px solid var(--glass-border)" }}
              >
                <span
                  className="grid h-9 w-9 place-items-center rounded-full text-xs font-bold text-white shrink-0"
                  style={{ background: "linear-gradient(135deg, #3B82F6, #6366F1)" }}
                >
                  {active.initials || "?"}
                </span>
                <div>
                  <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                    {active.name}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {active.stateName ? `${active.stateName} · ` : ""}
                    {active.email || "Admin"}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div
                className="flex-1 overflow-y-auto p-5 space-y-3"
                style={{ minHeight: "300px", maxHeight: "380px" }}
              >
                {thread.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      No messages yet — send the first one!
                    </p>
                  </div>
                ) : (
                  thread.map((m, i) => (
                    <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
                      <div
                        className="max-w-[75%] rounded-2xl px-4 py-2.5 text-sm"
                        style={{
                          background:
                            m.from === "me"
                              ? "linear-gradient(135deg, #3B82F6, #6366F1)"
                              : "var(--glass-hover)",
                          color: m.from === "me" ? "#fff" : "var(--text-primary)",
                        }}
                      >
                        <p className="whitespace-pre-wrap">{m.text}</p>
                        <p
                          className="mt-1 text-[9px]"
                          style={{ color: m.from === "me" ? "rgba(255,255,255,0.65)" : "var(--text-muted)" }}
                        >
                          {m.time}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Message Input */}
              <form
                onSubmit={handleSend}
                className="p-4"
                style={{ borderTop: "1px solid var(--glass-border)" }}
              >
                <div
                  className="flex items-center gap-2 rounded-xl px-3 py-2"
                  style={{
                    background: "var(--glass-hover)",
                    border: "1px solid var(--glass-border)",
                  }}
                >
                  <input
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    placeholder="Type your message…"
                    className="flex-1 bg-transparent text-sm focus:outline-none"
                    style={{ color: "var(--text-primary)" }}
                  />
                  <button
                    type="submit"
                    className="grid h-8 w-8 place-items-center rounded-lg text-white border-0 cursor-pointer"
                    style={{ background: "linear-gradient(135deg, #3B82F6, #6366F1)" }}
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <MessageSquare className="w-12 h-12 mb-3" style={{ color: "var(--text-muted)" }} />
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                No Conversation Selected
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                Choose a conversation or start a new chat
              </p>
              <button
                onClick={openModal}
                className="mt-4 rounded-xl px-4 py-2 text-sm font-semibold text-white border-0 cursor-pointer"
                style={{ background: "linear-gradient(135deg, #3B82F6, #6366F1)" }}
              >
                Start New Chat
              </button>
            </div>
          )}
        </div>
      </div>

      {/* New Chat Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div
            className="w-full max-w-md rounded-2xl p-6 shadow-xl relative"
            style={{
              background: "var(--glass-card)",
              border: "1px solid var(--glass-border)",
              backdropFilter: "blur(20px)",
            }}
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 rounded-lg p-1 border-0 bg-transparent cursor-pointer"
              style={{ color: "var(--text-muted)" }}
            >
              <X className="h-4 w-4" />
            </button>
            <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              Start New Conversation
            </h3>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              Select a user from the database to start messaging
            </p>

            <div className="mt-4 space-y-1 max-h-64 overflow-y-auto">
              {loadingUsers ? (
                <div className="py-8 text-center text-xs" style={{ color: "var(--text-muted)" }}>
                  Loading users...
                </div>
              ) : usersList.length === 0 ? (
                <div className="py-8 text-center text-xs" style={{ color: "var(--text-muted)" }}>
                  No users available to chat with.
                </div>
              ) : (
                usersList.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleStartChat(u.id)}
                    className="w-full flex items-center gap-3 rounded-xl p-3 text-left border-0 bg-transparent cursor-pointer transition-all"
                    style={{ background: "transparent" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--glass-hover)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <span
                      className="grid h-9 w-9 place-items-center rounded-full text-xs font-bold text-white shrink-0"
                      style={{ background: "linear-gradient(135deg, #3B82F6, #6366F1)" }}
                    >
                      {u.initials || "?"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                        {u.name}
                      </p>
                      <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                        {u.state || "Admin"} · {u.email}
                      </p>
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
