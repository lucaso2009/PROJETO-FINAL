(function(){
const API_BASE = window.API_BASE || ((['8080','80','5500','5173'].includes(location.port)) ? 'http://localhost:3000' : '');
function qs(id){return document.getElementById(id)}
function show(el){el?.classList.add('show')} function hide(el){el?.classList.remove('show')}
function updateNav(){ const l=qs('logoutLink'); if(l) l.textContent=localStorage.getItem('usuario')?'Sair':'Entrar'; }
function openLogin(){show(qs('overlay'));show(qs('loginModal'))} function closeLogin(){hide(qs('overlay'));hide(qs('loginModal'))} function openCadastro(){show(qs('overlay'));hide(qs('loginModal'));show(qs('cadastroModal'))} function closeCadastro(){hide(qs('cadastroModal'));hide(qs('overlay'))}
document.addEventListener('DOMContentLoaded',()=>{
 updateNav();
 const form=qs('loginForm');
 form?.addEventListener('submit',async e=>{ e.preventDefault(); const email=(qs('email')?.value||'').trim().toLowerCase(); const senha=qs('senha')?.value||''; if(!email||!senha){alert('Informe e-mail e senha.');return} try{ const res=await fetch(API_BASE+'/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,senha})}); const data=await res.json().catch(()=>({})); if(!res.ok){alert(data.error||'E-mail ou senha incorretos.');return} const tipo=data.user?.tipo==='admin'||email==='admin@promofinder.local'?'admin':'logado'; localStorage.setItem('usuario',tipo); localStorage.setItem('usuario_email',email); closeLogin(); updateNav(); if(tipo==='admin') location.href='ADM/dashboard.html'; else if(location.pathname.endsWith('/login.html')) location.href='index.html'; }catch(err){ console.error(err); alert('Erro ao entrar. Confira o servidor em http://localhost:3000'); } });
 qs('logoutLink')?.addEventListener('click',e=>{ e.preventDefault(); if(localStorage.getItem('usuario')){ localStorage.removeItem('usuario'); localStorage.removeItem('usuario_email'); updateNav(); alert('Você saiu da conta.'); } else openLogin(); });
 qs('abrirCadastro')?.addEventListener('click',e=>{e.preventDefault();openCadastro()}); qs('voltarLogin')?.addEventListener('click',e=>{e.preventDefault();hide(qs('cadastroModal'));show(qs('loginModal'))}); qs('overlay')?.addEventListener('click',()=>{hide(qs('loginModal'));hide(qs('cadastroModal'));hide(qs('overlay'))});
});
window.openLogin=openLogin; window.closeLogin=closeLogin; window.closeCadastro=closeCadastro; window.updateNav=updateNav;
})();
