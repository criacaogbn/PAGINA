# Script de validação do Google Tag Manager (GTM)
# Executa no PowerShell para verificar se todos os arquivos HTML têm o código GTM

$siteRoot = "e:\gbn3d\site2"
$gtmId = "GTM-P3WLP2FN"
$erros = @()

Write-Host "=== VALIDAÇÃO DO GOOGLE TAG MANAGER ===" -ForegroundColor Cyan
Write-Host "Procurando por: container GTM '$gtmId'"
Write-Host ""

# Lista de arquivos HTML para validar
$arquivos = @(
    "index.html",
    "galeria.html",
    "wwwgbn3dcom-files\index.html",
    "wwwgbn3dcom-files\404.html",
    "wwwgbn3dcom-files\tags\index.html",
    "site\index.html",
    "site\galeria.html",
    "site\wwwgbn3dcom-files\index.html",
    "site\wwwgbn3dcom-files\404.html",
    "site\wwwgbn3dcom-files\tags\index.html"
)

foreach ($arquivo in $arquivos) {
    $caminhoCompleto = Join-Path $siteRoot $arquivo
    
    if (-not (Test-Path $caminhoCompleto)) {
        Write-Host "ERRO: Arquivo não encontrado: $arquivo" -ForegroundColor Red
        $erros += "Arquivo não encontrado: $arquivo"
        continue
    }
    
    $conteudo = Get-Content $caminhoCompleto -Raw
    
    # Verifica se o código GTM está presente (busca pelo ID do container)
    if ($conteudo -match $gtmId) {
        # Verifica se aparece mais de uma vez (duplicação)
        $contagem = ($conteudo -split $gtmId).Count - 1
        if ($contagem -gt 1) {
            Write-Host "ALERTA: $arquivo - código GTM aparece $contagem vezes (duplicado!)" -ForegroundColor Yellow
            $erros += "Duplicado: $arquivo ($contagem vezes)"
        } else {
            Write-Host "OK: $arquivo" -ForegroundColor Green
        }
    } else {
        Write-Host "FALTA: $arquivo - código GTM não encontrado!" -ForegroundColor Red
        $erros += "Faltando: $arquivo"
    }
}

Write-Host ""
if ($erros.Count -eq 0) {
    Write-Host "=== TODOS OS ARQUIVOS ESTÃO CORRETOS ===" -ForegroundColor Green
} else {
    Write-Host "=== FORAM ENCONTRADOS $($erros.Count) PROBLEMA(S) ===" -ForegroundColor Red
    $erros | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
}