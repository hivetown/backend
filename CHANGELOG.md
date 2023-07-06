# Changelog

## [1.3.0](https://github.com/hivetown/backend/compare/v1.2.2...v1.3.0) (2023-07-06)


### Features

* order by when returning multiple rows ([01e2717](https://github.com/hivetown/backend/commit/01e271761473156ea6a3b16c053e279a83fc9786))

## [1.2.2](https://github.com/hivetown/backend/compare/v1.2.1...v1.2.2) (2023-06-18)


### Bug Fixes

* sometimes parent is undefined, so check for it ([f2c2e13](https://github.com/hivetown/backend/commit/f2c2e132ab7d4d713b9a36edce0d89146a0c1ba4))

## [1.2.1](https://github.com/hivetown/backend/compare/v1.2.0...v1.2.1) (2023-06-18)


### Bug Fixes

* add deleted_at to producer products of unit ([d5cea65](https://github.com/hivetown/backend/commit/d5cea65b8c933b485ee8bc3ce57641e060b2a7a1))

## [1.2.0](https://github.com/hivetown/backend/compare/v1.1.0...v1.2.0) (2023-06-17)

### Features

-   testes unitarios ([7e8115d](https://github.com/hivetown/backend/commit/7e8115d7ea3e8e5d1362d8c6bc47a5613b0b852b))

## [1.1.0](https://github.com/hivetown/backend/compare/v1.0.1...v1.1.0) (2023-06-16)

### Features

-   funny easter egg com o joao pedro pais ([d4465cd](https://github.com/hivetown/backend/commit/d4465cdd1d40e2e8971cb4c949dfefdafb742415))

### Bug Fixes

-   put healthz in its own controller ([d4465cd](https://github.com/hivetown/backend/commit/d4465cdd1d40e2e8971cb4c949dfefdafb742415))

## [1.0.1](https://github.com/hivetown/backend/compare/v1.0.0...v1.0.1) (2023-06-09)

### Bug Fixes

-   force report optional booleans to be true ([b004439](https://github.com/hivetown/backend/commit/b004439f2ce558e57bb52e400ee1bbf2af975aa6))

## 1.0.0 (2023-05-30)

### ⚠ BREAKING CHANGES

-   add authorization to routes
-   have user as it's own entity
-   change ProducerProduct currentPrice type to double
-   drop Cart entirely and relate Consumer to CartItem
-   cart joincolumn and productspecfield dependencies
-   images entity

### Features

-   add auth middleware on existing routes ([8eaf67a](https://github.com/hivetown/backend/commit/8eaf67af364cc8eec4209d01c2a59de0fb3ebb17))
-   add authorization to routes ([543fbbe](https://github.com/hivetown/backend/commit/543fbbe42372bce90b89b07e85b7e59fb246c845))
-   add consumer to address entity side ([bd151f8](https://github.com/hivetown/backend/commit/bd151f89e1c5d8668fe1e7ae64ad72789053328f))
-   add filters to productSpec find ([a671816](https://github.com/hivetown/backend/commit/a6718160b82b18b1481ecbdcfb20a5114e85d145))
-   add images to products endpoints and other missing properties to single product spec endpoint ([a460a6a](https://github.com/hivetown/backend/commit/a460a6a99d4f0249fc53cc4f13f969c9b9c2d95f))
-   add producer images ([dd5cb3a](https://github.com/hivetown/backend/commit/dd5cb3a267defb0534eb4cacc877ee9494ab0c4c))
-   add req to authorization validation ([712917b](https://github.com/hivetown/backend/commit/712917b60b4d99f8346a640c4a3546401abc78f0))
-   add role to user for role based access control (RBAC) ([798dd26](https://github.com/hivetown/backend/commit/798dd266722d9e2c9aee1887219d657c30eda225))
-   adicao das unidades de producao quando se pesquisa os fornecedores de um productSpec ([65f2fed](https://github.com/hivetown/backend/commit/65f2fed539a84b4ebd537f9e3a4ba4c3371c74b2))
-   adicionar um caminho para ver os eventos de um orderItem ([e86e236](https://github.com/hivetown/backend/commit/e86e236b562ae12686649b93de7e767a7fc85525))
-   adicionar um produto de um produtor ([fe7add9](https://github.com/hivetown/backend/commit/fe7add9bef475ad9357b85b64e3c4bd4b033793c))
-   adicionar uma categoria a um productSpec ([a837bfa](https://github.com/hivetown/backend/commit/a837bfa9c33ff2ead15f2bbc496581e8b49d7901))
-   alguns caminhos feitos ([d3faa81](https://github.com/hivetown/backend/commit/d3faa81673faad623c0b74e91042ce3a2450a356))
-   allow search on producer production units ([7e03a1b](https://github.com/hivetown/backend/commit/7e03a1b871df01100e95846fa9c60d2b3955960a))
-   api errors ([89d8394](https://github.com/hivetown/backend/commit/89d839411ff9e992b69ed519b34083d63cebec9e))
-   authorization ([fe15c69](https://github.com/hivetown/backend/commit/fe15c69d347392c9004ba6e4509a8ec268de659e))
-   base projeto ([5821f0c](https://github.com/hivetown/backend/commit/5821f0c4f9e7bb6c532d94f0e6864b3dd7a54f08))
-   build directly to prod image ([72e57b6](https://github.com/hivetown/backend/commit/72e57b69cfec5c4abf714e1089da188193523cfe))
-   caminhos das categorias feitos ([ecbf2e8](https://github.com/hivetown/backend/commit/ecbf2e8836d974f75d419f40cc5523d4a7f6407e))
-   cancel order, ainda sem refund ([96dbaf8](https://github.com/hivetown/backend/commit/96dbaf8863d162683b6d0b5ce118549fbff10f19))
-   categories (children) of a category ([395c69b](https://github.com/hivetown/backend/commit/395c69b6388cd3bf9cb0667a4a6abb392e832a0d))
-   category parents; chore: improve the rest of the field things ([5e6ce1e](https://github.com/hivetown/backend/commit/5e6ce1e39402f4cb7ed61a211a972691b62a7df9))
-   cookies ([150e18f](https://github.com/hivetown/backend/commit/150e18f91e7002fbfd88d332d85dbe297400fc07))
-   create AddressGateway ([ab67a06](https://github.com/hivetown/backend/commit/ab67a06bd5117155bbebc5e551cc2c594728ca79))
-   create consumer ([3b43624](https://github.com/hivetown/backend/commit/3b4362498b8b5f30ee8a7b588ba9541f0814b0ef))
-   create generators ([4d81ad0](https://github.com/hivetown/backend/commit/4d81ad07d05325ae0429905ec9a48f0bd5dd8340))
-   create generic ProducerProduct findAll ([c511a68](https://github.com/hivetown/backend/commit/c511a684cc1579ec55afb26ac7e5eeeb3872f796))
-   create producer ([f3d7e16](https://github.com/hivetown/backend/commit/f3d7e166f0b15fb268b5ae4765c6ae53824c26a4))
-   criacao de um productSpec ([ea12e9c](https://github.com/hivetown/backend/commit/ea12e9cddc7a88bea470319afc4a99445efb413f))
-   criar eventos por parte do produtor, rf24,25,26 ([6f1f810](https://github.com/hivetown/backend/commit/6f1f8101ddfed7c650cec4bcfde754a0a48c056e))
-   delete /consumers/{consumerId}/cart implementado ([b15e034](https://github.com/hivetown/backend/commit/b15e034a4ca6f1ffb13985e5572a46e72372bff4))
-   delete de um item do carrinho ([0917360](https://github.com/hivetown/backend/commit/09173606aba88135e3be89175e7127a111382238))
-   delete de um producerProduct (c/ softdelete) ([ba793cc](https://github.com/hivetown/backend/commit/ba793ccafd90f6e20a455a09868d58c29eeb00ae))
-   delete de um productp spec (c/soft delete) ([39954cb](https://github.com/hivetown/backend/commit/39954cb92756df48284d739c5868830824ec8389))
-   delete de uma unidade de produção feito ([da7fbf8](https://github.com/hivetown/backend/commit/da7fbf88fb4760882326ea742055e50950e73144))
-   docker scripts ([19a527e](https://github.com/hivetown/backend/commit/19a527efcea7b397a5353519de884ec6325c36de))
-   error middleware ([e6fac75](https://github.com/hivetown/backend/commit/e6fac75226c5079e3ccf656914cc1112a7a6d757))
-   example roles ([e49e540](https://github.com/hivetown/backend/commit/e49e540e710c7dc5a217ca8b544cc70e6003e8a5))
-   get /consumers/{consumerId}/cart implementado ([788a3ab](https://github.com/hivetown/backend/commit/788a3abe00f73f963c040a11d44b3ce944c31c7c))
-   get a user from an idtoken (firebase) ([9acd7f0](https://github.com/hivetown/backend/commit/9acd7f0899c4406ce5ce647bacf428d15c3216c7))
-   get authenticated user ([7a27db1](https://github.com/hivetown/backend/commit/7a27db17103d36cf7f1c6133e927e29ea4d82f45))
-   gets de orders dos produtores ([588c91c](https://github.com/hivetown/backend/commit/588c91c6fe59638ccaf90072b9b34c4e6b912526))
-   getters das encomendas dos consumidores feitos ([e0ae707](https://github.com/hivetown/backend/commit/e0ae707398bb2b05a3574e7180325e665c1c430d))
-   have user as it's own entity ([bd9fc9e](https://github.com/hivetown/backend/commit/bd9fc9ead7e31b6f2eb6d968a9363dd8c47ac4a9))
-   hidden properties ([49d4400](https://github.com/hivetown/backend/commit/49d440018405948febd319d846938cec6e7d63ba))
-   images entity ([b6e267f](https://github.com/hivetown/backend/commit/b6e267f63789f05f2df478afec0f274dd3e69f5a))
-   list producer units ([5dbcb32](https://github.com/hivetown/backend/commit/5dbcb327234e4f0308965f30ac860b976943507f))
-   load env on startup ([5d00709](https://github.com/hivetown/backend/commit/5d0070946bc80a6300eb24d251721b211c8b5602))
-   load fakerjs if FAKER is set as true in env ([26b47b4](https://github.com/hivetown/backend/commit/26b47b4e241909acd4d4ae6e49c907e8f74348d2))
-   make authorization permission and other validators OR ([28f2f01](https://github.com/hivetown/backend/commit/28f2f01c5dc6a4903c7b6246a0347d3e2ac7ea56))
-   mysql dev server docker commands ([297935f](https://github.com/hivetown/backend/commit/297935f6681b39e53b7a1cc615cfa7e4ffbfc95a))
-   not found error ([2d61ff3](https://github.com/hivetown/backend/commit/2d61ff32f0b5dbc80cda48b45eb321eb68997bbf))
-   pagamento implementado ([741b25c](https://github.com/hivetown/backend/commit/741b25c27dfd85afc33d70960b9a40b3b9344f1b))
-   paginacao dos produtos ([df16ea3](https://github.com/hivetown/backend/commit/df16ea30bbf76906891c54053d9bf5b452812c66))
-   paginated consumer addresses ([760fdc6](https://github.com/hivetown/backend/commit/760fdc60cacf529c14a8b3a25cfeb6ba6e357db1))
-   pedidos get todos feitos ([85e63ee](https://github.com/hivetown/backend/commit/85e63ee221e2b3dd17ac538c2b917d0f7c1c22ca))
-   permission enum; add details to ApiError (and forbidden) ([050aa43](https://github.com/hivetown/backend/commit/050aa43e573a93553eabe323bd2d17a75d9bd689))
-   populate image ([f320e82](https://github.com/hivetown/backend/commit/f320e82b8f22b022585b379fc6cdafdd9d4e2e07))
-   possibilidade de ver os veiculos em transito de uma UP ([5865f91](https://github.com/hivetown/backend/commit/5865f91d852748f0768fd691276804bca3aab87a))
-   post /consumers/{consumerId}/cart implementado ([c8c1ec7](https://github.com/hivetown/backend/commit/c8c1ec74e126066e80501fa7797bf8f6f1575314))
-   post de uma unidade de produção feito ([12820bf](https://github.com/hivetown/backend/commit/12820bfa8eeee73b49e66eb65f9d6d61e2fa8247))
-   preliminary routess ([15ab68a](https://github.com/hivetown/backend/commit/15ab68a61b0a54b60d18b1bcc2840350b980b872))
-   primeira versão do carrinho de compras ([aed4701](https://github.com/hivetown/backend/commit/aed4701cb0d4a71b29c68e0635b8ace42fad5ed5))
-   primeira versão getCart ([5d158f5](https://github.com/hivetown/backend/commit/5d158f539333e006cc3a323d00c241a21bcb4194))
-   primeiras alterações ([bab598f](https://github.com/hivetown/backend/commit/bab598f95f5de5671dacc85e96ae571e1e147651))
-   primeiras alterações ([90c709c](https://github.com/hivetown/backend/commit/90c709cf6aa49496d8c160ac8a0c771c7a060240))
-   producers controller ([dd1ef2e](https://github.com/hivetown/backend/commit/dd1ef2ec9868c8286c16da20a63c730f7e19a87e))
-   producers get unit and get unit products endpoints ([2967e4f](https://github.com/hivetown/backend/commit/2967e4f4b8d8c2de547c15e73c796c9f43a0ec53))
-   product search by specification name ([a206a54](https://github.com/hivetown/backend/commit/a206a542f6a518637813d3146b129a0a2b4ef088))
-   put /consumers/{consumerId}/cart implementado ([b2347b5](https://github.com/hivetown/backend/commit/b2347b54eead266524166b41229d400c106cf598))
-   put de uma unidade de produção feito ([1a0f405](https://github.com/hivetown/backend/commit/1a0f4056c2b7695355a043cde9d10a3e4b481510))
-   refinamento do rf01 ([4c6d440](https://github.com/hivetown/backend/commit/4c6d44026a45d457bf3ecdb643d1ee995b79a2fa))
-   remover uma categoria a um productSpec ([4eaf884](https://github.com/hivetown/backend/commit/4eaf884853c2a52cdf540aa6ea9a5f21a8cbe0f3))
-   request validation ([84ddab8](https://github.com/hivetown/backend/commit/84ddab828e1969c3f96e4eee3089804969c5b4fa))
-   rf17 exportação de dados das encomendas para ficheiros json ([2548bea](https://github.com/hivetown/backend/commit/2548bea834cedfa5cb59e0e1a5e0338f0c3cd277))
-   routes para permitir a comparação de produtos ([9bdd514](https://github.com/hivetown/backend/commit/9bdd5143af47e5a2bf821733ddd94b95cbb2242b))
-   seed base roles ([17d8d2b](https://github.com/hivetown/backend/commit/17d8d2bb8afe4c86a7648525a330a390e9c57c66))
-   seeder em portugues ([42755fa](https://github.com/hivetown/backend/commit/42755fa6e9e8d50a9ac01ba0835917f38b05b539))
-   show error messages on custom validators ([76da6ee](https://github.com/hivetown/backend/commit/76da6ee3a9e637a9abc87c80fd90939ebe208476))
-   simple docker ([0721fe3](https://github.com/hivetown/backend/commit/0721fe3ebaeaef392f0f2426ddf0aef3f4fa49f0))
-   um pouco mais da Gateway da categoria ([f0d623f](https://github.com/hivetown/backend/commit/f0d623fedfdbd0086f8da95ec79f7342ebccb072))
-   update de um productSpec ([1fee811](https://github.com/hivetown/backend/commit/1fee811ee0f680421a47692d317190fc4373656e))
-   use errors on auth controller ([834f2b1](https://github.com/hivetown/backend/commit/834f2b13f95eeda2173927f876ac6596173f35a7))
-   use errors on category controller ([a46c80f](https://github.com/hivetown/backend/commit/a46c80f17a29e7290c23fe75b52b28b26d4005b5))
-   use errors on consumer controller ([ff4634f](https://github.com/hivetown/backend/commit/ff4634faec2857cf2bf0b2f0548a280917ca391b))
-   use errors on producers controller ([8acf31a](https://github.com/hivetown/backend/commit/8acf31a2934cd2b016ac5626781734a1d736c916))
-   user gateway ([6608c2f](https://github.com/hivetown/backend/commit/6608c2f68e288556a41bf0e106b851c402408095))
-   ver um produto de uma spec ([fc068a3](https://github.com/hivetown/backend/commit/fc068a3138c263fa48654a0ba5923642fb88d368))
-   virtual properties so we can use getResultList instead of execute ([61df384](https://github.com/hivetown/backend/commit/61df3847f77f7666a1ca202c51ec093c925ea237))

### Bug Fixes

-   /orders/:orderId/items ([e1d2bb4](https://github.com/hivetown/backend/commit/e1d2bb4944adf4b58a2ee3474575f2f6a1592f51))
-   add missing authmiddleware to routes ([8939638](https://github.com/hivetown/backend/commit/8939638b8b4687ded398b35d88d25aa0b97443ec))
-   add user to consumer/producer usages ([2a66c9f](https://github.com/hivetown/backend/commit/2a66c9f0ed28e7afb137443ec993c97b86fbd255))
-   addresses e urls ([0e01b59](https://github.com/hivetown/backend/commit/0e01b5913c7de745070853bd6b72c405032f51bd))
-   adicao do populate address ao findbyid do consumer ([ccd4c03](https://github.com/hivetown/backend/commit/ccd4c038c708a37b8a58ab214cc5150835b2191f))
-   adição do populate das imagens ([682a8ac](https://github.com/hivetown/backend/commit/682a8acb6796fe0e3a2657bbea32102b2c46edd2))
-   adição do populate nas imagens ([371acef](https://github.com/hivetown/backend/commit/371acefa2034fa3541ba13a692dba78ecf706dc9))
-   allow unauthenticated users to fetch producers ([d03ad24](https://github.com/hivetown/backend/commit/d03ad244b3de67909be856a71fb35f64c1814d14))
-   arrays ([9447ae2](https://github.com/hivetown/backend/commit/9447ae2a4580fb2722a97264bd9339f7bd58dfc4))
-   arrays, correção do generalStatus para um especifico para o producer ([43023d4](https://github.com/hivetown/backend/commit/43023d470c3b2dc109347f9168097dc1d2ea2330))
-   async a mais ([9cfdab1](https://github.com/hivetown/backend/commit/9cfdab1c68b99ac6d13ee42bd8b01d125e400d2d))
-   atualização com base nos comentários do pull request ([be5cb88](https://github.com/hivetown/backend/commit/be5cb88f1008171926d7b44c6c18420fba6cbbe0))
-   base de dados para incluir o estado de uma entrega ([b1ce84e](https://github.com/hivetown/backend/commit/b1ce84e3eee8b88175f164aad209ae8e053df76d))
-   canCancel da order ([12e0d59](https://github.com/hivetown/backend/commit/12e0d59b4be93a9ebd02b4ef5a389b0e608783f0))
-   cart joincolumn and productspecfield dependencies ([cdca93c](https://github.com/hivetown/backend/commit/cdca93c1015323593fc83ea3755312900b9860e4))
-   change ProducerProduct currentPrice type to double ([6e7a201](https://github.com/hivetown/backend/commit/6e7a201f5b7534103ad8ba63bc0662459a28eda2))
-   conflicts with main ([60b9c24](https://github.com/hivetown/backend/commit/60b9c24d5d8e67b7bf68590e7461d8e8668c211a))
-   consumer/producer creation ([d1bd0b6](https://github.com/hivetown/backend/commit/d1bd0b6ec050635954188b7e521606b90e3b7df9))
-   consumidores ([22aef88](https://github.com/hivetown/backend/commit/22aef88dd134bebdea55dcf78997d7c2c952d741))
-   convertExportOrderItem ([6e23ad0](https://github.com/hivetown/backend/commit/6e23ad0db27a0a513daf24ab56d241bcff46476f))
-   copy paste upsi ([9c7ef6b](https://github.com/hivetown/backend/commit/9c7ef6b508a3ce8e67555a72103cddf0b3b0e852))
-   de um erro causado pela remocao dos getters ([768116c](https://github.com/hivetown/backend/commit/768116c0d6b274e908d071f061aeac90fce7367a))
-   debug aos imports dos Gateways, feat: mais alguns caminhos feitos ([0ee07d2](https://github.com/hivetown/backend/commit/0ee07d270a2bc63a24ac5a1bfc38b9fe44c0f258))
-   decimal/numeric to double ([9400751](https://github.com/hivetown/backend/commit/94007515f59f5971aa936712fc6cb10f18ee01f3))
-   delete cart items ([e34d33a](https://github.com/hivetown/backend/commit/e34d33a248fa8cd18d16e5e79c5b4c68760a3451))
-   don't show consumer null on production unit addresses ([be399ba](https://github.com/hivetown/backend/commit/be399baec78a4b07a548ff635b14e0ee641328f8))
-   dummy-data devido as atualizações na bd ([8881bf4](https://github.com/hivetown/backend/commit/8881bf4e9ac667395a031a4eff18dabf7cdcfaf7))
-   enforce permissions on get producers and consumers with deleted ats ([ec61001](https://github.com/hivetown/backend/commit/ec610018ea10a5c376e39cd9c5cb127d948f30e5))
-   entity relationships ([cc1a08d](https://github.com/hivetown/backend/commit/cc1a08d6a5c7f1ab19f0bd419aafdf33d54238d0))
-   erros de caminhos, feat: pesquisa de produtos pela sua categoria ([859b7f4](https://github.com/hivetown/backend/commit/859b7f496518ca0cda55bacec1c0ae36c55e3150))
-   erros vistos na review ([02f0228](https://github.com/hivetown/backend/commit/02f0228f23736f421975981631630801df19a53d))
-   estado quando se associa um carrier a um shipment ([b2c1455](https://github.com/hivetown/backend/commit/b2c14554f800b451c0249828d5a44d288e8a2ad4))
-   export orders ([26a30dc](https://github.com/hivetown/backend/commit/26a30dccb1586a6082464f98dc6fde9be0a624a6))
-   favor getResultList instead of execute ([ae018f9](https://github.com/hivetown/backend/commit/ae018f9046f6df763732355209028abf988b27ac))
-   filter out deleted producer products from producer products ([436645c](https://github.com/hivetown/backend/commit/436645caee13b471401f88f328689061feedc09e))
-   filtering by field ([f440711](https://github.com/hivetown/backend/commit/f4407110282bda672a5a1e00b795a981fce65e94))
-   fix de várias coisas feat: pesquisar por produtos comuns e categorias ([ff127ca](https://github.com/hivetown/backend/commit/ff127ca0e764a62e1257463bb5304b4bebe584af))
-   fix merge issues ([a381c58](https://github.com/hivetown/backend/commit/a381c58e50a3ae84b89df92a7518556d9ebb3699))
-   fix mikro ([debc90e](https://github.com/hivetown/backend/commit/debc90ea71946aae1f1c1faf94fe829352cf8069))
-   forgot to find producer ([d9df989](https://github.com/hivetown/backend/commit/d9df989bac38e7843d911f75c2f9fd6170b4ab50))
-   forgot to make search lowercase ([9d0d3f0](https://github.com/hivetown/backend/commit/9d0d3f00cf6a63967b6ec8c088410d8544a928eb))
-   get dos items de uma order de um consumidor ([a0d1c86](https://github.com/hivetown/backend/commit/a0d1c86ee4f894d3dd6b2536bc001864edb6edf2))
-   get order de um consumidor ([5bcd875](https://github.com/hivetown/backend/commit/5bcd8757c1bf5a49e9eac72733f6de8e8b44c893))
-   hello.ts talvez possa ser eliminado (?) ([8be3406](https://github.com/hivetown/backend/commit/8be3406f641b02ebf08d87aff33682bfb67ad417))
-   ids on consumer and producer gateways ([1056033](https://github.com/hivetown/backend/commit/105603315581dd4341d788ba2f49c52961630ddc))
-   image error on seedr ([f8d0a47](https://github.com/hivetown/backend/commit/f8d0a47aa16cf2e782f5062c1223fc334318991f))
-   juntar dois ficheiros diferentes que serviam para o mesmo (producers.ts producer.ts) ([85f4898](https://github.com/hivetown/backend/commit/85f48980faffae9393a121e776e6d8e905fe1573))
-   make address one to many ([bad750f](https://github.com/hivetown/backend/commit/bad750fde710f3fa421b5f15be91f0df9616f3ff))
-   melhoria na validação dos fields das categorias ([5682002](https://github.com/hivetown/backend/commit/5682002dc3a2952b03571435370f0ef7044ad67d))
-   mensagens de erro e canCancel para verificar também se já foi cancelado ([24635f6](https://github.com/hivetown/backend/commit/24635f622e794723a7545af2c4e08518555c33f0))
-   merge conflicts ([523eb7d](https://github.com/hivetown/backend/commit/523eb7defa16c1f5ecbabab35c30b9da4fd4910e))
-   migracoes ([e74055a](https://github.com/hivetown/backend/commit/e74055a1b14a78eae3427b09982eca6d4e08f377))
-   migrations ([d71a58a](https://github.com/hivetown/backend/commit/d71a58a417a6760c1289b5bbea103399b50db21c))
-   minor spelling ([571c775](https://github.com/hivetown/backend/commit/571c775432629c1a33672578ff416d9690d57e74))
-   mostrar o produto quando é criado ([114cf12](https://github.com/hivetown/backend/commit/114cf12588f6f1bb8df4d6d1fbe654cceaf30ecd))
-   mudança de um erro de tipagem ([27ca3a4](https://github.com/hivetown/backend/commit/27ca3a414218b01bbe313febf1d60f0dc9da8bd0))
-   pageSize ([45c9e0b](https://github.com/hivetown/backend/commit/45c9e0b21f58a7034b9447ba8819a0488510262e))
-   params instead of query ([11aa6fd](https://github.com/hivetown/backend/commit/11aa6fdc73d5b58610a27c40092c705aa30b1c21))
-   private fields, except for relations ([5bde6ff](https://github.com/hivetown/backend/commit/5bde6ff349c7fe6b11f0f597177d099146f25d6c))
-   produtores ([d5f0de4](https://github.com/hivetown/backend/commit/d5f0de45669b211961e37cc214d515f14da27cf9))
-   query para ver as ups de um produtor de um productSepc ([7d71cdc](https://github.com/hivetown/backend/commit/7d71cdc12f7058423fba6d150f92a276f172e05e))
-   remove getters ([139eddb](https://github.com/hivetown/backend/commit/139eddb241fa366cad355e73a0fcd85e4178ff1d))
-   remove unused import ([4bb49e9](https://github.com/hivetown/backend/commit/4bb49e9a0078008c46cd679d4b14b927bbfab1d2))
-   remove unused methods ([7bb7f7f](https://github.com/hivetown/backend/commit/7bb7f7fb8394758ca0fa66905711a97dc16e4b1c))
-   req.user would be undefined if route did not have authorization ([4c28fc8](https://github.com/hivetown/backend/commit/4c28fc8ef04c22c070aa94520353e85aa98ce96d))
-   retirar um import que não era usado ([e5892f1](https://github.com/hivetown/backend/commit/e5892f1d27c55cb376ebe9f52296421e05769d5e))
-   retirar uma linha errada ([f4e1bce](https://github.com/hivetown/backend/commit/f4e1bceb5b93697941e50a4d16bc32ffaa6fa1ab))
-   retirei os getters pois os atributos sao public ([07df4a4](https://github.com/hivetown/backend/commit/07df4a48175e43cb601a0a883844547445fe0ae0))
-   retorno do address na exportação ([856cca6](https://github.com/hivetown/backend/commit/856cca621f30a3cdd975bfc657056c9288677fb5))
-   retornos json das categorias fixed ([90dc1de](https://github.com/hivetown/backend/commit/90dc1de6c217c21fccdd3a2c188e9f42b16eb915))
-   retornos json dos produtos fixed ([249e3f3](https://github.com/hivetown/backend/commit/249e3f3a58984e894ac87bbf20a7c000b8f1f735))
-   return dos métodos de update e add ao cart ([c92c0a2](https://github.com/hivetown/backend/commit/c92c0a284927a7c3fdb41282b2186dbb20cf7d08))
-   return empty list instead of 404 ([21072bd](https://github.com/hivetown/backend/commit/21072bd62aa64f1647a11fd4e725fe04114a3c00))
-   routes e pormenores ([21a1bda](https://github.com/hivetown/backend/commit/21a1bdaeb292d2ef76e3a82d9a2251f09b4c9855))
-   routes that differred ([fcd0b26](https://github.com/hivetown/backend/commit/fcd0b268da8ec3427d202afac7632508aac8cdf4))
-   seeder ([a2ced6c](https://github.com/hivetown/backend/commit/a2ced6cd35389a07a860d5073f7b3ab31d015364))
-   seeder to use User ([091cd3a](https://github.com/hivetown/backend/commit/091cd3a3c05826023cfb8a06b8c1c3554fb36828))
-   show product spec and product spec images ([413da57](https://github.com/hivetown/backend/commit/413da579a8d4a7b7410560b5b1ebe1b98bff26e9))
-   show role on GET /auth ([4123d78](https://github.com/hivetown/backend/commit/4123d787b6c24b305a7a6044e195fb9148a93ab3))
-   some entities ([47ba6ff](https://github.com/hivetown/backend/commit/47ba6ff2515b87f72f2cce75fbfa568b4c5b77d7))
-   some other routes ([79fa884](https://github.com/hivetown/backend/commit/79fa884a1685a6bafe53728b7e9907091573bcec))
-   some typings ([d60a1a0](https://github.com/hivetown/backend/commit/d60a1a0e5c817b6ffbc6a1c8c204ce990665eb8d))
-   sometimes carrier is undefined, so let's force all to exist ([770359b](https://github.com/hivetown/backend/commit/770359b3540763e7b104d2aaec28071b7191a133))
-   staying invalid if user passes other validators ([6e58ae4](https://github.com/hivetown/backend/commit/6e58ae49ed23b104a8df000aa3e68de77ac9f061))
-   tipos de alguns atributos nas interfaces ([d5cfcbf](https://github.com/hivetown/backend/commit/d5cfcbf1fe0f9c5e939fd3f7aff997afeacbc37d))
-   tratamento de erros do stripe ([e0efcc7](https://github.com/hivetown/backend/commit/e0efcc7745e1ea79bc597cbc331a1071f3d31611))
-   upsert and delete throwing funny errors ([bf3ac0b](https://github.com/hivetown/backend/commit/bf3ac0b7590f35b96e71a89533a5e624b413f9d8))
-   url das imagens no seeder ([34ce4c4](https://github.com/hivetown/backend/commit/34ce4c4d9f96efc9975eca5f6368cf1f51970812))
-   url das imagens no seeder ([33a786b](https://github.com/hivetown/backend/commit/33a786b7d290d139adb035f049e24b09ef0737bc))
-   use correct endpoint ([7a8bc89](https://github.com/hivetown/backend/commit/7a8bc895c5b25bf950b755e09f850056c5a7d749))
-   use error middleware instead ([387de66](https://github.com/hivetown/backend/commit/387de663258d86c1241a178627bea91c60dd7c4f))
-   use getResultList instead of execute ([aeed289](https://github.com/hivetown/backend/commit/aeed289c0903eacefdfca67ecb0eaaac1168f5fa))
-   user ([43741f7](https://github.com/hivetown/backend/commit/43741f7329845133afbb6bf5102691be226f8b1f))
-   validate das imagens ([8a10307](https://github.com/hivetown/backend/commit/8a1030757370f9f0363ddbe9e3573ea6df45e239))
-   variaveis de ambiente ([fcbdc33](https://github.com/hivetown/backend/commit/fcbdc3323153c37ea2ca8f16f744001890b6605b))
-   were missing user object in some places ([5c7235f](https://github.com/hivetown/backend/commit/5c7235f4d429fcf88c5d8720b80a1fb39d41258d))
-   when there's no production unit or no products on producer ([f7f3a77](https://github.com/hivetown/backend/commit/f7f3a774ef31917fea72f229ac300ba0a9a1de86))

### Miscellaneous Chores

-   drop Cart entirely and relate Consumer to CartItem ([9359e05](https://github.com/hivetown/backend/commit/9359e05b3dc9d5db1fe1205d05d3f887a51d31c7))
