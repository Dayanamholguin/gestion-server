# 🖥️ API — Sistema de Gestión de RRHH (empresa COL)

Backend REST construido con **Node.js + Express 5** y **MySQL**, que expone todos los servicios del sistema de gestión de recursos humanos.

---

## Descripción del proyecto

Este servidor provee la API que consume el frontend de gestión de RRHH. Cubre:

- Autenticación con JWT y control de acceso por roles (ADMIN, RRHH, EMPLEADO)
- Gestión completa de empleados con historial automático de cambios de cargo
- Secciones por empleado: estudios académicos y experiencia laboral con reordenamiento drag & drop persistido
- Catálogos: cargos, empresas, universidades, tipos de contrato, estados, niveles educativos
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
| swagger-ui-express | — | Interfaz interactiva de documentación API |
| nodemon | 3.x | Recarga automática en desarrollo |

---

## Requisitos previos

- Node.js 18 o superior
- MySQL 8.x corriendo en el puerto **3307** (configurable)
- Base de datos `db_gestionEmpleadosTienda` creada con todas sus tablas

---

## Instalación

```bash
# 1. Entrar a la carpeta del servidor
cd server

# 2. Instalar dependencias
npm install

# 3. Crear el archivo de entorno
cp .env.example .env   # o crear .env manualmente (ver sección siguiente)
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

> **`AUTH_ENABLED=false`** (valor por defecto): el middleware de autenticación asigna un usuario ADMIN virtual con permisos totales. Ideal para desarrollo.  
> **`AUTH_ENABLED=true`**: exige JWT Bearer válido en cada petición protegida.

### Columnas adicionales requeridas en la BD

Si la base de datos ya existe desde una versión anterior, ejecutar:

```sql
ALTER TABLE tb_historial_cargos    ADD COLUMN orden INT DEFAULT 0;
ALTER TABLE tb_experiencia_laboral ADD COLUMN orden INT DEFAULT 0;
```

---

## Ejecución

```bash
# Modo desarrollo (nodemon — recarga automática)
npm run dev

# Modo producción
npm start
```

El servidor queda disponible en **`http://localhost:3001`**.

---

## Documentación interactiva (Swagger)

Con el servidor corriendo, abrir en el navegador:

```
http://localhost:3001/api-docs
```

Swagger UI muestra todos los endpoints con sus esquemas de request/response, parámetros y posibilidad de probarlos directamente desde el navegador.

> Cuando `AUTH_ENABLED=true`, usar el botón **Authorize** en Swagger UI e ingresar el token obtenido de `POST /auth/login`.

---

## Arquitectura general

```
server/
├── app.js                  ← Configura Express, CORS, middlewares y monta rutas
├── server.js               ← Solo llama app.listen(3001)
├── swagger.js              ← Especificación OpenAPI 3.0 completa
├── db.js                   ← Pool de conexiones MySQL2
├── .env                    ← Variables de entorno (no subir a git)
│
├── routes/                 ← Define los endpoints y conecta con controllers
│   ├── auth.routes.js
│   ├── empleados.routes.js
│   ├── historial-cargos.routes.js
│   ├── estudios.routes.js
│   ├── experiencia-laboral.routes.js
│   ├── cargos.routes.js
│   ├── empresas.routes.js
│   ├── universidades.routes.js
│   ├── usuarios.routes.js
│   ├── auditoria.routes.js
│   └── catalogos.routes.js
│
├── controllers/            ← Recibe la request, valida permisos, llama al servicio
├── services/               ← Lógica de negocio + consultas SQL (mysql2 callbacks → Promises)
├── validations/            ← Validaciones síncronas de campos requeridos
└── middleware/
    ├── authMiddleware.js   ← Verifica JWT / asigna usuario virtual
    └── checkPermiso.js     ← Middleware factory para validar permisos RBAC
```

**Flujo de una petición:**
```
Cliente → routes → [authMiddleware] → [checkPermiso] → controller → service → MySQL
```

---

## Resumen de endpoints

