/* Ohio HVAC Pros — Form Handler
   On submit: POST to Netlify Forms, redirect to /thank-you/ ONLY on success.
   A failed POST (404/unregistered form, network error) shows an inline error
   instead of silently redirecting — a lead must never silently fail.
   CallRail swap.js auto-captures the submission (no extra code needed) */
(function(){
  'use strict';

  function encode(data){
    return Object.keys(data)
      .map(function(k){ return encodeURIComponent(k)+'='+encodeURIComponent(data[k]||''); })
      .join('&');
  }

  function onSubmit(e){
    e.preventDefault();
    var form = e.target;
    var btn  = form.querySelector('[type="submit"]');
    if(btn){ btn.textContent='Sending...'; btn.disabled=true; }

    var els  = form.elements;
    var data = {'form-name': form.getAttribute('name') || 'ohio-hvac-lead'};
    for(var i=0; i<els.length; i++){
      if(els[i].name && els[i].type !== 'submit' && els[i].type !== 'hidden'){
        data[els[i].name] = els[i].value || '';
      }
    }

    fetch('/.netlify/functions/submit-lead', {
      method:  'POST',
      headers: {'Content-Type': 'application/json'},
      body:    JSON.stringify(Object.assign({site: 'ohiohvacpros.com'}, data))
    })
    .then(function(resp){
      if(resp.ok){
        window.location.href = '/thank-you/';
      } else {
        showError();
      }
    })
    .catch(function(){
      showError();
    });
  }

  function showError(){
    var form = document.querySelector('form.ohio-hvac-form');
    var btn  = form ? form.querySelector('[type="submit"]') : null;
    if(btn){ btn.textContent='Submit'; btn.disabled=false; }
    if(!form) return;
    // remove any prior error so we don't stack them
    var old = form.querySelector('.ohvac-error');
    if(old){ old.remove(); }
    var el = document.createElement('div');
    el.className = 'ohvac-error';
    el.style.cssText = 'color:#b00020;font-weight:600;margin-top:12px;font-size:15px;';
    el.textContent = 'Sorry — your request did not go through. Please call us directly at (614) 344-4851.';
    form.appendChild(el);
  }

  document.addEventListener('DOMContentLoaded', function(){
    document.querySelectorAll('form.ohio-hvac-form').forEach(function(f){
      f.addEventListener('submit', onSubmit);
    });
  });

  window.ohvacSubmit = onSubmit;
})();
