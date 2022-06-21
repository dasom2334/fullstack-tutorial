import { Migration } from '@mikro-orm/migrations';

export class Migration20220616172015 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "post" alter column "title" type varchar(255) using ("title"::varchar(255));');
  }

  async down(): Promise<void> {
    this.addSql('alter table "post" alter column "title" type text using ("title"::text);');
  }

}
