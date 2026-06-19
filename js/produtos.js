
document.addEventListener('DOMContentLoaded', () => {
	// Adicionar ao carrinho (botões com classe .btn-carrinho) e info
	const btnsCarrinho = document.querySelectorAll('.btn-carrinho');
	const btnsComprar = document.querySelectorAll('.btn-comprar');
	const btnsInfo = document.querySelectorAll('.btn-info');

	const infoOverlay = document.getElementById('infoOverlay');
	const infoModal = document.getElementById('infoModal');
	const infoContent = document.getElementById('infoContent');
	const infoClose = document.getElementById('infoClose');

	function _showInfoModal(){
		if (infoOverlay) infoOverlay.classList.add('show');
		if (infoModal) { infoModal.classList.add('show'); setTimeout(()=>infoModal.classList.add('visible'),10); }
	}
	function _hideInfoModal(){
		if (infoOverlay) infoOverlay.classList.remove('show');
		if (infoModal) { infoModal.classList.remove('visible'); infoModal.classList.remove('show'); }
		if (infoContent) infoContent.innerHTML = '';
	}
	if (infoOverlay) infoOverlay.addEventListener('click', _hideInfoModal);
	if (infoClose) infoClose.addEventListener('click', _hideInfoModal);

	function adicionarAoCarrinho(item) {
		const carrinho = JSON.parse(localStorage.getItem('carrinho') || '[]');
		carrinho.push(item);
		localStorage.setItem('carrinho', JSON.stringify(carrinho));
	}

	btnsCarrinho.forEach(btn => {
		btn.addEventListener('click', (e) => {
			const card = e.target.closest('.produto') || e.target.closest('.card-prod') || document.body;
			const titulo = card.querySelector('h1, h3') ? card.querySelector('h1, h3').textContent.trim() : 'Produto';
			const precoEl = card.querySelector('.preco');
			const preco = precoEl ? precoEl.textContent.trim() : '';
			const img = card.querySelector('img') ? card.querySelector('img').src : '';

			adicionarAoCarrinho({ titulo, preco, img, quantidade: 1 });
			alert('Produto adicionado ao carrinho');
		});
	});


	btnsInfo.forEach(btn => {
		btn.addEventListener('click', (e) => {
			const card = e.target.closest('.produto') || e.target.closest('.card-prod') || document.body;
			const p = card && card._product ? card._product : null;
			const titulo = (p && (p.title || p.title)) || (card.querySelector('h1, h3') ? card.querySelector('h1, h3').textContent.trim() : 'Produto');
			const img = (p && (p.image || p.image)) || (card.querySelector('img') ? card.querySelector('img').src : '');
			const brand = p && (p.brand || p.brand) ? (p.brand || '') : (card.querySelector('.brand') ? card.querySelector('.brand').textContent.trim() : '');
			const preco = p && (p.price || p.price) ? ('R$ ' + Number(p.price).toFixed(2).replace('.',',')) : (card.querySelector('.preco') ? card.querySelector('.preco').textContent.trim() : '');
			const oldPrice = p && (p.oldPrice || p.oldPrice) ? ('R$ ' + Number(p.oldPrice).toFixed(2).replace('.',',')) : (card.querySelector('.oldpreco') ? card.querySelector('.oldpreco').textContent.trim() : '');
			const desc = p && (p.description || p.desc) ? (p.description || p.desc) : '';
			const specs = p && p.specs ? (Array.isArray(p.specs) ? p.specs.join(', ') : p.specs) : '';
			const id = p && p.id ? p.id : '';

			const html = `
				<div style="display:flex; gap:12px; align-items:flex-start">
					<img src="${img}" alt="${titulo}" />
					<div>
						<table class="info-table">
							<tr><th>ID</th><td>${id}</td></tr>
							<tr><th>Título</th><td>${titulo}</td></tr>
							<tr><th>Marca</th><td>${brand}</td></tr>
							<tr><th>Preço</th><td>${preco} ${oldPrice?'<span class="oldpreco" style="margin-left:8px">'+oldPrice+'</span>':''}</td></tr>
							<tr><th>Descrição</th><td>${desc}</td></tr>
							<tr><th>Especificações</th><td>${specs}</td></tr>
						</table>
					</div>
				</div>
			`;
			if (infoContent) infoContent.innerHTML = html;
			_showInfoModal();
		});
	});

	btnsComprar.forEach(btn => {
		btn.addEventListener('click', (e) => {
			const card = e.target.closest('.produto') || e.target.closest('.card-prod') || document.body;
			const titulo = card.querySelector('h1, h3') ? card.querySelector('h1, h3').textContent.trim() : 'Produto';
			const precoEl = card.querySelector('.preco');
			const preco = precoEl ? precoEl.textContent.trim() : '';
			const img = card.querySelector('img') ? card.querySelector('img').src : '';

			adicionarAoCarrinho({ titulo, preco, img, quantidade: 1 });
			// redireciona para carrinho para finalizar compra
			location.href = 'carrinho.html';
		});
	});
});

