
(() => {
  'use strict';

  const MAX_DROPS = 32;
  const MAX_PILLS = 4;
  const MARGIN = 72;

  const VERTEX = `#version 300 es
  in vec2 aPosition;
  void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }`;

  const FRAGMENT = `#version 300 es
  precision highp float;

  uniform vec2 uSize;
  uniform float uRatio;
  uniform vec4 uPills[4];
  uniform vec4 uDrops[32];
  uniform vec2 uTails[32];
  uniform int uCount;
  uniform float uSmooth;
  uniform vec3 uPill;
  uniform float uShadow;

  out vec4 outColor;

  float sdPill(vec2 p, vec4 b) {
    vec2 e = max(b.zw, vec2(0.0));
    float r = min(e.x, e.y);
    vec2 q = abs(p - b.xy) - e + r;
    return length(max(q, 0.0)) +
      min(max(q.x, q.y), 0.0) - r;
  }

  float sdCapsule(vec2 p, vec2 a, vec2 b, float r) {
    vec2 pa = p-a;
    vec2 ba = b-a;
    float h = clamp(dot(pa,ba)/max(dot(ba,ba),0.0001),0.0,1.0);
    return length(pa-ba*h)-r;
  }

  float blend(float a, float b, float k) {
    float h = clamp(0.5+0.5*(b-a)/k,0.0,1.0);
    return mix(b,a,h)-k*h*(1.0-h);
  }

  void main() {
    vec2 p = vec2(gl_FragCoord.x,
      uSize.y*uRatio-gl_FragCoord.y)/uRatio;

    float d = 100000.0;

    for(int i=0;i<4;i++) {
      vec4 b=uPills[i];
      if(b.z>0.0) d=blend(d,sdPill(p,b),uSmooth);
    }

    for(int i=0;i<32;i++) {
      if(i>=uCount) break;
      vec4 b=uDrops[i];
      float v=sdCapsule(p,b.xy,b.xy-uTails[i],b.z);
      if(b.z>0.0 && v<d+uSmooth) d=blend(d,v,uSmooth);
    }

    float aa=max(fwidth(d),0.35);
    float body=clamp(0.5-d/aa,0.0,1.0);

    vec2 grad=vec2(dFdx(d),-dFdy(d));
    vec2 n=length(grad)>0.0001?normalize(grad):vec2(0.0,1.0);

    float rim=(1.0-smoothstep(0.0,1.6,-d))*max(0.0,-n.y)*0.3;
    vec3 fill=mix(uPill,vec3(1.0),rim);

    float shadow=(1.0-smoothstep(-3.0,9.0,d))*uShadow*(1.0-body);

    outColor=vec4(fill*body,body);
    outColor.rgb+=vec3(0.0)*shadow;
    outColor.a=max(outColor.a,shadow);
  }`;

  const THEMES = {
    dark: {
      frame: 'rgba(38,35,46,.66)',
      edge: 'rgba(255,255,255,.08)',
      ink: '#f4f4f5',
      muted: 'rgba(244,244,245,.62)',
      pill: '#f4f4f5'
    },
    light: {
      frame: 'rgba(240,240,243,.8)',
      edge: 'rgba(24,24,27,.07)',
      ink: '#27272a',
      muted: 'rgba(39,39,42,.62)',
      pill: '#27272a'
    }
  };

  function hex(value) {
    const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value);
    if (!m) return [1,1,1];

    let s=m[1];
    if(s.length===3) s=s.replace(/./g,c=>c+c);

    return [0,2,4].map(i=>parseInt(s.slice(i,i+2),16)/255);
  }

  function shader(gl,type,source) {
    const s=gl.createShader(type);
    gl.shaderSource(s,source);
    gl.compileShader(s);

    if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(s));
      return null;
    }

    return s;
  }

  function init(nav) {
    if(nav.dataset.gooeyReady) return;

    const list=nav.querySelector('.rubber-nav__list');
    if(!list) return;

    nav.dataset.gooeyReady='true';

    const links=[...list.querySelectorAll('.rubber-nav__link')];
    if(!links.length) return;

    const theme=document.documentElement.dataset.theme==='light'?'light':'dark';
    const palette=THEMES[theme];

    nav.style.setProperty('--rn-pill',palette.pill);
    nav.style.setProperty('--rn-ink',palette.muted);
    nav.style.setProperty('--rn-ink-active',theme==='dark'?'#18161d':'#ffffff');
    nav.style.background=palette.frame;

    const canvas=document.createElement('canvas');
    canvas.className='rubber-nav__canvas';
    canvas.setAttribute('aria-hidden','true');

    const overlay=list.cloneNode(true);
    overlay.className='rubber-nav__list rubber-nav__list--active';
    overlay.setAttribute('aria-hidden','true');

    overlay.querySelectorAll('a,button').forEach(el=>{
      el.removeAttribute('href');
      el.removeAttribute('id');
      el.removeAttribute('aria-current');
      el.tabIndex=-1;
    });

    nav.append(canvas,overlay);

    const fallback=document.createElement('span');
    fallback.className='rubber-nav__fallback';
    nav.appendChild(fallback);

    const gl=canvas.getContext('webgl2',{
      alpha:true,
      premultipliedAlpha:true,
      antialias:false
    });

    let program=null;
    let uniforms={};
    let buffer=null;
    let position=-1;

    if(gl) {
      const vs=shader(gl,gl.VERTEX_SHADER,VERTEX);
      const fs=shader(gl,gl.FRAGMENT_SHADER,FRAGMENT);

      if(vs&&fs) {
        program=gl.createProgram();
        gl.attachShader(program,vs);
        gl.attachShader(program,fs);
        gl.linkProgram(program);

        if(gl.getProgramParameter(program,gl.LINK_STATUS)) {
          buffer=gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
          gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([
            -1,-1,1,-1,-1,1,1,1
          ]),gl.STATIC_DRAW);

          position=gl.getAttribLocation(program,'aPosition');

          [
            'uSize','uRatio','uPills','uDrops',
            'uTails','uCount','uSmooth','uPill','uShadow'
          ].forEach(name=>{
            uniforms[name]=gl.getUniformLocation(program,name);
          });
        } else {
          program=null;
        }
      }
    }

    canvas.style.display=program?'block':'none';

    const reduced=window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    let active=Math.max(0,links.findIndex(
      link=>link.classList.contains('is-active')
    ));

    let rects=[];
    let width=0;
    let height=0;
    let raf=0;
    let last=0;
    let drops=[];
    let pillPosition=null;
    let disposed=false;

    function measure() {
      const r=nav.getBoundingClientRect();
      width=r.width;
      height=r.height;

      const ratio=Math.min(window.devicePixelRatio||1,2);

      canvas.width=Math.max(1,Math.round((width+MARGIN*2)*ratio));
      canvas.height=Math.max(1,Math.round((height+MARGIN*2)*ratio));

      canvas.style.left=-MARGIN+'px';
      canvas.style.top=-MARGIN+'px';
      canvas.style.width=width+MARGIN*2+'px';
      canvas.style.height=height+MARGIN*2+'px';

      rects=links.map(link=>{
        const b=link.getBoundingClientRect();
        return {
          x:b.left-r.left,
          y:b.top-r.top,
          w:b.width,
          h:b.height
        };
      });

      render();
    }

    function roundedPath(b) {
      const r=Math.min(b.w,b.h)/2;
      return `M${b.x+r},${b.y}H${b.x+b.w-r}A${r},${r} 0 0 1 ${b.x+b.w},${b.y+r}V${b.y+b.h-r}A${r},${r} 0 0 1 ${b.x+b.w-r},${b.y+b.h}H${b.x+r}A${r},${r} 0 0 1 ${b.x},${b.y+b.h-r}V${b.y+r}A${r},${r} 0 0 1 ${b.x+r},${b.y}Z`;
    }

    function render() {
      if(!rects.length||!rects[active]) return;

      const b=rects[active];

      if(!program||!gl) {
        fallback.style.display='block';
        fallback.style.left=b.x+'px';
        fallback.style.top=b.y+'px';
        fallback.style.width=b.w+'px';
        fallback.style.height=b.h+'px';
        overlay.style.clipPath=`path('${roundedPath(b)}')`;
        return;
      }

      fallback.style.display='none';

      const pillData=new Float32Array(MAX_PILLS*4);
      const dropData=new Float32Array(MAX_DROPS*4);
      const tailData=new Float32Array(MAX_DROPS*2);

      if(pillPosition) {
        pillData[0]=pillPosition.x+MARGIN;
        pillData[1]=pillPosition.y+MARGIN;
        pillData[2]=pillPosition.w/2;
        pillData[3]=pillPosition.h/2;
      }

      pillData[4]=b.x+b.w/2+MARGIN;
      pillData[5]=b.y+b.h/2+MARGIN;
      pillData[6]=b.w/2;
      pillData[7]=b.h/2;

      drops.forEach((d,i)=>{
        if(i>=MAX_DROPS)return;
        dropData[i*4]=d.x+MARGIN;
        dropData[i*4+1]=d.y+MARGIN;
        dropData[i*4+2]=d.r;
        tailData[i*2]=d.tx;
        tailData[i*2+1]=d.ty;
      });

      const ratio=canvas.width/(width+MARGIN*2);

      gl.viewport(0,0,canvas.width,canvas.height);
      gl.clearColor(0,0,0,0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);

      gl.uniform2f(uniforms.uSize,width+MARGIN*2,height+MARGIN*2);
      gl.uniform1f(uniforms.uRatio,ratio);
      gl.uniform4fv(uniforms.uPills,pillData);
      gl.uniform4fv(uniforms.uDrops,dropData);
      gl.uniform2fv(uniforms.uTails,tailData);
      gl.uniform1i(uniforms.uCount,drops.length);
      gl.uniform1f(uniforms.uSmooth,height*.35);

      const c=hex(palette.pill);
      gl.uniform3f(uniforms.uPill,c[0],c[1],c[2]);
      gl.uniform1f(uniforms.uShadow,.3);

      gl.drawArrays(gl.TRIANGLE_STRIP,0,4);

      overlay.style.clipPath=`path('${roundedPath(b)}')`;
    }

    function animate(now) {
      raf=0;
      const dt=Math.min(.05,(now-last)/1000||0);
      last=now;

      drops=drops.filter(d=>now<d.end);

      drops.forEach(d=>{
        const t=Math.min(1,(now-d.start)/(d.end-d.start));
        const e=t*t*(3-2*t);
        d.x=d.sx+(d.ex-d.sx)*e;
        d.y=d.sy+(d.ey-d.sy)*e;
        d.r=8*Math.sin(Math.PI*t);
        d.tx=(d.ex-d.sx)*.025;
        d.ty=(d.ey-d.sy)*.025;
      });

      if(pillPosition) {
        const b=rects[active];
        const k=1-Math.exp(-dt/.12);
        pillPosition.x+=(b.x-pillPosition.x)*k;
        pillPosition.y+=(b.y-pillPosition.y)*k;
        pillPosition.w+=(b.w-pillPosition.w)*k;
        pillPosition.h+=(b.h-pillPosition.h)*k;

        if(Math.abs(pillPosition.x-b.x)<.2 &&
           Math.abs(pillPosition.w-b.w)<.2) {
          pillPosition=null;
        }
      }

      render();

      if(drops.length||pillPosition) {
        raf=requestAnimationFrame(animate);
      }
    }

    function wake() {
      if(raf||disposed)return;
      last=performance.now();
      raf=requestAnimationFrame(animate);
    }

    function select(index,animate=true) {
      if(index<0||index>=links.length)return;

      if(index===active) {
        render();
        return;
      }

      const from=rects[active];
      const to=rects[index];

      if(!from||!to)return;

      if(animate&&!reduced) {
        pillPosition={...from};

        const count=15;

        for(let i=0;i<count;i++) {
          const sx=from.x+from.w/2+(Math.random()-.5)*from.w*.6;
          const sy=from.y+from.h/2+(Math.random()-.5)*from.h*.25;

          drops.push({
            sx,sy,
            x:sx,y:sy,
            ex:to.x+to.w/2+(Math.random()-.5)*to.w*.45,
            ey:to.y+to.h/2+(Math.random()-.5)*to.h*.2,
            r:0,tx:0,ty:0,
            start:performance.now()+Math.random()*100,
            end:performance.now()+650+Math.random()*250
          });
        }
      } else {
        pillPosition=null;
        drops=[];
      }

      active=index;

      links.forEach((link,i)=>{
        link.classList.toggle('is-active',i===active);
        if(i===active)link.setAttribute('aria-current','page');
        else link.removeAttribute('aria-current');
      });

      wake();
      render();
    }

    links.forEach((link,index)=>{
      link.addEventListener('click',()=>{
        const target=link.getAttribute('href');

        document.querySelectorAll('.rubber-nav').forEach(other=>{
          const otherLinks=[...other.querySelectorAll('.rubber-nav__link')];
          const match=otherLinks.findIndex(
            item=>item.getAttribute('href')===target
          );

          if(match>=0&&other!==nav) {
            other._gooeySelect?.(match,false);
          }
        });

        select(index,true);
      });
    });

    nav._gooeySelect=select;

    const observer=new ResizeObserver(measure);
    observer.observe(nav);
    observer.observe(list);

    nav.addEventListener('scroll',measure,{passive:true});
    window.addEventListener('resize',measure);

    measure();

    document.fonts?.ready.then(measure);

    nav._gooeyCleanup=()=>{
      disposed=true;
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener('resize',measure);
      if(gl&&program) {
        gl.deleteBuffer(buffer);
        gl.deleteProgram(program);
      }
    };
  }

  function start() {
    document.querySelectorAll('.rubber-nav').forEach(init);

    const toggle=document.getElementById('menuToggle');

    if(toggle) {
      toggle.addEventListener('click',()=>{
        requestAnimationFrame(()=>{
          document.querySelectorAll('.rubber-nav').forEach(nav=>{
            nav._gooeySelect?.(
              Math.max(0,[...nav.querySelectorAll('.rubber-nav__link')]
                .findIndex(a=>a.classList.contains('is-active'))),
              false
            );
          });
        });
      });
    }
  }

  if(document.readyState==='loading') {
    document.addEventListener('DOMContentLoaded',start);
  } else {
    start();
  }
})();
