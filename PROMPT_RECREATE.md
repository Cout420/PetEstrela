# Prompt para Recriação do Projeto: Pet Estrela Crematório

## 1. Visão Geral do Projeto

**Nome do Aplicativo:** Pet Estrela Crematório

**Objetivo:** Criar um site institucional completo para um crematório de animais de estimação. O site deve ser elegante, transmitir respeito e carinho, e ser totalmente gerenciável através de um painel administrativo simples.

**Tecnologias Principais:**
- **Framework:** Next.js (com App Router)
- **Linguagem:** TypeScript
- **UI:** React
- **Componentes de UI:** ShadCN UI
- **Estilização:** Tailwind CSS
- **Backend e Armazenamento:** Firebase (Cloud Firestore para dados e Cloud Storage para imagens)
- **Funcionalidades de IA:** Genkit (inicialmente para geração de QR Code/links curtos)

---

## 2. Funcionalidades Principais (Páginas)

### 2.1. Home (`/`)
- **Carrossel de Herói:** Um carrossel de tela cheia com 3 slides, cada um com uma imagem de fundo, título e subtítulo. Deve ter navegação e autoplay.
- **Seção "Por Que Escolher-nos?":** Uma seção com 4 itens destacando os diferenciais da empresa (ex: Agilidade, Atendimento 24h), cada um com um ícone, título e descrição.
- **Seção "Nosso Processo":** Uma linha do tempo visual com 4 passos descrevendo o processo de cremação.
- **Seção "Todos os Pets":** Uma seção com imagem e texto destacando que todos os tipos de animais são acolhidos.
- **Seção "Depoimentos":** Um carrossel de cards exibindo depoimentos de clientes.
- **Seção "Localização":** Mapa incorporado do Google Maps com o endereço, e informações de contato.

### 2.2. Memorial (`/memorial`)
- **Herói da Página:** Uma imagem de fundo com um título e descrição sobre o propósito do memorial.
- **Busca:** Uma barra de pesquisa para filtrar os memoriais por nome ou ID do pet.
- **Grid de Memoriais:**
    - Exibição de todos os memoriais em um grid de cards.
    - Cada card deve mostrar a foto principal do pet, nome, espécie e um link para "Ver Homenagem".
    - Um card especial no início da lista deve servir como um "call-to-action" para criar um novo memorial, levando ao WhatsApp.

### 2.3. Detalhe do Memorial (`/memorial/[id]`)
- Uma página dinâmica que exibe os detalhes de um único pet.
- **Layout:** Fundo temático (imagem de floresta com blur).
- **Conteúdo:** Nome do pet, datas de nascimento e falecimento, ID formatado, galeria com todas as suas imagens, informações (raça, família, etc.), e o texto completo da homenagem.
- **QR Code:** Exibição de um QR Code que leva para a URL pública daquele memorial.

### 2.4. Planos (`/planos`)
- Uma página exibindo os 3 planos de serviço (Essência, Harmonia, Eternus) em cards lado a lado.
- Cada card de plano deve detalhar: nome, preço, descrição, lista de itens inclusos (`features`), e um botão "Contratar" que leva ao WhatsApp.
- O plano "Harmonia" deve ter um selo de "Mais Escolhido".

### 2.5. Sobre Nós (`/sobre`)
- Página com a história e os valores da empresa.
- Deve conter seções para: Missão, Valores (grid de ícones e textos), Nossa História e Nossa Equipe (fotos e cargos).

### 2.6. Nosso Espaço (`/nosso-espaco`)
- Uma galeria de imagens mostrando as instalações da empresa (recepção, sala de despedida, jardim, etc.).
- As imagens devem ser exibidas em cards com títulos.

### 2.7. Painel Administrativo (`/admin`)
- **Autenticação:** Uma página de login (`/login`) simples que valida um usuário/senha definidos em variáveis de ambiente.
- **Dashboard Principal:** Uma vez logado, o usuário acessa `/admin`. Esta página deve conter uma tabela listando **todos os memoriais de pets** cadastrados.
- **Funcionalidades CRUD para Memoriais:**
    - **Criar:** Um botão "Adicionar Novo Memorial" que abre um formulário modal para preencher todos os dados de um novo pet (nome, espécie, textos, datas, etc.).
    - **Editar:** Um botão de "Editar" em cada linha da tabela que abre o mesmo formulário modal, pré-preenchido com os dados do pet selecionado.
    - **Deletar:** Um botão de "Deletar" em cada linha, com um diálogo de confirmação para evitar exclusão acidental.
- **Gerenciamento de Imagens:** Dentro do formulário de criação/edição, o usuário deve poder:
    - Fazer upload de uma ou mais imagens do seu computador.
    - Ver as miniaturas das imagens anexadas.
    - Remover imagens existentes da galeria do pet.
