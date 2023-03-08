-- Active: 1676649655049@@127.0.0.1@3306@hivetown
insert into hivetown.consumer (id, name, email, phone, vat ) values (1, 'Bruno Gonzalez', 'bruno@gmail.com', 961234567, 12345678);
insert into hivetown.consumer (id, name, email, phone, vat ) values (2, 'Lucas Pinto', 'lpinto@fcul.com', 934363642, 87654321);
insert into hivetown.consumer (id, name, email, phone, vat ) values (3, 'Madalena Rodrigues', 'madarod@fcul.pt', 929156654, 91827364);
insert into hivetown.consumer (id, name, email, phone, vat ) values (4, 'Matilde Silva', 'matildes@gmail.pt', 916926485, 19283746);
insert into hivetown.consumer (id, name, email, phone, vat ) values (5, 'Pedro Guitar Legend', 'pedrolegend@outlook.pt', 965768295, 56473285);
insert into hivetown.consumer (id, name, email, phone, vat ) values (6, 'Rómulo Nogueira', 'romulinho@outlook.com', 969876543, 12345678);

insert into hivetown.consumer_address(consumer_id, address_id) values (1, 2);
insert into hivetown.consumer_address(consumer_id, address_id) values (2, 3);
insert into hivetown.consumer_address(consumer_id, address_id) values (3, 6);
insert into hivetown.consumer_address(consumer_id, address_id) values (4, 7);
insert into hivetown.consumer_address(consumer_id, address_id) values (5, 8);
insert into hivetown.consumer_address(consumer_id, address_id) values (6, 9);

insert into hivetown.cart(consumer_id) values (1);
insert into hivetown.cart(consumer_id) values (2);
insert into hivetown.cart(consumer_id) values (3);
insert into hivetown.cart(consumer_id) values (4);
insert into hivetown.cart(consumer_id) values (5);
insert into hivetown.cart(consumer_id) values (6);