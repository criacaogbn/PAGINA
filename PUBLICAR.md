# Como publicar o Google Tag Manager no www.gbn3d.com

Os arquivos locais já foram editados com o código do **Google Tag Manager** (container `GTM-P3WLP2FN`).  
Agora você precisa **enviar esses arquivos para o servidor de produção** onde o site está hospedado.

## O que foi alterado localmente

Foi adicionado o código do GTM em **10 arquivos HTML**, logo após a tag `<head>` (o mais alto possível):

```html
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-P3WLP2FN');</script>
<!-- End Google Tag Manager -->
```

### Arquivos editados (10 total):

| # | Arquivo local |
|---|---------------|
| 1 | `index.html` |
| 2 | `galeria.html` |
| 3 | `wwwgbn3dcom-files\index.html` |
| 4 | `wwwgbn3dcom-files\404.html` |
| 5 | `wwwgbn3dcom-files\tags\index.html` |
| 6 | `site\index.html` |
| 7 | `site\galeria.html` |
| 8 | `site\wwwgbn3dcom-files\index.html` |
| 9 | `site\wwwgbn3dcom-files\404.html` |
| 10 | `site\wwwgbn3dcom-files\tags\index.html` |

---

## Como publicar (escolha o método que usa)

### Opção A: FTP / SFTP
Se você acessa o servidor via FTP (FileZilla, WinSCP, etc.):

1. Conecte ao servidor do `www.gbn3d.com`
2. Substitua os 10 arquivos listados acima pelos arquivos locais editados
3. Mantenha a mesma estrutura de pastas (`wwwgbn3dcom-files/`, `site/`, etc.)
4. Aguarde alguns minutos e teste em `https://www.gbn3d.com/`

### Opção B: Git / GitHub + Deploy automático
Se o site faz deploy a partir de um repositório Git:

```powershell
cd e:\gbn3d\site2
git add .
git commit -m "Adiciona Google Tag Manager GTM-P3WLP2FN em todas as páginas"
git push origin main  # ou a branch que você usa
```

Após o push, aguarde o pipeline de deploy ser concluído.

### Opção C: Painel de hospedagem (cPanel, Plesk, etc.)
1. Acesse o Gerenciador de Arquivos do seu painel de hospedagem
2. Navegue até a pasta raiz do `www.gbn3d.com`
3. Faça upload dos 10 arquivos editados, sobrescrevendo os existentes
4. Teste o site

---

## ⚠️ PASSO OBRIGATÓRIO: Configurar a tag do Analytics dentro do GTM

O código GTM foi instalado no site, mas **ele ainda não envia dados para o Google Analytics**. Você precisa configurar isso na interface do GTM:

1. Acesse [tagmanager.google.com](https://tagmanager.google.com)
2. Entre no container `GTM-P3WLP2FN`
3. Clique em **Tags** → **Nova**
4. Escolha **Configuração de tag**: Google Analytics: Configuração do GA4
5. Insira o ID de medição: `G-BKDT6QRE9Z`
6. No disparador, escolha **Todas as páginas**
7. Salve e clique em **Enviar** → **Publicar**

Após publicar no GTM, o Google Analytics começará a receber dados.

---

## Como verificar se funcionou

Após publicar os arquivos e configurar a tag no GTM, acesse `https://www.gbn3d.com/` no navegador:

1. Pressione `F12` → aba **Console**
2. Digite: `google_tag_manager`  
   ✅ Se aparecer um objeto, o GTM está carregado.
3. Ou instale a extensão **Google Tag Assistant** no Chrome/Edge para confirmar.

---

## Validação local (opcional)

Execute o script de validação incluído nesta pasta:

```powershell
cd e:\gbn3d\site2
powershell -ExecutionPolicy Bypass -File VALIDAR_GA.ps1
```

Ele verificará se todos os 10 arquivos têm o código do GTM e se não há duplicação.