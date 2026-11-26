import {test, after} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Window} from 'happy-dom';
const window=new Window({url:'http://localhost/'});
for(const key of ['document','HTMLElement','CustomEvent','KeyboardEvent','MouseEvent'])globalThis[key]=window[key];
globalThis.customElements=window.customElements;
await import('../src/components/crayon-art.js');
await import('../src/components/photo-stack.js');
await import('../src/components/site-shell.js');
const data=JSON.parse(readFileSync(new URL('../public/data/site.json',import.meta.url),'utf8'));
const photos=data.activities[0].photos;
function makeStack(items=photos){const el=document.createElement('photo-stack');document.body.append(el);el.data={photos:items,ui:data.ui};return el;}
test('photo buttons and dots switch photos, including wrapping at both ends',()=>{
 const el=makeStack();
 el.querySelector('.photo-next').click();assert.equal(el.querySelector('img').getAttribute('src'),photos[1].src);
 el.querySelector('.photo-prev').click();assert.equal(el.querySelector('img').getAttribute('src'),photos[0].src);
 el.querySelector('.photo-prev').click();assert.equal(el.querySelector('img').getAttribute('src'),photos.at(-1).src);
 el.querySelector('[data-index="1"]').click();assert.equal(el.querySelector('img').alt,photos[1].alt);
 assert.equal(el.querySelector('[data-index="1"]').getAttribute('aria-pressed'),'true');
 el.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight'}));assert.equal(el.querySelector('img').alt,photos[2].alt);
 el.remove();
});
test('single-photo memories open without redundant paging controls',()=>{
 const el=makeStack([photos[0]]);assert.equal(el.querySelector('.photo-next'),null);assert.equal(el.querySelector('.photo-dots'),null);
 let detail;el.addEventListener('gallery-open',ev=>detail=ev.detail);el.querySelector('.photo-open').click();
 assert.equal(detail.photos.length,1);assert.equal(detail.index,0);assert.equal(detail.trigger,el.querySelector('.photo-open'));el.remove();
});
test('lightbox opens selected image, synchronizes paging, and restores focus and scrolling',()=>{
 const stack=makeStack(),box=document.createElement('photo-lightbox');document.body.append(box);box.ui=data.ui;
 document.body.style.overflow='auto';const trigger=stack.querySelector('.photo-open');trigger.focus();
 stack.addEventListener('gallery-open',ev=>box.open(ev.detail));trigger.click();
 assert.equal(box.querySelector('dialog').open,true);assert.equal(document.body.style.overflow,'hidden');
 box.querySelector('[data-gallery-action="next"]').click();assert.equal(box.querySelector('.lightbox-image').alt,photos[1].alt);assert.equal(stack.querySelector('img').alt,photos[1].alt);
 box.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowLeft'}));assert.equal(box.querySelector('.lightbox-image').alt,photos[0].alt);
 box.querySelector('[data-gallery-action="close"]').click();assert.equal(box.querySelector('dialog').open,false);assert.equal(document.body.style.overflow,'auto');assert.equal(document.activeElement,trigger);
 stack.remove();box.remove();
});
test('mobile navigation expands, collapses on Escape and marks the active page',()=>{
 const el=document.createElement('site-header');document.body.append(el);el.data={...data,page:'growth'};
 const button=el.querySelector('button');assert.equal(button.getAttribute('aria-expanded'),'false');
 button.click();assert.equal(button.getAttribute('aria-expanded'),'true');assert.ok(el.querySelector('nav').classList.contains('is-open'));
 el.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'}));assert.equal(button.getAttribute('aria-expanded'),'false');assert.equal(el.querySelector('[aria-current="page"]').textContent,'成长蜕变');el.remove();
});
after(()=>window.happyDOM.abort());
