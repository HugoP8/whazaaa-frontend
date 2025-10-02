# 📡 Documentación Completa de APIs - Whazaaa Frontend

**Fecha**: 2025-01-09
**Versión Frontend**: 1.0.0
**Base URL**: Configurada en `src/utils/constants.js` (API_URL)

---

## 🎯 RESUMEN EJECUTIVO PARA EL BACKEND

Este documento lista **TODAS** las APIs que el frontend está llamando actualmente. El backend debe implementar estas APIs con la estructura exacta especificada.

### ⚠️ APIs CRÍTICAS QUE FALTAN O NECESITAN REVISIÓN:

1. **`GET /campaigns/stats`** - Dashboard no muestra estadísticas
2. **`GET /whatsapp/stats/today`** - Contador de mensajes del día
3. **`GET /whatsapp/stats/last-7-days`** - Gráficos de mensajes (últimos 7 días)
4. **`GET /campaigns` con filtros** - Filtros de estado no funcionan completamente

---

## 📋 ÍNDICE DE ENDPOINTS

### 🔐 Autenticación
- `POST /auth/login`
- `POST /auth/register`
- `POST /auth/logout`
- `GET /auth/me`

### 📱 WhatsApp Connection
- `POST /whatsapp/connect`
- `POST /whatsapp/logout`
- `GET /whatsapp/status`
- `GET /whatsapp/diagnostic`

### 👥 Contactos y Grupos
- `GET /whatsapp/contacts`
- `POST /whatsapp/contacts/sync`
- `GET /whatsapp/groups`
- `GET /whatsapp/groups/:groupId/participants`

### 📧 Mensajes
- `POST /whatsapp/send-message`
- `POST /whatsapp/send-bulk`
- `GET /whatsapp/stats/today`
- `GET /whatsapp/stats/last-7-days` (FALTANTE - NECESARIO)

### 🎯 Campañas
- `GET /campaigns`
- `POST /campaigns`
- `GET /campaigns/:id`
- `PUT /campaigns/:id`
- `DELETE /campaigns/:id`
- `POST /campaigns/:id/execute`
- `POST /campaigns/:id/pause`
- `POST /campaigns/:id/resume`
- `POST /campaigns/:id/cancel`
- `GET /campaigns/:id/reuse-data`
- `POST /campaigns/reuse`
- `POST /campaigns/:id/resend`
- `POST /campaigns/:id/duplicate`
- `GET /campaigns/stats` (CRÍTICO - FALTANTE)

### 🔌 Socket.IO Events
- Eventos de conexión en tiempo real

---

## 🔐 AUTENTICACIÓN

### 1. Login de Usuario
```
POST /auth/login
```

**Request Body:**
```json
{
  "email": "usuario@email.com",
  "password": "contraseña123"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "usuario@email.com",
      "name": "Juan Pérez",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  }
}
```

**Como se usa:**
- Archivo: `src/store/modules/auth.js` - action `login`
- Guarda `token` y `user` en `localStorage`

---

### 2. Obtener Usuario Actual
```
GET /auth/me
```

**Headers:**
```
Authorization: Bearer {token}
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "usuario@email.com",
    "name": "Juan Pérez"
  }
}
```

---

### 3. Logout
```
POST /auth/logout
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Logout exitoso"
}
```

---

## 📱 WHATSAPP CONNECTION

### 4. Conectar WhatsApp
```
POST /whatsapp/connect
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Conexión iniciada",
  "data": {
    "qr": "data:image/png;base64,iVBORw0KGgoA..."
  }
}
```

**O si ya está conectado:**
```json
{
  "success": true,
  "message": "Ya está conectado a WhatsApp",
  "status": {
    "connected": true,
    "state": "connected",
    "user": {
      "id": "521234567890@s.whatsapp.net",
      "name": "Juan Pérez"
    }
  }
}
```

**Como se usa:**
- Archivo: `src/services/whatsappService.js` - método `connect()`
- Archivo: `src/store/modules/whatsapp.js` - action `connect`

---

