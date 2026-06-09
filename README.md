# API — Sistema de Gestión de RRHH (empresa COL)

Backend REST construido con **Node.js + Express 5** y **MySQL**, que expone todos los servicios del sistema de gestión de recursos humanos. Desplegado en producción en **Railway**.

**URL de producción:** https://laudable-light-production-ef9f.up.railway.app

---

## Descripción del proyecto

Este servidor provee la API que consume el frontend de gestión de RRHH. Cubre:

- Autenticación con JWT y control de acceso por roles (ADMIN, RRHH, EMPLEADO)
- Gestión completa de empleados con historial automático de cambios de cargo
- Secciones por empleado: estudios académicos y experiencia laboral con reordenamiento drag & drop persistido
- Gestión de vacaciones con ciclo de vida completo (pendiente → aprobada/rechazada)
- Dashboard con métricas agregadas filtradas por sede
- Importación masiva de empleados desde Excel con validación todo-o-nada
- Configuración de la empresa: datos generales, días laborales y CRUD de sedes
- Catálogos: cargos, empresas externas, universidades, tipos de contrato, estados, niveles educativos
- Gestión de usuarios del sistema
- Log de auditoría completo (CREATE / UPDATE / DELETE) con snapshots antes/después

---

## Tecnologías utilizadas

| Tecnología | Versión | Uso |
|---|---|---|
| Node.js | 18+ | Entorno de ejecución |
| Express | 5.x | Framework HTTP |
| MySQL2 | 3.x | Cliente de base de datos (callbacks envueltos en Promises, sin ORM) |
| bcryptjs | 3.x | Hash de contraseñas (salt 10) |
| jsonwebtoken | 9.x | Generación y verificación de JWT |
| dotenv | 17.x | Variables de entorno |
| cors | 2.x | CORS habilitado para el cliente React |
| exceljs | — | Generación de plantillas Excel con dropdowns reales |
| nodemon | 3.x | Recarga automática en desarrollo |

---

## Requisitos previos

- Node.js 18 o superior
- MySQL 8.x corriendo en el puerto **3307** (configurable en `.env`)
- Base de datos `db_gestionEmpleadosTienda` creada con todas sus tablas y migraciones

---

## Instalación

```bash
cd server
npm install
```

### Variables de entorno (`.env`)

```env
DB_HOST=localhost
DB_PORT=3307
DB_USER=root
DB_PASSWORD=admin
DB_NAME=db_gestionEmpleadosTienda

JWT_SECRET=tu_clave_secreta_muy_larga
AUTH_ENABLED=false
```

> **`AUTH_ENABLED=false`** (por defecto en desarrollo): asigna usuario ADMIN virtual con permisos totales — no exige JWT.  
> **`AUTH_ENABLED=true`**: exige JWT Bearer válido en cada petición protegida (usar en producción).

---

## Ejecución

```bash
npm run dev    # Desarrollo (nodemon — recarga automática)
npm start      # Producción
```

El servidor queda disponible en **`http://localhost:3001`**.

---

## Migraciones de base de datos

Ejecutar en orden los archivos de `server/migrations/` cuando la BD ya existe desde una versión anterior:

```sql
-- Orden drag-and-drop en historial y experiencia
ALTER TABLE tb_historial_cargos     ADD COLUMN orden INT DEFAULT 0;
ALTER TABLE tb_experiencia_laboral  ADD COLUMN orden INT DEFAULT 0;

-- Último acceso del usuario
ALTER TABLE tb_usuarios ADD COLUMN ultimo_acceso DATETIME DEFAULT NULL;

-- Sede del empleado
ALTER TABLE tb_empleados ADD COLUMN sede_id INT DEFAULT NULL;
ALTER TABLE tb_empleados ADD CONSTRAINT fk_empleados_sede
  FOREIGN KEY (sede_id) REFERENCES tb_sedes(id);
```

Los archivos `.sql` en `server/migrations/` contienen las migraciones completas para:
- `add_configuracion_laboral.sql` — tabla de días laborales (fila única)
- `add_empresa_config_sedes.sql` — tabla de configuración de empresa y sedes
- `add_vacaciones.sql` — tabla de vacaciones y permisos de roles
- `add_estados_empleado.sql` — estados completos del empleado (Activo, Inactivo, Licencia, Vacaciones, Suspendido, Reingreso)

---

## Arquitectura general

