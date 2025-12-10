# 🚨 ORDEN COMPLETA PARA EL EQUIPO DE BACKEND - PANEL ADMIN

**Prioridad:** URGENTE
**Fecha:** 2024-12-09
**Para:** Equipo de Backend
**De:** Frontend Team

---

## 📋 RESUMEN EJECUTIVO

El panel de administración frontend está 100% completo y funcional. Necesitamos que implementen las siguientes APIs para que el panel funcione completamente.

**Estado actual:**
- ✅ Frontend completamente desarrollado
- ✅ Todas las vistas funcionando
- ✅ Manejo de errores implementado
- ❌ APIs del backend faltantes o con estructura incorrecta

---

## 🔴 APIS URGENTES - SPRINT 1 (Implementar esta semana)

### 1. 🔧 ARREGLAR: `GET /api/admin/users`

**Problema:** La estructura actual no coincide con lo que necesita el frontend.

**URL:** `GET /api/admin/users`

**Query Parameters:**
```javascript
{
  page: 1,           // Número de página (default: 1)
  limit: 20,         // Items por página (default: 20)
  search: "email",   // Buscar por email o nombre (opcional)
  role: "user",      // Filtrar por rol: user|admin|superadmin (opcional)
  status: "active"   // Filtrar por estado suscripción (opcional)
}
```

**Response REQUERIDO:**
```json
{
  "success": true,
  "users": [
    {
      "id": 1,
      "email": "user@example.com",
      "name": "Juan Pérez",
      "role": "user",
      "plan_name": "pro",
      "plan_display_name": "Plan Profesional",
      "subscription_id": 123,
      "subscription_status": "active",
      "membership_status_display": "Activo",
      "subscription_expires": "2025-01-09T00:00:00Z",
      "days_remaining": 30,
      "total_campaigns": 15,
      "total_messages_sent": 450,
      "total_spent": "74.97",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "total_pages": 5
  }
}
```

**SQL Query Ejemplo:**
```sql
SELECT
  u.id,
  u.email,
  u.name,
  u.role,
  u.created_at,
  s.id as subscription_id,
  p.name as plan_name,
  p.display_name as plan_display_name,
  s.status as subscription_status,
  s.expires_at as subscription_expires,
  DATEDIFF(s.expires_at, NOW()) as days_remaining,
  COALESCE(cs.total_campaigns, 0) as total_campaigns,
  COALESCE(cs.total_messages_sent, 0) as total_messages_sent,
  COALESCE(ps.total_spent, 0) as total_spent
FROM users u
LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status = 'active'
LEFT JOIN plans p ON s.plan_id = p.id
LEFT JOIN (
  SELECT user_id, COUNT(*) as total_campaigns, SUM(messages_sent) as total_messages_sent
  FROM campaigns
  GROUP BY user_id
) cs ON u.id = cs.user_id
LEFT JOIN (
  SELECT user_id, SUM(amount) as total_spent
  FROM payments
  WHERE status = 'completed'
  GROUP BY user_id
) ps ON u.id = ps.user_id
WHERE 1=1
  AND (? IS NULL OR u.email LIKE CONCAT('%', ?, '%') OR u.name LIKE CONCAT('%', ?, '%'))
  AND (? IS NULL OR u.role = ?)
  AND (? IS NULL OR s.status = ?)
ORDER BY u.created_at DESC
LIMIT ? OFFSET ?
```

**Notas Importantes:**
- `days_remaining` debe calcularse como días entre `expires_at` y `NOW()`
- Si no hay suscripción activa, `plan_name` debe ser `'free'`
- `total_spent` debe sumar solo pagos con `status = 'completed'`

---

### 2. ⭐ NUEVA: `POST /api/admin/users/:userId/change-plan`

**Descripción:** Cambiar el plan de un usuario SIN PROCESAR PAGO. El admin asigna el plan manualmente.

