/**
 * swagger.js — Especificación del API de RRHH empresa COL
 */

const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "API - Sistema de Gestión de RRHH (empresa COL)",
    version: "1.0.0",
    description:
      "API REST para la gestión de empleados, historial de cargos, estudios, experiencia laboral, usuarios y auditoría.",
    contact: { name: "Equipo empresa COL" },
  },
  servers: [{ url: "http://localhost:3001", description: "Desarrollo local" }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description:
          "JWT obtenido en POST /auth/login. Solo requerido cuando AUTH_ENABLED=true.",
      },
    },
    schemas: {
      Error: {
        type: "object",
        properties: { error: { type: "string", example: "Mensaje de error" } },
      },
      Empleado: {
        type: "object",
        properties: {
          id: { type: "integer" },
          nombre: { type: "string" },
          apellido: { type: "string" },
          documento: { type: "string" },
          correo: { type: "string" },
          celular: { type: "string" },
          salario: { type: "number" },
          fecha_ingreso: { type: "string", format: "date" },
          fecha_nacimiento: { type: "string", format: "date" },
          cargo_id: { type: "integer" },
          tipo_contrato_id: { type: "integer" },
          empresa_id: { type: "integer", nullable: true },
          estado_empleado_id: { type: "integer" },
          estado: { type: "integer", enum: [0, 1] },
          cargo_nombre: { type: "string" },
          tipo_contrato_nombre: { type: "string" },
          estado_empleado_nombre: { type: "string" },
          empresa_nombre: { type: "string", nullable: true },
        },
      },
      HistorialCargo: {
        type: "object",
        properties: {
          id: { type: "integer" },
          empleado_id: { type: "integer" },
          cargo_id: { type: "integer" },
          tipo_contrato_id: { type: "integer" },
          salario: { type: "number" },
          fecha_inicio: { type: "string", format: "date" },
          fecha_fin: {
            type: "string",
            format: "date",
            nullable: true,
            description: "null = cargo actual",
          },
          motivo: { type: "string", nullable: true },
          orden: { type: "integer" },
          cargo_nombre: { type: "string" },
          tipo_contrato_nombre: { type: "string" },
        },
      },
      Estudio: {
        type: "object",
        properties: {
          id: { type: "integer" },
          empleado_id: { type: "integer" },
          nivel_educativo_id: { type: "integer" },
          titulo: { type: "string" },
          institucion: { type: "string", nullable: true },
          universidad_id: { type: "integer", nullable: true },
          fecha_inicio: { type: "string", format: "date" },
          fecha_fin: { type: "string", format: "date", nullable: true },
          graduado: { type: "boolean" },
        },
      },
      ExperienciaLaboral: {
        type: "object",
        properties: {
          id: { type: "integer" },
          empleado_id: { type: "integer" },
          empresa: { type: "string" },
          cargo: { type: "string" },
          fecha_inicio: { type: "string", format: "date" },
          fecha_fin: { type: "string", format: "date", nullable: true },
          descripcion: {
            type: "string",
            nullable: true,
            description: "Contenido HTML del editor de texto enriquecido",
          },
          orden: { type: "integer" },
        },
      },
      Usuario: {
        type: "object",
        properties: {
          id: { type: "integer" },
          nombre: { type: "string" },
          apellido: { type: "string" },
          correo: { type: "string" },
          activo: { type: "boolean" },
          rol_id: { type: "integer" },
          rol: { type: "string", enum: ["ADMIN", "RRHH", "EMPLEADO"] },
          empleado_id: { type: "integer", nullable: true },
          empleado_nombre: { type: "string", nullable: true },
          ultimo_acceso: {
            type: "string",
            format: "date-time",
            nullable: true,
          },
        },
      },
      Auditoria: {
        type: "object",
        properties: {
          id: { type: "integer" },
          tabla: { type: "string" },
          registro_id: { type: "integer" },
          accion: { type: "string", enum: ["CREATE", "UPDATE", "DELETE"] },
          datos_anteriores: { type: "object", nullable: true },
          datos_nuevos: { type: "object", nullable: true },
          usuario_id: { type: "integer", nullable: true },
          usuario_nombre: { type: "string", nullable: true },
          usuario_apellido: { type: "string", nullable: true },
          ip: { type: "string", nullable: true },
          created_at: { type: "string", format: "date-time" },
        },
      },
      Catalogo: {
        type: "object",
        properties: {
          id: { type: "integer" },
          nombre: { type: "string" },
        },
      },
      ReorderBody: {
        type: "object",
        required: ["items"],
        properties: {
          items: {
            type: "array",
            items: { type: "object", properties: { id: { type: "integer" } } },
            description:
              "IDs en el nuevo orden deseado (índice 0 = primera posición)",
          },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  tags: [
    { name: "Auth", description: "Autenticación y sesión" },
    { name: "Empleados", description: "Gestión de empleados" },
    {
      name: "Historial de Cargos",
      description: "Historial automático de cambios de cargo",
    },
    { name: "Estudios", description: "Estudios académicos del empleado" },
    { name: "Experiencia Laboral", description: "Experiencia laboral previa" },
    { name: "Cargos", description: "Catálogo de cargos" },
    { name: "Empresas", description: "Catálogo de empresas" },
    { name: "Universidades", description: "Catálogo de universidades" },
    { name: "Usuarios", description: "Gestión de usuarios del sistema" },
    { name: "Auditoría", description: "Log de operaciones" },
    {
      name: "Catálogos",
      description:
        "Tablas de referencia (tipos contrato, estados, niveles educativos)",
    },
  ],
  paths: {
    // ── AUTH ────────────────────────────────────────────────────────────────
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Iniciar sesión",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["correo", "password"],
                properties: {
                  correo: { type: "string", example: "admin@empresa.com" },
                  password: { type: "string", example: "123456" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Login exitoso",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    token: { type: "string" },
                    usuario: { $ref: "#/components/schemas/Usuario" },
                  },
                },
              },
            },
          },
          401: { description: "Credenciales inválidas" },
        },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Obtener usuario autenticado",
        responses: {
          200: {
            description: "Datos del usuario en sesión",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Usuario" },
              },
            },
          },
          401: { description: "Token inválido o ausente" },
        },
      },
    },
    "/auth/password": {
      put: {
        tags: ["Auth"],
        summary: "Cambiar contraseña",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["passwordActual", "passwordNueva"],
                properties: {
                  passwordActual: { type: "string" },
                  passwordNueva: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Contraseña actualizada" },
          400: { description: "Contraseña actual incorrecta" },
        },
      },
    },

    // ── EMPLEADOS ────────────────────────────────────────────────────────────
    "/empleados": {
      get: {
        tags: ["Empleados"],
        summary: "Listar todos los empleados",
        description:
          "Requiere permiso `empleados:listar`. Retorna empleados con joins a cargo, contrato, estado y empresa.",
        responses: {
          200: {
            description: "Lista de empleados",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Empleado" },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Empleados"],
        summary: "Crear empleado",
        description:
          "Requiere `empleados:crear`. Al crear: (1) genera registro inicial de historial de cargos abierto, (2) crea cuenta de usuario con rol EMPLEADO y contraseña igual al documento.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: [
                  "nombre",
                  "apellido",
                  "documento",
                  "correo",
                  "salario",
                  "fecha_ingreso",
                  "cargo_id",
                  "tipo_contrato_id",
                ],
                properties: {
                  nombre: { type: "string" },
                  apellido: { type: "string" },
                  documento: { type: "string" },
                  correo: { type: "string" },
                  celular: { type: "string" },
                  salario: { type: "number" },
                  fecha_ingreso: { type: "string", format: "date" },
                  fecha_nacimiento: { type: "string", format: "date" },
                  cargo_id: { type: "integer" },
                  tipo_contrato_id: { type: "integer" },
                  empresa_id: { type: "integer", nullable: true },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Empleado creado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Empleado" },
              },
            },
          },
          400: { description: "Validación fallida" },
          403: { description: "Sin permiso" },
        },
      },
    },
    "/empleados/{id}": {
      put: {
        tags: ["Empleados"],
        summary: "Actualizar empleado",
        description:
          "ADMIN/RRHH (`empleados:editar_total`) puede editar todos los campos. Si el cargo cambia, gestiona automáticamente el historial. EMPLEADO (`empleados:editar_propio`) solo puede editar nombre, apellido, correo y celular de su propio perfil.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Empleado" },
            },
          },
        },
        responses: {
          200: {
            description: "Empleado actualizado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Empleado" },
              },
            },
          },
          403: { description: "Sin permiso o perfil ajeno" },
          404: { description: "Empleado no encontrado" },
        },
      },
      delete: {
        tags: ["Empleados"],
        summary: "Eliminar empleado",
        description: "Requiere `empleados:desactivar`.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: { description: "Empleado eliminado" },
          404: { description: "No encontrado" },
        },
      },
    },
    "/empleados/estado-masivo": {
      put: {
        tags: ["Empleados"],
        summary: "Cambiar estado de múltiples empleados",
        description:
          "Requiere `empleados:desactivar`. Sincroniza automáticamente el campo `estado` (0/1) según el `estado_empleado_id`.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["empleadosIds", "estado_empleado_id"],
                properties: {
                  empleadosIds: { type: "array", items: { type: "integer" } },
                  estado_empleado_id: { type: "integer" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Estados actualizados" },
          400: { description: "Parámetros inválidos" },
        },
      },
    },
    "/empleados/documento/{documento}": {
      get: {
        tags: ["Empleados"],
        summary: "Verificar unicidad de documento (creación)",
        parameters: [
          {
            name: "documento",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Resultado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { existe: { type: "boolean" } },
                },
              },
            },
          },
        },
      },
    },
    "/empleados/documento/{documento}/{empleadoId}": {
      get: {
        tags: ["Empleados"],
        summary:
          "Verificar unicidad de documento (edición — excluye al propio empleado)",
        parameters: [
          {
            name: "documento",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
          {
            name: "empleadoId",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: {
            description: "Resultado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { existe: { type: "boolean" } },
                },
              },
            },
          },
        },
      },
    },

    // ── HISTORIAL CARGOS ─────────────────────────────────────────────────────
    "/historial-cargos/empleado/{empleadoId}": {
      get: {
        tags: ["Historial de Cargos"],
        summary: "Obtener historial de un empleado",
        description:
          "Retorna registros ordenados por `orden ASC, fecha_fin IS NULL DESC, fecha_inicio DESC`. El registro con `fecha_fin = null` es el cargo actual.",
        parameters: [
          {
            name: "empleadoId",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: {
            description: "Lista de historial",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/HistorialCargo" },
                },
              },
            },
          },
        },
      },
    },
    "/historial-cargos/reorder": {
      put: {
        tags: ["Historial de Cargos"],
        summary: "Persistir nuevo orden (drag & drop)",
        description:
          "Actualiza el campo `orden` de cada registro. Debe llamarse con los IDs en el orden deseado.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ReorderBody" },
            },
          },
        },
        responses: {
          200: {
            description: "Orden guardado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { ok: { type: "boolean" } },
                },
              },
            },
          },
        },
      },
    },
    "/historial-cargos": {
      post: {
        tags: ["Historial de Cargos"],
        summary: "Crear registro de historial (uso interno del backend)",
        description:
          "Normalmente llamado de forma automática por el controller de empleados. No requiere intervención manual.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: [
                  "empleado_id",
                  "cargo_id",
                  "tipo_contrato_id",
                  "salario",
                  "fecha_inicio",
                ],
                properties: {
                  empleado_id: { type: "integer" },
                  cargo_id: { type: "integer" },
                  tipo_contrato_id: { type: "integer" },
                  salario: { type: "number" },
                  fecha_inicio: { type: "string", format: "date" },
                  fecha_fin: { type: "string", format: "date", nullable: true },
                  motivo: { type: "string", nullable: true },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Registro creado" } },
      },
    },
    "/historial-cargos/{id}": {
      put: {
        tags: ["Historial de Cargos"],
        summary: "Actualizar registro de historial",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/HistorialCargo" },
            },
          },
        },
        responses: { 200: { description: "Actualizado" } },
      },
      delete: {
        tags: ["Historial de Cargos"],
        summary: "Eliminar registro de historial (soft delete: estado=0)",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: { 200: { description: "Eliminado" } },
      },
    },

    // ── ESTUDIOS ─────────────────────────────────────────────────────────────
    "/estudios/empleado/{empleadoId}": {
      get: {
        tags: ["Estudios"],
        summary: "Obtener estudios de un empleado",
        parameters: [
          {
            name: "empleadoId",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: {
            description: "Lista de estudios",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Estudio" },
                },
              },
            },
          },
        },
      },
    },
    "/estudios/empleado/{empleadoId}/orden": {
      put: {
        tags: ["Estudios"],
        summary: "Persistir nuevo orden de estudios (drag & drop)",
        parameters: [
          {
            name: "empleadoId",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  ordenes: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "integer" },
                        orden: { type: "integer" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Orden guardado" } },
      },
    },
    "/estudios": {
      post: {
        tags: ["Estudios"],
        summary: "Crear estudio",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Estudio" },
            },
          },
        },
        responses: { 201: { description: "Creado" } },
      },
    },
    "/estudios/{id}": {
      put: {
        tags: ["Estudios"],
        summary: "Actualizar estudio",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Estudio" },
            },
          },
        },
        responses: { 200: { description: "Actualizado" } },
      },
      delete: {
        tags: ["Estudios"],
        summary: "Eliminar estudio (soft delete)",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: { 200: { description: "Eliminado" } },
      },
    },

    // ── EXPERIENCIA LABORAL ──────────────────────────────────────────────────
    "/experiencia-laboral/empleado/{empleadoId}": {
      get: {
        tags: ["Experiencia Laboral"],
        summary: "Obtener experiencia laboral de un empleado",
        parameters: [
          {
            name: "empleadoId",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: {
            description: "Lista de experiencias",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/ExperienciaLaboral" },
                },
              },
            },
          },
        },
      },
    },
    "/experiencia-laboral/reorder": {
      put: {
        tags: ["Experiencia Laboral"],
        summary: "Persistir nuevo orden (drag & drop)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ReorderBody" },
            },
          },
        },
        responses: { 200: { description: "Orden guardado" } },
      },
    },
    "/experiencia-laboral": {
      post: {
        tags: ["Experiencia Laboral"],
        summary: "Crear experiencia laboral",
        description:
          "El campo `descripcion` acepta HTML generado por el editor Tiptap.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ExperienciaLaboral" },
            },
          },
        },
        responses: { 201: { description: "Creada" } },
      },
    },
    "/experiencia-laboral/{id}": {
      put: {
        tags: ["Experiencia Laboral"],
        summary: "Actualizar experiencia laboral",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ExperienciaLaboral" },
            },
          },
        },
        responses: { 200: { description: "Actualizada" } },
      },
      delete: {
        tags: ["Experiencia Laboral"],
        summary: "Eliminar experiencia laboral (soft delete)",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: { 200: { description: "Eliminada" } },
      },
    },

    // ── CARGOS ───────────────────────────────────────────────────────────────
    "/cargos": {
      get: {
        tags: ["Cargos"],
        summary: "Listar cargos",
        description:
          "Sin query param retorna solo activos. Con `?all=true` retorna todos.",
        parameters: [
          {
            name: "all",
            in: "query",
            schema: { type: "boolean" },
            description: "true = incluir inactivos",
          },
        ],
        responses: {
          200: {
            description: "Lista de cargos",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Catalogo" },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Cargos"],
        summary: "Crear cargo",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["nombre"],
                properties: { nombre: { type: "string" } },
              },
            },
          },
        },
        responses: { 201: { description: "Cargo creado" } },
      },
    },
    "/cargos/{id}": {
      put: {
        tags: ["Cargos"],
        summary: "Actualizar cargo (nombre y/o estado activo)",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  nombre: { type: "string" },
                  activo: { type: "boolean" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Actualizado" } },
      },
    },

    // ── EMPRESAS ─────────────────────────────────────────────────────────────
    "/empresas": {
      get: {
        tags: ["Empresas"],
        summary: "Listar empresas",
        responses: {
          200: {
            description: "Lista",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Catalogo" },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Empresas"],
        summary: "Crear empresa",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["nombre"],
                properties: { nombre: { type: "string" } },
              },
            },
          },
        },
        responses: { 201: { description: "Creada" } },
      },
    },
    "/empresas/{id}": {
      put: {
        tags: ["Empresas"],
        summary: "Actualizar empresa",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  nombre: { type: "string" },
                  activo: { type: "boolean" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Actualizada" } },
      },
    },

    // ── UNIVERSIDADES ────────────────────────────────────────────────────────
    "/universidades": {
      get: {
        tags: ["Universidades"],
        summary: "Listar universidades",
        responses: {
          200: {
            description: "Lista",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Catalogo" },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Universidades"],
        summary: "Crear universidad",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["nombre"],
                properties: { nombre: { type: "string" } },
              },
            },
          },
        },
        responses: { 201: { description: "Creada" } },
      },
    },
    "/universidades/{id}": {
      put: {
        tags: ["Universidades"],
        summary: "Actualizar universidad",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  nombre: { type: "string" },
                  activo: { type: "boolean" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Actualizada" } },
      },
    },

    // ── USUARIOS ─────────────────────────────────────────────────────────────
    "/usuarios": {
      get: {
        tags: ["Usuarios"],
        summary: "Listar usuarios del sistema",
        description: "Requiere `usuarios:listar`.",
        responses: {
          200: {
            description: "Lista de usuarios",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Usuario" },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Usuarios"],
        summary: "Crear usuario",
        description:
          "Requiere `usuarios:crear`. La contraseña se hashea con bcrypt (salt 10).",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: [
                  "nombre",
                  "apellido",
                  "correo",
                  "password",
                  "rol_id",
                ],
                properties: {
                  nombre: { type: "string" },
                  apellido: { type: "string" },
                  correo: { type: "string" },
                  password: { type: "string" },
                  rol_id: { type: "integer", enum: [1, 2, 3] },
                  empleado_id: { type: "integer", nullable: true },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Usuario creado" } },
      },
    },
    "/usuarios/{id}": {
      put: {
        tags: ["Usuarios"],
        summary: "Actualizar usuario",
        description:
          "Requiere `usuarios:editar`. Si se envía `password`, se rehashea.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Usuario" },
            },
          },
        },
        responses: { 200: { description: "Actualizado" } },
      },
    },
    "/usuarios/{id}/estado": {
      put: {
        tags: ["Usuarios"],
        summary: "Activar / desactivar usuario",
        description: "Requiere `usuarios:desactivar`.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["activo"],
                properties: { activo: { type: "boolean" } },
              },
            },
          },
        },
        responses: { 200: { description: "Estado actualizado" } },
      },
    },

    // ── AUDITORÍA ────────────────────────────────────────────────────────────
    "/auditoria": {
      get: {
        tags: ["Auditoría"],
        summary: "Listar registros de auditoría",
        description:
          "Requiere `auditoria:ver`. Máximo 500 registros, ordenados por fecha descendente.",
        parameters: [
          {
            name: "tabla",
            in: "query",
            schema: { type: "string" },
            description: "Filtrar por tabla (ej: tb_empleados)",
          },
          {
            name: "accion",
            in: "query",
            schema: { type: "string", enum: ["CREATE", "UPDATE", "DELETE"] },
          },
          { name: "usuarioId", in: "query", schema: { type: "integer" } },
          {
            name: "fechaDesde",
            in: "query",
            schema: { type: "string", format: "date" },
          },
          {
            name: "fechaHasta",
            in: "query",
            schema: { type: "string", format: "date" },
          },
        ],
        responses: {
          200: {
            description: "Lista de auditoría",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Auditoria" },
                },
              },
            },
          },
        },
      },
    },

    // ── CATÁLOGOS ────────────────────────────────────────────────────────────
    "/tipos-contrato": {
      get: {
        tags: ["Catálogos"],
        summary: "Listar tipos de contrato",
        responses: {
          200: {
            description: "Lista",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Catalogo" },
                },
              },
            },
          },
        },
      },
    },
    "/estados-empleado": {
      get: {
        tags: ["Catálogos"],
        summary: "Listar estados del empleado",
        description:
          "ID 2 = Inactivo (mapea a estado=0). Cualquier otro ID = Activo (estado=1).",
        responses: {
          200: {
            description: "Lista",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Catalogo" },
                },
              },
            },
          },
        },
      },
    },
    "/nivel-educativo": {
      get: {
        tags: ["Catálogos"],
        summary: "Listar niveles educativos",
        responses: {
          200: {
            description: "Lista",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Catalogo" },
                },
              },
            },
          },
        },
      },
    },
  },
};

module.exports = swaggerSpec;
