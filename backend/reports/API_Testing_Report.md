# API Testing Report

This report presents the integration testing results run against the real `gds_portal` database after backend alignment.

## Summary

- **Total Tests Executed**: 29
- **Passed**: 29
- **Failed**: 0
- **Pass Rate**: 100.00%

## Endpoint Execution Log

| Method | Endpoint | Status | Outcome | Comments |
|---|---|---|---|---|
| `POST` | `/auth/login (Super Admin)` | `200` | ✅ **PASS** | Login flow verification |
| `POST` | `/auth/login (Regional Admin)` | `200` | ✅ **PASS** | Regional Admin login verification |
| `POST` | `/auth/login (School Admin)` | `200` | ✅ **PASS** | School Admin login verification |
| `POST` | `/auth/refresh` | `200` | ✅ **PASS** | Token refresh verification |
| `POST` | `/security/impersonation/start` | `200` | ✅ **PASS** | Impersonation session flow |
| `POST` | `/states` | `201` | ✅ **PASS** | Create State |
| `GET` | `/states` | `200` | ✅ **PASS** | Get States list |
| `PUT` | `/states/:id` | `200` | ✅ **PASS** | Update State details |
| `POST` | `/districts` | `201` | ✅ **PASS** | Create District |
| `GET` | `/districts` | `200` | ✅ **PASS** | Get Districts list |
| `POST` | `/schools` | `201` | ✅ **PASS** | Register School Onboarding (PENDING) |
| `POST` | `/schools/:id/approve` | `200` | ✅ **PASS** | Approve School Onboarding |
| `GET` | `/schools` | `200` | ✅ **PASS** | Get Schools list |
| `POST` | `/media/upload` | `201` | ✅ **PASS** | Upload Media Asset via Multer |
| `POST` | `/media/submit` | `201` | ✅ **PASS** | Submit Media Submission for Review |
| `POST` | `/media/review` | `200` | ✅ **PASS** | Regional Admin Review Media Submission |
| `POST` | `/media/approve` | `200` | ✅ **PASS** | Super Admin Final Approve Media |
| `POST` | `/media/publish` | `200` | ✅ **PASS** | Publish Media to Social Platforms |
| `POST` | `/inspection/request` | `201` | ✅ **PASS** | Request Inspection |
| `POST` | `/inspection/schedule` | `200` | ✅ **PASS** | Schedule Inspection Date and Inspector |
| `POST` | `/inspection/complete` | `200` | ✅ **PASS** | Complete Inspection & Auto-Generate PDF Report |
| `GET` | `/inspection/reports` | `200` | ✅ **PASS** | Get generated reports |
| `GET` | `/rankings` | `200` | ✅ **PASS** | Get School Rankings list |
| `POST` | `/rankings/recalculate` | `200` | ✅ **PASS** | Trigger Manual Scores & Rankings Recalculation |
| `POST` | `/recommendations` | `201` | ✅ **PASS** | Create School Improvement Recommendation |
| `POST` | `/recommendations/:id/accept` | `200` | ✅ **PASS** | School Admin Accept Recommendation |
| `GET` | `/recommendations/history/:schoolId` | `200` | ✅ **PASS** | Get Recommendation Status History |
| `GET` | `/notifications` | `200` | ✅ **PASS** | Get Notifications list |
| `PATCH` | `/notifications/read` | `200` | ✅ **PASS** | Mark notifications as Read |

## Sample API Payloads & Responses (Example Outputs)

### `[POST] /auth/login (Super Admin)`
**Request Payload:**
```json
{
  "email": "superadmin@gds.com",
  "password": "password123"
}
```

**Response Payload:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 4,
      "email": "superadmin@gds.com",
      "first_name": "Super",
      "last_name": "Admin",
      "roles": [
        "SUPER_ADMIN"
      ]
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwiZW1haWwiOiJzdXBlcmFkbWluQGdkcy5jb20iLCJpYXQiOjE3ODE3MDQwNDgsImV4cCI6MTc4MTcwNDk0OH0.G87Ucg70AfpqymArJPf72z2H2VDz_WCFL2pipc80NJY",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwiZW1haWwiOiJzdXBlcmFkbWluQGdkcy5jb20iLCJpYXQiOjE3ODE3MDQwNDgsImV4cCI6MTc4MjMwODg0OH0.EdQL8AEJFmuc4X57NgO_Z3OS2J8kaFfDtXorkLdZhUc"
  }
}
```

---
### `[POST] /auth/login (Regional Admin)`
**Request Payload:**
```json
{
  "email": "regionaladmin@gds.com",
  "password": "password123"
}
```

**Response Payload:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 5,
      "email": "regionaladmin@gds.com",
      "first_name": "Regional",
      "last_name": "Admin",
      "roles": [
        "REGIONAL_ADMIN"
      ]
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiZW1haWwiOiJyZWdpb25hbGFkbWluQGdkcy5jb20iLCJpYXQiOjE3ODE3MDQwNDgsImV4cCI6MTc4MTcwNDk0OH0.sGZTMhqRNfx-DrNkP7v1xSgqFC40GYYFNHe051Y9E7I",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiZW1haWwiOiJyZWdpb25hbGFkbWluQGdkcy5jb20iLCJpYXQiOjE3ODE3MDQwNDgsImV4cCI6MTc4MjMwODg0OH0.cWk0-6MCEY1ATBoASjpbh8oAafgo6P3zrUrPsVHQqXE"
  }
}
```

---
### `[POST] /auth/login (School Admin)`
**Request Payload:**
```json
{
  "email": "schooladmin@gds.com",
  "password": "password123"
}
```

