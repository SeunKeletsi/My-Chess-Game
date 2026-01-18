// p2p.js — very small wrapper around PeerJS DataConnections
// Two roles: Host (creates ID 'chess-<code>'), Guest (connects to that ID).
// Exposes P2P.connect(role, code), P2P.send(msg), and an event callback P2P.onMessage.

const P2P = (()=>{
  let peer = null; let conn = null; let onMessage = null; let role=null; let peerId=null;

  function makeId(code){ return 'chess-' + code; }

  function connect(asRole, code, onMsg, onState){
    role = asRole; onMessage = onMsg; peerId = makeId(code);
    // PeerJS cloud PeerServer for signaling only (free). Data flows P2P.
    peer = new Peer(undefined, { debug: 1 });

    peer.on('open', id => {
      onState && onState('peer-open:' + id);
      if(role==='host'){
        // Host waits for a connection to our deterministic ID
        peer.on('connection', c => setupConn(c, onState));
        // Create an alias so guests can find us
        // PeerJS can't set a custom ID after open; recreate peer with id
        peer.destroy();
        peer = new Peer(peerId, { debug: 1 });
        peer.on('open', _ => onState && onState('hosting:'+peerId));
        peer.on('connection', c => setupConn(c, onState));
      } else {
        // Guest connects to host id directly
        const attempt = ()=>{
          conn = peer.connect(peerId, { reliable: true });
          bindConn(conn, onState);
        };
        attempt();
      }
    });

    peer.on('error', err => onState && onState('peer-error:' + err));
  }

  function setupConn(c, onState){ conn = c; bindConn(conn, onState); }

  function bindConn(c, onState){
    c.on('open', ()=>{ onState && onState('conn-open'); });
    c.on('data', data => { onMessage && onMessage(data); });
    c.on('close', ()=>{ onState && onState('conn-close'); });
    c.on('error', e=>{ onState && onState('conn-error:'+e); });
  }

  function send(msg){ if(conn && conn.open) conn.send(msg); }

  function disconnect(){ try{ conn && conn.close(); }catch{} try{ peer && peer.destroy(); }catch{} }

  return { connect, send, disconnect };
})();
