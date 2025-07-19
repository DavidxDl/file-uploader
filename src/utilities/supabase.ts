import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../../database.types";
import { Express } from "express";
import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";

export default function getSupabaseClient(
  user: Express.User,
): SupabaseClient<Database> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;
  const token = jwt.sign(
    {
      sub: user.id,
      name: user.name,
      iat: Math.floor(Date.now() / 1000),
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" },
  );

  const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
    global: {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : null,
    },
  });

  return supabase;
}
