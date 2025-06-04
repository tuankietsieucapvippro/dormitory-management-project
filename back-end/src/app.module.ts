import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Building } from './modules/building/entities/building.entity';
import { Room } from './modules/room/entities/room.entity';
import { Student } from './modules/student/entities/student.entity';
import { Role } from './modules/role/entities/role.entity';
import { PriceList } from './modules/price-list/entities/price-list.entity';
import { Utilities } from './modules/utilities/entities/utility.entity';
import { Account } from './modules/account/entities/account.entity';
import { Invoice } from './modules/invoice/entities/invoice.entity';
import { RoomRegistration } from './modules/room-registration/entities/room-registration.entity';
import { RoomType } from './modules/room-type/entities/room-type.entity';
import { SystemLog } from './modules/system-log/entities/system-log.entity';
import { Semester } from './modules/semester/entities/semester.entity'; // Import Semester entity
import { BuildingModule } from './modules/building/building.module';
import { RoomModule } from './modules/room/room.module';
import { StudentModule } from './modules/student/student.module';
import { RoleModule } from './modules/role/role.module';
import { PriceListModule } from './modules/price-list/price-list.module';
import { UtilitiesModule } from './modules/utilities/utilities.module';
import { AccountModule } from './modules/account/account.module';
import { InvoiceModule } from './modules/invoice/invoice.module';
import { RoomRegistrationModule } from './modules/room-registration/room-registration.module';
import { RoomTypeModule } from './modules/room-type/room-type.module';
import { SystemLogModule } from './modules/system-log/system-log.module';
import { SemesterModule } from './modules/semester/semester.module'; // Import SemesterModule

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '1234',
      database: 'dormitory_data2',
      entities: [Building, Room, Student, Role, PriceList, Utilities, Account, Invoice, RoomRegistration, RoomType, SystemLog, Semester], // Add Semester to entities
      synchronize: false,  // Cấu hình tự động tạo bảng (chỉ dùng trong môi trường phát triển)
    }),
    BuildingModule,
    RoomModule,
    StudentModule,
    RoleModule,
    PriceListModule,
    UtilitiesModule,
    AccountModule,
    InvoiceModule,
    RoomRegistrationModule,
    RoomTypeModule,
    SystemLogModule,
    SemesterModule, // Add SemesterModule to imports
  ],
})
export class AppModule {}