```
server/
├── app.js                      ← Configura Express, CORS, middlewares y monta rutas
├── server.js                   ← Solo llama app.listen(3001)
├── db.js                       ← Pool MySQL2 con keep-alive
├── .env                        ← Variables de entorno (no subir a git)
│
├── routes/                     ← Define los endpoints y conecta con controllers
│   ├── auth.routes.js
│   ├── empleados.routes.js     ← Incluye GET /plantilla y POST /importar
│   ├── historial-cargos.routes.js
│   ├── estudios.routes.js
│   ├── experiencia-laboral.routes.js
│   ├── cargos.routes.js
│   ├── empresas.routes.js
│   ├── universidades.routes.js
│   ├── usuarios.routes.js
│   ├── auditoria.routes.js
│   ├── catalogos.routes.js
│   ├── vacaciones.routes.js
│   ├── configuracion.routes.js ← GET/PUT /laboral, GET/PUT /empresa
│   ├── sedes.routes.js         ← CRUD de sedes
│   └── dashboard.routes.js
│
├── controllers/                ← Recibe request, valida permisos, llama al servicio
├── services/                   ← Lógica de negocio + SQL (mysql2 callbacks → Promises)
├── validations/                ← Validaciones síncronas de campos requeridos
├── middleware/
│   ├── authMiddleware.js       ← Verifica JWT / asigna usuario virtual
│   └── checkPermiso.js         ← Middleware factory para validar permisos RBAC
└── migrations/                 ← Archivos .sql para ejecutar manualmente en Railway
```

**Flujo de una petición:**
```
Cliente → routes → [authMiddleware] → [checkPermiso] → controller → service → MySQL
```

---

## Resumen de endpoints

### Autenticación
| Método | Endpoint | Descripción | Permiso |
|---|---|---|---|
| POST | `/auth/login` | Iniciar sesión | Público |
| GET | `/auth/me` | Usuario en sesión | Autenticado |
| PUT | `/auth/password` | Cambiar contraseña | Autenticado |

### Empleados
| Método | Endpoint | Descripción | Permiso |
|---|---|---|---|
| GET | `/empleados` | Listar empleados | `empleados:listar` |
| POST | `/empleados` | Crear empleado | `empleados:crear` |
| PUT | `/empleados/:id` | Actualizar empleado | `editar_total` / `editar_propio` |
| DELETE | `/empleados/:id` | Desactivar empleado | `empleados:desactivar` |
| PUT | `/empleados/estado-masivo` | Cambio de estado masivo | `empleados:desactivar` |
| GET | `/empleados/documento/:doc[/:id]` | Verificar documento único | Autenticado |
| GET | `/empleados/plantilla` | Descargar plantilla Excel | `empleados:crear` |
| POST | `/empleados/importar` | Importar empleados desde Excel | `empleados:crear` |

