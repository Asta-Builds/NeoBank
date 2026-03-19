import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CryptoUtil } from '../../common/utils/crypto.util';
export declare class UsersService {
    private readonly userRepository;
    private readonly cryptoUtil;
    constructor(userRepository: Repository<User>, cryptoUtil: CryptoUtil);
    create(userData: Partial<User>): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    update(id: string, updateData: Partial<User>): Promise<User>;
    private decryptUser;
}
