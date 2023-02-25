-- Address

insert into hivetown.address (id, number, door, floor, zip_code, street, parish, county, city, district, latitude, longitude) values (1, 40, '15', 0, '2690-147', 'Rua Barbosa du Bocage', 'Santa Iria de Azóia','Loures', 'Loures', 'Lisboa', 38.8403484, -9.1062978);
insert into hivetown.address (id, number, door, floor, zip_code, street, parish, county, city, district, latitude, longitude) values (2, 42, '32', 0, '4415-005', 'Calçada Barrosa', 'União das Freguesias de Serzedo e Perosinho', 'Vila Nova de Gaia', 'Perosinho', 'Porto', 41.0623236, -8.5828152);
insert into hivetown.address (id, number, door, floor, zip_code, street, parish, county, city, district, latitude, longitude) values (3, 51, '3', 2, '3060-816', 'Beco seixa;', 'Sanguinheira', 'Cantanhede', 'Coimbra', 'Coimbra', 40.3206366, -8.708013);
insert into hivetown.address (id, number, door, floor, zip_code, street, parish, county, city, district, latitude, longitude) values (4, 13, '5', 1, '2000-452', 'Alqueidão', 'Casével', 'Santarém', 'Santarém', 'Santarém', 39.384559, -8.6100623);
insert into hivetown.address (id, number, door, floor, zip_code, street, parish, county, city, district, latitude, longitude) values (5, 127, '127', 4, '2040-116', 'Largo da Alegria', 'Rio Maior', 'Rio Maior', 'Freiria', 'Santarém', 39.3442902, -8.9534587);
insert into hivetown.address (id, number, door, floor, zip_code, street, parish, county, city, district, latitude, longitude) values (6, 10,'4', 0, '6120-625', 'Rua da Igreja', ' Penhascoso', 'Mação', 'Santarém', 'Santarém', 39.5435798, -8.0379136);
insert into hivetown.address (id, number, door, floor, zip_code, street, parish, county, city, district, latitude, longitude) values (7, 32,'3', 1, '3040-426', 'Rua das Cantadeiras', 'Almalaguês', 'Coimbra', 'Coimbra', 'Coimbra', 40.1311441, -8.3924705);
insert into hivetown.address (id, number, door, floor, zip_code, street, parish, county, city, district, latitude, longitude) values (8, 56,'67', 5, '2205-496', 'São Miguel do Rio Torto', 'São Miguel do Rio Torto', 'Abrantes', 'Bicas', 'Santarém', 39.38316, -8.2407873);
insert into hivetown.address (id, number, door, floor, zip_code, street, parish, county, city, district, latitude, longitude) values (9, 154, '0', 0, '3700-819', 'Rua da Costa Velha', 'Romariz ', 'Santa Maria da Feira', 'Duas Igrejas', 'Aveiro', 40.9522224, -8.4649248);
insert into hivetown.address (id, number, door, floor, zip_code, street, parish, county, city, district, latitude, longitude) values (10, 34,'55', 0, '3520-031', 'Rua dos Abades', ' Nelas', 'Nelas ', 'Nelas', 'Viseu', 40.5336661, -7.8512814);

-- Producers

