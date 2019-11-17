import { getLectureById, searchLectures } from '../src/store/api/lectures'
import res_tomato from './data/response_1572494666201.json'
import res_GB11514 from './data/response_1572495022957.json'

describe('授業名での検索 searchLectures', () => {
  it('search トマト -> オートマトン', async () => {
    const data = await searchLectures('トマト', 2019)
    expect(data).toMatchObject(res_tomato)
  })
  it('search ンゴー(no match)', async () => {
    const data = await searchLectures('ンゴー', 2019)
    expect(data).toBeNull
  })
})

describe('IDでの授業の検索 getLectureById', () => {
  it('GB11514 -> シミュレーション物理', async () => {
    const data = await getLectureById('GB11514', 2019)
    expect(data).toMatchObject(res_GB11514)
  })
  it('GB114514(no match)', async () => {
    const data = await getLectureById('GB114514', 2019)
    expect(data).toBeNull
  })
})
