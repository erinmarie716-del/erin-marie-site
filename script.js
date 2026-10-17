(function(){
  // Scroll reveal: fades sections in as they enter the viewport. Falls back to visible if unsupported.
  var els=document.querySelectorAll('.rv');
  if(!('IntersectionObserver' in window)){for(var i=0;i<els.length;i++)els[i].classList.add('in');return;}
  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});
  },{rootMargin:'0px 0px -8% 0px',threshold:.08});
  for(var j=0;j<els.length;j++)io.observe(els[j]);
})();
;
(function(){
  var cs=document.getElementById('cs'), stage=document.getElementById('cs-stage'), steps=document.getElementById('cs-steps');
  var nameEl=document.getElementById('cs-name'), kindEl=document.getElementById('cs-kind'), nEl=document.getElementById('cs-n'), prog=document.getElementById('cs-prog');
  var prevB=document.getElementById('cs-prev'), nextB=document.getElementById('cs-next');
  var slides=[], i=0, cur=null, opener=null, nextDeck=null;

  function open(id, fromHash){
    var t=document.getElementById('deck-'+id); if(!t) return false;
    cur=id; nextDeck=t.getAttribute('data-next');
    nameEl.textContent=t.getAttribute('data-name'); kindEl.innerHTML=t.getAttribute('data-kind');
    stage.innerHTML=''; steps.innerHTML='';
    stage.appendChild(t.content.cloneNode(true));
    slides=[].slice.call(stage.querySelectorAll('.slide'));
    slides.forEach(function(sl,idx){
      var b=document.createElement('button'); b.textContent=sl.getAttribute('data-step'); b.addEventListener('click',function(){go(idx);}); steps.appendChild(b);
    });
    var np=stage.querySelector('[data-next]'); if(np) np.addEventListener('click',function(){ if(nextDeck&&document.getElementById('deck-'+nextDeck)){open(nextDeck);} else {close();} });
    cs.classList.add('on'); document.body.classList.add('cs-open');
    go(0,true);
    if(!fromHash && location.hash!=='#'+id) history.pushState({cs:id},'','#'+id);
    cs.querySelector('.x').focus();
    return true;
  }
  function close(){
    cs.classList.remove('on'); document.body.classList.remove('cs-open'); cur=null;
    if(location.hash){ history.pushState(null,'',location.pathname+location.search); }
    if(opener){opener.focus();}
  }
  function go(n,instant){
    if(n<0||n>=slides.length) return;
    slides.forEach(function(sl,idx){ sl.classList.toggle('cur',idx===n); sl.classList.toggle('prev',idx<n); });
    [].forEach.call(steps.children,function(b,idx){ b.classList.toggle('cur',idx===n); if(idx===n&&b.scrollIntoView) b.scrollIntoView({inline:'center',block:'nearest',behavior:instant?'auto':'smooth'}); });
    i=n; nEl.textContent=(n+1)+' / '+slides.length; prog.style.width=((n+1)/slides.length*100)+'%';
    prevB.disabled=(n===0); nextB.disabled=(n===slides.length-1);
  }
  prevB.addEventListener('click',function(){go(i-1);});
  nextB.addEventListener('click',function(){go(i+1);});
  cs.querySelectorAll('[data-close]').forEach(function(el){el.addEventListener('click',close);});
  document.addEventListener('keydown',function(e){
    if(!cs.classList.contains('on')) return;
    if(e.key==='Escape') close();
    else if(e.key==='ArrowRight') go(i+1);
    else if(e.key==='ArrowLeft') go(i-1);
  });
  // swipe
  var sx=null; stage.addEventListener('touchstart',function(e){sx=e.touches[0].clientX;},{passive:true});
  stage.addEventListener('touchend',function(e){ if(sx===null) return; var dx=e.changedTouches[0].clientX-sx; sx=null; if(Math.abs(dx)>50){ go(dx<0?i+1:i-1); } });
  // tiles
  document.querySelectorAll('[data-deck]').forEach(function(a){
    function trigger(e){ if(e.target.closest&&e.target.closest('.site')) return; var id=a.getAttribute('data-deck'); if(document.getElementById('deck-'+id)){ e.preventDefault(); opener=a; open(id); } }
    a.addEventListener('click',trigger);
    a.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' '){ trigger(e); } });
  });
  // deep links + back button
  function fromHash(){ var id=location.hash.replace('#',''); if(id&&document.getElementById('deck-'+id)){ open(id,true); } else if(cs.classList.contains('on')){ cs.classList.remove('on'); document.body.classList.remove('cs-open'); cur=null; } }
  window.addEventListener('popstate',fromHash);
  if(location.hash) fromHash();
})();
;
(function(){
  // Substack feed: reads posts.json (written by the GitHub Action in .github/workflows/substack.yml). Falls back to the cards already in the HTML.
  var grid=document.getElementById('posts'); if(!grid||grid.hasAttribute('data-static')||true) return; // featured posts are hand-picked; feed disabled
  fetch('posts.json',{cache:'no-store'}).then(function(r){ if(!r.ok) throw 0; return r.json(); }).then(function(posts){
    if(!posts||!posts.length) return;
    grid.innerHTML='';
    posts.slice(0,3).forEach(function(p){
      var d=p.date?new Date(p.date):null; var ds=d&&!isNaN(d)?d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}):'';
      var a=document.createElement('a'); a.className='post'; a.href=p.url; a.target='_blank'; a.rel='noopener';
      a.innerHTML='<div class="cov">'+(p.image?'<img src="'+p.image+'" alt="">':'')+'</div><div class="pb"><span class="date">'+ds+'</span><h3></h3><p></p></div>';
      a.querySelector('h3').textContent=p.title||''; a.querySelector('p').textContent=p.subtitle||'';
      grid.appendChild(a);
    });
  }).catch(function(){});
})();
;
(function(){
  // Infinite rail: the seven tiles are cloned on both sides, and when you scroll into a clone set the position jumps back by one set, so there is never an empty edge.
  var rail=document.getElementById('work-rail'); if(!rail) return;
  var prev=document.querySelector('[data-rail-prev]'), next=document.querySelector('[data-rail-next]');
  var originals=[].slice.call(rail.children);
  function cloneSet(where){
    originals.forEach(function(o){
      var c=o.cloneNode(true); c.classList.add('in'); c.setAttribute('data-clone','1'); c.removeAttribute('id');
      c.addEventListener('click',function(e){ if(e.target.closest&&e.target.closest('.site')) return; if(o.hasAttribute('data-deck')){ e.preventDefault(); o.click(); } else if(o.tagName==='A'&&o.getAttribute('href')&&o.getAttribute('href')!=='#work'){ } });
      where==='before'?rail.insertBefore(c,rail.firstChild):rail.appendChild(c);
    });
  }
  // clones before must be inserted in reverse to keep order
  originals.slice().reverse().forEach(function(o){ var c=o.cloneNode(true); c.classList.add('in'); c.setAttribute('data-clone','1'); c.addEventListener('click',function(e){ if(e.target.closest&&e.target.closest('.site')) return; if(o.hasAttribute('data-deck')){ e.preventDefault(); o.click(); } }); rail.insertBefore(c,rail.firstChild); });
  cloneSet('after');
  var setW=0;
  function measure(){ var first=originals[0], last=originals[originals.length-1]; setW=last.offsetLeft+last.offsetWidth+18-first.offsetLeft; }
  function init(){ measure(); rail.style.scrollBehavior='auto'; rail.scrollLeft=originals[0].offsetLeft-parseFloat(getComputedStyle(rail).paddingLeft); rail.style.scrollBehavior=''; }
  var raf=null;
  rail.addEventListener('scroll',function(){
    if(raf) return; raf=requestAnimationFrame(function(){ raf=null;
      var pad=parseFloat(getComputedStyle(rail).paddingLeft); var start=originals[0].offsetLeft-pad;
      if(rail.scrollLeft<start-setW*0.6){ rail.style.scrollBehavior='auto'; rail.scrollLeft+=setW; rail.style.scrollBehavior=''; }
      else if(rail.scrollLeft>start+setW*1.4){ rail.style.scrollBehavior='auto'; rail.scrollLeft-=setW; rail.style.scrollBehavior=''; }
    });
  },{passive:true});
  function step(){ return originals[0].getBoundingClientRect().width+18; }
  prev.addEventListener('click',function(){ rail.scrollBy({left:-step()*2,behavior:'smooth'}); });
  next.addEventListener('click',function(){ rail.scrollBy({left:step()*2,behavior:'smooth'}); });
  window.addEventListener('resize',function(){ measure(); });
  // mouse drag
  var down=false,sx=0,sl=0,moved=false;
  rail.addEventListener('mousedown',function(e){ down=true;moved=false;sx=e.pageX;sl=rail.scrollLeft; });
  window.addEventListener('mousemove',function(e){ if(!down)return; var dx=e.pageX-sx; if(Math.abs(dx)>6){moved=true;rail.classList.add('dragging');} rail.scrollLeft=sl-dx; });
  window.addEventListener('mouseup',function(){ if(!down)return; down=false; setTimeout(function(){rail.classList.remove('dragging');},50); });
  rail.addEventListener('click',function(e){ if(moved){ e.stopPropagation(); e.preventDefault(); moved=false; } },true);
  if(document.fonts&&document.fonts.ready){ document.fonts.ready.then(init); } else { init(); }
  window.addEventListener('load',init);
})();
;
(function(){
  var intro=document.getElementById('intro'); if(!intro) return;
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var seen=false; try{ seen=sessionStorage.getItem('em-intro')==='1'; }catch(e){}
  function drop(){ intro.remove(); document.body.classList.remove('intro-on'); }
  if(reduce||seen||location.hash){ drop(); return; }
  function finish(){
    if(intro.classList.contains('out')) return;
    intro.classList.add('out');
    try{ sessionStorage.setItem('em-intro','1'); }catch(e){}
    setTimeout(drop,900);
  }
  var img=new Image(); var started=false;
  function go(){ if(started) return; started=true; setTimeout(finish,1100); }
  img.onload=go; img.onerror=finish; img.src='assets/site/intro-splash.jpg';
  setTimeout(go,2500);
})();
;
(function(){
  if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var box=document.createElement('div'); box.id='stars'; box.setAttribute('aria-hidden','true'); document.body.appendChild(box);
  var NS='http://www.w3.org/2000/svg', COLORS=['#D6336C','#154C63','#D6336C','#154C63','#D6336C'];
  function rnd(a,b){ return a+Math.random()*(b-a); }
  function star(size,color){
    var d=document.createElement('span'); d.className='st'; d.style.width=d.style.height=size+'px';
    d.innerHTML='<svg viewBox="0 0 24 24"><path fill="'+color+'" d="M12 1.5c.6 4.9 2.6 8.5 10.5 10.5C14.6 14 12.6 17.6 12 22.5 11.4 17.6 9.4 14 1.5 12 9.4 10 11.4 6.4 12 1.5z"/></svg>';
    return d;
  }
  function size(){ box.style.height=Math.max(document.documentElement.scrollHeight,document.body.scrollHeight)+'px'; }
  function floaters(){
    box.querySelectorAll('.fl').forEach(function(n){ n.remove(); });
    var h=parseFloat(box.style.height)||innerHeight, w=innerWidth, n=Math.max(8,Math.round(h/260));
    for(var i=0;i<n;i++){
      var s=star(rnd(7,13),COLORS[i%COLORS.length]); s.className+=' fl';
      s.style.left=rnd(1,97)+'%'; s.style.top=((i+rnd(.1,.9))/n*h)+'px';
      var st=s.style;
      st.setProperty('--dur',rnd(11,22).toFixed(1)+'s'); st.setProperty('--del','-'+rnd(0,12).toFixed(1)+'s');
      st.setProperty('--dx',rnd(-70,70).toFixed(0)+'px'); st.setProperty('--dy',rnd(-60,60).toFixed(0)+'px'); st.setProperty('--rot',rnd(-40,40).toFixed(0)+'deg');
      var o=rnd(.18,.4); st.setProperty('--o1',(o*.4).toFixed(2)); st.setProperty('--o2',o.toFixed(2));
      box.appendChild(s);
    }
  }
  function build(){ size(); floaters(); }
  window.addEventListener('load',function(){ build(); setTimeout(build,1500); });
  var rt; window.addEventListener('resize',function(){ clearTimeout(rt); rt=setTimeout(build,300); });

  // click a pink word (not a link) and stars burst out of it
  document.addEventListener('click',function(e){
    var t=e.target.closest&&e.target.closest('.head-main em,.wmini .tag,.info-card .ic-label'); if(!t) return;
    var r=t.getBoundingClientRect(), sx=window.scrollX, sy=window.scrollY, n=5+Math.floor(Math.random()*3);
    var cx=(e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom)?e.clientX:r.left+r.width/2, cy=(e.clientY>=r.top&&e.clientY<=r.bottom)?e.clientY:r.top+r.height/2;
    for(var i=0;i<n;i++){
      var sz=rnd(8,15), s=star(sz,COLORS[Math.floor(rnd(0,COLORS.length))]); s.className+=' pop';
      s.style.left=(cx+sx-sz/2)+'px'; s.style.top=(cy+sy-sz/2)+'px';
      var ang=rnd(0,Math.PI*2), dist=rnd(34,78);
      s.style.setProperty('--dx',(Math.cos(ang)*dist).toFixed(0)+'px'); s.style.setProperty('--dy',(Math.sin(ang)*dist-8).toFixed(0)+'px');
      box.appendChild(s); (function(el){ setTimeout(function(){ el.remove(); },1400); })(s);
    }
  });

  // random pop-outs when hovering rounded containers
  var last=0;
  document.addEventListener('mouseover',function(e){
    var t=e.target.closest&&e.target.closest('.wmini,.post,.post .cov,.panel2,.contact-sec .form,.head-media,.lcard,.lcard2,.wcard,.btn,.cs .nav button,.cs .x,.head-main .post-title,.head-main .lead-p,.info-card');
    if(!t||t.contains(e.relatedTarget)) return;
    var now=Date.now(); if(now-last<500||Math.random()>.85) return; last=now;
    var r=t.getBoundingClientRect(), sx=window.scrollX, sy=window.scrollY, n=2+Math.floor(Math.random()*3);
    for(var i=0;i<n;i++){
      var edge=Math.floor(rnd(0,4)), x, y;
      if(edge===0){ x=rnd(r.left,r.right); y=r.top; } else if(edge===1){ x=r.right; y=rnd(r.top,r.bottom); }
      else if(edge===2){ x=rnd(r.left,r.right); y=r.bottom; } else { x=r.left; y=rnd(r.top,r.bottom); }
      var sz=rnd(8,15), s=star(sz,COLORS[Math.floor(rnd(0,COLORS.length))]); s.className+=' pop';
      s.style.left=(x+sx-sz/2)+'px'; s.style.top=(y+sy-sz/2)+'px';
      var ang=Math.atan2(y-(r.top+r.height/2),x-(r.left+r.width/2)), dist=rnd(26,60);
      s.style.setProperty('--dx',(Math.cos(ang)*dist).toFixed(0)+'px'); s.style.setProperty('--dy',(Math.sin(ang)*dist-10).toFixed(0)+'px');
      box.appendChild(s); (function(el){ setTimeout(function(){ el.remove(); },1400); })(s);
    }
  });
})();
;
window.rfScroll=function(b){var pad=b.closest('.pad'),strip=pad.querySelector('.rfstrip'),lab=b.querySelector('span'),n=strip.children.length,st=b._st||(b._st={i:0,t:null});function show(i){strip.style.transform='translateY(-'+(i*100)+'%)';}function stop(txt){clearInterval(st.t);st.t=null;lab.textContent=txt;}if(st.t){stop('Click to scroll');return;}if(st.i>=n-1){st.i=0;show(0);}lab.textContent='Pause';st.t=setInterval(function(){st.i++;show(st.i);if(st.i>=n-1){stop('Replay');}},2400);};
;
try{var wb=document.querySelector(".work-bg");if(wb){wb.playbackRate=.8;wb.addEventListener("loadedmetadata",function(){wb.playbackRate=.8;});var go=function(){wb.playbackRate=.8;var q=wb.play();if(q&&q.catch)q.catch(function(){});};if("IntersectionObserver" in window){var io=new IntersectionObserver(function(en){if(en[0].isIntersecting){io.disconnect();go();}},{threshold:.08});io.observe(document.getElementById("work"));}else{go();}}}catch(e){}
;
(function(){var f=document.getElementById('cform');if(!f)return;var st=f.querySelector('.cf-status'),b=f.querySelector('button');
f.addEventListener('submit',function(e){e.preventDefault();b.disabled=true;st.textContent='Sending…';
fetch(f.action,{method:'POST',body:new FormData(f),headers:{Accept:'application/json'}}).then(function(r){
if(r.ok){f.reset();st.textContent='Thank you! I\u2019ll be in touch soon.';b.disabled=false;}else{throw 0;}
}).catch(function(){f.submit();});});})();
;
(function(){function upd(t){var im=t.children,L=t.getBoundingClientRect(),ds=t.parentNode.querySelectorAll('.ls-dots button');for(var k=0;k<im.length;k++){var r=im[k].getBoundingClientRect(),vis=r.left>=L.left-4&&r.right<=L.right+4;if(ds[k])ds[k].classList.toggle('on',vis);}}
document.addEventListener('scroll',function(e){if(e.target.classList&&e.target.classList.contains('ls-track'))upd(e.target);},true);
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('.ls-dots button');if(b){var c=b.parentNode.parentNode,t=c.querySelector('.ls-track'),n=[].indexOf.call(b.parentNode.children,b);t.scrollTo({left:t.children[n].offsetLeft-t.children[0].offsetLeft,behavior:'smooth'});return;}setTimeout(function(){document.querySelectorAll('.ls-track').forEach(upd);},120);});
window.addEventListener('resize',function(){document.querySelectorAll('.ls-track').forEach(upd);});})();

