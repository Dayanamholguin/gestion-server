const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");

const authMiddleware = require("./middleware/authMiddleware");

const authRoutes            = require("./routes/auth.routes");
const usuariosRoutes        = require("./routes/usuarios.routes");
const auditoriaRoutes       = require("./routes/auditoria.routes");
const empleadoRoutes        = require("./routes/empleados.routes");
const cargoRoutes           = require("./routes/cargos.routes");
const empresaRoutes         = require("./routes/empresas.routes");
const historialCargosRoutes = require("./routes/historial-cargos.routes");
const estudiosRoutes        = require("./routes/estudios.routes");
const experienciaLaboralRoutes = require("./routes/experiencia-laboral.routes");
const catalogosRoutes       = require("./routes/catalogos.routes");
const universidadesRoutes   = require("./routes/universidades.routes");

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || "*",
  credentials: true,
}));
app.use(express.json());

// ── Documentación Swagger (pública) ──────────────────────────────────────
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: "API RRHH — empresa COL",
}));

// ── Rutas públicas (sin auth) ─────────────────────────────────────────────
app.use("/auth", authRoutes);

// ── Middleware de autenticación global ───────────────────────────────────
// Cuando AUTH_ENABLED=false, solo asigna req.usuario virtual y continúa.
// Cuando AUTH_ENABLED=true, verifica el JWT en cada solicitud.
app.use(authMiddleware);

// ── Rutas protegidas ──────────────────────────────────────────────────────
app.use("/usuarios",           usuariosRoutes);
app.use("/auditoria",          auditoriaRoutes);
app.use("/",                   catalogosRoutes);
app.use("/cargos",             cargoRoutes);
app.use("/empleados",          empleadoRoutes);
app.use("/empresas",           empresaRoutes);
app.use("/historial-cargos",   historialCargosRoutes);
app.use("/estudios",           estudiosRoutes);
app.use("/experiencia-laboral", experienciaLaboralRoutes);
app.use("/universidades",      universidadesRoutes);

module.exports = app;
