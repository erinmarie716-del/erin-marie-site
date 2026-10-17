try{if("scrollRestoration" in history)history.scrollRestoration="manual";}catch(e){}if(!location.hash){window.scrollTo(0,0);window.addEventListener("load",function(){window.scrollTo(0,0);});window.addEventListener("pageshow",function(){if(!location.hash)window.scrollTo(0,0);});}
;
(function(){var lb=document.getElementById("lb"),im=lb.querySelector(".lbimg");
function open(src,alt){im.src=src;im.alt=alt||"";lb.classList.remove("full");lb.classList.add("on");lb.scrollTop=0;lb.scrollLeft=0;document.body.style.overflow="hidden";}
function close(){lb.classList.remove("on","full");document.body.style.overflow="";}
document.querySelectorAll(".fig img,.duo img,.fig-right img").forEach(function(i){i.tabIndex=0;i.setAttribute("role","button");i.setAttribute("aria-label","Enlarge image: "+(i.alt||""));
i.addEventListener("click",function(){open(i.getAttribute("data-full")||i.src,i.alt);});
i.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();open(i.getAttribute("data-full")||i.src,i.alt);}});});
im.addEventListener("click",function(e){e.stopPropagation();lb.classList.toggle("full");if(lb.classList.contains("full")){lb.scrollLeft=(im.offsetWidth-lb.clientWidth)/2;lb.scrollTop=0;}});
lb.addEventListener("click",function(e){if(e.target===lb||e.target.classList.contains("lbx"))close();});
document.addEventListener("keydown",function(e){if(e.key==="Escape"&&lb.classList.contains("on"))close();});})();

;
(function(){
  document.querySelectorAll('img[data-fallback]').forEach(function(img){
    function fb(){ img.style.display='none'; if(img.nextElementSibling) img.nextElementSibling.style.display='inline'; }
    if(img.complete && !img.naturalWidth) fb(); else img.addEventListener('error',fb);
  });
})();