### 5. Obtener Estado de Conexión
```
GET /whatsapp/status
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "connected": true,
    "state": "connected",
    "user": {
      "id": "521234567890@s.whatsapp.net",
      "name": "Juan Pérez",
      "profilePicUrl": "https://..."
    }
  }
}
```

**Como se usa:**
- Archivo: `src/services/whatsappService.js` - método `getStatus()`
- Archivo: `src/store/modules/whatsapp.js` - action `checkStatus`
- Componente: `src/views/dashboard/DashboardView.vue` - onMounted

---

### 6. Desconectar WhatsApp
```
POST /whatsapp/logout
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "WhatsApp desconectado exitosamente"
}
```

---

### 7. Diagnóstico del Sistema
```
GET /whatsapp/diagnostic
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "whatsappConnected": true,
    "socketConnected": true,
    "serverTime": "2025-01-09T12:00:00.000Z",
    "uptime": 3600,
    "version": "1.0.0"
  }
}
```

---

## 👥 CONTACTOS Y GRUPOS

### 8. Obtener Contactos
```
GET /whatsapp/contacts
```

**Response Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "521234567890@c.us",
      "name": "Juan Pérez",
      "phone": "521234567890",
      "profilePicUrl": "https://...",
      "isMyContact": true
    }
  ]
}
```

**Como se usa:**
- Archivo: `src/services/whatsappService.js` - método `getContacts()`
- Archivo: `src/store/modules/whatsapp.js` - action `fetchContacts`
- Componente: `src/views/campaigns/NewCampaignView.vue` - onMounted

---

### 9. Obtener Grupos
```
GET /whatsapp/groups
```

**Response Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "123456789@g.us",
      "subject": "Mi Grupo de WhatsApp",
      "description": "Descripción del grupo",
      "owner": "521234567890@s.whatsapp.net",
      "participantJids": [
        "521234567890@s.whatsapp.net",
        "520987654321@s.whatsapp.net"
      ],
      "participants": 15,
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

**⚠️ IMPORTANTE:**
- El campo `participantJids` es un array de JIDs de participantes
- El campo `participants` es el número total de participantes
- Ambos campos son necesarios para el frontend

**Como se usa:**
- Archivo: `src/services/whatsappService.js` - método `getGroups()`
- Archivo: `src/store/modules/whatsapp.js` - action `fetchGroups`
- Componente: `src/views/campaigns/NewCampaignView.vue` - onMounted

---

### 10. Obtener Participantes de un Grupo
```
GET /whatsapp/groups/:groupId/participants
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "groupId": "123456789@g.us",
    "participantJids": [
      "521234567890@s.whatsapp.net",
      "520987654321@s.whatsapp.net"
    ],
    "total": 2
  }
}
```

---

### 11. Sincronizar Contactos
```
POST /whatsapp/contacts/sync
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Contactos sincronizados",
  "data": {
    "total": 150,
    "new": 5,
    "updated": 10
  }
}
```

---

## 📧 MENSAJES

### 12. Enviar Mensaje Individual
```
POST /whatsapp/send-message
```

**Request Body:**
```json
{
  "to": "521234567890@s.whatsapp.net",
  "message": "Hola, este es un mensaje de prueba",
  "mediaPath": "/uploads/image.jpg" // opcional
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Mensaje enviado exitosamente",
  "data": {
    "messageId": "3EB0123456789ABCDEF",
    "timestamp": "2025-01-09T12:00:00.000Z"
  }
}
```

---

### 13. Enviar Mensajes Masivos
```
POST /whatsapp/send-bulk
```

**Request Body:**
```json
{
  "messages": [
    {
      "to": "521234567890@s.whatsapp.net",
      "message": "Mensaje personalizado 1"
    },
    {
      "to": "520987654321@s.whatsapp.net",
      "message": "Mensaje personalizado 2"
    }
  ],
  "options": {
    "delay": 5000,
    "batchSize": 10
  }
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Envío masivo iniciado",
  "data": {
    "total": 100,
    "queued": 100,
    "batchSize": 10
  }
}
```

---

### 14. Estadísticas de Mensajes del Día (⚠️ CRÍTICO - IMPLEMENTAR)
```
GET /whatsapp/stats/today
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "todayCount": 45,
    "monthlyLimit": 300,
    "percentage": 15.0,
    "remaining": 255
  }
}
```

**Como se usa:**
- Archivo: `src/services/whatsappService.js` - método `getTodayStats()`
- Archivo: `src/store/modules/whatsapp.js` - action `fetchTodayMessagesStats`
- Componente: `src/components/layout/NavigationDrawer.vue` - onMounted

**⚠️ ESTADO ACTUAL:** No implementado - muestra valores por defecto (0/300)

---

### 15. Estadísticas de Mensajes Últimos 7 Días (⚠️ CRÍTICO - IMPLEMENTAR)
```
GET /whatsapp/stats/last-7-days
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "chartData": {
      "labels": ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
      "datasets": [
        {
          "label": "Mensajes Enviados",
          "data": [45, 67, 89, 120, 98, 76, 54],
          "backgroundColor": "rgba(37, 211, 102, 0.2)",
          "borderColor": "rgb(37, 211, 102)",
          "borderWidth": 2
        }
      ]
    },
    "totalSent": 549,
    "avgPerDay": 78.4,
    "peakDay": "Jue"
  }
}
```

**Como se usa:**
- Componente: `src/views/dashboard/DashboardView.vue` - sección de gráficos

**⚠️ ESTADO ACTUAL:** No implementado - muestra placeholder

---

## 🎯 CAMPAÑAS

### 16. Listar Campañas
```
GET /campaigns
```

**Query Parameters:**
```
?page=1&perPage=20&status=COMPLETED&search=nombre&sortBy=createdAt&sortOrder=desc
```

**Response Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Campaña de Promoción",
      "message": "Hola {nombre}, tenemos una oferta especial...",
      "status": "COMPLETED",
      "type": "contacts",
      "total_recipients": 100,
      "sent_count": 98,
      "success_count": 95,
      "failed_count": 3,
      "success_percentage": 97.0,
      "created_at": "2025-01-09T10:00:00.000Z",
      "scheduled_at": null,
      "started_at": "2025-01-09T10:05:00.000Z",
      "completed_at": "2025-01-09T10:15:00.000Z",
      "duration_seconds": 600,
      "display_date": "2025-01-09T10:15:00.000Z",
      "mediaPath": "/uploads/promo.jpg",
      "delay": 5000
    }
  ],
  "pagination": {
    "page": 1,
    "perPage": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

**⚠️ IMPORTANTE - Campos requeridos por el frontend:**
- `display_date` - Fecha principal a mostrar (prioridad: completed_at > scheduled_at > created_at)
- `duration_seconds` - Duración de la campaña en segundos
- `success_percentage` - Porcentaje de éxito calculado

**Como se usa:**
- Archivo: `src/store/modules/campaigns.js` - action `fetchCampaigns`
- Componente: `src/views/campaigns/CampaignsView.vue`

---

### 17. Crear Campaña
```
POST /campaigns
Content-Type: multipart/form-data
```

**Form Data:**
```
name: "Mi Campaña"
message: "Hola, este es un mensaje..."
recipients: ["521234567890@s.whatsapp.net", "520987654321@s.whatsapp.net"]
type: "contacts" | "groups" | "mixed"
delay: 5000
media: [FILE] // opcional
contactRecipients: [] // si type=mixed
groupRecipients: [] // si type=mixed
existingMediaPath: "/uploads/old-image.jpg" // si reutiliza archivo existente
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Campaña creada exitosamente",
  "data": {
    "id": 25,
    "name": "Mi Campaña",
    "status": "PENDING",
    "total_recipients": 50
  }
}
```

**Como se usa:**
- Archivo: `src/services/whatsappService.js` - método `createCampaign()`
- Archivo: `src/store/modules/whatsapp.js` - action `createCampaign`
- Componente: `src/views/campaigns/NewCampaignView.vue` - handleSubmit

---

### 18. Ejecutar Campaña
```
POST /campaigns/:id/execute
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Campaña iniciada exitosamente",
  "data": {
    "campaignId": 25,
    "status": "IN_PROGRESS",
    "totalRecipients": 50
  }
}
```

**Como se usa:**
- Archivo: `src/services/whatsappService.js` - método `executeCampaign()`
- Archivo: `src/store/modules/whatsapp.js` - action `executeCampaign`

---

### 19. Cancelar Campaña
```
POST /campaigns/:id/cancel
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Campaña cancelada exitosamente",
  "data": {
    "campaignId": 25,
    "status": "CANCELLED",
    "sentCount": 23,
    "totalRecipients": 50
  }
}
```

**Como se usa:**
- Archivo: `src/store/modules/whatsapp.js` - action `cancelCampaign`
- Componente: `src/views/campaigns/CampaignsView.vue` - cancelCampaign

---

### 20. Obtener Datos para Reutilizar Campaña
```
GET /campaigns/:id/reuse-data
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "campaignData": {
      "name": "Campaña Original",
      "message": "Mensaje original...",
      "delay": 5000,
      "type": "groups",
      "mediaPath": "/uploads/image.jpg",
      "recipients": [
        {
          "jid": "123456789@g.us",
          "name": "Grupo 1"
        }
      ]
    },
    "metadata": {
      "originalName": "Campaña Original",
      "mediaStatus": "available",
      "recipientCount": 50
    }
  }
}
```

**Como se usa:**
- Archivo: `src/store/modules/campaigns.js` - action `getCampaignReuseData`
- Componente: `src/components/campaigns/ReuseCampaignModal.vue`

---

### 21. Reenviar Campaña
```
POST /campaigns/:id/resend
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Campaña reenviada exitosamente",
  "data": {
    "campaignId": 26,
    "originalCampaignId": 25,
    "async": true,
    "note": "La campaña se ejecutará en segundo plano"
  }
}
```

**Como se usa:**
- Archivo: `src/store/modules/campaigns.js` - action `resendCampaign`
- Componente: `src/components/campaigns/ResendConfirmModal.vue`

---

### 22. Duplicar Campaña
```
POST /campaigns/:id/duplicate
```

**Request Body:**
```json
{
  "newName": "Copia de Mi Campaña"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Campaña duplicada exitosamente",
  "data": {
    "id": 27,
    "name": "Copia de Mi Campaña",
    "status": "DRAFT"
  }
}
```

---

### 23. Estadísticas de Campañas (⚠️ CRÍTICO - IMPLEMENTAR)
```
GET /campaigns/stats
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "totalCampaigns": 150,
    "completedCampaigns": 120,
    "activeCampaigns": 5,
    "pausedCampaigns": 3,
    "failedCampaigns": 7,
    "messageStats": {
      "totalSent": 50000,
      "successful": 48500,
      "failed": 1500
    },
    "avgMessagesPerCampaign": 333,
    "totalContacts": 500,
    "totalGroups": 25,
    "lastCampaignDate": "2025-01-09T10:00:00.000Z",
    "chartData": {
      "labels": ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
      "datasets": [
        {
          "label": "Mensajes Enviados",
          "data": [450, 670, 890, 1200, 980, 760, 540],
          "backgroundColor": "rgba(37, 211, 102, 0.2)",
          "borderColor": "rgb(37, 211, 102)"
        }
      ]
    }
  }
}
```

**Como se usa:**
- Archivo: `src/store/modules/campaigns.js` - action `fetchCampaignStats`
- Componente: `src/views/dashboard/DashboardView.vue` - loadCampaignStats

**⚠️ ESTADO ACTUAL:** No implementado correctamente - Dashboard muestra 0 en todas las estadísticas

---

## 🔌 SOCKET.IO EVENTS

### Eventos que el Frontend Escucha:

**Namespace:** `/` (default)
**Connection Query:** `{ userId: 1 }`

#### 1. `qr`
Cuando se genera un nuevo QR para conectar WhatsApp.

**Data:**
```json
{
  "qr": "data:image/png;base64,iVBORw0KGgoA...",
  "userId": 1,
  "timestamp": "2025-01-09T12:00:00.000Z"
}
```

**Como se usa:**
- `src/store/modules/whatsapp.js` - setupWhatsAppEvents - onQR

---

#### 2. `whatsapp-ready`
Cuando WhatsApp se conecta exitosamente.

**Data:**
```json
{
  "connected": true,
  "user": {
    "id": "521234567890@s.whatsapp.net",
    "name": "Juan Pérez"
  }
}
```

---

#### 3. `whatsapp-disconnected`
Cuando WhatsApp se desconecta.

**Data:**
```json
{
  "connected": false,
  "reason": "logout"
}
```

---

#### 4. `campaign-progress`
Progreso en tiempo real de una campaña.

**Data:**
```json
{
  "campaignId": 25,
  "sent": 45,
  "total": 100,
  "percentage": 45.0,
  "currentRecipient": "521234567890@s.whatsapp.net"
}
```

**Como se usa:**
- `src/views/campaigns/CampaignsView.vue` - handleCampaignProgress

---

#### 5. `campaign-completed`
Cuando una campaña termina.

**Data:**
```json
{
  "campaignId": 25,
  "status": "COMPLETED",
  "successCount": 98,
  "failedCount": 2,
  "totalCount": 100,
  "duration": 600
}
```

**Como se usa:**
- `src/views/campaigns/CampaignsView.vue` - handleCampaignCompleted

---

#### 6. `campaign-error`
Cuando hay un error en una campaña.

**Data:**
```json
{
  "campaignId": 25,
  "error": "Error de conexión WhatsApp",
  "timestamp": "2025-01-09T12:00:00.000Z"
}
```

---

#### 7. `connection-status`
Estado de conexión de WhatsApp.

**Data:**
```json
{
  "connected": true,
  "state": "connected",
  "user": {
    "id": "521234567890@s.whatsapp.net",
    "name": "Juan Pérez"
  }
}
```

---

## 🚨 PRIORIDADES DE IMPLEMENTACIÓN

### ⚠️ ALTA PRIORIDAD (Funcionalidad Rota):

1. **`GET /campaigns/stats`**
   - El Dashboard no muestra estadísticas
   - Muestra todo en 0
   - Archivo afectado: `src/views/dashboard/DashboardView.vue`

2. **`GET /whatsapp/stats/today`**
   - El menú lateral no muestra contador de mensajes del día
   - Archivo afectado: `src/components/layout/NavigationDrawer.vue`

3. **`GET /whatsapp/stats/last-7-days`**
   - El gráfico de mensajes no se muestra
   - Archivo afectado: `src/views/dashboard/DashboardView.vue`

4. **Filtros en `GET /campaigns`**
   - Los filtros de estado no funcionan completamente
   - Archivo afectado: `src/views/campaigns/CampaignsView.vue`

### ✅ MEDIA PRIORIDAD (Mejoras):

1. **Socket.IO Events**
   - Verificar que todos los eventos se emitan correctamente
   - Especialmente `campaign-progress` y `campaign-completed`

2. **`GET /whatsapp/groups`**
   - Asegurar que `participantJids` esté poblado
   - No solo enviar el número de participantes

### ℹ️ BAJA PRIORIDAD (Funcional):

- Todas las demás APIs están implementadas y funcionando

---

## 📝 NOTAS ADICIONALES

### Manejo de Errores

Todas las respuestas de error deben seguir este formato:

```json
{
  "success": false,
  "error": "Mensaje de error descriptivo",
  "code": "ERROR_CODE",
  "details": {} // opcional
}
```

### Autenticación

Todas las APIs (excepto `/auth/*`) requieren el header:
```
Authorization: Bearer {token}
```

### Rate Limiting

El frontend tiene timeouts configurados:
- APIs normales: 30 segundos
- APIs de campañas: 60 segundos
- Socket.IO: 15 segundos

### CORS

El backend debe permitir:
- `Origin`: El dominio del frontend
- `Methods`: GET, POST, PUT, DELETE
- `Headers`: Authorization, Content-Type

---

## 🎨 MEJORAS PRÓXIMAS

El frontend está implementando:

1. ✅ Modales modernos en lugar de alerts
2. ✅ Mejor manejo de hover en botones
3. ✅ Menú más intuitivo (cierre al hacer clic fuera)
4. ✅ Toast notifications modernizadas
5. ✅ Cambio de nombre de app a "Whazaaa"

---

**Fin del documento**
**Cualquier duda sobre la estructura de las APIs, consultar este documento.**