**URL:** `POST /api/admin/users/:userId/change-plan`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "plan_name": "pro",
  "duration_months": 3
}
```

**Response:**
```json
{
  "success": true,
  "message": "Plan cambiado exitosamente a Plan Profesional por 3 meses",
  "subscription": {
    "id": 456,
    "user_id": 1,
    "plan_id": 2,
    "plan_name": "pro",
    "plan_display_name": "Plan Profesional",
    "status": "active",
    "started_at": "2024-12-09T00:00:00Z",
    "expires_at": "2025-03-09T00:00:00Z",
    "duration_months": 3,
    "payment_method": "manual_admin",
    "amount_paid": 0.00
  }
}
```

**Lógica de Implementación:**

```javascript
// Pseudocódigo Node.js/Express
async function changeUserPlan(req, res) {
  const { userId } = req.params
  const { plan_name, duration_months } = req.body

  // 1. Validar que el usuario que hace la petición sea admin
  if (!req.user.isAdmin()) {
    return res.status(403).json({ error: 'No autorizado' })
  }

  // 2. Buscar el plan
  const plan = await Plan.findOne({ where: { name: plan_name } })
  if (!plan) {
    return res.status(404).json({ error: 'Plan no encontrado' })
  }

  // 3. Buscar usuario
  const user = await User.findByPk(userId)
  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado' })
  }

  // 4. Calcular fecha de expiración
  const startDate = new Date()
  const expiryDate = new Date(startDate)
  expiryDate.setMonth(expiryDate.getMonth() + duration_months)

  // 5. Cancelar suscripción activa si existe
  await Subscription.update(
    { status: 'cancelled' },
    { where: { user_id: userId, status: 'active' } }
  )

  // 6. Crear nueva suscripción
  const subscription = await Subscription.create({
    user_id: userId,
    plan_id: plan.id,
    status: 'active',
    started_at: startDate,
    expires_at: expiryDate,
    duration_months: duration_months,
    payment_method: 'manual_admin',
    amount_paid: 0.00,
    assigned_by_admin: req.user.id
  })

  // 7. Registrar log de cambio
  await AdminLog.create({
    admin_id: req.user.id,
    action: 'change_user_plan',
    target_user_id: userId,
    details: {
      plan_name,
      duration_months,
      expires_at: expiryDate
    }
  })

  // 8. Retornar respuesta
  return res.json({
    success: true,
    message: `Plan cambiado exitosamente a ${plan.display_name} por ${duration_months} meses`,
    subscription: {
      id: subscription.id,
      user_id: userId,
      plan_id: plan.id,
      plan_name: plan.name,
      plan_display_name: plan.display_name,
      status: subscription.status,
      started_at: subscription.started_at,
      expires_at: subscription.expires_at,
      duration_months: duration_months,
      payment_method: 'manual_admin',
      amount_paid: 0.00
    }
  })
}
```

**Validaciones:**
- ✅ Verificar que `plan_name` exista en la tabla `plans`
- ✅ Verificar que `duration_months` sea mayor a 0
- ✅ El usuario debe ser admin o superadmin
- ✅ Cancelar suscripción anterior si existe
- ✅ Registrar en logs para auditoría

**Estructura de Tabla Recomendada:**
```sql
ALTER TABLE subscriptions ADD COLUMN duration_months INT DEFAULT 1;
ALTER TABLE subscriptions ADD COLUMN payment_method VARCHAR(50) DEFAULT 'stripe';
ALTER TABLE subscriptions ADD COLUMN amount_paid DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE subscriptions ADD COLUMN assigned_by_admin INT NULL;
```

---

### 3. ⭐ NUEVA: `POST /api/admin/users/:userId/extend-subscription`

**Descripción:** Extender la suscripción actual del usuario por X días.

**URL:** `POST /api/admin/users/:userId/extend-subscription`

**Request Body:**
```json
{
  "days": 30
}
```

**Response:**
```json
{
  "success": true,
  "message": "Membresía extendida 30 días exitosamente",
  "subscription": {
    "id": 123,
    "expires_at": "2025-02-08T00:00:00Z",
    "days_remaining": 90,
    "extended_by_admin": true
  }
}
```

**Lógica de Implementación:**

```javascript
async function extendUserSubscription(req, res) {
  const { userId } = req.params
  const { days } = req.body

  // 1. Validar admin
  if (!req.user.isAdmin()) {
    return res.status(403).json({ error: 'No autorizado' })
  }

  // 2. Buscar suscripción activa
  const subscription = await Subscription.findOne({
    where: { user_id: userId, status: 'active' }
  })

  if (!subscription) {
    return res.status(404).json({
      error: 'No hay suscripción activa para extender'
    })
  }

  // 3. Extender fecha de expiración
  const currentExpiry = new Date(subscription.expires_at)
  const newExpiry = new Date(currentExpiry)
  newExpiry.setDate(newExpiry.getDate() + days)

  await subscription.update({ expires_at: newExpiry })

  // 4. Registrar log
  await AdminLog.create({
    admin_id: req.user.id,
    action: 'extend_subscription',
    target_user_id: userId,
    details: { days, new_expiry: newExpiry }
  })

  // 5. Calcular días restantes
  const daysRemaining = Math.ceil(
    (newExpiry - new Date()) / (1000 * 60 * 60 * 24)
  )

  return res.json({
    success: true,
    message: `Membresía extendida ${days} días exitosamente`,
    subscription: {
      id: subscription.id,
      expires_at: newExpiry,
      days_remaining: daysRemaining,
      extended_by_admin: true
    }
  })
}
```

---

### 4. ⭐ NUEVA: `PUT /api/admin/users/:userId/role`

**Descripción:** Cambiar el rol de un usuario.

**URL:** `PUT /api/admin/users/:userId/role`

**Request Body:**
```json
{
  "role": "admin"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Rol actualizado correctamente",
  "user": {
    "id": 5,
    "email": "user@example.com",
    "role": "admin",
    "role_updated_at": "2024-12-09T10:30:00Z"
  }
}
```

**Lógica de Implementación:**

```javascript
async function updateUserRole(req, res) {
  const { userId } = req.params
  const { role } = req.body

  // 1. Validaciones
  if (!req.user.isAdmin()) {
    return res.status(403).json({ error: 'No autorizado' })
  }

  if (!['user', 'admin', 'superadmin'].includes(role)) {
    return res.status(400).json({ error: 'Rol inválido' })
  }

  // Solo superadmin puede crear superadmin
  if (role === 'superadmin' && !req.user.isSuperAdmin()) {
    return res.status(403).json({
      error: 'Solo superadmin puede asignar rol de superadmin'
    })
  }

  // No puede cambiar su propio rol
  if (parseInt(userId) === req.user.id) {
    return res.status(400).json({
      error: 'No puedes cambiar tu propio rol'
    })
  }

  // 2. Buscar usuario
  const user = await User.findByPk(userId)
  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado' })
  }

  // 3. Actualizar rol
  await user.update({
    role,
    role_updated_at: new Date()
  })

  // 4. Registrar log
  await AdminLog.create({
    admin_id: req.user.id,
    action: 'change_user_role',
    target_user_id: userId,
    details: { old_role: user.role, new_role: role }
  })

  return res.json({
    success: true,
    message: 'Rol actualizado correctamente',
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      role_updated_at: user.role_updated_at
    }
  })
}
```

---

## 🟡 APIS ALTA PRIORIDAD - SPRINT 2

### 5. `GET /api/admin/users/:userId`

**Descripción:** Obtener detalles completos de un usuario.

**Response:**
```json
{
  "success": true,
  "data": {
    "user_info": {
      "id": 1,
      "email": "user@example.com",
      "name": "Juan Pérez",
      "role": "user",
      "created_at": "2024-01-01T00:00:00Z",
      "last_login": "2024-12-09T08:00:00Z"
    },
    "subscription": {
      "id": 123,
      "plan_name": "pro",
      "plan_display_name": "Plan Profesional",
      "status": "active",
      "started_at": "2024-11-01T00:00:00Z",
      "expires_at": "2025-01-01T00:00:00Z",
      "days_remaining": 23,
      "payment_method": "stripe",
      "amount_paid": "24.99"
    },
    "statistics": {
      "total_campaigns": 15,
      "active_campaigns": 2,
      "completed_campaigns": 13,
      "total_messages_sent": 450,
      "total_messages_failed": 10,
      "total_spent": "74.97"
    },
    "recent_campaigns": [
      {
        "id": 45,
        "name": "Campaña Navidad",
        "status": "completed",
        "messages_sent": 100,
        "created_at": "2024-12-01T00:00:00Z"
      }
    ],
    "payment_history": [
      {
        "id": 789,
        "amount": "24.99",
        "plan": "Plan Profesional",
        "status": "completed",
        "paid_at": "2024-11-01T00:00:00Z"
      }
    ]
  }
}
```

---

### 6. `GET /api/admin/subscriptions`

**Descripción:** Listar todas las suscripciones del sistema.

**Query Parameters:**
```javascript
{
  page: 1,
  limit: 20,
  search: "email",
  plan: "pro",        // free|pro|business
  status: "active"    // active|cancelled|expired|suspended
}
```

**Response:**
```json
{
  "success": true,
  "subscriptions": [
    {
      "id": 123,
      "user_id": 1,
      "user_email": "user@example.com",
      "user_name": "Juan Pérez",
      "plan_name": "pro",
      "plan_display_name": "Plan Profesional",
      "price": "24.99",
      "status": "active",
      "started_at": "2024-11-01T00:00:00Z",
      "expires_at": "2025-01-01T00:00:00Z",
      "days_remaining": 23,
      "payment_method": "stripe",
      "auto_renew": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "total_pages": 3
  }
}
```

---

### 7. `GET /api/admin/subscriptions/stats`

**Descripción:** Estadísticas de suscripciones.

**Response:**
```json
{
  "success": true,
  "stats": {
    "active": 45,
    "expiring": 5,
    "expired": 10,
    "cancelled": 8,
    "by_plan": {
      "free": 30,
      "pro": 35,
      "business": 20
    },
    "revenue_month": "1249.50",
    "revenue_total": "12495.00"
  }
}
```

**SQL Ejemplo:**
```sql
SELECT
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
  COUNT(CASE WHEN status = 'active' AND DATEDIFF(expires_at, NOW()) <= 7 THEN 1 END) as expiring,
  COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired,
  COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled
FROM subscriptions;
```

---

### 8. `PUT /api/admin/subscriptions/:subscriptionId/status`

**Descripción:** Cambiar el estado de una suscripción.

**Request Body:**
```json
{
  "status": "suspended"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Estado actualizado exitosamente",
  "subscription": {
    "id": 123,
    "status": "suspended",
    "updated_at": "2024-12-09T10:30:00Z"
  }
}
```

**Estados Permitidos:**
- `active` - Suscripción activa
- `cancelled` - Cancelada por usuario o admin
- `suspended` - Suspendida temporalmente por admin
- `expired` - Expirada automáticamente

---

## 🟢 APIS MEDIA PRIORIDAD - SPRINT 3

### 9. `GET /api/admin/subscriptions/expiring-soon`

**Query Parameters:**
```javascript
{ days: 7 }  // Default 7 días
```

**Response:**
```json
{
  "success": true,
  "expiring_count": 5,
  "subscriptions": [
    {
      "id": 123,
      "user_email": "user@example.com",
      "plan_display_name": "Plan Profesional",
      "expires_at": "2024-12-15T00:00:00Z",
      "days_remaining": 6
    }
  ]
}
```

---

### 10. `GET /api/admin/plans`

**Response:**
```json
{
  "success": true,
  "plans": [
    {
      "id": 1,
      "name": "free",
      "display_name": "Plan Gratuito",
      "price": "0.00",
      "billing_period": "monthly",
      "daily_message_limit": 10,
      "monthly_message_limit": 100,
      "max_campaigns": 1,
      "max_whatsapp_accounts": 1,
      "features": ["feature1", "feature2"],
      "is_active": true
    }
  ]
}
```

---

### 11. `GET /api/admin/reports/financial`

**Query Parameters:**
```javascript
{
  start_date: "2024-01-01",
  end_date: "2024-12-31"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_revenue": "12495.00",
    "total_transactions": 150,
    "revenue_by_plan": [
      {
        "plan_name": "pro",
        "plan_display_name": "Plan Profesional",
        "revenue": "8745.00",
        "count": 105
      }
    ],
    "revenue_by_month": [
      {
        "month": "2024-12",
        "revenue": "1249.50",
        "transactions": 15
      }
    ]
  }
}
```

---

### 12. `GET /api/admin/reports/usage`

**Response:**
```json
{
  "success": true,
  "data": {
    "total_messages_sent": 15000,
    "total_campaigns": 250,
    "average_messages_per_campaign": 60,
    "usage_by_plan": [
      {
        "plan_name": "pro",
        "messages_sent": 10000,
        "campaigns": 150
      }
    ],
    "top_users": [
      {
        "user_email": "topuser@example.com",
        "messages_sent": 500,
        "campaigns": 10
      }
    ]
  }
}
```

---

## 🔐 AUTENTICACIÓN Y SEGURIDAD

### Middleware de Autenticación

```javascript
// Middleware para verificar admin
function requireAdmin(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '')

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findByPk(decoded.id)

    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' })
    }

    if (!['admin', 'superadmin'].includes(user.role)) {
      return res.status(403).json({
        error: 'No autorizado - Se requiere rol de administrador'
      })
    }

    req.user = user
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' })
  }
}

