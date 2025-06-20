import { role_e } from "../enum";

export function RoleString(data:role_e):string{
    switch(data){
        case role_e.admin:
        return "Admin";
        case role_e.cashier:
        return "Cashier";
        case role_e.laber:
        return "Laber";
    }
}