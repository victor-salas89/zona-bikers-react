import { spawn, execFileSync } from 'node:child_process';
import { randomBytes, randomUUID } from 'node:crypto';
import { writeFile, mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';
import assert from 'node:assert/strict';

// Crea y elimina SOLO una base temporal con nombre aleatorio, nunca zona_bikers.
const database = 'zona_bikers_test_' + randomBytes(6).toString('hex');
const mysql = process.env.MYSQL_BIN || 'C:/laragon/bin/mysql/mysql-8.4.3-winx64/bin/mysql.exe';
const java = process.env.JAVA_HOME ? process.env.JAVA_HOME + '/bin/java.exe' : 'java';
const mysqlArgs = ['--host=127.0.0.1', '--port=3306', '--user=' + (process.env.DB_USERNAME || 'root')];
const sql = query => execFileSync(mysql, [...mysqlArgs, '--execute=' + query], { env: { ...process.env, MYSQL_PWD: process.env.DB_PASSWORD || '' }, windowsHide: true, stdio: 'pipe' });
const clave = randomBytes(20).toString('hex');
const checks = [];
const processes = [];
let browser, creada = false;
async function esperar(url, listo = async r => r.ok) {
  for (let n = 0; n < 120; n++) {
    try { if (await listo(await fetch(url))) return; } catch { /* Servicio iniciando. */ }
    await new Promise(r => setTimeout(r, 500));
  }
  throw Error('El servicio no inició: ' + url);
}
async function api(path, { token, method = 'GET', body } = {}) {
  const r = await fetch('http://127.0.0.1:18080/api' + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
  return { status: r.status, data: r.status === 204 ? null : await r.json() };
}
function servicio(exe, args, env) {
  const p = spawn(exe, args, { env: { ...process.env, ...env }, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
  // No guardar logs de autenticación ni variables de entorno en evidencia.
  p.stdout.resume(); p.stderr.resume(); processes.push(p); return p;
}
try {
  sql('CREATE DATABASE `' + database + '` CHARACTER SET utf8mb4'); creada = true;
  servicio(java, ['-jar', 'Backend/target/zona-bikers-backend-0.0.1-SNAPSHOT.jar'], {
    DB_URL: 'jdbc:mysql://127.0.0.1:3306/' + database, DB_USERNAME: process.env.DB_USERNAME || 'root', DB_PASSWORD: process.env.DB_PASSWORD || '',
    JWT_SECRET: randomBytes(48).toString('hex'), SERVER_PORT: '18080', ADMIN_EMAIL: 'prueba-admin@duoc.cl', ADMIN_PASSWORD: clave,
    FRONTEND_ORIGINS: 'http://127.0.0.1:15173', SEED_CATALOG: 'true', LOGGING_LEVEL_ROOT: 'WARN', DEBUG: 'false',
  });
  // El puerto puede abrir antes de que termine el CommandLineRunner de carga inicial.
  await esperar('http://127.0.0.1:18080/api/productos', async r => r.ok && (await r.json()).length === 4);
  const catalogo = await api('/productos'); assert.equal(catalogo.data.length, 4);
  checks.push('Arranque Spring Boot 4.2 / Java 21 / MySQL y carga inicial de cuatro productos');
  let admin;
  for (let n = 0; n < 30; n++) {
    admin = await api('/auth/login', { method: 'POST', body: { correo: 'prueba-admin@duoc.cl', contrasena: clave } });
    if (admin.status === 200) break;
    await new Promise(r => setTimeout(r, 200));
  }
  assert.equal(admin.status, 200);
  const token = admin.data.token;
  servicio(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '15173', '--strictPort'], { VITE_API_URL: 'http://127.0.0.1:18080/api' });
  await esperar('http://127.0.0.1:15173');
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:15173/#/login');
  await page.getByLabel('Correo', { exact: true }).fill('prueba-admin@duoc.cl'); await page.getByLabel('Contraseña', { exact: true }).fill(clave); await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await page.getByRole('heading', { name: 'Panel de administración' }).waitFor();
  await page.goto('http://127.0.0.1:15173/#/admin-nuevo-producto');
  for (const [label, value] of Object.entries({ 'Código': 'TEST001', 'Nombre': 'Producto integración', 'Descripción': 'Creado desde React', 'Precio': '10000', 'Stock': '3' })) await page.getByLabel(label, { exact: true }).fill(value);
  await page.getByLabel('Precio de oferta (opcional)').fill('8000');
  await page.getByRole('button', { name: 'Guardar producto', exact: true }).click();
  await page.getByRole('rowheader', { name: 'Producto integración' }).waitFor();
  const producto = (await api('/productos')).data.find(p => p.codigo === 'TEST001'); assert.ok(producto);
  await page.getByRole('link', { name: 'Editar Producto integración' }).click();
  await page.getByLabel('Nombre', { exact: true }).fill('Producto verificado'); await page.getByRole('button', { name: 'Guardar producto', exact: true }).click();
  await page.getByRole('rowheader', { name: 'Producto verificado' }).waitFor();
  assert.equal((await api('/productos/' + producto.id)).data.nombre, 'Producto verificado');
  checks.push('Login administrador y alta/edición de producto desde React persistidos en MySQL');
  const vendedor = await api('/usuarios', { token, method: 'POST', body: { correo: 'prueba-vendedor@duoc.cl', nombre: 'Vendedor', contrasena: clave, rol: 'vendedor' } }); assert.equal(vendedor.status, 201);
  const loginV = await api('/auth/login', { method: 'POST', body: { correo: 'prueba-vendedor@duoc.cl', contrasena: clave } });
  assert.equal((await api('/usuarios', { token: loginV.data.token })).status, 403);
  assert.equal((await api('/auth/registro', { method: 'POST', body: { correo: 'ataque@gmail.com', nombre: 'Ataque', contrasena: clave, rol: 'administrador' } })).status, 400);
  checks.push('Vendedor sin acceso a usuarios y registro público sin escalada de rol');
  await page.getByRole('button', { name: 'Cerrar sesión' }).click(); await page.getByRole('heading', { name: 'Iniciar sesión' }).waitFor();
  await page.goto('http://127.0.0.1:15173/#/registro'); page.on('dialog', d => d.accept());
  for (const [label, value] of Object.entries({ 'RUN': '123456785', 'Nombre': 'Cliente', 'Apellidos': 'Prueba', 'Correo': 'prueba-cliente@gmail.com', 'Contraseña': clave, 'Dirección': 'Calle Prueba 123' })) await page.getByLabel(label, { exact: true }).fill(value);
  await page.getByLabel('Región', { exact: true }).selectOption('Región Metropolitana'); await page.getByLabel('Comuna', { exact: true }).selectOption('Santiago');
  const registro = page.waitForResponse(r => r.url().endsWith('/auth/registro') && r.request().method() === 'POST');
  await page.getByRole('button', { name: 'Registrarme' }).click(); assert.equal((await registro).status(), 201);
  await page.goto('http://127.0.0.1:15173/#/login');
  await page.getByLabel('Correo', { exact: true }).fill('prueba-cliente@gmail.com'); await page.getByLabel('Contraseña', { exact: true }).fill(clave); await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await page.getByRole('heading', { name: 'Zona Bikers', exact: true }).waitFor();
  await page.reload(); await page.getByRole('button', { name: 'Cerrar sesión' }).waitFor();
  const sesion = await page.evaluate(() => JSON.parse(localStorage.getItem('sesionBikers')));
  assert.equal((await api('/usuarios', { token: sesion.token })).status, 403);
  await page.goto('http://127.0.0.1:15173/#/admin'); await page.getByRole('heading', { name: 'Zona Bikers', exact: true }).waitFor();
  checks.push('Registro/login cliente, persistencia tras recarga y restricciones React/API');
  await page.goto('http://127.0.0.1:15173/#/detalle-producto?id=' + producto.id);
  await page.getByLabel('Cantidad', { exact: true }).fill('2');
  const detalle = page.getByRole('heading', { name: 'Detalle del producto' }).locator('..');
  await detalle.getByRole('button', { name: 'Agregar al carrito', exact: true }).click();
  await page.getByRole('link', { name: 'Carrito', exact: true }).click(); await page.getByRole('button', { name: 'Finalizar compra' }).click();
  await page.getByLabel('Opción de entrega').selectOption('domicilio'); await page.getByRole('button', { name: 'Confirmar compra simulada' }).click();
  await page.getByRole('heading', { name: 'Compra aprobada' }).waitFor();
  const pedidoId = page.url().split('/').at(-1); const pedido = await api('/pedidos/' + pedidoId, { token: sesion.token });
  assert.equal(pedido.data.total, 19990); assert.equal((await api('/productos/' + producto.id)).data.stock, 1);
  await page.reload(); await page.getByRole('heading', { name: 'Compra aprobada' }).waitFor();
  await mkdir('test-results', { recursive: true }); await page.screenshot({ path: 'test-results/checkout-mysql.png', fullPage: true });
  checks.push('Carrito y checkout React → API → MySQL, total con oferta y despacho, stock descontado y pedido recuperado');
  assert.equal((await api('/pedidos/' + pedidoId, { token })).status, 404);
  const repetido = await api('/pedidos', { token: sesion.token, method: 'POST', body: { ...pedido.data, clave: randomUUID(), productos: [{ id: producto.id, cantidad: 2 }] } }); assert.equal(repetido.status, 409);
  await page.getByRole('button', { name: 'Cerrar sesión' }).click(); await page.getByRole('heading', { name: 'Iniciar sesión' }).waitFor();
  assert.equal((await api('/auth/me', { token: sesion.token })).status, 401);
  assert.equal((await api('/productos/' + producto.id, { method: 'DELETE', token })).status, 204);
  assert.equal((await api('/usuarios/' + vendedor.data.id, { method: 'DELETE', token })).status, 204);
  assert.equal((await fetch('http://127.0.0.1:18080/v3/api-docs')).status, 200);
  checks.push('Pedidos privados, stock insuficiente, logout revocable, eliminación CRUD y OpenAPI HTTP 200');
  await page.goto('http://127.0.0.1:18080/swagger-ui/index.html');
  const operacion = page.locator('.opblock').filter({ has: page.locator('.opblock-summary-path[data-path="/api/prueba"]') });
  await operacion.locator('.opblock-summary').click();
  await operacion.getByRole('button', { name: 'Try it out' }).click();
  const respuestaSwagger = page.waitForResponse(r => r.url().endsWith('/api/prueba') && r.request().method() === 'GET');
  await operacion.getByRole('button', { name: 'Execute', exact: true }).click();
  assert.equal((await respuestaSwagger).status(), 200);
  await operacion.getByText('API Zona Bikers disponible', { exact: false }).waitFor();
  await page.screenshot({ path: 'test-results/swagger-mysql.png', fullPage: true });
  checks.push('Swagger UI: Try it out y Execute de GET /api/prueba con respuesta 200');
  const report = { fecha: new Date().toISOString(), motor: 'MySQL 8.4.3', base: 'temporal aislada; eliminada al terminar', resultado: 'PASS', checks };
  await writeFile('docs/evaluacion3-integracion.json', JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser?.close();
  for (const p of processes.reverse()) {
    if (p.exitCode === null) { p.kill(); await new Promise(resolve => { p.once('exit', resolve); setTimeout(resolve, 5000); }); }
  }
  if (creada && /^zona_bikers_test_[a-f0-9]{12}$/.test(database)) sql('DROP DATABASE `' + database + '`');
}