- **Salvamento:** Um botão "Salvar" que envia os dados para o Firestore e as imagens para o Firebase Storage, sem erros.

---

## 3. Guia de Estilo (Design System)

- **Cor de Fundo Principal:** Cinza muito claro (`#FBFBFB` ou `hsl(0 0% 98%)`).
- **Cor Primária:** Azul Pet Estrela (`#117EA2` ou `hsl(191 79% 44%)`). Usar em botões principais, links e títulos de destaque.
- **Cor de Destaque (Accent):** Dourado Luxo (`#E1B15A` ou `hsl(43 74% 66%)`). Usar para selos ("Mais Escolhido") e detalhes de luxo.
- **Fonte para Títulos (Headline):** `Cormorant Garamond` (serifada e elegante).
- **Fonte para Corpo de Texto (Body):** `Inter` (sans-serif, limpa e legível).
- **Estilo Geral da UI:**
    - Usar os componentes pré-estilizados do **ShadCN UI**.
    - Cards e contêineres devem ter cantos arredondados (`rounded-lg`).
    - Usar sombras sutis (`shadow-soft`, `shadow-luxury`) para dar profundidade aos elementos, especialmente nos cards.
    - Implementar animações de fade-in e slide-up suaves para a entrada de elementos na tela.
    - Botão de WhatsApp flutuante no canto inferior direito.

---

## 4. Estrutura de Dados e Backend (Firebase)

### 4.1. Cloud Firestore
Criar duas coleções principais:

- **Coleção `memorials`:**
    - Cada documento nesta coleção representa um pet. O ID do documento deve ser o `id` numérico do pet convertido para string.
    - **Estrutura de um documento de memorial:**
        ```json
        {
          "id": 1,
          "name": "Bento",
          "species": "Golden Retriever",
          "sexo": "Macho",
          "age": "8 anos",
          "family": "Família Silva",
          "birthDate": "(Timestamp)",
          "passingDate": "(Timestamp)",
          "arvore": "Ipê Amarelo",
          "local": "Jardim da Saudade",
          "tutores": "Maria e João Silva",
          "text": "Texto da homenagem...",
          "images": [
            { "imageUrl": "url_da_imagem_no_storage", "description": "", "imageHint": "" },
            { "imageUrl": "url_outra_imagem", "description": "", "imageHint": "" }
          ],
          "qrCodeUrl": "url_publica_do_memorial",
          "createdAt": "(Timestamp)"
        }
        ```

- **Coleção `siteContent`:** (Opcional, mas usado na implementação original para tornar todo o site gerenciável).
    - Documentos com IDs fixos para armazenar o conteúdo de cada página (ex: `homePageContent`, `aboutPageContent`). Isso foi removido na última versão focada apenas em memoriais, mas é parte da arquitetura completa.

### 4.2. Firebase Storage
- Todas as imagens dos pets devem ser salvas em uma pasta, por exemplo, `memorials/`.
- As regras de segurança devem permitir a leitura e escrita de arquivos apenas para usuários autenticados (os administradores logados no painel).

### 4.3. Regras de Segurança (Exemplo)
- **Firestore Rules:**
  ```
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /{document=**} {
        allow read, write: if request.auth != null;
      }
    }
  }
  ```
- **Storage Rules:**
  ```
  rules_version = '2';
  service firebase.storage {
    match /b/{bucket}/o {
      match /{allPaths=**} {
        allow read, write: if request.auth != null;
      }
    }
  }
  ```

---

## 5. Configuração do Projeto Next.js

- **Variáveis de Ambiente (`.env.local`):**
    - Todas as chaves do Firebase (`NEXT_PUBLIC_FIREBASE_...`).
    - A chave da conta de serviço do Firebase para operações de servidor (`FIREBASE_SERVICE_ACCOUNT_KEY`).
    - Credenciais do painel de login (`NEXT_PUBLIC_ADMIN_USERNAME`, `NEXT_PUBLIC_ADMIN_PASSWORD`).

- **`next.config.js`:**
    - Adicionar o domínio do Firebase Storage à configuração de imagens para permitir a otimização de imagens pelo `next/image`:
      ```javascript
      images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'storage.googleapis.com',
          },
          // ... outros domínios como unsplash, picsum
        ],
      },
      ```
    - Aumentar o limite de tamanho do corpo da requisição para Server Actions para evitar erros de "Body exceeded limit":
      ```javascript
      serverActions: {
        bodySizeLimit: '2mb',
      },
      ```

- **Serviços (`src/lib/firebase-service.ts`):**
    - Criar um arquivo central para encapsular toda a lógica de comunicação com o Firebase (CRUD de memoriais, upload de imagens, etc.). Isso mantém o código organizado e reutilizável.
