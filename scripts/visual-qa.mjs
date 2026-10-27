// Local Chrome QA, using the built-in Node WebSocket client. No dependencies.
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
const root = process.cwd();
const out = path.join(root, '.qa');
await mkdir(out, { recursive: true });
const mime = { '.html':'text/html', '.css':'text/css', '.js':'text/javascript', '.png':'image/png', '.gif':'image/gif', '.svg':'image/svg+xml' };
const server = createServer(async (req, res) => {
  try {
    const name = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = path.resolve(root, '.' + (name === '/' ? '/index.html' : name));
    if (!file.startsWith(root + path.sep)) throw Error('Invalid path');
    res.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
    res.end(await readFile(file));
  } catch { res.statusCode = 404; res.end('Not found'); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const port = server.address().port;
const chrome = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const profile = path.join(out, 'chrome-' + Date.now());
const child = spawn(chrome, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=0', '--user-data-dir=' + profile, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
const delay = ms => new Promise(r => setTimeout(r, ms));
let socket;
try {
  let debugPort;
  for (let i=0; i<100; i++) {
    try { debugPort = Number((await readFile(path.join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]); break; } catch { await delay(100); }
  }
  if (!debugPort) throw Error('Chrome did not expose its debugging port');
  console.log('Chrome ready on port', debugPort);
  const targets = await (await fetch(`http://127.0.0.1:${debugPort}/json/list`)).json();
  socket = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl);
  await new Promise((r,j) => { socket.onopen=r; socket.onerror=j; });
  let id=0; const pending = new Map(); const errors=[];
  socket.onmessage = e => {
    const m=JSON.parse(e.data);
    if (m.id) { const p=pending.get(m.id); pending.delete(m.id); m.error ? p?.reject(Error(m.error.message)) : p?.resolve(m.result); }
    if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails);
    if (m.method === 'Network.responseReceived' && m.params.response.status >= 400) errors.push({url:m.params.response.url,status:m.params.response.status});
  };
  const call=(method, params={}) => new Promise((resolve,reject)=>{
    const n=++id;
    const timeout=setTimeout(()=>{pending.delete(n);reject(Error('CDP timeout: '+method));},20000);
    pending.set(n,{resolve:v=>{clearTimeout(timeout);resolve(v);},reject:e=>{clearTimeout(timeout);reject(e);}});
    socket.send(JSON.stringify({id:n,method,params}));
  });
  const evaluate=async expression => {
    const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
    if(r.exceptionDetails) throw Error(JSON.stringify(r.exceptionDetails));
    return r.result.value;
  };
  await call('Runtime.enable'); await call('Network.enable'); await call('Page.enable');
  await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  await call('Page.navigate',{url:`http://127.0.0.1:${port}/`});
  for(let i=0;i<100;i++) { if(await evaluate("document.documentElement.classList.contains('app-ready')")) break; await delay(100); }
  await evaluate("document.querySelector('#intro-screen')?.remove(); document.body.classList.remove('intro-active'); Promise.race([document.fonts.ready.then(()=>true),new Promise(r=>setTimeout(r,3000))])");
  console.log('App loaded; checking viewport layouts');
  const viewports = [[320,740],[360,800],[375,812],[390,844],[412,915],[430,932],[600,960],[768,1024],[800,1280],[820,1180],[834,1194],[900,1200],[1024,768],[1180,820],[1200,800],[1280,720],[1366,768],[1440,900],[1536,864],[1600,900],[1920,1080],[2560,1440],[3840,2160],[844,390],[932,430],[933,430]];
  for (const width of [767,768,849,850,899,900,932,933,999,1000,1199,1200,1399,1400,1599,1600]) viewports.push([width,700]);
  for (const zoom of [.8,1,1.25,1.5,2]) viewports.push([Math.round(1366/zoom),Math.round(768/zoom)]);
  const shots=new Set(['390','820','1024','1366','1440','1920','844']); const results=[];
  if (process.env.QA_QUICK) viewports.length = 0;
  for(const [width,height] of viewports) {
    await call('Emulation.setDeviceMetricsOverride',{width:Math.ceil(width),height,deviceScaleFactor:1,mobile:false});
    await delay(160);
    const data=await evaluate(`(() => {
      const bounds=e=>{const r=e.getBoundingClientRect();return {x:Math.round(r.x),width:Math.round(r.width),right:Math.round(r.right)}};
      return {width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,
        overflow:[...document.querySelectorAll('body *')].filter(e=>{
          const r=e.getBoundingClientRect(),s=getComputedStyle(e);
          return r.width && s.position!=='fixed' && s.visibility!=='hidden' && (r.right>innerWidth+2 || r.left < -2)
            && !e.closest('.ticker,.contact-end-marquee,.projects-static,.case-study-modal,#intro-screen');
        }).slice(0,25).map(e=>({selector:e.tagName+'.'+e.className,...bounds(e)})),
        nav:getComputedStyle(document.querySelector('.nav-pill')).display,
        clipped:[...document.querySelectorAll('.record-content,.skill-name,.skill-desc,.faq-question,.nav-pill,.contact-item-text')].filter(e=>e.scrollWidth>e.clientWidth+2).map(e=>({selector:e.className,width:e.clientWidth,scrollWidth:e.scrollWidth})),
        sections:[...document.querySelectorAll('main>section')].map(e=>({id:e.id,height:Math.round(e.getBoundingClientRect().height)}))};
    })()`);
    results.push(data);
    console.log('Checked',width,height,'overflow:',data.overflow.length);
    if(shots.has(String(width))) {
      await evaluate('window.scrollTo(0,0)');
      const shot=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{x:0,y:0,width:Math.ceil(width),height:Math.min(await evaluate('document.documentElement.scrollHeight'),15000),scale:1}});
      await writeFile(path.join(out,`viewport-${width}.png`),Buffer.from(shot.data,'base64'));
    }
  }
  // Interactions use the real dynamically mounted app in each layout family.
  const certificateCheck=await evaluate(`(()=>{
    const cards=document.querySelectorAll('.certificate-card');
    cards[0].querySelector('button').click();
    const dialog=document.querySelector('.certificate-dialog');
    const opened=dialog.open;
    const title=dialog.querySelector('h2').textContent;
    dialog.querySelector('.certificate-close').click();
    return {count:cards.length,opened,closed:!dialog.open,title,noImages:document.querySelectorAll('.certificates-section img').length===0};
  })()`);
  console.log('Certificates:',JSON.stringify(certificateCheck));
  if(certificateCheck.count!==2 || !certificateCheck.opened || !certificateCheck.closed || !certificateCheck.noImages) process.exitCode=1;
  const interactions=[];
  for (const [width,height] of [[390,844],[820,1180],[1366,768],[1920,1080]]) {
  await call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
  await delay(200);
  interactions.push(await evaluate(`(async()=>{
    const faq=document.querySelector('#faq details');faq.querySelector('summary').click();const faqOpen=faq.open;faq.querySelector('summary').click();
    const link=document.querySelector('.project-tile.pc-active .project-link') || document.querySelector('.project-link');link.focus();link.click();
    const modal=document.querySelector('.case-study-modal'); const modalOpen=modal.classList.contains('is-open');
    const modalText=modal.querySelector('.case-study-content').textContent.trim();
    const close=modal.querySelector('.case-study-close');
    close.focus();
    modal.dispatchEvent(new KeyboardEvent('keydown',{key:'Tab',bubbles:true,cancelable:true}));
    const modalFocusContained=modal.contains(document.activeElement);
    const focusDebug={active:document.activeElement.className,closeVisibility:getComputedStyle(close).visibility,closeDisplay:getComputedStyle(close).display,closeRect:close.getBoundingClientRect().width,hidden:modal.getAttribute('aria-hidden')};
    modal.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
    const tabs=[...document.querySelectorAll('.pc-tab')];
    let carouselChanged=null;
    if(tabs[1] && getComputedStyle(tabs[1]).display!=='none' && tabs[1].getClientRects().length) {
      tabs[1].click();await new Promise(r=>setTimeout(r,400));carouselChanged=tabs[1].classList.contains('is-active');
      tabs[0].click();
    }
    document.querySelector('.nav-links a[href="#contact"]').click();await new Promise(r=>setTimeout(r,50));
    const heading=document.querySelector('.contact-title').getBoundingClientRect();
    const navBottom=document.querySelector('.site-nav').getBoundingClientRect().bottom;
    return {width:innerWidth,faqOpen,faqClosed:!faq.open,modalOpen,modalHasContent:!!modalText,modalFocusContained,focusDebug,modalClosed:!modal.classList.contains('is-open'),focusRestored:document.activeElement===link,carouselChanged,contactHeadingVisible:heading.top>=navBottom-2,sections:document.querySelectorAll('main>section').length};
  })()`));
  }
  // Check keyboard navigation and real pointer drag in the tablet carousel.
  await call('Emulation.setDeviceMetricsOverride',{width:1024,height:768,deviceScaleFactor:1,mobile:false});
  await evaluate("document.querySelector('#projects').scrollIntoView({behavior:'instant'});document.querySelector('.pc-tab').click()");
  await delay(500);
  await evaluate("window.scrollTo({top:scrollY+document.querySelector('.projects-static').getBoundingClientRect().top-220,behavior:'instant'})");
  const pointer=await evaluate(`(()=>{const r=document.querySelector('.projects-static').getBoundingClientRect();return {x:512,y:r.top+100};})()`);
  await call('Input.dispatchMouseEvent',{type:'mouseMoved',x:pointer.x,y:pointer.y});
  await call('Input.dispatchMouseEvent',{type:'mousePressed',x:pointer.x,y:pointer.y,button:'left',clickCount:1});
  for(let step=1;step<=10;step++) { await call('Input.dispatchMouseEvent',{type:'mouseMoved',x:pointer.x-step*30,y:pointer.y,button:'left',buttons:1}); await delay(16); }
  await call('Input.dispatchMouseEvent',{type:'mouseReleased',x:pointer.x-300,y:pointer.y,button:'left',clickCount:1});
  await delay(500);
  const mouseDrag=await evaluate("document.querySelector('.pc-tab.is-active')?.textContent.trim()");
  const keyboard=await evaluate(`(async()=>{
    const track=document.querySelector('.projects-static'); track.focus();
    track.dispatchEvent(new KeyboardEvent('keydown',{key:'End',bubbles:true,cancelable:true}));
    await new Promise(r=>setTimeout(r,400));return document.querySelectorAll('.pc-tab')[2].classList.contains('is-active');
  })()`);
  await evaluate("document.querySelector('.project-tile.pc-active .project-link').click()");
  const modalShot=await call('Page.captureScreenshot',{format:'png'});
  await writeFile(path.join(out,'project-dialog.png'),Buffer.from(modalShot.data,'base64'));
  await writeFile(path.join(out,'report.json'),JSON.stringify({results,interactions,mouseDrag,keyboard,errors},null,2));
  console.log(JSON.stringify({viewports:results.length,overflow:results.filter(r=>r.overflow.length),clipped:results.filter(r=>r.clipped.length).map(r=>({width:r.width,clipped:r.clipped})),interactions,errors},null,2));
  console.log(JSON.stringify({mouseDrag,keyboard}));
  if(errors.length || results.some(r=>r.overflow.length || r.clipped.length) || !keyboard || !mouseDrag?.startsWith('02') || interactions.some(r=>!r.faqOpen || !r.faqClosed || r.modalHasContent || !r.modalFocusContained || !r.modalClosed || !r.focusRestored || !r.contactHeadingVisible || r.carouselChanged===false)) process.exitCode=1;
  await call('Browser.close');
} finally { socket?.close(); child.kill(); server.closeAllConnections(); server.close(); }
