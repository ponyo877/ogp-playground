import requests
import csv
import re
from bs4 import BeautifulSoup, Tag

# 定数
KANJIPEDIA_BASE_URL = 'https://www.kanjipedia.jp'
HIRAGANAS = [chr(letter) for letter in range(12354, 12435)]


def katakana_to_hiragana(str):
    # カタカナの文字列をひらがなの文字列に変換して返す
    # 例: 'アイベツリク' → 'あいべつりく'
    return ''.join([chr(ord(char) - 96) if ("ァ" <= char <= "ヴ") else char for char in str])


def utf16_to_letter(str):
    # UTF16 コードポイントを文字列に変換する
    # 例: '0x8ADB' → '諛'
    return int(str, 16).to_bytes(2, byteorder="little").decode('utf-16')


def replace_kanji_img_with_letter(img: Tag):
    # 画像として表示されている漢字の img 要素をテキストに置き換える
    # 例: <img src="/common/images/kanji/16/std_8ADB.png" /> → '諛'
    src = img.attrs.get('src')
    code = re.sub(
        '/common/images/kanji/16/std_([0-9A-Z]+)\.png', '\\1', src)
    letter = utf16_to_letter('0x' + code)
    img.name = 'span'
    img.append(letter)
    img.replaceWithChildren()


def parse_yojijukugo_link(link: Tag):
    # 一覧の中のリンク要素をパースして四字熟語・読み・URLの配列を返す
    for img in link.select('img'):
        replace_kanji_img_with_letter(img)
    [*jukugo, yomi] = [text for text in link.stripped_strings]
    jukugo = ''.join(jukugo)
    yomi = katakana_to_hiragana(yomi)  # カタカナのままで良い場合はコメントアウトする
    url = KANJIPEDIA_BASE_URL + link.attrs.get('href')
    res = requests.get(url)
    soup = BeautifulSoup(res.text, 'html.parser')
    # 説明文を取得
    imi = soup.select_one('#kotobaExplanationSection > p').text
    # print(jukugo, imi)
    return [jukugo, yomi, url, imi]


def parse_yojijukugo_links_page(data: list, hiragana: str, page: int):
    # 一覧ページをパースして data にその結果を入れる
    page_res = requests.get(
        KANJIPEDIA_BASE_URL + '/sakuin/yojijyukugo/' + hiragana + '/' + str(page))
    soup = BeautifulSoup(page_res.text, 'html.parser')
    links = soup.select('#yojiJyukugoResultList > li > a')
    for link in links:
        data.append(parse_yojijukugo_link(link))


if __name__ == "__main__":
    data = []
    for hiragana in HIRAGANAS:
        res = requests.get(KANJIPEDIA_BASE_URL + '/sakuin/yojijyukugo/' + hiragana)
        soup = BeautifulSoup(res.text, 'html.parser')

        # 1ページ目
        parse_yojijukugo_links_page(data, hiragana, 1)

        # そのひらがなの熟語が何ページ目まであるか調べる
        last_page = 1
        pagerLast = soup.select('.pagerLast > a')
        if (len(pagerLast) > 0):
            last_page = int(pagerLast[0].attrs.get('href').split('/')[-1])

        # 2ページ目以降がある場合は追加で取得
        if (last_page >= 2):
            for page in range(2, last_page + 1):
                parse_yojijukugo_links_page(data, hiragana, page)


    # CSV に保存
    with open('./out.csv', 'w') as f:
        writer = csv.writer(f)
        writer.writerows(data)
