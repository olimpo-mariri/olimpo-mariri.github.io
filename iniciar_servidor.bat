@echo off
echo =========================================
echo  Iniciando Servidor Local para olIMpo
echo =========================================
echo.

:: Intenta abrir el navegador asumiendo que el puerto 8000 se va a usar
start http://localhost:8000

:: Inicia el servidor usando Python (por lo general viene preinstalado o es el más habitual)
python -m http.server 8000

:: Si falla, mostrar un mensaje
if %errorlevel% neq 0 (
    echo.
    echo ERROR: No se pudo iniciar con Python. Intentando con Node.js (npx)...
    echo.
    npx http-server -p 8000
    
    if %errorlevel% neq 0 (
        echo.
        echo ERROR: Tampoco se pudo iniciar con Node.js. 
        echo Necesitas tener instalado Python o Node.js para arrancar el servidor local.
        pause
    )
)
