import { ApiError } from "../utils/ApiError.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import { comparePassword, hashPassword } from "../utils/password.js";
import { generateToken } from "../utils/jwt.js";
import { AuthRepository } from "../repositories/auth.repository.js";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
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

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const existingUser = await this.authRepository.findByEmail(data.email);

    if (existingUser) {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        "Email already registered"
      );
    }

    const hashedPassword = await hashPassword(data.password);

    const role = data.role && ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'].includes(data.role)
      ? data.role
      : 'SALES';

    const user = await this.authRepository.create(
      data.email,
      data.fullName,
      hashedPassword,
      role
    );

    const response: RegisterResponse = {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    };

    return response;
  }

  async listUsers() {
    return await this.authRepository.findAll();
  }

  async updateUser(id: string, data: any) {
    // allow updating fullName, role, isActive, and password
    const updateData: any = {};
    if (data.fullName) updateData.fullName = data.fullName;
    if (data.role && ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'].includes(data.role)) updateData.role = data.role;
    if (typeof data.isActive === 'boolean') updateData.isActive = data.isActive;
    if (data.password) {
      updateData.password = await hashPassword(data.password);
    }

    const user = await this.authRepository.update(id, updateData);
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    };
  }

  async deleteUser(id: string) {
    await this.authRepository.delete(id);
  }
}