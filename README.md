# Watch With Me

Catálogo de filmes inspirado na Netflix, construído como teste técnico para o processo seletivo de Desenvolvedor(a) Web Full Stack da **Voxter**. Consome a [OMDb API](https://www.omdbapi.com) para busca e detalhes de títulos, com cadastro/login de usuário e lista de favoritos ("Minha Lista") persistida por usuário.

## Funcionalidades

- Cadastro e login de usuário (JWT + senha com hash bcrypt)
- Catálogo com banner de destaque e carrosséis por categoria
- Busca de títulos consumindo a OMDb API
- Página de detalhes (pôster, sinopse, elenco, ano, nota IMDb)
- "Minha Lista": adicionar/remover favoritos, vinculado ao usuário logado
- Layout responsivo (mobile, tablet e desktop)

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

## Build de produção

```bash
npm run build
npm start
```

## Deploy

O projeto está pronto para deploy na [Vercel](https://vercel.com): basta importar o repositório e configurar `MONGODB_URI`, `JWT_SECRET` e `OMDB_API_KEY` nas variáveis de ambiente do projeto na Vercel (Project Settings → Environment Variables).

## Scripts disponíveis

| Comando          | Descrição                                      |
|-------------------|-------------------------------------------------|
| `npm run dev`     | Inicia o servidor de desenvolvimento            |
| `npm run build`   | Gera o build de produção                        |
| `npm start`       | Roda o build de produção                        |
| `npm run lint`    | Executa o ESLint                                |
| `npm run types`   | Verifica tipos com o TypeScript (`tsc --noEmit`)|
| `npm run seed`    | Cria/reseta a conta de demonstração no banco    |

## Documentação adicional

Consulte o [GUIA.md](./GUIA.md) para detalhes de arquitetura, decisões técnicas e credenciais de login.
