// app.js — glue: UI + chess.js + 3D + P2P
const els = {
  lobby: document.getElementById('lobbyPanel'),
  game: document.getElementById('gamePanel'),
  roomCode: document.getElementById('roomCode'),
  btnHost: document.getElementById('btnHost'),
  btnJoin: document.getElementById('btnJoin'),
  info: document.getElementById('lobbyInfo'),
  whiteName: document.getElementById('whiteName'),
  blackName: document.getElementById('blackName'),
  turnLabel: document.getElementById('turnLabel'),
  roomLabel: document.getElementById('roomLabel'),
  btnNew: document.getElementById('btnNewGame'),
  btnFlip: document.getElementById('btnFlip'),
  btnLeave: document.getElementById('btnLeave'),
  status: document.getElementById('gameStatus'),
  canvasWrap: document.getElementById('canvasWrap'),
  connStatus: document.getElementById('connStatus')
};

let chess = new Chess();
let myColor = null; // 'w' host, 'b' guest
let boardWhiteBottom = true;
let selected = null;

function show(panel){ els.lobby.hidden = panel!=='lobby'; els.game.hidden = panel!=='game'; }

function wire3D(){ Chess3D.init(els.canvasWrap, onSquareClick); Chess3D.setOrientation(boardWhiteBottom); Chess3D.setFromFEN(chess.fen()); }

function setHud(){
  els.turnLabel.textContent = chess.turn()==='w' ? 'White' : 'Black';
  els.status.textContent = chess.game_over() ? gameOverText() : '';
}
function gameOverText(){
  if(chess.in_checkmate()) return (chess.turn()==='w' ? 'Black' : 'White') + ' wins by checkmate';
  if(chess.in_stalemate()) return 'Stalemate';
  if(chess.in_draw()) return 'Draw';
  return 'Game finished';
}

function applyFEN(fen){ chess.load(fen); Chess3D.setFromFEN(fen); setHud(); }

function onSquareClick(sq){
  const piece = chess.get(sq);
  if(selected){
    const legal = chess.moves({ square: selected, verbose: true }).some(m=>m.to===sq);
    if(legal && ((myColor==='w'&&chess.turn()==='w')||(myColor==='b'&&chess.turn()==='b'))){
      const mv = chess.move({from:selected,to:sq,promotion:'q'});
      Chess3D.clearHighlights(); selected=null; broadcastState(); applyFEN(chess.fen());
    } else { Chess3D.clearHighlights(); selected=null; }
    return;
  }
  if(piece && ((myColor==='w'&&piece.color==='w')||(myColor==='b'&&piece.color==='b'))){
    selected = sq; const moves = chess.moves({ square: sq, verbose:true }).map(m=>m.to); Chess3D.highlightSquares(moves);
  }
}

function broadcastState(){ P2P.send({type:'state', fen: chess.fen()}); }

function start(role, code){
  show('game'); els.roomLabel.textContent = code; myColor = role==='host'?'w':'b'; boardWhiteBottom = (myColor==='w');
  els.whiteName.textContent = 'White (Host)'; els.blackName.textContent = 'Black (Guest)';
  wire3D(); applyFEN(new Chess().fen());
  P2P.connect(role, code, onP2PMessage, onConnState);
}

function onP2PMessage(msg){
  if(msg && msg.type==='state' && typeof msg.fen==='string'){
    if(msg.fen !== chess.fen()) applyFEN(msg.fen);
  } else if(msg && msg.type==='new'){
    chess = new Chess(); applyFEN(chess.fen());
  }
}

function onConnState(s){ els.connStatus.textContent = s; }

// UI handlers
els.btnHost.onclick = ()=>{
  const code = (els.roomCode.value||'').trim(); if(!/^\d{4,8}$/.test(code)){ els.info.textContent = 'Enter 4–8 digits.'; return; }
  start('host', code);
};
els.btnJoin.onclick = ()=>{
  const code = (els.roomCode.value||'').trim(); if(!/^\d{4,8}$/.test(code)){ els.info.textContent = 'Enter 4–8 digits.'; return; }
  start('guest', code);
};
els.btnNew.onclick = ()=>{ chess = new Chess(); applyFEN(chess.fen()); P2P.send({type:'new'}); };
els.btnFlip.onclick = ()=>{ boardWhiteBottom=!boardWhiteBottom; Chess3D.setOrientation(boardWhiteBottom); };
els.btnLeave.onclick = ()=>{ P2P.disconnect(); location.reload(); };

show('lobby');
