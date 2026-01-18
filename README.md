# 3D Chess – P2P (WebRTC, GitHub Pages)

No Firebase. Two players type the **same numeric code**: one clicks **Host**, the other clicks **Join**. The app uses **WebRTC data channels** (via **PeerJS** Cloud signaling) to sync game state peer‑to‑peer in real time.

## How it works
- **GitHub Pages** serves static files (no server required).
- **PeerJS** uses a free cloud **signaling** server only to help peers discover each other. Once connected, chess moves sync via **WebRTC P2P**.
- The **Host** uses a deterministic ID `chess-<code>`. The **Guest** connects to that ID.

## Run locally
```bash
python -m http.server 5173
# open http://localhost:5173
```
Type a code like **1234**. On another browser/device, type **1234** and click **Join**.

## Deploy on GitHub Pages
- Push these files to a GitHub repo
- Settings → Pages → Source: `main` branch, root
- Open your Pages URL and play

## Notes
- Some networks require STUN/TURN for NAT traversal. PeerJS Cloud provides STUN; if you cannot connect on certain networks, you may need a TURN server (not included here).
- This is for friendly play; all move validation is client‑side using `chess.js`.

## Files
- `index.html` – UI + CDN libs
- `styles.css` – basic styling
- `threejs-chess.js` – 3D board & tokens
- `p2p.js` – WebRTC/PeerJS connect & messaging
- `app.js` – chess logic + UI + P2P wiring
