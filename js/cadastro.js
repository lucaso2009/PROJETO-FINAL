(function(){
const API_BASE = window.API_BASE || ((['8080','80','5500','5173'].includes(location.port)) ? 'http://localhost:3000' : '');
document.addEventListener('DOMContentLoaded',()=>{
  const form=document.getElementById('cadastroForm'); if(!form) return;
  form.addEventListener('submit', async e=>{
    e.preventDefault();
    const name=(form.querySelector('[name="nome"]')?.value||'').trim();
    const email=(form.querySelector('[name="email"]')?.value||'').trim().toLowerCase();
    const senha=form.querySelector('[name="senha"]')?.value||'';
    if(!name||!email||!senha){ alert('Preencha todos os campos.'); return; }
    try{
      const res=await fetch(API_BASE+'/api/users',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,nome:name,email,senha})});
      const data=await res.json().catch(()=>({}));
      if(!res.ok){ alert(data.error||'Erro ao cadastrar usuário.'); return; }
      const users=JSON.parse(localStorage.getItem('usuarios')||'[]'); users.push({name,nome:name,email,senha}); localStorage.setItem('usuarios',JSON.stringify(users));
      localStorage.setItem('usuario','logado'); localStorage.setItem('usuario_email',email);
      alert('Cadastro realizado com sucesso!');
      if(window.closeCadastro){ window.closeCadastro(); window.updateNav?.(); } else location.href='index.html';
    }catch(err){ console.error(err); alert('Erro ao cadastrar usuário. Confira se o servidor está aberto em http://localhost:3000'); }
  });
});
})();
