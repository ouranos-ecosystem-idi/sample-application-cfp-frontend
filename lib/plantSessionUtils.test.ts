import { repository } from '@/api/repository';
import { getPlants, setPlants } from './plantSessionUtils';
import { Plant } from '@/lib/types';

describe('Plantデータの管理', () => {
  const mockPlants: Plant[] = [
    {
      plantId: 'aaa4',
      openPlantId: '001',
      plantName: 'Plant1',
      plantAddress: 'address1',
    },
    {
      plantId: 'bbb4',
      openPlantId: '002',
      plantName: 'Plant2',
      plantAddress: 'address2',
    },
  ];

  let storage: { [key: string]: any; } = {};
  const sessionStorageMock = () => ({
    getItem(key: string) {
      return storage[key] || null;
    },
    setItem(key: string, value: string) {
      storage[key] = value;
    },
    clear() {
      storage = {};
    },
    removeItem(key: string) {
      delete storage[key];
    },
  });

  beforeEach(() => {
    storage = {};

    // sessionStorageの各メソッドをjest.fn()でモックする
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: jest.fn(sessionStorageMock().getItem),
        setItem: jest.fn(sessionStorageMock().setItem),
        clear: jest.fn(sessionStorageMock().clear),
        removeItem: jest.fn(sessionStorageMock().removeItem),
      },
      writable: true,
    });

    jest.spyOn(repository, 'getPlants').mockResolvedValue(mockPlants);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('setPlantsで事業所データをsessionStorageに保存', async () => {
    await setPlants();
    expect(repository.getPlants).toHaveBeenCalledTimes(1);
    expect(sessionStorage.setItem).toHaveBeenCalledWith(
      'plants',
      JSON.stringify(mockPlants)
    );
    expect(window.sessionStorage.getItem('plants')).toEqual(
      JSON.stringify(mockPlants)
    );
  });

  test('sessionStorageに利用可能なデータがある場合、getPlantsでそのデータを取得', async () => {
    sessionStorage.setItem('plants', JSON.stringify(mockPlants));
    expect(await getPlants()).toEqual(mockPlants);
  });

  test('sessionStorageにplantsデータが存在しない場合、getPlantsがsetPlantsを呼び出してデータを取得および保存', async () => {
    window.sessionStorage.clear();
    await expect(getPlants()).resolves.toEqual(mockPlants);
  });

  test('sessionStorageに不正なJSONデータがある場合、getPlantsがsetPlantsを呼び出してデータを取得', async () => {
    sessionStorage.setItem('plants', '{invalidJSON');
    expect(await getPlants()).toEqual(mockPlants);
  });
});
