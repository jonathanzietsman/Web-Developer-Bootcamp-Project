// src/app/api/register/route.ts
import { NextResponse } from "next/server";
import { db } from "@/server/db";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: "Missing email or password." },
        { status: 400 }
      );
    }

    const existingUser = await db.user.findUnique({
      where: { email: email.trim() },
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
        name: name ? name.trim() : null,
        email: email.trim(),
        password: hashedPassword,
      },
    });

    return NextResponse.json(
      { message: "User registered successfully.", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}