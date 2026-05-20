import { Repository } from 'typeorm';

// Frontend sends user.id (auth UUID = artisan_profile.user_id), but DB FK expects artisan_profile.id.
export async function resolveArtisanProfileId(
  repo: Repository<any>,
  idOrUserId: string,
): Promise<string> {
  const [row] = await repo.query(
    `SELECT id FROM artesanos.artisan_profile WHERE id = $1 OR user_id = $1 LIMIT 1`,
    [idOrUserId],
  );
  return row?.id ?? idOrUserId;
}
