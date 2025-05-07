# Historial Cronológico de Inversiones

## Objetivo
Crear una vista completa y detallada del historial cronológico de todas las inversiones realizadas por el usuario, independientemente de la categoría. Esto permitirá visualizar la evolución temporal de la cartera de inversiones, identificar patrones de compra y analizar el rendimiento a lo largo del tiempo.

## Características Principales

### 1. Vista Cronológica Global
- Mostrar todas las transacciones ordenadas cronológicamente (de más reciente a más antigua)
- Filtros por categoría, rango de fechas y monto invertido
- Vista en formato de tabla y gráfico de línea temporal

### 2. Información por Transacción
Para cada entrada del historial, mostrar:
- Fecha y hora de la transacción
- Nombre de la inversión
- Categoría (con su emoji correspondiente)
- Monto invertido en EUR
- Para criptomonedas: 
  - Cantidad de tokens adquiridos
  - Precio por token en el momento de la compra
  - Símbolo de la criptomoneda
- ROI actual (desde la fecha de compra hasta hoy)
- Variación porcentual desde la compra

### 3. Agrupaciones y Análisis
- Agrupación por mes/trimestre/año para análisis de tendencias
- Distribución por categorías en cada período
- Total invertido en cada período
- Rendimiento acumulado por período

### 4. Interfaz y Experiencia de Usuario
- Diseño limpio y responsivo
- Posibilidad de expandir cada entrada para ver más detalles
- Opción de exportar los datos a CSV para análisis externo
- Tooltips informativos sobre cada campo
- Colores intuitivos para indicar rendimiento (verde/rojo)

## Implementación Técnica

### Modelo de Datos
Cada entrada del historial debe contener:
```javascript
{
  id: string,              // ID único de la transacción
  date: string,            // Fecha ISO
  investmentId: string,    // ID de la inversión asociada
  investmentName: string,  // Nombre de la inversión
  category: string,        // Categoría
  amount: number,          // Monto invertido en EUR
  tokens: number,          // (Para cripto) Cantidad de tokens
  pricePerToken: number,   // (Para cripto) Precio por token al comprar
  symbol: string,          // (Para cripto) Símbolo
  currentValue: number,    // Valor actual de esta inversión específica
  currentReturn: number,   // Retorno actual en EUR
  currentReturnPercentage: number // Retorno actual en %
}
```

### Reutilización de Componentes
- Utilizar el componente de gráficos existente para mostrar la evolución del valor
- Adaptar los componentes de filtrado y ordenación existentes

### Retos Técnicos
1. Cálculo del valor actual de cada compra individual (especialmente para criptomonedas)
2. Manejo eficiente del historial para carteras con muchas transacciones
3. Presentación clara de los datos en dispositivos móviles
4. Actualización en tiempo real de los valores actuales

## Diseño Visual

### Tabla Principal
- Cabecera: Fecha | Inversión | Categoría | Monto | Tokens (si aplica) | Precio Token (si aplica) | ROI
- Cada fila con opción de expandir para mostrar más detalles
- Filtros en la parte superior
- Totales en la parte inferior

### Gráfico Temporal
- Línea de tiempo con puntos que representan cada inversión
- Tamaño del punto proporcional al monto invertido
- Color según categoría
- Hover/click para ver detalles de cada punto

### Panel de Análisis
- Tarjetas con resumen por períodos
- Gráficos de distribución por categoría
- Tendencia de inversión a lo largo del tiempo

## Flujo de Usuario

1. Usuario accede a la sección "Historial Cronológico"
2. Visualiza todas las transacciones ordenadas por fecha (más recientes primero)
3. Puede filtrar por categoría, rango de fechas o monto
4. Puede expandir cada transacción para ver detalles completos
5. Puede alternar entre vista de tabla y vista de línea temporal
6. Puede exportar los datos para análisis externo

## Métricas de Rendimiento
- Tiempo de carga inicial < 1.5 segundos
- Tiempo de respuesta al filtrar < 0.5 segundos
- Soporte para al menos 1000 transacciones sin degradación del rendimiento 