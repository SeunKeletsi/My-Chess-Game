// Minimal 3D board+tokens (same as earlier, trimmed)
(function(){
  const BOARD=8; let scene,camera,renderer,controls,boardGroup,pieceGroup,highlightGroup,raycaster,pointer;
  function init(container,onSquareClick){
    scene=new THREE.Scene(); scene.background=new THREE.Color(0x0b1220);
    const a=container.clientWidth/container.clientHeight; camera=new THREE.PerspectiveCamera(45,a,0.1,100); camera.position.set(4,8.5,8.5);
    renderer=new THREE.WebGLRenderer({antialias:true,alpha:true}); renderer.setPixelRatio(Math.min(window.devicePixelRatio,2)); renderer.setSize(container.clientWidth,container.clientHeight); container.appendChild(renderer.domElement);
    scene.add(new THREE.HemisphereLight(0xffffff,0x223355,0.8)); const dl=new THREE.DirectionalLight(0xffffff,0.7); dl.position.set(5,10,2); scene.add(dl);
    controls=new THREE.OrbitControls(camera,renderer.domElement); controls.enablePan=false; controls.maxPolarAngle=Math.PI*0.495; controls.minDistance=5; controls.maxDistance=18;
    boardGroup=new THREE.Group(); scene.add(boardGroup);
    const base=new THREE.Mesh(new THREE.BoxGeometry(BOARD+0.6,0.3,BOARD+0.6), new THREE.MeshStandardMaterial({color:0x0f172a,metalness:.2,roughness:.7})); base.position.set(3.5,-0.15,3.5); boardGroup.add(base);
    const light=new THREE.Color(0xf8fafc), dark=new THREE.Color(0x1e293b), geo=new THREE.BoxGeometry(1,0.1,1);
    function alg(x,y){return String.fromCharCode(97+x)+(y+1)}
    for(let y=0;y<8;y++){for(let x=0;x<8;x++){const m=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:((x+y)%2==0)?light:dark})); m.position.set(x,0,y); m.userData.square=alg(x,y); boardGroup.add(m)}}
    pieceGroup=new THREE.Group(); scene.add(pieceGroup); highlightGroup=new THREE.Group(); scene.add(highlightGroup);
    raycaster=new THREE.Raycaster(); pointer=new THREE.Vector2();
    renderer.domElement.addEventListener('pointerdown',e=>{const r=renderer.domElement.getBoundingClientRect(); pointer.x=((e.clientX-r.left)/r.width)*2-1; pointer.y=-((e.clientY-r.top)/r.height)*2+1; raycaster.setFromCamera(pointer,camera); const hits=raycaster.intersectObjects([...pieceGroup.children,...boardGroup.children],true); if(hits.length){const o=hits[0].object; const sq=o.userData.square || (o.parent&&o.parent.userData&&o.parent.userData.square); if(sq&&onSquareClick) onSquareClick(sq);}});
    window.addEventListener('resize',()=>{const w=container.clientWidth,h=container.clientHeight; camera.aspect=w/h; camera.updateProjectionMatrix(); renderer.setSize(w,h)});
    (function anim(){requestAnimationFrame(anim); controls.update(); renderer.render(scene,camera)})();
  }
  const glyphs={p:'♟',r:'♜',n:'♞',b:'♝',q:'♛',k:'♚',P:'♙',R:'♖',N:'♘',B:'♗',Q:'♕',K:'♔'}; const mats={};
  function tex(ch,light){const s=256,c=document.createElement('canvas'); c.width=c.height=s; const ctx=c.getContext('2d'); ctx.fillStyle='rgba(0,0,0,0)'; ctx.fillRect(0,0,s,s); ctx.fillStyle=light?'#111827':'#e5e7eb'; ctx.font='bold 200px serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.shadowColor='rgba(0,0,0,.5)'; ctx.shadowBlur=12; ctx.fillText(ch,s/2,s/2+12); const t=new THREE.CanvasTexture(c); t.anisotropy=4; return t}
  function mat(code){ if(mats[code])return mats[code]; const isW=code===code.toUpperCase(); const m=new THREE.MeshBasicMaterial({map:tex(glyphs[code],isW),transparent:true,toneMapped:false}); mats[code]=m; return m; }
  function clear(group){ while(group.children.length) group.remove(group.children[0]); }
  function pos(sq){const f=sq.charCodeAt(0)-97; const r=parseInt(sq[1])-1; return new THREE.Vector3(f,0.06,r)}
  function setFromFEN(fen){ clear(pieceGroup); const rows=fen.split(' ')[0].split('/'); for(let rank=7;rank>=0;rank--){const row=rows[7-rank]; let file=0; for(const ch of row){ if(/\d/.test(ch)){ file+=parseInt(ch,10)} else {const sq=String.fromCharCode(97+file)+(rank+1); const mesh=new THREE.Mesh(new THREE.PlaneGeometry(.85,.85),mat(ch)); mesh.position.copy(pos(sq)); mesh.rotation.x=-Math.PI/2; mesh.userData.square=sq; pieceGroup.add(mesh); file++; } } } }
  function setOrientation(white){ const rot=white?0:Math.PI; boardGroup.rotation.y=rot; pieceGroup.rotation.y=rot; highlightGroup.rotation.y=rot; }
  function highlightSquares(sqs){ clear(highlightGroup); const g=new THREE.CylinderGeometry(.17,.17,.02,24), m=new THREE.MeshBasicMaterial({color:0x22c55e,transparent:true,opacity:.9}); for(const s of sqs){ const h=new THREE.Mesh(g,m); const p=pos(s); h.position.set(p.x, .065, p.z); h.userData.square=s; highlightGroup.add(h);} }
  window.Chess3D={init,setFromFEN,setOrientation,highlightSquares,clearHighlights:()=>clear(highlightGroup)};
})();
