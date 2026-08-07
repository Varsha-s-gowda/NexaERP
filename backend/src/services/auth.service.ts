import { ApiError } from "../utils/ApiError.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import { comparePassword } from "../utils/password.js";
import { generateToken } from "../utils/jwt.js";
import { AuthRepository } from "../repositories/auth.repository.js";
import type {
  LoginRequest,
  LoginResponse,
} from "../interfaces/auth.interface.js";

export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  async login(data: LoginRequest): Promise<LoginResponse> {
    const user = await this.authRepository.findByEmail(data.email);

    if (!user) {
      throw new ApiError(
        HTTP_STATUS.UNAUTHORIZED,
        "Invalid email or password"
      );
    }

    if (!user.isActive) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "Your account has been deactivated"
      );
    }

    const isPasswordValid = await comparePassword(
      data.password,
      user.password
    );

    if (!isPasswordValid) {
      throw new ApiError(
        HTTP_STATUS.UNAUTHORIZED,
        "Invalid email or password"
      );
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const response: LoginResponse = {
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    };

    return response;
  }
}