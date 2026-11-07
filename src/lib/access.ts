import type { Access } from 'payload'

export const isLoggedIn: Access = ({ req }) => Boolean(req.user)
export const publicRead = { read: () => true }
export const adminWrite = { create: isLoggedIn, update: isLoggedIn, delete: isLoggedIn }
