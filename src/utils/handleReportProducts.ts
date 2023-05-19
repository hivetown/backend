import type { OrderItem } from '../entities';

export function handleReportProducts(atual: any[], orderItem: OrderItem, opcao: string) {
	const obj = atual.find((obj) => Number(obj.id) === Number(orderItem.producerProduct.id));

	if (obj) {
		if (opcao === 'numeroEncomendas') {
			console.log('obj antes', obj);
			obj.numeroEncomendas++;
			console.log('obj depois', obj);
		} else if (opcao === 'totalProdutos') {
			console.log('obj antes', obj);
			obj.totalProdutos += orderItem.quantity;
			console.log('obj depois', obj);
		} else if (opcao === 'comprasTotais') {
			console.log('obj antes', obj);
			obj.comprasTotais += orderItem.quantity * orderItem.price;
			console.log('obj depois', obj);
		}
	} else if (opcao === 'numeroEncomendas') {
		atual.push({ id: orderItem.producerProduct.id, nome: orderItem.producerProduct.productSpec.name, numeroEncomendas: 1 });
	} else if (opcao === 'totalProdutos') {
		atual.push({ id: orderItem.producerProduct.id, nome: orderItem.producerProduct.productSpec.name, totalProdutos: orderItem.quantity });
	} else if (opcao === 'comprasTotais') {
		atual.push({
			id: orderItem.producerProduct.id,
			nome: orderItem.producerProduct.productSpec.name,
			comprasTotais: orderItem.quantity * orderItem.price
		});
	}

	return atual;
}

// id, nome do produto, imagens (?), valor de acordo com a opção usada
