import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/domains/user/entities/user.entity';
import { Repository } from 'typeorm';
import { PasswordRecovery } from './entities/password-recovery.entity';

@Injectable()
export class PasswordRecoveryService {

  constructor(private mailService: MailerService,
              @InjectRepository(User)
              private userRepository: Repository<User>,
              @InjectRepository(PasswordRecovery)
              private passwordRecoveryRepository: Repository<PasswordRecovery>){}

              
  async sendRecoveryLinkByEmail(userEmail: string){
    const user = await this.userRepository.findOne({where: {emailAddress: userEmail}});

    if (user) {
      const token = Math.random().toString(20).substring(2, 12);
      const passwordRecoveryObject = {
        emailAddress: userEmail,
        token: token,
        createdDate: new Date()
      }
      await this.passwordRecoveryRepository.save(passwordRecoveryObject);
      
      const recoveryLink = `Recover your password here: http://localhost:4200/password-recovery/${token}`;

      try{
        return await this.mailService.sendMail({
          to: userEmail,
          from: `Generic Motor <${process.env.EMAIL_ADDRESS}>`,
          subject: 'Password Recovery',
          text: recoveryLink
        });
      }
      catch{
        throw new BadRequestException('An error occured to send the link to your email address.')
      }
    }
    else{
      throw new NotFoundException("This email address doesn't exist.")
    }
  }

}
