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
const closeAdminHelp = document.querySelector("#closeAdminHelp");
const adminScreen = document.querySelector("#adminScreen");
const closeAdminButton = document.querySelector("#closeAdminButton");
const adminScenarioForm = document.querySelector("#adminScenarioForm");
const adminLessonTitle = document.querySelector("#adminLessonTitle");
const adminScenarioLabel = document.querySelector("#adminScenarioLabel");
const adminCommandList = document.querySelector("#adminCommandList");
const adminScenarioError = document.querySelector("#adminScenarioError");
const adminJsonPreview = document.querySelector("#adminJsonPreview");
const downloadScenarioJson = document.querySelector("#downloadScenarioJson");
const studentScenarioFile = document.querySelector("#studentScenarioFile");
const studentDropzone = document.querySelector("#studentDropzone");
const scenarioLoadStatus = document.querySelector("#scenarioLoadStatus");

const commandCatalog = [
  "ssh", "pwd", "ls", "cd", "cat", "mkdir", "touch", "rm",
  "cp", "mv", "echo", "more", "clear", "help", "whoami", "hostname", "exit"
];
const INSTRUCTOR_PASSWORD = "linux123";
const SSH_TARGET = "student@linux-practice";
const SSH_PASSWORD = "linux";
const SSH_MAX_PASSWORD_ATTEMPTS = 3;
const SSH_HOST_FINGERPRINT = "SHA256:Q8i7MZ0P1nV4m0sB8xJ9cL2rW5kT6yH3dF1pN7aS4eU";
const adminPackage = {
  lessonTitle: "",
  scenarios: []
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
      "/home/student": createDirNode(["demo.txt", "documents", "readme.txt", "sample.txt", "sample_dir"], { owner: "student", group: "student", mtime: RECENT_LS_MTIME }),
      "/home/user01": createDirNode([], { owner: "user01", group: "user01", mtime: RECENT_LS_MTIME }),
      "/home/student/demo.txt": createFileNode("Demo file for cat and more practice.\nLine 2: Linux commands read files from the virtual filesystem.\n", { owner: "student", group: "student", mtime: RECENT_LS_MTIME }),
      "/home/student/readme.txt": createFileNode("Linux CLI practice environment.\n", { owner: "student", group: "student", mtime: RECENT_LS_MTIME }),
      "/home/student/sample.txt": createFileNode("Temporary sample file.\n", { owner: "student", group: "student", mtime: RECENT_LS_MTIME }),
      "/home/student/sample_dir": createDirNode(["note.txt"], { owner: "student", group: "student", mtime: RECENT_LS_MTIME }),
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
let activeScenarioKey = "login";
let allowedCommands = new Set(scenarios[activeScenarioKey].allowed);
let commandHistory = [];
let historyIndex = 0;
let pendingPasswordFor = null;
let pendingHostKeyFor = null;
let pendingRmConfirmation = null;
let sshPasswordAttemptsRemaining = 0;
const knownHosts = new Set();
let customScenarioCount = 0;
const completedTasks = new Map();

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

function updateSessionStatus() {
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
  const line = document.createElement("div");
  line.className = `terminal-line ${type}`.trim();
  line.textContent = text;
  terminalOutput.appendChild(line);
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

function printBlock(text, type = "") {
  text.split("\n").forEach((line) => printLine(line, type));
}

function setPrompt() {
  if (isAwaitingPassword()) {
    promptLabel.textContent = "password:";
    commandInput.type = "password";
    updateSessionStatus();
    return;
  }

  commandInput.type = "text";
  const symbol = state.user === "root" ? "#" : "$";
  promptLabel.textContent = state.loggedIn
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
  const redirectMatch = input.match(/^echo\s+(.+?)\s*>\s*(\S+)$/);
  if (redirectMatch) return { command: "echo", args: [redirectMatch[1], ">", redirectMatch[2]], raw: normalizeSpaces(input) };
  const parts = input.trim().match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];
  return {
    command: parts[0] || "",
    args: parts.slice(1).map((part) => part.replace(/^["']|["']$/g, "")),
    raw: normalizeSpaces(input)
  };
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
  }).filter(({ node: childNode }) => !!childNode);
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
  if (!args[0]) throw new Error("cat: 表示するファイルを指定してください");
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
    "  cp /etc/hosts .",
    "  rm -i sample.txt"
  ].join("\n"), "system");
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
  return { label, allowed, tasks };
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
    default:
      return `${command} を実行する`;
  }
}

