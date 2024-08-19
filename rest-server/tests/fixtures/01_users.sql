-- The password for all users is secured123456

INSERT INTO users (id, name, email, password, avatar, roles, phone)
VALUES (1, 'breno bastos dos santos', 'bbastos@devcorp.tech',
        '$argon2id$v=19$m=19456,t=2,p=1$G2nrIJh5Ghaoo/vsmUPGLA$31PMfoNZwJn0/TBx5O6qF0Sz+vCu6LLpx1ygUuZndqs',
        '0JwEKZawzGM', '{3}', '18263928374'),
       (2, 'iago lobo', 'ilobo@innovatehub.net',
        '$argon2id$v=19$m=19456,t=2,p=1$G2nrIJh5Ghaoo/vsmUPGLA$31PMfoNZwJn0/TBx5O6qF0Sz+vCu6LLpx1ygUuZndqs',
        '8MCWjqqhxMQ', '{4}', NULL),
       (3, 'artur cardoso', 'acardoso@futuretech.io',
        '$argon2id$v=19$m=19456,t=2,p=1$G2nrIJh5Ghaoo/vsmUPGLA$31PMfoNZwJn0/TBx5O6qF0Sz+vCu6LLpx1ygUuZndqs',
        'DA4PDxcXHg8', '{4}', NULL),
       (4, 'thiago nazário', 'tnazario@nextgenlabs.co',
        '$argon2id$v=19$m=19456,t=2,p=1$G2nrIJh5Ghaoo/vsmUPGLA$31PMfoNZwJn0/TBx5O6qF0Sz+vCu6LLpx1ygUuZndqs',
        'csmMqJaTaWI', '{4}', NULL),
       (5, 'cláudio carmo', 'ccarmo@visionaryventures.xyz',
        '$argon2id$v=19$m=19456,t=2,p=1$G2nrIJh5Ghaoo/vsmUPGLA$31PMfoNZwJn0/TBx5O6qF0Sz+vCu6LLpx1ygUuZndqs',
        NULL, '{4}', NULL),
       (6, 'gabriel neves', 'gneves@pioneerspace.ai',
        '$argon2id$v=19$m=19456,t=2,p=1$G2nrIJh5Ghaoo/vsmUPGLA$31PMfoNZwJn0/TBx5O6qF0Sz+vCu6LLpx1ygUuZndqs',
        '0emMjJSUjS8', '{3}', '02937462513'),
       (7, 'nicolas fraga', 'nfraga@quantumquorum.tech',
        '$argon2id$v=19$m=19456,t=2,p=1$G2nrIJh5Ghaoo/vsmUPGLA$31PMfoNZwJn0/TBx5O6qF0Sz+vCu6LLpx1ygUuZndqs',
        'cdyc6Pj5aPI', '{3}', NULL),
       (8, 'elisandra cruz', 'ecruz@stellarstartups.com',
        '$argon2id$v=19$m=19456,t=2,p=1$G2nrIJh5Ghaoo/vsmUPGLA$31PMfoNZwJn0/TBx5O6qF0Sz+vCu6LLpx1ygUuZndqs',
        'Ip6OjgaGjA0', '{3}', '73416382917'),
       (9, 'bruna salles', 'bsalles@cosmiccoders.io',
        '$argon2id$v=19$m=19456,t=2,p=1$G2nrIJh5Ghaoo/vsmUPGLA$31PMfoNZwJn0/TBx5O6qF0Sz+vCu6LLpx1ygUuZndqs',
        'cBgULC7iREw', '{4}', '94832743726'),
       (10, 'franciane saraiva', 'fsaraiva@neotech.network',
        '$argon2id$v=19$m=19456,t=2,p=1$G2nrIJh5Ghaoo/vsmUPGLA$31PMfoNZwJn0/TBx5O6qF0Sz+vCu6LLpx1ygUuZndqs',
        '4EfGy4fnZuM', '{4}', NULL),
       (11, 'ana beatriz', 'abeatriz@sparkleweb.dev',
        '$argon2id$v=19$m=19456,t=2,p=1$G2nrIJh5Ghaoo/vsmUPGLA$31PMfoNZwJn0/TBx5O6qF0Sz+vCu6LLpx1ygUuZndqs',
        '8fDVj4eXnYw', '{3}', NULL),
       (12, 'carlos eduardo', 'ceduardo@quantumbyte.net',
        '$argon2id$v=19$m=19456,t=2,p=1$G2nrIJh5Ghaoo/vsmUPGLA$31PMfoNZwJn0/TBx5O6qF0Sz+vCu6LLpx1ygUuZndqs',
        'xsWEjJaUjIw', '{4}', NULL),
       (13, 'fernanda lima', 'flima@cosmiccode.io',
        '$argon2id$v=19$m=19456,t=2,p=1$G2nrIJh5Ghaoo/vsmUPGLA$31PMfoNZwJn0/TBx5O6qF0Sz+vCu6LLpx1ygUuZndqs',
        'aMzOjp6Wzs8', '{3}', '48372615283'),
       (14, 'guilherme silva', 'gsilva@nebulacloud.co',
        '$argon2id$v=19$m=19456,t=2,p=1$G2nrIJh5Ghaoo/vsmUPGLA$31PMfoNZwJn0/TBx5O6qF0Sz+vCu6LLpx1ygUuZndqs',
        NULL, '{4}', '93827384792'),
       (15, 'helena costa', 'hcosta@galacticgrid.xyz',
        '$argon2id$v=19$m=19456,t=2,p=1$G2nrIJh5Ghaoo/vsmUPGLA$31PMfoNZwJn0/TBx5O6qF0Sz+vCu6LLpx1ygUuZndqs',
        '8N6ei5uScvA', '{4}', NULL),
       (16, 'ivan pereira', 'ipereira@stardustlab.ai',
        '$argon2id$v=19$m=19456,t=2,p=1$G2nrIJh5Ghaoo/vsmUPGLA$31PMfoNZwJn0/TBx5O6qF0Sz+vCu6LLpx1ygUuZndqs',
        'CYaGjpYGByw', '{3}', '10293847369'),
       (17, 'juliana martins', 'jmartins@moonlightmedia.tech',
        '$argon2id$v=19$m=19456,t=2,p=1$G2nrIJh5Ghaoo/vsmUPGLA$31PMfoNZwJn0/TBx5O6qF0Sz+vCu6LLpx1ygUuZndqs',
        'JkyOjtOw6c4', '{4}', NULL),
       (18, 'leonardo santos', 'lsantos@solarflare.network',
        '$argon2id$v=19$m=19456,t=2,p=1$G2nrIJh5Ghaoo/vsmUPGLA$31PMfoNZwJn0/TBx5O6qF0Sz+vCu6LLpx1ygUuZndqs',
        'M02PS5cXbXM', '{4}', NULL),
       (19, 'mariana oliveira', 'moliveira@cometcore.com',
        '$argon2id$v=19$m=19456,t=2,p=1$G2nrIJh5Ghaoo/vsmUPGLA$31PMfoNZwJn0/TBx5O6qF0Sz+vCu6LLpx1ygUuZndqs',
        'sGTOzpeXns4', '{3}', '93827162382'),
       (20, 'nelson ferreira', 'nferreira@asteroidapps.io',
        '$argon2id$v=19$m=19456,t=2,p=1$G2nrIJh5Ghaoo/vsmUPGLA$31PMfoNZwJn0/TBx5O6qF0Sz+vCu6LLpx1ygUuZndqs',
        'YJSECACghIY', '{3}', NULL);