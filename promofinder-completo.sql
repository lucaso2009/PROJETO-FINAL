-- =====================================================================
--  PROMOFINDER — BANCO DE DADOS COMPLETO (MySQL 8+)
--  Projeto: ProjetoOrlando / PromoFinder
--  Compatível com BACKEND/db.js e server.js já existentes (tabelas
--  users e products mantêm os mesmos nomes/colunas), expandido com
--  todas as entidades que o site precisa para funcionar de ponta a
--  ponta: categorias, carrinho, pedidos, favoritos, avaliações,
--  endereços, métodos de pagamento, cupons e log de administração.
-- =====================================================================

DROP DATABASE IF EXISTS promofinder;
CREATE DATABASE promofinder
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE promofinder;

-- ---------------------------------------------------------------------
-- 1. CATEGORIAS
-- ---------------------------------------------------------------------
CREATE TABLE categorias (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  nome          VARCHAR(100) NOT NULL UNIQUE,
  slug          VARCHAR(120) NOT NULL UNIQUE,
  descricao     VARCHAR(255),
  criado_em     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 2. USUÁRIOS
--    (mesmas colunas usadas em BACKEND/db.js: name, email, senha)
-- ---------------------------------------------------------------------
CREATE TABLE users (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  name            VARCHAR(150) NOT NULL,
  email           VARCHAR(200) NOT NULL UNIQUE,
  senha           VARCHAR(255) NOT NULL,      -- armazenar sempre com hash (bcrypt)
  telefone        VARCHAR(20),
  role            ENUM('cliente','admin') NOT NULL DEFAULT 'cliente',
  ativo           TINYINT(1) NOT NULL DEFAULT 1,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 3. ENDEREÇOS (1 usuário -> N endereços, ex.: entrega/cobrança)
-- ---------------------------------------------------------------------
CREATE TABLE enderecos (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL,
  apelido       VARCHAR(60) DEFAULT 'Principal',
  cep           VARCHAR(10),
  logradouro    VARCHAR(200),
  numero        VARCHAR(20),
  complemento   VARCHAR(100),
  bairro        VARCHAR(100),
  cidade        VARCHAR(100),
  estado        CHAR(2),
  padrao        TINYINT(1) NOT NULL DEFAULT 0,
  criado_em     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_enderecos_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 4. MÉTODOS DE PAGAMENTO SALVOS PELO USUÁRIO
-- ---------------------------------------------------------------------
CREATE TABLE metodos_pagamento (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  user_id         INT NOT NULL,
  tipo            ENUM('cartao_credito','cartao_debito','pix','boleto') NOT NULL,
  apelido         VARCHAR(60),
  bandeira        VARCHAR(40),
  ultimos_digitos CHAR(4),
  nome_titular    VARCHAR(150),
  validade        VARCHAR(7),                 -- formato MM/AAAA
  padrao          TINYINT(1) NOT NULL DEFAULT 0,
  criado_em       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pagamento_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 5. PRODUTOS
--    (mesmas colunas usadas em BACKEND/db.js: title, brand, price,
--     oldPrice, image, description, specs)
-- ---------------------------------------------------------------------
CREATE TABLE products (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  categoria_id  INT,
  title         VARCHAR(255) NOT NULL,
  brand         VARCHAR(120),
  sku           VARCHAR(60) UNIQUE,
  price         DECIMAL(10,2) NOT NULL,
  oldPrice      DECIMAL(10,2),
  estoque       INT NOT NULL DEFAULT 0,
  image         VARCHAR(1000),
  description   TEXT,
  specs         JSON,
  ativo         TINYINT(1) NOT NULL DEFAULT 1,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_produto_categoria FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL,
  INDEX idx_products_categoria (categoria_id),
  INDEX idx_products_brand (brand)
) ENGINE=InnoDB;

-- Galeria de imagens extras por produto (além da imagem principal)
CREATE TABLE produto_imagens (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  produto_id    INT NOT NULL,
  url           VARCHAR(1000) NOT NULL,
  ordem         INT DEFAULT 0,
  CONSTRAINT fk_imagem_produto FOREIGN KEY (produto_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 6. FAVORITOS / LISTA DE DESEJOS
-- ---------------------------------------------------------------------
CREATE TABLE favoritos (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL,
  produto_id    INT NOT NULL,
  criado_em     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_favorito (user_id, produto_id),
  CONSTRAINT fk_favorito_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_favorito_produto FOREIGN KEY (produto_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 7. CARRINHO DE COMPRAS
-- ---------------------------------------------------------------------
CREATE TABLE carrinhos (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL,
  status        ENUM('aberto','convertido','abandonado') NOT NULL DEFAULT 'aberto',
  criado_em     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_carrinho_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE carrinho_itens (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  carrinho_id     INT NOT NULL,
  produto_id      INT NOT NULL,
  quantidade      INT NOT NULL DEFAULT 1,
  preco_unitario  DECIMAL(10,2) NOT NULL,
  UNIQUE KEY uq_item_carrinho (carrinho_id, produto_id),
  CONSTRAINT fk_item_carrinho FOREIGN KEY (carrinho_id) REFERENCES carrinhos(id) ON DELETE CASCADE,
  CONSTRAINT fk_item_produto FOREIGN KEY (produto_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 8. CUPONS DE DESCONTO
-- ---------------------------------------------------------------------
CREATE TABLE cupons (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  codigo            VARCHAR(40) NOT NULL UNIQUE,
  tipo_desconto     ENUM('percentual','valor_fixo') NOT NULL DEFAULT 'percentual',
  valor             DECIMAL(10,2) NOT NULL,
  valido_de         DATE,
  valido_ate        DATE,
  uso_maximo        INT DEFAULT NULL,
  usos_atuais       INT NOT NULL DEFAULT 0,
  ativo             TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 9. PEDIDOS
-- ---------------------------------------------------------------------
CREATE TABLE pedidos (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  user_id           INT NOT NULL,
  endereco_id       INT,
  metodo_pagamento_id INT,
  cupom_id          INT,
  status            ENUM('pendente','pago','enviado','entregue','cancelado') NOT NULL DEFAULT 'pendente',
  subtotal          DECIMAL(10,2) NOT NULL,
  desconto          DECIMAL(10,2) NOT NULL DEFAULT 0,
  frete             DECIMAL(10,2) NOT NULL DEFAULT 0,
  total             DECIMAL(10,2) NOT NULL,
  criado_em         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_pedido_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_pedido_endereco FOREIGN KEY (endereco_id) REFERENCES enderecos(id) ON DELETE SET NULL,
  CONSTRAINT fk_pedido_pagamento FOREIGN KEY (metodo_pagamento_id) REFERENCES metodos_pagamento(id) ON DELETE SET NULL,
  CONSTRAINT fk_pedido_cupom FOREIGN KEY (cupom_id) REFERENCES cupons(id) ON DELETE SET NULL,
  INDEX idx_pedidos_user (user_id),
  INDEX idx_pedidos_status (status)
) ENGINE=InnoDB;

CREATE TABLE pedido_itens (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id       INT NOT NULL,
  produto_id      INT,
  titulo_produto  VARCHAR(255) NOT NULL,   -- snapshot do nome no momento da compra
  quantidade      INT NOT NULL DEFAULT 1,
  preco_unitario  DECIMAL(10,2) NOT NULL,
  subtotal        DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_itempedido_pedido FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
  CONSTRAINT fk_itempedido_produto FOREIGN KEY (produto_id) REFERENCES products(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 10. AVALIAÇÕES DE PRODUTOS
-- ---------------------------------------------------------------------
CREATE TABLE avaliacoes (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  produto_id    INT NOT NULL,
  user_id       INT NOT NULL,
  nota          TINYINT NOT NULL CHECK (nota BETWEEN 1 AND 5),
  comentario    TEXT,
  criado_em     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_avaliacao (produto_id, user_id),
  CONSTRAINT fk_avaliacao_produto FOREIGN KEY (produto_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT fk_avaliacao_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 11. REDEFINIÇÃO DE SENHA (tokens temporários)
-- ---------------------------------------------------------------------
CREATE TABLE redefinicao_senha (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL,
  token         VARCHAR(255) NOT NULL,
  expira_em     TIMESTAMP NOT NULL,
  usado         TINYINT(1) NOT NULL DEFAULT 0,
  criado_em     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reset_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 12. LOG DE AÇÕES DO ADMIN (painel ADM/*)
-- ---------------------------------------------------------------------
CREATE TABLE admin_logs (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  admin_id      INT NOT NULL,
  acao          VARCHAR(100) NOT NULL,      -- ex: 'criou_produto', 'excluiu_produto', 'editou_usuario'
  entidade      VARCHAR(50),                -- ex: 'produto', 'usuario'
  entidade_id   INT,
  detalhes      JSON,
  criado_em     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_log_admin FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;


-- =====================================================================
--  DADOS DE EXEMPLO (SEED)
-- =====================================================================

-- Categorias
INSERT INTO categorias (nome, slug, descricao) VALUES
('Notebooks','notebooks','Notebooks e laptops em geral'),
('Periféricos','perifericos','Mouses, teclados, headsets e webcams'),
('Monitores','monitores','Monitores e telas'),
('Componentes','componentes','SSDs, placas de vídeo, memórias, fontes e gabinetes'),
('Cadeiras e Móveis','cadeiras-moveis','Cadeiras e móveis para setup'),
('Áudio','audio','Microfones e equipamentos de áudio');

-- Usuários (1 admin + 3 clientes). Em produção, "senha" deve ser hash bcrypt.
INSERT INTO users (name, email, senha, telefone, role) VALUES
('Admin','admin@promofinder.local','admin123', NULL, 'admin'),
('Lucas Orlando','lucas@example.com','$2b$10$exemplo.hash.de.senha.aqui', '48999990001', 'cliente'),
('Maria Souza','maria@example.com','$2b$10$exemplo.hash.de.senha.aqui', '48999990002', 'cliente'),
('João Pereira','joao@example.com','$2b$10$exemplo.hash.de.senha.aqui', '48999990003', 'cliente');

-- Endereços
INSERT INTO enderecos (user_id, apelido, cep, logradouro, numero, bairro, cidade, estado, padrao) VALUES
(2, 'Casa', '88701-000', 'Rua das Flores', '120', 'Centro', 'Tubarão', 'SC', 1),
(3, 'Casa', '88010-400', 'Av. Beira Mar Norte', '500', 'Centro', 'Florianópolis', 'SC', 1),
(4, 'Trabalho', '01310-100', 'Av. Paulista', '1000', 'Bela Vista', 'São Paulo', 'SP', 1);

-- Métodos de pagamento salvos
INSERT INTO metodos_pagamento (user_id, tipo, apelido, bandeira, ultimos_digitos, nome_titular, validade, padrao) VALUES
(2, 'cartao_credito', 'Cartão principal', 'Visa', '4242', 'LUCAS ORLANDO', '08/2029', 1),
(3, 'pix', 'Pix pessoal', NULL, NULL, 'MARIA SOUZA', NULL, 1);

-- Produtos (15 itens, mesmos da loja original + categoria associada)
INSERT INTO products (categoria_id, title, brand, sku, price, oldPrice, estoque, image, description, specs) VALUES
(1,'Notebook Gamer Acer Nitro V15','Acer','NB-ACER-NV15',4299.90,5499.90,12,'https://picsum.photos/seed/p1/600/400','Notebook gamer com processador Intel i7 de 10ª geração, 16GB RAM, SSD 512GB e GPU dedicada para jogos e edição de vídeo.', JSON_ARRAY('CPU: Intel i7-10750H','RAM: 16GB DDR4','SSD: 512GB NVMe','GPU: NVIDIA GTX 1660 Ti','Tela: 15.6" FHD 144Hz')),
(2,'Headset Gamer HyperX Cloud','HyperX','PH-HX-CLOUD',249.90,349.90,40,'https://picsum.photos/seed/p2/600/400','Headset com drivers de 53mm, almofadas confortáveis e microfone com cancelamento de ruído.', JSON_ARRAY('Drivers: 53mm','Conector: 3.5mm','Microfone: cancelamento de ruído','Peso: 300g')),
(2,'Teclado Mecânico Redragon','Redragon','TC-RDG-MEC',349.90,449.90,25,'https://picsum.photos/seed/p3/600/400','Teclado mecânico compacto com switches Outemu, retroiluminação RGB e construção em alumínio resistente.', JSON_ARRAY('Switches: Outemu Red/Blue','Layout: Tenkeyless/Full','RGB: endereçável','Conexão: USB-C')),
(2,'Mouse Gamer Logitech G502','Logitech','MS-LOG-G502',299.90,399.90,35,'https://picsum.photos/seed/p4/600/400','Mouse com sensor avançado, 11 botões programáveis e ajuste de peso para máxima precisão em jogos.', JSON_ARRAY('Sensor: HERO 25K','DPI: até 25600','Botões: 11 programáveis','Peso ajustável')),
(3,'Monitor 27" 144Hz','Samsung','MN-SAM-27144',1599.90,1999.90,18,'https://picsum.photos/seed/p5/600/400','Monitor 27" com painel IPS, taxa de atualização de 144Hz e tempo de resposta rápido.', JSON_ARRAY('Tamanho: 27"','Resolução: 1920x1080','Painel: IPS','Refresh: 144Hz')),
(4,'SSD NVMe 1TB','Kingston','SSD-KING-1TB',429.90,599.90,50,'https://picsum.photos/seed/p6/600/400','SSD NVMe de 1TB com altas taxas de leitura e escrita.', JSON_ARRAY('Capacidade: 1TB','Interface: NVMe PCIe 3.0','Leitura seq.: 3500 MB/s','Gravação seq.: 3000 MB/s')),
(4,'Placa de Vídeo RTX 4060','NVIDIA','GPU-NV-4060',2299.90,2799.90,9,'https://picsum.photos/seed/p7/600/400','GPU com suporte a ray tracing e DLSS para desempenho e qualidade visual.', JSON_ARRAY('GPU: NVIDIA RTX 4060','VRAM: 8GB GDDR6','Ray Tracing: Sim','Conectores: HDMI, DisplayPort')),
(4,'Fonte 650W 80+ Gold','Corsair','PSU-CSR-650',349.90,429.90,22,'https://picsum.photos/seed/p8/600/400','Fonte 650W certificada 80 Plus Gold com cabeamento modular.', JSON_ARRAY('Potência: 650W','Eficiência: 80+ Gold','Proteções: OVP, OCP, SCP')),
(5,'Cadeira Gamer Pro','DXRacer','CAD-DXR-PRO',899.90,1199.90,14,'https://picsum.photos/seed/p9/600/400','Cadeira ergonômica com suporte lombar ajustável, reclinação e materiais premium.', JSON_ARRAY('Reclinação: até 150°','Suporte lombar: ajustável','Material: PU couro premium','Capacidade: 150kg')),
(2,'Webcam Full HD','Logitech','WC-LOG-FHD',199.90,249.90,30,'https://picsum.photos/seed/p10/600/400','Webcam Full HD 1080p com autofoco e microfone embutido.', JSON_ARRAY('Resolução: 1080p@30fps','Autofoco: Sim','Microfone: Stereo embutido')),
(6,'Microfone Condensador USB','Blue','MIC-BLUE-USB',349.90,449.90,17,'https://picsum.photos/seed/p11/600/400','Microfone condensador USB para gravação e streaming com alta captação.', JSON_ARRAY('Tipo: Condensador USB','Padrão polar: cardioide','Conexão: USB')),
(2,'Hub USB-C 7 portas','Anker','HUB-ANK-7P',129.90,169.90,45,'https://picsum.photos/seed/p12/600/400','Hub compacto com múltiplas portas USB, HDMI e leitor de cartão.', JSON_ARRAY('Portas: 3xUSB-A, 2xUSB-C, HDMI, Leitor SD','Resolução HDMI: até 4K@30Hz')),
(4,'Gabinete RGB','Cooler Master','GAB-CM-RGB',299.90,399.90,20,'https://picsum.photos/seed/p13/600/400','Gabinete ATX com fluxo de ar otimizado, vidro temperado e iluminação RGB.', JSON_ARRAY('Formato: Mid-Tower ATX','Painel: vidro temperado','Suporte GPU: até 330mm','Fans: 3x RGB inclusas')),
(4,'Memória RAM 32GB DDR5','Corsair','RAM-CSR-32D5',799.90,999.90,28,'https://picsum.photos/seed/p14/600/400','Kit 2x16GB DDR5 de alta frequência para tarefas intensivas e gaming.', JSON_ARRAY('Capacidade: 32GB (2x16GB)','Tipo: DDR5','Frequência: 5200MHz','CAS: CL38')),
(4,'Kit Refrigeração Líquida','NZXT','AIO-NZXT-240',499.90,649.90,16,'https://picsum.photos/seed/p15/600/400','Kit AIO com radiador de 240mm, ventoinhas silenciosas e compatibilidade com sockets modernos.', JSON_ARRAY('Radiador: 240mm','Compatibilidade: Intel/AMD','Fans: 2x120mm','RGB: Sim'));

-- Favoritos de exemplo
INSERT INTO favoritos (user_id, produto_id) VALUES
(2, 1), (2, 7), (3, 5), (4, 9);

-- Carrinho aberto de exemplo (usuário 2)
INSERT INTO carrinhos (user_id, status) VALUES (2, 'aberto');
INSERT INTO carrinho_itens (carrinho_id, produto_id, quantidade, preco_unitario) VALUES
(1, 2, 1, 249.90),
(1, 4, 2, 299.90);

-- Cupom de exemplo
INSERT INTO cupons (codigo, tipo_desconto, valor, valido_de, valido_ate, uso_maximo) VALUES
('BEMVINDO10', 'percentual', 10.00, '2026-01-01', '2026-12-31', 500);

-- Pedido de exemplo (usuário 3 comprou o monitor)
INSERT INTO pedidos (user_id, endereco_id, metodo_pagamento_id, cupom_id, status, subtotal, desconto, frete, total) VALUES
(3, 2, 2, NULL, 'pago', 1599.90, 0.00, 29.90, 1629.80);
INSERT INTO pedido_itens (pedido_id, produto_id, titulo_produto, quantidade, preco_unitario, subtotal) VALUES
(1, 5, 'Monitor 27" 144Hz', 1, 1599.90, 1599.90);

-- Avaliações de exemplo
INSERT INTO avaliacoes (produto_id, user_id, nota, comentario) VALUES
(5, 3, 5, 'Excelente custo-benefício, chegou rápido.'),
(1, 2, 4, 'Notebook muito bom, mas esquenta um pouco em jogos pesados.');


-- =====================================================================
--  VIEWS ÚTEIS PARA O PAINEL ADMIN (relatorios.html)
-- =====================================================================

-- Produtos atualmente em promoção (oldPrice > price)
CREATE OR REPLACE VIEW vw_produtos_promocao AS
SELECT id, title, brand, price, oldPrice,
       ROUND(100 - (price / oldPrice * 100), 1) AS desconto_percentual
FROM products
WHERE oldPrice IS NOT NULL AND oldPrice > price AND ativo = 1;

-- Resumo de vendas por status de pedido
CREATE OR REPLACE VIEW vw_resumo_pedidos AS
SELECT status, COUNT(*) AS total_pedidos, SUM(total) AS valor_total
FROM pedidos
GROUP BY status;

-- Produtos mais vendidos
CREATE OR REPLACE VIEW vw_produtos_mais_vendidos AS
SELECT pi.produto_id, p.title, SUM(pi.quantidade) AS total_vendido
FROM pedido_itens pi
JOIN products p ON p.id = pi.produto_id
GROUP BY pi.produto_id, p.title
ORDER BY total_vendido DESC;