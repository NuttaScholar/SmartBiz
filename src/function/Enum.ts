import { billStatus_e, errorCode_e, role_e } from "../enum";

export function RoleString(data: role_e): string {
    switch (data) {
        case role_e.admin:
            return "Admin";
        case role_e.cashier:
            return "Cashier";
        case role_e.laber:
            return "Laber";
        default:
            return "Unknown";
    }
}
export function BillStatusString(data: billStatus_e): string {
    switch (data) {
        case billStatus_e.preparing:
            return "Preparing";
        case billStatus_e.completed:
            return "Completed";
        case billStatus_e.recording:
            return "Recording";
        case billStatus_e.shipping:
            return "Shipping";
        case billStatus_e.waitingPayment:
            return "Unpaid";
        case billStatus_e.Submitted:
            return "รอหลักฐาน";
        case billStatus_e.PaymentNotified:
            return "ยืนยันการชำระเงิน";
        case billStatus_e.PaymentConfirmed:
            return "ยืนยันแล้ว";
        case billStatus_e.Cancelled:
            return "ยกเลิก";
        default:
            return "Unknown";
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
            return "ยังไม่ได้รับการยืนยันตัวตน";
        case errorCode_e.UnknownError:
            return "UnknownError"
        default:
            return "UnknownError";
    }
}
