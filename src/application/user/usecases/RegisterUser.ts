import { Err, Ok, type Result } from "../../common/Result.ts";
import type { IPasswordHasher } from "../../../domain/user/IPasswordHasher.ts";
import type { IUserRepository } from "../../../domain/user/IUserRepository.ts";
import { User } from "../../../domain/user/User.ts";

interface RegisterUserInput {
  name: string;
  email: string;
  dateOfBirth: string;
  password: string;
}

interface RegisterUserOutput {
  message: string;
  user: ReturnType<User["toPublicJSON"]>;
}

export class RegisterUser {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(input: RegisterUserInput): Promise<Result<RegisterUserOutput>> {
    const name = input.name.trim();
    const email = User.normalizeEmail(input.email);
    const dateOfBirth = input.dateOfBirth.trim();
    const password = input.password;

    if (!name || !email || !dateOfBirth || !password) {
      return Err("All registration fields are required.");
    }

    if (!/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{5,}$/.test(password)) {
      return Err(
        "Password should contain at least 5 characters, uppercase, lowercase letters and numbers.",
      );
    }

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      return Err("An account with this email already exists.");
    }

    try {
      const passwordHash = await this.passwordHasher.hash(password);
      const user = User.create({
        id: crypto.randomUUID(),
        name,
        email,
        dateOfBirth,
        passwordHash,
      });

      await this.userRepository.create(user);

      return Ok({
        message: "Registration successful. You can now sign in.",
        user: user.toPublicJSON(),
      });
    } catch (error) {
      return Err(
        error instanceof Error ? error.message : "Unable to register user.",
      );
    }
  }
}
