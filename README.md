This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Envio de Relatório em PDF por WhatsApp

Adicionamos a funcionalidade de geração de PDF do relatório no lado do cliente e envio direto para o WhatsApp.

### Como funciona

1. **Geração do PDF**:
   - Utilizamos as bibliotecas `html2canvas-pro` e `jspdf`.
   - O elemento contendo o relatório (`#report-print-area`) é capturado via `html2canvas-pro` como uma imagem de alta resolução (fidelidade A4). Essa biblioteca "pro" é necessária porque a versão base do `html2canvas` não possui suporte para funções de cor modernas do CSS (como `oklch` e `lab` utilizadas por padrão no Tailwind v4), resultando em erro ao renderizar o DOM.
   - O `jspdf` compila essa imagem em formato PDF A4 (suportando múltiplas páginas se necessário) gerando um Blob.

2. **Fluxo de Envio**:
   - **Dispositivos Móveis (Celulares/Tablets)**: É utilizada a API nativa de compartilhamento (`navigator.share`). Isso abre a gaveta de compartilhamento do sistema operacional e permite enviar o arquivo `.pdf` diretamente para um contato no WhatsApp com o arquivo anexado.
   - **Computadores/Navegadores Desktop**: Como o WhatsApp Web não permite anexar arquivos de forma programática por URL:
     1. O arquivo PDF é baixado automaticamente no dispositivo do usuário.
     2. Uma guia do WhatsApp Web (`https://api.whatsapp.com/send`) é aberta com o número do cliente formatado e uma mensagem automática instruindo o usuário a anexar o arquivo PDF que acabou de ser baixado.

3. **Número de Telefone**:
   - O sistema limpa o número cadastrado no cliente (removendo parênteses, traços e espaços) e adiciona o DDI `55` (Brasil) se o número possuir 10 ou 11 dígitos.
   - Caso o cliente não possua um telefone cadastrado, o sistema exibe um alerta solicitando o número do WhatsApp do cliente antes de prosseguir.