// Aplicar a todas las rutas admin
router.use('/api/admin/*', requireAdmin)
```

---

## 📊 ESTRUCTURA DE BASE DE DATOS

### Tabla: `subscriptions`

```sql
CREATE TABLE subscriptions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  plan_id INT NOT NULL,
  status ENUM('active', 'cancelled', 'expired', 'suspended') DEFAULT 'active',
  started_at DATETIME NOT NULL,
  expires_at DATETIME NOT NULL,
  duration_months INT DEFAULT 1,
  payment_method VARCHAR(50) DEFAULT 'stripe',
  amount_paid DECIMAL(10,2) DEFAULT 0.00,
  assigned_by_admin INT NULL,
  auto_renew BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (plan_id) REFERENCES plans(id),
  FOREIGN KEY (assigned_by_admin) REFERENCES users(id)
);

-- Índices
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_expires ON subscriptions(expires_at);
```

### Tabla: `admin_logs` (Auditoría)

```sql
CREATE TABLE admin_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  admin_id INT NOT NULL,
  action VARCHAR(100) NOT NULL,
  target_user_id INT NULL,
  details JSON NULL,
  ip_address VARCHAR(45) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES users(id),
  FOREIGN KEY (target_user_id) REFERENCES users(id)
);
```

---

## 🧪 TESTING

### Ejemplos con cURL

```bash
# 1. Obtener usuarios
curl -X GET 'http://localhost:3000/api/admin/users?page=1&limit=20' \
  -H 'Authorization: Bearer YOUR_ADMIN_TOKEN'