insert into hivetown.producer (id, name, email, phone, vat, type) values (1, 'Johannes Russi', 'jrussi0@youtu.be', 996749169, 766910242, 'PRODUCER');
insert into hivetown.producer (id, name, email, phone, vat, type) values (2, 'Nettle Paddick', 'npaddick1@wiley.com', 976491619, 660226755, 'PRODUCER');
insert into hivetown.producer (id, name, email, phone, vat, type) values (3, 'Jillian Sherwin', 'jsherwin2@xinhuanet.com', 930576656, 370332941, 'PRODUCER');
insert into hivetown.producer (id, name, email, phone, vat, type) values (4, 'Tabbi Inglese', 'tinglese3@stumbleupon.com', 932246604, 961235560, 'PRODUCER');
insert into hivetown.producer (id, name, email, phone, vat, type) values (5, 'Mychal Claypool', 'mclaypool4@nasa.gov', 932729562, 680435535, 'PRODUCER');
insert into hivetown.producer (id, name, email, phone, vat, type) values (6, 'Jess Bigby', 'jbigby5@sakura.ne.jp', 925757259, 585069677, 'PRODUCER');
insert into hivetown.producer (id, name, email, phone, vat, type) values (7, 'Lexie Woolhouse', 'lwoolhouse6@mozilla.org', 964142495, 486629358, 'PRODUCER');
insert into hivetown.producer (id, name, email, phone, vat, type) values (8, 'Orlando Apfel', 'oapfel7@homestead.com', 912909808, 389611952, 'PRODUCER');
insert into hivetown.producer (id, name, email, phone, vat, type) values (9, 'Angela Manicom', 'amanicom8@ucoz.com', 917812435, 624460208, 'PRODUCER');
insert into hivetown.producer (id, name, email, phone, vat, type) values (10, 'Justinian Clemencon', 'jclemencon9@tripadvisor.com', 923500321, 683211353, 'PRODUCER');

-- ProductSpec

insert into hivetown.product_spec (id, name, description, images) values (1, 'Batatas', 'As mais gostosas do mercado', 'http://dummyimage.com/111x100.png/dddddd/000000');
insert into hivetown.product_spec (id, name, description, images) values (2, 'IPhone 12', 'O úlitmo iPhone', 'http://dummyimage.com/107x100.png/cc0000/ffffff');
insert into hivetown.product_spec (id, name, description, images) values (3, 'Camisa', 'Em ótimo estado', 'http://dummyimage.com/248x100.png/cc0000/ffffff');
insert into hivetown.product_spec (id, name, description, images) values (4, 'Nike air max', 'Com algum gasto', 'http://dummyimage.com/129x100.png/dddddd/000000');
insert into hivetown.product_spec (id, name, description, images) values (5, 'Tomates', 'Do meu quintal', 'http://dummyimage.com/176x100.png/5fa2dd/ffffff');


-- Fields

insert into hivetown.field (id, name, unit, type) values (1, "Cor", "N/A", "TEXT");	
insert into hivetown.field (id, name, unit, type) values (2, "Tamanho", "cm", "NUMBER");	
insert into hivetown.field (id, name, unit, type) values (3, "Estado", "N/A", "TEXT");	

-- FieldPossibleValues

insert into hivetown.field_possible_value (id, field_id, value) values (1, 1, "Vermelho");
insert into hivetown.field_possible_value (id, field_id, value) values (2, 1, "Azul");
insert into hivetown.field_possible_value (id, field_id, value) values (3, 1, "Preto");
insert into hivetown.field_possible_value (id, field_id, value) values (4, 1, "Branco");
insert into hivetown.field_possible_value (id, field_id, value) values (5, 1, "Amarelo");
insert into hivetown.field_possible_value (id, field_id, value) values (6, 2, "40");
insert into hivetown.field_possible_value (id, field_id, value) values (7, 2, "20");
insert into hivetown.field_possible_value (id, field_id, value) values (8, 2, "100");
insert into hivetown.field_possible_value (id, field_id, value) values (9, 2, "50");
insert into hivetown.field_possible_value (id, field_id, value) values (10, 3, "NOVO");
insert into hivetown.field_possible_value (id, field_id, value) values (11, 3, "USADO");
insert into hivetown.field_possible_value (id, field_id, value) values (12, 3, "GASTO");

insert into hivetown.category (id, name, parent_id) values (1, "Tecnologia", null);
insert into hivetown.category (id, name, parent_id) values (2, "Roupa", null);
insert into hivetown.category (id, name, parent_id) values (3, "Alimentos", null);
insert into hivetown.category (id, name, parent_id) values (4, "Telemóveis", 1);
insert into hivetown.category (id, name, parent_id) values (5, "Camisas", 2);
insert into hivetown.category (id, name, parent_id) values (6, "Vegetais", 3);
insert into hivetown.category (id, name, parent_id) values (7, "Frutas", 3);
insert into hivetown.category (id, name, parent_id) values (8, "Calçado", 2);

