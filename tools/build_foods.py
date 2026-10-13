"""식약처 식품영양성분 DB(음식) JSON → assets/data/foods.json

사용: python3 tools/build_foods.py <내려받은 음식 JSON> 
원본 파일(약 30MB)은 저장소에 넣지 않는다.
출력 한 줄: [이름, 업체, 대표식품, 1회 제공량, 단위, kcal, 탄, 단, 지, 추정여부]
 - 원본 값은 100g(ml)당 → 1회 제공량(식품중량) 기준으로 환산
 - 프랜차이즈 영양정보는 탄수화물·지방이 비어 있는 경우가 많아,
   지방 ≈ 포화지방 × 2.2(같은 출처에서 둘 다 있는 메뉴의 중앙값 근처),
   탄수 = (열량 − 단백질×4 − 지방×9) ÷ 4 (당류보다 작지 않게)로 추정하고 추정=1
"""
import json, re, sys

PRI = {'가정식(분석 함량)': 0, '외식(분석함량)': 1, '외식(재료량 기반 산출함량)': 2,
       '외식(프랜차이즈 등 업체 제공 영양정보)': 3, '산업체급식(재료량 기반 산출 함량)': 4,
       '중고등학교급식(재료량 기반 산출함량)': 5, '초등학교급식(재료량 기반 산출 함량)': 6}

def num(s):
    s = (s or '').strip()
    try:
        return float(s)
    except ValueError:
        return None

def main(src, dst):
    recs = json.load(open(src, encoding='utf-8'))['records']
    best = {}
    for x in recs:
        k, c, p, f = (num(x[n]) for n in ('에너지(kcal)', '탄수화물(g)', '단백질(g)', '지방(g)'))
        sug, sat = num(x['당류(g)']), num(x['포화지방산(g)'])
        m = re.match(r'([0-9.]+)\s*(g|ml)', x['식품중량'] or '')
        if k is None or p is None or not m:
            continue
        w, unit = float(m.group(1)), m.group(2)
        if not (0 < w <= 3000):
            continue
        est = 0
        if c is None or f is None:
            est = 1
            rest = max(0.0, k - 4 * p)
            if f is None:
                f = min(sat * 2.2, rest / 9) if sat is not None else (rest - 4 * (c if c is not None else rest * .55 / 4)) / 9
                f = max(0.0, f)
            if c is None:
                c = max(sug or 0.0, (rest - 9 * f) / 4)
        r = w / 100
        brand = x['업체명'].strip()
        brand = '' if brand in ('해당없음', '') else brand
        rep = x['대표식품명'].strip()
        name = x['식품명'].strip()
        if '_' in name:  # 프랜차이즈는 '대표식품_메뉴' → 메뉴, 그 밖엔 '달걀_삶은것' → '달걀 삶은것'
            a, b = name.split('_', 1)
            name = b.strip() if brand and a.strip() == rep else name.replace('_', ' ')
        key = (name, brand)
        row = [name, brand, rep if rep != name else '', round(w), unit,
               round(k * r), round(c * r, 1), round(p * r, 1), round(f * r, 1), est]
        pr = PRI.get(x['식품기원명'], 9)
        if key not in best or pr < best[key][0]:
            best[key] = (pr, row)
    rows = [v[1] for v in best.values()]
    rows.sort(key=lambda r: (r[1] != '', r[0]))
    out = {'src': '식품의약품안전처 식품영양성분 데이터베이스(음식)', 'n': len(rows), 'd': rows}
    with open(dst, 'w', encoding='utf-8') as fp:
        json.dump(out, fp, ensure_ascii=False, separators=(',', ':'))
    print(len(rows), 'rows, estimated', sum(r[9] for r in rows))

if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else 'assets/data/foods.json')
