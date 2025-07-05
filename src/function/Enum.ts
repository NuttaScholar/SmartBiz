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
            return "Already Exists Error"
        case errorCode_e.ForbiddenError:
            return "Forbidden Error"
        case errorCode_e.InUseError:
            return "InUse Error"
        case errorCode_e.InvalidInputError:
            return "Invalid Input Error"
        case errorCode_e.InvalidStateError:
            return "Invalid State Error"
        case errorCode_e.NotFoundError:
            return "Not Found Error"
        case errorCode_e.PermissionDeniedError:
            return "Permission Denied Error"
        case errorCode_e.TimeoutError:
            return "Timeout Error"
        case errorCode_e.TokenExpiredError:
            return "Token Expired Error"
        case errorCode_e.UnauthorizedError:
            return "Unauthorized Error"
        case errorCode_e.UnknownError:
            return "UnknownError"


    }
}