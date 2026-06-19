// Gera comportamento do modal de login e compatibilidade com página standalone
const overlay = document.getElementById("overlay");
const loginModal = document.getElementById("loginModal");
const cadastroModal = document.getElementById("cadastroModal");
const loginForm = document.getElementById("loginForm");
const logoutLink = document.getElementById("logoutLink");
const abrirCadastroLink = document.getElementById("abrirCadastro");
const voltarLoginLink = document.getElementById("voltarLogin");

function _showOverlay(){ if (overlay) overlay.classList.add('show'); }
function _hideOverlay(){ if (overlay) overlay.classList.remove('show'); }

function _showModal(modalEl){
    if (!modalEl) return;
    modalEl.classList.add('show');
    // allow CSS transitions to pick up
    setTimeout(() => modalEl.classList.add('visible'), 10);
}

function _hideModal(modalEl){
    if (!modalEl) return;
    modalEl.classList.remove('visible');
    modalEl.classList.remove('show');
}

function openLogin() {
    _showOverlay();
    _showModal(loginModal);
}

function closeLogin() {
    _hideOverlay();
    _hideModal(loginModal);
}

function openCadastro(){
    _showOverlay();
    _hideModal(loginModal);
    _showModal(cadastroModal);
}

function closeCadastro(){
    _hideModal(cadastroModal);
    _hideOverlay();
}

function updateNav() {
    const logged = !!localStorage.getItem("usuario");
    if (logoutLink) {
        if (logged) {
            logoutLink.textContent = "Sair";
        } else {
            logoutLink.textContent = "Entrar";
        }
    }
}

if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        // autenticação básica (demo)
        localStorage.setItem("usuario", "logado");
        const emailInput = document.getElementById('email');
        const emailVal = emailInput ? (emailInput.value || '').trim() : '';
        if (emailVal) localStorage.setItem('usuario_email', emailVal);
        closeLogin();
        updateNav();
        // se estiver em página standalone, redireciona para index
        if (location.pathname.endsWith("/login.html") || location.pathname.endsWith("\\login.html")) {
            location.href = "index.html";
        }
    });
}

if (logoutLink) {
    logoutLink.addEventListener("click", (e) => {
        e.preventDefault();
        // se usuário estiver logado, faz logout, senão abre modal
        if (localStorage.getItem("usuario")) {
            localStorage.removeItem("usuario");
            updateNav();
            openLogin();
        } else {
            openLogin();
        }
    });
}

if (abrirCadastroLink) {
    abrirCadastroLink.addEventListener('click', (e) => {
        e.preventDefault();
        openCadastro();
    });
}

if (voltarLoginLink) {
    voltarLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        _hideModal(cadastroModal);
        _showModal(loginModal);
    });
}

// on load: se não logado, abrir modal (quando estiver na pagina principal)
window.addEventListener("load", () => {
    updateNav();
    const usuario = localStorage.getItem("usuario");
    // se estiver no index e nao logado, obrigar login
    const path = location.pathname.toLowerCase();
    if (!usuario && (path.endsWith("/index.html") || path.endsWith("/") || path.endsWith("\\index.html"))) {
        openLogin();
    }
});

// Fechar modal ao clicar no overlay somente se usuário já estiver logado
if (overlay) {
    overlay.addEventListener('click', () => {
        const usuario = !!localStorage.getItem('usuario');
        if (!usuario) return; // não fecha quando não logado (forçar login)
        _hideModal(loginModal);
        _hideModal(cadastroModal);
        _hideOverlay();
    });
}

// disponibiliza funções para outros scripts (cadastro.js)
window.closeCadastro = closeCadastro;
window.openLogin = openLogin;
window.closeLogin = closeLogin;
window.updateNav = updateNav;
