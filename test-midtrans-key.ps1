# Test langsung Server Key ke Midtrans, di luar aplikasi Next.js kita.
# Jalankan di PowerShell: .\test-midtrans-key.ps1

$serverKey = Read-Host "Tempel Server Key sandbox kamu (contoh: SB-Mid-server-xxxx)"

$bytes = [System.Text.Encoding]::UTF8.GetBytes("$serverKey" + ":")
$base64Auth = [Convert]::ToBase64String($bytes)

$headers = @{
    "Authorization" = "Basic $base64Auth"
    "Content-Type"  = "application/json"
    "Accept"        = "application/json"
}

$body = @{
    transaction_details = @{
        order_id     = "test-manual-$(Get-Random)"
        gross_amount = 10000
    }
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "https://app.sandbox.midtrans.com/snap/v1/transactions" `
        -Method Post -Headers $headers -Body $body

    Write-Host ""
    Write-Host "BERHASIL! Server Key kamu valid." -ForegroundColor Green
    Write-Host "Token: $($response.token)"
    Write-Host "Redirect URL: $($response.redirect_url)"
} catch {
    Write-Host ""
    Write-Host "GAGAL. Detail error dari Midtrans:" -ForegroundColor Red

    if ($_.Exception.Response) {
        try {
            $stream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            $errorBody = $reader.ReadToEnd()
            Write-Host $errorBody
        } catch {
            Write-Host "(Tidak bisa baca body response, tampilkan exception mentah:)"
            Write-Host $_.Exception.Message
        }
    } else {
        Write-Host $_.Exception.Message
    }
}