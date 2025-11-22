import { errorCode_e, role_e } from "../enum";

export function RoleString(data: role_e): string {
    switch (data) {
        case role_e.admin:
            return "Admin";
        case role_e.cashier:
            return "Cashier";
        case role_e.laber:
            return "Laber";
    }
}
export function ErrorString(data: errorCode_e): string {
    switch (data) {
        case errorCode_e.AlreadyExistsError:
            return "ข้อมูลนี้มีอยู่แล้ว";
        case errorCode_e.ForbiddenError:
            return "ไม่ได้รับอนุญาต";
        case errorCode_e.InUseError:
            return "ข้อมูลยังถูกใช้งานอยู่";
        case errorCode_e.InvalidInputError:
            return "ข้อมูลนำเข้าไม่ถูกต้อง";
        case errorCode_e.InvalidStateError:
            return "สถานะไม่ถูกต้องสำหรับการดำเนินการ";
        case errorCode_e.NotFoundError:
            return "ไม่พบข้อมูลที่ร้องขอ";
        case errorCode_e.PermissionDeniedError:
            return "สิทธิ์การเข้าถึงถูกปฏิเสธ";
        case errorCode_e.TimeoutError:
            return "คำขอหมดเวลา"
        case errorCode_e.TokenExpiredError:
            return "Token หมดอายุ";
        case errorCode_e.UnauthorizedError:
            return "ยไม่ได้รับการยืนยันตัวตน";
        case errorCode_e.UnknownError:
            return "UnknownError"
    }
}