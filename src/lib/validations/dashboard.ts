import { z } from "zod";



export const newCarSchema = z.object({
    name: z.string().min(1, "Ism kiritilmadi"),
    car_type_id: z.string().min(1, "Mashina turi tanlanmadi"),
    images: z.any(),
    price_per_day: z.coerce.number(),
    original_price: z.coerce.number(),
    fuel_type: z.string().min(1, "Yoqilg'i turi tanlanmadi"),
    transmission: z.string().min(1, "Boshqaruv turi tanlanmadi"),
    capacity: z.coerce.number(),
    fuel_capacity: z.coerce.number(),
    description: z.string().min(1, "Tavsif kiritilmadi"),
})
export type NewCarForm = z.infer<typeof newCarSchema >



export const newCarTypeSchema = z.object({
    name: z.string().min(1, "Nom kiritilmadi"),
    description: z.string().min(1, "Tavsif kiritilmadi"),
});

export type NewCarTypeForm = z.infer<typeof newCarTypeSchema>


export const newUserSchema = z.object({
    first_name: z.string().min(1, "Ism kiritilmadi"),
    last_name: z.string().min(1, "Familiya kiritilmadi"),
    email: z.string().email("Email formati xato"),
    password: z.string().min(4, "Parol 4 ta belgidan iborat bo'lishi kerak"),
    is_admin: z.boolean(),
    is_active: z.boolean(),
});

export type NewUserForm = z.infer<typeof newUserSchema>