/** Pure, deterministic scene geometry. Coordinates are host-relative feet/centres.
 * Keep secondary articulation inside the padded envelope used by bounds(). */
export type Rect = {left:number; top:number; right:number; bottom:number};
export type Actor = 'grok'|'codex'|'claude';
export type Track = Actor|'lookGrok'|'lookCodex'|'lookClaude'|'roll'|'ballX'|'ballY'|'ballSpin'|'placard'|'pitch'|'goal'|'padel'|'cafe'|'ladder'|'object';
export type Pose = {x:number;y:number;r:number;sx:number;sy:number;o:number};
export type Point = Pose & {offset:number; easing:string};
export type Segment = {name:string;label:string;duration:number;tracks:Record<Track,Keyframe[]>;points:Record<Track,Point[]>};
export type Climb = {left:number;right:number;hangLeft:number;hangRight:number;perch:number};
export type Layout = {width:number;height:number;stage:Rect;size:number;ballSize:number;floor:number;lanes:Record<Actor,number>;climb:Climb|null;avoid:Rect[]};
export const ACTORS:Actor[]=['grok','codex','claude'];
export const LOOK:Record<Actor,Track>={grok:'lookGrok',codex:'lookCodex',claude:'lookClaude'};
export const TRACKS:Track[]=[...ACTORS,...Object.values(LOOK),'roll','ballX','ballY','ballSpin','placard','pitch','goal','padel','cafe','ladder','object'];
export const EASE={walk:'cubic-bezier(0.4, 0, 0.2, 1)',up:'cubic-bezier(0.2, 0.65, 0.35, 1)',down:'cubic-bezier(0.65, 0, 0.8, 0.35)',linear:'linear'};
const pose=(x=0,y=0,o=1):Pose=>({x,y,o,r:0,sx:1,sy:1});
export function climbGeo(width:number,stage:Rect,avoid:Rect[],size:number,viewport=width):Climb|null {
  if(viewport<1024||!avoid.length)return null;
  const left=Math.min(...avoid.map(r=>r.left)),right=Math.max(...avoid.map(r=>r.right));
  const lowest=avoid.reduce((a,b)=>b.bottom>a.bottom?b:a);
  const clearance=size*.64+12, lx=left-clearance,rx=right+clearance;
  const perch=lowest.top+size*.98;
  const neighbors=avoid.filter(r=>r.bottom>perch-size*1.1&&r.top<perch+size*.05);
  const hangLeft=Math.min(...neighbors.map(r=>r.left))-clearance,hangRight=Math.max(...neighbors.map(r=>r.right))+clearance;
  if(lx<size*.65+8||rx>width-size*.65-8||stage.bottom-22-perch<60||perch-size*1.08<0)return null;
  return {left:lx,right:rx,hangLeft,hangRight,perch};
}
export function measureLayout(width:number,height:number,stage:Rect,avoid:Rect[]=[],viewport=width):Layout {
  const size=Math.min(stage.bottom-stage.top<200?44:56,Math.max(30,(stage.right-stage.left)/8));
  const mid=(stage.left+stage.right)/2,gap=size*2.1;
  return {width,height,stage,size,ballSize:size*.29,floor:stage.bottom-22,lanes:{grok:mid-gap,codex:mid,claude:mid+gap},climb:climbGeo(width,stage,avoid,size,viewport),avoid};
}
function frame(track:Track,p:Point,s:number):Keyframe {
  let transform='';
  if(ACTORS.includes(track as Actor))transform=`translate(${p.x-s/2}px, ${p.y-s*.95}px) rotate(${p.r}deg) scale(${p.sx}, ${p.sy})`;
  else if(track==='ballX')transform=`translateX(${p.x}px)`;
  else if(track==='ballY')transform=`translateY(${p.y}px)`;
  else if(track==='ballSpin'||track==='roll')transform=`rotate(${p.r}deg)`;
  else transform=`translate(${p.x}px, ${p.y}px) rotate(${p.r}deg) scale(${p.sx}, ${p.sy})`;
  return {offset:p.offset,easing:p.easing,transform,opacity:p.o,...(ACTORS.includes(track as Actor)?{transformOrigin:'50% 50%'}:{})};
}
export function buildTimeline(g:Layout):Segment[] {
  const {size:s,floor:f,lanes:l,stage}=g,w=stage.right-stage.left,b=g.ballSize;
  const rest=Object.fromEntries(TRACKS.map(t=>[t,pose(0,0,0)])) as Record<Track,Pose>;
  ACTORS.forEach(a=>{rest[a]=pose(l[a],f);rest[LOOK[a]]=pose();});
  rest.roll=pose();rest.ballX=pose(l.grok+s*.8-b/2);rest.ballY=pose(0,f-b);rest.ballSpin=pose();
  rest.placard=pose(l.codex-27,f-s-48,0);
  rest.pitch=pose(stage.left,f-72,0);rest.goal=pose(stage.right-Math.min(120,w*.2)-18,f-80,0);
  rest.padel=pose(stage.left,f-94,0);rest.cafe=pose(stage.left,f-95,0);
  rest.object=pose(l.claude-s*.4,f-80,0);rest.ladder=pose(l.claude-s*.9-32,f-100,0);
  let state=structuredClone(rest);const scenes:Segment[]=[];
  type Setter=(t:Track,at:number,p:Partial<Pose>,ease?:string)=>void;
  function scene(name:string,label:string,duration:number,author:(set:Setter)=>void,keep:Track[]=[]){
    const points=Object.fromEntries(TRACKS.map(t=>[t,[{...state[t],offset:0,easing:EASE.walk}]])) as Record<Track,Point[]>;
    const set:Setter=(t,at,p,ease=EASE.walk)=>{const prev=points[t][points[t].length-1];points[t].push({...prev,...p,offset:at,easing:ease});};
    author(set);
    // Keep angular momentum through the end; normalize complete turns instantly
    // instead of interpolating backwards to zero during the last tenth.
    const spin=points.ballSpin.at(-1)!;
    if(spin.r!==0&&spin.r%360===0){points.ballSpin.push({...spin,offset:1});points.ballSpin.push({...spin,offset:1,r:0});}
    // Roll in proportion to horizontal travel. Grounded waypoints use whole
    // turns so the eyes are upright at each rest, including off-screen rests.
    if(points.roll.length===1&&name!=='tumble'){
      const start=points.grok[0],angle=state.roll.r,circumference=s*.9*Math.PI;
      const travel=Math.max(...points.grok.map(p=>Math.abs(p.x-start.x))),turns=Math.round(travel/circumference);
      points.roll=points.grok.map(p=>({...pose(),offset:p.offset,easing:p.easing,r:angle+(travel?(p.x-start.x)/travel*turns*360:0)}));
      const end=points.roll[points.roll.length-1];
      if(end.offset<1)points.roll.push({...end,offset:1});
      // Identical orientations on this zero-time normalization keyframe.
      points.roll.push({...points.roll[points.roll.length-1],offset:1,r:0});
    }
    for(const t of TRACKS){const a=points[t];const last=a[a.length-1]!;if(last.offset<1)set(t,1,keep.includes(t)?last:rest[t]!);state[t]={...last};}
    // Separate eye layer: attention follows the shared object/partner without
    // fighting pointer gaze. No frame loop or React re-render is required.
    for(const actor of ACTORS){const t=LOOK[actor];points[t]=[{...rest[t],offset:0,easing:EASE.linear}];
      for(let step=1;step<30;step++){const u=step/30,p=sample(points[actor],u),ball=sample(points.ballX,u),ballY=sample(points.ballY,u);
        const partner=actor==='codex'?(u<.5?'grok':'claude'):'codex';
        const target=ball.o>.5&&['opening','relay','steal','spotted','penalty','padel'].includes(name)?{x:ball.x,y:ballY.y}:{x:sample(points[partner],u).x,y:sample(points[partner],u).y-s*.55};
        const fade=Math.min(1,u*10,(1-u)*10);points[t].push({...pose(),x:Math.max(-3,Math.min(3,(target.x-p.x)/s))*fade,y:Math.max(-1.5,Math.min(1.5,(target.y-(p.y-s*.55))/s))*fade,offset:u,easing:EASE.linear});
      }points[t].push({...rest[t],offset:1,easing:EASE.linear});
    }
    scenes.push({name,label,duration,points,tracks:Object.fromEntries(TRACKS.map(t=>[t,points[t].map(p=>frame(t,p,s))])) as Record<Track,Keyframe[]>});
  }
  const hop=(set:Setter,a:Actor,start:number,end:number,height=s*.35,x=l[a])=>{
    set(a,start,{x:l[a],y:f},EASE.up);set(a,(start+end)/2,{x,y:f-height},EASE.down);set(a,end,{x:l[a],y:f});
  };
  const head=(x:number)=>Math.abs(x-l.claude)<s*.3?s*.71:s*.9;
  const pass=(set:Setter,from:number,to:number,start:number,end:number,height=s*1.65)=>{
    set('ballX',start,{x:from-b/2},EASE.linear);set('ballX',end,{x:to-b/2});
    set('ballY',start,{y:f-head(from)-b},EASE.up);set('ballY',(start+end)/2,{y:f-height-b},EASE.down);set('ballY',end,{y:f-head(to)-b});
  };
  const touch=(set:Setter,a:Actor,at:number)=>{
    set(a,at-.045,{sx:1,sy:1});set(a,at-.018,{sx:1.035,sy:.94});set(a,at,{sx:.98,sy:1.045});set(a,at+.035,{sx:1.018,sy:.977});set(a,at+.075,{sx:1,sy:1});
  };
  scene('opening','Keep it up',6000,set=>{
    pass(set,l.grok,l.codex,.1,.34);pass(set,l.codex,l.claude,.34,.58);pass(set,l.claude,l.grok,.58,.84);
    touch(set,'grok',.1);touch(set,'grok',.84);touch(set,'codex',.34);touch(set,'claude',.58);set('ballSpin',.9,{r:720});
  });
  scene('relay','Pass it on',4900,set=>{
    pass(set,l.grok,l.codex,.1,.34,s*1.35);pass(set,l.codex,l.claude,.34,.58,s*1.45);pass(set,l.claude,l.grok,.58,.84,s*1.8);
    touch(set,'grok',.1);touch(set,'grok',.84);touch(set,'codex',.34);touch(set,'claude',.58);set('ballSpin',.9,{r:1080});
  });
  if(g.climb){const c=g.climb;
    scene('climb','A better view',11000,set=>{
      // Robot lifts before crossing the orb's lane; the entire crossing is above it.
      set('codex',.07,{y:f-s*1.65},EASE.up);set('codex',.2,{x:c.left,y:f-s*1.65});set('codex',.38,{x:c.left,y:c.perch});set('codex',.48,{x:c.hangLeft});set('codex',.6,{x:c.hangLeft});set('codex',.68,{x:c.left});set('codex',.8,{y:f-s*1.65});set('codex',.93,{x:l.codex,y:f-s*1.65},EASE.down);
      set('claude',.2,{x:c.right});set('claude',.38,{y:c.perch});set('claude',.48,{x:c.hangRight});set('claude',.6,{x:c.hangRight});set('claude',.68,{x:c.right});set('claude',.83,{y:f});set('claude',.96,{x:l.claude});
      hop(set,'grok',.3,.5,s*.4);
    });
  }
  scene('steal','Leapfrog larceny',7200,set=>{
    const landing=l.codex+s*1.4;
    // Partners make a landing pocket, then the orb follows a true parabolic arc.
    set('codex',.10,{x:l.codex-s*.3,sy:.94});set('codex',.88,{x:l.codex-s*.3,sy:.94});
    set('claude',.10,{x:l.claude+s});set('claude',.88,{x:l.claude+s});
    set('grok',.07,{sx:1.05,sy:.9});set('grok',.12,{sx:1,sy:1},EASE.linear);
    for(let i=1;i<=24;i++){const u=i/24;set('grok',.12+.30*u,{x:l.grok+(landing-l.grok)*u,y:f-4*s*2.2*u*(1-u)},EASE.linear);}
    set('grok',.45,{sy:.91,sx:1.05});set('grok',.50,{sy:1,sx:1});set('grok',.57,{sy:1,sx:1},EASE.linear);
    for(let i=1;i<=24;i++){const u=i/24;set('grok',.57+.30*u,{x:landing+(l.grok-landing)*u,y:f-4*s*2.2*u*(1-u)},EASE.linear);}
    set('grok',.90,{sy:.92,sx:1.04});set('grok',.95,{sy:1,sx:1});
    pass(set,l.claude+s,l.codex-s*.3,.16,.38);pass(set,l.codex-s*.3,landing,.43,.55);set('ballSpin',.9,{r:1080});
  });
  scene('spotted','Caught in the act',4500,set=>{
    set('grok',.12,{sx:1.13,sy:.7});set('grok',.24,{sx:.93,sy:1.06});set('grok',.32,{sx:1,sy:1});set('grok',.75,{x:-s});set('roll',.75,{r:-720});pass(set,l.grok,l.claude,.18,.65);
  },['grok','roll']);
  scene('hide','Anyone seen Grok?',6000,set=>{
    set('grok',.2,{x:s*.2,sy:.4});set('grok',.4,{sy:1});set('grok',.58,{sy:.35});set('grok',.8,{x:-s,sy:1});
    set('codex',.3,{x:l.codex-s*.15});set('codex',.6,{x:l.codex+s*.15});set('claude',.35,{x:l.claude-s*.15});set('claude',.65,{x:l.claude+s*.15});
  },['grok','roll']);
  const keeper=stage.right-s*.9,kicker=l.codex-s*.5,spectator=stage.left+s*.9;
  scene('setup','Match point',5500,set=>{
    set('pitch',.25,{o:1});set('goal',.3,{o:1});set('grok',.6,{x:spectator});set('roll',.6,{r:0});set('claude',.65,{x:keeper});set('codex',.65,{x:kicker-s*.55});set('ballX',.65,{x:kicker+s*.6});
  },['pitch','goal','grok','claude','codex','ballX']);
  scene('penalty','Top corner',6600,set=>{
    // Explicit holds prevent anticipation interpolating backwards into setup.
    set('codex',.12,{x:kicker-s*.55});set('codex',.26,{x:kicker-s*.12,sy:.96});set('codex',.30,{x:kicker,sy:1.03});set('codex',.35,{x:kicker+s*.08,sy:1});
    set('ballX',.30,{x:kicker+s*.6},EASE.linear);set('ballX',.48,{x:keeper+s*.15});set('ballX',.60,{x:keeper-s*.12});set('ballX',.88,{x:keeper-s*.2});
    set('ballY',.30,{y:f-b},EASE.up);set('ballY',.44,{y:f-69},EASE.down);set('ballY',.57,{y:f-b},EASE.up);set('ballY',.65,{y:f-29},EASE.down);set('ballY',.73,{y:f-b},EASE.up);set('ballY',.78,{y:f-15},EASE.down);set('ballY',.84,{y:f-b});
    set('claude',.34,{x:keeper,y:f,r:0});set('claude',.38,{x:keeper-s*.12,y:f-s*.35,r:-18});set('claude',.47,{x:keeper-s*.65,y:f-s*.4,r:-76});set('claude',.55,{x:keeper-s*.65,y:f-s*.35,r:-76});set('claude',.65,{x:keeper-s*.3,y:f-s*.3,r:-30});set('claude',.76,{x:keeper,y:f,r:0});
    set('goal',.47,{sx:1,sy:1});set('goal',.5,{sx:1.035,sy:.97});set('goal',.56,{sx:1,sy:1});
    set('grok',.60,{x:spectator,y:f});set('grok',.66,{sy:.93},EASE.up);set('grok',.72,{y:f-s*.3,sy:1.02},EASE.down);set('grok',.79,{y:f,sy:.94});set('grok',.84,{sy:1});
    set('codex',.65,{x:kicker+s*.08,y:f,sy:.95},EASE.up);set('codex',.72,{y:f-s*.24,sy:1.03},EASE.down);set('codex',.79,{y:f,sy:.95});set('codex',.85,{sy:1});
    set('ballSpin',.30,{r:0});set('ballSpin',.87,{r:1440});
  },['pitch','goal','grok','claude','codex']);
  scene('padel','One more rally',9200,set=>{
    set('pitch',.08,{o:0});set('goal',.08,{o:0});set('grok',.16,{x:l.grok});set('codex',.16,{x:l.codex});set('claude',.16,{x:l.claude});set('padel',.17,{o:1});
    pass(set,l.grok,l.codex,.22,.38,s*1.35);pass(set,l.codex,l.claude,.38,.54,s*1.5);pass(set,l.claude,l.codex,.54,.70,s*1.35);pass(set,l.codex,l.grok,.70,.86,s*1.5);
    touch(set,'grok',.22);touch(set,'grok',.86);touch(set,'codex',.38);touch(set,'codex',.70);touch(set,'claude',.54);set('padel',.89,{o:1});set('padel',.96,{o:0});
  });
  scene('cafe','Back to work',10000,set=>{
    set('ballX',.08,{o:0});set('ballX',.92,{o:0});set('cafe',.14,{o:1});
    // Grok asks, Codex turns toward it, then they both react to Claude's idea.
    set('grok',.25,{x:l.grok,sy:1});set('grok',.34,{x:l.grok+s*.12,sy:.97});set('grok',.43,{sy:1.025});set('grok',.5,{x:l.grok,sy:1});set('grok',.66,{sy:.97});set('grok',.73,{sy:1});
    set('codex',.33,{x:l.codex});set('codex',.42,{x:l.codex-s*.1,sy:.98});set('codex',.50,{x:l.codex});set('codex',.60,{x:l.codex+s*.1,sy:1});set('codex',.69,{sy:.97});set('codex',.77,{x:l.codex,sy:1});
    set('claude',.49,{x:l.claude});set('claude',.58,{x:l.claude-s*.1,sy:1.03});set('claude',.65,{sy:.97});set('claude',.74,{x:l.claude,sy:1});set('cafe',.87,{o:1});set('cafe',.95,{o:0});
  });
  scene('climb-try','We can reach that',7600,set=>{
    set('ballX',.08,{o:0});set('ballX',.98,{o:0});set('object',.1,{o:1});set('claude',.16,{x:l.claude-s*.72});set('claude',.27,{x:l.claude-s*.72,y:f-s*.65},EASE.down);set('claude',.36,{y:f,sy:.76});set('claude',.43,{sy:1});set('claude',.56,{y:f-s*.86},EASE.down);set('claude',.67,{y:f,sy:.76});set('claude',.76,{sy:1});set('claude',.91,{x:l.claude-s*.72});
    hop(set,'codex',.43,.63,s*.2);
    set('grok',.18,{x:l.grok});set('grok',.35,{x:l.grok+s*.2,sy:.96});set('grok',.52,{sy:1});set('grok',.7,{x:l.grok,sy:1});
  },['object','claude']);
  scene('ladder-fetch','A better idea',7200,set=>{
    // Preserve left-to-right ordering: both run out and carry the ladder back
    // together, at ground level, without crossing or hovering above each other.
    set('grok',.06,{x:l.grok});set('codex',.06,{x:l.codex});
    set('grok',.28,{x:-s*2.5});set('codex',.28,{x:-s});set('grok',.40,{x:-s*2.5});set('codex',.40,{x:-s});
    set('ladder',.399,{x:-s*2.5,y:f-s*.55-100,o:0,r:90});set('ladder',.40,{o:1});
    set('grok',.72,{x:l.grok});set('codex',.72,{x:l.codex});
    set('ladder',.72,{x:l.grok+s*.3-16,y:f-s*.55-100,r:90});set('ladder',.91,{x:l.claude-s*.9-32,y:f-100,r:0});
  },['object','claude','ladder']);
  scene('ladder-success','Teamwork wins',10000,set=>{
    set('claude',.12,{x:l.claude-s*.72});set('claude',.36,{x:l.claude-s*.72,y:f-80});set('claude',.5,{x:l.claude+s*.15,y:f-80});set('claude',.65,{x:l.claude+s*.15,y:f-80});set('claude',.75,{x:l.claude-s*.72,y:f-80});set('claude',.91,{x:l.claude-s*.72,y:f});
    hop(set,'grok',.5,.68,s*.3);hop(set,'codex',.53,.71,s*.26);
  },['object','ladder']);
  scene('teardown','And again…',4200,set=>{set('object',.25,{o:0});set('ladder',.25,{o:0});ACTORS.forEach((a,i)=>hop(set,a,.3+i*.1,.5+i*.1,s*.12));});
  return scenes;
}