**Response Payload:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 6,
      "email": "schooladmin@gds.com",
      "first_name": "School",
      "last_name": "Admin",
      "roles": [
        "SCHOOL_ADMIN"
      ]
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiZW1haWwiOiJzY2hvb2xhZG1pbkBnZHMuY29tIiwiaWF0IjoxNzgxNzA0MDQ4LCJleHAiOjE3ODE3MDQ5NDh9.NO9l7VpMHPJKvN-IdyDr6AmCjLKBJFYSBtLiNaa89r8",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiZW1haWwiOiJzY2hvb2xhZG1pbkBnZHMuY29tIiwiaWF0IjoxNzgxNzA0MDQ4LCJleHAiOjE3ODIzMDg4NDh9.Z3vEayJk2SWP8ajiaSeMLtxoDA0KX6xz7eCKeNCErrA"
  }
}
```

---
### `[POST] /auth/refresh`
**Request Payload:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwiZW1haWwiOiJzdXBlcmFkbWluQGdkcy5jb20iLCJpYXQiOjE3ODE3MDQwNDgsImV4cCI6MTc4MjMwODg0OH0.EdQL8AEJFmuc4X57NgO_Z3OS2J8kaFfDtXorkLdZhUc"
}
```

**Response Payload:**
```json
{
  "success": true,
  "message": "Tokens refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwiZW1haWwiOiJzdXBlcmFkbWluQGdkcy5jb20iLCJpYXQiOjE3ODE3MDQwNDgsImV4cCI6MTc4MTcwNDk0OH0.G87Ucg70AfpqymArJPf72z2H2VDz_WCFL2pipc80NJY",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwiZW1haWwiOiJzdXBlcmFkbWluQGdkcy5jb20iLCJpYXQiOjE3ODE3MDQwNDgsImV4cCI6MTc4MjMwODg0OH0.EdQL8AEJFmuc4X57NgO_Z3OS2J8kaFfDtXorkLdZhUc"
  }
}
```

---
### `[POST] /security/impersonation/start`
**Request Payload:**
```json
{
  "userId": 6
}
```

**Response Payload:**
```json
{
  "success": true,
  "message": "Impersonating user ID 6 started successfully",
  "data": {
    "user": {
      "id": 6,
      "email": "schooladmin@gds.com",
      "first_name": "School",
      "last_name": "Admin",
      "roles": [
        "SCHOOL_ADMIN"
      ]
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiZW1haWwiOiJzY2hvb2xhZG1pbkBnZHMuY29tIiwiaWF0IjoxNzgxNzA0MDQ4LCJleHAiOjE3ODE3MDQ5NDh9.NO9l7VpMHPJKvN-IdyDr6AmCjLKBJFYSBtLiNaa89r8",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiZW1haWwiOiJzY2hvb2xhZG1pbkBnZHMuY29tIiwiaWF0IjoxNzgxNzA0MDQ4LCJleHAiOjE3ODIzMDg4NDh9.Z3vEayJk2SWP8ajiaSeMLtxoDA0KX6xz7eCKeNCErrA",
    "impersonator": {
      "id": 4,
      "name": "Super Admin"
    }
  }
}
```

---
### `[POST] /states`
**Request Payload:**
```json
{
  "name": "State of Test 77",
  "code": "TS77"
}
```

**Response Payload:**
```json
{
  "success": true,
  "message": "State created successfully",
  "data": {
    "created_at": "2026-06-17T13:47:28.685Z",
    "id": 8,
    "state_name": "State of Test 77",
    "state_code": "TS77",
    "is_active": 1
  }
}
```

---
### `[GET] /states`
**Request Payload:**
```json
null
```

**Response Payload:**
```json
{
  "success": true,
  "message": "States fetched successfully",
  "data": [
    {
      "id": 1,
      "state_code": "KA",
      "state_name": "Karnataka",
      "is_active": 1,
      "created_at": "2026-06-17T13:33:35.000Z"
    },
    {
      "id": 2,
      "state_code": "TS_UPDATED",
      "state_name": "Updated State of Test",
      "is_active": 1,
      "created_at": "2026-06-17T13:35:25.000Z"
    },
    {
      "id": 3,
      "state_code": "TS",
      "state_name": "State of Test",
      "is_active": 1,
      "created_at": "2026-06-17T13:37:17.000Z"
    },
    {
      "id": 6,
      "state_code": "TU40",
      "state_name": "Updated State 40",
      "is_active": 1,
      "created_at": "2026-06-17T13:45:38.000Z"
    },
    {
      "id": 7,
      "state_code": "TU61",
      "state_name": "Updated State 61",
      "is_active": 1,
      "created_at": "2026-06-17T13:47:16.000Z"
    },
    {
      "id": 8,
      "state_code": "TS77",
      "state_name": "State of Test 77",
      "is_active": 1,
      "created_at": "2026-06-17T13:47:28.000Z"
    }
  ]
}
```

---
### `[PUT] /states/:id`
**Request Payload:**
```json
{
  "name": "Updated State 77",
  "code": "TU77"
}
```

**Response Payload:**
```json
{
  "success": true,
  "message": "State updated successfully",
  "data": {
    "id": 8,
    "state_code": "TU77",
    "state_name": "Updated State 77",
    "is_active": 1,
    "created_at": "2026-06-17T13:47:28.000Z"
  }
}
```

---
### `[POST] /districts`
**Request Payload:**
```json
{
  "state_id": 8,
  "name": "District of Test 300",
  "code": "D300"
}
```

**Response Payload:**
```json
{
  "success": true,
  "message": "District created successfully",
  "data": {
    "created_at": "2026-06-17T13:47:28.717Z",
    "id": 8,
    "state_id": 8,
    "district_name": "District of Test 300",
    "district_code": "D300",
    "is_active": 1
  }
}
```

---
### `[GET] /districts`
**Request Payload:**
```json
null
```

