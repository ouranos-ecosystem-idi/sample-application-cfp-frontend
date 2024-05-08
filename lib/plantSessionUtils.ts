import { repository } from '@/api/repository';
import { Plant } from '@/lib/types';

const sessionKey = 'plants';

/**
 * 事業所一覧をAPIから取得し、セッションストレージに保管する
 * @returns 事業所一覧
 */
export async function setPlants(): Promise<Plant[]> {
  const plants = await repository.getPlants();
  sessionStorage.setItem(sessionKey, JSON.stringify(plants));
  return plants;
}

/**
 * セッションストレージに事業所一覧がある場合はそれを取得し、無い場合はAPIから取得する
 * @returns 事業所一覧
 */
export async function getPlants(): Promise<Plant[]> {
  const item = sessionStorage.getItem(sessionKey);
  if (item === null) {
    return await setPlants();
  }
  try {
    return JSON.parse(item) as Plant[];
  } catch {
    return setPlants();
  }
}
