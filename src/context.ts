import { createContext } from 'react';
import { Auth_t } from './API/LoginService/type';

export const AuthContext = createContext<Auth_t|null>(null);