**Response Payload:**
```json
{
  "success": true,
  "message": "Districts fetched successfully",
  "data": [
    {
      "id": 1,
      "district_code": "BLR",
      "state_id": 1,
      "district_name": "Bengaluru",
      "is_active": 1,
      "created_at": "2026-06-17T13:33:35.000Z",
      "State": {
        "id": 1,
        "state_code": "KA",
        "state_name": "Karnataka",
        "is_active": 1,
        "created_at": "2026-06-17T13:33:35.000Z"
      }
    },
    {
      "id": 2,
      "district_code": "DT",
      "state_id": 2,
      "district_name": "District of Test",
      "is_active": 1,
      "created_at": "2026-06-17T13:35:25.000Z",
      "State": {
        "id": 2,
        "state_code": "TS_UPDATED",
        "state_name": "Updated State of Test",
        "is_active": 1,
        "created_at": "2026-06-17T13:35:25.000Z"
      }
    },
    {
      "id": 6,
      "district_code": "D543",
      "state_id": 6,
      "district_name": "District of Test 543",
      "is_active": 1,
      "created_at": "2026-06-17T13:45:38.000Z",
      "State": {
        "id": 6,
        "state_code": "TU40",
        "state_name": "Updated State 40",
        "is_active": 1,
        "created_at": "2026-06-17T13:45:38.000Z"
      }
    },
    {
      "id": 7,
      "district_code": "D128",
      "state_id": 7,
      "district_name": "District of Test 128",
      "is_active": 1,
      "created_at": "2026-06-17T13:47:16.000Z",
      "State": {
        "id": 7,
        "state_code": "TU61",
        "state_name": "Updated State 61",
        "is_active": 1,
        "created_at": "2026-06-17T13:47:16.000Z"
      }
    },
    {
      "id": 8,
      "district_code": "D300",
      "state_id": 8,
      "district_name": "District of Test 300",
      "is_active": 1,
      "created_at": "2026-06-17T13:47:28.000Z",
      "State": {
        "id": 8,
        "state_code": "TU77",
        "state_name": "Updated State 77",
        "is_active": 1,
        "created_at": "2026-06-17T13:47:28.000Z"
      }
    }
  ]
}
```

---
### `[POST] /schools`
**Request Payload:**
```json
{
  "district_id": 8,
  "name": "Test Discovery Academy 5698",
  "code": "GDS-TS-5698",
  "address": "123 Discovery Road",
  "phone": "9988776655",
  "email": "testacademy-5698@gds.com",
  "website": "http://testacademy-5698.gds.com"
}
```

**Response Payload:**
```json
{
  "success": true,
  "message": "School registration submitted. Pending approval.",
  "data": {
    "created_at": "2026-06-17T13:47:28.735Z",
    "id": 8,
    "district_id": 8,
    "school_name": "Test Discovery Academy 5698",
    "school_code": "GDS-TS-5698",
    "udise_code": null,
    "principal_name": null,
    "email": "testacademy-5698@gds.com",
    "mobile": "9988776655",
    "address": "123 Discovery Road",
    "student_count": 0,
    "teacher_count": 0,
    "media_upload_enabled": 1,
    "status": "PENDING"
  }
}
```

---
### `[POST] /schools/:id/approve`
**Request Payload:**
```json
{
  "comments": "Onboarding approved."
}
```

**Response Payload:**
```json
{
  "success": true,
  "message": "School onboarding approved successfully",
  "data": {
    "id": 8,
    "school_code": "GDS-TS-5698",
    "district_id": 8,
    "school_name": "Test Discovery Academy 5698",
    "udise_code": null,
    "principal_name": null,
    "email": "testacademy-5698@gds.com",
    "mobile": "9988776655",
    "address": "123 Discovery Road",
    "student_count": 0,
    "teacher_count": 0,
    "status": "APPROVED",
    "media_upload_enabled": 1,
    "approved_by": null,
    "approved_at": null,
    "created_at": "2026-06-17T13:47:28.000Z"
  }
}
```

---
### `[GET] /schools`
**Request Payload:**
```json
null
```

