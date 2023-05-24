export function convertEvolution(resultado: any, opcao: string): any {
	const result: { [key: string]: number } = {};
	let i = 0;
	if (
		opcao === 'numeroEncomendas' ||
		opcao === 'numeroProdutosEncomendados' ||
		opcao === 'numeroEncomendasCanceladas' ||
		opcao === 'numeroProdutosEncomendadosCancelados'
	) {
		i = 1;
	}

	for (const item of resultado) {
		const { mes_ano } = item;
		if (item.totalProdutos) {
			i = item.totalProdutos;
		} else if (item.comprasTotais) {
			i = item.comprasTotais;
		} else if (item.totalProdutosCancelados) {
			i = item.totalProdutosCancelados;
		} else if (item.comprasTotaisCanceladas) {
			i = item.comprasTotaisCanceladas;
		}
		if (result[mes_ano]) {
			result[mes_ano] += Number(i);
		} else {
			result[mes_ano] = Number(i);
		}
	}

	// a apagar
	let sum = 0;
	for (const key in result) {
		if (result.hasOwnProperty(key)) {
			sum += result[key];
		}
	}
	console.log(sum);

	return result;
}
