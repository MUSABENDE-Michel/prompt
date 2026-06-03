# StockHub SMS - Test Script
# Run this after starting both backend and frontend servers

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  StockHub SMS - Sanity Test Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:5000/api"
$passed = 0
$failed = 0
$results = @()

function Test-Step {
    param($name, $script)
    try {
        $result = Invoke-WebRequest @script -UseBasicParsing -TimeoutSec 10
        $content = $result.Content | ConvertFrom-Json
        if ($content.success -or $result.StatusCode -eq 200) {
            Write-Host "  [PASS] $name" -ForegroundColor Green
            return $true
        } else {
            Write-Host "  [FAIL] $name - $($content.message)" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "  [FAIL] $name - $_" -ForegroundColor Red
        return $false
    }
}

Write-Host "1. Health Check" -ForegroundColor Yellow
$test1 = Test-Step -name "API Health" -script @{ Uri = "$baseUrl/health"; Method = "GET" }
if ($test1) { $passed++ } else { $failed++ }
$results += @{ Name = "Health Check"; Passed = $test1 }

Write-Host ""
Write-Host "2. Authentication Tests" -ForegroundColor Yellow
$loginBody = @{ username = "admin"; password = "Admin@123" } | ConvertTo-Json
$loginResult = $null
try {
    $loginResp = Invoke-WebRequest -Uri "$baseUrl/auth/login" -Method POST -Body $loginBody -ContentType "application/json" -SessionVariable session -UseBasicParsing -TimeoutSec 10
    $loginContent = $loginResp.Content | ConvertFrom-Json
    if ($loginContent.success) {
        Write-Host "  [PASS] Login with seeded admin" -ForegroundColor Green
        $passed++
        $results += @{ Name = "Login"; Passed = $true }
        $global:session = $session
    } else {
        throw $loginContent.message
    }
} catch {
    Write-Host "  [FAIL] Login with seeded admin - $_" -ForegroundColor Red
    $failed++
    $results += @{ Name = "Login"; Passed = $false }
}

# Test session check
$test3 = Test-Step -name "Check Session" -script @{ Uri = "$baseUrl/auth/session"; Method = "GET"; WebSession = $global:session }
if ($test3) { $passed++ } else { $failed++ }
$results += @{ Name = "Session Check"; Passed = $test3 }

Write-Host ""
Write-Host "3. CRUD Tests" -ForegroundColor Yellow

# Create Product
$productBody = @{
    productCode = "TST-$(Get-Random -Maximum 9999)"
    productName = "Test Product"
    category = "Testing"
    quantityInStock = 100
    unitPrice = 25.50
    supplierName = "Test Supplier"
    dateReceived = (Get-Date -Format "yyyy-MM-dd")
} | ConvertTo-Json
$test4 = $false
try {
    $pResp = Invoke-WebRequest -Uri "$baseUrl/products" -Method POST -Body $productBody -ContentType "application/json" -WebSession $global:session -UseBasicParsing -TimeoutSec 10
    $pContent = $pResp.Content | ConvertFrom-Json
    if ($pContent.success) {
        Write-Host "  [PASS] Create Product" -ForegroundColor Green
        $test4 = $true
        $global:testProductId = $pContent.data._id
    } else { throw $pContent.message }
} catch { Write-Host "  [FAIL] Create Product - $_" -ForegroundColor Red }
if ($test4) { $passed++ } else { $failed++ }
$results += @{ Name = "Create Product"; Passed = $test4 }

# Get Products
$test5 = Test-Step -name "List Products" -script @{ Uri = "$baseUrl/products"; Method = "GET"; WebSession = $global:session }
if ($test5) { $passed++ } else { $failed++ }
$results += @{ Name = "List Products"; Passed = $test5 }

# Create Warehouse
$warehouseBody = @{
    warehouseCode = "WH-TST-$(Get-Random -Maximum 999)"
    warehouseName = "Test Warehouse"
    warehouseLocation = "Test Location"
} | ConvertTo-Json
$test6 = $false
try {
    $wResp = Invoke-WebRequest -Uri "$baseUrl/warehouses" -Method POST -Body $warehouseBody -ContentType "application/json" -WebSession $global:session -UseBasicParsing -TimeoutSec 10
    $wContent = $wResp.Content | ConvertFrom-Json
    if ($wContent.success) {
        Write-Host "  [PASS] Create Warehouse" -ForegroundColor Green
        $test6 = $true
        $global:testWarehouseId = $wContent.data._id
    } else { throw $wContent.message }
} catch { Write-Host "  [FAIL] Create Warehouse - $_" -ForegroundColor Red }
if ($test6) { $passed++ } else { $failed++ }
$results += @{ Name = "Create Warehouse"; Passed = $test6 }

# Create Transaction (Stock In)
if ($global:testProductId -and $global:testWarehouseId) {
    $txnBody = @{
        transactionDate = (Get-Date -Format "yyyy-MM-dd")
        quantityMoved = 10
        transactionType = "STOCK_IN"
        product = $global:testProductId
        warehouse = $global:testWarehouseId
    } | ConvertTo-Json
    $test7 = $false
    try {
        $tResp = Invoke-WebRequest -Uri "$baseUrl/transactions" -Method POST -Body $txnBody -ContentType "application/json" -WebSession $global:session -UseBasicParsing -TimeoutSec 10
        $tContent = $tResp.Content | ConvertFrom-Json
        if ($tContent.success) {
            Write-Host "  [PASS] Create Stock In Transaction" -ForegroundColor Green
            $test7 = $true
        } else { throw $tContent.message }
    } catch { Write-Host "  [FAIL] Create Transaction - $_" -ForegroundColor Red }
    if ($test7) { $passed++ } else { $failed++ }
    $results += @{ Name = "Create Transaction"; Passed = $test7 }
}

Write-Host ""
Write-Host "4. Reports Tests" -ForegroundColor Yellow

$test8 = Test-Step -name "Dashboard Report" -script @{ Uri = "$baseUrl/reports/dashboard"; Method = "GET"; WebSession = $global:session }
if ($test8) { $passed++ } else { $failed++ }
$results += @{ Name = "Dashboard Report"; Passed = $test8 }

$test9 = Test-Step -name "Stock Report" -script @{ Uri = "$baseUrl/reports/stock"; Method = "GET"; WebSession = $global:session }
if ($test9) { $passed++ } else { $failed++ }
$results += @{ Name = "Stock Report"; Passed = $test9 }

$test10 = Test-Step -name "Daily Report" -script @{ Uri = "$baseUrl/reports/daily"; Method = "GET"; WebSession = $global:session }
if ($test10) { $passed++ } else { $failed++ }
$results += @{ Name = "Daily Report"; Passed = $test10 }

Write-Host ""
Write-Host "5. Logout Test" -ForegroundColor Yellow
$test11 = Test-Step -name "Logout" -script @{ Uri = "$baseUrl/auth/logout"; Method = "POST"; WebSession = $global:session }
if ($test11) { $passed++ } else { $failed++ }
$results += @{ Name = "Logout"; Passed = $test11 }

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

foreach ($r in $results) {
    $status = if ($r.Passed) { "PASS" } else { "FAIL" }
    $color = if ($r.Passed) { "Green" } else { "Red" }
    Write-Host "  [$status] $($r.Name)" -ForegroundColor $color
}

Write-Host ""
Write-Host "Total: $($results.Count) tests" -ForegroundColor White
Write-Host "Passed: $passed" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor Red
Write-Host ""

if ($failed -eq 0) {
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  ALL TESTS PASSED! SYSTEM IS WORKING!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
} else {
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host "  $failed TEST(S) FAILED - CHECK ABOVE" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Yellow
}