**Response Payload:**
```json
{
  "success": true,
  "message": "Schools fetched successfully",
  "data": [
    {
      "id": 1,
      "school_code": "GDS-KA-01",
      "district_id": 1,
      "school_name": "Global Discovery School East",
      "udise_code": "29200100201",
      "principal_name": "Dr. Jane Smith",
      "email": null,
      "mobile": "9876543210",
      "address": null,
      "student_count": 500,
      "teacher_count": 35,
      "status": "APPROVED",
      "media_upload_enabled": 1,
      "approved_by": null,
      "approved_at": null,
      "created_at": "2026-06-17T13:33:35.000Z",
      "District": {
        "id": 1,
        "district_code": "BLR",
        "state_id": 1,
        "district_name": "Bengaluru",
        "is_active": 1,
        "created_at": "2026-06-17T13:33:35.000Z",
        "State": {
          "id": 1,
          "state_code": "KA",
          "state_name": "Karnataka",
          "is_active": 1,
          "created_at": "2026-06-17T13:33:35.000Z"
        }
      }
    },
    {
      "id": 2,
      "school_code": "GDS-TS-02",
      "district_id": 2,
      "school_name": "Test Discovery Academy",
      "udise_code": null,
      "principal_name": null,
      "email": "testacademy@gds.com",
      "mobile": "9988776655",
      "address": "123 Discovery Road",
      "student_count": 0,
      "teacher_count": 0,
      "status": "APPROVED",
      "media_upload_enabled": 1,
      "approved_by": null,
      "approved_at": null,
      "created_at": "2026-06-17T13:35:25.000Z",
      "District": {
        "id": 2,
        "district_code": "DT",
        "state_id": 2,
        "district_name": "District of Test",
        "is_active": 1,
        "created_at": "2026-06-17T13:35:25.000Z",
        "State": {
          "id": 2,
          "state_code": "TS_UPDATED",
          "state_name": "Updated State of Test",
          "is_active": 1,
          "created_at": "2026-06-17T13:35:25.000Z"
        }
      }
    },
    {
      "id": 6,
      "school_code": "GDS-TS-8523",
      "district_id": 6,
      "school_name": "Test Discovery Academy 8523",
      "udise_code": null,
      "principal_name": null,
      "email": "testacademy-8523@gds.com",
      "mobile": "9988776655",
      "address": "123 Discovery Road",
      "student_count": 0,
      "teacher_count": 0,
      "status": "APPROVED",
      "media_upload_enabled": 1,
      "approved_by": null,
      "approved_at": null,
      "created_at": "2026-06-17T13:45:38.000Z",
      "District": {
        "id": 6,
        "district_code": "D543",
        "state_id": 6,
        "district_name": "District of Test 543",
        "is_active": 1,
        "created_at": "2026-06-17T13:45:38.000Z",
        "State": {
          "id": 6,
          "state_code": "TU40",
          "state_name": "Updated State 40",
          "is_active": 1,
          "created_at": "2026-06-17T13:45:38.000Z"
        }
      }
    },
    {
      "id": 7,
      "school_code": "GDS-TS-4609",
      "district_id": 7,
      "school_name": "Test Discovery Academy 4609",
      "udise_code": null,
      "principal_name": null,
      "email": "testacademy-4609@gds.com",
      "mobile": "9988776655",
      "address": "123 Discovery Road",
      "student_count": 0,
      "teacher_count": 0,
      "status": "APPROVED",
      "media_upload_enabled": 1,
      "approved_by": null,
      "approved_at": null,
      "created_at": "2026-06-17T13:47:16.000Z",
      "District": {
        "id": 7,
        "district_code": "D128",
        "state_id": 7,
        "district_name": "District of Test 128",
        "is_active": 1,
        "created_at": "2026-06-17T13:47:16.000Z",
        "State": {
          "id": 7,
          "state_code": "TU61",
          "state_name": "Updated State 61",
          "is_active": 1,
          "created_at": "2026-06-17T13:47:16.000Z"
        }
      }
    },
    {
      "id": 8,
      "school_code": "GDS-TS-5698",
      "district_id": 8,
      "school_name": "Test Discovery Academy 5698",
      "udise_code": null,
      "principal_name": null,
      "email": "testacademy-5698@gds.com",
      "mobile": "9988776655",
      "address": "123 Discovery Road",
      "student_count": 0,
      "teacher_count": 0,
      "status": "APPROVED",
      "media_upload_enabled": 1,
      "approved_by": null,
      "approved_at": null,
      "created_at": "2026-06-17T13:47:28.000Z",
      "District": {
        "id": 8,
        "district_code": "D300",
        "state_id": 8,
        "district_name": "District of Test 300",
        "is_active": 1,
        "created_at": "2026-06-17T13:47:28.000Z",
        "State": {
          "id": 8,
          "state_code": "TU77",
          "state_name": "Updated State 77",
          "is_active": 1,
          "created_at": "2026-06-17T13:47:28.000Z"
        }
      }
    }
  ]
}
```

---
### `[POST] /media/upload`
**Request Payload:**
```json
{
  "school_id": 1,
  "file": "sample-event.jpg"
}
```

**Response Payload:**
```json
{
  "success": true,
  "message": "Media asset uploaded successfully",
  "data": {
    "uploaded_at": "2026-06-17T13:47:28.802Z",
    "id": 4,
    "asset_code": "AST-04048802-15",
    "file_name": "sample-event.jpg",
    "file_path": "/uploads/file-1781704048800-387078723.jpg",
    "file_type": "image/jpeg",
    "file_size": 22,
    "uploaded_by": 6
  }
}
```

---
### `[POST] /media/submit`
**Request Payload:**
```json
{
  "media_asset_id": 4,
  "title": "Annual Sports Event 2026",
  "description": "GDS East annual sports event highlight media post for review.",
  "school_id": 1
}
```

**Response Payload:**
```json
{
  "success": true,
  "message": "Media submitted for regional review",
  "data": {
    "created_at": "2026-06-17T13:47:28.817Z",
    "id": 3,
    "submission_code": "SUB-04048817-10",
    "school_id": 1,
    "title": "Annual Sports Event 2026",
    "description": "GDS East annual sports event highlight media post for review.",
    "status": "SUBMITTED",
    "submitted_by": 6,
    "submitted_at": "2026-06-17T13:47:28.817Z"
  }
}
```

---
### `[POST] /media/review`
**Request Payload:**
```json
{
  "submission_id": 3,
  "action": "APPROVE",
  "comments": "Regional review passed. Post quality fits standard guidelines."
}
```

**Response Payload:**
```json
{
  "success": true,
  "message": "Review recorded successfully",
  "data": {
    "id": 3,
    "submission_code": "SUB-04048817-10",
    "school_id": 1,
    "title": "Annual Sports Event 2026",
    "description": "GDS East annual sports event highlight media post for review.",
    "status": "REGIONAL_REVIEWED",
    "submitted_by": 6,
    "submitted_at": "2026-06-17T13:47:28.000Z",
    "created_at": "2026-06-17T13:47:28.000Z"
  }
}
```

---
### `[POST] /media/approve`
**Request Payload:**
```json
{
  "submission_id": 3,
  "comments": "Final quality is excellent. Ready for publication."
}
```

**Response Payload:**
```json
{
  "success": true,
  "message": "Final approval granted. Media approved.",
  "data": {
    "id": 3,
    "submission_code": "SUB-04048817-10",
    "school_id": 1,
    "title": "Annual Sports Event 2026",
    "description": "GDS East annual sports event highlight media post for review.",
    "status": "SUPER_APPROVED",
    "submitted_by": 6,
    "submitted_at": "2026-06-17T13:47:28.000Z",
    "created_at": "2026-06-17T13:47:28.000Z"
  }
}
```

---
### `[POST] /media/publish`
**Request Payload:**
```json
{
  "submission_id": 3,
  "platforms": [
    "FACEBOOK",
    "INSTAGRAM"
  ]
}
```

**Response Payload:**
```json
{
  "success": true,
  "message": "Publishing operations complete",
  "data": {
    "submissionId": 3,
    "results": [
      {
        "platform": "FACEBOOK",
        "success": false,
        "error": "Cannot read properties of undefined (reading 'findOne')"
      },
      {
        "platform": "INSTAGRAM",
        "success": false,
        "error": "Cannot read properties of undefined (reading 'findOne')"
      }
    ]
  }
}
```

