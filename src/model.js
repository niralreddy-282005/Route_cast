const SEATS=40,STEP=15,T0=360,T1=1320,NB=(T1-T0)/STEP+1,TARGET=0.75,KMH=22,DWELL=6;
const LON0=78.32,LAT1=17.515,COS=Math.cos(17.45*Math.PI/180),KPX=5241,PXKM=KPX/111.19;
const proj=(lon,lat)=>[(lon-LON0)*COS*KPX,(LAT1-lat)*KPX];
const STOPS=[
 {name:'Financial District',ll:[78.3414,17.4175],p:[10,48,8,5]},
 {name:'Gachibowli',ll:[78.3489,17.4400],p:[28,34,10,7]},
 {name:'HITEC City',ll:[78.3772,17.4435],p:[18,46,14,8]},
 {name:'Raidurg Metro',ll:[78.3827,17.4440],p:[36,40,10,8]},
 {name:'Madhapur',ll:[78.3908,17.4486],p:[30,32,14,8]},
 {name:'Kondapur',ll:[78.3640,17.4600],p:[34,22,10,7]},
 {name:'Inorbit Mall',ll:[78.3870,17.4335],p:[14,26,24,6]},
 {name:'Jubilee Hills',ll:[78.4071,17.4326],p:[26,24,12,7]},
 {name:'Ameerpet',ll:[78.4482,17.4375],p:[52,16,10,9]},
 {name:'Banjara Hills',ll:[78.4347,17.4156],p:[20,18,16,6]},
 {name:'KPHB Colony',ll:[78.3996,17.4948],p:[50,12,8,7]}];
const ROUTES=[
 {id:'R1',name:'Financial District – Jubilee Hills',way:[0,[78.3430,17.4290],1,[78.3620,17.4425],2,4,[78.3985,17.4420],7]},
 {id:'R2',name:'Kondapur – Ameerpet',way:[5,[78.3705,17.4510],2,6,7,[78.4200,17.4260],9,[78.4440,17.4260],8]},
 {id:'R3',name:'KPHB – Gachibowli',way:[10,[78.3990,17.4780],[78.3800,17.4690],5,[78.3700,17.4500],3,[78.3650,17.4415],1]}];
STOPS.forEach(s=>s.xy=proj(s.ll[0],s.ll[1]));
ROUTES.forEach(r=>{r.pts=r.way.map(w=>typeof w==='number'?STOPS[w].xy:proj(w[0],w[1]));
 r.stops=r.way.filter(w=>typeof w==='number');
 let L=0,cum=[0];for(let i=1;i<r.pts.length;i++){L+=Math.hypot(r.pts[i][0]-r.pts[i-1][0],r.pts[i][1]-r.pts[i-1][1]);cum.push(L);}
 r.len=L;r.km=L/PXKM*1.25; // 1.25 = road winding factor
 r.cycle=Math.round(2*r.km/KMH*60+2*DWELL);
 r.frac=r.way.map((w,i)=>typeof w==='number'?cum[i]/L:null).filter(v=>v!==null);
 r.d='M'+r.pts.map(p=>p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' L');});
STOPS.forEach((s,i)=>{s.routes=ROUTES.map((r,k)=>r.stops.indexOf(i)>=0?k:-1).filter(k=>k>=0);});
const BASE=4,MINF=3,MAXF=10;
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}}
const g=(x,mu,s)=>Math.exp(-((x-mu)*(x-mu))/(2*s*s));
const DS=0.55;
const pattern=(i,m)=>DS*(STOPS[i].p[0]*g(m,510,55)+STOPS[i].p[1]*g(m,1080,70)+STOPS[i].p[2]*g(m,780,60)+STOPS[i].p[3]);
const ACTUAL=[],FORECAST=[];
(function(){const r=rng(2026);STOPS.forEach((s,i)=>{const a=[],f=[];
 for(let b=0;b<NB;b++){const base=pattern(i,T0+b*STEP),n1=(r()+r()+r()-1.5)/0.75,n2=(r()-0.5)*2;
  a.push(Math.max(0,Math.round(base*(1+0.16*n1))));f.push(Math.max(0,Math.round(base*(1+0.05*n1+0.05*n2))));}
 ACTUAL.push(a);FORECAST.push(f);});})();
const bin=m=>Math.max(0,Math.min(NB-1,Math.round((m-T0)/STEP)));
const perVeh=r=>SEATS*15/ROUTES[r].cycle;
const REC=ROUTES.map((R,r)=>Array.from({length:NB},(_,b)=>{let need=0;R.stops.forEach(s=>{need=Math.max(need,FORECAST[s][b]/STOPS[s].routes.length/(perVeh(r)*TARGET));});return Math.max(MINF,Math.min(MAXF,Math.ceil(need)));}));
const fleetR=(mode,r,m)=>mode==='rc'?REC[r][bin(m)]:BASE;
const fleetTotal=(mode,m)=>ROUTES.reduce((a,_,r)=>a+fleetR(mode,r,m),0);
const capStop=(mode,s,m)=>STOPS[s].routes.reduce((a,r)=>a+fleetR(mode,r,m)*perVeh(r),0);
const mm=m=>Math.min(T1,m);
const load=(mode,s,m)=>FORECAST[s][bin(mm(m+30))]/capStop(mode,s,mm(m+30));
function waitStop(mode,s,b){const m=T0+b*STEP,rate=STOPS[s].routes.reduce((a,r)=>a+fleetR(mode,r,m)/ROUTES[r].cycle,0),h=1/rate,l=ACTUAL[s][b]/capStop(mode,s,m);return h/2+Math.min(20,Math.max(0,l-1)*h);}
function dayStats(mode){let dw=0,d=0,pw=0,pd=0,veh=0,tot=0,cap=0;
 for(let b=0;b<NB;b++){const m=T0+b*STEP;veh+=fleetTotal(mode,m)*STEP/60;
  for(let s=0;s<STOPS.length;s++){const w=waitStop(mode,s,b),a=ACTUAL[s][b];dw+=w*a;d+=a;tot+=a;cap+=capStop(mode,s,m);
   if((m>=450&&m<=570)||(m>=1020&&m<=1140)){pw+=w*a;pd+=a;}}}
 return {avgWait:dw/d,peakWait:pw/pd,vehHours:veh,util:Math.min(1,tot/cap)};}
const accuracy=i=>{let e=0,s=0;for(let b=0;b<NB;b++){e+=Math.abs(ACTUAL[i][b]-FORECAST[i][b]);s+=ACTUAL[i][b];}return 1-e/s;};
if(typeof module!=='undefined')module.exports={STOPS,ROUTES,ACTUAL,FORECAST,REC,dayStats,accuracy,NB,T0,STEP,capStop,fleetR};
