import jwt from "jsonwebtoken";

const generateToken = (id: string, isPremium: boolean) => {
  return jwt.sign({ id, isPremium }, process.env.JWT_SECRET as string, {
    expiresIn: "30d",
  });
};
