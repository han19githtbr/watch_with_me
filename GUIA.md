# GUIA.md — Como o Watch With Me funciona

Este documento explica em detalhes o que foi implementado, as tecnologias usadas, o papel de cada uma e como elas se conectam para a aplicação funcionar de ponta a ponta.

---

## 1. Credenciais de login

Não é possível gerar um usuário diretamente no seu banco de dados a partir deste ambiente (não há acesso de rede ao MongoDB Atlas por aqui). Em vez disso, foi criado um script de seed que cria a conta de demonstração **no seu próprio banco**, usando a `MONGODB_URI` que você configurar em `.env.local`.

Depois de configurar o `.env.local` (veja o README.md), rode uma única vez:

```bash
npm run seed
```

Isso cria/atualiza a conta abaixo diretamente no seu MongoDB:

| Campo    | Valor                  |
|----------|--------------------------|
| E-mail   | `demo@watchwithme.com`   |
| Senha    | `Demo@12345`             |

Use essas credenciais na tela de login. Você também pode simplesmente clicar em "Sign up now" e criar sua própria conta manualmente — o seed é só um atalho.

> O script está em `scripts/seed-user.mjs` e é idempotente: pode ser rodado quantas vezes quiser, ele apenas garante que a conta exista com essa senha.

---

## 2. Visão geral da arquitetura

```
┌─────────────┐      HTTP       ┌────────────────────┐      HTTP       ┌──────────────┐
│   Browser   │ ───────────────▶│  Next.js (App +     │ ───────────────▶│  OMDb API     │
│  (React UI) │◀─────────────── │  API Routes)         │◀──────────────── │  (filmes)     │
└─────────────┘                 └──────────┬───────────┘                 └──────────────┘
                                            │
                                            │ Mongoose (driver MongoDB)
                                            ▼
                                  ┌───────────────────┐
                                  │  MongoDB Atlas      │
                                  │  (usuários/favoritos)│
                                  └───────────────────┘
```

A aplicação é um único projeto **Next.js full stack**: o mesmo servidor que renderiza a interface também expõe as rotas de API (`app/api/**`) que fazem o papel de "backend". Não existem dois projetos/servidores separados.

---

## 3. Tecnologias usadas e o papel de cada uma

### Next.js (App Router) + React 19
Framework principal. Cada arquivo em `app/**/page.tsx` vira uma rota da aplicação (ex.: `app/my-list/page.tsx` → `/my-list`). Cada arquivo em `app/api/**/route.ts` vira um endpoint HTTP (ex.: `app/api/auth/login/route.ts` → `POST /api/auth/login`). React cuida da renderização da interface e do gerenciamento de estado local dos componentes.

### TypeScript
Tipagem estática para todo o código (frontend, API routes e libs). Os tipos de filme (`Movie`, `MovieDetails`) ficam centralizados em `lib/types.ts` e são reaproveitados pelos componentes, pelas rotas de API e pela store, evitando divergência entre o formato de dado que a OMDb devolve e o que a interface espera.

### Tailwind CSS
Estilização utilitária. As cores da identidade visual (`netflix-red`, `netflix-dark`, `netflix-light`) estão centralizadas em `tailwind.config.js`, e classes reutilizáveis (`.netflix-button`, `.netflix-card`, `.no-scrollbar`) ficam em `app/globals.css`.

### Zustand
Gerenciador de estado global no cliente, usado em dois "stores":
- `store/authStore.ts` — usuário logado, token JWT, login/registro/logout e as operações de favoritos. Usa o middleware `persist` para manter a sessão salva no `localStorage` do navegador entre recarregamentos de página.
- `store/movieStore.ts` — resultado da busca de filmes, estado de carregamento e a última busca realizada (controla se a Home mostra os carrosséis por categoria ou os resultados da busca).

### MongoDB + Mongoose
Banco de dados onde ficam os usuários (`models/User.ts`): e-mail, senha (hash), nome e a lista de `favorites` (array de `imdbID`s). O Mongoose é o ODM que traduz as operações (`findOne`, `create`, `save`) em comandos do MongoDB. A conexão é gerenciada em `lib/mongodb.ts` com cache de conexão (`global.mongoose`), prática recomendada para ambientes serverless (evita abrir uma conexão nova a cada requisição).

### bcryptjs
Faz o hash da senha antes de salvar no banco (`bcrypt.hash`) e a comparação segura no login (`bcrypt.compare`). A senha em texto puro nunca é armazenada.

### jsonwebtoken (JWT)
Depois de um login válido, o servidor assina um token (`lib/auth.ts` → `generateToken`) contendo o `userId` e `email`, válido por 7 dias. Esse token é guardado no `authStore` (cliente) e enviado no header `Authorization: Bearer <token>` em toda requisição que precisa saber quem é o usuário (adicionar/remover favorito, listar favoritos). O servidor valida o token com `verifyToken` antes de tocar no banco.

