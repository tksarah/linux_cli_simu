const terminalOutput = document.querySelector("#terminalOutput");
const commandForm = document.querySelector("#commandForm");
const commandInput = document.querySelector("#commandInput");
const promptLabel = document.querySelector("#promptLabel");
const sessionStatus = document.querySelector("#sessionStatus");
const scenarioButtons = document.querySelector("#scenarioButtons");
const taskList = document.querySelector("#taskList");
const scenarioCompleteStatus = document.querySelector("#scenarioCompleteStatus");
const nextScenarioButton = document.querySelector("#nextScenarioButton");
const resetButton = document.querySelector("#resetButton");
const helpButton = document.querySelector("#helpButton");
const openAdminButton = document.querySelector("#openAdminButton");
const adminPasswordDialog = document.querySelector("#adminPasswordDialog");
const adminPasswordForm = document.querySelector("#adminPasswordForm");
const adminPasswordInput = document.querySelector("#adminPasswordInput");
const adminPasswordError = document.querySelector("#adminPasswordError");
const cancelAdminLogin = document.querySelector("#cancelAdminLogin");
const adminHelpDialog = document.querySelector("#adminHelpDialog");
const adminHelpContent = document.querySelector("#adminHelpContent");
const adminHelpPageInfo = document.querySelector("#adminHelpPageInfo");
const adminHelpPrevPage = document.querySelector("#adminHelpPrevPage");
const adminHelpNextPage = document.querySelector("#adminHelpNextPage");
const closeAdminHelp = document.querySelector("#closeAdminHelp");
const adminScreen = document.querySelector("#adminScreen");
const closeAdminButton = document.querySelector("#closeAdminButton");
const adminScenarioForm = document.querySelector("#adminScenarioForm");
const adminLessonTitle = document.querySelector("#adminLessonTitle");
const adminScenarioLabel = document.querySelector("#adminScenarioLabel");
const adminCommandList = document.querySelector("#adminCommandList");
const adminScenarioError = document.querySelector("#adminScenarioError");
const adminJsonPreview = document.querySelector("#adminJsonPreview");
const adminMergeFiles = document.querySelector("#adminMergeFiles");
const adminMergeQueue = document.querySelector("#adminMergeQueue");
const applyAdminMerge = document.querySelector("#applyAdminMerge");
const clearAdminMergeQueue = document.querySelector("#clearAdminMergeQueue");
const adminMergeStatus = document.querySelector("#adminMergeStatus");
const downloadScenarioJson = document.querySelector("#downloadScenarioJson");
const resetAdminJson = document.querySelector("#resetAdminJson");
const startAdminTest = document.querySelector("#startAdminTest");
const resetAdminTest = document.querySelector("#resetAdminTest");
const adminTerminalOutput = document.querySelector("#adminTerminalOutput");
const adminCommandForm = document.querySelector("#adminCommandForm");
const adminCommandInput = document.querySelector("#adminCommandInput");
const adminPromptLabel = document.querySelector("#adminPromptLabel");
const adminTestStatus = document.querySelector("#adminTestStatus");
const adminTaskList = document.querySelector("#adminTaskList");
const studentScenarioFile = document.querySelector("#studentScenarioFile");
const studentDropzone = document.querySelector("#studentDropzone");
const scenarioLoadStatus = document.querySelector("#scenarioLoadStatus");

const commandCatalog = [
  "ssh", "pwd", "ls", "cd", "cat", "mkdir", "touch", "rm",
  "cp", "mv", "echo", "more", "tee", "clear", "help", "whoami", "hostname", "exit"
];
const COMMAND_HELP_ENTRIES = {
  ssh: {
    usage: "ssh student@linux-practice",
    options: [],
    note: "接続先は student@linux-practice 固定です"
  },
  pwd: {
    usage: "pwd",
    options: []
  },
  ls: {
    usage: "ls [-l] [-t] [-r] [-F] [path]",
    options: ["-l", "-t", "-r", "-F"]
  },
  cd: {
    usage: "cd <directory>",
    options: []
  },
  cat: {
    usage: "cat <file>",
    options: []
  },
  mkdir: {
    usage: "mkdir [-p] <directory>",
    options: ["-p"]
  },
  touch: {
    usage: "touch <file>",
    options: []
  },
  rm: {
    usage: "rm [-i] [-r|-R] [-f] <path>",
    options: ["-i", "-r", "-R", "-f"]
  },
  cp: {
    usage: "cp [-r|-R] <source> <destination>",
    options: ["-r", "-R"]
  },
  mv: {
    usage: "mv <source> <destination>",
    options: []
  },
  echo: {
    usage: "echo <text> [> <file>]",
    options: []
  },
  more: {
    usage: "more <file>",
    options: []
  },
  tee: {
    usage: "tee [-a] <file>",
    options: ["-a"],
    note: "標準入力を画面に表示しながらファイルにも保存します"
  },
  clear: {
    usage: "clear",
    options: []
  },
  help: {
    usage: "help",
    options: [],
    note: "学生端末では使用例、講師画面では現在許可されているコマンド一覧を表示します"
  },
  whoami: {
    usage: "whoami",
    options: []
  },
  hostname: {
    usage: "hostname",
    options: []
  },
  exit: {
    usage: "exit",
    options: []
  },
  head: {
    usage: "head [-n <lines>] <file>",
    options: ["-n <lines>"]
  },
  tail: {
    usage: "tail [-n <lines>] <file>",
    options: ["-n <lines>"]
  },
  grep: {
    usage: "grep [-i] [-n] [-v] <pattern> <file>",
    options: ["-i", "-n", "-v"]
  },
  wc: {
    usage: "wc [-l] [-w] [-c] <file>",
    options: ["-l", "-w", "-c"]
  },
  date: {
    usage: "date [+format]",
    options: ["+%Y-%m-%d など"]
  },
  find: {
    usage: "find <path> [-name <pattern>] [-type f|d]",
    options: ["-name <pattern>", "-type f", "-type d"]
  },
  sed: {
    usage: "sed s/<pattern>/<replacement>/g <file>",
    options: []
  },
  awk: {
    usage: "awk [-F <separator>] '{print $1}' <file>",
    options: ["-F <separator>"]
  }
};
const ADMIN_HELP_PAGE_SIZE = 20;
const INSTRUCTOR_PASSWORD = "linux123";
const SSH_TARGET = "student@linux-practice";
const SSH_PASSWORD = "linux";
const SSH_MAX_PASSWORD_ATTEMPTS = 3;
const SSH_HOST_FINGERPRINT = "SHA256:Q8i7MZ0P1nV4m0sB8xJ9cL2rW5kT6yH3dF1pN7aS4eU";
const adminPackage = {
  lessonTitle: "",
  scenarios: []
};
let adminMergeQueueItems = [];
let adminMergeQueueCount = 0;
let outputCapture = null;
let currentStdin = null;
let lastCommandResult = { stdout: "", stderr: "" };
let commandOutputCapture = null;

const ADMIN_RUNTIME_NAME = "admin";
const ADMIN_PREVIEW_KEY = "preview";
const EMPTY_ADMIN_SCENARIO = {
  label: "試験前",
  allowed: ["help", "clear"],
  tasks: []
};
["head", "tail", "grep", "wc", "date", "find", "sed", "awk"].forEach((command) => {
  if (!commandCatalog.includes(command)) commandCatalog.push(command);
});

const scenarios = {
  login: {
    label: "SSHログイン",
    allowed: ["ssh", "help", "clear"],
    tasks: [
      { text: "ssh student@linux-practice を実行する", command: "ssh student@linux-practice", expect: { pendingHostKeyConfirmation: true } },
      { text: "yes と入力して接続を続ける", command: "yes", expect: { pendingPassword: true } },
      { text: "パスワード linux を入力する", command: "linux", expect: { loggedIn: true, user: "student", host: "linux-practice" } },
      { text: "ログイン後のプロンプトを確認する", command: "linux", expect: { loggedIn: true, cwd: "/home/student" } }
    ]
  },
  postLoginCheck: {
    label: "SSH後確認",
    allowed: ["whoami", "pwd", "ls", "help", "clear", "hostname", "exit"],
    tasks: [
      { text: "whoami を実行してログインユーザーを確認する", command: "whoami", expect: { loggedIn: true, user: "student" } },
      { text: "hostname を実行して接続先ホスト名を確認する", command: "hostname", expect: { loggedIn: true, host: "linux-practice" } },
      { text: "pwd を実行して現在地が /home/student であることを確認する", command: "pwd", expect: { loggedIn: true, cwd: "/home/student" } },
      { text: "ls -la を実行してホームディレクトリの一覧を確認する", command: "ls -la", expect: { exists: "/home/student", type: "dir" } }
    ]
  },
  logout: {
    label: "ログアウト",
    allowed: ["help", "clear", "exit"],
    tasks: [
      { text: "exit を実行して SSH セッションを終了する", command: "exit", expect: { loggedIn: false } }
    ]
  }
};

const DEFAULT_LS_MTIME = new Date("2022-02-22T00:00:00Z");
const RECENT_LS_MTIME = new Date("2026-05-04T00:00:00Z");

function createDirNode(children = [], meta = {}) {
  return {
    type: "dir",
    children: [...children],
    mode: meta.mode || "drwxr-xr-x",
    owner: meta.owner || "root",
    group: meta.group || "root",
    size: meta.size ?? 4096,
    links: meta.links ?? 2,
    mtime: meta.mtime || DEFAULT_LS_MTIME
  };
}

function createFileNode(content = "", meta = {}) {
  return {
    type: "file",
    content,
    mode: meta.mode || "-rw-r--r--",
    owner: meta.owner || "root",
    group: meta.group || "root",
    size: meta.size ?? content.length,
    links: meta.links ?? 1,
    mtime: meta.mtime || RECENT_LS_MTIME
  };
}

function blockCount(node) {
  return Math.max(1, Math.ceil((node.size ?? 0) / 1024));
}

function formatLsDate(value) {
  const date = value instanceof Date ? value : new Date(value);
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = monthNames[date.getUTCMonth()] || "Jan";
  const day = String(date.getUTCDate()).padStart(2, " ");
  const year = String(date.getUTCFullYear());
  return `${month} ${day}  ${year}`;
}

function formatLsLongEntry(path, node) {
  const name = basename(path);
  const size = String(node.size ?? 0).padStart(5, " ");
  return `${node.mode || (node.type === "dir" ? "drwxr-xr-x" : "-rw-r--r--")} ${node.links ?? (node.type === "dir" ? 2 : 1)} ${node.owner || "root"} ${node.group || "root"} ${size} ${formatLsDate(node.mtime)} ${name}`;
}

