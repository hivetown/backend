import type { EntityManager } from '@mikro-orm/core';
import { Field, FieldPossibleValue } from '../../entities';
import { FieldType } from '../../enums';

type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
type OmittedFieldPossibleValue = Omit<FieldPossibleValue, 'id' | 'field'>;
/**
 * Some field names, based off of worten.pt's products:
 * - https://www.worten.pt/produtos/smartphone-samsung-galaxy-s23-ultra-5g-6-8-8-gb-256-gb-preto-7709234
 * - https://www.worten.pt/produtos/aspirador-vertical-dyson-v15-detect-absolute-autonomia-60-min-770-ml-7453359
 * - https://www.worten.pt/produtos/racao-para-caes-advance-7-5kg-seca-porte-pequeno-adulto-sabor-frango-e-arroz-mrkean-8410650150192
 */
const baseFields = [
	{
		name: 'Cor',
		unit: '',
		type: FieldType.Enum,
		possibleValues: [
			{
				value: 'Preto'
			},
			{
				value: 'Branco'
			},
			{
				value: 'Cinzento'
			},
			{
				value: 'Azul'
			},
			{
				value: 'Vermelho'
			}
		] as OmittedFieldPossibleValue[] as any
	},
	{
		name: 'Peso',
		unit: 'kg',
		type: FieldType.Number
	},
	{
		name: 'Altura',
		unit: 'cm',
		type: FieldType.Number
	},
	{
		name: 'Largura',
		unit: 'cm',
		type: FieldType.Number
	},
	{
		name: 'Profundidade',
		unit: 'cm',
		type: FieldType.Number
	},
	{
		name: 'Resistência à água e ao pó',
		unit: 'IP',
		type: FieldType.Enum,
		possibleValues: [
			{
				value: 'IP68'
			},
			{
				value: 'IP67'
			},
			{
				value: 'IP66'
			}
		] as OmittedFieldPossibleValue[] as any
	},
	{
		name: 'Memória Interna',
		unit: 'GB',
		type: FieldType.Enum,
		possibleValues: [
			{
				value: '258'
			},
			{
				value: '512'
			},
			{
				value: '1024'
			}
		] as OmittedFieldPossibleValue[] as any
	},
	{
		name: 'Memória RAM',
		unit: 'GB',
		type: FieldType.Enum,
		possibleValues: [
			{
				value: '4'
			},
			{
				value: '8'
			},
			{
				value: '16'
			}
		] as OmittedFieldPossibleValue[] as any
	},
	{
		name: 'Entrada do Carregador',
		unit: '',
		type: FieldType.Enum,
		possibleValues: [
			{
				value: 'USB-C'
			},
			{
				value: 'Micro USB'
			}
		] as OmittedFieldPossibleValue[] as any
	},
	{
		name: 'Sistema Operativo',
		unit: '',
		type: FieldType.Enum,
		possibleValues: [
			{
				value: 'Android'
			},
			{
				value: 'MIUI'
			},
			{
				value: 'EMUI'
			},
			{
				value: 'Alpine Phone OS'
			}
		] as OmittedFieldPossibleValue[] as any
	},
	{
		name: 'Processador',
		unit: '',
		type: FieldType.Enum,
		possibleValues: [
			{
				value: 'Snapdragon 888'
			},
			{
				value: 'Snapdragon 865'
			},
			{
				value: 'Snapdragon 855'
			}
			// This field is only for ANDROID PHONES category, so we won't have iPhone processors nor computer ones
			// {
			// 	value: 'A16 Bionic'
			// },
			// {
			// 	value: 'Intel Pentium'
			// },
			// {
			// 	value: 'Intel Core i3'
			// }
		] as OmittedFieldPossibleValue[] as any
	},
	{
		name: 'Tecnologia Ecrã',
		unit: '',
		type: FieldType.Enum,
		possibleValues: [
			{
				value: 'AMOLED'
			},
			{
				value: 'IPS'
			},
			{
				value: 'LCD'
			}
		] as OmittedFieldPossibleValue[] as any
	},
	{
		name: 'Tamanho Ecrã',
		unit: 'polegadas',
		type: FieldType.Number
	},
	{
		name: 'Resolução Ecrã',
		unit: 'pixels',
		type: FieldType.Number
	},
	{
		name: 'Núcleos do Processador',
		unit: '',
		type: FieldType.Enum,
		possibleValues: [
			{
				value: '4'
			},
			{
				value: '8'
			},
			{
				value: '16'
			}
		] as OmittedFieldPossibleValue[] as any
	},
	{
		name: 'Tipo Rede',
		unit: '',
		type: FieldType.Enum,
		possibleValues: [
			{
				value: '5G'
			},
			{
				value: '4G'
			},
			{
				value: '3G'
			}
		] as OmittedFieldPossibleValue[] as any
	},
	{
		name: 'Velocidade Processador',
		unit: 'GHz',
		type: FieldType.Number
	},
	// ASPIRADOR
	{
		name: 'Capacidade',
		unit: 'ml',
		type: FieldType.Number
	},
	{
		name: 'Ruído',
		unit: 'dB',
		type: FieldType.Number
	},
	{
		name: 'Tipo Alimentação',
		unit: '',
		type: FieldType.Enum,
		possibleValues: [
			{
				value: 'Bateria'
			},
			{
				value: 'Corrente Elétrica'
			}
		] as OmittedFieldPossibleValue[] as any
	},
	{
		name: 'Autonomia',
		unit: 'min',
		type: FieldType.Number
	},
	// RAÇÃO CÃO
	{
		name: 'Quantidade',
		unit: 'kg',
		type: FieldType.Number
	},
	{
		name: 'Sabor',
		unit: '',
		type: FieldType.Text
	},
	{
		name: 'Tipo Animal',
		unit: '',
		type: FieldType.Enum,
		possibleValues: [
			{
				value: 'Cão'
			},
			{
				value: 'Gato'
			}
		] as OmittedFieldPossibleValue[] as any
	},
	{
		name: 'Tipo Ração',
		unit: '',
		type: FieldType.Enum,
		possibleValues: [
			{
				value: 'Húmida'
			},
			{
				value: 'Seca'
			}
		] as OmittedFieldPossibleValue[] as any
	},
	{
		name: 'Porte',
		unit: '',
		type: FieldType.Enum,
		possibleValues: [
			{
				value: 'Pequeno'
			},
			{
				value: 'Médio'
			},
			{
				value: 'Grande'
			}
		] as OmittedFieldPossibleValue[] as any
	},
	{
		name: 'Peso Animal',
		unit: 'kg',
		type: FieldType.Number
	},
	{
		name: 'Idade Animal',
		unit: '',
		type: FieldType.Enum,
		possibleValues: [
			{
				value: 'Cachorro'
			},
			{
				value: 'Adulto'
			},
			{
				value: 'Sénior'
			}
		] as OmittedFieldPossibleValue[] as any
	}
] as Omit<PartialBy<Field, 'possibleValues'>, 'categories' | 'id'>[];

export const createFields = (em: EntityManager) => baseFields.map((field) => em.create(Field, field));
