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

	return result;
}

export function convertProducts(resultado: any, opcao: string): any {
	const result: any[] = [];
	const idsProducts: number[] = [];
	for (const item of resultado) {
		const newObj: {
			id: string;
			nome: string;
			[key: string]: number | string;
		} = {
			id: '',
			nome: ''
		};

		const { producer_product_id } = item;
		const { name } = item;

		newObj.id = producer_product_id;
		newObj.nome = name;

		if (idsProducts.includes(producer_product_id)) {
			console.log(producer_product_id);
			newObj[opcao] = Number(newObj[opcao]) + Number(item[opcao]);
		} else {
			newObj[opcao] = Number(item[opcao]);
		}

		if (!idsProducts.includes(producer_product_id)) {
			idsProducts.push(producer_product_id);
		}
		result.push(newObj);
	}

	return result;
}

export function mergeResultsEvolution(data: any, opcao: string, opcaoCancelados: string): any {
	const mergedData: { [key: string]: { [key: string]: number } } = {};

	for (const key in data.result) {
		if (data.result.hasOwnProperty(key) && data.resultCancelados.hasOwnProperty(key)) {
			mergedData[key] = {
				[opcao]: data.result[key],
				[opcaoCancelados]: data.resultCancelados[key]
			};
		}
	}

	return mergedData;
}

export function mergeResultsProducts(resultado: any, resultadoCancelados: any, opcao: string, opcaoCancelados: string): any {
	const mergedData: any[] = [];

	const idsCancelados = resultadoCancelados.map((item: any) => item.id);

	for (const obj of resultado) {
		const newObj: {
			id: string;
			nome: string;
			[key: string]: number | string;
		} = {
			id: '',
			nome: ''
		};

		newObj.id = obj.id;
		newObj.nome = obj.nome;
		newObj[opcao] = obj[opcao];

		if (idsCancelados.includes(obj.id)) {
			const index = idsCancelados.indexOf(obj.id);
			newObj[opcaoCancelados] = resultadoCancelados[index][opcaoCancelados];
		} else {
			newObj[opcaoCancelados] = 0;
		}
		mergedData.push(newObj);
	}

	return mergedData;
}
