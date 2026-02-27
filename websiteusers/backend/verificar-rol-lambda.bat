@echo off
echo ========================================
echo Verificando Rol de Lambda
echo ========================================

set ROLE_NAME=lambda-dynamodb-role
set ACCOUNT_ID=431655581275

echo.
echo Verificando si el rol existe...
aws iam get-role --role-name %ROLE_NAME% >nul 2>&1

if %errorlevel% equ 0 (
    echo El rol %ROLE_NAME% ya existe.
    echo ARN: arn:aws:iam::%ACCOUNT_ID%:role/%ROLE_NAME%
) else (
    echo El rol no existe. Creando...
    
    echo Creando trust policy...
    echo { > trust-policy.json
    echo   "Version": "2012-10-17", >> trust-policy.json
    echo   "Statement": [ >> trust-policy.json
    echo     { >> trust-policy.json
    echo       "Effect": "Allow", >> trust-policy.json
    echo       "Principal": { >> trust-policy.json
    echo         "Service": "lambda.amazonaws.com" >> trust-policy.json
    echo       }, >> trust-policy.json
    echo       "Action": "sts:AssumeRole" >> trust-policy.json
    echo     } >> trust-policy.json
    echo   ] >> trust-policy.json
    echo } >> trust-policy.json
    
    aws iam create-role ^
        --role-name %ROLE_NAME% ^
        --assume-role-policy-document file://trust-policy.json
    
    echo Adjuntando politicas...
    aws iam attach-role-policy ^
        --role-name %ROLE_NAME% ^
        --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
    
    aws iam attach-role-policy ^
        --role-name %ROLE_NAME% ^
        --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess
    
    echo Esperando 10 segundos para que el rol se propague...
    timeout /t 10 /nobreak
    
    del trust-policy.json
    
    echo Rol creado exitosamente!
)

echo.
pause
