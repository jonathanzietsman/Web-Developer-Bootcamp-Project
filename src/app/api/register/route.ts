// src/app/api/register/route.ts
import { NextResponse } from "next/server";
import { db } from "@/server/db";
import bcrypt from "bcrypt";

interface RegisterRequestBody {
  name?: string;
  email?: string;
  password?: string;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RegisterRequestBody;
    const { name, email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: "Missing email or password." },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim();
    const trimmedName = name?.trim();

    const existingUser = await db.user.findUnique({
      where: { email: trimmedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await db.user.create({
      data: {
        name: trimmedName ?? null,
        email: trimmedEmail,
        password: hashedPassword,
      },
    });

    return NextResponse.json(
      { message: "User registered successfully.", userId: user.id },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}