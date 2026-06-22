/**
 * @deprecated This module is deprecated as part of duplicate-validation cleanup.
 *
 * All field validation rules (email, password, name) are now defined exclusively
 * in Zod schemas under `src/schemas/auth.schema.ts` and consumed via
 * `zodResolver` in React Hook Form. Keeping this file risks rule drift.
 *
 * Migration examples:
 *   Before:        validateEmail(email).isValid
 *   After (Zod):   loginSchema.safeParse({ email, password }).success
 *
 * If you need standalone validation outside RHF, import the relevant Zod schema
 * directly from `src/schemas/auth.schema.ts` and call `.safeParse()`.
 */
