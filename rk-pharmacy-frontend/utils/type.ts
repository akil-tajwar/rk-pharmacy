import { z } from 'zod'

// ✅ Request schema for registration
export const RegisterRequestSchema = z
  .object({
    username: z.string().min(1, 'Username is required'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z
      .string()
      .min(8, 'Confirm password must be at least 8 characters'),
    fullName: z.string().optional(),
    phone: z.string().optional(),
    division: z.string().optional(),
    district: z.string().optional(),
    address: z.string().optional(),
    active: z.boolean().default(true),
    roleId: z.number().default(2),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>

// ✅ Response schema matching backend response
export const RegisterResponseSchema = z.object({
  status: z.literal('success'),
  data: z.object({
    user: z.object({
      username: z.string(),
      email: z.string().email(),
      roleId: z.number(),
      active: z.boolean(),
      fullName: z.string().optional(),
      phone: z.string().optional(),
      division: z.string().optional(),
      district: z.string().optional(),
      address: z.string().optional(),
    }),
  }),
})

export type RegisterResponse = z.infer<typeof RegisterResponseSchema>

// ✅ Request schema for login (correct)
const SignInRequestSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export type SignInRequest = z.infer<typeof SignInRequestSchema>

// ✅ Response schema matching your backend response
const SignInResponseSchema = z.object({
  data: z.object({
    token: z.string(),
    user: z.object({
      userId: z.number(),
      username: z.string(),
      role: z.number().optional(), // Assuming roleId is returned directly
      // Add other fields as needed from your backend
    }),
  }),
})
export type SignInResponse = z.infer<typeof SignInResponseSchema>

export const categorySchema = z.object({
  id: z.number().int().optional(),
  name: z.string().min(1).max(100),
  categoryType: z.enum(['men', 'kids']),
  isCategoryHead: z.boolean().default(false),
  categoryHeadId: z.number().optional().nullable(),
  sizeType: z.enum([
    'men panjabi',
    'men payjama',
    'men formal shirt',
    'men casual shirt',
    'little kids panjabi',
    'growing kids panjabi',
  ]),
})

export type CreateCategoryType = z.infer<typeof categorySchema>
export type GetCategoryType = z.infer<typeof categorySchema>

export const productSchema = z.object({
  product: z.object({
    id: z.number().optional(),
    productCode: z.string().max(20).optional(),
    name: z.string().max(150),
    description: z.string().nullable().optional(),
    price: z.number(),
    discount: z.number().default(0),
    categoryId: z.number(),
    subCategoryId: z.number(),
    isAvailable: z.boolean().default(true),
    isFlashSale: z.boolean().default(true),
    availableSize: z.array(z.enum(['S', 'M', 'L', 'XL', 'XXL'])),
    createdAt: z.string().optional(),
    categoryName: z.string().optional(),
    subCategoryName: z.string().optional(),
    categoryType: z.string().optional(),
    sizeType: z.string().optional(),
  }),

  photoUrls: z.array(
    z.object({
      id: z.number().optional(),
      productId: z.number().optional(),
      url: z.string(),
    })
  ),
})
export type CreateProductType = z.infer<typeof productSchema>
export type GetProductType = z.infer<typeof productSchema>

export const ordersSchema = z.object({
  orderMaster: z.object({
    id: z.number().optional(),
    userId: z.number().nullable().optional(),
    fullName: z.string().max(255),
    division: z.string().max(15),
    district: z.string().max(15),
    address: z.string().max(100),
    phone: z.string().max(14),
    email: z.string().max(50).nullable().optional(),
    status: z.enum(['pending', 'confirmed', 'delivered']).default('pending'),
    method: z.enum(['bkash', 'nagad', 'rocket']),
    transactionId: z.string().max(255).nullable().optional(),
    totalAmount: z.number(),
    createdAt: z.string().optional(),
  }),

  orderDetails: z.array(
    z.object({
      id: z.number().optional(),
      ordersMasterId: z.number(),
      productId: z.number(),
      productName: z.string().nullable().optional(),
      size: z.enum(['M', 'L', 'XL', 'XXL']),
      quantity: z.number().default(1),
      amount: z.number(),
      createdAt: z.string().optional(),
    })
  ),
})
export type CreateOrderType = z.infer<typeof ordersSchema>
export type GetOrderType = z.infer<typeof ordersSchema>

export const userSchema = z.object({
  userId: z.number().optional(), // auto increment
  username: z.string(),
  email: z.string(),
  password: z.string(),
  active: z.boolean(),
  roleId: z.number(),
  fullName: z.string(),
  phone: z.string(),
  division: z.string(),
  district: z.string(),
  address: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
export type GetUsersType = z.infer<typeof userSchema>
