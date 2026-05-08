/* Ohio HVAC Pros — Unified Form Handler v1 */
var SHEETS_WEBHOOK='PASTE_APPS_SCRIPT_URL_HERE';
(function(){
'use strict';
function collectData(form){
  var els=form.elements,d={};
  for(var i=0;i<els.length;i++){if(!els[i].name||els[i].type==='submit'||els[i].type==='hidden')continue;d[els[i].name]=els[i].value||'';}
  return{name:d.name||'',phone:d.phone||'',email:d.email||'',city:d.city||'',service:d.service||'',details:d.message||d.details||'',pageUrl:window.location.href};
}
function toNetlify(data){
  var b='form-name=ohio-hvac-lead&name='+encodeURIComponent(data.name)+'&phone='+encodeURIComponent(data.phone)+'&email='+encodeURIComponent(data.email)+'&city='+encodeURIComponent(data.city)+'&service='+encodeURIComponent(data.service)+'&details='+encodeURIComponent(data.details)+'&page-url='+encodeURIComponent(data.pageUrl);
  return fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:b}).catch(function(){});
}
function toSheets(data){
  if(!SHEETS_WEBHOOK||SHEETS_WEBHOOK.indexOf('PASTE_')===0)return Promise.resolve();
  return fetch(SHEETS_WEBHOOK,{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}).catch(function(){});
}
function setLoading(btn,on){if(!btn)return;if(on){btn.setAttribute('data-orig',btn.textContent);btn.textContent='Sending...';btn.disabled=true;}else{btn.textContent=btn.getAttribute('data-orig')||'Submit';btn.disabled=false;}}
function onSubmit(e){
  e.preventDefault();
  var form=e.target,btn=form.querySelector('[type="submit"]');
  setLoading(btn,true);
  var data=collectData(form);
  Promise.all([toNetlify(data),toSheets(data)]).then(function(){window.location.href='/thank-you/';}).catch(function(){window.location.href='/thank-you/';});
  setTimeout(function(){window.location.href='/thank-you/';},3000);
}
document.addEventListener('DOMContentLoaded',function(){
  document.querySelectorAll('form.ohio-hvac-form').forEach(function(f){f.addEventListener('submit',onSubmit);});
});
window.ohvacSubmit=onSubmit;
})();
