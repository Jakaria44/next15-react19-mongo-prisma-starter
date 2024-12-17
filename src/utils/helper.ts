import bcrypt from "bcryptjs";

export function saltAndHashPassword(password: never) {
  const saltRounds = 10; // Adjust the cost factor according to your security requirements
  const salt = bcrypt.genSaltSync(saltRounds); // Synchronously generate a salt
   // Synchronously hash the password
  return bcrypt.hashSync(password, salt); // Return the hash directly as a string
}