function createInitialState() {
  return {
    loggedIn: false,
    user: "guest",
    host: "browser",
    cwd: "/home/student",
    fs: {
      "/": createDirNode(["home", "etc", "usr", "var"], { owner: "root", group: "root", mtime: DEFAULT_LS_MTIME }),
      "/home": createDirNode(["student", "user01"], { owner: "root", group: "root", mtime: DEFAULT_LS_MTIME }),
      "/home/student": createDirNode([".bashrc", ".hidden", "demo.txt", "documents", "long-text-simulator.txt", "old.txt", "readme.txt", "recent.txt", "sample.txt", "sample_dir"], { owner: "student", group: "student", mtime: RECENT_LS_MTIME }),
      "/home/user01": createDirNode([], { owner: "user01", group: "user01", mtime: RECENT_LS_MTIME }),
      "/home/student/.bashrc": createFileNode("# ~/.bashrc simulated\nexport PATH=$PATH:/home/student/bin\n", { owner: "student", group: "student", mtime: new Date("2021-12-01T00:00:00Z") }),
      "/home/student/.hidden": createFileNode("This is a hidden file.\n", { owner: "student", group: "student", mtime: new Date("2021-11-01T00:00:00Z") }),
      "/home/student/demo.txt": createFileNode("Demo file for cat and more practice.\nLine 2: Linux commands read files from the virtual filesystem.\n", { owner: "student", group: "student", mtime: RECENT_LS_MTIME }),
      "/home/student/old.txt": createFileNode("Old file for testing ls -t ordering.\n", { owner: "student", group: "student", mtime: new Date("2020-01-01T00:00:00Z") }),
      "/home/student/readme.txt": createFileNode("Linux CLI practice environment.\n", { owner: "student", group: "student", mtime: RECENT_LS_MTIME }),
      "/home/student/sample.txt": createFileNode("Temporary sample file.\n", { owner: "student", group: "student", mtime: RECENT_LS_MTIME }),
      "/home/student/sample_dir": createDirNode(["note.txt"], { owner: "student", group: "student", mtime: RECENT_LS_MTIME }),
      "/home/student/recent.txt": createFileNode("Most recent file for testing ls -t ordering.\n", { owner: "student", group: "student", mtime: RECENT_LS_MTIME }),
      "/home/student/long-text-simulator.txt": createFileNode(`============================================================
    # MANUAL SECTION 1
    ------------------------------------------------------------
    Line 1: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 2: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 3: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 4: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 5: This is example documentation text to provide scrolling content.
    Line 6: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 7: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 8: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 9: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 10: This is example documentation text to provide scrolling content.

    Line 11: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 12: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 13: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 14: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 15: This is example documentation text to provide scrolling content.
    Line 16: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 17: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 18: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 19: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 20: This is example documentation text to provide scrolling content.

    Line 21: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 22: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 23: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 24: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 25: This is example documentation text to provide scrolling content.
    Line 26: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 27: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 28: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 29: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 30: This is example documentation text to provide scrolling content.

    ============================================================
    # MANUAL SECTION 2
    ------------------------------------------------------------
    Line 51: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 52: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 53: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 54: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 55: This is example documentation text to provide scrolling content.
    Line 56: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 57: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 58: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 59: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 60: This is example documentation text to provide scrolling content.

    Line 61: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 62: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 63: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 64: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 65: This is example documentation text to provide scrolling content.
    Line 66: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 67: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 68: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 69: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 70: This is example documentation text to provide scrolling content.

    Line 71: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 72: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 73: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 74: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 75: This is example documentation text to provide scrolling content.
    Line 76: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 77: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 78: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 79: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 80: This is example documentation text to provide scrolling content.

    Line 81: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 82: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 83: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 84: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 85: This is example documentation text to provide scrolling content.
    Line 86: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 87: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 88: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 89: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 90: This is example documentation text to provide scrolling content.

    Line 91: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 92: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 93: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 94: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 95: This is example documentation text to provide scrolling content.
    Line 96: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 97: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 98: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 99: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 100: This is example documentation text to provide scrolling content.

    ============================================================
    # MANUAL SECTION 3
    ------------------------------------------------------------
    Line 101: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 102: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 103: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 104: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 105: This is example documentation text to provide scrolling content.
    Line 106: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 107: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 108: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 109: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 110: This is example documentation text to provide scrolling content.

    Line 111: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 112: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 113: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 114: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 115: This is example documentation text to provide scrolling content.
    Line 116: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 117: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 118: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 119: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 120: This is example documentation text to provide scrolling content.

    Line 121: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 122: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 123: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 124: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 125: This is example documentation text to provide scrolling content.
    Line 126: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 127: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 128: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 129: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 130: This is example documentation text to provide scrolling content.

    Line 131: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 132: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 133: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 134: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 135: This is example documentation text to provide scrolling content.
    Line 136: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 137: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 138: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 139: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 140: This is example documentation text to provide scrolling content.

    ... (file continues) ...

    Line 1719: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 1720: This is example documentation text to provide scrolling content.

    Line 1721: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 1722: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    Line 1723: This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content. This is example documentation text to provide scrolling content.
    `, { owner: "student", group: "student", mtime: RECENT_LS_MTIME }),
      "/home/student/sample_dir/note.txt": createFileNode("Sample directory content.\n", { owner: "student", group: "student", mtime: RECENT_LS_MTIME }),
      "/home/student/documents": createDirNode(["lesson.txt", "memo.txt"], { owner: "student", group: "student", mtime: RECENT_LS_MTIME }),
      "/home/student/documents/memo.txt": createFileNode("Class memo: commands are typed as command plus target.\n", { owner: "student", group: "student", mtime: RECENT_LS_MTIME }),
      "/home/student/documents/lesson.txt": createFileNode("Today's goal: SSH login, pwd, cd, and cat.\n", { owner: "student", group: "student", mtime: RECENT_LS_MTIME }),
      "/etc": createDirNode(["binfmt.d", "gss", "hostname", "hosts", "netplan", "opt"], { owner: "root", group: "root", mtime: DEFAULT_LS_MTIME }),
      "/etc/binfmt.d": createDirNode([], { owner: "root", group: "root", mtime: new Date("2022-04-08T00:00:00Z") }),
      "/etc/gss": createDirNode([], { owner: "root", group: "root", mtime: new Date("2022-02-22T00:00:00Z") }),
      "/etc/netplan": createDirNode([], { owner: "root", group: "root", mtime: new Date("2022-03-10T00:00:00Z") }),
      "/etc/opt": createDirNode([], { owner: "root", group: "root", mtime: new Date("2023-02-11T00:00:00Z") }),
      "/etc/hostname": createFileNode("linux-practice\n", { owner: "root", group: "root", mtime: DEFAULT_LS_MTIME }),
      "/etc/hosts": createFileNode("127.0.0.1 localhost\n127.0.1.1 linux-practice\n", { owner: "root", group: "root", mtime: DEFAULT_LS_MTIME }),
      "/usr": createDirNode(["local"], { owner: "root", group: "root", mtime: DEFAULT_LS_MTIME }),
      "/usr/local": createDirNode(["share"], { owner: "root", group: "root", mtime: DEFAULT_LS_MTIME }),
      "/usr/local/share": createDirNode(["man", "practice.txt"], { owner: "root", group: "root", mtime: DEFAULT_LS_MTIME }),
      "/usr/local/share/man": createDirNode(["intro.txt"], { owner: "root", group: "root", mtime: DEFAULT_LS_MTIME }),
      "/usr/local/share/man/intro.txt": createFileNode("Manual page sample.\n", { owner: "root", group: "root", mtime: DEFAULT_LS_MTIME }),
      "/usr/local/share/practice.txt": createFileNode("Shared practice material.\n", { owner: "root", group: "root", mtime: DEFAULT_LS_MTIME }),
      "/var": createDirNode(["log"], { owner: "root", group: "root", mtime: DEFAULT_LS_MTIME }),
      "/var/log": createDirNode(["practice.log"], { owner: "root", group: "root", mtime: RECENT_LS_MTIME }),
      "/var/log/practice.log": createFileNode("This is a simulated log file.\n", { owner: "root", group: "root", mtime: RECENT_LS_MTIME })
    }
  };
}

let state = createInitialState();
// long-text-simulator.txt is embedded into the virtual FS in createInitialState().
// External runtime loader removed because this simulator runs in-browser only.
let activeScenarioKey = "login";
let allowedCommands = new Set(scenarios[activeScenarioKey].allowed);
let commandHistory = [];
let historyIndex = 0;
let pendingPasswordFor = null;
let pendingHostKeyFor = null;
let pendingRmConfirmation = null;
let pendingMorePaging = null;
let sshPasswordAttemptsRemaining = 0;
let knownHosts = new Set();
let customScenarioCount = 0;
let completedTasks = new Map();
let activeRuntimeName = "main";
let adminHelpPaging = {
  lines: [],
  page: 0
};

function cloneCompletedTasksMap(source) {
  const cloned = new Map();
  source.forEach((value, key) => {
    cloned.set(key, new Set(value));
  });
  return cloned;
}

function createRuntimeSnapshot(overrides = {}) {
  return {
    state: overrides.state || createInitialState(),
    activeScenarioKey: overrides.activeScenarioKey || "login",
    allowedCommands: [...(overrides.allowedCommands || scenarios.login.allowed)],
    commandHistory: [...(overrides.commandHistory || [])],
    historyIndex: overrides.historyIndex || 0,
    pendingPasswordFor: overrides.pendingPasswordFor || null,
    pendingHostKeyFor: overrides.pendingHostKeyFor || null,
    pendingRmConfirmation: overrides.pendingRmConfirmation || null,
    sshPasswordAttemptsRemaining: overrides.sshPasswordAttemptsRemaining || 0,
    knownHosts: [...(overrides.knownHosts || [])],
    completedTasks: cloneCompletedTasksMap(overrides.completedTasks || new Map()),
    scenarios: overrides.scenarios || scenarios
  };
}

const runtimeRegistry = {
  main: {
    name: "main",
    elements: {
      terminalOutput,
      commandInput,
      promptLabel
    },
    scenarios,
    snapshot: createRuntimeSnapshot({
      state,
      activeScenarioKey,
      allowedCommands: [...allowedCommands],
      commandHistory,
      historyIndex,
      pendingPasswordFor,
      pendingHostKeyFor,
      pendingRmConfirmation,
      sshPasswordAttemptsRemaining,
      knownHosts: [...knownHosts],
      completedTasks,
      scenarios
    })
  },
  [ADMIN_RUNTIME_NAME]: {
    name: ADMIN_RUNTIME_NAME,
    elements: {
      terminalOutput: adminTerminalOutput,
      commandInput: adminCommandInput,
      promptLabel: adminPromptLabel
    },
    scenarios: {
      [ADMIN_PREVIEW_KEY]: EMPTY_ADMIN_SCENARIO
    },
    snapshot: createRuntimeSnapshot({
      activeScenarioKey: ADMIN_PREVIEW_KEY,
      allowedCommands: EMPTY_ADMIN_SCENARIO.allowed,
      scenarios: {
        [ADMIN_PREVIEW_KEY]: EMPTY_ADMIN_SCENARIO
      }
    })
  }
};

function getCurrentRuntime() {
  return runtimeRegistry[activeRuntimeName] || runtimeRegistry.main;
}

function getRuntimeElements() {
  return getCurrentRuntime().elements;
}

function getScenarioStore() {
  return getCurrentRuntime().scenarios || scenarios;
}

function saveRuntimeSnapshot(runtimeName = activeRuntimeName) {
  const runtime = runtimeRegistry[runtimeName];
  if (!runtime) return;
  runtime.snapshot = createRuntimeSnapshot({
    state,
    activeScenarioKey,
    allowedCommands: [...allowedCommands],
    commandHistory,
    historyIndex,
    pendingPasswordFor,
    pendingHostKeyFor,
    pendingRmConfirmation,
    sshPasswordAttemptsRemaining,
    knownHosts: [...knownHosts],
    completedTasks,
    scenarios: runtime.scenarios
  });
}

function loadRuntimeSnapshot(runtimeName) {
  const runtime = runtimeRegistry[runtimeName];
  if (!runtime) return;
  const snapshot = runtime.snapshot;
  activeRuntimeName = runtimeName;
  state = snapshot.state;
  activeScenarioKey = snapshot.activeScenarioKey;
  allowedCommands = new Set(snapshot.allowedCommands);
  commandHistory = [...snapshot.commandHistory];
  historyIndex = snapshot.historyIndex;
  pendingPasswordFor = snapshot.pendingPasswordFor;
  pendingHostKeyFor = snapshot.pendingHostKeyFor;
  pendingRmConfirmation = snapshot.pendingRmConfirmation;
  sshPasswordAttemptsRemaining = snapshot.sshPasswordAttemptsRemaining;
  knownHosts = new Set(snapshot.knownHosts);
  completedTasks = cloneCompletedTasksMap(snapshot.completedTasks);
}

function withRuntime(runtimeName, action) {
  const previousRuntimeName = activeRuntimeName;
  saveRuntimeSnapshot(previousRuntimeName);
  loadRuntimeSnapshot(runtimeName);
  try {
    return action();
  } finally {
    saveRuntimeSnapshot(runtimeName);
    loadRuntimeSnapshot(previousRuntimeName);
  }
}

function mainScenarioStartsLoggedOut(key) {
  return key === "login";
}

function scenarioStartsLoggedOut(scenario) {
  if (!scenario || !Array.isArray(scenario.tasks) || scenario.tasks.length === 0) return false;
  return parseCommand(scenario.tasks[0].command).command === "ssh";
}

function ensureGuestSession() {
  state.loggedIn = false;
  state.user = "guest";
  state.host = "browser";
  state.cwd = "/home/student";
  resetSshAuthState();
}

function ensureStudentSession() {
  state.loggedIn = true;
  state.user = "student";
  state.host = "linux-practice";
  state.cwd = "/home/student";
  resetSshAuthState();
}

