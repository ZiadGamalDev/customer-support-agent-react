# Customer Support Agent Dashboard – React

A real-time support dashboard built with **React.js** where **agents** can view their assigned chats, communicate with customers, and manage chat statuses (pending/resolved) while switching availability.

This project connects to the backend via **Socket.IO** and integrates fully with the customer support system infrastructure.

---

## 🎯 Agent Features

- 🔐 Agent login (JWT-based)
- ✅ View assigned chats
- 🧠 Toggle availability (Available / Away)
- 💬 Real-time chat with customers
- ⏱ Typing indicator and live updates
- 🔁 Change chat status: Pending ↔ Resolved
- 👀 Live notifications when new chat is assigned

---

## 💡 Real-Time Flow

When a new chat is created, it’s **auto-assigned** to the next available agent (max load respected). If the agent goes away, all their chats are marked pending and **reassigned automatically** to others.

Each agent can:
- Respond to customer chats
- Close/resume conversations
- See live updates without refresh

---

## 🚀 Getting Started

1. Clone the repo:
   ```bash
   git clone https://github.com/ZiadGamalDev/customer-support-agent-react.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file with:
   ```env
   VITE_API_URL=http://localhost:5000
   VITE_SOCKET_URL=http://localhost:5000
   ```

4. Start the app:
   ```bash
   npm run dev
   ```

---

## 🌍 Live Use Case

This is one part of a full-blown customer support system.
To test it fully, connect it to the backend:
👉 [Customer Support Backend Repo](https://github.com/ZiadGamalDev/customer-support-node)

Or you can
👉 [View Root Repository](https://github.com/ZiadGamalDev/customer-support-system)

---

## 📄 License

MIT – Use it, fork it, build on top of it. Enjoy 🔥
