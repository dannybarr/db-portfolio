import {useEffect,useId,useRef,useState,type ReactNode} from 'react';
import {Claude,Codex,Grok,Football,Pitch,Goal,PadelCourt,Cafe,Ladder,ClimbObject} from './mascots';
import {ACTORS,LOOK,TRACKS,buildTimeline,measureLayout,type Layout,type Track,type Segment} from './mascotChoreo';
import './mascot.css';

export type HomeMascotProps={suspended?:boolean;logo?:ReactNode;sceneRequest?:{name:string;token:number};onSceneChange?:(name:string,label:string)=>void};
/** Last in-flow child of .mascot-host. Import mascot.css once in your app. */
export function HomeMascot({suspended=false,logo,sceneRequest,onSceneChange}:HomeMascotProps){
  const id=useId().replace(/:/g,'');const root=useRef<HTMLDivElement>(null),stage=useRef<HTMLDivElement>(null),performance=useRef<HTMLDivElement>(null);
  const nodes=useRef<Partial<Record<Track,HTMLElement>>>({});const animations=useRef<Animation[]>([]);
  const [manual,setManual]=useState(false),[reduced,setReduced]=useState(false),[automatic,setAutomatic]=useState(false);
  const settings=useRef({manual,suspended,reduced});settings.current={manual,suspended,reduced};
  const callback=useRef(onSceneChange);callback.current=onSceneChange;
  const controls=useRef<{sync:()=>void;select:(name:string)=>void}|null>(null);
  const register=(t:Track)=>(el:HTMLElement|null)=>{if(el)nodes.current[t]=el;};
  useEffect(()=>{
    const container=root.current!,band=stage.current!,perf=performance.current!,host=container.closest('.mascot-host') as HTMLElement;
    if(!host)return;
    for(const actor of ACTORS){const eyes=nodes.current[actor]?.querySelector<SVGElement>('.mascot-look');if(eyes)nodes.current[LOOK[actor]]=eyes as unknown as HTMLElement;}
    const media=matchMedia('(prefers-reduced-motion: reduce)');let motionReduced=media.matches,intersecting=true,disposed=false;
    let timeline:Segment[]=[],index=0,geometry:Layout,resizeFrame=0,pointerTime=0,startleTime=-Infinity,scrollFrame=0,scrollLast=window.scrollY,scrollAt=performanceNow();
    let startleTimer:ReturnType<typeof setTimeout>|undefined,decayTimer:ReturnType<typeof setTimeout>|undefined;
    const pauses=()=>settings.current.manual||settings.current.suspended||motionReduced||document.hidden||!intersecting;
    function sync(){const paused=pauses();perf.dataset['paused']=String(paused);perf.dataset['reduced']=String(motionReduced);setAutomatic(document.hidden||!intersecting||settings.current.suspended);
      animations.current.forEach(a=>{if(paused)a.pause();else a.play();});
    }
    function play(next:number,time=0){
      if(disposed||!timeline.length)return;
      animations.current.forEach(a=>{a.onfinish=null;a.cancel();});animations.current=[];
      index=motionReduced?0:(next+timeline.length)%timeline.length;const scene=timeline[index]!;
      perf.dataset['activity']='';void perf.offsetWidth;perf.style.setProperty('--vl-dur',`${scene.duration}ms`);perf.dataset['activity']=scene.name;
      for(const t of TRACKS){const node=nodes.current[t];if(!node)continue;const a=node.animate(scene.tracks[t],{duration:scene.duration,fill:'both',easing:'linear'});a.pause();a.currentTime=motionReduced?0:Math.min(time,scene.duration-1);animations.current.push(a);}
      // One shared document timeline start prevents sibling-track clock drift.
      if(!pauses()){const now=document.timeline.currentTime as number;animations.current.forEach(a=>{a.play();a.startTime=now-time;});}
      const lead=animations.current[0];if(lead)lead.onfinish=()=>play(index+1);
      // Scene limb animations seek with the travel tracks after a resize.
      perf.getAnimations({subtree:true}).filter(a=>a instanceof CSSAnimation&&Number(a.effect?.getTiming().duration)===scene.duration).forEach(a=>{a.currentTime=motionReduced?0:time;});
      callback.current?.(scene.name,scene.label);sync();
    }
    const relative=(rect:DOMRect,h:DOMRect)=>({left:rect.left-h.left,top:rect.top-h.top,right:rect.right-h.left,bottom:rect.bottom-h.top});
    function measure(){
      const h=host.getBoundingClientRect(),st=band.getBoundingClientRect();if(h.width===0||st.width===0)return;
      const avoid=Array.from(host.querySelectorAll<HTMLElement>('[data-mascot-avoid]')).filter(n=>n.getClientRects().length).map(n=>relative(n.getBoundingClientRect(),h));
      geometry=measureLayout(h.width,h.height,relative(st,h),avoid,window.innerWidth);
      perf.style.setProperty('--actor-size',`${geometry.size}px`);perf.style.setProperty('--ball-size',`${geometry.ballSize}px`);perf.style.setProperty('--stage-width',`${st.width}px`);perf.style.setProperty('--goal-width',`${Math.min(120,st.width*.2)}px`);
      const previous=timeline[index]?.name,progress=(Number(animations.current[0]?.currentTime)||0)/(timeline[index]?.duration||1),oldIndex=index;
      timeline=buildTimeline(geometry);let next=timeline.findIndex(s=>s.name===previous);
      if(next<0){next=previous==='climb'?timeline.findIndex(s=>s.name==='steal'):Math.min(oldIndex,timeline.length-1);play(next);}else play(next,progress*timeline[next]!.duration);
    }
    function queueMeasure(){cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(measure);}
    const resize=new ResizeObserver(queueMeasure);resize.observe(host);resize.observe(band);host.querySelectorAll('[data-mascot-avoid]').forEach(n=>resize.observe(n));
    const mutation=new MutationObserver(records=>{if(records.some(r=>Array.from(r.addedNodes).concat(Array.from(r.removedNodes)).some(n=>n instanceof Element&&(n.matches('[data-mascot-avoid]')||n.querySelector('[data-mascot-avoid]'))))){
      resize.disconnect();resize.observe(host);resize.observe(band);host.querySelectorAll('[data-mascot-avoid]').forEach(n=>resize.observe(n));queueMeasure();
    }});mutation.observe(host,{childList:true,subtree:true});
    const visibility=new IntersectionObserver(entries=>{intersecting=entries[0]?.isIntersecting??true;sync();});visibility.observe(host);
    const mediaChange=()=>{motionReduced=media.matches;setReduced(motionReduced);play(0);};media.addEventListener('change',mediaChange);setReduced(motionReduced);
    document.addEventListener('visibilitychange',sync);
    function neutral(){for(const a of ACTORS){const node=nodes.current[a];node?.style.setProperty('--gx','0px');node?.style.setProperty('--gy','0px');node?.style.setProperty('--lean','0deg');}}
    function pointer(e:PointerEvent){const now=performanceNow();if(now-pointerTime<90||pauses())return;pointerTime=now;
      // At most three bounds reads per 90ms, before any style writes.
      const readings=ACTORS.map(a=>({a,node:nodes.current[a]!,rect:nodes.current[a]!.getBoundingClientRect()}));
      for(const {a,node,rect} of readings){const dx=e.clientX-(rect.left+rect.width/2),dy=e.clientY-(rect.top+rect.height*.35),d=Math.hypot(dx,dy),fall=Math.max(0,1-d/320),den=Math.max(d,1);
        node.style.setProperty('--gx',`${dx/den*fall*2}px`);node.style.setProperty('--gy',`${dy/den*fall*1.6}px`);node.style.setProperty('--lean',`${dx/den*fall*2}deg`);
        if(a==='grok'&&d<110&&now-startleTime>5500){startleTime=now;node.dataset['startled']='true';clearTimeout(startleTimer);startleTimer=setTimeout(()=>{delete node.dataset['startled'];},620);}
      }
    }
    function scroll(){if(scrollFrame||pauses())return;scrollFrame=requestAnimationFrame(()=>{scrollFrame=0;const now=performanceNow(),y=window.scrollY,v=(y-scrollLast)/Math.max(16,now-scrollAt);scrollLast=y;scrollAt=now;
      perf.style.setProperty('--scroll-lean',`${Math.max(-1.5,Math.min(1.5,v*1.8))}deg`);perf.style.setProperty('--scroll-bob',`${-Math.min(1.5,Math.abs(v))}px`);clearTimeout(decayTimer);decayTimer=setTimeout(()=>{perf.style.setProperty('--scroll-lean','0deg');perf.style.setProperty('--scroll-bob','0px');},140);
    });}
    host.addEventListener('pointermove',pointer,{passive:true});host.addEventListener('pointerleave',neutral,{passive:true});window.addEventListener('scroll',scroll,{passive:true});
    controls.current={sync,select(name){const i=timeline.findIndex(s=>s.name===name);if(i>=0)play(i);}};measure();
    return()=>{disposed=true;controls.current=null;animations.current.forEach(a=>{a.onfinish=null;a.cancel();});animations.current=[];resize.disconnect();mutation.disconnect();visibility.disconnect();media.removeEventListener('change',mediaChange);document.removeEventListener('visibilitychange',sync);host.removeEventListener('pointermove',pointer);host.removeEventListener('pointerleave',neutral);window.removeEventListener('scroll',scroll);cancelAnimationFrame(resizeFrame);cancelAnimationFrame(scrollFrame);clearTimeout(startleTimer);clearTimeout(decayTimer);};
  },[]);
  useEffect(()=>{controls.current?.sync();},[manual,suspended]);
  useEffect(()=>{if(sceneRequest)controls.current?.select(sceneRequest.name);},[sceneRequest]);
  const paused=manual||suspended||automatic;
  return <div ref={root} className="home-mascot">
    <div ref={stage} className="mascot-stage"><div className="mascot-ground"/></div>
    <div ref={performance} className="mascot-performance mascot-overlay" aria-hidden="true">
      <div className="mascot-track mascot-pitch" ref={register('pitch')}><Pitch/></div>
      <div className="mascot-track mascot-goal" ref={register('goal')}><Goal/></div>
      <div className="mascot-track mascot-padel" ref={register('padel')}><PadelCourt/></div>
      <div className="mascot-track mascot-object" ref={register('object')}><ClimbObject/></div>
      <div className="mascot-track mascot-ladder" ref={register('ladder')}><Ladder/></div>
      {ACTORS.map(a=><div key={a} data-character={a} className="mascot-performer" ref={register(a)}><div className="mascot-react"><div className="mascot-roll" ref={a==='grok'?register('roll'):undefined}>{a==='grok'?<Grok id={`${id}-grok`}/>:a==='codex'?<Codex id={`${id}-codex`}/>:<Claude id={`${id}-claude`}/>}</div></div></div>)}
      <div className="mascot-track mascot-cafe" ref={register('cafe')}><Cafe/></div>
      <div className="mascot-track" ref={register('ballX')}><div ref={register('ballY')}><div className="mascot-ball" ref={register('ballSpin')}><Football id={`${id}-football`}/></div></div></div>
      <div className="mascot-track mascot-placard" ref={register('placard')}>{logo??<svg viewBox="0 0 24 24"><path d="m12 2 3 6 7 1-5 5 1 8-6-4-6 4 1-8-5-5 7-1Z" fill="currentColor"/></svg>}</div>
    </div>
    <div className="mascot-controls">{!reduced&&<button type="button" onClick={()=>setManual(v=>!v)} aria-pressed={manual}>{manual?'Resume animation':'Pause animation'}</button>}<span className="mascot-status" role="status" aria-live="polite">{reduced?'Motion reduced':paused?'Mascots paused':'Mascots at play'}</span></div>
  </div>;
}
function performanceNow(){return window.performance.now();}
