let archive=null,year='ALL',activePhoto=null,activeAlbum=null,opener=null;
const $=s=>document.querySelector(s);
const node=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e};
const name=s=>s.replace(/서석/g,'Seoseok').replace(/^시작$/,'Beginning');
function button(text,action,cls){const b=node('button',cls,text);b.type='button';b.addEventListener('click',action);return b}
function link(text,url){const a=node('a','',text);a.href=url;a.target='_blank';a.rel='noreferrer';return a}
// 저장된 임시 미리보기 주소 대신 Drive 파일 ID로 이미지를 요청합니다.
function image(p, size) {
  const img = node('img');
  img.alt = p.name;
  img.loading = 'lazy';
  img.referrerPolicy = 'no-referrer';
  img.src = `https://lh3.googleusercontent.com/d/${encodeURIComponent(p.id)}=s${size}`;
  return img;
}
function visible(){return archive.folders.filter(f=>year==='ALL'||f.name.startsWith(year))}
function render(){
 $('#years').replaceChildren();[...new Set(archive.folders.map(f=>f.name.match(/^\d{4}/)?.[0]).filter(Boolean)),'ALL'].forEach(y=>{const b=button(y==='ALL'?'All':y,()=>{year=y;render()});b.setAttribute('aria-pressed',String(year===y));$('#years').append(b)});
 $('#records').replaceChildren();$('#index').replaceChildren();
 for(const f of visible()){
 const number=String(archive.folders.length-archive.folders.indexOf(f)).padStart(2,'0');
 const section=node('section','record');section.id='record-'+f.id;const head=node('div','record-heading');const label=node('span','',number);label.append(node('span','record-name',name(f.name)));head.append(label,button('[More...]',e=>{opener=e.currentTarget;showAlbum(f.id)}));section.append(head);
 const row=node('div','photo-row');f.photos.slice(0,5).forEach((p,i)=>{const b=button('',e=>{opener=e.currentTarget;showPhoto(f.id,i)},'thumbnail');b.setAttribute('aria-label',name(f.name)+' '+p.name+' — View photo');const img=image(p,700);img.addEventListener('error',()=>{img.style.visibility='hidden';b.classList.add('failed')});b.append(img,node('span','fallback','Preview unavailable — click to view original'));row.append(b)});if(!f.photos.length)row.append(node('span','album-loading','No photographs in this folder.'));section.append(row);$('#records').append(section);
 const index=button('',()=>{year='ALL';render();document.getElementById('record-'+f.id).scrollIntoView({behavior:'smooth',block:'start'})},'index-columns index-row');[number,name(f.name),f.name.endsWith('서석')?'Seoseok, Gangwon':'—',f.name.match(/^\d{4}/)?.[0]||'—'].forEach(t=>index.append(node('span','',t)));$('#index').append(index);
 }
}
function modal(cls,title){$('#modal-root').replaceChildren();const box=node('div','overlay '+cls);box.role='dialog';box.setAttribute('aria-modal','true');box.setAttribute('aria-label',title);const head=node('div','modal-heading');head.append(node('span','',title),button('(Close)',close,'close'));box.append(head);$('#modal-root').append(box);requestAnimationFrame(()=>box.querySelector('.close').focus());return box}
function close(){if(activePhoto&&activeAlbum){activePhoto=null;showAlbum(activeAlbum);return}activePhoto=null;activeAlbum=null;$('#modal-root').replaceChildren();opener?.focus()}
function showAlbum(id){activeAlbum=id;activePhoto=null;const f=archive.folders.find(f=>f.id===id);const box=modal('detail-panel',name(f.name)+' · '+f.photos.length+' photographs');const grid=node('div','detail-scroll');f.photos.forEach((p,i)=>{const b=button('',()=>showPhoto(id,i));b.append(image(p,700),node('span','',String(i+1).padStart(2,'0')+' · '+p.name));grid.append(b)});box.append(grid)}
function showPhoto(id,i){const f=archive.folders.find(f=>f.id===id);activePhoto={id,index:i};const p=f.photos[i];const box=modal('viewer',name(f.name)+' · '+(i+1)+'/'+f.photos.length);box.append(image(p,1400));const bottom=node('div','viewer-bottom');bottom.append(button('← Previous',()=>showPhoto(id,(i-1+f.photos.length)%f.photos.length)),link(p.name+' ↗',p.url),button('Next →',()=>showPhoto(id,(i+1)%f.photos.length)));box.append(bottom)}
$('#info').addEventListener('click',e=>{opener=e.currentTarget;activeAlbum=null;activePhoto=null;const box=modal('info-panel','OPEN AIR PRACTICE (INFO)');box.append(node('h1','','Open Air Practice'),node('p','','Open Air Practice is a group formed by Jeongseop Eom and Jaegyun Lim, who have been working outdoors in Seoseok, Gangwon Province, since October 2025.'),link('View the original archive ↗',archive?.driveUrl||'https://drive.google.com/drive/folders/1fnVSg7cGxNcMCg7QBNmqi6_INKqqBDav'))});
document.addEventListener('keydown',e=>{const overlay=$('.overlay');if(!overlay)return;if(e.key==='Escape')close();if(activePhoto&&['ArrowLeft','ArrowRight'].includes(e.key)){const f=archive.folders.find(f=>f.id===activePhoto.id);showPhoto(f.id,(activePhoto.index+(e.key==='ArrowRight'?1:-1)+f.photos.length)%f.photos.length)}if(e.key==='Tab'){const items=[...overlay.querySelectorAll('button,a')];e.preventDefault();const i=items.indexOf(document.activeElement);items[(i+(e.shiftKey?-1:1)+items.length)%items.length].focus()}});
async function load(){try{const r=await fetch('./data/archive.json?t='+Date.now(),{cache:'no-store'});if(!r.ok)throw Error();const data=await r.json();if(!Array.isArray(data.folders))throw Error();archive=data;render()}catch{if(!archive)$('#records').replaceChildren(node('p','error','Unable to load the archive. Use Live Server or a local HTTP server, then reload the page.'));else alert('Unable to refresh. Showing the previously loaded archive.')}}
load();setInterval(()=>{if(!document.hidden&&!$('.overlay'))load()},300000);
