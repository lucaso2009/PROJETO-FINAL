document.addEventListener('DOMContentLoaded', () => {
	const form = document.getElementById('cadastroForm');
	if (!form) return;

	form.addEventListener('submit', (e) => {
		e.preventDefault();

		// buscar valores a partir do form (funciona para modal e pagina separada)
		const nome = (form.querySelector('[name="nome"]') || {}).value || '';
		const email = (form.querySelector('[name="email"]') || {}).value || '';
		const senha = (form.querySelector('[name="senha"]') || {}).value || '';

		const lista = JSON.parse(localStorage.getItem('usuarios') || '[]');
		lista.push({ nome, email, senha });
		localStorage.setItem('usuarios', JSON.stringify(lista));

		// auto login
		localStorage.setItem('usuario', 'logado');
		// salva o email do usuário logado para perfil
		localStorage.setItem('usuario_email', email);

		alert('Cadastro realizado com sucesso!');
		// Se existe função para fechar modal (estamos em index), apenas fecha; senão redireciona
		if (window.closeCadastro) {
			window.closeCadastro();
			if (window.updateNav) window.updateNav();
		} else {
			location.href = 'index.html';
		}
	});
});

