/* Ohio HVAC Pros — Form Handler
   On submit: POST to Netlify Forms, then redirect to /thank-you/
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

    fetch('/', {
      method:  'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body:    encode(data)
    })
    .then(function(){ window.location.href = '/thank-you/'; })
    .catch(function(){ window.location.href = '/thank-you/'; });

    /* Hard fallback: redirect after 3s regardless */
    setTimeout(function(){ window.location.href = '/thank-you/'; }, 3000);
  }

  document.addEventListener('DOMContentLoaded', function(){
    document.querySelectorAll('form.ohio-hvac-form').forEach(function(f){
      f.addEventListener('submit', onSubmit);
    });
  });

  window.ohvacSubmit = onSubmit;
})();
