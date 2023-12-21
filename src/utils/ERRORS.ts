enum ERRORS {
    CONTACT_ALREADY_EXISTS = "contact_already_exists",
    USER_ALREADY_EXISTS = "user_already_exists",
    USER_DOES_NOT_EXIST = "user_does_not_exists",
    INVALID_CREDENTIALS = "invalid_credentials",
    UNVERIFIED_ACCOUNT = "unverified_account",
    SUSPENDED_ACCOUNT = "suspended_account",
    INVALID_VERIFICATION_CODE = 'verification_code_invalid',
    INVALID_TOKEN = 'token_invalid'
}

export default ERRORS;