-- category_fields

insert into hivetown.category_fields (category_id, field_id) values (1, 1);
insert into hivetown.category_fields (category_id, field_id) values (1, 2);
insert into hivetown.category_fields (category_id, field_id) values (1, 3);
insert into hivetown.category_fields (category_id, field_id) values (2, 1);
insert into hivetown.category_fields (category_id, field_id) values (2, 2);
insert into hivetown.category_fields (category_id, field_id) values (2, 3);
insert into hivetown.category_fields (category_id, field_id) values (3, 1);
insert into hivetown.category_fields (category_id, field_id) values (3, 2);


-- product_spec_category

insert into hivetown.product_spec_category (id, product_spec_id, category_id) values (1, 1, 3);
insert into hivetown.product_spec_category (id, product_spec_id, category_id) values (2, 1, 6);
insert into hivetown.product_spec_category (id, product_spec_id, category_id) values (3, 2, 1);
insert into hivetown.product_spec_category (id, product_spec_id, category_id) values (4, 2, 4);
insert into hivetown.product_spec_category (id, product_spec_id, category_id) values (5, 3, 2);
insert into hivetown.product_spec_category (id, product_spec_id, category_id) values (6, 3, 5);
insert into hivetown.product_spec_category (id, product_spec_id, category_id) values (7, 4, 2);
insert into hivetown.product_spec_category (id, product_spec_id, category_id) values (8, 4, 8);
insert into hivetown.product_spec_category (id, product_spec_id, category_id) values (9, 5, 3);
insert into hivetown.product_spec_category (id, product_spec_id, category_id) values (10, 5, 7);

-- product_spec_field

insert into hivetown.product_spec_field (spec_id, field_id, category_id, value) values (4, 1, 8, "Branco");
insert into hivetown.product_spec_field (spec_id, field_id, category_id, value) values (4, 2, 8, "40");
insert into hivetown.product_spec_field (spec_id, field_id, category_id, value) values (4, 3, 8, "NOVO");
insert into hivetown.product_spec_field (spec_id, field_id, category_id, value) values (2,1,1,"Preto");
insert into hivetown.product_spec_field (spec_id, field_id, category_id, value) values (2,2,1,"32");
insert into hivetown.product_spec_field (spec_id, field_id, category_id, value) values (2,3,1,"USADO");

-- production_unit

insert into hivetown.production_unit (id, name, address_id, producer_id) values (1, "Unidade de Produção de Loures", 1, 1);
insert into hivetown.production_unit (id, name, address_id, producer_id) values (2, "Vegetais de Santarém", 4, 2);
insert into hivetown.production_unit (id, name, address_id, producer_id) values (3, "Frutas de Santarém", 4, 2);
insert into hivetown.production_unit (id, name, address_id, producer_id) values (4, "Tecnologia de Rio Maior", 5, 3);

-- producer_product

insert into hivetown.producer_product (id, current_price, production_date, producer_id, production_unit_id, product_spec_id, status) values (1, 989, '2023-02-19 14:30:00', 3, 4, 2, "AVAILABLE");
insert into hivetown.producer_product (id, current_price, production_date, producer_id, production_unit_id, product_spec_id, status) values (2, 2, '2023-01-15 10:30:00', 2,2,1, "SOLD_OUT");
insert into hivetown.producer_product (id, current_price, production_date, producer_id, production_unit_id, product_spec_id, status) values (3, 2.5,'2023-01-20 16:00:00', 1,1,2, "AVAILABLE");
insert into hivetown.producer_product (id, current_price, production_date, producer_id, production_unit_id, product_spec_id, status) values (4, 3, '2023-02-18 19:45:00', 2,3,5, "AVAILABLE");

