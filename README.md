# Watch With Me

Catálogo de filmes inspirado na Netflix, construído como teste técnico para o processo seletivo de Desenvolvedor(a) Web Full Stack da **Voxter**. Consome a [OMDb API](https://www.omdbapi.com) para busca e detalhes de títulos, com cadastro/login de usuário e lista de favoritos ("Minha Lista") persistida por usuário.

## Funcionalidades

- Cadastro e login de usuário (JWT + senha com hash bcrypt), com botão de mostrar/ocultar senha nos dois formulários
- Avatar do usuário logado: como o login é feito com e-mail/senha (não há OAuth do Google/Gmail), a barra de navegação exibe um avatar gerado a partir do nome/e-mail do usuário (mesma cor/iniciais sempre, sem chamadas externas) — veja a nota sobre isso em [GUIA.md](./GUIA.md#5-avatar-do-usuário)
- Catálogo com banner de destaque e carrosséis por categoria
- Busca de títulos consumindo a OMDb API, com **busca automática/instantânea**: os resultados aparecem enquanto você digita (a partir de 2 letras, com debounce), sem precisar apertar Enter, priorizando títulos que começam com o texto digitado — disponível tanto na Home quanto em um ícone de lupa na barra de navegação, acessível de qualquer página
- Página de detalhes (pôster, sinopse, elenco, ano, nota IMDb), com fundo desfocado ("hero") a partir do pôster do título
- "Minha Lista": adicionar/remover favoritos, vinculado ao usuário logado, com ícone de "+"/"✓" no estilo Netflix
- Pôsteres ausentes ou com erro de carregamento caem graciosamente em um placeholder estilizado, em vez de um ícone de imagem quebrada
- Layout responsivo (mobile, tablet e desktop), com navbar que fica transparente sobre o banner e sólida ao rolar a página, e scrollbar customizada — como na Netflix

## Tecnologias

Next.js (App Router) · TypeScript · React 19 · Tailwind CSS · MongoDB/Mongoose · JWT · bcryptjs · Zustand

Veja o [GUIA.md](./GUIA.md) para uma explicação detalhada de cada tecnologia e de como elas se conectam.

## Pré-requisitos

- Node.js 20 ou superior
- Um banco MongoDB (local ou [MongoDB Atlas](https://www.mongodb.com/atlas), gratuito)
- Uma chave gratuita da OMDb API: https://www.omdbapi.com/apikey.aspx

## Instalação

```bash
git clone <url-do-seu-repositorio>
cd watch_with_me
npm install
```

## Variáveis de ambiente

Copie o arquivo de exemplo e preencha com seus valores:

```bash
cp .env.example .env.local
```

| Variável         | Descrição                                                                 |
|------------------|-----------------------------------------------------------------------------|
| `MONGODB_URI`    | String de conexão do MongoDB (ex.: `mongodb+srv://usuario:senha@cluster.../watchwithme`) |
| `JWT_SECRET`     | String aleatória usada para assinar os tokens de login. Gere uma com `openssl rand -hex 32` |
| `OMDB_API_KEY`   | Chave gratuita obtida em https://www.omdbapi.com/apikey.aspx                |

`.env.local` nunca deve ser commitado — já está no `.gitignore`.

> `.env.example` também traz `NEXTAUTH_URL`. Ela **não é lida em nenhum lugar do código atual** (a aplicação não usa NextAuth, só JWT próprio) — está lá apenas como referência para uma futura evolução com login social (veja [GUIA.md, seção "Avatar do usuário"](./GUIA.md#5-avatar-do-usuário)). Você pode deixá-la de fora sem nenhum impacto.

**Erro comum ao configurar essas variáveis na Vercel:** cole o valor de `MONGODB_URI` sem aspas em volta e sem espaço/quebra de linha antes ou depois — se o Mongoose receber algo que não começa exatamente com `mongodb://` ou `mongodb+srv://`, o login/cadastro falha com "Internal server error" (`MongoParseError: Invalid scheme`). Como campos "Sensitive" na Vercel não mostram o valor salvo de volta para edição, se desconfiar de um valor colado errado, apague o conteúdo do campo Value e cole de novo do zero.

## Executando o projeto

```bash
npm run dev
```

Abra http://localhost:3000 no navegador.

### Criando uma conta para login

Você pode se cadastrar normalmente pela tela de "Sign up", ou criar uma conta de demonstração pronta rodando:

```bash
npm run seed
```

Isso cria (ou reseta a senha de) um usuário de teste no seu banco configurado em `MONGODB_URI`. As credenciais geradas ficam documentadas no [GUIA.md](./GUIA.md).

## Como fazer login e cadastro (localmente e em produção)

A autenticação (e-mail/senha + JWT) é a mesma em qualquer ambiente — não há nada preso a `localhost`. O que muda entre local e produção é só **onde** as variáveis de ambiente ficam configuradas e se o MongoDB Atlas aceita a conexão de onde a aplicação está rodando.

### Localmente

1. Configure o `.env.local` (veja [Variáveis de ambiente](#variáveis-de-ambiente) acima).
2. Rode `npm run dev` e abra http://localhost:3000 — a aplicação leva direto para a tela de login.
3. Para entrar, você tem duas opções:
   - **Criar sua própria conta:** clique em "Sign up now", preencha nome/e-mail/senha e envie. Você é logado automaticamente após o cadastro.
   - **Usar a conta de demonstração:** rode `npm run seed` (uma única vez) para criar `demo@watchwithme.com` / `Demo@12345` no banco apontado pelo seu `MONGODB_URI`, e faça login com essas credenciais na tela inicial.

### Em produção (Vercel)

1. **Configure as variáveis de ambiente no projeto da Vercel** (Project Settings → Environment Variables): `MONGODB_URI`, `JWT_SECRET`, `OMDB_API_KEY`. Sem isso, `/api/auth/login` e `/api/auth/register` retornam erro 500.
2. **Libere o acesso de rede no MongoDB Atlas:** em Atlas → Network Access → Add IP Address → `0.0.0.0/0` ("Allow access from anywhere"). A Vercel usa IPs dinâmicos em cada execução serverless, então restringir por IP fixo bloqueia a conexão em produção.
3. Faça o deploy (import do repositório na Vercel) e acesse a URL gerada, ex.: `https://<seu-projeto>.vercel.app`.
4. Para entrar, as mesmas duas opções da versão local funcionam diretamente na URL de produção:
   - **Qualquer pessoa avaliando o projeto** (recrutador, outros usuários) pode clicar em "Sign up now" na própria tela de produção e criar uma conta na hora — não é necessário nenhuma credencial especial.
   - Se `MONGODB_URI` em produção apontar para o **mesmo cluster Atlas** usado localmente, a conta demo criada com `npm run seed` (localmente) também funciona para login em produção, já que é o mesmo banco.

> Se o login funcionar localmente mas retornar "Internal server error" em produção, o motivo quase sempre é um dos dois primeiros passos acima (env var faltando ou IP bloqueado no Atlas) — confira os logs da função em Vercel → Deployments → seu deploy → Functions para confirmar.

## Build de produção

```bash
npm run build
npm start
```

## Deploy

O deploy do projeto está feito na [Vercel](https://watch-with-me-pi.vercel.app/): basta importar o repositório e configurar `MONGODB_URI`, `JWT_SECRET` e `OMDB_API_KEY` nas variáveis de ambiente do projeto na Vercel (Project Settings → Environment Variables).

## Scripts disponíveis

| Comando          | Descrição                                      |
|-------------------|-------------------------------------------------|
| `npm run dev`     | Inicia o servidor de desenvolvimento            |
| `npm run build`   | Gera o build de produção                        |
| `npm start`       | Roda o build de produção                        |
| `npm run lint`    | Executa o ESLint                                |
| `npm run types`   | Verifica tipos com o TypeScript (`tsc --noEmit`)|
| `npm run seed`    | Cria/reseta a conta de demonstração no banco    |
