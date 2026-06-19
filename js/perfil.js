document.addEventListener('DOMContentLoaded', () => {
    const usuarioFlag = localStorage.getItem('usuario');
    if (!usuarioFlag) {
        window.location.href = 'index.html';
        return;
    }

    const emailLogged = localStorage.getItem('usuario_email');
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    let current = null;
    if (emailLogged) current = usuarios.find(u => u.email === emailLogged);
    if (!current && usuarios.length) current = usuarios[usuarios.length-1];

    const nameInput = document.getElementById('perfil_nome');
    const emailInput = document.getElementById('perfil_email');
    const telInput = document.getElementById('perfil_telefone');
    const addrInput = document.getElementById('perfil_endereco');
    const saveBtn = document.getElementById('perfil_salvar');

    // preencher campos
    if (current) {
        if (nameInput) nameInput.value = current.nome || '';
        if (emailInput) emailInput.value = current.email || '';
        if (telInput) telInput.value = current.telefone || '';
        if (addrInput) addrInput.value = current.endereco || '';
        // inicializa arrays de enderecos e pagamentos
        if (!current.enderecos) current.enderecos = (current.enderecos || []);
        if (!current.pagamentos) current.pagamentos = (current.pagamentos || []);
    }

    function persistUser(updated) {
        const idx = usuarios.findIndex(u => u.email === (current && current.email));
        if (idx >= 0) {
            usuarios[idx] = Object.assign({}, usuarios[idx], updated);
        } else {
            usuarios.push(updated);
        }
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
        // se o email mudou, atualiza o marcador de usuário logado
        if (updated.email) localStorage.setItem('usuario_email', updated.email);
    }

    if (saveBtn) {
        saveBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const novoNome = nameInput.value.trim();
            const novoEmail = emailInput.value.trim();
            const novoTel = telInput.value.trim();
            const novoEndereco = addrInput.value.trim();
            if (!novoNome || !novoEmail) {
                alert('Nome e e-mail são obrigatórios.');
                return;
            }
            persistUser({ nome: novoNome, email: novoEmail, telefone: novoTel, endereco: novoEndereco, senha: (current && current.senha) });
            alert('Dados salvos com sucesso.');
        });
    }

    // alterar senha
    const changeBtn = document.getElementById('perfil_changePwd');
    if (changeBtn) {
        changeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const cur = document.getElementById('perfil_curPwd').value || '';
            const np = document.getElementById('perfil_newPwd').value || '';
            const np2 = document.getElementById('perfil_newPwd2').value || '';
            if (!cur || !np) { alert('Preencha as senhas.'); return; }
            if (!current) { alert('Usuário não encontrado.'); return; }
            if (cur !== current.senha) { alert('Senha atual incorreta.'); return; }
            if (np !== np2) { alert('A nova senha e a confirmação não coincidem.'); return; }
            // salvar
            persistUser(Object.assign({}, current, { senha: np }));
            alert('Senha alterada com sucesso.');
            document.getElementById('perfil_curPwd').value = '';
            document.getElementById('perfil_newPwd').value = '';
            document.getElementById('perfil_newPwd2').value = '';
        });
    }

    // carregar pedidos (se houver)
    const pedidos = JSON.parse(localStorage.getItem('pedidos') || '[]');
    const pedidosList = document.getElementById('perfil_pedidos');
    if (pedidosList) {
        const userPedidos = pedidos.filter(p => (p.email || '') === (current && current.email));
        if (!userPedidos.length) {
            pedidosList.innerHTML = '<p>Você ainda não possui pedidos.</p>';
        } else {
            pedidosList.innerHTML = '';
            userPedidos.forEach(p => {
                const div = document.createElement('div');
                div.className = 'card-prod';
                div.style.padding = '12px';
                div.innerHTML = `<div><strong>Pedido #${p.id || '—'}</strong><div>Itens: ${p.items ? p.items.length : 0}</div><div>Total: R$ ${p.total ? Number(p.total).toFixed(2).replace('.',',') : '0,00'}</div></div>`;
                pedidosList.appendChild(div);
            });
        }
    }

    /* --- Endereços e Pagamentos --- */
    const endList = document.getElementById('perfil_enderecos_list');
    const endNovo = document.getElementById('perfil_endereco_novo');
    const addEndBtn = document.getElementById('perfil_addEndereco');

    function renderEnderecos(){
        if (!endList) return;
        const list = (current && current.enderecos) || [];
        if (!list.length) {
            endList.innerHTML = '<p>Nenhum endereço cadastrado.</p>';
            return;
        }
        endList.innerHTML = '';
        list.forEach((e, i) => {
            const d = document.createElement('div');
            d.className = 'card-prod';
            d.style.display = 'flex';
            d.style.justifyContent = 'space-between';
            d.style.alignItems = 'center';
            d.style.padding = '10px';
            d.innerHTML = `<div style="flex:1">${e}</div><div style="display:flex; gap:8px"><button data-i="${i}" class="btn btn-secondary editar-end">Editar</button><button data-i="${i}" class="btn remover-end">Remover</button></div>`;
            endList.appendChild(d);
        });
        // bind
        endList.querySelectorAll('.remover-end').forEach(b => b.addEventListener('click', (ev)=>{
            const idx = Number(ev.target.dataset.i);
            current.enderecos.splice(idx,1);
            persistUser(current);
            renderEnderecos();
        }));
        endList.querySelectorAll('.editar-end').forEach(b => b.addEventListener('click', (ev)=>{
            const idx = Number(ev.target.dataset.i);
            const novo = prompt('Editar endereço:', current.enderecos[idx] || '');
            if (novo!==null) {
                current.enderecos[idx] = novo.trim();
                persistUser(current);
                renderEnderecos();
            }
        }));
    }

    if (addEndBtn && endNovo) {
        addEndBtn.addEventListener('click', (e)=>{
            e.preventDefault();
            const v = endNovo.value.trim();
            if (!v) { alert('Digite um endereço.'); return; }
            current.enderecos = current.enderecos || [];
            current.enderecos.push(v);
            persistUser(current);
            endNovo.value = '';
            renderEnderecos();
        });
    }

    const payList = document.getElementById('perfil_pagamentos_list');
    const payTipo = document.getElementById('perfil_pagamento_tipo');
    const payLabel = document.getElementById('perfil_pagamento_label');
    const addPayBtn = document.getElementById('perfil_addPagamento');

    function renderPagamentos(){
        if (!payList) return;
        const list = (current && current.pagamentos) || [];
        if (!list.length) { payList.innerHTML = '<p>Nenhum método de pagamento.</p>'; return; }
        payList.innerHTML = '';
        list.forEach((p, i) => {
            const d = document.createElement('div');
            d.className = 'card-prod';
            d.style.display = 'flex';
            d.style.justifyContent = 'space-between';
            d.style.alignItems = 'center';
            d.style.padding = '10px';
            d.innerHTML = `<div style="flex:1">${p.tipo.toUpperCase()} — ${p.label || ''}</div><div style="display:flex; gap:8px"><button data-i="${i}" class="btn btn-secondary editar-pay">Editar</button><button data-i="${i}" class="btn remover-pay">Remover</button></div>`;
            payList.appendChild(d);
        });
        payList.querySelectorAll('.remover-pay').forEach(b => b.addEventListener('click', (ev)=>{
            const idx = Number(ev.target.dataset.i);
            current.pagamentos.splice(idx,1);
            persistUser(current);
            renderPagamentos();
        }));
        payList.querySelectorAll('.editar-pay').forEach(b => b.addEventListener('click', (ev)=>{
            const idx = Number(ev.target.dataset.i);
            const novo = prompt('Editar descrição do método:', current.pagamentos[idx].label || '');
            if (novo!==null) {
                current.pagamentos[idx].label = novo.trim();
                persistUser(current);
                renderPagamentos();
            }
        }));
    }

    if (addPayBtn && payTipo && payLabel) {
        addPayBtn.addEventListener('click', (e)=>{
            e.preventDefault();
            const tipo = payTipo.value;
            const label = payLabel.value.trim();
            if (!tipo) { alert('Selecione um tipo.'); return; }
            current.pagamentos = current.pagamentos || [];
            current.pagamentos.push({ tipo, label });
            persistUser(current);
            payLabel.value = '';
            renderPagamentos();
        });
    }

    // inicial render
    renderEnderecos();
    renderPagamentos();

});
