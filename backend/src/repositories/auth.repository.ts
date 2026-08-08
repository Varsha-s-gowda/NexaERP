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

  async create(email: string, fullName: string, hashedPassword: string, role: string = 'SALES') {
    const user = await prisma.user.create({
      data: {
        email,
        fullName,
        password: hashedPassword,
        role: role as any,
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

  async findAll() {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return users;
  }

  async update(id: string, data: any) {
    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
      },
    });

    return user;
  }

  async delete(id: string) {
    await prisma.user.delete({ where: { id } });
  }
}