### Historial, Estudios, Experiencia
| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/historial-cargos/empleado/:id` | Historial de cargos |
| PUT | `/historial-cargos/reorder` | Guardar orden drag & drop |
| GET | `/estudios/empleado/:id` | Estudios del empleado |
| PUT | `/estudios/empleado/:id/orden` | Guardar orden estudios |
| POST/PUT/DELETE | `/estudios[/:id]` | CRUD estudios |
| GET | `/experiencia-laboral/empleado/:id` | Experiencia laboral |
| PUT | `/experiencia-laboral/reorder` | Guardar orden drag & drop |
| POST/PUT/DELETE | `/experiencia-laboral[/:id]` | CRUD experiencia |

### Vacaciones
| Método | Endpoint | Descripción | Permiso |
|---|---|---|---|
| GET | `/vacaciones` | Listar (todas o propias según rol) | Autenticado |
| POST | `/vacaciones` | Solicitar vacaciones | `vacaciones:solicitar` |
| PUT | `/vacaciones/:id/aprobar` | Aprobar solicitud | `vacaciones:gestionar` |
| PUT | `/vacaciones/:id/rechazar` | Rechazar solicitud | `vacaciones:gestionar` |
| DELETE | `/vacaciones/:id` | Cancelar solicitud (soft-delete) | Autenticado |

### Configuración
| Método | Endpoint | Descripción | Permiso |
|---|---|---|---|
| GET | `/configuracion/laboral` | Días laborales | Autenticado |
| PUT | `/configuracion/laboral` | Actualizar días laborales | Solo ADMIN (en controller) |
| GET | `/configuracion/empresa` | Datos de la empresa | Autenticado |
| PUT | `/configuracion/empresa` | Actualizar nombre/NIT | Solo ADMIN (en controller) |

### Sedes
| Método | Endpoint | Descripción | Permiso |
|---|---|---|---|
| GET | `/sedes[?activas=true]` | Listar sedes | Autenticado |
| POST | `/sedes` | Crear sede | Solo ADMIN |
| PUT | `/sedes/:id` | Editar sede | Solo ADMIN |
| DELETE | `/sedes/:id` | Desactivar sede (soft-delete) | Solo ADMIN |

### Dashboard
| Método | Endpoint | Descripción | Permiso |
|---|---|---|---|
| GET | `/dashboard/stats[?sede_id=N]` | Métricas agregadas | `empleados:listar` |

### Catálogos y usuarios
| Método | Endpoint | Descripción | Permiso |
|---|---|---|---|
| GET/POST/PUT | `/cargos[/:id]` | Catálogo de cargos | Autenticado |
| GET/POST/PUT | `/empresas[/:id]` | Catálogo de empresas externas | Autenticado |
| GET/POST/PUT | `/universidades[/:id]` | Catálogo de universidades | Autenticado |
| GET | `/usuarios` | Listar usuarios | `usuarios:listar` |
| POST | `/usuarios` | Crear usuario | `usuarios:crear` |
| PUT | `/usuarios/:id` | Actualizar usuario | `usuarios:editar` |
| PUT | `/usuarios/:id/estado` | Activar/desactivar usuario | `usuarios:desactivar` |
| GET | `/auditoria` | Log de auditoría | `auditoria:ver` |
| GET | `/tipos-contrato` | Tipos de contrato | Autenticado |
| GET | `/estados-empleado` | Estados del empleado | Autenticado |
| GET | `/nivel-educativo` | Niveles educativos | Autenticado |

---

## Reglas de negocio destacadas

### Estado dual del empleado
`estado_empleado_id = 2` (Inactivo) → `estado = 0`. Cualquier otro estado (Activo, Licencia, Vacaciones, Suspendido, Reingreso) → `estado = 1`. Esta derivación ocurre en el service, nunca en el cliente.

### Estados del empleado
| ID | Nombre | `estado` del sistema |
|---|---|---|
| 1 | Activo | 1 (activo) |
| 2 | Inactivo | 0 (inactivo) |
| 3 | Licencia | 1 (activo) |
| 4 | Vacaciones | 1 (activo) |
| 5 | Suspendido | 1 (activo) |
| 6 | Reingreso | 1 (activo) |

### Auto-historial de cargos
El historial en `tb_historial_cargos` es **completamente automático**. Al crear un empleado se genera el primer registro abierto (`fecha_fin = null`). Al cambiar de cargo, el sistema cierra el período anterior y crea un nuevo registro abierto para el nuevo cargo. El usuario no gestiona este historial manualmente.

### Auto-creación de usuario
Al crear un empleado con correo y documento, se crea automáticamente una cuenta con rol EMPLEADO y contraseña igual al número de documento. Fire-and-forget: si falla, no bloquea la creación del empleado.

### Importación masiva — todo o nada
Si cualquier fila del Excel tiene error, se rechaza todo el lote. No se inserta ningún empleado hasta que el archivo esté completamente correcto. El endpoint devuelve HTTP 422 con la lista de errores por fila.

### Plantilla Excel
Generada con `exceljs` en el servidor. Tiene hoja "Listas" (oculta) como fuente de dropdowns reales para Cargo, Tipo Contrato, Sede y Estado. El Estado no se pre-rellena — celdas vacías se tratan como "Activo" para evitar validar filas vacías.

### Zona horaria Colombia (UTC-5)
Para obtener la fecha actual en Colombia:
```js
const ahoraCol = new Date(Date.now() - 5 * 60 * 60 * 1000);
const hoy = ahoraCol.toISOString().split("T")[0];
```
Nunca usar `new Date().toISOString()` directamente — devuelve UTC y puede ser un día diferente.

### Descarga de archivos con JWT
Los endpoints que devuelven archivos (plantilla Excel) requieren JWT. El cliente debe usar `fetch()` (interceptado por AuthContext) y convertir la respuesta a Blob. Nunca usar `window.location.href` para descargas autenticadas.

### Gotcha: tb_cargos usa `estado`, no `activo`
`tb_cargos` tiene columna `estado` (1/0). `tb_sedes` usa `activo` (1/0). No intercambiar — la query errónea da "Unknown column 'activo' in 'where clause'".

---

## Despliegue en producción — Railway

El servidor se despliega automáticamente desde `Dayanamholguin/gestion-server` rama `main`.

### Variables de entorno en Railway

| Variable | Descripción |
|---|---|
| `JWT_SECRET` | Clave secreta para firmar JWT |
| `AUTH_ENABLED` | `true` en producción |
| `CLIENT_URL` | URL del frontend en Vercel (para CORS) |
| `MYSQLHOST`, `MYSQLPORT`, `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLDATABASE` | Inyectadas automáticamente por Railway al estar en el mismo proyecto |

> **Importante CORS**: `CLIENT_URL` debe coincidir exactamente con la URL del frontend. Si no coincide, el login falla con "Error de conexión" aunque el servidor esté Online.

### Ejecutar migraciones en Railway

1. Abrir la consola MySQL del servicio de base de datos en Railway (pestaña **Query**)
2. Pegar y ejecutar el contenido de cada archivo `.sql` en `server/migrations/` en orden

### Push al repositorio de producción

```bash
# Servidor
git push server-origin "$(git subtree split --prefix=server HEAD)":refs/heads/main --force

# Cliente
git push client-origin "$(git subtree split --prefix=client HEAD)":refs/heads/main --force
```
