import { Not, Repository } from 'typeorm';

export default async function AlreadyExists(
  repo: Repository<any>,
  column: string,
  value: any,
  uuid?: string
): Promise<boolean> {
  if (uuid) {
    return (
      (await repo.count({ where: { [column]: value, uuid: Not(uuid) } })) > 0
    );
  }
  return (await repo.count({ where: { [column]: value } })) > 0;
}