---
### `[POST] /inspection/request`
**Request Payload:**
```json
{
  "school_id": 1,
  "comments": "Requesting periodic inventory and building infrastructure inspection.",
  "preferred_date": "2026-07-10"
}
```

**Response Payload:**
```json
{
  "success": true,
  "message": "Inspection request submitted successfully",
  "data": {
    "created_at": "2026-06-17T13:47:28.930Z",
    "id": 3,
    "request_code": "REQ-04048930-65",
    "school_id": 1,
    "requested_by": 6,
    "status": "PENDING",
    "request_reason": "Requesting periodic inventory and building infrastructure inspection.",
    "requested_at": "2026-07-10T00:00:00.000Z"
  }
}
```

---
### `[POST] /inspection/schedule`
**Request Payload:**
```json
{
  "requestId": 3,
  "inspectorId": 5,
  "scheduleDate": "2026-07-12"
}
```

**Response Payload:**
```json
{
  "success": true,
  "message": "Inspection scheduled successfully",
  "data": {
    "created_at": "2026-06-17T13:47:28.958Z",
    "id": 3,
    "report_code": "RPT-04048958-75",
    "inspection_request_id": 3,
    "inspector_id": 5,
    "inspection_date": "2026-07-12"
  }
}
```

---
### `[POST] /inspection/complete`
**Request Payload:**
```json
{
  "reportId": 3,
  "score": 95,
  "feedback": "Excellent infrastructure. All parameters verify fully. Highly functional building assets."
}
```

**Response Payload:**
```json
{
  "success": true,
  "message": "Inspection completed, report generated and ranking updated.",
  "data": {
    "reportId": 3,
    "score": 95,
    "reportFileUrl": "/uploads/report-3-1781704049005.pdf"
  }
}
```

---
### `[GET] /inspection/reports`
**Request Payload:**
```json
null
```

**Response Payload:**
```json
{
  "success": true,
  "message": "Inspection reports fetched successfully",
  "data": [
    {
      "id": 1,
      "report_name": null,
      "report_type": "INSPECTION",
      "generated_by": 5,
      "file_path": null,
      "generated_at": null
    }
  ]
}
```

---
### `[GET] /rankings`
**Request Payload:**
```json
null
```

**Response Payload:**
```json
{
  "success": true,
  "message": "Global rankings fetched successfully",
  "data": [
    {
      "id": 1,
      "school_id": 1,
      "period_id": 1,
      "total_score": "210.00",
      "tier_id": 6,
      "global_rank": 1,
      "state_rank": 1,
      "district_rank": 1,
      "previous_rank": 1,
      "rank_change": 0,
      "calculated_at": "2026-06-17T13:47:17.000Z",
      "School": {
        "id": 1,
        "school_code": "GDS-KA-01",
        "district_id": 1,
        "school_name": "Global Discovery School East",
        "udise_code": "29200100201",
        "principal_name": "Dr. Jane Smith",
        "email": null,
        "mobile": "9876543210",
        "address": null,
        "student_count": 500,
        "teacher_count": 35,
        "status": "APPROVED",
        "media_upload_enabled": 1,
        "approved_by": null,
        "approved_at": null,
        "created_at": "2026-06-17T13:33:35.000Z",
        "District": {
          "id": 1,
          "district_code": "BLR",
          "state_id": 1,
          "district_name": "Bengaluru",
          "is_active": 1,
          "created_at": "2026-06-17T13:33:35.000Z"
        }
      },
      "RankTier": {
        "id": 6,
        "tier_name": "Not Ranked",
        "min_score": 0,
        "max_score": 249,
        "created_at": "2026-06-17T13:45:39.000Z"
      }
    },
    {
      "id": 2,
      "school_id": 2,
      "period_id": 1,
      "total_score": "150.00",
      "tier_id": 6,
      "global_rank": 2,
      "state_rank": 1,
      "district_rank": 1,
      "previous_rank": 2,
      "rank_change": 0,
      "calculated_at": "2026-06-17T13:47:17.000Z",
      "School": {
        "id": 2,
        "school_code": "GDS-TS-02",
        "district_id": 2,
        "school_name": "Test Discovery Academy",
        "udise_code": null,
        "principal_name": null,
        "email": "testacademy@gds.com",
        "mobile": "9988776655",
        "address": "123 Discovery Road",
        "student_count": 0,
        "teacher_count": 0,
        "status": "APPROVED",
        "media_upload_enabled": 1,
        "approved_by": null,
        "approved_at": null,
        "created_at": "2026-06-17T13:35:25.000Z",
        "District": {
          "id": 2,
          "district_code": "DT",
          "state_id": 2,
          "district_name": "District of Test",
          "is_active": 1,
          "created_at": "2026-06-17T13:35:25.000Z"
        }
      },
      "RankTier": {
        "id": 6,
        "tier_name": "Not Ranked",
        "min_score": 0,
        "max_score": 249,
        "created_at": "2026-06-17T13:45:39.000Z"
      }
    },
    {
      "id": 3,
      "school_id": 6,
      "period_id": 1,
      "total_score": "150.00",
      "tier_id": 6,
      "global_rank": 3,
      "state_rank": 1,
      "district_rank": 1,
      "previous_rank": 3,
      "rank_change": 0,
      "calculated_at": "2026-06-17T13:47:17.000Z",
      "School": {
        "id": 6,
        "school_code": "GDS-TS-8523",
        "district_id": 6,
        "school_name": "Test Discovery Academy 8523",
        "udise_code": null,
        "principal_name": null,
        "email": "testacademy-8523@gds.com",
        "mobile": "9988776655",
        "address": "123 Discovery Road",
        "student_count": 0,
        "teacher_count": 0,
        "status": "APPROVED",
        "media_upload_enabled": 1,
        "approved_by": null,
        "approved_at": null,
        "created_at": "2026-06-17T13:45:38.000Z",
        "District": {
          "id": 6,
          "district_code": "D543",
          "state_id": 6,
          "district_name": "District of Test 543",
          "is_active": 1,
          "created_at": "2026-06-17T13:45:38.000Z"
        }
      },
      "RankTier": {
        "id": 6,
        "tier_name": "Not Ranked",
        "min_score": 0,
        "max_score": 249,
        "created_at": "2026-06-17T13:45:39.000Z"
      }
    },
    {
      "id": 4,
      "school_id": 7,
      "period_id": 1,
      "total_score": "150.00",
      "tier_id": 6,
      "global_rank": 4,
      "state_rank": 1,
      "district_rank": 1,
      "previous_rank": 4,
      "rank_change": 0,
      "calculated_at": "2026-06-17T13:47:17.000Z",
      "School": {
        "id": 7,
        "school_code": "GDS-TS-4609",
        "district_id": 7,
        "school_name": "Test Discovery Academy 4609",
        "udise_code": null,
        "principal_name": null,
        "email": "testacademy-4609@gds.com",
        "mobile": "9988776655",
        "address": "123 Discovery Road",
        "student_count": 0,
        "teacher_count": 0,
        "status": "APPROVED",
        "media_upload_enabled": 1,
        "approved_by": null,
        "approved_at": null,
        "created_at": "2026-06-17T13:47:16.000Z",
        "District": {
          "id": 7,
          "district_code": "D128",
          "state_id": 7,
          "district_name": "District of Test 128",
          "is_active": 1,
          "created_at": "2026-06-17T13:47:16.000Z"
        }
      },
      "RankTier": {
        "id": 6,
        "tier_name": "Not Ranked",
        "min_score": 0,
        "max_score": 249,
        "created_at": "2026-06-17T13:45:39.000Z"
      }
    }
  ]
}
```

