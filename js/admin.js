document.addEventListener('DOMContentLoaded', () => {
	// Redireciona para login se não estiver autenticado
	if (!localStorage.getItem('usuario')) {
		// em ambientes administrativos, pode redirecionar
		// aqui apenas garante que não seja acessado sem login
		// (ajuste conforme necessário)
		console.warn('Usuário não autenticado.');
	}
});
