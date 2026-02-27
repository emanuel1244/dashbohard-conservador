@echo off
echo ========================================
echo   DEPLOY DIRECTO CON AWS CLI
echo   Sin Serverless Framework
echo ========================================
echo.

echo Paso 1: Creando archivo ZIP con el codigo...
powershell -Command "Compress-Archive -Path lambda-upload-excel-multipart.js,lambda-personas.js,lambda-lideres.js,node_modules -DestinationPath lambda-function.zip -Force"

echo.
echo Paso 2: Creando rol IAM para Lambda...
aws iam create-role --role-name PartidoConservadorLambdaRole --assume-role-policy-document "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Effect\":\"Allow\",\"Principal\":{\"Service\":\"lambda.amazonaws.com\"},\"Action\":\"sts:AssumeRole\"}]}" 2>nul

echo.
echo Paso 3: Adjuntando politicas al rol...
aws iam attach-role-policy --role-name PartidoConservadorLambdaRole --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
aws iam attach-role-policy --role-name PartidoConservadorLambdaRole --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess

echo.
echo Esperando 10 segundos para que el rol se propague...
timeout /t 10 /nobreak

echo.
echo Paso 4: Creando tabla DynamoDB para Personas...
aws dynamodb create-table --table-name PartidoConservadorPersonas --attribute-definitions AttributeName=id,AttributeType=S AttributeName=cedula,AttributeType=S --key-schema AttributeName=id,KeyType=HASH --global-secondary-indexes "IndexName=CedulaIndex,KeySchema=[{AttributeName=cedula,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5}" --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 2>nul

echo.
echo Paso 5: Creando tabla DynamoDB para Lideres...
aws dynamodb create-table --table-name PartidoConservadorPersonasLideres --attribute-definitions AttributeName=id,AttributeType=S --key-schema AttributeName=id,KeyType=HASH --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 2>nul

echo.
echo Esperando que las tablas se creen...
timeout /t 15 /nobreak

echo.
echo Paso 6: Obteniendo ARN del rol...
for /f "tokens=*" %%a in ('aws iam get-role --role-name PartidoConservadorLambdaRole --query "Role.Arn" --output text') do set ROLE_ARN=%%a
echo Rol ARN: %ROLE_ARN%

echo.
echo Paso 7: Creando funcion Lambda uploadExcel...
aws lambda create-function --function-name partido-conservador-uploadExcel --runtime nodejs18.x --role %ROLE_ARN% --handler lambda-upload-excel-multipart.handler --zip-file fileb://lambda-function.zip --timeout 30 --memory-size 512 --environment "Variables={TABLE_NAME=PartidoConservadorPersonas}" 2>nul

echo.
echo Paso 8: Creando funcion Lambda getPersonas...
aws lambda create-function --function-name partido-conservador-getPersonas --runtime nodejs18.x --role %ROLE_ARN% --handler lambda-personas.getAll --zip-file fileb://lambda-function.zip --timeout 30 --memory-size 256 --environment "Variables={TABLE_NAME=PartidoConservadorPersonas}" 2>nul

echo.
echo Paso 9: Creando funcion Lambda getEstadisticas...
aws lambda create-function --function-name partido-conservador-getEstadisticas --runtime nodejs18.x --role %ROLE_ARN% --handler lambda-personas.getEstadisticas --zip-file fileb://lambda-function.zip --timeout 30 --memory-size 256 --environment "Variables={TABLE_NAME=PartidoConservadorPersonas}" 2>nul

echo.
echo Paso 10: Creando funcion Lambda getLideres...
aws lambda create-function --function-name partido-conservador-getLideres --runtime nodejs18.x --role %ROLE_ARN% --handler lambda-lideres.getAll --zip-file fileb://lambda-function.zip --timeout 30 --memory-size 256 --environment "Variables={TABLE_NAME=PartidoConservadorPersonas}" 2>nul

echo.
echo Paso 11: Creando funcion Lambda createLider...
aws lambda create-function --function-name partido-conservador-createLider --runtime nodejs18.x --role %ROLE_ARN% --handler lambda-lideres.create --zip-file fileb://lambda-function.zip --timeout 30 --memory-size 256 --environment "Variables={TABLE_NAME=PartidoConservadorPersonas}" 2>nul

echo.
echo Paso 12: Creando funcion Lambda updateLider...
aws lambda create-function --function-name partido-conservador-updateLider --runtime nodejs18.x --role %ROLE_ARN% --handler lambda-lideres.update --zip-file fileb://lambda-function.zip --timeout 30 --memory-size 256 --environment "Variables={TABLE_NAME=PartidoConservadorPersonas}" 2>nul

echo.
echo Paso 13: Creando funcion Lambda deleteLider...
aws lambda create-function --function-name partido-conservador-deleteLider --runtime nodejs18.x --role %ROLE_ARN% --handler lambda-lideres.delete --zip-file fileb://lambda-function.zip --timeout 30 --memory-size 256 --environment "Variables={TABLE_NAME=PartidoConservadorPersonas}" 2>nul

echo.
echo ========================================
echo   FUNCIONES LAMBDA CREADAS
echo ========================================
echo.
echo Ahora necesitas crear API Gateway manualmente:
echo 1. Ve a https://console.aws.amazon.com/apigateway/
echo 2. Crea nueva REST API
echo 3. Crea recursos y metodos
echo 4. Integra con las funciones Lambda creadas
echo.
echo O ejecuta: create-api-gateway.bat
echo.
pause