function buildExpectForCommand(command, context) {
  const parsed = parseCommand(command);
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
  const commands = tasks.map((task) => parseCommand(task.command).command);
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
    owner: existing?.owner || "root",
    group: existing?.group || "root",
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

function runHead(args) {
  const count = getNumericOption(args, "n", 10);
  const file = args.filter((arg, index) => !(arg === "-n" || args[index - 1] === "-n" || /^-n\d+/.test(arg)))[0];
  if (!file) throw new Error("head: file operand required");
  printBlock(readFile(normalizePath(file)).split("\n").slice(0, count).join("\n").replace(/\n$/, ""));
}

function runTail(args) {
  const count = getNumericOption(args, "n", 10);
  const file = args.filter((arg, index) => !(arg === "-n" || args[index - 1] === "-n" || /^-n\d+/.test(arg)))[0];
  if (!file) throw new Error("tail: file operand required");
  const lines = readFile(normalizePath(file)).split("\n");
  printBlock(lines.slice(Math.max(0, lines.length - count - 1)).join("\n").replace(/\n$/, ""));
}

function runGrep(args) {
  const { options, values } = splitOptions(args);
  const pattern = values[0];
  const files = values.slice(1);
  if (!pattern || files.length === 0) throw new Error("grep: pattern and file required");
  const flags = hasFlag(options, "i") ? "i" : "";
  const regex = new RegExp(pattern, flags);
  const invert = hasFlag(options, "v");
  const showLine = hasFlag(options, "n");
  files.forEach((file) => {
    readFile(normalizePath(file)).split("\n").forEach((line, index) => {
      if (!line && index === readFile(normalizePath(file)).split("\n").length - 1) return;
      const matched = regex.test(line);
      if (matched !== invert) printLine(`${showLine ? `${index + 1}:` : ""}${line}`);
    });
  });
}

function runWc(args) {
  const { options, values } = splitOptions(args);
  const file = values[0];
  if (!file) throw new Error("wc: file operand required");
  const text = readFile(normalizePath(file));
  const counts = {
    l: text.endsWith("\n") ? text.split("\n").length - 1 : text.split("\n").length,
    w: text.trim() ? text.trim().split(/\s+/).length : 0,
    c: text.length
  };
  const selected = options.length ? ["l", "w", "c"].filter((key) => hasFlag(options, key)) : ["l", "w", "c"];
  printLine(`${selected.map((key) => counts[key]).join(" ")} ${file}`);
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
  if (!expr || !file) throw new Error("sed: expression and file required");
  const match = expr.match(/^s\/(.+)\/(.*)\/(g?)$/);
  if (!match) throw new Error("sed: only s/pattern/replacement/[g] is supported");
  const regex = new RegExp(match[1], match[3] ? "g" : "");
  printBlock(readFile(normalizePath(file)).replace(regex, match[2]).replace(/\n$/, ""));
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
  if (!script || !file) throw new Error("awk: script and file required");
  const fieldMatch = script.match(/^\{print \$(\d+)\}$/);
  if (!fieldMatch) throw new Error("awk: only '{print $N}' is supported");
  const field = Number.parseInt(fieldMatch[1], 10) - 1;
  printBlock(readFile(normalizePath(file)).split("\n").filter(Boolean).map((line) => line.split(separator)[field] || "").join("\n"));
}

function runMore(args) {
  const { values } = splitOptions(args);
  if (!values[0]) throw new Error("more: missing file operand");
  values.forEach((arg) => {
    const content = readFile(normalizePath(arg)).replace(/\n$/, "");
    printBlock(content);
    if (content.split("\n").length > 20) printLine("--More--", "system");
  });
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
    case "head": return runHead(args);
    case "tail": return runTail(args);
    case "grep": return runGrep(args);
    case "wc": return runWc(args);
    case "date": return runDate(args);
    case "find": return runFind(args);
    case "sed": return runSed(args);
    case "awk": return runAwk(args);
    case "whoami": return printLine(state.user);
    case "hostname": return printLine(state.host);
    case "exit": return runExit();
    case "clear": terminalOutput.textContent = ""; return;
    case "help": return showHelp();
    default: throw new Error(`${raw}: command not found`);
  }
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
  return Object.keys(scenarios);
}

function getCompletedSet(key = activeScenarioKey) {
  if (!completedTasks.has(key)) completedTasks.set(key, new Set());
  return completedTasks.get(key);
}

function isScenarioComplete(key = activeScenarioKey) {
  const taskCount = scenarios[key].tasks.length;
  return taskCount > 0 && getCompletedSet(key).size >= taskCount;
}

function getNextScenarioKey() {
  const keys = getScenarioKeys();
  const index = keys.indexOf(activeScenarioKey);
  return keys[index + 1] || "";
}

function setScenario(key) {
  activeScenarioKey = key;
  allowedCommands = new Set(scenarios[key].allowed);
  if (key === "login") {
    state.loggedIn = false;
    state.user = "guest";
    state.host = "browser";
    state.cwd = "/home/student";
    resetSshAuthState();
  } else if (!state.loggedIn) {
    state.loggedIn = true;
    state.user = "student";
    state.host = "linux-practice";
    state.cwd = "/home/student";
    resetSshAuthState();
  }
  setPrompt();
  renderControls();
}

function renderControls() {
  scenarioButtons.textContent = "";
  Object.entries(scenarios).forEach(([key, scenario]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = isScenarioComplete(key) ? `${scenario.label} 完了` : scenario.label;
    button.classList.toggle("is-active", key === activeScenarioKey);
    button.classList.toggle("is-complete", isScenarioComplete(key));
    button.addEventListener("click", () => setScenario(key));
    scenarioButtons.appendChild(button);
  });

  taskList.textContent = "";
  const completedSet = getCompletedSet();
  scenarios[activeScenarioKey].tasks.forEach((task, index) => {
    const item = document.createElement("li");
    item.textContent = task.text;
    item.classList.toggle("is-done", completedSet.has(index));
    taskList.appendChild(item);
  });
  updateCompletionState();
}