;
/* Click, video and image-fallback handlers (formerly inline attributes) */
(function(){
  document.addEventListener('click',function(e){
    var t=e.target.closest&&e.target.closest('[data-vtoggle],[data-vbtn],[data-rfscroll]');
    if(!t) return;
    if(t.hasAttribute('data-rfscroll')){ rfScroll(t); return; }
    var v=t.hasAttribute('data-vtoggle')?t.querySelector('video'):(t.closest('.pad')&&t.closest('.pad').querySelector('video'));
    if(!v) return;
    if(v.paused){ v.play(); } else { v.pause(); }
  });
  ['play','pause','ended'].forEach(function(type){
    document.addEventListener(type,function(e){
      var v=e.target; if(!v||v.tagName!=='VIDEO') return;
      var pad=v.closest('.pad'); var s=pad&&pad.querySelector('.vcap span'); if(!s) return;
      s.textContent=type==='play'?'Pause':(type==='pause'?'Click to scroll':'Replay');
    },true);
  });
  document.querySelectorAll('img[data-fallback]').forEach(function(img){
    function fb(){ img.style.display='none'; if(img.nextElementSibling) img.nextElementSibling.style.display='inline'; }
    if(img.complete && !img.naturalWidth) fb(); else img.addEventListener('error',fb);
  });
})();
