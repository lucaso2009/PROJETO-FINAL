-- Esquema básico para banco de dados MySQL

CREATE DATABASE IF NOT EXISTS promofinder;
USE promofinder;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(200) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  brand VARCHAR(120),
  price DECIMAL(10,2) NOT NULL,
  oldPrice DECIMAL(10,2),
  image VARCHAR(1000),
  description TEXT,
  specs JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserts de exemplo (15 produtos)
INSERT INTO products (title, brand, price, oldPrice, image, description, specs) VALUES
('Notebook Gamer Acer Nitro V15','Acer',4299.90,5499.90,'https://picsum.photos/seed/p1/600/400','Notebook gamer com processador Intel i7 de 10ª geração, 16GB RAM, SSD 512GB e GPU dedicada para jogos e edição de vídeo.', JSON_ARRAY('CPU: Intel i7-10750H','RAM: 16GB DDR4','SSD: 512GB NVMe','GPU: NVIDIA GTX 1660 Ti','Tela: 15.6" FHD 144Hz')),
('Headset Gamer HyperX Cloud','HyperX',249.90,349.90,'https://picsum.photos/seed/p2/600/400','Headset com drivers de 53mm, almofadas confortáveis e microfone com cancelamento de ruído.', JSON_ARRAY('Drivers: 53mm','Conector: 3.5mm','Microfone: cancelamento de ruído','Peso: 300g')),
('Teclado Mecânico Redragon','Redragon',349.90,449.90,'https://picsum.photos/seed/p3/600/400','Teclado mecânico compacto com switches Outemu, retroiluminação RGB e construção em alumínio resistente.', JSON_ARRAY('Switches: Outemu Red/Blue','Layout: Tenkeyless/Full','RGB: endereçável','Conexão: USB-C')),
('Mouse Gamer Logitech G502','Logitech',299.90,399.90,'https://picsum.photos/seed/p4/600/400','Mouse com sensor avançado, 11 botões programáveis e ajuste de peso para máxima precisão em jogos.', JSON_ARRAY('Sensor: HERO 25K','DPI: até 25600','Botões: 11 programáveis','Peso ajustável')),
('Monitor 27" 144Hz','Samsung',1599.90,1999.90,'https://picsum.photos/seed/p5/600/400','Monitor 27" com painel IPS, taxa de atualização de 144Hz e tempo de resposta rápido.', JSON_ARRAY('Tamanho: 27"','Resolução: 1920x1080','Painel: IPS','Refresh: 144Hz')),
('SSD NVMe 1TB','Kingston',429.90,599.90,'https://picsum.photos/seed/p6/600/400','SSD NVMe de 1TB com altas taxas de leitura e escrita.', JSON_ARRAY('Capacidade: 1TB','Interface: NVMe PCIe 3.0','Leitura seq.: 3500 MB/s','Gravação seq.: 3000 MB/s')),
('Placa de Vídeo RTX 4060','NVIDIA',2299.90,2799.90,'https://picsum.photos/seed/p7/600/400','GPU com suporte a ray tracing e DLSS para desempenho e qualidade visual.', JSON_ARRAY('GPU: NVIDIA RTX 4060','VRAM: 8GB GDDR6','Ray Tracing: Sim','Conectores: HDMI, DisplayPort')),
('Fonte 650W 80+ Gold','Corsair',349.90,429.90,'https://picsum.photos/seed/p8/600/400','Fonte 650W certificada 80 Plus Gold com cabeamento modular.', JSON_ARRAY('Potência: 650W','Eficiência: 80+ Gold','Proteções: OVP, OCP, SCP')),
('Cadeira Gamer Pro','DXRacer',899.90,1199.90,'https://picsum.photos/seed/p9/600/400','Cadeira ergonômica com suporte lombar ajustável, reclinação e materiais premium.', JSON_ARRAY('Reclinação: até 150°','Suporte lombar: ajustável','Material: PU couro premium','Capacidade: 150kg')),
('Webcam Full HD','Logitech',199.90,249.90,'https://picsum.photos/seed/p10/600/400','Webcam Full HD 1080p com autofoco e microfone embutido.', JSON_ARRAY('Resolução: 1080p@30fps','Autofoco: Sim','Microfone: Stereo embutido')),
('Microfone Condensador USB','Blue',349.90,449.90,'https://picsum.photos/seed/p11/600/400','Microfone condensador USB para gravação e streaming com alta captação.', JSON_ARRAY('Tipo: Condensador USB','Padrão polar: cardioide','Conexão: USB')),
('Hub USB-C 7 portas','Anker',129.90,169.90,'https://picsum.photos/seed/p12/600/400','Hub compacto com múltiplas portas USB, HDMI e leitor de cartão.', JSON_ARRAY('Portas: 3xUSB-A, 2xUSB-C, HDMI, Leitor SD','Resolução HDMI: até 4K@30Hz')),
('Gabinete RGB','Cooler Master',299.90,399.90,'https://picsum.photos/seed/p13/600/400','Gabinete ATX com fluxo de ar otimizado, vidro temperado e iluminação RGB.', JSON_ARRAY('Formato: Mid-Tower ATX','Painel: vidro temperado','Suporte GPU: até 330mm','Fans: 3x RGB inclusas')),
('Memória RAM 32GB DDR5','Corsair',799.90,999.90,'https://picsum.photos/seed/p14/600/400','Kit 2x16GB DDR5 de alta frequência para tarefas intensivas e gaming.', JSON_ARRAY('Capacidade: 32GB (2x16GB)','Tipo: DDR5','Frequência: 5200MHz','CAS: CL38')),
('Kit Refrigeração Líquida','NZXT',499.90,649.90,'https://picsum.photos/seed/p15/600/400','Kit AIO com radiador de 240mm, ventoinhas silenciosas e compatibilidade com sockets modernos.', JSON_ARRAY('Radiador: 240mm','Compatibilidade: Intel/AMD','Fans: 2x120mm','RGB: Sim'));

INSERT INTO users (name, email, senha) VALUES ('Admin','admin@promofinder.local','admin123');
