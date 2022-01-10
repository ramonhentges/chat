import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey
} from 'typeorm';

export class CreateMessageReadedAt1641857416326 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'readed_by',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isGenerated: true,
            generationStrategy: 'uuid',
            isPrimary: true
          },
          {
            name: 'userId',
            type: 'uuid'
          },
          {
            name: 'messageId',
            type: 'uuid'
          },
          {
            name: 'readedAt',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP'
          }
        ]
      })
    );

    await queryRunner.createForeignKey(
      'readed_by',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE'
      })
    );

    await queryRunner.createForeignKey(
      'readed_by',
      new TableForeignKey({
        columnNames: ['messageId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'messages',
        onDelete: 'CASCADE'
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('readed_by');
  }
}
