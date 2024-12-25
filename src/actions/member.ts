"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const UpdateMemberSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "BLOCKED"], {
    errorMap: () => ({ message: "Invalid status value" }),
  }),
});

export type MemberUpdateState = {
  errors?: {
    status?: string[];
    global?: string[];
  };
  message?: string;
  success?: boolean;
};

export async function updateMemberStatus(
  prevState: MemberUpdateState,
  formData: FormData
): Promise<MemberUpdateState> {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return {
        errors: {
          global: ["Unauthorized access"],
        },
        success: false,
      };
    }

    const validationResult = UpdateMemberSchema.safeParse({
      userId: formData.get("userId"),
      status: formData.get("status"),
    });

    if (!validationResult.success) {
      const errors = validationResult.error.flatten().fieldErrors;
      return {
        errors: {
          status: errors.status || [],
          global: errors.userId || [],
        },
        success: false,
      };
    }

    const { userId, status } = validationResult.data;

    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return {
        errors: {
          global: ["User not found"],
        },
        success: false,
      };
    }

    await db.user.update({
      where: { id: userId },
      data: {
        status,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/dashboard/members");

    return {
      message: `Member status updated to ${status.toLowerCase()} successfully`,
      success: true,
    };
  } catch (error) {
    console.error("Error updating member status:", error);
    return {
      errors: {
        global: ["An unexpected error occurred while updating member status"],
      },
      success: false,
    };
  }
}
