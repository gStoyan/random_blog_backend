import type { IUserRepository } from "../../domain/user/IUserRepository.ts";
import { User } from "../../domain/user/User.ts";

type StoredUser = {
  id: string;
  name: string;
  email: string;
  dateOfBirth: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
};

export class KvUserRepository implements IUserRepository {
  constructor(private readonly kv: Deno.Kv) {}

  async findByEmail(email: string): Promise<User | null> {
    const normalizedEmail = User.normalizeEmail(email);
    const result = await this.kv.get<StoredUser>(["users", normalizedEmail]);
    const storedUser = result.value;

    if (!storedUser) {
      return null;
    }

    return User.rehydrate({
      id: storedUser.id,
      name: storedUser.name,
      email: storedUser.email,
      dateOfBirth: storedUser.dateOfBirth,
      passwordHash: storedUser.passwordHash,
      createdAt: new Date(storedUser.createdAt),
      updatedAt: new Date(storedUser.updatedAt),
    });
  }

  async create(user: User): Promise<void> {
    const data = user.toJSON();
    const normalizedEmail = User.normalizeEmail(data.email);

    await this.kv.set(["users", normalizedEmail], {
      id: data.id,
      name: data.name,
      email: data.email,
      dateOfBirth: data.dateOfBirth,
      passwordHash: data.passwordHash,
      createdAt: data.createdAt.toISOString(),
      updatedAt: data.updatedAt.toISOString(),
    } satisfies StoredUser);
  }
}