function updateCompletionState() {
  const completedCount = getCompletedSet().size;
  const taskCount = scenarios[activeScenarioKey].tasks.length;
  const complete = isScenarioComplete();
  const nextKey = getNextScenarioKey();
  scenarioCompleteStatus.textContent = complete
    ? "このシナリオの課題はすべて完了しました"
    : `進捗: ${completedCount} / ${taskCount}`;
  scenarioCompleteStatus.classList.toggle("is-complete", complete);
  nextScenarioButton.hidden = !complete;
  nextScenarioButton.disabled = !complete || !nextKey;
  nextScenarioButton.textContent = nextKey ? `次へ: ${scenarios[nextKey].label}` : "すべて完了";
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
  const completedSet = getCompletedSet();
  scenarios[activeScenarioKey].tasks.forEach((task, index) => {
    if (!completedSet.has(index) && taskIsSatisfied(task, input, parsed, before)) {
      completedSet.add(index);
    }
  });
  renderControls();
}

commandForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const input = commandInput.value.trim();
  if (!input) return;

  if (!isAwaitingInteractiveInput()) {
    printLine(`${promptLabel.textContent} ${input}`);
    commandHistory.push(input);
    historyIndex = commandHistory.length;
  } else if (isAwaitingHostKeyConfirmation() || isAwaitingRmConfirmation()) {
    printLine(input);
  }

  commandInput.value = "";

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
      execute(parsed);
      if (pendingRmConfirmation && parsed.command === "rm") {
        pendingRmConfirmation.taskInput = parsed.raw;
        pendingRmConfirmation.taskParsed = parsed;
        pendingRmConfirmation.before = before;
      }
      markTasks(parsed.raw, parsed, before);
      if (parsed.command === "exit") setScenario("login");
    }
  } catch (error) {
    printLine(error.message, "error");
  }

  setPrompt();
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

  const input = commandInput.value;
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
    commandInput.value = completingCommand
      ? `${completed} `
      : `${replaceCurrentToken(input, completed)}${completed.endsWith("/") ? "" : " "}`;
    return;
  }

  const prefix = longestCommonPrefix(candidates);
  if (prefix && prefix.length > currentToken.length) {
    commandInput.value = completingCommand ? prefix : replaceCurrentToken(input, prefix);
    return;
  }

  printLine(`${promptLabel.textContent} ${input}`);
  printBlock(candidates.join("  "), "system");
}

commandInput.addEventListener("keydown", (event) => {
  if (event.key === "Tab") {
    event.preventDefault();
    completeCommandInput();
    return;
  }
  if (event.key === "ArrowUp") {
    event.preventDefault();
    historyIndex = Math.max(0, historyIndex - 1);
    commandInput.value = commandHistory[historyIndex] || "";
  }
  if (event.key === "ArrowDown") {
    event.preventDefault();
    historyIndex = Math.min(commandHistory.length, historyIndex + 1);
    commandInput.value = commandHistory[historyIndex] || "";
  }
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

nextScenarioButton.addEventListener("click", () => {
  const nextKey = getNextScenarioKey();
  if (!nextKey || !isScenarioComplete()) return;
  setScenario(nextKey);
  printLine(`次のシナリオ「${scenarios[nextKey].label}」に進みました。`, "system");
});

resetButton.addEventListener("click", () => {
  state = createInitialState();
  resetSshAuthState();
  pendingRmConfirmation = null;
  knownHosts.clear();
  commandHistory = [];
  historyIndex = 0;
  completedTasks.clear();
  terminalOutput.textContent = "";
  setScenario("login");
  boot();
});

function buildHelpText() {
  return [
    "使用例:",
    "  whoami",
    "  pwd",
    "  ls -la",
    "  hostname",
    "  ls -l",
    "  cat demo.txt",
    "  more demo.txt",
    "  ls -t",
    "  ls -r documents",
    "  ls -F documents",
    "  mkdir -p practice/logs",
    "  cp /etc/hosts .",
    "  cp -r /usr/local/share sample_dir",
    "  cp file.txt copy.txt",
    "  rm -i sample.txt",
    "  rm -r practice",
    "  head -n 5 documents/lesson.txt",
    "  tail -n 5 documents/lesson.txt",
    "  grep -n Linux documents/lesson.txt",
    "  wc -l documents/lesson.txt",
    "  find . -name memo.txt",
    "  sed s/Linux/CLI/g documents/lesson.txt",
    "  awk '{print $1}' documents/lesson.txt",
    "  date +%Y-%m-%d"
  ].join("\n");
}

helpButton.addEventListener("click", () => {
  adminHelpContent.textContent = buildHelpText();
  adminHelpDialog.showModal();
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
  commandInput.focus();
}

renderControls();
updateAdminPreview();
boot();
