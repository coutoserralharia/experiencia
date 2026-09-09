
(function(){
"use strict";
const LC={};
LC.KEYS={materials:"laser_materials_v2",machine:"laser_machine_v2",orders:"laser_orders_v2",pieces:"laser_pieces_v2",remote:"laser_remote_config_v1"};
LC.DEFAULT_MATERIALS=[
 {id:"m1",name:"Aço Carbono",thickness:1,speed:6000,density:7.85,pricePerKg:1.30,markupPct:0,gas:"Oxigénio"},
 {id:"m2",name:"Aço Carbono",thickness:2,speed:4500,density:7.85,pricePerKg:1.30,markupPct:0,gas:"Oxigénio"},
 {id:"m3",name:"Aço Carbono",thickness:3,speed:3500,density:7.85,pricePerKg:1.30,markupPct:0,gas:"Oxigénio"},
 {id:"m4",name:"Aço Carbono",thickness:4,speed:2500,density:7.85,pricePerKg:1.30,markupPct:0,gas:"Oxigénio"},
 {id:"m5",name:"Aço Carbono",thickness:5,speed:1800,density:7.85,pricePerKg:1.30,markupPct:0,gas:"Oxigénio"},
 {id:"m6",name:"Aço Carbono",thickness:6,speed:1400,density:7.85,pricePerKg:1.30,markupPct:0,gas:"Oxigénio"},
 {id:"m7",name:"Aço Carbono",thickness:8,speed:900,density:7.85,pricePerKg:1.30,markupPct:0,gas:"Oxigénio"},
 {id:"m8",name:"Aço Carbono",thickness:10,speed:650,density:7.85,pricePerKg:1.30,markupPct:0,gas:"Oxigénio"},
 {id:"m9",name:"Aço Inox",thickness:1,speed:5000,density:8,pricePerKg:4.50,markupPct:0,gas:"Azoto"},
 {id:"m10",name:"Aço Inox",thickness:2,speed:3500,density:8,pricePerKg:4.50,markupPct:0,gas:"Azoto"},
 {id:"m11",name:"Aço Inox",thickness:3,speed:2200,density:8,pricePerKg:4.50,markupPct:0,gas:"Azoto"},
 {id:"m12",name:"Aço Inox",thickness:4,speed:1500,density:8,pricePerKg:4.50,markupPct:0,gas:"Azoto"},
 {id:"m13",name:"Aço Inox",thickness:5,speed:1000,density:8,pricePerKg:4.50,markupPct:0,gas:"Azoto"},
 {id:"m14",name:"Aço Inox",thickness:6,speed:700,density:8,pricePerKg:4.50,markupPct:0,gas:"Azoto"},
 {id:"m15",name:"Alumínio",thickness:1,speed:5500,density:2.70,pricePerKg:3.80,markupPct:0,gas:"Azoto"},
 {id:"m16",name:"Alumínio",thickness:2,speed:4000,density:2.70,pricePerKg:3.80,markupPct:0,gas:"Azoto"},
 {id:"m17",name:"Alumínio",thickness:3,speed:3000,density:2.70,pricePerKg:3.80,markupPct:0,gas:"Azoto"},
 {id:"m18",name:"Alumínio",thickness:4,speed:2000,density:2.70,pricePerKg:3.80,markupPct:0,gas:"Azoto"},
 {id:"m19",name:"Alumínio",thickness:5,speed:1400,density:2.70,pricePerKg:3.80,markupPct:0,gas:"Azoto"},
 {id:"m20",name:"Alumínio",thickness:6,speed:1000,density:2.70,pricePerKg:3.80,markupPct:0,gas:"Azoto"}
];
LC.DEFAULT_MACHINE={hourlyRate:45,designRate:30,setupRate:30,pierceTime:0.8,materialMargin:0,gasRate:0,consumablesPerOrder:0,defaultSetupMin:5,wasteMarginMm:5,vat:23,machineName:"Laser 3015"};
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const eur=n=>"€"+(Number.isFinite(Number(n))?Number(n).toFixed(2):"0.00").replace(".",",");
const num=(n,d=1)=>Number.isFinite(Number(n))?Number(n).toLocaleString("pt-PT",{minimumFractionDigits:d,maximumFractionDigits:d}):"—";
LC.fmtEUR=eur; LC.fmtNum=num; LC.escapeHtml=esc;

async function get(key, fallback){try{const v=localStorage.getItem(key);return v?JSON.parse(v):fallback}catch(e){return fallback}}
async function set(key,v){try{localStorage.setItem(key,JSON.stringify(v));return true}catch(e){return false}}
LC.loadMaterials=async()=>get(LC.KEYS.materials,JSON.parse(JSON.stringify(LC.DEFAULT_MATERIALS)));
LC.saveMaterials=v=>set(LC.KEYS.materials,v);
LC.loadMachine=async()=>Object.assign({},LC.DEFAULT_MACHINE,await get(LC.KEYS.machine,{}));
LC.saveMachine=v=>set(LC.KEYS.machine,v);
LC.loadOrders=async()=>get(LC.KEYS.orders,[]);
LC.saveOrders=v=>set(LC.KEYS.orders,v);
LC.loadPieces=async()=>get(LC.KEYS.pieces,[]);
LC.savePieces=v=>set(LC.KEYS.pieces,v);
LC.loadRemoteConfig=async()=>get(LC.KEYS.remote,{configured:false,url:"",key:""});
LC.saveRemoteConfig=v=>set(LC.KEYS.remote,v);
LC.sanitizeFileName=s=>String(s||"sem-nome").replace(/[\\/:*?"<>|]+/g,"_").slice(0,120);

function dist(a,b){return Math.hypot(b.x-a.x,b.y-a.y)}
function bulgeSegment(a,b,bulge,N=24){const chord=dist(a,b);if(!bulge||chord<1e-9)return {points:[b],length:chord};const theta=4*Math.atan(bulge),r=Math.abs(chord/(2*Math.sin(theta/2))),sign=bulge>=0?1:-1,mx=(a.x+b.x)/2,my=(a.y+b.y)/2,dx=b.x-a.x,dy=b.y-a.y,ux=-dy/chord,uy=dx/chord,h=Math.sqrt(Math.max(0,r*r-chord*chord/4)),cx=mx-sign*ux*h,cy=my-sign*uy*h,a1=Math.atan2(a.y-cy,a.x-cx),pts=[];for(let i=1;i<=N;i++){let t=a1+theta*i/N;pts.push({x:cx+r*Math.cos(t),y:cy+r*Math.sin(t)})}return{points:pts,length:Math.abs(r*theta)}}
function finish(pts,closed){let len=0;for(let i=0;i<pts.length-1;i++)len+=dist(pts[i],pts[i+1]);if(closed&&pts.length>1)len+=dist(pts[pts.length-1],pts[0]);let area=0;if(closed){for(let i=0;i<pts.length;i++){let a=pts[i],b=pts[(i+1)%pts.length];area+=a.x*b.y-b.x*a.y}area=Math.abs(area)/2}return{points:pts,closed,length:len,area}}
LC.parseDXF=function(text){
 const lines=text.split(/\r\n|\r|\n/),tok=[];for(let i=0;i+1<lines.length;i+=2){let c=parseInt(lines[i].trim(),10);if(Number.isFinite(c))tok.push({code:c,value:lines[i+1].trim()})}
 let start=-1,end=-1;for(let i=0;i<tok.length;i++){if(tok[i].code===2&&tok[i].value==="ENTITIES"&&tok[i-1]?.code===0&&tok[i-1]?.value==="SECTION")start=i+1;if(start>=0&&tok[i].code===0&&tok[i].value==="ENDSEC"){end=i;break}}
 if(start<0)throw Error("Secção ENTITIES não encontrada.");if(end<0)end=tok.length;
 const ents=[];let cur=null;for(const t of tok.slice(start,end)){if(t.code===0){if(cur)ents.push(cur);cur={type:t.value,items:[]}}else if(cur)cur.items.push(t)}if(cur)ents.push(cur);
 const contours=[],warnings=new Set(),get=(e,c)=>e.items.filter(x=>x.code===c);
 for(let idx=0;idx<ents.length;idx++){const e=ents[idx];
  if(e.type==="LINE"){let x1=+get(e,10)[0]?.value,y1=+get(e,20)[0]?.value,x2=+get(e,11)[0]?.value,y2=+get(e,21)[0]?.value;if([x1,y1,x2,y2].every(Number.isFinite))contours.push(finish([{x:x1,y:y1},{x:x2,y:y2}],false))}
  else if(e.type==="CIRCLE"){let x=+get(e,10)[0]?.value,y=+get(e,20)[0]?.value,r=+get(e,40)[0]?.value;if([x,y,r].every(Number.isFinite)){let pts=[];for(let i=0;i<64;i++){let a=i/64*2*Math.PI;pts.push({x:x+r*Math.cos(a),y:y+r*Math.sin(a)})}contours.push({points:pts,closed:true,length:2*Math.PI*r,area:Math.PI*r*r})}}
  else if(e.type==="ARC"){let x=+get(e,10)[0]?.value,y=+get(e,20)[0]?.value,r=+get(e,40)[0]?.value,a1=+get(e,50)[0]?.value,a2=+get(e,51)[0]?.value;if([x,y,r,a1,a2].every(Number.isFinite)){a1*=Math.PI/180;a2*=Math.PI/180;let sweep=a2-a1;if(sweep<=0)sweep+=2*Math.PI;let N=Math.max(8,Math.round(sweep/(Math.PI/32))),pts=[];for(let i=0;i<=N;i++){let a=a1+sweep*i/N;pts.push({x:x+r*Math.cos(a),y:y+r*Math.sin(a)})}contours.push({points:pts,closed:false,length:r*sweep,area:0})}}
  else if(e.type==="LWPOLYLINE"){let vs=[],c=null;for(const it of e.items){if(it.code===10){if(c)vs.push(c);c={x:+it.value,y:0,bulge:0}}else if(it.code===20&&c)c.y=+it.value;else if(it.code===42&&c)c.bulge=+it.value}if(c)vs.push(c);let closed=((+(get(e,70)[0]?.value)||0)&1)===1;if(vs.length>=2){let pts=[vs[0]];for(let i=0;i<(closed?vs.length:vs.length-1);i++){let a=vs[i],b=vs[(i+1)%vs.length],seg=bulgeSegment(a,b,a.bulge);pts.push(...seg.points)}contours.push(finish(pts,closed))}}
  else if(e.type==="POLYLINE"){let closed=((+(get(e,70)[0]?.value)||0)&1)===1,vs=[],j=idx+1;while(j<ents.length&&ents[j].type==="VERTEX"){let v=ents[j],x=+get(v,10)[0]?.value,y=+get(v,20)[0]?.value,b=+(get(v,42)[0]?.value||0);if(Number.isFinite(x)&&Number.isFinite(y))vs.push({x,y,bulge:b});j++}if(j<ents.length&&ents[j].type==="SEQEND")idx=j;else idx=j-1;if(vs.length>=2){let pts=[vs[0]];for(let i=0;i<(closed?vs.length:vs.length-1);i++){let seg=bulgeSegment(vs[i],vs[(i+1)%vs.length],vs[i].bulge);pts.push(...seg.points)}contours.push(finish(pts,closed))}}
  else if(["SPLINE","ELLIPSE"].includes(e.type))warnings.add(e.type);
 }
 const all=contours.flatMap(c=>c.points),xs=all.map(p=>p.x),ys=all.map(p=>p.y),bbox=all.length?{minX:Math.min(...xs),maxX:Math.max(...xs),minY:Math.min(...ys),maxY:Math.max(...ys)}:null;
 return{contours,warnings:[...warnings],totalLength:contours.reduce((s,c)=>s+c.length,0),bbox,closedContours:contours.filter(c=>c.closed),openContours:contours.filter(c=>!c.closed)}
};
LC.computeNextOrderNumber=async orders=>{let y=new Date().getFullYear(),max=0;(orders||[]).forEach(o=>{let m=/^(\d{4})_(\d+)$/.exec(o.orderNumber||"");if(m&&+m[1]===y)max=Math.max(max,+m[2])});return `${y}_${String(max+1).padStart(5,"0")}`};
LC.summarizeAccuracy=orders=>{let g={};for(const o of orders||[]){let c=o.costSnapshot||{};if(!c.isFinal||!(c.estimatedCuttingTimeMin>0)||!Number.isFinite(c.cuttingTimeMin))continue;let m=o.materialSnapshot||{},k=`${m.name||"Material"} — ${m.thickness||""}mm`;g[k]??={key:k,count:0,e:0,r:0};g[k].count++;g[k].e+=c.estimatedCuttingTimeMin;g[k].r+=c.cuttingTimeMin}return Object.values(g).map(x=>({...x,avgEstimated:x.e/x.count,avgReal:x.r/x.count,deviation:(x.r-x.e)/x.e*100})).sort((a,b)=>b.count-a.count)};

LC.calcGeometry=function(input){
 if(input.mode==="dxf"&&input.dxfResult){let r=input.dxfResult,b=r.bbox;return{perimeterMm:r.totalLength,netAreaMm2:r.closedContours.reduce((s,c)=>s+c.area,0),widthMm:b?b.maxX-b.minX:0,heightMm:b?b.maxY-b.minY:0,pierces:input.pierces||r.closedContours.length,contours:r.contours}}
 let shape=input.shape||"rect",holes=+input.holes||0;if(shape==="rect"){let w=+input.w||0,h=+input.h||0;return{perimeterMm:2*(w+h),netAreaMm2:w*h,widthMm:w,heightMm:h,pierces:1+holes,contours:[]}}
 if(shape==="circle"){let d=+input.d||0;return{perimeterMm:Math.PI*d,netAreaMm2:Math.PI*d*d/4,widthMm:d,heightMm:d,pierces:1+holes,contours:[]}}
 return{perimeterMm:+input.perim||0,netAreaMm2:+input.area||0,widthMm:0,heightMm:0,pierces:1+holes,contours:[]}
};
LC.calculate=function(input,materials,machine){
 const m=materials.find(x=>x.id===input.materialId)||materials[0]||LC.DEFAULT_MATERIALS[0],q=Math.max(1,+input.quantity||1),geo=LC.calcGeometry(input),scope=input.geometryScope||"unit",mult=scope==="batch"?1:q;
 const thickness=+m.thickness||0,density=+m.density||0,marginMm=+machine.wasteMarginMm||0;
 const areaForWeight=((geo.widthMm||0)+marginMm)*((geo.heightMm||0)+marginMm)/1e6;
 const fallbackArea=geo.netAreaMm2/1e6;
 const areaM2=(machine.areaBasis==="net"||!geo.widthMm||!geo.heightMm)?fallbackArea:areaForWeight;
 const weightUnit=areaM2*thickness*density,weightTotal=weightUnit*mult;
 const materialCostRaw=weightUnit*(+m.pricePerKg||0)*mult;
 const materialMargin=materialCostRaw*(+machine.materialMargin/100||0);
 const designCost=(+input.designTimeMin||0)/60*(+machine.designRate||0);
 const setupCost=(+input.setupTimeMin||0)/60*(+machine.setupRate||0);
 const estimatedCutting=(geo.perimeterMm/(+m.speed||1)/60)*1000 + (geo.pierces||0)*(+machine.pierceTime||0);
 const cuttingMinTotal=(input.realCuttingTimeMin!=null&&input.realCuttingTimeMin!=="")?+input.realCuttingTimeMin:estimatedCutting*mult;
 const machineCost=cuttingMinTotal/60*(+machine.hourlyRate||0);
 const gasCost=(input.gas==="Nenhum"?0:cuttingMinTotal/60*(+machine.gasRate||0));
 const consumables=+machine.consumablesPerOrder||0;
 const costTotal=materialCostRaw+designCost+setupCost+machineCost+gasCost+consumables;
 const salePrice=costTotal+materialMargin+(+input.adjustment||0);
 const marginEuro=salePrice-costTotal,marginPct=salePrice?marginEuro/salePrice*100:0;
 return {material:m,geo,quantity:q,multiplier:mult,weightUnit,weightTotal,materialCostRaw,materialMargin,designCost,setupCost,estimatedCuttingTimeMin:estimatedCutting*mult,cuttingTimeMin:cuttingMinTotal,machineCost,gasCost,consumables,costTotal,salePrice,marginEuro,marginPct,perPiece:salePrice/q,scope,gas:m.gas||""};
};

LC.orderFromForm=function(form,calc){
 const now=new Date().toISOString();
 return {id:form.id||crypto.randomUUID(),orderNumber:form.orderNumber,client:form.client,orderName:form.orderName,clientReference:form.clientReference||"",createdAt:form.createdAt||now,status:form.status||"quote",quantity:calc.quantity,mode:form.mode,geometryScope:form.geometryScope,dxfFileName:form.dxfFileName||"",dxfText:form.dxfText||"",manual:form.manual||null,materialId:form.materialId,materialSnapshot:calc.material,machineSnapshot:form.machineSnapshot,costSnapshot:Object.assign({},calc,{geoSnapshot:calc.geo}),setupInputs:{designTimeMin:+form.designTimeMin||0,setupTimeMin:+form.setupTimeMin||0,drawingType:form.drawingType},adjustment:+form.adjustment||0,adjustmentReason:form.adjustmentReason||"",comments:form.comments||"",production:form.production||null,updatedAt:now};
};
LC.statusLabel=s=>({quote:"Orçamento",accepted:"Aceite",production:"Em produção",done:"Concluído",cancelled:"Cancelado"}[s]||s);
LC.statusClass=s=>({quote:"quote",accepted:"accepted",production:"production",done:"done",cancelled:"cancelled"}[s]||"quote");
LC.formatDate=s=>{if(!s)return"—";try{return new Date(s).toLocaleDateString("pt-PT")}catch(e){return"—"}};
LC.makePrint=({type,order,calc,checks=[]})=>{
 const prod=order.production||{}, internal=type==="internal";
 let html=`<div class="print-header"><h1>JGPVC LASER</h1><div>${internal?"FICHA INTERNA — CUSTOS":"ORDEM DE PRODUÇÃO"}</div></div>`;
 html+=`<table><tr><th>Nº</th><td>${esc(order.orderNumber)}</td><th>Data</th><td>${LC.formatDate(order.createdAt)}</td></tr><tr><th>Cliente</th><td>${esc(order.client)}</td><th>Peça</th><td>${esc(order.orderName)}</td></tr><tr><th>Referência</th><td>${esc(order.clientReference||"")}</td><th>Quantidade</th><td>${order.quantity}</td></tr></table>`;
 html+=`<h2>MATERIAL</h2><table><tr><th>Material</th><td>${esc(calc.material.name)}</td><th>Espessura</th><td>${num(calc.material.thickness,1)} mm</td></tr><tr><th>Peso unitário</th><td>${num(calc.weightUnit,3)} kg</td><th>Peso total</th><td>${num(calc.weightTotal,3)} kg</td></tr></table>`;
 if(internal){html+=`<h2>CUSTOS</h2><table><tr><td>Material</td><td>${eur(calc.materialCostRaw)}</td></tr><tr><td>Margem material</td><td>${eur(calc.materialMargin)}</td></tr><tr><td>Desenho</td><td>${eur(calc.designCost)}</td></tr><tr><td>Setup</td><td>${eur(calc.setupCost)}</td></tr><tr><td>Máquina</td><td>${eur(calc.machineCost)}</td></tr><tr><td>Gás</td><td>${eur(calc.gasCost)}</td></tr><tr><td>Consumíveis</td><td>${eur(calc.consumables)}</td></tr><tr><th>CUSTO TOTAL</th><th>${eur(calc.costTotal)}</th></tr><tr><th>PREÇO FINAL</th><th>${eur(calc.salePrice)}</th></tr><tr><th>MARGEM</th><th>${eur(calc.marginEuro)} (${num(calc.marginPct,1)}%)</th></tr></table>`}
 html+=`<h2>PRODUÇÃO</h2><table><tr><th>Operador</th><td>${esc(prod.operator||"")}</td><th>Máquina</th><td>${esc(prod.machine||calc.material.gas||"")}</td></tr><tr><th>Tempo previsto</th><td>${num(calc.estimatedCuttingTimeMin,1)} min</td><th>Tempo real</th><td>${prod.realTime?num(prod.realTime,1)+" min":"—"}</td></tr><tr><th>Produzidas</th><td>${prod.produced??""}</td><th>Boas / Rejeitadas</th><td>${prod.good??""} / ${prod.rejected??""}</td></tr></table>`;
 if(!internal){html+=`<h2>CHECKLIST</h2>`+(checks.length?checks.map(c=>`<div class="checkline">☐ ${esc(c)}</div>`).join(""):`<div class="checkline">☐ Material confirmado</div><div class="checkline">☐ Ficheiro carregado</div><div class="checkline">☐ Primeira peça verificada</div><div class="checkline">☐ Produção concluída</div>`)}
 html+=`<h2>OBSERVAÇÕES</h2><div style="border:1px solid #bbb;min-height:65px;padding:8px;font-size:11px">${esc(order.comments||prod.notes||"")}</div><div class="signature">Operador: ____________________ &nbsp;&nbsp;&nbsp; Data: __________</div>`;
 return html;
};
window.LC=LC;
})();
