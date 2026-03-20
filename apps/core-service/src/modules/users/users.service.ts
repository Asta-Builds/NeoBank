import {
  Injectable,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CryptoUtil } from '@neobank/common';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly cryptoUtil: CryptoUtil,
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    if (!userData.email || !userData.phone) {
      throw new BadRequestException('Email and phone are required');
    }
    const encryptedEmail = this.cryptoUtil.encrypt(userData.email);
    const encryptedPhone = this.cryptoUtil.encrypt(userData.phone);

    const existingUser = await this.userRepository.findOne({
      where: [{ email: encryptedEmail }, { phone: encryptedPhone }],
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const user = this.userRepository.create({
      ...userData,
      email: encryptedEmail,
      phone: encryptedPhone,
    });

    return this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    const encryptedEmail = this.cryptoUtil.encrypt(email);
    const user = await this.userRepository.findOne({
      where: { email: encryptedEmail },
    });
    return user ? this.decryptUser(user) : null;
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { id } });
    return user ? this.decryptUser(user) : null;
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new Error('User not found');
    }

    if (updateData.email) {
      updateData.email = this.cryptoUtil.encrypt(updateData.email);
    }
    if (updateData.phone) {
      updateData.phone = this.cryptoUtil.encrypt(updateData.phone);
    }
    if (updateData.mfaSecret) {
      updateData.mfaSecret = this.cryptoUtil.encrypt(updateData.mfaSecret);
    }

    Object.assign(user, updateData);
    return this.userRepository.save(user);
  }

  private decryptUser(user: User): User {
    return {
      ...user,
      email: this.cryptoUtil.decrypt(user.email),
      phone: this.cryptoUtil.decrypt(user.phone),
      mfaSecret: user.mfaSecret
        ? this.cryptoUtil.decrypt(user.mfaSecret)
        : null,
    };
  }
}
