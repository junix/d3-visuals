import * as d3 from 'd3';
import './style.css';

declare global { interface Window { __VIS_READY__?: boolean; __INTERACTION_COUNT__?: number } }
const W=1400,H=900,scene=new URLSearchParams(location.search).get('scene')??'chord';
const svg=d3.select('#app').append('svg').attr('id','stage').attr('viewBox',`0 0 ${W} ${H}`).attr('width',W).attr('height',H);
const palette=['#54d6c6','#ffd166','#ff6f91','#7b9cff','#b889ff','#65b9ff'];
function heading(title:string,sub:string){svg.append('text').attr('x',72).attr('y',78).attr('class','title').text(title);svg.append('text').attr('x',74).attr('y',112).attr('class','subtitle').text(sub);svg.append('line').attr('x1',74).attr('x2',370).attr('y1',137).attr('y2',137).attr('stroke','#496b82')}
function chordScene(){
  heading('CIVIC EXCHANGE','FLOWS BETWEEN SIX URBAN COMMONS');
  const matrix=[[0,18,6,11,4,8],[14,0,15,5,8,6],[7,12,0,18,9,4],[10,4,16,0,13,7],[6,8,7,12,0,17],[11,5,3,8,15,0]];const names=['Culture','Mobility','Food','Learning','Care','Energy'];
  const chord=d3.chord().padAngle(.055).sortSubgroups(d3.descending)(matrix),arc=d3.arc<d3.ChordGroup>().innerRadius(270).outerRadius(300),ribbon=d3.ribbon<d3.Chord, d3.ChordSubgroup>().radius(266);
  const g=svg.append('g').attr('transform','translate(760,485)');
  g.append('g').selectAll('path').data(chord).join('path').attr('d',ribbon).attr('fill',d=>palette[d.source.index]).attr('fill-opacity',.28).attr('stroke',d=>palette[d.source.index]).attr('stroke-opacity',.65).attr('stroke-width',1.4);
  const groups=g.append('g').selectAll('g').data(chord.groups).join('g');groups.append('path').attr('d',arc).attr('fill',d=>palette[d.index]).attr('fill-opacity',.88).attr('stroke','#dff7ff').attr('stroke-opacity',.55);
  groups.append('text').attr('dy','.35em').attr('transform',d=>{const angle=(d.startAngle+d.endAngle)/2;return `rotate(${angle*180/Math.PI-90}) translate(325) ${angle>Math.PI?'rotate(180)':''}`}).attr('text-anchor',d=>(d.startAngle+d.endAngle)/2>Math.PI?'end':'start').attr('class','label').text(d=>names[d.index]);
  g.append('circle').attr('r',205).attr('fill','none').attr('stroke','#7692aa').attr('stroke-dasharray','2 9').attr('opacity',.42);
}
function treeScene(){
  heading('MYCELIUM ATLAS','A RADIAL TAXONOMY OF HIDDEN NETWORKS');
  const data={name:'Mycelium',children:['Signal','Exchange','Memory','Repair','Frontier'].map((n,i)=>({name:n,children:Array.from({length:4},(_,j)=>({name:`${n.slice(0,3)}-${j+1}`,children:j%2?[{name:`spore ${i+1}.${j}`}]:undefined}))}))};
  const root:any=d3.hierarchy(data),layout:any=d3.tree().size([Math.PI*2,340]).separation((a:any,b:any)=>(a.parent===b.parent?1:1.7)/a.depth);layout(root);
  const g=svg.append('g').attr('transform','translate(770,490)');const point=(d:any):[number,number]=>[Math.cos(d.x-Math.PI/2)*d.y,Math.sin(d.x-Math.PI/2)*d.y];
  g.selectAll('circle.guide').data([85,165,245,335]).join('circle').attr('r',d=>d).attr('fill','none').attr('stroke',(_,i)=>palette[i]).attr('stroke-width',18).attr('stroke-opacity',.16);
  g.selectAll('path.link').data(root.links()).join('path').attr('fill','none').attr('stroke',(d:any)=>palette[(d.target.depth+(d.target.data.name.length??0))%palette.length]).attr('stroke-opacity',.42).attr('stroke-width',(d:any)=>5-d.target.depth).attr('d',(d:any)=>{const s=point(d.source),t=point(d.target);return d3.linkRadial<any,any>().angle(x=>x.x).radius(x=>x.y)({source:d.source,target:d.target})??`M${s}L${t}`});
  const nodes=g.selectAll('g.node').data(root.descendants()).join('g').attr('transform',(d:any)=>`translate(${point(d)})`);nodes.append('circle').attr('r',(d:any)=>d.depth===0?24:8-d.depth).attr('fill',(d:any)=>d.depth===0?'#ffd166':palette[(d.depth+d.data.name.length)%palette.length]).attr('stroke','#e8f8ff').attr('stroke-opacity',.7);
  nodes.filter((d:any)=>d.depth<3).append('text').attr('x',(d:any)=>d.x<Math.PI?-12:12).attr('text-anchor',(d:any)=>d.x<Math.PI?'end':'start').attr('class','label').attr('font-size',(d:any)=>18-d.depth*2).text((d:any)=>d.data.name);
}
function voronoiScene(){
  heading('CLIMATE VORONOI','SYNTHETIC SENSOR TERRITORIES / 84 STATIONS');
  const points=Array.from({length:84},(_,i):[number,number]=>[120+((i*137)%1130)+35*Math.sin(i*2.4),175+((i*83)%610)+25*Math.cos(i*1.7)]);const delaunay=d3.Delaunay.from(points),v=delaunay.voronoi([70,160,1330,840]);
  const values=points.map(([x,y],i)=>.5+.28*Math.sin(x*.009)+.22*Math.cos(y*.013+i*.21));const scale=d3.scaleSequential(d3.interpolateTurbo).domain([0,1]);
  svg.append('g').selectAll('path').data(points).join('path').attr('d',(_,i)=>v.renderCell(i)).attr('fill',(_,i)=>scale(values[i])).attr('fill-opacity',.22).attr('stroke',(_,i)=>scale(values[i])).attr('stroke-opacity',.82).attr('stroke-width',1.2);
  svg.append('g').selectAll('circle').data(points).join('circle').attr('cx',d=>d[0]).attr('cy',d=>d[1]).attr('r',(_,i)=>2+values[i]*4).attr('fill',(_,i)=>scale(values[i])).attr('stroke','#f2fbff').attr('stroke-opacity',.55);
  const legend=svg.append('g').attr('transform','translate(1090,95)');d3.range(90).forEach(i=>legend.append('rect').attr('x',i*2).attr('width',2).attr('height',8).attr('fill',scale(i/89)));legend.append('text').attr('x',0).attr('y',-8).attr('class','micro').text('COOL');legend.append('text').attr('x',180).attr('y',-8).attr('text-anchor','end').attr('class','micro').text('WARM');
}
if(scene==='radial-tree')treeScene();else if(scene==='voronoi')voronoiScene();else chordScene();
window.__INTERACTION_COUNT__=0;svg.on('pointermove',()=>window.__INTERACTION_COUNT__=(window.__INTERACTION_COUNT__??0)+1).on('pointerdown',()=>window.__INTERACTION_COUNT__=(window.__INTERACTION_COUNT__??0)+1);window.__VIS_READY__=true;
