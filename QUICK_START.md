# 🚀 INICIO RÁPIDO - DASH-HUS

## ✨ Sin Servidor - Solo Descargar y Abrir

Este dashboard funciona **sin necesidad de ejecutar `npm start`** ni de tener un servidor corriendo.

### 🎯 Cómo Usar

1. **Descargar el proyecto**
   ```bash
   git clone https://github.com/vscopilot2025-droid/DASH-HUS.git
   cd DASH-HUS
   ```

2. **Abrir en navegador**
   - Ir a la carpeta `public/`
   - Hacer doble clic en `index.html`
   - ¡Abrirá automáticamente en tu navegador! 🎉

### 🔐 Credenciales por Defecto

| Campo | Valor |
|-------|-------|
| **Usuario** | `admin` |
| **Contraseña** | `admin` |

Alternativas:
- Usuario: `usuario`, Contraseña: `usuario123`

### 📊 Funcionalidades Disponibles

✅ **Dashboard interactivo** con gráficos en tiempo real  
✅ **KPI cards** mostrando estado de indicadores  
✅ **Tabla de indicadores** con filtros  
✅ **Detalle de indicadores** con histórico  
✅ **Carga de archivos Excel** (.xlsx y .xls)  
✅ **Datos de ejemplo** incluidos (5 indicadores + gráficos)  
✅ **Responsivo** - Funciona en desktop, tablet y móvil  

### 🔄 Cambiar Datos

Los datos de ejemplo están en `public/app-standalone.js` en la variable `SAMPLE_INDICATORS`. Puedes:

1. Modificar datos manualmente en el archivo
2. Cargar Excel desde la interfaz (botón "📊 Cargar Excel")
3. Los datos se guardan en memoria durante la sesión

### 🗂️ Estructura

```
DASH-HUS/
└── public/
    ├── index.html              # Abre esto en navegador
    ├── app-standalone.js       # Lógica (sin dependencias)
    ├── styles/
    │   └── dashboard.css       # Estilos
    └── assets/
        └── hus-logo.png        # Logo
```

### 💡 Notas

- **Sin servidor requerido** - Todo funciona en el navegador
- **Offline-friendly** - Funciona sin internet (después de cargar la página)
- **localStorage** - Guarda sesión del usuario
- **Datos en memoria** - Se limpian al cerrar navegador
- **Chart.js CDN** - Requiere internet para gráficos

### 🎨 Personalización

Puedes personalizar:
- **Logo**: Reemplaza `public/assets/hus-logo.png`
- **Colores**: Edita variables CSS en `public/styles/dashboard.css`
- **Datos**: Modifica `SAMPLE_INDICATORS` en `public/app-standalone.js`
- **Título**: Cambia en `public/index.html` - `<title>` tag

### ❓ Problemas Comunes

**P: No puedo abrir el archivo HTML**
R: Usa navegadores modernos (Chrome, Firefox, Safari, Edge). IE11 no es soportado.

**P: Los gráficos no se ven**
R: Necesitas conexión a internet para cargar Chart.js desde CDN.

**P: ¿Puedo guardar datos permanentemente?**
R: Sí, usando localStorage o IndexedDB. Modifica `app-standalone.js`.

**P: ¿Cómo cargo datos reales?**
R: Usa el botón "📊 Cargar Excel" en la interfaz o modifica `SAMPLE_INDICATORS`.

### 📚 Documentación Completa

Ver `README.md` para:
- Arquitectura técnica
- Desarrollo avanzado
- Integración con backend
- Contribuciones

---

**¡Listo para usar! Solo abre `public/index.html` en tu navegador 🎉**
