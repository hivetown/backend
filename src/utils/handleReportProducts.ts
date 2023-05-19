import type { OrderItem } from '../entities';

export function handleReportProducts(atual: any[], orderItem: OrderItem, opcao: string) {
	// console.log('orderItems', orderItem);
	// console.log('opcao', opcao);
	console.log('atual', atual);

	// para o numeroEncomendas
	// const encomendas: any[] = [];
	// const totalProdutos: any[] = [];
	// const comprasTotais: any[] = [];
	// const produtosEncomendados: any[] = [];

	if (opcao === 'numeroEncomendas') {
		const obj = atual.find((obj) => obj.id === orderItem.producerProduct.id);
		if (obj) {
			console.log(obj);
			obj.numeroEncomendas++;
		} else {
			atual.push({
				id: orderItem.producerProduct.id,
				nome: orderItem.producerProduct.productSpec.name,
				numeroEncomendas: 1
			});
		}
	} else if (opcao === 'totalProdutos') {
	} else if (opcao === 'comprasTotais') {
	} else if (opcao === 'numeroProdutosEncomendados') {
	}

	return atual;
}

// id, nome do produto, imagens (?), valor de acordo com a opção usada
