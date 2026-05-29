/* Cinematic layered particle background — shared across homepage & KB pages */
(function(){
  const canvas=document.getElementById('particle-canvas');
  if(!canvas)return;

  const ctx=canvas.getContext('2d');
  const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let W,H,animId,startTime=0;
  let particles=[];
  let midOrbs=[];

  const DRIFT=-0.32;
  const CONNECT_DIST=128;
  const CONNECT_ALPHA=0.1;

  const LAYERS=[
    {count:14,speed:0.09,rMin:0.28,rMax:0.62,alpha:0.2,connect:false,glow:false},
    {count:20,speed:0.13,rMin:0.42,rMax:0.95,alpha:0.26,connect:'sparse',glow:false},
    {count:26,speed:0.18,rMin:0.65,rMax:1.45,alpha:0.34,connect:true,glow:true}
  ];

  function resize(){
    W=canvas.width=window.innerWidth;
    H=canvas.height=window.innerHeight;
    initMidOrbs();
    initParticles();
  }

  function initMidOrbs(){
    midOrbs=Array.from({length:4},(_,i)=>({
      x:W*(0.18+i*0.22),
      y:H*(0.22+(i%2)*0.38),
      r:Math.min(W,H)*(0.32+i*0.11),
      rgb:i%2===0?'0,180,255':'0,229,200',
      phase:i*1.65,
      speed:0.000045+i*0.000012,
      ampX:0.018+i*0.006,
      ampY:0.012+i*0.004
    }));
  }

  function initParticles(){
    particles=[];
    LAYERS.forEach((layer,li)=>{
      for(let i=0;i<layer.count;i++){
        const angle=DRIFT+(li*0.07)+((i/layer.count)-0.5)*0.12;
        const spd=layer.speed*(0.88+(i%4)*0.03);
        particles.push({
          x:Math.random()*W,
          y:Math.random()*H,
          vx:Math.cos(angle)*spd,
          vy:Math.sin(angle)*spd,
          r:layer.rMin+Math.random()*(layer.rMax-layer.rMin),
          alpha:layer.alpha,
          layer:li,
          connect:layer.connect,
          glow:layer.glow,
          color:i%3===0?'#00e5c8':'#00b4ff'
        });
      }
    });
  }

  function wrap(p){
    if(p.x<-24)p.x=W+24;
    else if(p.x>W+24)p.x=-24;
    if(p.y<-24)p.y=H+24;
    else if(p.y>H+24)p.y=-24;
  }

  function drawVignette(){
    const v=ctx.createRadialGradient(W*0.5,H*0.42,H*0.12,W*0.5,H*0.42,H*Math.max(W,H)*0.72);
    v.addColorStop(0,'rgba(0,0,0,0)');
    v.addColorStop(1,'rgba(0,0,0,0.1)');
    ctx.fillStyle=v;
    ctx.fillRect(0,0,W,H);
  }

  function drawMidOrbs(t){
    midOrbs.forEach(orb=>{
      const ox=orb.x+Math.sin(t*orb.speed+orb.phase)*W*orb.ampX;
      const oy=orb.y+Math.cos(t*orb.speed*0.82+orb.phase)*H*orb.ampY;
      const grad=ctx.createRadialGradient(ox,oy,0,ox,oy,orb.r);
      grad.addColorStop(0,`rgba(${orb.rgb},0.055)`);
      grad.addColorStop(0.4,`rgba(${orb.rgb},0.028)`);
      grad.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=grad;
      ctx.fillRect(ox-orb.r,oy-orb.r,orb.r*2,orb.r*2);
    });
  }

  function drawParticle(p){
    if(p.glow){
      const gr=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*3.5);
      const glowColor=p.color==='#00b4ff'?'0,180,255':'0,229,200';
      gr.addColorStop(0,`rgba(${glowColor},0.045)`);
      gr.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=gr;
      ctx.beginPath();
      ctx.arc(p.x,p.y,p.r*3.5,0,Math.PI*2);
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
    ctx.fillStyle=p.color;
    ctx.globalAlpha=p.alpha;
    ctx.fill();
    ctx.globalAlpha=1;
  }

  function drawConnections(list){
    const maxD2=CONNECT_DIST*CONNECT_DIST;
    for(let i=0;i<list.length;i++){
      for(let j=i+1;j<list.length;j++){
        const a=list[i],b=list[j];
        if(a.connect==='sparse'&&b.connect==='sparse'&&(i+j)%3!==0)continue;
        const dx=a.x-b.x,dy=a.y-b.y;
        const d2=dx*dx+dy*dy;
        if(d2<maxD2){
          const d=Math.sqrt(d2);
          const alpha=(1-d/CONNECT_DIST)*CONNECT_ALPHA;
          ctx.beginPath();
          ctx.moveTo(a.x,a.y);
          ctx.lineTo(b.x,b.y);
          ctx.strokeStyle=`rgba(0,180,255,${alpha})`;
          ctx.lineWidth=0.55;
          ctx.stroke();
        }
      }
    }
  }

  function tick(ts){
    if(!startTime)startTime=ts;
    const t=reducedMotion?0:ts-startTime;

    ctx.clearRect(0,0,W,H);
    drawVignette();
    drawMidOrbs(t);

    const byLayer=[[],[],[]];
    particles.forEach(p=>{
      if(!reducedMotion){p.x+=p.vx;p.y+=p.vy;wrap(p);}
      byLayer[p.layer].push(p);
    });

    byLayer[0].forEach(drawParticle);
    byLayer[1].forEach(drawParticle);

    const connectList=particles.filter(p=>p.connect===true||p.connect==='sparse');
    drawConnections(connectList);

    byLayer[2].forEach(drawParticle);

    animId=requestAnimationFrame(tick);
  }

  resize();
  tick(0);
  window.addEventListener('resize',()=>{
    cancelAnimationFrame(animId);
    startTime=0;
    resize();
  });
})();
