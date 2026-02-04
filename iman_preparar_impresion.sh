#!/usr/bin/env bash
# Usamos /bin/bash en lugar de /bin/sh para poder usar arrays

mostrar_uso() {
    echo "Uso: $0 [-o archivo_salida] imagen1 [imagen2 ... imagen6]"
    exit 1
}

ARCHIVO_SALIDA="salida_final_imanes.pdf"
IMAGENES=() # Array para guardar las imágenes

# Procesar opciones
while [ "$1" != "" ]; do
    case $1 in
        -o ) shift; ARCHIVO_SALIDA=$1 ;;
        -* ) mostrar_uso ;;
        * ) IMAGENES+=("$1") ;; # Añadir al array
    esac
    shift
done

if [ ${#IMAGENES[@]} -eq 0 ]; then
    mostrar_uso
fi

if [ ${#IMAGENES[@]} -gt 6 ]; then
    echo "⚠️  ADVERTENCIA: Has pasado ${#IMAGENES[@]} imágenes. Solo caben 6 en un A4. Las sobrantes se ignorarán."
fi

# Configuración
MARGEN_IZQUIERDO=315
MARGEN_SUPERIOR=379
ESPACIO_ENTRE_COLUMNAS=950
ESPACIO_ENTRE_FILAS=950
ANCHO_LIENZO=2480
ALTO_LIENZO=3508
# Definimos el tamaño objetivo para asegurar que encajen
ANCHO_OBJETIVO=850
ALTO_OBJETIVO=850

# Construimos el comando usando un ARRAY para evitar 'eval'
CMD_ARGS=(
    -size "${ANCHO_LIENZO}x${ALTO_LIENZO}" 
    xc:white 
    -density 300 
    -units PixelsPerInch
)

X=$MARGEN_IZQUIERDO
Y=$MARGEN_SUPERIOR
COUNT=0

for ARCHIVO_IMAGEN in "${IMAGENES[@]}"; do
    # Parar si llegamos a 6
    if [ $COUNT -ge 6 ]; then break; fi

    # Añadimos la operación de composición al array de argumentos
    # Agregamos -resize para seguridad: fuerza a que la imagen sea del tamaño esperado
    CMD_ARGS+=( 
        \( "$ARCHIVO_IMAGEN" -resize "${ANCHO_OBJETIVO}x${ALTO_OBJETIVO}" -geometry "+${X}+${Y}" \) 
        -composite 
    )

    # Calcular siguiente posición
    COUNT=$((COUNT + 1))
    if [ $((COUNT % 2)) -eq 0 ]; then
        # Cambio de fila (es par, pasamos a la siguiente fila, columna 0)
        X=$MARGEN_IZQUIERDO
        # FILA aumenta cada 2 imágenes
        FILA=$((COUNT / 2))
        Y=$((MARGEN_SUPERIOR + FILA * ESPACIO_ENTRE_FILAS))
    else
        # Siguiente columna
        X=$((MARGEN_IZQUIERDO + ESPACIO_ENTRE_COLUMNAS))
    fi
done

# Ejecutar magick con el array de argumentos expandido
echo "Generando PDF con $COUNT imágenes..."
magick "${CMD_ARGS[@]}" "$ARCHIVO_SALIDA"

echo "✅ PDF generado correctamente: $ARCHIVO_SALIDA"
