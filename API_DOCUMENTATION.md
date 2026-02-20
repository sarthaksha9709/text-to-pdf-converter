# API Documentation

Base URL (development): `http://localhost:4000`

---

## Endpoints

### GET /api/health

Returns the health status of the API.

**Response** `200 OK`

```json
{
  "status": "ok"
}
```

**cURL**

```bash
curl http://localhost:4000/api/health
```

---

### GET /api/templates

Returns a list of predefined styling presets.

**Response** `200 OK`

```json
[
  {
    "id": "manuscript",
    "label": "Manuscript",
    "options": {
      "fontFamily": "serif",
      "marginPreset": "wide",
      "lineSpacing": 2
    }
  },
  {
    "id": "tech-notes",
    "label": "Technical Notes",
    "options": {
      "fontFamily": "monospace",
      "fontSize": 11,
      "marginPreset": "narrow"
    }
  },
  {
    "id": "report",
    "label": "Executive Report",
    "options": {
      "fontFamily": "sans-serif",
      "headerTitle": "Report",
      "showPageNumbers": true
    }
  }
]
```

**cURL**

```bash
curl http://localhost:4000/api/templates
```

---

### POST /api/convert

Converts text or an uploaded file to a PDF and returns the binary PDF data.

**Content types accepted**:

- `application/json` — for plain text input
- `multipart/form-data` — for file uploads

#### JSON Request Body

| Field      | Type         | Required | Description                                         |
| ---------- | ------------ | -------- | --------------------------------------------------- |
| `text`     | `string`     | Yes      | Text to convert (max 50,000 characters)             |
| `filename` | `string`     | No       | Base filename for the PDF (sanitized automatically) |
| `options`  | `PdfOptions` | No       | PDF styling options (see below)                     |

**Example**

```bash
curl -X POST http://localhost:4000/api/convert \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, World!\n\nThis is my first PDF.",
    "filename": "hello",
    "options": {
      "pageSize": "A4",
      "fontFamily": "serif",
      "fontSize": 12,
      "showPageNumbers": true
    }
  }' \
  --output hello.pdf
```

#### Multipart Form Data

| Field      | Type            | Required | Description                     |
| ---------- | --------------- | -------- | ------------------------------- |
| `file`     | `File`          | Yes\*    | `.txt` or `.md` file (max 5 MB) |
| `filename` | `string`        | No       | Base filename for the PDF       |
| `options`  | `string` (JSON) | No       | Stringified `PdfOptions` object |

\*Either `file` or `text` must be provided.

**Example**

```bash
curl -X POST http://localhost:4000/api/convert \
  -F "file=@samples/test.txt" \
  -F 'options={"fontFamily":"monospace","fontSize":11}' \
  --output output.pdf
```

#### PdfOptions

| Field             | Type                                     | Default      | Description                    |
| ----------------- | ---------------------------------------- | ------------ | ------------------------------ |
| `pageSize`        | `"A4" \| "Letter" \| "Legal"`            | `"A4"`       | Paper size                     |
| `orientation`     | `"portrait" \| "landscape"`              | `"portrait"` | Page orientation               |
| `fontFamily`      | `"serif" \| "sans-serif" \| "monospace"` | `"serif"`    | Font family                    |
| `fontSize`        | `number` (8–18)                          | `12`         | Font size in points            |
| `lineSpacing`     | `number` (1–2.5)                         | `1.4`        | Line height multiplier         |
| `marginPreset`    | `"normal" \| "narrow" \| "wide"`         | `"normal"`   | Margin preset                  |
| `showPageNumbers` | `boolean`                                | `false`      | Add page numbers at the bottom |
| `headerTitle`     | `string` (max 120 chars)                 | `""`         | Text shown in the page header  |

#### Response

**Success** `200 OK`

```
Content-Type: application/pdf
Content-Disposition: attachment; filename="hello.pdf"

<binary PDF data>
```

#### Error Responses

| Status | Condition            | Response Body                                        |
| ------ | -------------------- | ---------------------------------------------------- |
| `400`  | No text provided     | `{ "error": "No text provided" }`                    |
| `400`  | Invalid options      | `{ "error": { "fieldErrors": {...} } }` (Zod error)  |
| `413`  | Text > 50,000 chars  | `{ "error": "Text exceeds 50,000 character limit" }` |
| `413`  | File > 5 MB          | `{ "error": "File exceeds 5MB limit" }`              |
| `500`  | PDF generation error | `{ "error": "Failed to generate PDF" }`              |

---

## Rate Limiting

The API enforces rate limiting to prevent abuse:

- **Limit**: 100 requests per 15 minutes per IP address
- **Header**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` are returned in each response

When the limit is exceeded, the API returns `429 Too Many Requests`.

---

## OpenAPI Specification

A minimal OpenAPI 3.0 spec is provided below for use with Swagger UI or code generators.

```yaml
openapi: 3.0.0
info:
  title: Text-to-PDF Converter API
  version: 0.1.0
paths:
  /api/health:
    get:
      summary: Health check
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                    example: ok
  /api/templates:
    get:
      summary: List PDF templates
      responses:
        '200':
          description: Array of template presets
  /api/convert:
    post:
      summary: Convert text to PDF
      requestBody:
        content:
          application/json:
            schema:
              type: object
              required: [text]
              properties:
                text:
                  type: string
                filename:
                  type: string
                options:
                  $ref: '#/components/schemas/PdfOptions'
          multipart/form-data:
            schema:
              type: object
              properties:
                file:
                  type: string
                  format: binary
                filename:
                  type: string
                options:
                  type: string
      responses:
        '200':
          description: PDF file
          content:
            application/pdf:
              schema:
                type: string
                format: binary
        '400':
          description: Bad request
        '413':
          description: Payload too large
        '500':
          description: Internal server error
components:
  schemas:
    PdfOptions:
      type: object
      properties:
        pageSize:
          type: string
          enum: [A4, Letter, Legal]
        orientation:
          type: string
          enum: [portrait, landscape]
        fontFamily:
          type: string
          enum: [serif, sans-serif, monospace]
        fontSize:
          type: number
          minimum: 8
          maximum: 18
        lineSpacing:
          type: number
          minimum: 1
          maximum: 2.5
        marginPreset:
          type: string
          enum: [normal, narrow, wide]
        showPageNumbers:
          type: boolean
        headerTitle:
          type: string
          maxLength: 120
```
