import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { generateToken } from "@/utils/generateToken";

const clientId = process.env.GOOGLE_CLIENT_ID;
const googleClient = clientId ? new OAuth2Client(clientId) : null;

export async function POST(req: Request) {
  await connectDB();

  if (!googleClient || !clientId) {
    return NextResponse.json(
      { error: "Google auth is not configured" },
      { status: 500 }
    );
  }

  const { credential } = await req.json();
  if (!credential) {
    return NextResponse.json({ error: "Missing credential" }, { status: 400 });
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });

    const payload = ticket.getPayload();
    const email = payload?.email;
    const name = payload?.name || "Google User";
    const avatarUrl = payload?.picture;

    if (!email) {
      return NextResponse.json({ error: "Google email missing" }, { status: 400 });
    }

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
        password: "",
        role: "user",
        avatarUrl,
      });
    } else if (!user.avatarUrl && avatarUrl) {
      user.avatarUrl = avatarUrl;
      await user.save();
    }

    const token = generateToken(user._id.toString());
    return NextResponse.json({ user, token });
  } catch {
    return NextResponse.json({ error: "Invalid Google credential" }, { status: 401 });
  }
}

