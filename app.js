/* KALA MAIA starter. Demo mode is on until you configure the Apps Script URL.
   Do not put secrets or service-account credentials in this public file. */
const CONFIG = {
  // Paste your deployed Apps Script web app URL here after deployment.
  apiUrl: "",
  currency: "IDR",
  demoMode: true
};
const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const money = n => new Intl.NumberFormat("id-ID",{style:"currency",currency:CONFIG.currency,maximumFractionDigits:0}).format(Number(n)||0);
$("#year").textContent = new Date().getFullYear();
const backdrop=$("#modalBackdrop"), content=$("#modalContent"), title=$("#modalTitle"), subtitle=$("#modalSubtitle");
let activeView="order";
$("#menuToggle").addEventListener("click",()=>$("#mainNav").classList.toggle("open"));
$$("[data-open]").forEach(b=>b.addEventListener("click",e=>{e.preventDefault();openModal(b.dataset.open);$("#mainNav").classList.remove("open")}));
$("#modalClose").addEventListener("click",closeModal);
backdrop.addEventListener("click",e=>{if(e.target===backdrop)closeModal()});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal()});
function openModal(view){activeView=view;backdrop.hidden=false;document.body.style.overflow="hidden";renderView(view);$("#modalClose").focus()}
function closeModal(){backdrop.hidden=true;document.body.style.overflow="";content.innerHTML=""}
function renderView(view){
  const views={
    order:["Place an order","Tell us what you need. We'll take it from here.",orderForm],
    track:["Track an order","Enter your order reference and the email used at checkout.",trackForm],
    support:["Order support","Request shipping help or ask our team to review a refund.",supportForm]
  };
  [title.textContent,subtitle.textContent]=views[view].slice(0,2);content.innerHTML=views[view][2]();
  wireView(view);
}
function orderForm(){return `<form id="orderForm"><div class="form-grid">
  <div class="field"><label for="customerName">Full name *</label><input id="customerName" name="customerName" required maxlength="100" autocomplete="name"></div>
  <div class="field"><label for="customerEmail">Email *</label><input id="customerEmail" name="customerEmail" type="email" required maxlength="150" autocomplete="email"></div>
  <div class="field"><label for="customerPhone">WhatsApp / phone</label><input id="customerPhone" name="customerPhone" maxlength="30" autocomplete="tel"></div>
  <div class="field"><label for="batch">Batch / collection</label><select id="batch" name="batch"><option value="General">General order</option><option value="Batch 01">Batch 01</option><option value="Batch 02">Batch 02</option></select></div>
  <div class="field full"><label for="address">Shipping address *</label><textarea id="address" name="address" required maxlength="500" autocomplete="street-address"></textarea></div>
  <div class="field"><label for="itemName">Item *</label><select id="itemName" name="itemName"><option value="Everyday Tote" data-price="125000">Everyday Tote — Rp125.000</option><option value="Gift Set" data-price="185000">Gift Set — Rp185.000</option><option value="Studio Pouch" data-price="75000">Studio Pouch — Rp75.000</option></select></div>
  <div class="field"><label for="quantity">Quantity *</label><input id="quantity" name="quantity" type="number" min="1" max="20" value="1" required></div>
  <div class="field full"><label for="notes">Order notes (optional)</label><textarea id="notes" name="notes" maxlength="500" placeholder="Color, size, or delivery notes"></textarea></div>
  </div><div class="estimate"><span>Estimated item total</span><strong id="estimate">${money(125000)}</strong></div>
  <button class="button button-dark form-submit" type="submit">Submit order request <span>↗</span></button><div id="formMessage" aria-live="polite"></div></form>`}
