#!/bin/bash
echo "🦍 Abriendo Chrome para Agentes Jungla..."
echo "⚠️  Nota: Si Chrome ya está abierto, ciérralo completamente (Cmd+Q) antes de usar esto."
echo "----------------------------------------"

/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 &

echo "✅ Chrome lanzado en puerto 9222."
echo "Ahora puedes ejecutar AnalyticCustomer.command"
# No esperar input para que la terminal se pueda cerrar sola si se configura así, 
# pero aquí ponemos sleep para que dé tiempo a leer
sleep 5
exit
