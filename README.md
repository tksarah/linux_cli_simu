# Linux CLI 学習シミュレータ

専門学校などの授業で、初学者がブラウザだけでSSHログインとLinux基本コマンドを練習するための静的Webアプリです。

## 学生の使い方

1. Teamsから講師が配布した授業JSONファイルをダウンロードします。
2. `index.html` をブラウザで開きます。
3. 画面上部の「Teamsからダウンロードした授業JSONを読み込む」でJSONファイルを選択します。
4. 読み込み完了後、右側の「シナリオ」から講師指定のシナリオを選びます。
5. 端末でコマンドを入力して実習します。

最初のSSH練習:

前提:

- ログインユーザーは `student` です。
- 接続先のリモート Linux マシンは `linux-practice` です。

```text
ssh student@linux-practice
```

初回接続時の確認:

```text
yes
```

パスワード:

```text
linux
```

初回接続時は host key fingerprint を表示し、yes/no の確認後にパスワード入力へ進みます。同じページ内で一度接続確認を通過したあとは、次回の ssh で password 入力へ直接進みます。誤ったパスワードは 3 回まで再試行できます。

SSH ログイン課題は、接続開始、host key 確認、パスワード入力、ログイン後プロンプト確認までに絞っています。

標準の必修シナリオとして、次の独立課題も用意しています。

- SSH後確認: `whoami`, `hostname`, `pwd`, `ls -la`
- 教材確認: `cd documents`, `ls`, `cat lesson.txt`
- ログアウト: `exit`

最初の授業では、`SSHログイン` → `SSH後確認` → `教材確認` → `ログアウト` の順で進めると、接続直後の基本動作を短く反復できます。

## 講師の授業準備

講師は授業ごとにJSONファイルを作成し、Teamsで学生に配布します。

このプロジェクトには `sample-scenarios.json` が入っています。これをコピーして授業名、シナリオ名、許可コマンド、課題を編集すると簡単です。

アプリ画面の「講師管理」からも授業JSONを作成できます。現在のテスト用パスワードは `linux123` です。管理画面では授業名、シナリオ名、学生が実行するコマンドを1行ずつ入力し、「JSONをダウンロード」でTeams配布用ファイルを保存できます。

講師管理画面の「ヘルプ表示」では、その時点で現在実行できるコマンド、主なオプション、代表的な引数形式を確認できます。表示が20行を超える場合は、ヘルプ内の「前へ」「次へ」で20行ごとにページ送りします。

管理画面では、講師が次のようにコマンドを並べるだけで、許可コマンド、課題文、厳密判定用の `expect` が自動生成されます。

SSH 課題で `ssh student@linux-practice` を含めた場合は、教材生成時に yes 確認、パスワード入力、ログイン後プロンプト確認まで自動展開されます。

```text
ssh student@linux-practice
mkdir practice
touch practice/report.txt
echo done > practice/report.txt
cat practice/report.txt
```

このパスワードは学生画面には表示されません。ただし、このアプリはブラウザだけで動く静的教材なので、本番運用で強い秘匿が必要な場合はサーバー側認証に移行してください。

```json
{
  "lessonTitle": "第1回 Linux基本操作",
  "scenarios": [
    {
      "label": "パス操作",
      "allowed": ["pwd", "ls", "cd", "cat", "help", "clear"],
      "tasks": [
        {
          "text": "cd documents で移動する",
          "command": "cd documents",
          "expect": { "cwd": "/home/student/documents" }
        }
      ]
    }
  ]
}
```

## JSON項目

- `lessonTitle`: 授業名です。読み込み後の状態表示に使います。
- `scenarios`: シナリオの配列です。
- `label`: 右側の練習モードに表示する名前です。
- `allowed`: そのシナリオで練習対象にするコマンドです。学生画面には表示されません。
- `tasks`: 学生に実施してもらう課題です。

## 厳密な課題判定

課題は文字列でも書けますが、厳密に判定したい場合はオブジェクト形式で `text`、`command`、`expect` を指定してください。

- `command`: 学生が入力すべきコマンドです。空白を正規化したうえで完全一致した場合だけ課題判定に進みます。
- `expect.cwd`: 実行後のカレントディレクトリです。
- `expect.exists`: 実行後に存在しているべきパスです。
- `expect.type`: `exists` の種別です。`file` または `dir` を指定します。
- `expect.file`: 実行後に存在しているべきファイルです。
- `expect.content`: `file` の内容です。末尾改行も含めて一致確認します。
- `expect.notExists`: 実行後に存在してはいけないパスです。
- `expect.loggedIn`: SSHログイン状態です。
- `expect.pendingHostKeyConfirmation`: host key 確認待ち状態です。
- `expect.pendingPassword`: パスワード入力待ち状態です。

課題は「コマンドがエラーなく実行されたこと」と「期待状態が成立したこと」の両方を満たしたときだけ完了になります。
また、完了判定はシナリオ内で常に先頭の未完了課題だけに対して行われます。同じコマンドが後続の課題に再登場しても、前の課題が未完了の間は後続課題を完了扱いにしません。

## 利用できるコマンド

```text
ssh pwd ls cd cat mkdir touch rm cp mv echo head tail grep wc date find sed awk clear help whoami hostname exit
```

主な対応オプション:

- `ls`: `-l`, `-t`, `-r`, `-F`
- `mkdir`: `-p`
- `rm`: `-r`, `-R`, `-f`
- `cp`: `-r`, `-R`
- `mv`: 基本的な移動とリネーム
- `head` / `tail`: `-n`
- `grep`: `-i`, `-n`, `-v`
- `wc`: `-l`, `-w`, `-c`
- `date`: `+%Y-%m-%d` などの一部書式
- `find`: `-name`, `-type f`, `-type d`
- `sed`: `s/pattern/replacement/g`
- `awk`: `{print $1}` と `-F`

`help` は学生画面では使用例を表示し、講師管理画面の「ヘルプ表示」では現在のシナリオで実行できるコマンドだけを、主なオプションと引数形式つきで確認できます。講師向けヘルプは20行ごとにページ送りします。

## 方針

- サーバー不要、ブラウザのみで実行できます。
- 学生PCにはアプリ由来の永続データを残しません。
- `localStorage`、Cookie、IndexedDBは使わず、操作状態はメモリ内だけで保持します。
- 実際のOSコマンドは実行せず、安全な疑似ファイルシステム上で練習します。
- 授業JSONは読み込み時だけブラウザのメモリに展開されます。
- SSH の known hosts 相当の情報もメモリ内だけで保持します。
- 「環境をリセット」は端末環境と SSH 接続履歴を初期化します。読み込んだ授業JSONも消したい場合はページを再読み込みします。
