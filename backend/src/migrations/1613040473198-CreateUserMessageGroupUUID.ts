import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class CreateUserMessageGroupUUID1613040473198
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'uuid',
        type: 'uuid',
        isGenerated: true,
        generationStrategy: 'uuid',
        isUnique: true
      })
    );
    await queryRunner.addColumn(
      'messages',
      new TableColumn({
        name: 'uuid',
        type: 'uuid',
        isGenerated: true,
        generationStrategy: 'uuid',
        isUnique: true
      })
    );
    await queryRunner.addColumn(
      'groups',
      new TableColumn({
        name: 'uuid',
        type: 'uuid',
        isGenerated: true,
        generationStrategy: 'uuid',
        isUnique: true
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'uuid');
    await queryRunner.dropColumn('messages', 'uuid');
    await queryRunner.dropColumn('groups', 'uuid');
  }
}
