(function(){
  const mustUse3000 = ['8080','80','5500','5173'].includes(location.port);
  window.API_BASE = mustUse3000 ? 'http://localhost:3000' : '';
  window.money = function(value){ return 'R$ ' + Number(value || 0).toFixed(2).replace('.', ','); };
  window.escapeHTML = function(value){ return String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); };
})();
