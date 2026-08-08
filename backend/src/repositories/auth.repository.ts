import { prisma } from "../lib/prisma.js";
import type { UserSelect } from "../interfaces/auth.interface.js";

export class AuthRepository {
  async findByEmail(email: string): Promise<UserSelect | null> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        fullName: true,
        email: true,
        password: true,
        role: true,
        isActive: true,
      },
    });

    return user;
  }

  async create(email: string, fullName: string, hashedPassword: string) {
    const user = await prisma.user.create({
      data: {
        email,
        fullName,
        password: hashedPassword,
        role: "SALES",
        isActive: true,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
      },
    });

    return user;
  }
}
