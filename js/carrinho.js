
document.addEventListener('DOMContentLoaded', () => {
	const removerBtns = document.querySelectorAll('.remover');
	const qtdInputs = document.querySelectorAll('.quantidade');
	const verPedidoBtns = document.querySelectorAll('.ver-pedido');
	const overlay = document.getElementById('pedidoOverlay');
	const modal = document.getElementById('pedidoModal');
	const pedidoContent = document.getElementById('pedidoContent');
	const fecharBtn = document.getElementById('fecharPedido');
	const confirmarBtn = document.getElementById('confirmarCompra');
	const btnFinalizar = document.querySelector('.btn-finalizar');

	function atualizarTotal(){
		const precos = document.querySelectorAll('.preco');
		let total = 0;
		precos.forEach((el, i) => {
			const text = el.textContent.replace(/[R$\s.]/g,'').replace(',','.') || '0';
			const val = parseFloat(text);
			const qty = qtdInputs[i] ? Number(qtdInputs[i].value) : 1;
			if (!isNaN(val)) total += val * qty;
		});
		const totalEl = document.querySelector('.linha.total span:last-child');
		if (totalEl) totalEl.textContent = 'R$ ' + total.toFixed(2).replace('.',',');
	}


	function openPedidoModal(html){
		if (pedidoContent) pedidoContent.innerHTML = html;
		if (overlay) overlay.classList.add('show');
		if (modal) {
			// ensure modal is in document flow and then add show class to trigger animation
			modal.classList.add('show');
			setTimeout(() => modal.classList.add('visible'), 10);
		}
	}

	function closePedidoModal(){
		if (overlay) overlay.classList.remove('show');
		if (modal) {
			modal.classList.remove('visible');
			modal.classList.remove('show');
		}
		if (pedidoContent) pedidoContent.innerHTML = '';
	}

	removerBtns.forEach((btn) => {
		btn.addEventListener('click', (e) => {
			const item = e.target.closest('.item');
			if (item) item.remove();
			atualizarTotal();
		});
	});

	verPedidoBtns.forEach((btn) => {
		btn.addEventListener('click', (e) => {
			const item = e.target.closest('.item');
			if (!item) return;
			const img = item.querySelector('img') ? item.querySelector('img').src : '';
			const titulo = item.querySelector('h3') ? item.querySelector('h3').textContent.trim() : '';
			const preco = item.querySelector('.preco') ? item.querySelector('.preco').textContent.trim() : '';
			const qty = item.querySelector('.quantidade') ? item.querySelector('.quantidade').value : '1';
			const html = `
				<div style="display:flex; gap:12px; align-items:flex-start">
					<img src="${img}" style="width:120px; height:120px; object-fit:cover; border-radius:8px;" />
					<div>
						<h4 style="margin:0 0 8px">${titulo}</h4>
						<p style="margin:0 0 6px">Preço: <strong>${preco}</strong></p>
						<p style="margin:0">Quantidade: <strong>${qty}</strong></p>
					</div>
				</div>
			`;
			openPedidoModal(html);
		});
	});

	qtdInputs.forEach(i => i.addEventListener('change', atualizarTotal));

	if (btnFinalizar) {
		btnFinalizar.addEventListener('click', () => {
			// montar resumo completo do carrinho
			const items = document.querySelectorAll('.item');
			let html = '<div>';
			let soma = 0;
			items.forEach(it => {
				const img = it.querySelector('img') ? it.querySelector('img').src : '';
				const titulo = it.querySelector('h3') ? it.querySelector('h3').textContent.trim() : '';
				const precoText = it.querySelector('.preco') ? it.querySelector('.preco').textContent.trim() : 'R$ 0,00';
				const preco = parseFloat(precoText.replace(/[R$\s.]/g,'').replace(',','.')) || 0;
				const qty = it.querySelector('.quantidade') ? Number(it.querySelector('.quantidade').value) : 1;
				soma += preco * qty;
				html += `
					<div style="display:flex; gap:12px; margin-bottom:10px; align-items:center">
						<img src="${img}" style="width:80px; height:80px; object-fit:cover; border-radius:6px" />
						<div>
							<div style="font-weight:700">${titulo}</div>
							<div>Qtd: ${qty} — ${precoText}</div>
						</div>
					</div>
				`;
			});
			html += `<div style="border-top:1px solid #e6e9ed; padding-top:8px; margin-top:8px">Total: <strong>R$ ${soma.toFixed(2).replace('.',',')}</strong></div>`;
			html += '</div>';
			openPedidoModal(html);
		});
	}

	if (fecharBtn) fecharBtn.addEventListener('click', closePedidoModal);
	if (overlay) overlay.addEventListener('click', closePedidoModal);
	if (confirmarBtn) confirmarBtn.addEventListener('click', () => {
		// ação simples: simular confirmação e fechar
		alert('Pedido confirmado. Obrigado pela compra!');
		closePedidoModal();
		// opcional: limpar carrinho
		const itens = document.querySelectorAll('.item');
		itens.forEach(i => i.remove());
		atualizarTotal();
	});

	atualizarTotal();
});

