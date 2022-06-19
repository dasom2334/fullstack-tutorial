import { Migration } from '@mikro-orm/migrations';

export class Migration20220618081526 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "user" ("_id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "title" varchar(255) not null);');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "user" cascade;');
  }

}
