# Deploy Script Automatizado para Venux
# Autor: Antigravity Agent
# Uso: Clique com botao direito -> "Run with PowerShell"

Write-Host "Iniciando Build & Deploy do Venux Finance Hub..." -ForegroundColor Cyan

# 1. Definir Variaveis
$VITE_SUPABASE_URL = "https://hozwrepqajqvwjjmfwzw.supabase.co"
$VITE_SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvendyZXBxYWpxdndqam1md3p3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5MDg2OTYsImV4cCI6MjA4MzQ4NDY5Nn0.gfNur-k5dsZS0hZIC1e-9ZESeePhuyHqI3tRYwNxm5I"
$VITE_STRIPE_PUBLISHABLE_KEY = "pk_live_51SoFt12EzlFM3oZJdC6FPt5cf2rHd4IW0uYZjGuyVPLET7TczwyYeaThoOCQftXgpINeTIyJmhC3sNNPKqae36UN00JYF4QZO9"

$IMAGE_NAME = "ghcr.io/balbiss/remix-of-inoova-finance-hub:latest"

# 2. Build (Comando em uma linha para evitar erros)
Write-Host "Construindo a imagem..." -ForegroundColor Yellow

docker build -t $IMAGE_NAME --build-arg VITE_SUPABASE_URL=$VITE_SUPABASE_URL --build-arg VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY --build-arg VITE_STRIPE_PUBLISHABLE_KEY=$VITE_STRIPE_PUBLISHABLE_KEY .

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO no Build! Verifique se o Docker Desktop esta rodando." -ForegroundColor Red
    Pause
    Exit
}

# 3. Push
Write-Host "Enviando para a nuvem..." -ForegroundColor Yellow
docker push $IMAGE_NAME

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO no Push! Verifique sua internet ou login." -ForegroundColor Red
    Pause
    Exit
}

Write-Host "SUCESSO! A nova versao esta na nuvem." -ForegroundColor Green
Write-Host "Agora va no Portainer -> Stacks -> Update the stack (com Re-pull marcado)." -ForegroundColor Cyan
Pause
