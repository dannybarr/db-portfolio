import {ACTORS,TRACKS,buildTimeline,measureLayout,sample,bounds,overlaps,type Rect} from './mascotChoreo';
const widths=[320,360,390,480,640,768,1024,1280,1440,1920];let checked=0,climbs=0;const failures:string[]=[];
function check(ok:boolean,message:string){if(!ok&&failures.length<45)failures.push(message);}
for(const viewport of widths)for(const variant of [0,1,2]){
  const width=Math.min(1344,viewport-32)-variant*.33,stageWidth=Math.min(1120,width),top=410+variant*27,height=viewport<640?180:220;
  const stage:Rect={left:(width-stageWidth)/2,top,right:(width+stageWidth)/2,bottom:top+height};
  const content=Math.min(610,width-36),chips=variant===1?390:220;
  const avoid:Rect[]=[{left:(width-content)/2,right:(width+content)/2,top:60,bottom:295},{left:Math.max(12,(width-chips)/2),right:Math.min(width-12,(width+chips)/2),top:325,bottom:350}];
  const layout=measureLayout(width,stage.bottom+36,stage,avoid,viewport),timeline=buildTimeline(layout);if(layout.climb)climbs++;
  check(!timeline.some(s=>['heist','juggling','tumble','peek'].includes(s.name)),'Solo/award scene retained');
  const penalty=timeline.find(s=>s.name==='penalty')!;
  for(let i=0;i<=60;i++){const t=i/200,p=sample(penalty.points.claude,t);check(Math.abs(p.y-layout.floor)<.001&&p.r===0,`Keeper moved before kick at ${t}`);}
  for(let n=0;n<timeline.length;n++){
    const scene=timeline[n]!,next=timeline[(n+1)%timeline.length]!;
    for(const track of TRACKS){const last=scene.points[track].at(-1)!,first=next.points[track][0];for(const key of ['x','y','r','sx','sy','o'] as const)check(Math.abs(last[key]-first[key])<.001,`${viewport}/${variant} ${scene.name} seam ${track}.${key}: ${last[key]} != ${first[key]}`);}
    for(let step=0;step<=240;step++){
      const t=step/240,poses=ACTORS.map(a=>sample(scene.points[a],t)),boxes=poses.map((p,i)=>bounds(p,layout.size,ACTORS[i]!));checked++;
      for(let i=0;i<3;i++){
        const box=boxes[i]!,visible=box.right>stage.left&&box.left<stage.right;
        if(!visible)continue;
        check(box.bottom<=stage.bottom+1,`${viewport}/${variant} ${scene.name}@${t.toFixed(3)} ${ACTORS[i]} below floor band ${box.bottom-stage.bottom}`);
        if(scene.name!=='climb')check(box.top>=stage.top-1,`${viewport}/${variant} ${scene.name}@${t.toFixed(3)} ${ACTORS[i]} above stage ${stage.top-box.top}`);
        else for(const rect of avoid)check(!overlaps(box,rect),`${viewport}/${variant} climb@${t.toFixed(3)} ${ACTORS[i]} hits content`);
        for(let j=i+1;j<3;j++)check(!overlaps(box,boxes[j]!),`${viewport}/${variant} ${scene.name}@${t.toFixed(3)} ${ACTORS[i]} overlaps ${ACTORS[j]}`);
      }
      const sign=sample(scene.points.placard,t);check(sign.o===0,`${scene.name}: removed award prop became visible`);
    }
  }
}
check(climbs>0,'Climb never enabled');
if(failures.length){console.error('FAIL\n'+failures.join('\n'));throw Error(`Geometry failed; ${checked.toLocaleString()} scene samples checked`);}
console.log(`PASS · ${checked.toLocaleString()} samples · ${widths.length} viewport widths × 3 layouts · ${climbs} climb layouts · seams, actor separation, stage bounds, content clearance.`);