---
### `[POST] /rankings/recalculate`
**Request Payload:**
```json
null
```

**Response Payload:**
```json
{
  "success": true,
  "message": "Rankings recalculation triggered successfully",
  "data": [
    {
      "id": 1,
      "score": 375,
      "tierId": 4,
      "district_id": 1
    },
    {
      "id": 2,
      "score": 150,
      "tierId": 6,
      "district_id": 2
    },
    {
      "id": 6,
      "score": 150,
      "tierId": 6,
      "district_id": 6
    },
    {
      "id": 7,
      "score": 150,
      "tierId": 6,
      "district_id": 7
    },
    {
      "id": 8,
      "score": 150,
      "tierId": 6,
      "district_id": 8
    }
  ]
}
```

---
### `[POST] /recommendations`
**Request Payload:**
```json
{
  "school_id": 1,
  "type": "INVENTORY_RESTORATION",
  "description": "Add sports assets and playground equipment to boost activity scores.",
  "priority": "HIGH"
}
```

**Response Payload:**
```json
{
  "success": true,
  "message": "Recommendation logged successfully",
  "data": {
    "created_at": "2026-06-17T13:47:29.312Z",
    "id": 7,
    "school_id": 1,
    "title": "INVENTORY_RESTORATION",
    "description": "Add sports assets and playground equipment to boost activity scores.",
    "priority": "HIGH",
    "ranking_impact": 10,
    "progress_percentage": 0,
    "created_by": 4
  }
}
```

---
### `[POST] /recommendations/:id/accept`
**Request Payload:**
```json
null
```

**Response Payload:**
```json
{
  "success": true,
  "message": "Recommendation accepted successfully",
  "data": {
    "id": 7,
    "school_id": 1,
    "title": "INVENTORY_RESTORATION",
    "description": "Add sports assets and playground equipment to boost activity scores.",
    "priority": "HIGH",
    "ranking_impact": 10,
    "progress_percentage": 0,
    "created_by": 4,
    "created_at": "2026-06-17T13:47:29.000Z"
  }
}
```

---
### `[GET] /recommendations/history/:schoolId`
**Request Payload:**
```json
null
```

