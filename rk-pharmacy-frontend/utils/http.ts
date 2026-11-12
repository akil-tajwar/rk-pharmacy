import { z } from 'zod'
// Declare process shape for environments where Node types are not present
declare const process:
  | { env?: { NEXT_PUBLIC_API_BASE_URL?: string } }
  | undefined

// Type for API response
type ApiResponse<T> = {
  data: T | null
  error: {
    message: string
    status?: number
    details?: unknown
  } | null
}


// Type for the fetch options
type FetchOptions<T> = {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: unknown
  headers?: Record<string, string>
  schema?: z.ZodType<T>
}

// Function to handle user logout
const handleLogout = () => {
  //localStorage.clear()
  //window.location.href = '/login'
}

// Normalize API base URL and provide sensible defaults for server/client contexts
const rawBase =
  (typeof process !== 'undefined' ? process.env?.NEXT_PUBLIC_API_BASE_URL : undefined) ||
  (typeof window !== 'undefined'
    ? `${window.location.origin}/api`
    : 'http://127.0.0.1:4000/api')

const API_BASE_URL = rawBase.replace(/\/+$/, '')
const buildUrl = (u: string) => `${API_BASE_URL}/${u.replace(/^\/+/, '')}`

// Main fetch utility function
export async function fetchApi<T>({
  url,
  method = 'GET',
  body,
  headers = {},
  schema,
}: FetchOptions<T>): Promise<ApiResponse<T>> {
  console.log(`${API_BASE_URL}/${url}`)
  console.log(JSON.stringify(body))

  console.log('fetchapi token', headers.Authorization)

  const response = await fetch(
    buildUrl(url),
    {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    }
  )
console.log(buildUrl(url))
  // Handle network errors
  if (!response) {
    return {
      data: null,
      error: {
        message: 'Network error occurred',
        status: 500,
      },
    }
  }

  // Handle unauthorized access
  if (response.status === 401) {
    handleLogout()
    return {
      data: null,
      error: {
        message: 'Unauthorized access',
        status: 401,
      },
    }
  }

  // Handle non-200 responses
  if (!response.ok) {
    const errorData = await response.json().catch(() => null)
    return {
      data: null,
      error: {
        message: `HTTP error! status: ${response.status} ${errorData?.message}`,
        status: response.status,
        details: errorData,
      },
    }
  }
  console.log(response);
  // Parse JSON response
  const jsonData = await response.json().catch(() => null)
  if (!jsonData) {
    return {
      data: null,
      error: {
        message: 'Invalid JSON response',
        status: 400,
      },
    }
  }

  // Validate response with schema if provided
  if (schema) {
    console.log(jsonData)
    const result = schema.safeParse(jsonData)
    if (!result.success) {
      return {
        data: null,
        error: {
          message: 'Response validation failed',
          status: 400,
          details: result.error.flatten(),
        },
      }
    }
    return { data: result.data, error: null }
  }

  return { data: jsonData as T, error: null }
  
}


export async function fetchApiWithFile<T>({
  url,
  method,
  headers = {},
  body,
}: {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: HeadersInit
  body?: any
}): Promise<T> {
  const baseUrl = API_BASE_URL
  const isFormData = body instanceof FormData

  const finalHeaders = isFormData
    ? headers // Do NOT set Content-Type for FormData
    : { "Content-Type": "application/json", ...headers }

  const response = await fetch(buildUrl(url), {
    method,
    headers: finalHeaders,
    body: isFormData ? body : JSON.stringify(body),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || "Request failed")
  }

  return response.json()
}