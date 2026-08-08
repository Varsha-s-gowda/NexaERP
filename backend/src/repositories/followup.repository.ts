import { prisma } from "../lib/prisma.js";
import type { FollowUpResponse } from "../interfaces/followup.interface.js";

export class FollowUpRepository {
  async create(data: any, createdBy: string): Promise<FollowUpResponse> {
    const followUp = await prisma.customerFollowUp.create({
      data: {
        ...data,
        createdBy,
        followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
      },
    });

    return this.formatResponse(followUp);
  }

  async findById(id: string): Promise<FollowUpResponse | null> {
    const followUp = await prisma.customerFollowUp.findUnique({
      where: { id },
    });

    return followUp ? this.formatResponse(followUp) : null;
  }

  async findByCustomerId(customerId: string): Promise<FollowUpResponse[]> {
    const followUps = await prisma.customerFollowUp.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
    });

    return followUps.map((followUp) => this.formatResponse(followUp));
  }

  async update(id: string, data: any): Promise<FollowUpResponse> {
    const followUp = await prisma.customerFollowUp.update({
      where: { id },
      data: {
        ...data,
        followUpDate: data.followUpDate ? new Date(data.followUpDate) : undefined,
      },
    });

    return this.formatResponse(followUp);
  }

  async delete(id: string): Promise<void> {
    await prisma.customerFollowUp.delete({
      where: { id },
    });
  }

  private formatResponse(followUp: any): FollowUpResponse {
    return {
      id: followUp.id,
      customerId: followUp.customerId,
      notes: followUp.notes,
      followUpDate: followUp.followUpDate?.toISOString() || null,
      createdBy: followUp.createdBy,
      createdAt: followUp.createdAt.toISOString(),
      updatedAt: followUp.updatedAt.toISOString(),
    };
  }
}