# 2. Cambiar plan de usuario
curl -X POST 'http://localhost:3000/api/admin/users/4/change-plan' \
  -H 'Authorization: Bearer YOUR_ADMIN_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "plan_name": "pro",
    "duration_months": 3
  }'

# 3. Extender suscripción
curl -X POST 'http://localhost:3000/api/admin/users/4/extend-subscription' \
  -H 'Authorization: Bearer YOUR_ADMIN_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{ "days": 30 }'

# 4. Cambiar rol
curl -X PUT 'http://localhost:3000/api/admin/users/4/role' \
  -H 'Authorization: Bearer YOUR_ADMIN_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{ "role": "admin" }'
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Sprint 1 - URGENTE (Esta semana)
- [ ] Arreglar `GET /api/admin/users` (estructura correcta)
- [ ] Implementar `POST /api/admin/users/:userId/change-plan`
- [ ] Implementar `POST /api/admin/users/:userId/extend-subscription`
- [ ] Implementar `PUT /api/admin/users/:userId/role`
- [ ] Agregar campos a tabla `subscriptions`
- [ ] Crear tabla `admin_logs`
- [ ] Implementar middleware de autenticación admin

### Sprint 2 - Alta Prioridad
- [ ] Implementar `GET /api/admin/users/:userId`
- [ ] Implementar `GET /api/admin/subscriptions`
- [ ] Implementar `GET /api/admin/subscriptions/stats`
- [ ] Implementar `PUT /api/admin/subscriptions/:id/status`

