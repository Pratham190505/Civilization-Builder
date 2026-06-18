# Frontend Compatibility Report

This report evaluates and verifies backend-to-frontend compatibility, ensuring request payloads, response formats, and workflows align seamlessly.

## Compatibility Checklist

### 1. Request Payloads & Field Naming
- **Verification**: Verified that inbound data formats sent from the client are handled gracefully. In `SchoolController.js` and other locations, payload keys are dynamically mapped to support both frontend structures (e.g. `phone` and `name`) and strict database naming constraints (e.g. `mobile`, `state_name`, and `school_name`).
- **Input Robustness**: Payload structures conform to Zod validation schemas (`validations/schemas.js`) which have been updated to align with database naming conventions.

### 2. Standardized Response Structure
All API responses follow the strict envelope requirement:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```
Errors are returned uniformly with status codes (400, 401, 403, 404, 500) and structured messages:
```json
{
  "success": false,
  "message": "Invalid validation payload",
  "errors": [ "Email must be valid" ]
}
```

### 3. Pagination & Formatting
- All listing endpoints (`/schools`, `/states`, `/districts`, etc.) utilize standardized `limit`, `offset` structure and return lists within the `data` wrapper.

### 4. File Upload Compatibility
- **Multer Storage**: Configured to write uploaded assets statically to a local folder (`uploads/`).
- **File Metadata Saving**: Metadata (including filename, type, size, path, and uploader user ID) are stored in the `media_assets` table under an automatically shortened 20-character `asset_code`.

### 5. Authentication & RBAC Flow
- **Stateless Tokens**: The frontend receives an `accessToken` and `refreshToken` envelope upon logging in. Tokens contain user ID, email, roles, permissions list, and scopes.
- **Impersonation**: Super Admin starting impersonation receives the target user's token envelope, enabling seamless frontend dashboard rendering without logout/login cycles.