/** Solve CSS cubic-bezier x(t), then evaluate y(t); used by the headless verifier. */
export function eased(t:number,ease:string):number {
  if(ease==='linear')return t;
  const v=ease.match(/[\d.]+/g)?.map(Number);if(!v||v.length!==4)return t;
  const [x1,y1,x2,y2]=v as [number,number,number,number];
  const curve=(u:number,a:number,b:number)=>3*(1-u)**2*u*a+3*(1-u)*u*u*b+u**3;
  let lo=0,hi=1;for(let i=0;i<35;i++){const m=(lo+hi)/2;if(curve(m,x1,x2)<t)lo=m;else hi=m;}
  return curve((lo+hi)/2,y1,y2);
}
export function sample(points:Point[],t:number):Pose {
  let i=0;while(i<points.length-2&&points[i+1]!.offset<t)i++;
  const a=points[i]!,b=points[i+1]||a;const z=b.offset===a.offset?0:eased(Math.max(0,Math.min(1,(t-a.offset)/(b.offset-a.offset))),a.easing);
  return Object.fromEntries(['x','y','r','sx','sy','o'].map(k=>[k,a[k as keyof Pose]+(b[k as keyof Pose]-a[k as keyof Pose])*z])) as Pose;
}
export const INK_BOUNDS:Record<Actor,Rect>={grok:{left:.05,right:.95,top:.05,bottom:.95},codex:{left:.125,right:.875,top:.05,bottom:.95},claude:{left:.05,right:.95,top:.228,bottom:.95}};
export function bounds(p:Pose,size:number,actor:Actor='grok'):Rect {
  // Trim transparent canvas, then add room for gaze, lean, arms and startle.
  const ink=INK_BOUNDS[actor],half=size*((ink.right-ink.left)/2+.13)*Math.max(p.sx,p.sy),height=size*(ink.bottom-ink.top+.18)*Math.max(p.sx,p.sy);
  if(Math.abs(p.r%360)>1e-5){const center=p.y-size*.45,radius=Math.hypot(half,Math.max(height-size*.45,size*.485));return {left:p.x-radius,right:p.x+radius,top:center-radius,bottom:center+radius};}
  return {left:p.x-half,right:p.x+half,top:p.y-height,bottom:p.y+size*.035};
}
export const overlaps=(a:Rect,b:Rect)=>a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;
