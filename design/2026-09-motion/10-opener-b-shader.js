/* 10 · B — Ink bloom 墨晕: GLSL (ES 1.00, WebGL1). One full-rect pass; everything is in image
   pixels (1448 × 1086), so the look is resolution-independent and moves with the sheet.
   Terms, in paint order:
     drawing   the desk composite, revealed where the ink has arrived (arrival map, R+G = 16-bit T)
     wash      each drop's bloom (B = depth): dilute ink, a dark wet leading edge and a coffee-ring
               rim, granulation and wet fibres; then it dries as a crisp wet island shrinking back
               toward its drop (rims and seams first), lightening, a thin tide line on its edge
     feather   wet lines bleed sideways into the paper for a moment after the ink reaches them
     splash    each drop's anticipation shadow + impact blot + crown droplets (stepped, 12 fps)
     colour    four pigment events: coloured pixels stay ink-grey until their drop lands, then a
               pale watercolour bloom with a hard darker edge spreads, contracts and dries
   End state (t ≥ uDry.z, or uSkip = 1) is exactly the composite over paper: no transient left. */
window.OB_SHADER = {
  vs: 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}',
  fs: [
    'precision highp float;',
    'uniform vec2 uRes;uniform vec4 uRect;uniform float uT,uMode,uTex,uSkip;',
    'uniform sampler2D uDesk,uMap,uNoise;uniform vec2 uMapRes,uDeskRes;',
    'uniform vec4 uDrop[4];uniform vec4 uCol[4];uniform vec3 uColRGB[4];uniform vec3 uDry;uniform vec3 uPaper;',
    'const vec2 IMG=vec2(1448.,1086.);const float MARGIN=160.,SCALE=4.,TMAX=2.4;',
    'const vec3 INK=vec3(.2,.178,.155);const vec3 LW=vec3(.3,.59,.11);',
    'vec4 N(vec2 p){return texture2D(uNoise,p/256.);}',                  // p in noise texels
    'float nz(vec2 p){return N(p).r;}',
    'float h1(float n){return fract(sin(n*78.233)*43758.5453);}',
    'float decT(vec3 m){float v=floor(m.r*255.+.5)*256.+floor(m.g*255.+.5);return v>65534.5?6.:v/65504.*TMAX;}',
    // arrival map: manual bilinear on decoded texels + analytic gradients (per image px)
    'void mapAt(vec2 ip,out float T,out vec2 gT,out float W,out vec2 gW){',
    '  vec2 mp=(ip+MARGIN)/SCALE-.5;vec2 i0=floor(mp);vec2 f=mp-i0;vec2 px=1./uMapRes;vec2 uv=(i0+.5)*px;',
    '  if(mp.x<0.||mp.y<0.||mp.x>uMapRes.x-2.||mp.y>uMapRes.y-2.){T=6.;gT=vec2(1.);W=0.;gW=vec2(0.);return;}',
    '  vec3 a=texture2D(uMap,uv).rgb,b=texture2D(uMap,uv+vec2(px.x,0.)).rgb,c=texture2D(uMap,uv+vec2(0.,px.y)).rgb,d=texture2D(uMap,uv+px).rgb;',
    '  float ta=decT(a),tb=decT(b),tc=decT(c),td=decT(d);',
    '  T=mix(mix(ta,tb,f.x),mix(tc,td,f.x),f.y);',
    '  gT=vec2(mix(tb-ta,td-tc,f.y),mix(tc-ta,td-tb,f.x))/SCALE;',
    '  W=mix(mix(a.b,b.b,f.x),mix(c.b,d.b,f.x),f.y);',
    '  gW=vec2(mix(b.b-a.b,d.b-c.b,f.y),mix(c.b-a.b,d.b-b.b,f.x))/SCALE;}',
    'vec3 over(vec4 d){return d.rgb+(1.-d.a)*uPaper;}',
    'void main(){',
    '  vec2 fc=vec2(gl_FragCoord.x,uRes.y-gl_FragCoord.y);',
    '  vec2 tuv=(fc-uRect.xy)/uRect.zw;vec2 ip=tuv*IMG;',
    '  float E=max(smoothstep(uDry.z-.28,uDry.z,uT),uSkip);',          // end forcing
    // paper: front wiggle, lobes, fibres (two orientations), pigment grain
    '  float fn=nz(ip/41.)*.62+nz(ip/13.+7.3)*.38;',
    '  float lobe=nz(ip/260.+3.1)*.6+nz(ip/97.+1.7)*.4;',
    '  vec2 wq=ip+14.*vec2(nz(ip/23.+5.),nz(ip/23.+9.))-7.;',               // warped, so fibres curl
    '  vec2 q=mat2(.94,.34,-.34,.94)*wq;vec2 q2=mat2(.5,-.87,.87,.5)*wq;',
    '  float fib=max(N(q*vec2(1./11.,1./1.5)).g,N(q2*vec2(1./9.,1./1.4)+37.).b*.9);',
    '  fib=smoothstep(.7,.92,fib);',
    '  float gr=N(ip/3.3).a;',
    '  float T,W;vec2 gT,gW;',
    '  if(uMode<.5)mapAt(ip,T,gT,W,gW);',
    '  else{',                                                              // returning: one centred drop
    '    vec2 dv=(ip-uDrop[0].xy)/vec2(820.,650.);float L=length(dv);vec2 u=dv/max(L,1e-4)/735.;',
    '    float dn=L*(1.+(lobe-.5)*.5+(fn-.5)*.12);T=uDrop[0].z+.2*dn*dn;gT=u*.4*dn;',   // the reveal runs on past the wash
    '    float dw=L*(1.+(lobe-.5)*.2)/.95;W=dw<1.?(1.+254.*(1.-dw))/255.:0.;gW=-u*(254./255./.95);}',  // the wash stays on the sheet
    '  float gi=max(length(gT),1e-5);float gn=min(gi,.02);',              // s per image px (gn: capped for noise)
    '  float Te=T+gn*(10.*(fn-.5)-5.*fib);',                               // ragged by px (fibre fingers), not by ms
    '  float a=uT-Te;',
    '  float dS=a/gi;float dF=max(dS,0.);',             // image px behind the front
    '  float rv=smoothstep(-.5,2.5,dS);',                                  // a crisp front at any speed
    // wash inside the finite bloom
    '  float wd=(W*255.-1.)/254.;float wdp=max(wd,0.);',
    '  float inside=step(.0004,W)*smoothstep(.15,.6,W*255.+.9*(fib-.35)+.3*(fn-.5));',
    // drying: a crisp wet island shrinks back toward the drop; dd = image px from its edge (wet > 0)
    '  float dryT=uDry.x+uDry.y*pow(wdp,.6)+.02*(fn-.5);',
    '  float gD=uDry.y*.6*pow(max(wdp,.02),-.4)*length(gW)*255./254.;',
    '  float dd=(dryT-uT)/max(gD,1e-6)+9.*(fn-.5)-3.*fib;',               // ragged by px, hides the map grid
    '  float dry=1.-smoothstep(-1.,1.5,dd);',
    '  float Lt=smoothstep(uDry.x-.2,uDry.x+uDry.y,uT);',
    '  float wet=rv*(1.-dry);',
    '  float base=mix(uMode<.5?.075+.16*pow(wdp,1.4):.1+.05*wdp,.05+.03*wdp,Lt)*(1.-.35*Lt*Lt);',
    '  float rim=(1.-smoothstep(0.,.035,wdp))*smoothstep(.0,.4,a)*.26;',
    '  float front=exp(-dF/8.)*.34*step(0.,a);',
    '  float tide=exp(-max(dd,0.)/3.5)*.22*smoothstep(uDry.x-.08,uDry.x+.02,uT);',
    '  float tx=mix(.85+.3*gr,.95+.1*gr,Lt);',
    '  float dens=inside*wet*((base+rim+front+tide)*tx+.035*fib*(1.-Lt));',
    // splash: anticipation shadow, impact blot, crown droplets — held poses on the hand's clock
    '  float sp=0.;',
    '  for(int i=0;i<4;i++){',
    '    vec4 dr=uDrop[i];if(dr.w<=0.)continue;',
    '    vec2 dv=ip-dr.xy;float d=length(dv);float s=uT-dr.z;float r0=dr.w;',
    '    if(s<-.13||s>2.2||d>r0*5.5)continue;',                             // cull: nothing of this drop out here
    '    float sq=floor(s*12.)/12.;',
    '    if(s<0.){float k=s<-.066?0.:1.;float rr=r0*mix(1.7,1.05,k);sp=max(sp,(.06+.07*k)*(1.-smoothstep(rr*.45,rr,d)));continue;}',
    '    float ang=atan(dv.y,dv.x);float en=nz(vec2(cos(ang),sin(ang))*1.7+dr.xy*.37);',
    '    float grow=sq<.08?1.:sq<.16?1.2:1.2+.95*sqrt(s-.16);',
    '    float br=r0*grow*(1.+.3*(en-.5));float rl=smoothstep(.16,.7,s);',   // rl: the blot relaxing into a mini-bloom
    '    float bd=(sq<.16?.93:.93*exp(-(s-.16)/.34))*(1.-dry);',
    '    float bin=1.-smoothstep(br-1.8,br,d);',
    '    sp=max(sp,bd*bin*(1.-.35*rl+.5*rl*smoothstep(br-6.,br-1.,d)));',
    '    for(int k=0;k<9;k++){',
    '      float fk=float(k)+float(i)*11.;',
    '      float th=6.2832*(float(k)+.7*h1(fk))/9.;float rho=r0*(1.45+1.6*h1(fk+3.1));',
    '      float rad=r0*(.07+.17*h1(fk+5.7))*(sq<.08?1.:1.3)*(1.+.9*sqrt(max(s-.16,0.)));',
    '      vec2 c=dr.xy+rho*vec2(cos(th),sin(th));',
    '      if(length(ip-c)>rad*3.5)continue;',
    '      if(h1(fk+9.2)>.72){vec2 u=normalize(c-dr.xy);vec2 w=ip-c;float along=dot(w,u),acr=dot(w,vec2(-u.y,u.x));',
    '        float len=rad*(sq<.08?3.2:2.2);float e=length(vec2(along/len,acr/(rad*.55)));',
    '        sp=max(sp,.85*(1.-smoothstep(.75,1.,e))*(sq<.16?1.:exp(-(s-.16)/.4))*(1.-dry));}',
    '      else{vec2 w=ip-c;float cd=length(w);float sa=nz(w/max(cd,1e-3)*1.3+fk*5.1);float rr=rad*(.8+.4*sa);',
    '        float sd=.86*(sq<.16?1.:exp(-(s-.16)/.42))*(1.-dry);',
    '        sp=max(sp,sd*(1.-smoothstep(rr-1.2,rr,cd))*(1.-.4*rl+.45*rl*smoothstep(rr-3.,rr-.6,cd)));}',
    '    }',
    '  }',
    // drawing, with coloured pixels held in ink-grey until their pigment arrives
    '  vec4 D=texture2D(uDesk,tuv)*step(0.,tuv.x)*step(tuv.x,1.)*step(0.,tuv.y)*step(tuv.y,1.);',
    '  vec3 c=D.rgb/max(D.a,.001);',
    '  float k=abs(c.g-.5*(c.r+c.b));float cm=smoothstep(.028,.065,k)*step(.04,D.a);',
    '  float cp=0.,cv=0.;vec3 halo=vec3(1.);',
    '  for(int j=0;j<4;j++){',
    '    vec4 ev=uCol[j];if(ev.w<=0.)continue;',
    '    float dj=length(ip-ev.xy)/ev.w;if(dj>1.8)continue;float jn=nz(ip/(ev.w*.55)+float(j)*3.7);',
    '    float djc=dj*(1.+.22*(jn-.5)+.12*(fn-.5));',
    '    float tj=ev.z+.2*djc*djc;float cj=smoothstep(tj,tj+.07,uT);cp=max(cp,cj);cv=max(cv,cj*(1.-smoothstep(.95,1.1,dj)));',
    '    float s=uT-ev.z;if(s<-.1||s>.6)continue;',
    '    float hs=min(1.1,50./ev.w);float djn=dj*(1.+.42*(jn-.5)+.12*(fn-.5))/hs;',  // halo size in motif radii; smooth organic edge
    '    if(s<0.){halo*=mix(vec3(1.),uColRGB[j]/uPaper,.14*(1.-smoothstep(.18,.3,djn)));continue;}',   // the pigment drop's shadow
    '    float sq=floor(s*12.)/12.;',
    '    float wetj=1.-smoothstep(.22,.44,s);',
    '    float R=sqrt(clamp(s/.18,0.,1.))*(1.-.25*smoothstep(.15,.4,s));',
    '    float body=1.-smoothstep(R-.025,R,djn);float ring=body*smoothstep(R-.1,R-.015,djn);',
    '    float hd=(body*(.2-.07*djn)+ring*.36)*wetj+(sq<.084?.66*(1.-smoothstep(.14,.19,djn)):0.);',
    '    halo*=mix(vec3(1.),uColRGB[j]/uPaper,clamp(hd,0.,1.));',
    '  }',
    '  if(uMode>.5)cp=1.;',
    '  cp=max(cp,E);',
    '  vec3 sep=mix(vec3(.36,.345,.33),uPaper,clamp((dot(c,LW)-.3)/.64,0.,1.));',
    '  c=mix(c,mix(sep,c,cp),cm);',
    '  float rvD=max(max(rv,cv),E)*uTex;',
    // wet lines: spread, darker, and bleeding sideways while the ink under them is wet
    '  float lineDry=smoothstep(Te+.3,Te+.9,uT);',
    '  float lw=rv*(1.-mix(lineDry,dry,inside))*(1.-E);',
    '  vec3 C0=over(vec4(c*D.a,D.a));',
    '  if(lw>.01){vec2 o=1.3/uDeskRes;vec2 o2=vec2(4.2)/IMG;',
    '    vec3 bl=(over(texture2D(uDesk,tuv+o))+over(texture2D(uDesk,tuv-o))+over(texture2D(uDesk,tuv+vec2(o.x,-o.y)))+over(texture2D(uDesk,tuv+vec2(-o.x,o.y))))*.25;',
    '    bl=mix(vec3(dot(bl,LW))*vec3(1.01,.99,.955),bl,cp);',
    '    vec4 f1=texture2D(uDesk,tuv+vec2(o2.x,0.)),f2=texture2D(uDesk,tuv-vec2(o2.x,0.)),f3=texture2D(uDesk,tuv+vec2(0.,o2.y)),f4=texture2D(uDesk,tuv-vec2(0.,o2.y));',
    '    float fe=(f1.a-dot(f1.rgb,LW)+f2.a-dot(f2.rgb,LW)+f3.a-dot(f3.rgb,LW)+f4.a-dot(f4.rgb,LW))*.25;',
    '    C0=mix(C0,min(C0,bl),lw*.75);C0=mix(C0,C0*C0/uPaper,lw*.45);',
    '    dens=max(dens,clamp(fe*1.6,0.,.2)*lw*(.85+.3*gr));}',
    '  dens=1.-(1.-dens)*(1.-sp);',
    '  vec3 C=mix(uPaper,C0,rvD);',
    '  dens*=(1.-E);',
    '  C*=mix(vec3(1.),INK/uPaper,clamp(dens,0.,1.));',
    '  C*=mix(vec3(1.),halo,1.-E);',
    // premultiplied output over the page's own paper
    '  vec3 rat=C/uPaper;float oa=max(D.a*rvD,1.-min(min(rat.r,rat.g),rat.b));oa=clamp(oa,0.,1.);',
    '  gl_FragColor=vec4(clamp(C-(1.-oa)*uPaper,0.,oa),oa);',
    '}'
  ].join('\n')
};