| Método | Endpoint | Descripción | Permiso |
|---|---|---|---|
| POST | `/auth/login` | Iniciar sesión | Público |
| GET | `/auth/me` | Usuario en sesión | Autenticado |
| PUT | `/auth/password` | Cambiar contraseña | Autenticado |
| GET | `/empleados` | Listar empleados | `empleados:listar` |
| POST | `/empleados` | Crear empleado | `empleados:crear` |
| PUT | `/empleados/:id` | Actualizar empleado | `editar_total` / `editar_propio` |
| DELETE | `/empleados/:id` | Eliminar empleado | `empleados:desactivar` |
| PUT | `/empleados/estado-masivo` | Cambio de estado masivo | `empleados:desactivar` |
| GET | `/empleados/documento/:doc` | Verificar documento único | Autenticado |
| GET | `/historial-cargos/empleado/:id` | Historial de cargos | Autenticado |
| PUT | `/historial-cargos/reorder` | Guardar orden drag & drop | Autenticado |
| GET | `/estudios/empleado/:id` | Estudios del empleado | Autenticado |
| PUT | `/estudios/empleado/:id/orden` | Guardar orden estudios | Autenticado |
| POST/PUT/DELETE | `/estudios` | CRUD estudios | Autenticado |
| GET | `/experiencia-laboral/empleado/:id` | Experiencia laboral | Autenticado |
| PUT | `/experiencia-laboral/reorder` | Guardar orden drag & drop | Autenticado |
| POST/PUT/DELETE | `/experiencia-laboral` | CRUD experiencia | Autenticado |
| GET/POST/PUT | `/cargos` | Catálogo de cargos | Autenticado |
| GET/POST/PUT | `/empresas` | Catálogo de empresas | Autenticado |
| GET/POST/PUT | `/universidades` | Catálogo de universidades | Autenticado |
| GET | `/usuarios` | Listar usuarios | `usuarios:listar` |
| POST | `/usuarios` | Crear usuario | `usuarios:crear` |
| PUT | `/usuarios/:id` | Actualizar usuario | `usuarios:editar` |
| PUT | `/usuarios/:id/estado` | Activar/desactivar usuario | `usuarios:desactivar` |
| GET | `/auditoria` | Log de auditoría | `auditoria:ver` |
| GET | `/tipos-contrato` | Tipos de contrato | Autenticado |
| GET | `/estados-empleado` | Estados del empleado | Autenticado |
| GET | `/nivel-educativo` | Niveles educativos | Autenticado |

---

## Despliegue en producción

### Base de datos — Railway MySQL

1. Crear cuenta en [railway.app](https://railway.app) → **New Project**
2. Clic en **Add a service** → **Database** → **MySQL**
3. Railway aprovisiona la base de datos automáticamente y genera las variables de entorno `MYSQLHOST`, `MYSQLPORT`, `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLDATABASE`
4. Ir a **MySQL → Data** (pestaña Query) o conectarse con un cliente externo (TablePlus, DBeaver) usando las credenciales de la pestaña **Variables**
5. Ejecutar todo el esquema SQL para crear las tablas
6. Ejecutar las migraciones adicionales si la BD ya existía:
   ```sql
   ALTER TABLE tb_historial_cargos    ADD COLUMN orden INT DEFAULT 0;
   ALTER TABLE tb_experiencia_laboral ADD COLUMN orden INT DEFAULT 0;
   ```

### Servidor — Railway

1. En el mismo proyecto Railway clic en **Add a service** → **GitHub Repo**
2. Seleccionar el repositorio y configurar:
   - **Root Directory**: `server`
   - **Start Command**: `npm start` (Railway lo detecta solo desde `package.json`)
3. En la pestaña **Variables** del servicio, agregar:

   | Variable | Valor |
   |---|---|
   | `JWT_SECRET` | Una cadena larga y aleatoria |
   | `AUTH_ENABLED` | `true` |
   | `CLIENT_URL` | URL de Vercel (se obtiene después de desplegar el cliente) |

   > Las variables `MYSQL*` se inyectan automáticamente al estar en el mismo proyecto Railway.

4. Railway hace deploy automáticamente en cada push a la rama principal
5. Copiar la URL pública del servicio (ej: `https://gestion-rrhh.up.railway.app`) — se necesita para el cliente

---

## Reglas de negocio destacadas

### Auto-historial de cargos
El historial en `tb_historial_cargos` es **completamente automático**. Al crear un empleado se genera el primer registro abierto (`fecha_fin = null`). Al cambiar de cargo desde la edición de empleado, el sistema: cierra el período anterior con la fecha de hoy y crea un nuevo registro abierto para el nuevo cargo. El usuario no gestiona este historial manualmente.

### Estado dual del empleado
Los campos `estado_empleado_id` y `estado` (0/1) siempre están sincronizados. La regla: `estado_empleado_id = 2` → `estado = 0` (inactivo); cualquier otro valor → `estado = 1` (activo). Esta derivación ocurre en el service layer, nunca en el cliente.

### Auto-creación de usuario
Al crear un empleado con correo y documento, se crea automáticamente una cuenta de usuario con rol EMPLEADO y contraseña igual al número de documento. Es fire-and-forget: si falla, no bloquea la creación del empleado.

### Drag & drop persistido
`tb_historial_cargos` y `tb_experiencia_laboral` tienen columna `orden INT DEFAULT 0`. Los endpoints `/reorder` actualizan el índice de posición de cada registro tras un reordenamiento en la UI.