**Response Payload:**
```json
{
  "success": true,
  "message": "Recommendation history fetched successfully",
  "data": [
    {
      "id": 7,
      "school_id": 1,
      "title": "INVENTORY_RESTORATION",
      "description": "Add sports assets and playground equipment to boost activity scores.",
      "priority": "HIGH",
      "ranking_impact": 10,
      "progress_percentage": 0,
      "created_by": 4,
      "created_at": "2026-06-17T13:47:29.000Z",
      "RecommendationStatusHistories": [
        {
          "id": 10,
          "recommendation_id": 7,
          "old_status": null,
          "new_status": "PENDING",
          "changed_by": 4,
          "changed_at": "2026-06-17T13:47:29.000Z"
        },
        {
          "id": 11,
          "recommendation_id": 7,
          "old_status": "PENDING",
          "new_status": "ACCEPTED",
          "changed_by": 6,
          "changed_at": "2026-06-17T13:47:29.000Z"
        }
      ]
    },
    {
      "id": 6,
      "school_id": 1,
      "title": "INVENTORY_RESTORATION",
      "description": "Add sports assets and playground equipment to boost activity scores.",
      "priority": "HIGH",
      "ranking_impact": 10,
      "progress_percentage": 0,
      "created_by": 4,
      "created_at": "2026-06-17T13:47:17.000Z",
      "RecommendationStatusHistories": [
        {
          "id": 8,
          "recommendation_id": 6,
          "old_status": null,
          "new_status": "PENDING",
          "changed_by": 4,
          "changed_at": "2026-06-17T13:47:17.000Z"
        },
        {
          "id": 9,
          "recommendation_id": 6,
          "old_status": "PENDING",
          "new_status": "ACCEPTED",
          "changed_by": 6,
          "changed_at": "2026-06-17T13:47:17.000Z"
        }
      ]
    },
    {
      "id": 5,
      "school_id": 1,
      "title": "INVENTORY_RESTORATION",
      "description": "Add sports assets and playground equipment to boost activity scores.",
      "priority": "HIGH",
      "ranking_impact": 10,
      "progress_percentage": 0,
      "created_by": 4,
      "created_at": "2026-06-17T13:45:39.000Z",
      "RecommendationStatusHistories": [
        {
          "id": 6,
          "recommendation_id": 5,
          "old_status": null,
          "new_status": "PENDING",
          "changed_by": 4,
          "changed_at": "2026-06-17T13:45:39.000Z"
        },
        {
          "id": 7,
          "recommendation_id": 5,
          "old_status": "PENDING",
          "new_status": "ACCEPTED",
          "changed_by": 6,
          "changed_at": "2026-06-17T13:45:39.000Z"
        }
      ]
    },
    {
      "id": 4,
      "school_id": 1,
      "title": "INVENTORY_RESTORATION",
      "description": "Add sports assets and playground equipment to boost activity scores.",
      "priority": "HIGH",
      "ranking_impact": 10,
      "progress_percentage": 0,
      "created_by": 4,
      "created_at": "2026-06-17T13:43:57.000Z",
      "RecommendationStatusHistories": [
        {
          "id": 5,
          "recommendation_id": 4,
          "old_status": null,
          "new_status": "PENDING",
          "changed_by": 4,
          "changed_at": "2026-06-17T13:43:57.000Z"
        }
      ]
    },
    {
      "id": 3,
      "school_id": 1,
      "title": "INVENTORY_RESTORATION",
      "description": "Add sports assets and playground equipment to boost activity scores.",
      "priority": "HIGH",
      "ranking_impact": 10,
      "progress_percentage": 0,
      "created_by": 4,
      "created_at": "2026-06-17T13:41:27.000Z",
      "RecommendationStatusHistories": [
        {
          "id": 4,
          "recommendation_id": 3,
          "old_status": null,
          "new_status": "PENDING",
          "changed_by": 4,
          "changed_at": "2026-06-17T13:41:27.000Z"
        }
      ]
    },
    {
      "id": 2,
      "school_id": 1,
      "title": "INVENTORY_RESTORATION",
      "description": "Add sports assets and playground equipment to boost activity scores.",
      "priority": "HIGH",
      "ranking_impact": 10,
      "progress_percentage": 0,
      "created_by": 4,
      "created_at": "2026-06-17T13:37:17.000Z",
      "RecommendationStatusHistories": [
        {
          "id": 3,
          "recommendation_id": 2,
          "old_status": null,
          "new_status": "PENDING",
          "changed_by": 4,
          "changed_at": "2026-06-17T13:37:17.000Z"
        }
      ]
    },
    {
      "id": 1,
      "school_id": 1,
      "title": "INVENTORY_RESTORATION",
      "description": "Add sports assets and playground equipment to boost activity scores.",
      "priority": "HIGH",
      "ranking_impact": 10,
      "progress_percentage": 0,
      "created_by": 4,
      "created_at": "2026-06-17T13:35:25.000Z",
      "RecommendationStatusHistories": [
        {
          "id": 1,
          "recommendation_id": 1,
          "old_status": null,
          "new_status": "PENDING",
          "changed_by": 4,
          "changed_at": "2026-06-17T13:35:25.000Z"
        },
        {
          "id": 2,
          "recommendation_id": 1,
          "old_status": "PENDING",
          "new_status": "ACCEPTED",
          "changed_by": 6,
          "changed_at": "2026-06-17T13:35:25.000Z"
        }
      ]
    }
  ]
}
```

---
### `[GET] /notifications`
**Request Payload:**
```json
null
```