function renderMainControls() {
  const store = getScenarioStore();
  scenarioButtons.textContent = "";
  Object.entries(store).forEach(([key, scenario]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = isScenarioComplete(key) ? `${scenario.label} 完了` : scenario.label;
    button.classList.toggle("is-active", key === activeScenarioKey);
    button.classList.toggle("is-complete", isScenarioComplete(key));
    button.addEventListener("click", () => setScenario(key));
    scenarioButtons.appendChild(button);
  });

  taskList.textContent = "";
  store[activeScenarioKey].tasks.forEach((task, index) => {
    const item = document.createElement("li");
    item.textContent = task.text;
    item.classList.toggle("is-done", getCompletedSet().has(index));
    taskList.appendChild(item);
  });
  updateMainCompletionState();
  requestAnimationFrame(() => {
    if (isScenarioComplete()) {
      scenarioCompleteStatus.scrollIntoView({ block: "end", inline: "nearest" });
      return;
    }
    const firstIncompleteItem = taskList.querySelector("li:not(.is-done)");
    if (firstIncompleteItem) {
      firstIncompleteItem.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  });
}

function updateMainCompletionState() {
  const store = getScenarioStore();
  const completedCount = getCompletedSet().size;
  const taskCount = store[activeScenarioKey].tasks.length;
  const complete = isScenarioComplete();
  const nextKey = getNextScenarioKey();
  scenarioCompleteStatus.textContent = complete
    ? "このシナリオの課題はすべて完了しました"
    : `進捗: ${completedCount} / ${taskCount}`;
  scenarioCompleteStatus.classList.toggle("is-complete", complete);
  nextScenarioButton.hidden = !complete;
  nextScenarioButton.disabled = !complete || !nextKey;
  nextScenarioButton.textContent = nextKey ? `次へ: ${store[nextKey].label}` : "すべて完了";
}

function renderAdminControls() {
  const store = getScenarioStore();
  const scenario = store[activeScenarioKey];
  adminTaskList.textContent = "";

  if (!scenario || scenario.tasks.length === 0) {
    adminTestStatus.textContent = "現在の入力内容から一時シナリオを作成して試せます。";
    return;
  }

  const completedSet = getCompletedSet();
  scenario.tasks.forEach((task, index) => {
    const item = document.createElement("li");
    item.textContent = task.text;
    item.classList.toggle("is-done", completedSet.has(index));
    adminTaskList.appendChild(item);
  });

  const completedCount = completedSet.size;
  adminTestStatus.textContent = isScenarioComplete()
    ? `試験シナリオ「${scenario.label}」を完了しました。`
    : `試験シナリオ「${scenario.label}」 進捗: ${completedCount} / ${scenario.tasks.length}`;
}

function renderControls() {
  if (activeRuntimeName === ADMIN_RUNTIME_NAME) {
    renderAdminControls();
    return;
  }
  renderMainControls();
}

function isAwaitingPassword() {
  return pendingPasswordFor !== null;
}

function isAwaitingHostKeyConfirmation() {
  return pendingHostKeyFor !== null;
}

function isInSshDialogue() {
  return isAwaitingPassword() || isAwaitingHostKeyConfirmation();
}

function isAwaitingRmConfirmation() {
  return pendingRmConfirmation !== null;
}

function isAwaitingInteractiveInput() {
  return isInSshDialogue() || isAwaitingRmConfirmation();
}

function resetSshAuthState() {
  pendingPasswordFor = null;
  pendingHostKeyFor = null;
  sshPasswordAttemptsRemaining = 0;
}

function completeRmConfirmation(input) {
  const pending = pendingRmConfirmation;
  pendingRmConfirmation = null;
  if (!pending) return null;
  if (["y", "yes"].includes(input.toLowerCase())) {
    removePathRecursive(pending.path, pending.recursive, pending.force);
  }
  return pending;
}

function handleMorePagingInput(input) {
  if (!isPagingMore()) return false;

  const normalized = input.trim().toLowerCase();
  if (normalized === "q") {
    clearMorePaging();
    setPrompt();
    renderControls();
    return true;
  }

  showNextMorePage();
  renderControls();
  return true;
}

function updateSessionStatus() {
  if (activeRuntimeName !== "main") return;
  sessionStatus.textContent = state.loggedIn ? `${state.user}@${state.host}` : "未ログイン";
  sessionStatus.classList.toggle("is-live", state.loggedIn);
}

function beginPasswordPrompt(target, preserveAttempts = false) {
  pendingHostKeyFor = null;
  pendingPasswordFor = target;
  if (!preserveAttempts || sshPasswordAttemptsRemaining <= 0) {
    sshPasswordAttemptsRemaining = SSH_MAX_PASSWORD_ATTEMPTS;
  }
  printLine(`${target}'s password:`, "system");
}

function finishSshLogin() {
  state.loggedIn = true;
  state.user = "student";
  state.host = "linux-practice";
  state.cwd = "/home/student";
  resetSshAuthState();
}

function showHostKeyPrompt(target) {
  const host = target.split("@")[1] || "linux-practice";
  printBlock([
    `The authenticity of host '${host}' can't be established.`,
    `ED25519 key fingerprint is ${SSH_HOST_FINGERPRINT}.`,
    "Are you sure you want to continue connecting (yes/no)?"
  ].join("\n"), "system");
}

function handleHostKeyConfirmation(input) {
  const normalized = input.toLowerCase();
  if (normalized === "yes") {
    const target = pendingHostKeyFor;
    const before = snapshotState();
    knownHosts.add(target);
    printLine("Warning: Permanently added 'linux-practice' (ED25519) to the list of known hosts.", "system");
    beginPasswordPrompt(target);
    markTasks("yes", { command: "response", args: [], raw: "yes" }, before);
    setPrompt();
    return;
  }
  if (normalized === "no") {
    resetSshAuthState();
    printLine("Host key verification failed.", "error");
    setPrompt();
    return;
  }
  printLine("Please type 'yes' or 'no'.", "error");
}

function printLine(text = "", type = "") {
  if (outputCapture) {
    const stream = type === "error" ? "stderr" : "stdout";
    outputCapture[stream] += `${text}\n`;
    return;
  }
  if (commandOutputCapture) {
    const stream = type === "error" ? "stderr" : "stdout";
    commandOutputCapture[stream] += `${text}\n`;
  }
  const { terminalOutput: output } = getRuntimeElements();
  const line = document.createElement("div");
  line.className = `terminal-line ${type}`.trim();
  line.textContent = text;
  output.appendChild(line);
  output.scrollTop = output.scrollHeight;
}

function printBlock(text, type = "") {
  text.split("\n").forEach((line) => printLine(line, type));
}

function clearMorePaging() {
  pendingMorePaging = null;
}

function setMorePrompt() {
  const { promptLabel: prompt, commandInput: input } = getRuntimeElements();
  prompt.textContent = "--More--";
  input.type = "text";
}

function isPagingMore() {
  return pendingMorePaging !== null && pendingMorePaging.runtimeName === activeRuntimeName;
}

function showNextMorePage() {
  if (!isPagingMore()) return;

  const paging = pendingMorePaging;
  const nextIndex = Math.min(paging.index + 20, paging.lines.length);
  const chunk = paging.lines.slice(paging.index, nextIndex).join("\n");
  if (chunk) printBlock(chunk);
  paging.index = nextIndex;

  if (paging.index < paging.lines.length) {
    printLine("--More--", "system");
    setMorePrompt();
    return;
  }

  clearMorePaging();
  setPrompt();
}

function startMorePaging(content) {
  pendingMorePaging = {
    runtimeName: activeRuntimeName,
    lines: content.split("\n"),
    index: 0
  };
  showNextMorePage();
}

function setPrompt() {
  const { promptLabel: prompt, commandInput: input } = getRuntimeElements();
  if (isPagingMore()) {
    setMorePrompt();
    return;
  }
  if (isAwaitingPassword()) {
    prompt.textContent = "password:";
    input.type = "password";
    updateSessionStatus();
    return;
  }

  input.type = "text";
  const symbol = state.user === "root" ? "#" : "$";
  prompt.textContent = state.loggedIn
    ? `${state.user}@${state.host}:${shortPath(state.cwd)}${symbol}`
    : "local > ";
  updateSessionStatus();
}

function shortPath(path) {
  return path.replace("/home/student", "~");
}

function normalizeSpaces(text) {
  return String(text).trim().replace(/\s+/g, " ");
}

function normalizePath(input, base = state.cwd) {
  if (!input || input === ".") return base;
  let expanded = input;
  if (expanded === "~") expanded = "/home/student";
  else if (expanded.startsWith("~/")) expanded = `/home/student/${expanded.slice(2)}`;
  const raw = expanded.startsWith("/") ? expanded : `${base}/${expanded}`;
  const parts = [];
  raw.split("/").forEach((part) => {
    if (!part || part === ".") return;
    if (part === "..") parts.pop();
    else parts.push(part);
  });
  return `/${parts.join("/")}`;
}

function basename(path) {
  const parts = path.split("/").filter(Boolean);
  return parts[parts.length - 1] || "/";
}

function dirname(path) {
  const parts = path.split("/").filter(Boolean);
  parts.pop();
  return `/${parts.join("/")}`.replace(/\/$/, "") || "/";
}

function snapshotState() {
  return {
    loggedIn: state.loggedIn,
    user: state.user,
    host: state.host,
    cwd: state.cwd,
    fs: structuredClone(state.fs),
    pendingPasswordFor,
    pendingHostKeyFor,
    pendingRmConfirmation: structuredClone(pendingRmConfirmation),
    sshPasswordAttemptsRemaining,
    knownHosts: [...knownHosts]
  };
}

function ensureParent(path) {
  const parentPath = dirname(path);
  const parent = state.fs[parentPath];
  if (!parent || parent.type !== "dir") throw new Error(`親ディレクトリがありません: ${parentPath}`);
  return parent;
}

function addChild(path) {
  const parent = ensureParent(path);
  const name = basename(path);
  if (!parent.children.includes(name)) {
    parent.children.push(name);
    parent.children.sort();
  }
}

function removePath(path) {
  const node = state.fs[path];
  if (!node) throw new Error(`存在しません: ${path}`);
  if (node.type === "dir" && node.children.length > 0) throw new Error("空でないディレクトリは削除できません");
  const parent = state.fs[dirname(path)];
  if (parent?.type === "dir") parent.children = parent.children.filter((child) => child !== basename(path));
  delete state.fs[path];
}

function parseCommand(input) {
  const raw = normalizeSpaces(input);
  const parts = tokenizeShell(input);
  return {
    command: parts[0] || "",
    args: parts.slice(1).map((part) => part.replace(/^["']|["']$/g, "")),
    raw,
    shell: hasShellSyntax(parts)
  };
}

function tokenizeShell(input) {
  const tokens = [];
  const pattern = /2>&1|&>|>&|2>|[|<>]|(?:[^\s"'|<>]+|"[^"]*"|'[^']*')+/g;
  let match;
  while ((match = pattern.exec(input)) !== null) {
    tokens.push(match[0].replace(/^["']|["']$/g, ""));
  }
  return tokens;
}

function hasShellSyntax(tokens) {
  return tokens.some((token) => ["|", "<", ">", "2>", "2>&1", "&>", ">&", "&1"].includes(token));
}

function requireLogin(command) {
  if (command === "ssh" || command === "help" || command === "clear") return;
  if (!state.loggedIn) throw new Error("先に ssh student@linux-practice でログインしてください");
}

function execute(parsed) {
  const { command, args, raw } = parsed;
  if (!command) return;
  if (!allowedCommands.has(command)) throw new Error(`このシナリオでは ${command} は練習対象外です`);
  requireLogin(command);

  switch (command) {
    case "ssh": return runSsh(args);
    case "pwd": return printLine(state.cwd);
    case "ls": return runLs(args);
    case "cd": return runCd(args);
    case "cat": return runCat(args);
    case "more": return runMore(args);
    case "mkdir": return runMkdir(args);
    case "touch": return runTouch(args);
    case "rm": return runRm(args);
    case "cp": return runCp(args);
    case "mv": return runMv(args);
    case "echo": return runEcho(args);
    case "whoami": return printLine(state.user);
    case "hostname": return printLine(state.host);
    case "exit": return runExit();
    case "clear":
      terminalOutput.textContent = "";
      return;
    case "help": return showHelp();
    default: throw new Error(`${raw}: command not found`);
  }
}

function validateExpect(expect, parsed, before) {
  if (expect.loggedIn !== undefined && state.loggedIn !== expect.loggedIn) return false;
  if (expect.user && state.user !== expect.user) return false;
  if (expect.host && state.host !== expect.host) return false;
  if (expect.cwd && state.cwd !== expect.cwd) return false;
  if (expect.pendingPassword && pendingPasswordFor !== "student@linux-practice") return false;
  if (expect.exists && !nodeMatches(expect.exists, expect.type)) return false;
  if (expect.notExists && state.fs[expect.notExists]) return false;
  if (expect.file) {
    const node = state.fs[expect.file];
    if (!node || node.type !== "file") return false;
    if (expect.content !== undefined && node.content !== expect.content) return false;
  }
  if (expect.stdout !== undefined && lastCommandResult.stdout !== expect.stdout) return false;
  if (expect.stderr !== undefined && lastCommandResult.stderr !== expect.stderr) return false;
  if (Object.keys(expect).length > 0) return true;

  const { values, options } = splitOptions(parsed.args || []);
  switch (parsed.command) {
    case "ssh":
      return pendingPasswordFor === "student@linux-practice";
    case "password":
      return state.loggedIn && state.user === "student" && state.host === "linux-practice";
    case "cd": {
      const target = normalizePath(values[0] || "/home/student", before.cwd);
      return state.cwd === target && nodeMatches(target, "dir");
    }
    case "mkdir":
      return values.every((arg) => nodeMatches(normalizePath(arg, before.cwd), "dir"));
    case "touch":
      return values.every((arg) => nodeMatches(normalizePath(arg, before.cwd), "file"));
    case "echo": {
      const redirectIndex = parsed.args.indexOf(">");
      if (redirectIndex < 0) return true;
      const text = parsed.args.slice(0, redirectIndex).join(" ").replace(/^"|"$/g, "");
      const target = normalizePath(parsed.args[redirectIndex + 1], before.cwd);
      return state.fs[target]?.type === "file" && state.fs[target].content === `${text}\n`;
    }
    case "rm":
      return values.every((arg) => !state.fs[normalizePath(arg, before.cwd)]);
    case "cp": {
      const source = before.fs[normalizePath(values[0], before.cwd)];
      const dest = state.fs[normalizePath(values[1], before.cwd)];
      return !!source && !!dest;
    }
    case "mv":
      return !state.fs[normalizePath(values[0], before.cwd)] && !!state.fs[normalizePath(values[1], before.cwd)];
    case "cat":
    case "more":
    case "head":
    case "tail": {
      const fileArgs = values.length ? values : parsed.args.filter((arg) => !arg.startsWith("-") && !/^\d+$/.test(arg));
      return fileArgs.every((arg) => nodeMatches(normalizePath(arg, before.cwd), "file"));
    }
    case "grep":
      return values.slice(1).every((arg) => nodeMatches(normalizePath(arg, before.cwd), "file"));
    case "wc":
      return values.every((arg) => nodeMatches(normalizePath(arg, before.cwd), "file"));
    case "find": {
      const start = normalizePath(values[0] || ".", before.cwd);
      return !!state.fs[start];
    }
    case "sed":
      return !!parsed.args[1] && nodeMatches(normalizePath(parsed.args[1], before.cwd), "file");
    case "awk": {
      const file = parsed.args[0] === "-F" ? parsed.args[3] : parsed.args[1];
      return !!file && nodeMatches(normalizePath(file, before.cwd), "file");
    }
    case "ls":
      return !!state.fs[normalizePath(values[0] || before.cwd, before.cwd)];
    case "pwd":
    case "whoami":
    case "help":
    case "clear":
    case "date":
      return true;
    case "exit":
      return !state.loggedIn;
    default:
      return options.length >= 0 && commandCatalog.includes(parsed.command);
  }
}

function runSsh(args) {
  const target = args[0];
  if (state.loggedIn) throw new Error("すでにログインしています。exit でログアウトできます");
  if (target !== SSH_TARGET) throw new Error(`接続先は ${SSH_TARGET} を指定してください`);
  resetSshAuthState();
  if (!knownHosts.has(target)) {
    pendingHostKeyFor = target;
    showHostKeyPrompt(target);
    return;
  }
  beginPasswordPrompt(target);
}

function completePassword(input) {
  if (input === SSH_PASSWORD) {
    const before = snapshotState();
    finishSshLogin();
    printLine("Welcome to Linux CLI practice.", "success");
    markTasks(SSH_PASSWORD, { command: "password", args: [], raw: SSH_PASSWORD }, before);
    setPrompt();
    return;
  }
  sshPasswordAttemptsRemaining -= 1;
  if (sshPasswordAttemptsRemaining > 0) {
    printLine("Permission denied, please try again.", "error");
    beginPasswordPrompt(pendingPasswordFor, true);
    setPrompt();
    return;
  }
  const target = pendingPasswordFor;
  resetSshAuthState();
  printLine(`${target}: Permission denied (publickey,password).`, "error");
  setPrompt();
}

function getLsEntries(targetPath, options) {
  const node = state.fs[targetPath];
  if (!node) throw new Error(`ls: cannot access '${targetPath}': No such file or directory`);
  if (node.type === "file") {
    return [hasFlag(options, "l") ? formatLsLongEntry(targetPath, node) : basename(targetPath)];
  }
  const entries = node.children.map((child) => {
    const path = `${targetPath}/${child}`;
    return { path, node: state.fs[path] };
  }).filter(({ node: childNode, path }) => {
    if (!childNode) return false;
    const name = basename(path);
    if (!hasFlag(options, "a") && name.startsWith(".")) return false;
    return true;
  });
  const sortedEntries = [...entries].sort((a, b) => {
    if (hasFlag(options, "t")) {
      const delta = (b.node.mtime?.getTime?.() ?? 0) - (a.node.mtime?.getTime?.() ?? 0);
      if (delta !== 0) return delta;
    } else {
      const nameCompare = basename(a.path).localeCompare(basename(b.path));
      if (nameCompare !== 0) return nameCompare;
    }
    return basename(a.path).localeCompare(basename(b.path));
  });
  if (hasFlag(options, "r")) sortedEntries.reverse();
  if (hasFlag(options, "l")) {
    const total = sortedEntries.reduce((sum, entry) => sum + blockCount(entry.node), 0);
    return [`total ${total}`, ...sortedEntries.map(({ path, node: childNode }) => formatLsLongEntry(path, childNode))];
  }
  return sortedEntries.map(({ path, node: childNode }) => {
    const name = basename(path);
    return hasFlag(options, "F") && childNode.type === "dir" ? `${name}/` : name;
  });
}

function runLs(args) {
  const { options, values } = splitOptions(args);
  const targetPath = normalizePath(values[0] || state.cwd);
  const lines = getLsEntries(targetPath, options);
  printBlock(hasFlag(options, "l") ? lines.join("\n") : lines.join("  "));
}

function runCd(args) {
  const targetPath = normalizePath(args[0] || "/home/student");
  const node = state.fs[targetPath];
  if (!node) throw new Error(`cd: ${args[0]}: No such file or directory`);
  if (node.type !== "dir") throw new Error(`cd: ${args[0]}: Not a directory`);
  state.cwd = targetPath;
}

function runCat(args) {
  if (!args[0]) {
    printBlock(readStdinOrThrow("cat").replace(/\n$/, ""));
    return;
  }
  args.forEach((arg) => {
    const targetPath = normalizePath(arg);
    const node = state.fs[targetPath];
    if (!node) throw new Error(`cat: ${arg}: No such file or directory`);
    if (node.type !== "file") throw new Error(`cat: ${arg}: Is a directory`);
    printBlock(node.content.replace(/\n$/, ""));
  });
}

function runMkdir(args) {
  if (!args[0]) throw new Error("mkdir: ディレクトリ名を指定してください");
  args.forEach((arg) => {
    const targetPath = normalizePath(arg);
    if (state.fs[targetPath]) throw new Error(`mkdir: cannot create directory '${arg}': File exists`);
    ensureParent(targetPath);
    state.fs[targetPath] = createDirNode([], { owner: state.user, group: state.user, mtime: RECENT_LS_MTIME });
    addChild(targetPath);
  });
}

function runTouch(args) {
  if (!args[0]) throw new Error("touch: ファイル名を指定してください");
  args.forEach((arg) => {
    const targetPath = normalizePath(arg);
    const existing = state.fs[targetPath];
    if (existing?.type === "dir") throw new Error(`touch: ${arg}: Is a directory`);
    if (!existing) {
      ensureParent(targetPath);
      state.fs[targetPath] = createFileNode("", { owner: state.user, group: state.user, mtime: RECENT_LS_MTIME });
      addChild(targetPath);
    } else {
      existing.mtime = RECENT_LS_MTIME;
      existing.size = existing.content.length;
    }
  });
}

function runRm(args) {
  if (!args[0]) throw new Error("rm: 削除するファイルを指定してください");
  args.forEach((arg) => removePath(normalizePath(arg)));
}

function runCp(args) {
  if (args.length < 2) throw new Error("cp: コピー元とコピー先を指定してください");
  const sourcePath = normalizePath(args[0]);
  const destPath = normalizePath(args[1]);
  const source = state.fs[sourcePath];
  if (!source) throw new Error(`cp: cannot stat '${args[0]}': No such file or directory`);
  if (source.type !== "file") throw new Error("cp: このシミュレータではファイルのみコピーできます");
  ensureParent(destPath);
  state.fs[destPath] = createFileNode(source.content, {
    owner: source.owner || "root",
    group: source.group || "root",
    mode: source.mode || "-rw-r--r--",
    mtime: source.mtime || RECENT_LS_MTIME
  });
  addChild(destPath);
}

function runMv(args) {
  if (args.length < 2) throw new Error("mv: 移動元と移動先を指定してください");
  const sourcePath = normalizePath(args[0]);
  const destPath = normalizePath(args[1]);
  const source = state.fs[sourcePath];
  if (!source) throw new Error(`mv: cannot stat '${args[0]}': No such file or directory`);
  if (source.type === "dir" && source.children.length > 0) throw new Error("mv: このシミュレータでは空でないディレクトリの移動は扱いません");
  ensureParent(destPath);
  state.fs[destPath] = structuredClone(source);
  addChild(destPath);
  removePath(sourcePath);
}

function runEcho(args) {
  if (args.includes(">")) {
    const redirectIndex = args.indexOf(">");
    const text = args.slice(0, redirectIndex).join(" ").replace(/^"|"$/g, "");
    const targetPath = normalizePath(args[redirectIndex + 1]);
    ensureParent(targetPath);
    const existing = state.fs[targetPath];
    state.fs[targetPath] = createFileNode(`${text}\n`, {
      owner: existing?.owner || state.user,
      group: existing?.group || state.user,
      mode: existing?.mode || "-rw-r--r--",
      mtime: RECENT_LS_MTIME
    });
    addChild(targetPath);
    return;
  }
  printLine(args.join(" "));
}

function runExit() {
  state.loggedIn = false;
  state.user = "guest";
  state.host = "browser";
  state.cwd = "/home/student";
  pendingRmConfirmation = null;
  resetSshAuthState();
  setPrompt();
  renderControls();
  printLine("Connection to linux-practice closed.", "system");
}

function showHelp() {
  printBlock([
    "使用例:",
    "  ssh student@linux-practice",
    "  whoami",
    "  pwd",
    "  ls -la",
    "  hostname",
    "  cd documents",
    "  cat memo.txt",
    "  more demo.txt",
    "  mkdir practice",
    "  touch practice/note.txt",
    "  echo hello > practice/note.txt",
    "  wc -l < documents/lesson.txt",
    "  cat missing.txt 2> error.log",
    "  cat documents/lesson.txt | grep SSH",
    "  cat documents/lesson.txt | tee copy.txt",
    "  cp /etc/hosts .",
    "  rm -i sample.txt"
  ].join("\n"), "system");
}

function getAdminAllowedCommands() {
  const commandListText = adminCommandList.value.trim();
  if (commandListText) {
    try {
      const tasks = buildTasksFromCommandList(commandListText);
      const inferred = inferAllowedFromTasks(tasks);
      return commandCatalog.filter((command) => inferred.includes(command));
    } catch {
      // 編集途中で未完成でも、最後に確定した試験ランタイムの内容へフォールバックする。
    }
  }
  const snapshot = runtimeRegistry[ADMIN_RUNTIME_NAME]?.snapshot;
  const allowed = Array.isArray(snapshot?.allowedCommands)
    ? snapshot.allowedCommands
    : EMPTY_ADMIN_SCENARIO.allowed;
  return commandCatalog.filter((command) => allowed.includes(command));
}

function buildAdminHelpLines() {
  const commands = getAdminAllowedCommands();
  const lines = [
    "現在実行できるコマンド:",
    ""
  ];

  commands.forEach((command) => {
    const entry = COMMAND_HELP_ENTRIES[command] || {
      usage: command,
      options: []
    };
    lines.push(command);
    lines.push(`  書式: ${entry.usage}`);
    if (entry.options.length > 0) {
      lines.push(`  オプション: ${entry.options.join(", ")}`);
    }
    if (entry.note) {
      lines.push(`  補足: ${entry.note}`);
    }
    lines.push("");
  });

  if (commands.length === 0) {
    lines.push("表示できるコマンドがありません");
  }

  return lines;
}

function getAdminHelpPageCount() {
  return Math.max(1, Math.ceil(adminHelpPaging.lines.length / ADMIN_HELP_PAGE_SIZE));
}

function renderAdminHelpPage() {
  const pageCount = getAdminHelpPageCount();
  const safePage = Math.min(adminHelpPaging.page, pageCount - 1);
  const start = safePage * ADMIN_HELP_PAGE_SIZE;
  const end = start + ADMIN_HELP_PAGE_SIZE;
  adminHelpPaging.page = safePage;
  adminHelpContent.textContent = adminHelpPaging.lines.slice(start, end).join("\n");
  adminHelpPageInfo.textContent = `${safePage + 1} / ${pageCount}`;
  adminHelpPrevPage.disabled = safePage === 0;
  adminHelpNextPage.disabled = safePage >= pageCount - 1;
}

function openAdminHelpDialog() {
  adminHelpPaging = {
    lines: buildAdminHelpLines(),
    page: 0
  };
  renderAdminHelpPage();
  adminHelpDialog.showModal();
}

function createScenarioKey(label) {
  customScenarioCount += 1;
  return `custom-${Date.now()}-${customScenarioCount}-${label.length}`;
}

function inferCommandFromText(text) {
  const trimmed = normalizeSpaces(text);
  if (trimmed.includes("yes と入力")) return "yes";
  if (trimmed.includes("パスワード linux")) return "linux";
  const escaped = commandCatalog.join("|");
  const match = trimmed.match(new RegExp(`\\b(${escaped})\\b(?:\\s+[^でをの]+)?`));
  return match ? normalizeSpaces(match[0]) : "";
}

function normalizeTask(task) {
  if (typeof task === "string") {
    const text = task.trim();
    return { text, command: inferCommandFromText(text), expect: {} };
  }
  if (!task || typeof task !== "object") throw new Error("課題の形式が正しくありません");
  const text = String(task.text || task.label || task.instruction || task.command || "").trim();
  const command = normalizeSpaces(task.command || inferCommandFromText(text));
  if (!text) throw new Error("課題文がありません");
  if (!command) throw new Error(`${text}: 判定用 command がありません`);
  return { text, command, expect: task.expect || {} };
}

function normalizeScenarioFiles(files) {
  if (!files || typeof files !== "object" || Array.isArray(files)) return {};
  return Object.fromEntries(Object.entries(files).map(([path, content]) => {
    const normalizedPath = normalizePath(String(path), "/home/student");
    return [normalizedPath, String(content)];
  }));
}

function normalizeScenario(candidate) {
  if (!candidate || typeof candidate !== "object") throw new Error("シナリオの形式が正しくありません");
  const label = String(candidate.label || candidate.name || "").trim();
  if (!label) throw new Error("シナリオ名がありません");
  const allowed = Array.isArray(candidate.allowed)
    ? candidate.allowed.filter((command) => commandCatalog.includes(command))
    : [];
  if (allowed.length === 0) throw new Error(`${label}: 練習コマンドがありません`);
  const tasks = Array.isArray(candidate.tasks)
    ? candidate.tasks.map(normalizeTask)
    : [];
  if (tasks.length === 0) throw new Error(`${label}: 課題がありません`);
  return { label, allowed, files: normalizeScenarioFiles(candidate.files), tasks };
}

function addScenario(candidate, options = {}) {
  const scenario = normalizeScenario(candidate);
  const key = createScenarioKey(scenario.label);
  scenarios[key] = scenario;
  if (options.activate !== false) setScenario(key);
  if (options.announce !== false) printLine(`シナリオ「${scenario.label}」を追加しました。`, "system");
  return key;
}

function parseAllowedCommands(text) {
  const commands = normalizeSpaces(text).split(" ").filter(Boolean);
  const invalid = commands.filter((command) => !commandCatalog.includes(command));
  if (invalid.length > 0) throw new Error(`未対応のコマンドがあります: ${invalid.join(", ")}`);
  if (commands.length === 0) throw new Error("許可コマンドを1つ以上指定してください");
  return [...new Set(commands)];
}

function buildAdminScenarioFromJsonFormLegacy() {
  const label = adminScenarioLabel.value.trim();
  if (!label) throw new Error("シナリオ名を入力してください");

  let tasks;
  try {
    tasks = JSON.parse(adminTasksJson.value);
  } catch {
    throw new Error("課題JSONの形式が正しくありません");
  }

  return normalizeScenario({
    label,
    allowed: parseAllowedCommands(adminAllowedCommands.value),
    tasks
  });
}

function getAdminPackageForDownload() {
  return {
    lessonTitle: adminLessonTitle.value.trim() || adminPackage.lessonTitle || "授業シナリオ",
    scenarios: adminPackage.scenarios
  };
}

function updateAdminPreview() {
  const preview = getAdminPackageForDownload();
  adminJsonPreview.textContent = JSON.stringify(preview, null, 2);
}

function renderAdminMergeQueue() {
  if (adminMergeQueueItems.length === 0) {
    adminMergeQueue.innerHTML = "<li class=\"admin-merge-empty\">取り込み待ちの授業JSONはありません</li>";
    return;
  }

  adminMergeQueue.innerHTML = adminMergeQueueItems.map((lesson, index) => {
    const moveUpDisabled = index === 0 ? "disabled" : "";
    const moveDownDisabled = index === adminMergeQueueItems.length - 1 ? "disabled" : "";
    return `
      <li class="admin-merge-item">
        <div class="admin-merge-item-copy">
          <strong>${lesson.title}</strong>
          <span>${lesson.fileName} / ${lesson.scenarios.length}件のシナリオ</span>
        </div>
        <div class="admin-merge-item-actions">
          <button type="button" data-action="up" data-index="${index}" ${moveUpDisabled}>上へ</button>
          <button type="button" data-action="down" data-index="${index}" ${moveDownDisabled}>下へ</button>
          <button type="button" data-action="remove" data-index="${index}">除外</button>
        </div>
      </li>`;
  }).join("");
}

function setAdminMergeStatus(message, isLoaded = false) {
  adminMergeStatus.textContent = message;
  adminMergeStatus.classList.toggle("is-loaded", isLoaded);
}

function appendScenariosToAdminPackage(lesson) {
  if (!adminLessonTitle.value.trim() && !adminPackage.lessonTitle && lesson.title) {
    adminPackage.lessonTitle = lesson.title;
    adminLessonTitle.value = lesson.title;
  }
  adminPackage.scenarios.push(...lesson.scenarios);
}

function updateAdminMergeQueueStatus(message, isLoaded = false) {
  renderAdminMergeQueue();
  setAdminMergeStatus(message, isLoaded);
}

function moveAdminMergeQueueItem(index, delta) {
  const targetIndex = index + delta;
  if (index < 0 || targetIndex < 0 || targetIndex >= adminMergeQueueItems.length) return;
  const [item] = adminMergeQueueItems.splice(index, 1);
  adminMergeQueueItems.splice(targetIndex, 0, item);
  updateAdminMergeQueueStatus(`取り込み待ち一覧を並べ替えました (${adminMergeQueueItems.length}件)`);
}

function removeAdminMergeQueueItem(index) {
  if (index < 0 || index >= adminMergeQueueItems.length) return;
  adminMergeQueueItems.splice(index, 1);
  if (adminMergeQueueItems.length === 0) {
    updateAdminMergeQueueStatus("取り込み待ち一覧を空にしました");
    return;
  }
  updateAdminMergeQueueStatus(`取り込み待ち一覧: ${adminMergeQueueItems.length}件`);
}

async function queueAdminScenarioFiles(fileList) {
  const files = Array.from(fileList || []);
  if (files.length === 0) return;

  let successCount = 0;
  let failureCount = 0;
  const failures = [];

  for (const file of files) {
    try {
      if (!file.name.toLowerCase().endsWith(".json")) {
        throw new Error("JSONファイルを選択してください");
      }
      const text = await file.text();
      const lesson = parseScenarioPackage(JSON.parse(text));
      if (lesson.scenarios.length === 0) throw new Error("シナリオが入っていません");
      adminMergeQueueCount += 1;
      adminMergeQueueItems.push({
        id: `merge-${Date.now()}-${adminMergeQueueCount}`,
        fileName: file.name,
        title: lesson.title,
        scenarios: lesson.scenarios
      });
      successCount += 1;
    } catch (error) {
      failureCount += 1;
      failures.push(`${file.name}: ${error.message}`);
    }
  }

  if (successCount === 0) {
    throw new Error(failures.join(" / ") || "統合できるJSONがありませんでした");
  }

  const totalCount = adminMergeQueueItems.length;
  const summary = `取り込み待ち一覧: ${successCount}ファイル追加 / ${failureCount}ファイル失敗 / 現在${totalCount}件`;
  updateAdminMergeQueueStatus(summary, totalCount > 0);
  adminScenarioError.textContent = failureCount > 0 ? `${summary} (${failures.join(" / ")})` : summary;
}

function applyAdminMergeQueue() {
  if (adminMergeQueueItems.length === 0) {
    throw new Error("先に統合したい授業JSONを一覧へ追加してください");
  }

  for (const lesson of adminMergeQueueItems) {
    appendScenariosToAdminPackage(lesson);
  }

  const mergedLessonCount = adminMergeQueueItems.length;
  const mergedScenarioCount = adminMergeQueueItems.reduce((count, lesson) => count + lesson.scenarios.length, 0);
  adminMergeQueueItems = [];
  updateAdminPreview();
  updateAdminMergeQueueStatus(`統合完了: ${mergedLessonCount}件の授業JSONから ${mergedScenarioCount}件のシナリオを追加しました`, true);
}

function downloadText(filename, text) {
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function buildTaskText(command) {
  const parsed = parseCommand(command);
  if (parsed.shell) return `${command} で標準入出力を練習する`;
  switch (parsed.command) {
    case "ssh":
      return `${command} を実行する`;
    case "whoami":
      return "whoami でログインユーザーを確認する";
    case "pwd":
      return "pwd で現在地を確認する";
    case "ls":
      return `${command} で一覧を確認する`;
    case "hostname":
      return "hostname で接続先ホスト名を確認する";
    case "cd":
      return `${command} で移動する`;
    case "cat":
      return `${command} で内容を確認する`;
    case "mkdir":
      return `${command} でディレクトリを作る`;
    case "touch":
      return `${command} でファイルを作る`;
    case "echo":
      return `${command} で文字を書き込む`;
    default:
      return `${command} を実行する`;
  }
}

function buildExpectForCommand(command, context) {
  const parsed = parseCommand(command);
  const base = context.cwd;
  switch (parsed.command) {
    case "ssh":
      return { pendingHostKeyConfirmation: true };
    case "pwd":
      return { cwd: base };
    case "ls":
      return { exists: normalizePath(parsed.args[0] || base, base) };
    case "cd": {
      const cwd = normalizePath(parsed.args[0] || "/home/student", base);
      context.cwd = cwd;
      return { cwd };
    }
    case "cat": {
      const file = normalizePath(parsed.args[0], base);
      return context.files[file] !== undefined ? { file, content: context.files[file] } : { file };
    }
    case "mkdir": {
      const path = normalizePath(parsed.args[0], base);
      return { exists: path, type: "dir" };
    }
    case "touch": {
      const path = normalizePath(parsed.args[0], base);
      if (context.files[path] === undefined) context.files[path] = "";
      return { exists: path, type: "file" };
    }
    case "echo": {
      const redirectIndex = parsed.args.indexOf(">");
      if (redirectIndex < 0) return {};
      const text = parsed.args.slice(0, redirectIndex).join(" ").replace(/^"|"$/g, "");
      const file = normalizePath(parsed.args[redirectIndex + 1], base);
      context.files[file] = `${text}\n`;
      return { file, content: `${text}\n` };
    }
    case "rm":
      return { notExists: normalizePath(parsed.args[0], base) };
    case "cp": {
      const source = normalizePath(parsed.args[0], base);
      const file = normalizePath(parsed.args[1], base);
      if (context.files[source] !== undefined) context.files[file] = context.files[source];
      return context.files[file] !== undefined ? { file, content: context.files[file] } : { exists: file, type: "file" };
    }
    case "mv": {
      const source = normalizePath(parsed.args[0], base);
      const dest = normalizePath(parsed.args[1], base);
      if (context.files[source] !== undefined) {
        context.files[dest] = context.files[source];
        delete context.files[source];
      }
      return { exists: dest, notExists: source };
    }
    case "whoami":
      return { loggedIn: true, user: "student" };
    case "hostname":
      return { loggedIn: true, host: "linux-practice" };
    default:
      return {};
  }
}

function buildTaskText(command) {
  const parsed = parseCommand(command);
  switch (parsed.command) {
    case "ssh":
      return `${command} を実行する`;
    case "whoami":
      return "whoami でログインユーザーを確認する";
    case "pwd":
      return "pwd で現在地を確認する";
    case "ls":
      return `${command} で一覧を確認する`;
    case "hostname":
      return "hostname で接続先ホスト名を確認する";
    case "cd":
      return `${command} で移動する`;
    case "cat":
    case "more":
      return `${command} で内容を確認する`;
    case "mkdir":
      return `${command} でディレクトリを作る`;
    case "touch":
      return `${command} でファイルを作る`;
    case "rm":
      return `${command} で削除する`;
    case "cp":
      return `${command} でコピーする`;
    case "echo":
      return `${command} で文字を書き込む`;
    case "tee":
      return `${command} で画面表示とファイル保存を同時に行う`;
    default:
      return `${command} を実行する`;
  }
}

function buildExpectForCommand(command, context) {
  const parsed = parseCommand(command);
  if (parsed.shell) return {};
  const { values } = splitOptions(parsed.args);
  const base = context.cwd;
  switch (parsed.command) {
    case "ssh":
      return { pendingHostKeyConfirmation: true };
    case "pwd":
      return { cwd: base };
    case "ls":
      return { exists: normalizePath(values[0] || base, base) };
    case "cd": {
      const cwd = normalizePath(values[0] || "/home/student", base);
      context.cwd = cwd;
      return { cwd };
    }
    case "cat":
    case "more": {
      const file = normalizePath(values[0], base);
      return context.files[file] !== undefined ? { file, content: context.files[file] } : { file };
    }
    case "mkdir": {
      const path = normalizePath(values[values.length - 1], base);
      return { exists: path, type: "dir" };
    }
    case "touch": {
      const path = normalizePath(values[0], base);
      if (context.files[path] === undefined) context.files[path] = "";
      return { exists: path, type: "file" };
    }
    case "echo": {
      const redirectIndex = parsed.args.indexOf(">");
      if (redirectIndex < 0) return {};
      const text = parsed.args.slice(0, redirectIndex).join(" ").replace(/^"|"$/g, "");
      const file = normalizePath(parsed.args[redirectIndex + 1], base);
      context.files[file] = `${text}\n`;
      return { file, content: `${text}\n` };
    }
    case "rm":
      return { notExists: normalizePath(values[0], base) };
    case "cp": {
      const source = normalizePath(values[0], base);
      const requestedDest = normalizePath(values[1], base);
      const dest = resolveCopyDestinationFromFs(state.fs, source, requestedDest);
      if (context.files[source] !== undefined) context.files[dest] = context.files[source];
      return context.files[dest] !== undefined ? { file: dest, content: context.files[dest] } : { exists: dest };
    }
    case "mv": {
      const source = normalizePath(values[0], base);
      const dest = normalizePath(values[1], base);
      if (context.files[source] !== undefined) {
        context.files[dest] = context.files[source];
        delete context.files[source];
      }
      return { exists: dest, notExists: source };
    }
    case "whoami":
      return { loggedIn: true, user: "student" };
    case "hostname":
      return { loggedIn: true, host: "linux-practice" };
    default:
      return {};
  }
}

function buildTasksFromCommandList(text) {
  const commands = text.split(/\r?\n/).map(normalizeSpaces).filter(Boolean);
  if (commands.length === 0) throw new Error("学生が実行するコマンドを1つ以上入力してください");
  const context = {
    cwd: "/home/student",
    files: {
      "/home/student/readme.txt": "Linux CLI practice environment.\n",
      "/home/student/documents/memo.txt": "Class memo: commands are typed as command plus target.\n",
      "/home/student/documents/lesson.txt": "Today's goal: SSH login, pwd, cd, and cat.\n",
    }
  };
  return commands.flatMap((command) => {
    const parsed = parseCommand(command);
    if (!commandCatalog.includes(parsed.command)) throw new Error(`未対応のコマンドがあります: ${parsed.command}`);
    if (parsed.command === "ssh") {
      if (command !== SSH_TARGET) throw new Error(`SSH課題は ${SSH_TARGET} を指定してください`);
      return [
        {
          text: buildTaskText(command),
          command,
          expect: { pendingHostKeyConfirmation: true }
        },
        {
          text: "yes と入力して接続を続ける",
          command: "yes",
          expect: { pendingPassword: true }
        },
        {
          text: `パスワード ${SSH_PASSWORD} を入力する`,
          command: SSH_PASSWORD,
          expect: { loggedIn: true, user: "student", host: "linux-practice" }
        },
        {
          text: "ログイン後のプロンプトを確認する",
          command: SSH_PASSWORD,
          expect: { loggedIn: true, cwd: "/home/student" }
        }
      ];
    }
    return {
      text: buildTaskText(command),
      command,
      expect: buildExpectForCommand(command, context)
    };
  });
}

function inferAllowedFromTasks(tasks) {
  const commands = tasks.flatMap((task) => {
    const tokens = tokenizeShell(task.command);
    return tokens
      .filter((token, index) => {
        if (!commandCatalog.includes(token)) return false;
        return index === 0 || tokens[index - 1] === "|";
      });
  });
  return [...new Set([...commands, "help", "clear"])];
}

function splitOptions(args) {
  const options = [];
  const values = [];
  args.forEach((arg) => {
    if (arg.startsWith("-") && arg !== "-") options.push(arg);
    else values.push(arg);
  });
  return { options, values };
}

function hasFlag(options, shortName) {
  return options.some((option) => option.includes(shortName));
}

function getNumericOption(args, shortName, fallback) {
  const inline = args.find((arg) => arg.startsWith(`-${shortName}`) && arg.length > 2);
  if (inline) return Number.parseInt(inline.slice(2), 10) || fallback;
  const index = args.indexOf(`-${shortName}`);
  if (index >= 0) return Number.parseInt(args[index + 1], 10) || fallback;
  return fallback;
}

function listChildren(path, recursive = false) {
  const node = state.fs[path];
  if (!node || node.type !== "dir") return [];
  const result = [];
  node.children.forEach((child) => {
    const childPath = path === "/" ? `/${child}` : `${path}/${child}`;
    result.push(childPath);
    if (recursive && state.fs[childPath]?.type === "dir") {
      result.push(...listChildren(childPath, true));
    }
  });
  return result;
}

function readFile(path) {
  const node = state.fs[path];
  if (!node) throw new Error(`${path}: No such file or directory`);
  if (node.type !== "file") throw new Error(`${path}: Is a directory`);
  return node.content;
}

function writeFile(path, content) {
  ensureParent(path);
  const existing = state.fs[path];
  state.fs[path] = {
    type: "file",
    content,
    mode: existing?.mode || "-rw-r--r--",
    owner: existing?.owner || state.user,
    group: existing?.group || state.user,
    size: content.length,
    links: existing?.links || 1,
    mtime: RECENT_LS_MTIME
  };
  addChild(path);
}

function cloneNodeForCopy(source) {
  const clone = structuredClone(source);
  clone.mtime = RECENT_LS_MTIME;
  if (clone.type === "file") clone.size = clone.content.length;
  return clone;
}

function resolveCopyDestination(sourcePath, destPath) {
  const dest = state.fs[destPath];
  if (dest?.type === "dir") {
    return destPath === "/" ? `/${basename(sourcePath)}` : `${destPath}/${basename(sourcePath)}`;
  }
  return destPath;
}

function resolveCopyDestinationFromFs(fs, sourcePath, destPath) {
  const dest = fs[destPath];
  if (dest?.type === "dir") {
    return destPath === "/" ? `/${basename(sourcePath)}` : `${destPath}/${basename(sourcePath)}`;
  }
  return destPath;
}

function copyPath(sourcePath, destPath, recursive = false) {
  const source = state.fs[sourcePath];
  const finalDestPath = resolveCopyDestination(sourcePath, destPath);
  if (!source) throw new Error(`cp: cannot stat '${sourcePath}': No such file or directory`);
  if (source.type === "file") {
    ensureParent(finalDestPath);
    state.fs[finalDestPath] = cloneNodeForCopy(source);
    addChild(finalDestPath);
    return;
  }
  if (!recursive) throw new Error(`cp: -r not specified; omitting directory '${sourcePath}'`);
  ensureParent(finalDestPath);
  state.fs[finalDestPath] = cloneNodeForCopy(source);
  state.fs[finalDestPath].children = [];
  addChild(finalDestPath);
  source.children.forEach((child) => {
    copyPath(`${sourcePath}/${child}`, `${finalDestPath}/${child}`, true);
  });
}

function removePathRecursive(path, recursive = false, force = false) {
  const node = state.fs[path];
  if (!node) {
    if (force) return;
    throw new Error(`rm: cannot remove '${path}': No such file or directory`);
  }
  if (node.type === "dir") {
    if (!recursive) throw new Error(`rm: cannot remove '${path}': Is a directory`);
    [...node.children].forEach((child) => removePathRecursive(`${path}/${child}`, true, force));
  }
  removePath(path);
}

function globToRegExp(pattern) {
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".");
  return new RegExp(`^${escaped}$`);
}

function splitPipelineTokens(tokens) {
  const segments = [[]];
  tokens.forEach((token) => {
    if (token === "|") segments.push([]);
    else segments[segments.length - 1].push(token);
  });
  if (segments.some((segment) => segment.length === 0)) throw new Error("syntax error near unexpected token '|'");
  return segments;
}

function parseShellSegment(tokens) {
  const commandTokens = [];
  const redirects = {
    stdin: "",
    stdout: "",
    stderr: "",
    mergeStderrToStdout: false,
    mergeBothTo: ""
  };

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token === "&1") throw new Error("syntax error: &1 is not supported");
    if (token === "<") {
      redirects.stdin = tokens[index + 1] || "";
      if (!redirects.stdin) throw new Error("syntax error: missing input file");
      index += 1;
      continue;
    }
    if (token === ">") {
      redirects.stdout = tokens[index + 1] || "";
      if (!redirects.stdout) throw new Error("syntax error: missing output file");
      index += 1;
      continue;
    }
    if (token === "2>") {
      redirects.stderr = tokens[index + 1] || "";
      if (!redirects.stderr) throw new Error("syntax error: missing error output file");
      index += 1;
      continue;
    }
    if (token === "2>&1") {
      redirects.mergeStderrToStdout = true;
      continue;
    }
    if (token === "&>" || token === ">&") {
      redirects.mergeBothTo = tokens[index + 1] || "";
      if (!redirects.mergeBothTo) throw new Error("syntax error: missing output file");
      index += 1;
      continue;
    }
    commandTokens.push(token);
  }

  return {
    parsed: {
      command: commandTokens[0] || "",
      args: commandTokens.slice(1),
      raw: normalizeSpaces(commandTokens.join(" "))
    },
    redirects
  };
}

function writeRedirect(path, content, append = false) {
  const targetPath = normalizePath(path);
  const previous = append ? state.fs[targetPath]?.content || "" : "";
  writeFile(targetPath, `${previous}${content}`);
}

function captureBuiltin(parsed, stdin = null) {
  const previousCapture = outputCapture;
  const previousStdin = currentStdin;
  outputCapture = { stdout: "", stderr: "" };
  currentStdin = stdin;
  try {
    executeBuiltin(parsed);
  } catch (error) {
    outputCapture.stderr += `${error.message}\n`;
  }
  const result = outputCapture;
  outputCapture = previousCapture;
  currentStdin = previousStdin;
  return result;
}

function executeShell(raw) {
  if (raw.includes(">>")) throw new Error("syntax error: append redirect (>>) is not supported; use tee -a for append practice");
  const tokens = tokenizeShell(raw);
  const segments = splitPipelineTokens(tokens).map(parseShellSegment);
  let stdin = null;
  let finalResult = { stdout: "", stderr: "" };
  let passthroughStderr = "";

  segments.forEach((segment, index) => {
    const isLast = index === segments.length - 1;
    const { parsed, redirects } = segment;
    if (!parsed.command) throw new Error("syntax error: missing command");
    if (!allowedCommands.has(parsed.command)) throw new Error(`このシナリオでは ${parsed.command} は練習対象外です`);
    requireLogin(parsed.command);

    const input = redirects.stdin ? readFile(normalizePath(redirects.stdin)) : stdin;
    const result = captureBuiltin(parsed, input);
    if (redirects.mergeStderrToStdout) {
      result.stdout += result.stderr;
      result.stderr = "";
    }

    if (redirects.mergeBothTo) {
      writeRedirect(redirects.mergeBothTo, `${result.stdout}${result.stderr}`);
      result.stdout = "";
      result.stderr = "";
    } else {
      if (redirects.stdout) {
        writeRedirect(redirects.stdout, result.stdout);
        result.stdout = "";
      }
      if (redirects.stderr) {
        writeRedirect(redirects.stderr, result.stderr);
        result.stderr = "";
      }
    }

    if (isLast) {
      finalResult = result;
    } else {
      stdin = result.stdout;
      passthroughStderr += result.stderr;
    }
  });

  finalResult.stderr = `${passthroughStderr}${finalResult.stderr}`;
  if (finalResult.stdout) printBlock(finalResult.stdout.replace(/\n$/, ""));
  if (finalResult.stderr) printBlock(finalResult.stderr.replace(/\n$/, ""), "error");
  lastCommandResult = finalResult;
}

function readStdinOrThrow(commandName) {
  if (currentStdin !== null && currentStdin !== undefined) return currentStdin;
  throw new Error(`${commandName}: file operand required`);
}

function getTextInput(values, commandName, startIndex = 0) {
  const files = values.slice(startIndex);
  if (files.length === 0) return readStdinOrThrow(commandName);
  return files.map((file) => readFile(normalizePath(file))).join("");
}

function runHead(args) {
  const count = getNumericOption(args, "n", 10);
  const file = args.filter((arg, index) => !(arg === "-n" || args[index - 1] === "-n" || /^-n\d+/.test(arg)))[0];
  const text = file ? readFile(normalizePath(file)) : readStdinOrThrow("head");
  printBlock(text.split("\n").slice(0, count).join("\n").replace(/\n$/, ""));
}

function runTail(args) {
  const count = getNumericOption(args, "n", 10);
  const file = args.filter((arg, index) => !(arg === "-n" || args[index - 1] === "-n" || /^-n\d+/.test(arg)))[0];
  const text = file ? readFile(normalizePath(file)) : readStdinOrThrow("tail");
  const lines = text.split("\n");
  printBlock(lines.slice(Math.max(0, lines.length - count - 1)).join("\n").replace(/\n$/, ""));
}

function runGrep(args) {
  const { options, values } = splitOptions(args);
  const pattern = values[0];
  const files = values.slice(1);
  if (!pattern) throw new Error("grep: pattern required");
  const flags = hasFlag(options, "i") ? "i" : "";
  const regex = new RegExp(pattern, flags);
  const invert = hasFlag(options, "v");
  const showLine = hasFlag(options, "n");
  const sources = files.length
    ? files.map((file) => readFile(normalizePath(file)))
    : [readStdinOrThrow("grep")];
  sources.forEach((text) => {
    const lines = text.split("\n");
    lines.forEach((line, index) => {
      if (!line && index === lines.length - 1) return;
      const matched = regex.test(line);
      if (matched !== invert) printLine(`${showLine ? `${index + 1}:` : ""}${line}`);
    });
  });
}

function runWc(args) {
  const { options, values } = splitOptions(args);
  const file = values[0];
  const text = file ? readFile(normalizePath(file)) : readStdinOrThrow("wc");
  const counts = {
    l: text.endsWith("\n") ? text.split("\n").length - 1 : text.split("\n").length,
    w: text.trim() ? text.trim().split(/\s+/).length : 0,
    c: text.length
  };
  const selected = options.length ? ["l", "w", "c"].filter((key) => hasFlag(options, key)) : ["l", "w", "c"];
  printLine(`${selected.map((key) => counts[key]).join(" ")}${file ? ` ${file}` : ""}`);
}

function runDate(args) {
  const fixed = new Date("2026-05-03T09:00:00+09:00");
  const format = args.find((arg) => arg.startsWith("+"));
  if (!format) {
    printLine("Sun May  3 09:00:00 JST 2026");
    return;
  }
  const pad = (value) => String(value).padStart(2, "0");
  printLine(format.slice(1)
    .replace(/%Y/g, String(fixed.getFullYear()))
    .replace(/%m/g, pad(fixed.getMonth() + 1))
    .replace(/%d/g, pad(fixed.getDate()))
    .replace(/%H/g, pad(fixed.getHours()))
    .replace(/%M/g, pad(fixed.getMinutes()))
    .replace(/%S/g, pad(fixed.getSeconds())));
}

function runFind(args) {
  const start = normalizePath(args[0] && !args[0].startsWith("-") ? args[0] : ".");
  let paths = [start, ...listChildren(start, true)];
  const nameIndex = args.indexOf("-name");
  if (nameIndex >= 0) {
    const regex = globToRegExp(args[nameIndex + 1] || "*");
    paths = paths.filter((path) => regex.test(basename(path)));
  }
  const typeIndex = args.indexOf("-type");
  if (typeIndex >= 0) {
    const type = args[typeIndex + 1] === "f" ? "file" : "dir";
    paths = paths.filter((path) => state.fs[path]?.type === type);
  }
  printBlock(paths.join("\n"));
}

function runSed(args) {
  const expr = args[0];
  const file = args[1];
  if (!expr) throw new Error("sed: expression required");
  const match = expr.match(/^s\/(.+)\/(.*)\/(g?)$/);
  if (!match) throw new Error("sed: only s/pattern/replacement/[g] is supported");
  const regex = new RegExp(match[1], match[3] ? "g" : "");
  const text = file ? readFile(normalizePath(file)) : readStdinOrThrow("sed");
  printBlock(text.replace(regex, match[2]).replace(/\n$/, ""));
}

function runAwk(args) {
  let separator = /\s+/;
  let scriptIndex = 0;
  if (args[0] === "-F") {
    separator = new RegExp(args[1]);
    scriptIndex = 2;
  }
  const script = args[scriptIndex];
  const file = args[scriptIndex + 1];
  if (!script) throw new Error("awk: script required");
  const fieldMatch = script.match(/^\{print \$(\d+)\}$/);
  if (!fieldMatch) throw new Error("awk: only '{print $N}' is supported");
  const field = Number.parseInt(fieldMatch[1], 10) - 1;
  const text = file ? readFile(normalizePath(file)) : readStdinOrThrow("awk");
  printBlock(text.split("\n").filter(Boolean).map((line) => line.split(separator)[field] || "").join("\n"));
}

function runTee(args) {
  const { options, values } = splitOptions(args);
  if (!values[0]) throw new Error("tee: file operand required");
  const text = readStdinOrThrow("tee");
  const append = hasFlag(options, "a");
  writeRedirect(values[0], text, append);
  printBlock(text.replace(/\n$/, ""));
}

function runMore(args) {
  const { values } = splitOptions(args);
  if (!values[0]) throw new Error("more: missing file operand");
  const content = values.map((arg) => readFile(normalizePath(arg)).replace(/\n$/, "")).join("\n");
  startMorePaging(content);
}

function runMkdir(args) {
  const { options, values } = splitOptions(args);
  const parents = hasFlag(options, "p");
  if (!values[0]) throw new Error("mkdir: missing operand");
  values.forEach((arg) => {
    const targetPath = normalizePath(arg);
    if (state.fs[targetPath]) return;
    if (parents) {
      const parts = targetPath.split("/").filter(Boolean);
      let current = "";
      parts.forEach((part) => {
        current = `${current}/${part}`;
        if (!state.fs[current]) {
          state.fs[current] = createDirNode([], { owner: state.user, group: state.user, mtime: RECENT_LS_MTIME });
          addChild(current);
        }
      });
    } else {
      ensureParent(targetPath);
      state.fs[targetPath] = createDirNode([], { owner: state.user, group: state.user, mtime: RECENT_LS_MTIME });
      addChild(targetPath);
    }
  });
}

function runRm(args) {
  const { options, values } = splitOptions(args);
  if (!values[0]) throw new Error("rm: missing operand");
  const recursive = hasFlag(options, "r") || hasFlag(options, "R");
  const force = hasFlag(options, "f");
  const interactive = hasFlag(options, "i");
  if (interactive) {
    const targetPath = normalizePath(values[0]);
    const node = state.fs[targetPath];
    if (!node) {
      if (force) return;
      throw new Error(`rm: cannot remove '${values[0]}': No such file or directory`);
    }
    const typeLabel = node.type === "dir" ? "directory" : "regular file";
    pendingRmConfirmation = { path: targetPath, recursive, force };
    printLine(`rm: remove ${typeLabel} '${values[0]}'?`, "system");
    return;
  }
  values.forEach((arg) => removePathRecursive(normalizePath(arg), recursive, force));
}

function runCp(args) {
  const { options, values } = splitOptions(args);
  if (values.length < 2) throw new Error("cp: missing file operand");
  copyPath(normalizePath(values[0]), normalizePath(values[1]), hasFlag(options, "r") || hasFlag(options, "R"));
}

function runMv(args) {
  const { values } = splitOptions(args);
  if (values.length < 2) throw new Error("mv: missing file operand");
  const sourcePath = normalizePath(values[0]);
  const destPath = normalizePath(values[1]);
  const source = state.fs[sourcePath];
  if (!source) throw new Error(`mv: cannot stat '${values[0]}': No such file or directory`);
  state.fs[destPath] = structuredClone(source);
  addChild(destPath);
  removePathRecursive(sourcePath, true, true);
}

function executeBuiltin(parsed) {
  const { command, args, raw } = parsed;
  switch (command) {
    case "ssh": return runSsh(args);
    case "pwd": return printLine(state.cwd);
    case "ls": return runLs(args);
    case "cd": return runCd(args);
    case "cat": return runCat(args);
    case "more": return runMore(args);
    case "mkdir": return runMkdir(args);
    case "touch": return runTouch(args);
    case "rm": return runRm(args);
    case "cp": return runCp(args);
    case "mv": return runMv(args);
    case "echo": return runEcho(args);
    case "head": return runHead(args);
    case "tail": return runTail(args);
    case "grep": return runGrep(args);
    case "wc": return runWc(args);
    case "date": return runDate(args);
    case "find": return runFind(args);
    case "sed": return runSed(args);
    case "awk": return runAwk(args);
    case "tee": return runTee(args);
    case "whoami": return printLine(state.user);
    case "hostname": return printLine(state.host);
    case "exit": return runExit();
    case "clear": terminalOutput.textContent = ""; return;
    case "help": return showHelp();
    default: throw new Error(`${raw}: command not found`);
  }
}

function execute(parsed) {
  const { command } = parsed;
  if (!command) return;
  if (parsed.shell) return executeShell(parsed.raw);
  if (!allowedCommands.has(command)) throw new Error(`このシナリオでは ${command} は練習対象外です`);
  requireLogin(command);
  lastCommandResult = { stdout: "", stderr: "" };
  return executeBuiltin(parsed);
}

function buildAdminScenarioFromForm() {
  const label = adminScenarioLabel.value.trim();
  if (!label) throw new Error("シナリオ名を入力してください");
  const tasks = buildTasksFromCommandList(adminCommandList.value);
  return normalizeScenario({
    label,
    allowed: inferAllowedFromTasks(tasks),
    tasks
  });
}

function buildAdminPreviewScenario() {
  const tasks = buildTasksFromCommandList(adminCommandList.value);
  const label = adminScenarioLabel.value.trim() || "入力中シナリオ";
  return normalizeScenario({
    label,
    allowed: inferAllowedFromTasks(tasks),
    tasks
  });
}

function resetAdminPackage() {
  adminPackage.lessonTitle = "";
  adminPackage.scenarios = [];
  adminMergeQueueItems = [];
  setAdminMergeStatus("まだ統合していません");
  renderAdminMergeQueue();
  updateAdminPreview();
}

function parseScenarioPackage(parsed) {
  const list = Array.isArray(parsed) ? parsed : parsed.scenarios;
  if (!Array.isArray(list)) throw new Error("JSONは配列、または scenarios 配列を持つ形式にしてください");
  return {
    title: String(parsed.lessonTitle || parsed.title || "授業シナリオ").trim(),
    scenarios: list.map(normalizeScenario)
  };
}

async function loadScenarioFile(file) {
  if (!file) return;
  if (!file.name.toLowerCase().endsWith(".json")) throw new Error("講師から配布された教材ファイルを選択してください");
  const text = await file.text();
  const lesson = parseScenarioPackage(JSON.parse(text));
  if (lesson.scenarios.length === 0) throw new Error("シナリオが入っていません");
  const keys = lesson.scenarios.map((scenario) => addScenario(scenario, { activate: false, announce: false }));
  setScenario(keys[0]);
  scenarioLoadStatus.textContent = `${lesson.title}: ${lesson.scenarios.length}件を読み込み済み`;
  scenarioLoadStatus.classList.add("is-loaded");
  printLine(`教材ファイル「${lesson.title}」を読み込みました。右側のシナリオから課題を選べます。`, "success");
}

function getScenarioKeys() {
  return Object.keys(getScenarioStore());
}

function getCompletedSet(key = activeScenarioKey) {
  if (!completedTasks.has(key)) completedTasks.set(key, new Set());
  return completedTasks.get(key);
}

function getNextIncompleteTaskIndex(key = activeScenarioKey) {
  const tasks = getScenarioStore()[key].tasks;
  const completedSet = getCompletedSet(key);
  for (let index = 0; index < tasks.length; index += 1) {
    if (!completedSet.has(index)) return index;
  }
  return -1;
}

function isScenarioComplete(key = activeScenarioKey) {
  const store = getScenarioStore();
  const taskCount = store[key].tasks.length;
  return taskCount > 0 && getCompletedSet(key).size >= taskCount;
}

function getNextScenarioKey() {
  const keys = getScenarioKeys();
  const index = keys.indexOf(activeScenarioKey);
  return keys[index + 1] || "";
}

function applyScenarioFiles(scenario) {
  if (!scenario?.files) return;
  Object.entries(scenario.files).forEach(([path, content]) => {
    writeFile(path, content);
  });
}

function setScenario(key) {
  const store = getScenarioStore();
  const scenario = store[key];
  activeScenarioKey = key;
  allowedCommands = new Set(scenario.allowed);
  clearMorePaging();
  if (activeRuntimeName === "main" && mainScenarioStartsLoggedOut(key)) {
    ensureGuestSession();
  } else if (scenarioStartsLoggedOut(scenario)) {
    ensureGuestSession();
  } else if (!state.loggedIn) {
    ensureStudentSession();
  }
  applyScenarioFiles(scenario);
  setPrompt();
  renderControls();
}

function nodeMatches(path, type) {
  const node = state.fs[path];
  if (!node) return false;
  return !type || node.type === type;
}

function validateExpect(expect, parsed, before) {
  if (expect.loggedIn !== undefined && state.loggedIn !== expect.loggedIn) return false;
  if (expect.user && state.user !== expect.user) return false;
  if (expect.host && state.host !== expect.host) return false;
  if (expect.cwd && state.cwd !== expect.cwd) return false;
  if (expect.pendingPassword && pendingPasswordFor !== "student@linux-practice") return false;
  if (expect.exists && !nodeMatches(expect.exists, expect.type)) return false;
  if (expect.notExists && state.fs[expect.notExists]) return false;
  if (expect.file) {
    const node = state.fs[expect.file];
    if (!node || node.type !== "file") return false;
    if (expect.content !== undefined && node.content !== expect.content) return false;
  }

  if (Object.keys(expect).length > 0) return true;

  switch (parsed.command) {
    case "ssh":
      return pendingPasswordFor === "student@linux-practice";
    case "password":
      return state.loggedIn && state.user === "student" && state.host === "linux-practice";
    case "cd": {
      const target = normalizePath(parsed.args[0] || "/home/student", before.cwd);
      return state.cwd === target && nodeMatches(target, "dir");
    }
    case "mkdir":
      return parsed.args.every((arg) => nodeMatches(normalizePath(arg, before.cwd), "dir"));
    case "touch":
      return parsed.args.every((arg) => nodeMatches(normalizePath(arg, before.cwd), "file"));
    case "echo": {
      const redirectIndex = parsed.args.indexOf(">");
      if (redirectIndex < 0) return true;
      const text = parsed.args.slice(0, redirectIndex).join(" ").replace(/^"|"$/g, "");
      const target = normalizePath(parsed.args[redirectIndex + 1], before.cwd);
      return state.fs[target]?.type === "file" && state.fs[target].content === `${text}\n`;
    }
    case "rm":
      return parsed.args.every((arg) => !state.fs[normalizePath(arg, before.cwd)]);
    case "cp": {
      const source = before.fs[normalizePath(parsed.args[0], before.cwd)];
      const dest = state.fs[normalizePath(parsed.args[1], before.cwd)];
      return source?.type === "file" && dest?.type === "file" && source.content === dest.content;
    }
    case "mv":
      return !state.fs[normalizePath(parsed.args[0], before.cwd)] && !!state.fs[normalizePath(parsed.args[1], before.cwd)];
    case "cat":
      return parsed.args.every((arg) => nodeMatches(normalizePath(arg, before.cwd), "file"));
    case "ls":
      return !!state.fs[normalizePath(parsed.args[0] || before.cwd, before.cwd)];
    case "pwd":
    case "whoami":
    case "help":
    case "clear":
      return true;
    case "exit":
      return !state.loggedIn;
    default:
      return false;
  }
}

function normalizeCommandForComparison(commandText, base = state.cwd) {
  const parsed = parseCommand(commandText);
  if (parsed.shell) return normalizeSpaces(commandText);
  const args = [...parsed.args];
  const pathArgIndexes = {
    cd: [0],
    ls: [0],
    cat: [0],
    mkdir: [0],
    touch: [0],
    rm: [0],
    cp: [0, 1],
    mv: [0, 1],
    head: [args.length - 1],
    tail: [args.length - 1],
    wc: [args.length - 1],
    sed: [1],
    grep: args.length >= 2 ? [args.length - 1] : [],
    find: [0]
  }[parsed.command] || [];

  pathArgIndexes.forEach((index) => {
    if (index >= 0 && args[index] && !args[index].startsWith("-")) {
      args[index] = normalizePath(args[index], base);
    }
  });

  return normalizeSpaces([parsed.command, ...args].join(" "));
}

function normalizeCommandForComparison(commandText, base = state.cwd) {
  const parsed = parseCommand(commandText);
  if (parsed.shell) return normalizeSpaces(commandText);
  const { options, values } = splitOptions(parsed.args);
  const normalizeValueIndexes = {
    cd: [0],
    ls: [0],
    cat: values.map((_, index) => index),
    more: values.map((_, index) => index),
    mkdir: values.map((_, index) => index),
    touch: values.map((_, index) => index),
    rm: values.map((_, index) => index),
    cp: [0, 1],
    mv: [0, 1],
    head: values.length ? [values.length - 1] : [],
    tail: values.length ? [values.length - 1] : [],
    wc: values.map((_, index) => index),
    sed: values.length >= 2 ? [1] : [],
    grep: values.length >= 2 ? values.slice(1).map((_, index) => index + 1) : [],
    find: [0]
  }[parsed.command] || [];

  const normalizedValues = values.map((value, index) => {
    if (!value || value.startsWith("-") || !normalizeValueIndexes.includes(index)) return value;
    return normalizePath(value, base);
  });
  return normalizeSpaces([parsed.command, ...options, ...normalizedValues].join(" "));
}

function commandsEquivalent(expected, actual, before) {
  if (normalizeSpaces(expected) === normalizeSpaces(actual)) return true;
  return normalizeCommandForComparison(expected, before.cwd) === normalizeCommandForComparison(actual, before.cwd);
}

function taskIsSatisfied(task, input, parsed, before) {
  if (!commandsEquivalent(task.command, input, before)) return false;
  return validateExpect(task.expect || {}, parsed, before);
}

function validateExpectForExtendedCommands(expect, parsed, before) {
  if (expect.loggedIn !== undefined && state.loggedIn !== expect.loggedIn) return false;
  if (expect.user && state.user !== expect.user) return false;
  if (expect.host && state.host !== expect.host) return false;
  if (expect.cwd && state.cwd !== expect.cwd) return false;
  if (expect.pendingPassword && pendingPasswordFor !== SSH_TARGET) return false;
  if (expect.pendingHostKeyConfirmation && pendingHostKeyFor !== SSH_TARGET) return false;
  if (expect.exists && !nodeMatches(expect.exists, expect.type)) return false;
  if (expect.notExists && state.fs[expect.notExists]) return false;
  if (expect.file) {
    const node = state.fs[expect.file];
    if (!node || node.type !== "file") return false;
    if (expect.content !== undefined && node.content !== expect.content) return false;
  }
  if (expect.stdout !== undefined && lastCommandResult.stdout !== expect.stdout) return false;
  if (expect.stderr !== undefined && lastCommandResult.stderr !== expect.stderr) return false;
  if (Object.keys(expect).length > 0) return true;

  const { values } = splitOptions(parsed.args || []);
  switch (parsed.command) {
    case "ssh": return pendingHostKeyFor === SSH_TARGET || pendingPasswordFor === SSH_TARGET;
    case "response": return pendingPasswordFor === SSH_TARGET;
    case "password": return state.loggedIn && state.user === "student" && state.host === "linux-practice";
    case "cd": return state.cwd === normalizePath(values[0] || "/home/student", before.cwd);
    case "mkdir": return values.every((arg) => nodeMatches(normalizePath(arg, before.cwd), "dir"));
    case "touch": return values.every((arg) => nodeMatches(normalizePath(arg, before.cwd), "file"));
    case "echo": {
      const redirectIndex = parsed.args.indexOf(">");
      if (redirectIndex < 0) return true;
      const text = parsed.args.slice(0, redirectIndex).join(" ").replace(/^"|"$/g, "");
      const target = normalizePath(parsed.args[redirectIndex + 1], before.cwd);
      return state.fs[target]?.type === "file" && state.fs[target].content === `${text}\n`;
    }
    case "rm": return values.every((arg) => !state.fs[normalizePath(arg, before.cwd)]);
    case "cp": {
      const source = normalizePath(values[0], before.cwd);
      const requestedDest = normalizePath(values[1], before.cwd);
      const dest = resolveCopyDestinationFromFs(before.fs, source, requestedDest);
      return !!state.fs[dest];
    }
    case "mv": return !state.fs[normalizePath(values[0], before.cwd)] && !!state.fs[normalizePath(values[1], before.cwd)];
    case "cat":
    case "head":
    case "tail": {
      const files = values.length ? values : parsed.args.filter((arg) => !arg.startsWith("-") && !/^\d+$/.test(arg));
      return files.every((arg) => nodeMatches(normalizePath(arg, before.cwd), "file"));
    }
    case "grep": return values.slice(1).every((arg) => nodeMatches(normalizePath(arg, before.cwd), "file"));
    case "wc": return values.every((arg) => nodeMatches(normalizePath(arg, before.cwd), "file"));
    case "find": return !!state.fs[normalizePath(values[0] || ".", before.cwd)];
    case "sed": return !!parsed.args[1] && nodeMatches(normalizePath(parsed.args[1], before.cwd), "file");
    case "awk": {
      const file = parsed.args[0] === "-F" ? parsed.args[3] : parsed.args[1];
      return !!file && nodeMatches(normalizePath(file, before.cwd), "file");
    }
    case "ls": return !!state.fs[normalizePath(values[0] || before.cwd, before.cwd)];
    case "pwd":
    case "whoami":
    case "hostname":
    case "help":
    case "clear":
    case "date":
      return true;
    case "exit": return !state.loggedIn;
    default: return commandCatalog.includes(parsed.command);
  }
}

validateExpect = validateExpectForExtendedCommands;

function markTasks(input, parsed, before) {
  const store = getScenarioStore();
  const completedSet = getCompletedSet();
  const nextTaskIndex = getNextIncompleteTaskIndex();
  if (nextTaskIndex < 0) {
    renderControls();
    return;
  }

  const nextTask = store[activeScenarioKey].tasks[nextTaskIndex];
  if (taskIsSatisfied(nextTask, input, parsed, before)) {
    completedSet.add(nextTaskIndex);
  }
  renderControls();
}

function submitCurrentCommand() {
  const { commandInput: inputElement, promptLabel: prompt } = getRuntimeElements();
  const input = inputElement.value.trim();
  if (!input) return;

  if (isPagingMore()) {
    inputElement.value = "";
    handleMorePagingInput(input);
    return;
  }

  if (!isAwaitingInteractiveInput()) {
    printLine(`${prompt.textContent} ${input}`);
    commandHistory.push(input);
    historyIndex = commandHistory.length;
  } else if (isAwaitingHostKeyConfirmation() || isAwaitingRmConfirmation()) {
    printLine(input);
  }

  inputElement.value = "";

  try {
    if (isAwaitingHostKeyConfirmation()) {
      handleHostKeyConfirmation(input);
    } else if (isAwaitingPassword()) {
      completePassword(input);
    } else if (isAwaitingRmConfirmation()) {
      const pending = completeRmConfirmation(input);
      if (pending?.taskInput && ["y", "yes"].includes(input.toLowerCase())) {
        markTasks(pending.taskInput, pending.taskParsed, pending.before);
      }
    } else {
      const parsed = parseCommand(input);
      const before = snapshotState();
      commandOutputCapture = { stdout: "", stderr: "" };
      try {
        execute(parsed);
        lastCommandResult = commandOutputCapture;
      } finally {
        commandOutputCapture = null;
      }
      if (pendingRmConfirmation && parsed.command === "rm") {
        pendingRmConfirmation.taskInput = parsed.raw;
        pendingRmConfirmation.taskParsed = parsed;
        pendingRmConfirmation.before = before;
      }
      markTasks(parsed.raw, parsed, before);
      if (parsed.command === "exit" && getScenarioStore().login) setScenario("login");
    }
  } catch (error) {
    printLine(error.message, "error");
  }

  setPrompt();
  renderControls();
}

commandForm.addEventListener("submit", (event) => {
  event.preventDefault();
  submitCurrentCommand();
});

function longestCommonPrefix(values) {
  if (values.length === 0) return "";
  let prefix = values[0];
  values.slice(1).forEach((value) => {
    while (!value.startsWith(prefix) && prefix) prefix = prefix.slice(0, -1);
  });
  return prefix;
}

function getDirectoryEntriesForCompletion(token) {
  const slashIndex = token.lastIndexOf("/");
  const directoryPart = slashIndex >= 0 ? token.slice(0, slashIndex + 1) : "";
  const namePart = slashIndex >= 0 ? token.slice(slashIndex + 1) : token;
  const directoryPath = normalizePath(directoryPart || state.cwd);
  const directory = state.fs[directoryPath];
  if (!directory || directory.type !== "dir") return [];

  return directory.children
    .filter((name) => name.startsWith(namePart))
    .map((name) => {
      const childPath = directoryPath === "/" ? `/${name}` : `${directoryPath}/${name}`;
      const suffix = state.fs[childPath]?.type === "dir" ? "/" : "";
      return `${directoryPart}${name}${suffix}`;
    });
}

function replaceCurrentToken(input, replacement) {
  if (/\s$/.test(input)) return `${input}${replacement}`;
  return input.replace(/\S+$/, replacement);
}

function completeCommandInput() {
  if (isInSshDialogue()) return;

  const { commandInput: inputElement } = getRuntimeElements();
  const input = inputElement.value;
  const normalized = input.replace(/\s+$/, (match) => match);
  const tokens = normalized.trimStart().split(/\s+/).filter(Boolean);
  const completingCommand = tokens.length <= 1 && !/\s$/.test(input);
  const currentToken = /\s$/.test(input) ? "" : (tokens[tokens.length - 1] || "");

  const candidates = completingCommand
    ? commandCatalog.filter((command) => command.startsWith(currentToken)).sort()
    : getDirectoryEntriesForCompletion(currentToken);

  if (candidates.length === 0) return;

  if (candidates.length === 1) {
    const completed = completingCommand ? candidates[0] : candidates[0];
    inputElement.value = completingCommand
      ? `${completed} `
      : `${replaceCurrentToken(input, completed)}${completed.endsWith("/") ? "" : " "}`;
    return;
  }

  const prefix = longestCommonPrefix(candidates);
  if (prefix && prefix.length > currentToken.length) {
    inputElement.value = completingCommand ? prefix : replaceCurrentToken(input, prefix);
    return;
  }

  const { promptLabel: prompt } = getRuntimeElements();
  printLine(`${prompt.textContent} ${input}`);
  printBlock(candidates.join("  "), "system");
}

function handleCommandInputKeydown(event) {
  const { commandInput: inputElement } = getRuntimeElements();
  if (isPagingMore()) {
    if (event.key === "Enter" || event.key === " " || event.code === "Space") {
      event.preventDefault();
      inputElement.value = "";
      handleMorePagingInput("");
      return;
    }
    if (event.key.toLowerCase() === "q") {
      event.preventDefault();
      inputElement.value = "";
      handleMorePagingInput("q");
      return;
    }
    event.preventDefault();
    return;
  }
  if (event.key === "Tab") {
    event.preventDefault();
    completeCommandInput();
    return;
  }
  if (event.key === "ArrowUp") {
    event.preventDefault();
    historyIndex = Math.max(0, historyIndex - 1);
    inputElement.value = commandHistory[historyIndex] || "";
  }
  if (event.key === "ArrowDown") {
    event.preventDefault();
    historyIndex = Math.min(commandHistory.length, historyIndex + 1);
    inputElement.value = commandHistory[historyIndex] || "";
  }
}

commandInput.addEventListener("keydown", handleCommandInputKeydown);
adminCommandInput.addEventListener("keydown", (event) => {
  withRuntime(ADMIN_RUNTIME_NAME, () => handleCommandInputKeydown(event));
});

studentScenarioFile.addEventListener("change", async () => {
  const file = studentScenarioFile.files[0];
  try {
    await loadScenarioFile(file);
  } catch (error) {
    scenarioLoadStatus.textContent = `読み込み失敗: ${error.message}`;
    scenarioLoadStatus.classList.remove("is-loaded");
    printLine(`教材ファイルの読み込みエラー: ${error.message}`, "error");
  } finally {
    studentScenarioFile.value = "";
  }
});

studentDropzone.addEventListener("dragover", (event) => {
  event.preventDefault();
  studentDropzone.classList.add("is-dragging");
});

studentDropzone.addEventListener("dragleave", () => {
  studentDropzone.classList.remove("is-dragging");
});

studentDropzone.addEventListener("drop", async (event) => {
  event.preventDefault();
  studentDropzone.classList.remove("is-dragging");
  try {
    await loadScenarioFile(event.dataTransfer.files[0]);
  } catch (error) {
    scenarioLoadStatus.textContent = `読み込み失敗: ${error.message}`;
    scenarioLoadStatus.classList.remove("is-loaded");
    printLine(`教材ファイルの読み込みエラー: ${error.message}`, "error");
  }
});

adminMergeFiles.addEventListener("change", async () => {
  adminScenarioError.textContent = "";
  try {
    await queueAdminScenarioFiles(adminMergeFiles.files);
  } catch (error) {
    updateAdminMergeQueueStatus(`取り込み失敗: ${error.message}`);
    adminScenarioError.textContent = error.message;
  } finally {
    adminMergeFiles.value = "";
  }
});

adminMergeQueue.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const index = Number(button.dataset.index);
  if (Number.isNaN(index)) return;
  const action = button.dataset.action;
  if (action === "up") moveAdminMergeQueueItem(index, -1);
  if (action === "down") moveAdminMergeQueueItem(index, 1);
  if (action === "remove") removeAdminMergeQueueItem(index);
});

applyAdminMerge.addEventListener("click", () => {
  adminScenarioError.textContent = "";
  try {
    applyAdminMergeQueue();
  } catch (error) {
    adminScenarioError.textContent = error.message;
  }
});

clearAdminMergeQueue.addEventListener("click", () => {
  adminMergeQueueItems = [];
  updateAdminMergeQueueStatus("取り込み待ち一覧を空にしました");
});

nextScenarioButton.addEventListener("click", () => {
  const store = getScenarioStore();
  const nextKey = getNextScenarioKey();
  if (!nextKey || !isScenarioComplete()) return;
  setScenario(nextKey);
  printLine(`次のシナリオ「${store[nextKey].label}」に進みました。`, "system");
});

resetButton.addEventListener("click", () => {
  state = createInitialState();
  resetSshAuthState();
  clearMorePaging();
  pendingRmConfirmation = null;
  knownHosts.clear();
  commandHistory = [];
  historyIndex = 0;
  completedTasks.clear();
  terminalOutput.textContent = "";
  setScenario("login");
  boot();
});

function initializeAdminRuntime(scenario = EMPTY_ADMIN_SCENARIO, message = "") {
  const previewScenario = scenario.tasks?.length ? scenario : EMPTY_ADMIN_SCENARIO;
  runtimeRegistry[ADMIN_RUNTIME_NAME].scenarios = {
    [ADMIN_PREVIEW_KEY]: previewScenario
  };
  runtimeRegistry[ADMIN_RUNTIME_NAME].snapshot = createRuntimeSnapshot({
    activeScenarioKey: ADMIN_PREVIEW_KEY,
    allowedCommands: previewScenario.allowed,
    scenarios: runtimeRegistry[ADMIN_RUNTIME_NAME].scenarios
  });

  adminTerminalOutput.textContent = "";
  adminCommandInput.value = "";

  withRuntime(ADMIN_RUNTIME_NAME, () => {
    setScenario(ADMIN_PREVIEW_KEY);
    if (message) printLine(message, "system");
    setPrompt();
    renderControls();
  });
}

function startAdminPreviewTest() {
  adminScenarioError.textContent = "";
  try {
    const scenario = buildAdminPreviewScenario();
    initializeAdminRuntime(scenario, `試験シナリオ「${scenario.label}」を読み込みました。`);
    adminCommandInput.focus();
  } catch (error) {
    adminScenarioError.textContent = error.message;
  }
}

helpButton.addEventListener("click", () => {
  openAdminHelpDialog();
});

adminHelpPrevPage.addEventListener("click", () => {
  if (adminHelpPaging.page === 0) return;
  adminHelpPaging.page -= 1;
  renderAdminHelpPage();
});

adminHelpNextPage.addEventListener("click", () => {
  if (adminHelpPaging.page >= getAdminHelpPageCount() - 1) return;
  adminHelpPaging.page += 1;
  renderAdminHelpPage();
});

closeAdminHelp.addEventListener("click", () => {
  adminHelpDialog.close();
});

openAdminButton.addEventListener("click", () => {
  adminPasswordError.textContent = "";
  adminPasswordInput.value = "";
  adminPasswordDialog.showModal();
  adminPasswordInput.focus();
});

cancelAdminLogin.addEventListener("click", () => {
  adminPasswordDialog.close();
});

adminPasswordForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (adminPasswordInput.value !== INSTRUCTOR_PASSWORD) {
    adminPasswordError.textContent = "パスワードが違います";
    adminPasswordInput.select();
    return;
  }
  adminPasswordDialog.close();
  document.body.classList.add("admin-mode");
  adminScreen.hidden = false;
  updateAdminPreview();
  initializeAdminRuntime();
});

closeAdminButton.addEventListener("click", () => {
  adminScreen.hidden = true;
  document.body.classList.remove("admin-mode");
  commandInput.focus();
});

adminLessonTitle.addEventListener("input", updateAdminPreview);

adminScenarioForm.addEventListener("submit", (event) => {
  event.preventDefault();
  adminScenarioError.textContent = "";
  try {
    const scenario = buildAdminScenarioFromForm();
    adminPackage.lessonTitle = adminLessonTitle.value.trim() || adminPackage.lessonTitle;
    adminPackage.scenarios.push(scenario);
    adminScenarioLabel.value = "";
    adminScenarioError.textContent = `シナリオ「${scenario.label}」を追加しました`;
    updateAdminPreview();
  } catch (error) {
    adminScenarioError.textContent = error.message;
  }
});

resetAdminJson.addEventListener("click", () => {
  resetAdminPackage();
  adminLessonTitle.value = "";
  adminScenarioError.textContent = "追加済みシナリオをリセットしました";
});

startAdminTest.addEventListener("click", startAdminPreviewTest);

resetAdminTest.addEventListener("click", () => {
  if (adminCommandList.value.trim()) {
    startAdminPreviewTest();
    return;
  }
  adminScenarioError.textContent = "";
  initializeAdminRuntime();
});

adminCommandForm.addEventListener("submit", (event) => {
  event.preventDefault();
  withRuntime(ADMIN_RUNTIME_NAME, () => submitCurrentCommand());
});

downloadScenarioJson.addEventListener("click", () => {
  adminScenarioError.textContent = "";
  try {
    if (adminPackage.scenarios.length === 0) {
      const scenario = buildAdminScenarioFromForm();
      adminPackage.lessonTitle = adminLessonTitle.value.trim() || adminPackage.lessonTitle;
      adminPackage.scenarios.push(scenario);
    }
    const pkg = getAdminPackageForDownload();
    const safeTitle = pkg.lessonTitle.replace(/[\\/:*?"<>|]/g, "_") || "lesson-scenarios";
    downloadText(`${safeTitle}.json`, `${JSON.stringify(pkg, null, 2)}\n`);
    updateAdminPreview();
  } catch (error) {
    adminScenarioError.textContent = error.message;
  }
});

function boot() {
  printLine("Linux CLI 学習シミュレータを起動しました。", "system");
  printLine("講師から配布された教材ファイルがある場合は、画面上部で読み込んでください。", "system");
  printLine("SSH演習の前提: ログインユーザーは student、接続先の Linux マシンは linux-practice です。", "system");
  printLine("接続練習: ssh student@linux-practice", "system");
  printLine("パスワード: linux", "system");
  setPrompt();
  getRuntimeElements().commandInput.focus();
}

renderControls();
updateAdminPreview();
renderAdminMergeQueue();
initializeAdminRuntime();
boot();
