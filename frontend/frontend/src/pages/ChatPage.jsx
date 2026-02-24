import { useEffect, useMemo, useState } from "react";
import { api, withAuth } from "../utils/api";
import { getStoredUser } from "../utils/auth";
import "./ChatPage.css";

const ChatPage = () => {
  const user = getStoredUser();
  const [chats, setChats] = useState([]);
  const [artists, setArtists] = useState([]);
  const [activeChatId, setActiveChatId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [startForm, setStartForm] = useState({
    artistId: "",
    subject: "",
    orderId: "",
    message: "",
  });

  const activeChat = useMemo(
    () => chats.find((chat) => chat._id === activeChatId) || null,
    [chats, activeChatId]
  );

  const fetchChats = async () => {
    try {
      const res = await api.get("/api/chats/my", withAuth());
      const data = res.data?.data || [];
      setChats(data);
      if (!activeChatId && data[0]) {
        setActiveChatId(data[0]._id);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load chats");
    }
  };

  const fetchArtists = async () => {
    if (user?.role !== "customer") return;
    try {
      const res = await api.get("/api/users/artists");
      setArtists(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load artists");
    }
  };

  useEffect(() => {
    fetchChats();
    fetchArtists();
  }, []);

  const handleSendMessage = async () => {
    if (!activeChat || !message.trim()) return;
    setError("");
    try {
      const res = await api.post(
        `/api/chats/${activeChat._id}/messages`,
        { text: message.trim() },
        withAuth()
      );
      const updated = res.data?.data;
      setChats((prev) => prev.map((chat) => (chat._id === updated._id ? updated : chat)));
      setMessage("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send message");
    }
  };

  const handleStartChat = async (e) => {
    e.preventDefault();
    setError("");

    if (!startForm.artistId.trim() || !startForm.message.trim()) {
      setError("Please select artist and enter message");
      return;
    }

    try {
      const payload = {
        artistId: startForm.artistId.trim(),
        subject: startForm.subject.trim(),
        message: startForm.message.trim(),
      };

      if (startForm.orderId.trim()) {
        payload.orderId = startForm.orderId.trim();
      }

      const res = await api.post("/api/chats/start", payload, withAuth());
      const created = res.data?.data;
      setChats((prev) => [created, ...prev.filter((chat) => chat._id !== created._id)]);
      setActiveChatId(created._id);
      setStartForm({ artistId: "", subject: "", orderId: "", message: "" });
    } catch (err) {
      const validationMessage = err.response?.data?.errors?.[0]?.msg;
      setError(validationMessage || err.response?.data?.message || "Failed to start chat");
    }
  };

  const getOtherParticipantName = (chat) => {
    if (user?.role === "artist") return chat.customer?.name || "Customer";
    return chat.artist?.name || "Artist";
  };

  return (
    <section className="chat-page">
      <h1>{user?.role === "artist" ? "Customer Chats" : "Chats with Artists"}</h1>
      {error ? <p className="chat-error">{error}</p> : null}

      {user?.role === "customer" ? (
        <form className="start-chat-form" onSubmit={handleStartChat}>
          <h2>Start New Chat (Customization Request)</h2>
          <select
            value={startForm.artistId}
            onChange={(e) => setStartForm({ ...startForm, artistId: e.target.value })}
            required
          >
            <option value="">Select artist</option>
            {artists.map((artist) => (
              <option key={artist._id} value={artist._id}>
                {artist.name} ({artist.email})
              </option>
            ))}
          </select>
          <input
            placeholder="Order ID (optional)"
            value={startForm.orderId}
            onChange={(e) => setStartForm({ ...startForm, orderId: e.target.value })}
          />
          <input
            placeholder="Subject (optional)"
            value={startForm.subject}
            onChange={(e) => setStartForm({ ...startForm, subject: e.target.value })}
          />
          <textarea
            placeholder="Tell artist your customization requirement..."
            value={startForm.message}
            onChange={(e) => setStartForm({ ...startForm, message: e.target.value })}
            required
          />
          <button type="submit">Start Chat</button>
        </form>
      ) : null}

      <div className="chat-shell">
        <aside className="chat-list">
          {chats.length === 0 ? <p>No conversations yet.</p> : null}
          {chats.map((chat) => (
            <button
              key={chat._id}
              className={activeChatId === chat._id ? "active" : ""}
              onClick={() => setActiveChatId(chat._id)}
            >
              <strong>{getOtherParticipantName(chat)}</strong>
              <span>{chat.subject}</span>
            </button>
          ))}
        </aside>

        <section className="chat-thread">
          {!activeChat ? (
            <p>Select a conversation to view messages.</p>
          ) : (
            <>
              <h3>{activeChat.subject}</h3>
              <div className="chat-messages">
                {activeChat.messages?.map((msg) => (
                  <article
                    key={msg._id}
                    className={
                      msg.sender?._id === user?._id ? "chat-bubble mine" : "chat-bubble"
                    }
                  >
                    <p>{msg.text}</p>
                    <small>{msg.sender?.name || "User"}</small>
                  </article>
                ))}
              </div>
              <div className="chat-send">
                <input
                  placeholder="Write message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <button type="button" onClick={handleSendMessage}>Send</button>
              </div>
            </>
          )}
        </section>
      </div>
    </section>
  );
};

export default ChatPage;
