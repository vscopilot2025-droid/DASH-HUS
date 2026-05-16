# 🏥 DASH-HUS - Dashboard de Indicadores de Calidad

**Hospital Universitario de La Samaritana (HUS)**  
Sistema dinámico de indicadores con arquitectura hexagonal

---

## 📋 Tabla de Contenidos

1. [Descripción](#descripción)
2. [Características](#características)
3. [Instalación y Ejecución](#instalación-y-ejecución)
4. [Estructura del Proyecto](#estructura-del-proyecto)
5. [Arquitectura](#arquitectura)
6. [Configuración](#configuración)
7. [API y Scripts](#api-y-scripts)
8. [Cambios Recientes](#cambios-recientes)
9. [Guía de Desarrollo](#guía-de-desarrollo)
10. [Próximos Pasos](#próximos-pasos)

---

## 📝 Descripción

Dashboard institucional para monitorear indicadores de calidad en la institución hospitalaria. Implementa una capa de presentación web con HTML5, CSS3 y JavaScript, utilizando Chart.js para gráficos y carga de Excel para datos dinámicos.

**Stack Tecnológico:**
- **Backend:** Node.js + Express.js (opcional)
- **Frontend:** JavaScript puro (ES6) + Chart.js
- **Base de Datos:** MariaDB/MySQL (solo para indicadores, no para usuarios)
- **Autenticación:** Hardcoded (admin/admin) - sin tabla de usuarios
- **Arquitectura:** Hexagonal (Puertos y Adaptadores)

---

## ✨ Características

- ✅ Dashboard institucional con paleta azul y verde
- ✅ Carga dinámica de archivos Excel (.xlsx y .xls)
- ✅ Detección flexible de columnas comunes para indicadores
- ✅ Visualización de:
  - KPIs (tarjetas de indicadores)
  - Áreas (segmentación)
  - Tabla completa de indicadores
  - Detalle individual de indicadores
  - Gráficos de tendencia histórica
- ✅ Autenticación de usuarios
- ✅ Cálculo automático de estados (semáforo)
- ✅ Arquitectura hexagonal para escalabilidad
- ✅ Separación clara de responsabilidades

---

## 🚀 Instalación y Ejecución

### Requisitos Previos

- **Node.js** v14+
- **npm** v6+
- **MariaDB/MySQL** (v5.7+)
- **Git**

### Pasos de Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/vscopilot2025-droid/DASH-HUS.git
cd DASH-HUS

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno (opcional - solo para conexión BD)
cp .env.example .env

# 4. Iniciar el servidor
npm start

# 5. Abrir en navegador
# http://localhost:3000
```

### Credenciales por Defecto

- **Usuario:** `admin`
- **Contraseña:** `admin`

⚠️ **Sin tabla de usuarios en BD** - Credenciales hardcodeadas en el código

### Scripts npm Disponibles

```bash
npm start                      # Iniciar servidor (producción)
npm run dev                    # Iniciar en modo desarrollo
npm run generate:indicators    # Generar datos de prueba
npm run analyze:excel          # Analizar archivos Excel
```

---

## 📁 Estructura del Proyecto

```
DASH-HUS/
│
├── 📂 src/                          # Código fuente (arquitectura hexagonal)
│   ├── 📂 core/                     # Lógica de negocio
│   │   ├── 📂 domain/               # Entidades y servicios
│   │   │   ├── entities/            # Modelos de datos
│   │   │   └── services/            # Servicios de negocio
│   │   └── 📂 application/          # Casos de uso
│   │       ├── usecases/
│   │       └── ports/               # Interfaces
│   │
│   ├── 📂 infrastructure/           # Adaptadores
│   │   ├── database/                # Configuración BD
│   │   ├── repositories/            # Implementación repos
│   │   ├── parsers/                 # Parsers (Excel, etc.)
│   │   └── ui/                      # Componentes UI
│   │
│   ├── 📂 presentation/             # Capa de presentación
│   │   ├── controllers/             # Controladores (futuro)
│   │   ├── middleware/              # Middleware
│   │   ├── routes/                  # Rutas (futuro)
│   │   └── views/                   # Vistas (futuro)
│   │
│   ├── 📂 shared/                   # Código compartido
│   │   ├── data/                    # Datos compartidos
│   │   ├── utils/                   # Utilidades
│   │   └── constants/               # Constantes
│   │
│   ├── app.js                       # App principal (frontend)
│   └── main.js                      # Entry point alternativo
│
├── 📂 public/                       # Archivos estáticos
│   ├── index.html                   # HTML principal
│   ├── 📂 styles/                   # Hojas de estilo
│   │   ├── dashboard.css
│   │   ├── main.css
│   │   └── ...
│   └── 📂 assets/                   # Logos, imágenes
│       └── hus-logo.png
│
├── 📂 database/                     # Migraciones (si es necesario)
│
├── 📂 scripts/                      # Scripts de utilidad
│   ├── 📂 data/                     # Procesamiento de datos
│   └── 📂 setup/                    # Configuración (no se usa)
│
├── 📂 config/                       # Configuración centralizada
│
├── server.js                        # Entry point backend
├── package.json                     # Dependencias
├── .env.example                     # Variables de entorno
├── README.md                        # Este archivo
└── .gitignore
```

---

## 🏗️ Arquitectura

### Arquitectura Hexagonal (Puertos y Adaptadores)

La arquitectura hexagonal permite separar la lógica de negocio de los detalles de implementación:

```
┌─────────────────────────────────────────┐
│        CAPA DE PRESENTACIÓN             │
│  (Controllers, Middleware, Routes)      │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      CAPA DE APLICACIÓN (CASOS DE USO)  │
│  (UseCases, Puertos/Interfaces)         │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│       CAPA DE DOMINIO (CORE)            │
│  (Entidades, Servicios, Lógica)         │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│    CAPA DE INFRAESTRUCTURA (ADAPTERS)   │
│ (BD, Parsers, Repositorios, UI)         │
└─────────────────────────────────────────┘
```

### Ventajas

✅ **Separación de responsabilidades clara**  
✅ **Facilita pruebas unitarias**  
✅ **Cambios de infraestructura sin afectar negocio**  
✅ **Independencia de frameworks**  
✅ **Escalabilidad y mantenibilidad**  

### Capas Explicadas

#### 1. **Domain (core/domain/)**
Contiene la lógica de negocio pura:
- Entidades (Indicator, KPI, etc.)
- Servicios de dominio
- Reglas de negocio

#### 2. **Application (core/application/)**
Orquesta los casos de uso:
- `GetDashboardSnapshotUseCase` - Obtener datos del dashboard
- `GetIndicatorDetailUseCase` - Detalles de indicador
- `ImportExcelUseCase` - Importar datos
- Puertos (interfaces) para inyección de dependencias

#### 3. **Infrastructure (infrastructure/)**
Implementaciones técnicas:
- `InMemoryIndicatorRepository` - Almacenamiento en memoria
- `ExcelWorkbookParser` - Parseo de Excel
- `DashboardView`, `ChartJsLineChart` - Componentes UI
- Configuración de base de datos

#### 4. **Presentation (presentation/)**
Interfaz con el usuario:
- Controllers (Express) - Futuro
- Middleware - Autenticación (hardcoded admin/admin)
- Routes - Rutas API
- Views - Vistas HTML

---

## ⚙️ Configuración

### Variables de Entorno (.env)

```env
# Base de Datos (solo para indicadores, no para usuarios)
DB_HOST=127.0.0.1
DB_PORT=3304
DB_USER=root
DB_PASSWORD=123456
DB_NAME=hospital_kpi

# Servidor
PORT=3000
NODE_ENV=development

# Logging
LOG_LEVEL=info
```

### Archivo .env.example

Renombra `.env.example` a `.env` y ajusta según tu entorno.

---

## 📊 API y Scripts

### Endpoints Express

```javascript
POST /api/auth/login
GET  /api/indicators
GET  /api/indicators/:id
POST /api/indicators/import
```

### Scripts Disponibles

#### Procesamiento de Datos

```bash
# Generar indicadores de prueba
npm run generate:indicators

# Analizar archivo Excel
npm run analyze:excel

# Extraer indicadores de Excel
node scripts/data/extract-all-indicators.js

# Analizar hojas de Excel
node scripts/data/analyze-all-sheets.js
```

#### Configuración

```bash
# Crear tabla de usuarios
npm run generate:indicators

# Abrir página de prueba del Dashboard
# Navega a: http://localhost:3000/public/index.html o abre public/index.html en navegador
```

---

## 🔄 Cambios Recientes (16 de Mayo de 2026)

### ✨ Optimización de Autenticación

Se simplificó la autenticación eliminando la tabla de usuarios en BD y usando credenciales hardcodeadas (admin/admin).

#### Cambios Realizados

| Cambio | Antes | Después |
|--------|-------|---------|
| Tabla de Usuarios | MariaDB | ❌ Eliminada |
| Autenticación | bcryptjs + JWT | admin/admin hardcodeado |
| Archivo Setup | scripts/setup/setup-users-table.js | ❌ No se usa |
| Credenciales | Desde BD | Desde código |
| `assets/` | `public/assets/` | Estáticos |
| `sql/` | `database/sql/` | BD |
| Scripts sueltos | `scripts/` | Organización |

#### Nuevas Carpetas

- `src/presentation/` - Capa de presentación
- `src/shared/` - Código compartido
- `src/shared/data/` - Datos compartidos
- `public/` - Archivos estáticos
- `database/sql/` - Scripts de BD
- `scripts/data/` - Scripts de datos
- `scripts/setup/` - Scripts de setup
- `config/` - Configuración centralizada

#### Importaciones Actualizadas

```javascript
// ✅ Nuevo
import { INDICATORS_DATABASE } from './shared/data/indicatorsDatabase.js';
import { initAuthentication } from './presentation/middleware/auth.js';
```

#### Limpieza de Duplicados

- ❌ Eliminadas carpetas: `styles/`, `sql/`, `assets/` (ahora en `public/`)
- ❌ Eliminado: `index-new.html` (ahora es `public/index.html`)
- ❌ Eliminados scripts sueltos (ahora en `scripts/`)

---

## 👨‍💻 Guía de Desarrollo

### Patrones de Código

#### Importaciones Correctas

```javascript
// ✅ CORRECTO
import { MyUseCase } from './core/application/usecases/MyUseCase.js';
import { MyRepository } from '../infrastructure/repositories/MyRepository.js';
import { myUtility } from '../../shared/utils/index.js';

// ❌ EVITAR
import { MyClass } from '../../../../../../../core/...'
```

#### Estructura de Módulos

```javascript
/**
 * Descripción breve del módulo
 * @author Nombre del autor
 */

// Importaciones
import { ... } from '...';

// Código
export const myFunction = () => { ... };
export class MyClass { ... }
```

### Agregar Nuevas Funcionalidades

1. **Definir la entidad** en `src/core/domain/entities/`
2. **Crear el servicio** en `src/core/domain/services/`
3. **Implementar el caso de uso** en `src/core/application/usecases/`
4. **Crear el adaptador** en `src/infrastructure/`
5. **Agregar la ruta** en `src/presentation/routes/` (cuando esté lista)

### Columnas Recomendadas en Excel

El parser detecta automáticamente encabezados. Columnas sugeridas:

| Columna | Descripción |
|---------|-------------|
| `codigo` | ID del indicador |
| `indicador` | Nombre del indicador |
| `area` | Área responsable |
| `objetivo` | Objetivo/meta |
| `unidad` | Unidad de medida |
| `valor` | Valor actual |
| `meta` | Meta esperada |
| `semaforo` | Estado (rojo, amarillo, verde) |
| `direccion` | min/max (menor es mejor o mayor es mejor) |
| `fecha` | Fecha de actualización |

---

## 📚 Dependencias Principales

```json
{
  "dependencies": {
    "express": "^4.21.2",           // Framework web
    "mariadb": "^3.5.2",            // Driver BD
    "mysql2": "^3.22.3",            // Driver BD (alternativo)
    "xlsx": "^0.18.5"               // Lectura Excel
  }
}
```

**Frontend:** Chart.js (CDN)

**Nota:** bcryptjs fue removido - autenticación ahora es hardcodeada (admin/admin)

---

## 🔮 Próximos Pasos

### Corto Plazo
- [ ] Implementar controladores Express completos
- [ ] Crear rutas API documentadas
- [ ] Agregar validación de datos
- [ ] Mejorar manejo de errores

### Mediano Plazo
- [ ] Pruebas unitarias e integración
- [ ] Documentación OpenAPI/Swagger
- [ ] Logging centralizado
- [ ] Variables de entorno por ambiente

### Largo Plazo
- [ ] Base de datos persistente para indicadores
- [ ] Histórico de cambios
- [ ] Sistema de alertas
- [ ] Reportes PDF
- [ ] API REST completa
- [ ] Dashboard multiusuario (tabla de usuarios en BD)

---

## 🐛 Solución de Problemas

### "Cannot find module"
Verifica que las rutas de importación sean correctas y relativas desde el archivo actual.

### Errores de BD
- Verifica que MariaDB está corriendo (solo para indicadores)
- Revisa credenciales en `.env`

### El Dashboard no muestra datos
- Abre la consola del navegador (F12)
- Verifica que `indicatorsDatabase.js` se cargó correctamente
- Limpia caché: Ctrl+Shift+Delete (Chrome)

### Puerto 3000 en uso
```bash
# Cambiar puerto en .env
PORT=3001
```

### Excel no se carga
- Verifica formato XLSX o XLS
- Revisa nombres de columnas
- Ver consola para detalles de error

---

## 📖 Referencias

- [Arquitectura Hexagonal](https://alistair.cockburn.us/hexagonal-architecture/)
- [Clean Code Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Express.js Documentation](https://expressjs.com/)
- [Chart.js Documentation](https://www.chartjs.org/)

---

## 📄 Licencia

Este proyecto es propiedad de Hospital Universitario de La Samaritana (HUS).

---

## 👥 Contribuciones

Para contribuir:
1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

**Última actualización:** 16 de mayo de 2026  
**Versión:** 1.0.0  
**Estado:** En desarrollo activo ✨