// Fallback local (para quando não houver servidor ou ao abrir via file://)
const LOCAL_FALLBACK_PRODUCTS = [
	{id:1,title:'Notebook Gamer Acer Nitro V15',price:'4299.90',oldPrice:'5499.90',image:'https://picsum.photos/seed/p1/600/400',brand:'Acer',description:'Notebook gamer com processador Intel i7 de 10ª geração, 16GB RAM, SSD 512GB e GPU dedicada para jogos e edição de vídeo.',specs:['CPU: Intel i7-10750H','RAM: 16GB DDR4','SSD: 512GB NVMe','GPU: NVIDIA GTX 1660 Ti','Tela: 15.6\" FHD 144Hz']},
	{id:2,title:'Headset Gamer HyperX Cloud',price:'249.90',oldPrice:'349.90',image:'https://picsum.photos/seed/p2/600/400',brand:'HyperX',description:'Headset com drivers de 53mm, almofadas confortáveis e microfone com cancelamento de ruído, ideal para longas sessões de jogo.',specs:['Drivers: 53mm','Conector: 3.5mm','Microfone: cancelamento de ruído','Peso: 300g']},
	{id:3,title:'Teclado Mecânico Redragon',price:'349.90',oldPrice:'449.90',image:'https://picsum.photos/seed/p3/600/400',brand:'Redragon',description:'Teclado mecânico compacto com switches Outemu, retroiluminação RGB e construção em alumínio resistente.',specs:['Switches: Outemu Red/Blue','Layout: Tenkeyless/Full','RGB: endereçável','Conexão: USB-C']},
	{id:4,title:'Mouse Gamer Logitech G502',price:'299.90',oldPrice:'399.90',image:'https://picsum.photos/seed/p4/600/400',brand:'Logitech',description:'Mouse com sensor avançado, 11 botões programáveis e ajuste de peso para máxima precisão em jogos.',specs:['Sensor: HERO 25K','DPI: até 25600','Botões: 11 programáveis','Peso ajustável']},
	{id:5,title:'Monitor 27\' 144Hz',price:'1599.90',oldPrice:'1999.90',image:'https://picsum.photos/seed/p5/600/400',brand:'Samsung',description:'Monitor 27\" com painel IPS, taxa de atualização de 144Hz e tempo de resposta rápido, ideal para gamers competitivos.',specs:['Tamanho: 27\"','Resolução: 1920x1080','Painel: IPS','Refresh: 144Hz']},
	{id:6,title:'SSD NVMe 1TB',price:'429.90',oldPrice:'599.90',image:'https://picsum.photos/seed/p6/600/400',brand:'Kingston',description:'SSD NVMe de 1TB com altas taxas de leitura e escrita, reduz tempo de carregamento de jogos e do sistema operacional.',specs:['Capacidade: 1TB','Interface: NVMe PCIe 3.0','Leitura seq.: 3500 MB/s','Gravação seq.: 3000 MB/s']},
	{id:7,title:'Placa de Vídeo RTX 4060',price:'2299.90',oldPrice:'2799.90',image:'https://picsum.photos/seed/p7/600/400',brand:'NVIDIA',description:'GPU para jogos em 1080p/1440p com suporte a ray tracing e DLSS para melhor desempenho e qualidade visual.',specs:['GPU: NVIDIA RTX 4060','VRAM: 8GB GDDR6','Ray Tracing: Sim','Conectores: HDMI, DisplayPort']},
	{id:8,title:'Fonte 650W 80+ Gold',price:'349.90',oldPrice:'429.90',image:'https://picsum.photos/seed/p8/600/400',brand:'Corsair',description:'Fonte 650W certificada 80 Plus Gold com cabeamento modular e proteção completa para seu PC.',specs:['Potência: 650W','Eficiência: 80+ Gold','Modular: Parcial/Full (varia)','Proteções: OVP, OCP, SCP']},
	{id:9,title:'Cadeira Gamer Pro',price:'899.90',oldPrice:'1199.90',image:'https://picsum.photos/seed/p9/600/400',brand:'DXRacer',description:'Cadeira ergonômica com suporte lombar ajustável, reclinação e materiais premium para conforto prolongado.',specs:['Reclinação: até 150°','Suporte lombar: ajustável','Material: PU couro premium','Capacidade: 150kg']},
	{id:10,title:'Webcam Full HD',price:'199.90',oldPrice:'249.90',image:'https://picsum.photos/seed/p10/600/400',brand:'Logitech',description:'Webcam Full HD 1080p com autofoco e microfone embutido, ideal para streaming e videochamadas.',specs:['Resolução: 1080p@30fps','Autofoco: Sim','Microfone: Stereo embutido','Conexão: USB-A/USB-C']},
	{id:11,title:'Microfone Condensador USB',price:'349.90',oldPrice:'449.90',image:'https://picsum.photos/seed/p11/600/400',brand:'Blue',description:'Microfone condensador USB para gravação e streaming com alta captação e controle de ganho.',specs:['Tipo: Condensador USB','Padrão polar: cardioide','Conexão: USB','Controle: ganho integrado']},
	{id:12,title:'Hub USB-C 7 portas',price:'129.90',oldPrice:'169.90',image:'https://picsum.photos/seed/p12/600/400',brand:'Anker',description:'Hub compacto com múltiplas portas USB, HDMI e leitor de cartão, ideal para notebooks modernos.',specs:['Portas: 3xUSB-A, 2xUSB-C, HDMI, Leitor SD','Resolução HDMI: até 4K@30Hz','Alimentação: pass-through']},
	{id:13,title:'Gabinete RGB',price:'299.90',oldPrice:'399.90',image:'https://picsum.photos/seed/p13/600/400',brand:'Cooler Master',description:'Gabinete ATX com fluxo de ar otimizado, vidro temperado e iluminação RGB pré-instalada.',specs:['Formato: Mid-Tower ATX','Painel: vidro temperado','Suporte GPU: até 330mm','Fans: 3x RGB inclusas']},
	{id:14,title:'Memória RAM 32GB DDR5',price:'799.90',oldPrice:'999.90',image:'https://picsum.photos/seed/p14/600/400',brand:'Corsair',description:'Kit 2x16GB DDR5 de alta frequência para tarefas intensivas e gaming com baixa latência.',specs:['Capacidade: 32GB (2x16GB)','Tipo: DDR5','Frequência: 5200MHz','CAS: CL38']},
	{id:15,title:'Kit Refrigeração Líquida',price:'499.90',oldPrice:'649.90',image:'https://picsum.photos/seed/p15/600/400',brand:'NZXT',description:'Kit AIO com radiador de 240mm, ventoinhas silenciosas e compatibilidade com sockets modernos.',specs:['Radiador: 240mm','Compatibilidade: Intel/AMD','Fans: 2x120mm','RGB: Sim']}
];

