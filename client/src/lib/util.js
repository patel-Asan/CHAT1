export function formatMessageTime(date) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatDate(date) {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
}

export function getReactionCount(reactions) {
  if (!reactions || !reactions.length) return {};
  const counts = {};
  reactions.forEach((r) => {
    counts[r.emoji] = (counts[r.emoji] || 0) + 1;
  });
  return counts;
}

export function isBlocked(userId, blockedUsers) {
  if (!blockedUsers || !userId) return false;
  if (Array.isArray(blockedUsers)) {
    return blockedUsers.some((b) => (b._id || b) === userId);
  }
  return false;
}

export function isMuted(chatId, mutedChats) {
  if (!mutedChats || !chatId) return false;
  return mutedChats.some((m) => String(m.chatId) === String(chatId));
}

export function extractUrls(text) {
  if (!text) return [];
  const regex = /(https?:\/\/[^\s]+)/g;
  return text.match(regex) || [];
}