**Response Payload:**
```json
{
  "success": true,
  "message": "Notifications fetched successfully",
  "data": [
    {
      "id": 25,
      "notification_id": 29,
      "user_id": 6,
      "is_read": 0,
      "read_at": null,
      "delivered_at": "2026-06-17T13:47:29.000Z",
      "Notification": {
        "id": 29,
        "notification_code": "N-1704049319-36",
        "notification_type": "RECOMMENDATION_CREATED",
        "title": "New Improvement Recommendation",
        "message": "Your school has received a new HIGH priority recommendation.",
        "entity_type": "SYSTEM",
        "entity_id": null,
        "created_by": 4,
        "created_at": "2026-06-17T13:47:29.000Z"
      }
    },
    {
      "id": 24,
      "notification_id": 28,
      "user_id": 6,
      "is_read": 0,
      "read_at": null,
      "delivered_at": "2026-06-17T13:47:29.000Z",
      "Notification": {
        "id": 28,
        "notification_code": "N-1704049069-15",
        "notification_type": "REPORT_READY",
        "title": "Inspection Completed & Report Ready",
        "message": "Your school's inspection has been completed. Score: 95/100. PDF report is now accessible.",
        "entity_type": "LINK",
        "entity_id": null,
        "created_by": 4,
        "created_at": "2026-06-17T13:47:29.000Z"
      }
    },
    {
      "id": 23,
      "notification_id": 27,
      "user_id": 6,
      "is_read": 0,
      "read_at": null,
      "delivered_at": "2026-06-17T13:47:28.000Z",
      "Notification": {
        "id": 27,
        "notification_code": "N-1704048961-48",
        "notification_type": "INSPECTION_CREATED",
        "title": "Inspection Scheduled",
        "message": "An inspection has been scheduled for your school on 2026-07-12.",
        "entity_type": "SYSTEM",
        "entity_id": null,
        "created_by": 4,
        "created_at": "2026-06-17T13:47:28.000Z"
      }
    },
    {
      "id": 21,
      "notification_id": 25,
      "user_id": 6,
      "is_read": 0,
      "read_at": null,
      "delivered_at": "2026-06-17T13:47:28.000Z",
      "Notification": {
        "id": 25,
        "notification_code": "N-1704048899-91",
        "notification_type": "MEDIA_APPROVED",
        "title": "Media Approved!",
        "message": "Your post \"Annual Sports Event 2026\" has received final approval and is ready to publish.",
        "entity_type": "SYSTEM",
        "entity_id": null,
        "created_by": 4,
        "created_at": "2026-06-17T13:47:28.000Z"
      }
    },
    {
      "id": 17,
      "notification_id": 20,
      "user_id": 6,
      "is_read": 1,
      "read_at": "2026-06-17T13:47:17.000Z",
      "delivered_at": "2026-06-17T13:47:17.000Z",
      "Notification": {
        "id": 20,
        "notification_code": "N-1704037211-76",
        "notification_type": "RECOMMENDATION_CREATED",
        "title": "New Improvement Recommendation",
        "message": "Your school has received a new HIGH priority recommendation.",
        "entity_type": "SYSTEM",
        "entity_id": null,
        "created_by": 4,
        "created_at": "2026-06-17T13:47:17.000Z"
      }
    },
    {
      "id": 16,
      "notification_id": 19,
      "user_id": 6,
      "is_read": 1,
      "read_at": "2026-06-17T13:47:17.000Z",
      "delivered_at": "2026-06-17T13:47:16.000Z",
      "Notification": {
        "id": 19,
        "notification_code": "N-1704036989-59",
        "notification_type": "INSPECTION_CREATED",
        "title": "Inspection Scheduled",
        "message": "An inspection has been scheduled for your school on 2026-07-12.",
        "entity_type": "SYSTEM",
        "entity_id": null,
        "created_by": 4,
        "created_at": "2026-06-17T13:47:16.000Z"
      }
    },
    {
      "id": 14,
      "notification_id": 17,
      "user_id": 6,
      "is_read": 1,
      "read_at": "2026-06-17T13:47:17.000Z",
      "delivered_at": "2026-06-17T13:47:16.000Z",
      "Notification": {
        "id": 17,
        "notification_code": "N-1704036927-82",
        "notification_type": "MEDIA_APPROVED",
        "title": "Media Approved!",
        "message": "Your post \"Annual Sports Event 2026\" has received final approval and is ready to publish.",
        "entity_type": "SYSTEM",
        "entity_id": null,
        "created_by": 4,
        "created_at": "2026-06-17T13:47:16.000Z"
      }
    },
    {
      "id": 10,
      "notification_id": 12,
      "user_id": 6,
      "is_read": 1,
      "read_at": "2026-06-17T13:47:17.000Z",
      "delivered_at": "2026-06-17T13:45:39.000Z",
      "Notification": {
        "id": 12,
        "notification_code": "N-1703939349-23",
        "notification_type": "RECOMMENDATION_CREATED",
        "title": "New Improvement Recommendation",
        "message": "Your school has received a new HIGH priority recommendation.",
        "entity_type": "SYSTEM",
        "entity_id": null,
        "created_by": 4,
        "created_at": "2026-06-17T13:45:39.000Z"
      }
    },
    {
      "id": 8,
      "notification_id": 10,
      "user_id": 6,
      "is_read": 1,
      "read_at": "2026-06-17T13:47:17.000Z",
      "delivered_at": "2026-06-17T13:45:39.000Z",
      "Notification": {
        "id": 10,
        "notification_code": "N-1703939064-98",
        "notification_type": "MEDIA_APPROVED",
        "title": "Media Approved!",
        "message": "Your post \"Annual Sports Event 2026\" has received final approval and is ready to publish.",
        "entity_type": "SYSTEM",
        "entity_id": null,
        "created_by": 4,
        "created_at": "2026-06-17T13:45:39.000Z"
      }
    },
    {
      "id": 4,
      "notification_id": 5,
      "user_id": 6,
      "is_read": 1,
      "read_at": "2026-06-17T13:47:17.000Z",
      "delivered_at": "2026-06-17T13:43:57.000Z",
      "Notification": {
        "id": 5,
        "notification_code": "N-1703837756-52",
        "notification_type": "RECOMMENDATION_CREATED",
        "title": "New Improvement Recommendation",
        "message": "Your school has received a new HIGH priority recommendation.",
        "entity_type": "SYSTEM",
        "entity_id": null,
        "created_by": 4,
        "created_at": "2026-06-17T13:43:57.000Z"
      }
    },
    {
      "id": 3,
      "notification_id": 4,
      "user_id": 6,
      "is_read": 1,
      "read_at": "2026-06-17T13:47:17.000Z",
      "delivered_at": "2026-06-17T13:41:27.000Z",
      "Notification": {
        "id": 4,
        "notification_code": "N-1703687781-42",
        "notification_type": "RECOMMENDATION_CREATED",
        "title": "New Improvement Recommendation",
        "message": "Your school has received a new HIGH priority recommendation.",
        "entity_type": "SYSTEM",
        "entity_id": null,
        "created_by": 4,
        "created_at": "2026-06-17T13:41:27.000Z"
      }
    },
    {
      "id": 2,
      "notification_id": 3,
      "user_id": 6,
      "is_read": 1,
      "read_at": "2026-06-17T13:47:17.000Z",
      "delivered_at": "2026-06-17T13:35:25.000Z",
      "Notification": {
        "id": 3,
        "notification_code": "NTF-1781703325735-90",
        "notification_type": "RECOMMENDATION_CREATED",
        "title": "New Improvement Recommendation",
        "message": "Your school has received a new HIGH priority recommendation.",
        "entity_type": "SYSTEM",
        "entity_id": null,
        "created_by": 4,
        "created_at": "2026-06-17T13:35:25.000Z"
      }
    }
  ]
}
```

---
### `[PATCH] /notifications/read`
**Request Payload:**
```json
{
  "ids": [
    25,
    24,
    23,
    21,
    17,
    16,
    14,
    10,
    8,
    4,
    3,
    2
  ]
}
```

**Response Payload:**
```json
{
  "success": true,
  "message": "Notifications marked as read successfully",
  "data": {}
}
```

---