// Se estiver em uma página com #productGrid, buscar produtos da API e renderizar
async function renderProductsFromApi(){
	const grid = document.getElementById('productGrid');
	if (!grid) return;
	try{
		const res = await fetch('/api/products');
		let products = [];
		if (res.ok) products = await res.json();
		if (!products || !products.length) throw new Error('Sem produtos do servidor');

		grid.innerHTML = '';
		products.forEach(p => {
			const el = document.createElement('div');
			el.className = 'card-prod';
			el.innerHTML = `
				<img src="${p.image}" alt="${p.title}">
				<h3>${p.title}</h3>
				<p class="preco">R$ ${Number(p.price).toFixed(2).replace('.',',')}</p>
				<div style="display:flex;gap:8px">
				  <button class="btn btn-primary btn-comprar">Comprar</button>
				  <button class="btn btn-secondary btn-carrinho">Adicionar</button>
				  <button class="btn btn-secondary btn-info">Info</button>
				</div>
			`;
			grid.appendChild(el);
			// anexar objeto produto ao elemento para leitura futura
			el._product = p;
		});
		// re-bind buttons (pois novos elementos foram adicionados)
		const event = new Event('DOMContentLoaded');
		document.dispatchEvent(event);
	}catch(e){
		console.warn('Erro ao carregar produtos do servidor — usando fallback local', e && e.message);
		// usar fallback local
		grid.innerHTML = '';
		LOCAL_FALLBACK_PRODUCTS.forEach(p => {
			const el = document.createElement('div');
			el.className = 'card-prod';
			el.innerHTML = `
				<img src="${p.image}" alt="${p.title}">
				<h3>${p.title}</h3>
				<p class="preco">R$ ${Number(p.price).toFixed(2).replace('.',',')}</p>
				<div style="display:flex;gap:8px">
				  <button class="btn btn-primary btn-comprar">Comprar</button>
				  <button class="btn btn-secondary btn-carrinho">Adicionar</button>
				  <button class="btn btn-secondary btn-info">Info</button>
				</div>
			`;
			grid.appendChild(el);
			el._product = p;
		});
		const event = new Event('DOMContentLoaded');
		document.dispatchEvent(event);
	}
}

// tenta renderizar imediatamente
renderProductsFromApi();

