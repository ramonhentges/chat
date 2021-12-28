import { User } from '@/models/user.model';

export default class UserBuilder {
  private user = new User();

  constructor() {
    this.user.id = '99e42110-e84b-4ce9-ab93-52cc217c76de';
    this.user.username = 'testing';
    this.user.fullName = 'Test User';
    this.user.password = 'Hashed-12345678';
    this.user.createdAt = new Date();
  }

  public static aUser(): UserBuilder {
    return new UserBuilder();
  }

  public newUsername(): UserBuilder {
    this.user.username = 'newuser';
    return this;
  }

  public newId(): UserBuilder {
    this.user.id = '1e63873a-ace2-43b2-bd4b-1040ea2b8c6f';
    return this;
  }

  public build(): User {
    return this.user;
  }
}