function trackForm(){return `<form id="trackForm"><div class="field"><label for="orderId">Order reference *</label><input id="orderId" name="orderId" required maxlength="40" placeholder="e.g. PN-ABC123"></div><div class="field"><label for="trackEmail">Checkout email *</label><input id="trackEmail" name="email" type="email" required maxlength="150"></div><button class="button button-dark form-submit" type="submit">Find my order <span>→</span></button><div id="formMessage" aria-live="polite"></div></form>`}
function supportForm(){return `<form id="supportForm"><div class="form-grid"><div class="field"><label for="supportOrder">Order reference *</label><input id="supportOrder" name="orderId" required maxlength="40"></div><div class="field"><label for="supportEmail">Email *</label><input id="supportEmail" name="email" type="email" required maxlength="150"></div><div class="field"><label for="requestType">Request type *</label><select id="requestType" name="type"><option value="shipping">Shipping request</option><option value="refund">Refund review</option><option value="other">Other order support</option></select></div><div class="field"><label for="reason">Reason *</label><select id="reason" name="reason"><option>Delayed shipment</option><option>Damaged item</option><option>Wrong or missing item</option><option>Changed my mind</option><option>Other</option></select></div><div class="field full"><label for="details">Details *</label><textarea id="details" name="details" required maxlength="1500" placeholder="Explain what happened and what help you need"></textarea></div></div><button class="button button-dark form-submit" type="submit">Submit request <span>↗</span></button><div id="formMessage" aria-live="polite"></div></form>`}
function wireView(view){
  if(view==="order"){
    const item=$("#itemName"),qty=$("#quantity");
    const update=()=>$("#estimate").textContent=money(Number(item.selectedOptions[0].dataset.price)*Math.max(1,Math.min(20,Number(qty.value)||1)));
    item.addEventListener("change",update);qty.addEventListener("input",update);
    $("#orderForm").addEventListener("submit",submitOrder);
  } else if(view==="track") $("#trackForm").addEventListener("submit",trackOrder);
  else $("#supportForm").addEventListener("submit",submitSupport);
}
async function api(action,payload={}){
  if(CONFIG.demoMode || !CONFIG.apiUrl) return demoApi(action,payload);
  const res=await fetch(CONFIG.apiUrl,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify({action,...payload})});
  const data=await res.json();if(!res.ok||data.ok===false)throw new Error(data.error||"Something went wrong. Please try again.");return data;
}
function showMessage(message,error=false){const el=$("#formMessage");if(el){el.className=error?"notice error":"notice";el.textContent=message}}
async function submitOrder(e){e.preventDefault();const f=e.currentTarget;const d=Object.fromEntries(new FormData(f));d.quantity=Number(d.quantity);d.unitPrice=Number($("#itemName").selectedOptions[0].dataset.price);d.itemName=$("#itemName").value;d.subtotal=d.quantity*d.unitPrice;const btn=f.querySelector("button[type=submit]");btn.disabled=true;btn.textContent="Submitting…";try{const r=await api("createOrder",d);content.innerHTML=`<div class="notice">Your order request has been recorded in ${CONFIG.demoMode?"demo mode":"the order system"}.</div><div class="result-card"><span class="status-pill">Order received</span><h3>Reference: ${escapeHtml(r.orderId)}</h3><p>Estimated total: <b>${money(d.subtotal)}</b></p><p>Keep your reference and use your checkout email to track your order.</p></div><button class="button button-dark form-submit" id="trackNew">Track this order</button>`;$("#trackNew").onclick=()=>{renderView("track");$("#orderId").value=r.orderId;$("#trackEmail").value=d.customerEmail}}catch(err){showMessage(err.message,true);btn.disabled=false;btn.textContent="Submit order request ↗"}}
async function trackOrder(e){e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget));showMessage("Looking up your order…");try{const r=await api("trackOrder",d);if(!r.order){showMessage("No matching order was found. Check the reference and email, then try again.",true);return}const o=r.order;$("#formMessage").outerHTML=`<div class="result-card" id="trackResult"><span class="status-pill">${escapeHtml(o.status)}</span><h3>${escapeHtml(o.orderId)}</h3><p><b>Item:</b> ${escapeHtml(o.itemName||"—")} × ${escapeHtml(o.quantity||"—")}</p><p><b>Total:</b> ${money(o.total||0)}</p><p><b>Last updated:</b> ${escapeHtml(o.updatedAt||"—")}</p>${o.trackingNumber?`<p><b>Tracking:</b> ${escapeHtml(o.trackingNumber)}</p>`:""}${o.trackingUrl?`<p><a href="${safeUrl(o.trackingUrl)}" target="_blank" rel="noopener">Open carrier tracking ↗</a></p>`:""}</div>`}catch(err){showMessage(err.message,true)}}
async function submitSupport(e){e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget));const btn=e.currentTarget.querySelector("button[type=submit]");btn.disabled=true;try{const r=await api("createSupportRequest",d);content.innerHTML=`<div class="notice">Your request has been submitted for review.</div><div class="result-card"><h3>Request reference: ${escapeHtml(r.requestId)}</h3><p>Keep this reference if you need to contact support. Refunds are not automatic and require team review.</p></div>`}catch(err){showMessage(err.message,true);btn.disabled=false}}
function escapeHtml(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function safeUrl(v){try{const u=new URL(v);return ["https:","http:"].includes(u.protocol)?u.href:"#"}catch{return "#"}}
async function demoApi(action,d){
  await new Promise(r=>setTimeout(r,350));
  if(action==="createOrder")return {ok:true,orderId:"PN-"+Math.random().toString(36).slice(2,8).toUpperCase()};
  if(action==="createSupportRequest")return {ok:true,requestId:"SR-"+Math.random().toString(36).slice(2,8).toUpperCase()};
  if(action==="trackOrder"){
    if(d.orderId==="PN-DEMO1"&&d.email.toLowerCase()==="demo@example.com")return {ok:true,order:{orderId:"PN-DEMO1",status:"In transit",itemName:"Everyday Tote",quantity:1,total:125000,updatedAt:"2026-10-24",trackingNumber:"DEMO-TRACK-123",trackingUrl:"https://example.com"}};
    return {ok:true,order:null};
  }
  throw new Error("Unsupported action");
}
