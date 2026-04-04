export type UserId = string;

export interface UserProps {
  id: UserId;
  name: string;
  email: string;
  dateOfBirth: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  private constructor(private readonly props: UserProps) {}

  static create(input: {
    id: UserId;
    name: string;
    email: string;
    dateOfBirth: string;
    passwordHash: string;
    now?: Date;
  }): User {
    const now = input.now ?? new Date();
    const name = input.name.trim();
    const email = User.normalizeEmail(input.email);
    const dateOfBirth = input.dateOfBirth.trim();
    const passwordHash = input.passwordHash.trim();

    if (!name) throw new Error("Name is required.");
    if (name.length < 2)
      throw new Error("Name must be at least 2 characters long.");
    if (!User.isValidEmail(email))
      throw new Error("A valid email is required.");
    if (!User.isValidDateOfBirth(dateOfBirth)) {
      throw new Error(
        "Date of birth must be a valid date in YYYY-MM-DD format.",
      );
    }
    if (!passwordHash) throw new Error("Password hash is required.");

    return new User({
      id: input.id,
      name,
      email,
      dateOfBirth,
      passwordHash,
      createdAt: now,
      updatedAt: now,
    });
  }

  static rehydrate(props: UserProps): User {
    return new User(props);
  }

  static normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  toJSON(): UserProps {
    return { ...this.props };
  }

  toPublicJSON() {
    return {
      id: this.props.id,
      name: this.props.name,
      email: this.props.email,
      dateOfBirth: this.props.dateOfBirth,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }

  private static isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email);
  }

  private static isValidDateOfBirth(dateOfBirth: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) return false;

    const parsedDate = new Date(`${dateOfBirth}T00:00:00.000Z`);
    if (Number.isNaN(parsedDate.getTime())) return false;

    const now = new Date();
    const today = Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
    );

    return parsedDate.getTime() <= today;
  }
}
