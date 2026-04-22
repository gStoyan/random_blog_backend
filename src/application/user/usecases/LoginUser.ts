import { Err, Ok, type Result } from "../../common/Result.ts";
import type { IPasswordHasher } from "../../../domain/user/IPasswordHasher.ts";
import type { IUserRepository } from "../../../domain/user/IUserRepository.ts";
import type { IJwtService } from "../../../domain/user/IJwtService.ts";
import { User } from "../../../domain/user/User.ts";

interface LoginUserInput {
  email: string;
  password: string;
}

interface LoginUserOutput {
  token: string;
  user: ReturnType<User["toPublicJSON"]>;
}

export class LoginUser {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly jwtService: IJwtService,
  ) {}

  async execute(input: LoginUserInput): Promise<Result<LoginUserOutput>> {
    const email = User.normalizeEmail(input.email);
    const password = input.password;

    if (!email || !password) {
      return Err("Email and password are required.");
    }

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      return Err("Invalid email or password.");
    }

    const userProps = user.toJSON();
    const isValidPassword = await this.passwordHasher.verify(
      password,
      userProps.passwordHash,
    );

    if (!isValidPassword) {
      return Err("Invalid email or password.");
    }

    try {
      const token = await this.jwtService.generateToken({
        userId: userProps.id,
        email: userProps.email,
        name: userProps.name,
      });

      return Ok({
        token,
        user: user.toPublicJSON(),
      });
    } catch (error) {
      return Err(error instanceof Error ? error.message : "Unable to login.");
    }
  }
}
