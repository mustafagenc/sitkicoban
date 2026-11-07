import type { Access } from 'payload'

export const isLoggedIn: Access = ({ req }) => Boolean(req.user)
/**
 * Okuma yalnızca giriş yapmış kullanıcıya açık. Site verisini Local API (overrideAccess) ile
 * okur; REST/GraphQL anonim okuma kapalıdır (ör. formHedefEposta sızmasın).
 */
export const adminRead = { read: isLoggedIn }
export const adminWrite = { create: isLoggedIn, update: isLoggedIn, delete: isLoggedIn }