### Sprint 3 - Media Prioridad
- [ ] Implementar `GET /api/admin/subscriptions/expiring-soon`
- [ ] Implementar `GET /api/admin/plans`
- [ ] Implementar `GET /api/admin/reports/financial`
- [ ] Implementar `GET /api/admin/reports/usage`

---

## 🚨 NOTAS IMPORTANTES

1. **Sin Procesar Pagos:** La API `change-plan` NO debe procesar pagos. Es un cambio manual por el administrador.

2. **Auditoría:** Registrar TODAS las acciones de admin en `admin_logs` para trazabilidad.

3. **Validaciones:** Siempre verificar que el usuario que hace la petición sea admin/superadmin.

4. **Logs:** Agregar logs detallados en el backend para debugging.

5. **Errores:** Retornar errores descriptivos con códigos HTTP correctos.

---

## 📞 CONTACTO

Si tienen dudas sobre alguna API, consultar este documento o preguntar al equipo de frontend.

**Documentos relacionados:**
- `APIS_PANEL_ADMIN_NECESARIAS.md` - Lista completa de APIs
- `GUIA_PRUEBAS_PANEL_ADMIN.md` - Cómo probar el panel

---

**Fecha límite Sprint 1:** Viernes 13 de Diciembre 2024
**Prioridad:** 🔴 CRÍTICA

