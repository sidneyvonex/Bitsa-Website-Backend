/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - password
 *         - schoolId
 *         - major
 *       properties:
 *         firstName:
 *           type: string
 *           example: John
 *         lastName:
 *           type: string
 *           example: Doe
 *         email:
 *           type: string
 *           format: email
 *           example: john.doe@student.ueab.ac.ke
 *         password:
 *           type: string
 *           format: password
 *           minLength: 6
 *           example: securePassword123
 *         schoolId:
 *           type: string
 *           example: SCT211-0001/2021
 *         schoolName:
 *           type: string
 *           example: University of Eastern Africa Baraton
 *         major:
 *           type: string
 *           enum: [Software Engineering, Networking, Cybersecurity, BBIT, Data Science, Other]
 *           example: Software Engineering
 *         yearOfStudy:
 *           type: integer
 *           minimum: 1
 *           maximum: 6
 *           example: 3
 *         userRole:
 *           type: string
 *           enum: [student, admin, superadmin]
 *           example: student
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: john.doe@student.ueab.ac.ke
 *         password:
 *           type: string
 *           format: password
 *           example: securePassword123
 *     LoginResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *         userId:
 *           type: string
 *           example: SCT211-0001/2021
 *         email:
 *           type: string
 *           example: john.doe@student.ueab.ac.ke
 *         fullName:
 *           type: string
 *           example: John Doe
 *         userRole:
 *           type: string
 *           example: student
 *         profileUrl:
 *           type: string
 *           nullable: true
 *           example: https://example.com/profile.jpg
 *     ForgotPasswordRequest:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: john.doe@student.ueab.ac.ke
 *     ResetPasswordRequest:
 *       type: object
 *       required:
 *         - token
 *         - newPassword
 *       properties:
 *         token:
 *           type: string
 *           example: abc123def456...
 *         newPassword:
 *           type: string
 *           format: password
 *           minLength: 6
 *           example: newSecurePassword123
 *     VerifyEmailRequest:
 *       type: object
 *       required:
 *         - token
 *       properties:
 *         token:
 *           type: string
 *           example: xyz789uvw012...
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: Invalid credentials
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: Operation completed successfully
 */
