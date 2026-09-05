# Both AI - v1 API Documentation

## Overview
Both AI v1 is a complete and operational AI-powered service providing RESTful API endpoints for intelligent processing.

## Base URL
```
http://localhost:3000/api/v1
```

## Endpoints

### Health Check
**GET** `/health`

Check if the service is running.

**Response:**
```json
{
  "status": "OK",
  "version": "1.0.0",
  "timestamp": "2026-09-05T12:00:00.000Z"
}
```

---

### Service Status
**GET** `/api/v1/status`

Get current service status and version.

**Response:**
```json
{
  "service": "Both AI",
  "version": "1.0.0",
  "status": "operational",
  "environment": "development"
}
```

---

### Process Input
**POST** `/api/v1/process`

Process input data through Both AI.

**Request:**
```json
{
  "input": "your data here"
}
```

**Response:**
```json
{
  "success": true,
  "input": "your data here",
  "processed": true,
  "timestamp": "2026-09-05T12:00:00.000Z"
}
```

**Error Response (400):**
```json
{
  "error": "Input is required"
}
```

---

## Error Handling

All errors follow this format:
```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

**HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

---

## Authentication
Currently, no authentication is required. Future versions may implement API keys.

---

## Rate Limiting
No rate limiting in v1. To be implemented in v2.

---

## Changelog

### v1.0.0
- ✅ Initial release
- ✅ Health check endpoint
- ✅ Service status endpoint
- ✅ Process endpoint
- ✅ Error handling
- ✅ Environment configuration

---

**Last Updated:** 2026-09-05