### OMDb API
Fonte de todos os dados de filmes (pôster, título, ano, sinopse, elenco, nota IMDb). É consumida **apenas pelo servidor** (`lib/omdb.ts`), nunca diretamente pelo navegador — isso mantém a `OMDB_API_KEY` fora do bundle do cliente.

---

## 4. Como as peças se conectam

### Fluxo de autenticação
1. Usuário preenche o formulário em `components/Auth/Login.tsx` ou `app/register/page.tsx`.
2. O `authStore` chama `POST /api/auth/login` ou `POST /api/auth/register`.
3. A rota de API conecta ao MongoDB (`connectToDatabase`), verifica/cria o usuário (`models/User.ts`), compara a senha com bcrypt e, no login, gera um JWT.
4. O token e os dados do usuário voltam para o `authStore`, que persiste tudo no `localStorage` via `zustand/persist`.
5. Enquanto não há usuário autenticado, a Home (`app/page.tsx`) renderiza a tela de `Login` no lugar do catálogo — e o mesmo vale para a página de detalhes de filme, mantendo o app consistente.

### Fluxo do catálogo e busca
1. Ao carregar a Home autenticada, quatro buscas fixas (`avengers`, `batman`, `friends`, `godfather`) são disparadas em paralelo contra `GET /api/movies/search`, uma por categoria (Popular/Action/Comedy/Drama).
2. Cada rota de API chama `searchMovies()` em `lib/omdb.ts`, que consulta a OMDb e devolve a lista de filmes.
3. Cada categoria é exibida em um carrossel horizontal (`components/MovieCarousel.tsx`) com rolagem por toque/mouse e setas de navegação.
4. Ao digitar algo na busca (`components/SearchBar.tsx`), o `movieStore` substitui os carrosséis pelos resultados da busca.
5. Ao clicar em um filme, o usuário vai para `/movie/[id]`, que busca os detalhes completos via `GET /api/movies/[id]` (rota que chama `getMovieDetails()`).

### Fluxo de favoritos ("Minha Lista")
1. Em qualquer cartão de filme ou na página de detalhes, o coração chama `addFavorite`/`removeFavorite` do `authStore`.
2. Essas funções enviam `POST`/`DELETE` para `/api/user/favorites` com o JWT no header.
3. A rota valida o token, busca o usuário no MongoDB e atualiza o array `favorites`.
4. A resposta atualiza o `authStore`, refletindo o novo estado do coração (❤️/🤍) em todos os cartões imediatamente, sem precisar recarregar a página.
5. A página `/my-list` lê `user.favorites`, busca os detalhes de cada `imdbID` na OMDb e exibe o grid de favoritos.

---

## 5. Decisões e limitações conhecidas

- **Categorias não são gêneros reais.** A OMDb não tem um endpoint de "buscar por gênero"; por isso, cada carrossel (Action, Comedy, Drama...) é alimentado por um termo de busca representativo, não por um filtro de gênero de verdade. É uma limitação da API gratuita, não um bug.
- **Banner de destaque.** Como a OMDb só fornece pôsteres (proporção retrato 2:3), o banner usa o pôster do primeiro filme popular como fundo desfocado/ampliado, com um pôster nítido em primeiro plano — evita esticar/distorcer a imagem como um banner widescreen real faria.
- **Segredos fora do bundle do cliente.** `next.config.ts` **não** deve conter `MONGODB_URI`, `JWT_SECRET` ou `OMDB_API_KEY` dentro de `env: {...}` — isso os inlinaria no JavaScript enviado ao navegador. Toda leitura dessas variáveis acontece exclusivamente em código de servidor (`app/api/**`, `lib/**`).
- **Página de detalhes exige login**, assim como a Home, para manter o comportamento consistente em toda a aplicação.

---

## 6. Checklist em relação ao documento de especificação

| Requisito do teste técnico | Status |
|---|---|
| Login e cadastro | ✅ |
| Catálogo com banner de destaque + carrosséis por categoria | ✅ |
| Busca de títulos via OMDb API | ✅ |
| Página de detalhes (pôster, sinopse, elenco, ano, nota IMDb) | ✅ |
| "Minha Lista" (favoritos vinculados ao usuário logado) | ✅ |
| Backend com persistência em banco à sua escolha | ✅ MongoDB |
| Frontend com identidade visual inspirada na Netflix | ✅ |
| Responsivo para diferentes tamanhos de tela | ✅ |
| README com instalação, execução e variáveis de ambiente | ✅ |
