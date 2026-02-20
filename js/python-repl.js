/**
 * Python REPL — powered by Pyodide (CPython compiled to WebAssembly)
 * Loads lazily when the section scrolls into view to avoid blocking page load.
 */

(function () {
  'use strict';

  /* ── DOM refs ─────────────────────────────────────────────────────────── */
  const output    = document.getElementById('repl-output');
  const input     = document.getElementById('repl-input');
  const bootMsg   = document.getElementById('repl-boot-msg');
  const clearBtn  = document.getElementById('repl-clear-btn');
  const resetBtn  = document.getElementById('repl-reset-btn');
  const snippets  = document.querySelectorAll('.snippet-btn');
  const section   = document.getElementById('python-repl');

  if (!output || !input || !section) return;

  /* ── State ────────────────────────────────────────────────────────────── */
  let pyodide       = null;
  let loading       = false;
  let loaded        = false;
  let history       = [];
  let historyIndex  = -1;
  let multilineBuffer = [];   // accumulate indented / continuation lines
  let namespace     = null;   // persistent Python namespace dict

  /* ── Helpers ──────────────────────────────────────────────────────────── */
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function appendLine(text, cls = '') {
    const line = document.createElement('div');
    line.className = 'repl-line' + (cls ? ' ' + cls : '');
    line.innerHTML = escapeHtml(text);
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
  }

  function appendRaw(html) {
    const line = document.createElement('div');
    line.className = 'repl-line';
    line.innerHTML = html;
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
  }

  function echoInput(code, continuation = false) {
    const prompt = continuation ? '<span class="repl-prompt-echo">...</span>' : '<span class="repl-prompt-echo">&gt;&gt;&gt;</span>';
    appendRaw(`${prompt} <span class="repl-echo">${escapeHtml(code)}</span>`);
  }

  function setPrompt(continuation = false) {
    const promptEl = document.querySelector('.repl-prompt');
    if (promptEl) promptEl.textContent = continuation ? '...' : '>>>';
  }

  function setReady(ready) {
    input.disabled = !ready;
    if (ready) {
      input.placeholder = 'Type Python code and press Enter…';
      input.focus();
    }
  }

  /* ── Boot Pyodide ─────────────────────────────────────────────────────── */
  async function initPyodide() {
    if (loaded || loading) return;
    loading = true;

    try {
      pyodide = await loadPyodide();

      /* Redirect Python stdout/stderr into our output div */
      pyodide.runPython(`
import sys, io

class _REPLOut:
    def __init__(self, cls):
        self._cls = cls
        self._buf = ''
    def write(self, s):
        self._buf += s
    def flush(self):
        pass
    def getvalue(self):
        v = self._buf; self._buf = ''; return v

_stdout_capture = _REPLOut('repl-stdout')
_stderr_capture = _REPLOut('repl-stderr')
sys.stdout = _stdout_capture
sys.stderr = _stderr_capture
`);

      namespace = pyodide.globals;
      loaded  = true;
      loading = false;

      /* Replace boot message */
      if (bootMsg) bootMsg.remove();
      appendRaw(`<span class="repl-accent">Python ${pyodide.version}</span> — Pyodide ${pyodide.version} (WASM)`);
      appendLine('Type Python code below. Multi-line input supported (indent to continue).', 'repl-hint');
      appendLine('');
      setReady(true);

    } catch (err) {
      loading = false;
      if (bootMsg) bootMsg.remove();
      appendLine('Failed to load Python runtime: ' + err.message, 'repl-error');
    }
  }

  /* ── Execute a code string ────────────────────────────────────────────── */
  async function runCode(code) {
    if (!pyodide || !code.trim()) return;

    /* Flush any leftover captures */
    pyodide.runPython('_stdout_capture._buf = ""; _stderr_capture._buf = ""');

    let result;
    let stdout = '';
    let stderr = '';

    try {
      /* Use runPythonAsync so top-level await works */
      result = await pyodide.runPythonAsync(code, { globals: namespace });

      stdout = pyodide.runPython('_stdout_capture.getvalue()');
      stderr = pyodide.runPython('_stderr_capture.getvalue()');

      if (stdout) {
        stdout.split('\n').forEach(l => { if (l !== '' || stdout.endsWith('\n')) appendLine(l, 'repl-stdout'); });
      }
      if (stderr) {
        stderr.split('\n').forEach(l => { if (l) appendLine(l, 'repl-error'); });
      }
      /* Print repr of non-None expression results (REPL behaviour) */
      if (result !== undefined && result !== null) {
        const repr = pyodide.runPython(`repr(${JSON.stringify(code)})`);
        /* Only show if it's a pure expression (no assignments / statements) */
        try {
          const exprResult = pyodide.runPython(`
try:
    import ast as _ast
    _tree = _ast.parse(${JSON.stringify(code)}, mode='eval')
    repr(_tree)
except:
    None
`);
          if (exprResult !== null) {
            appendLine(String(result), 'repl-result');
          }
        } catch (_) { /* not an expression — silent */ }
      }
    } catch (err) {
      stdout = pyodide.runPython('_stdout_capture.getvalue()');
      stderr = pyodide.runPython('_stderr_capture.getvalue()');
      if (stdout) stdout.split('\n').forEach(l => { if (l) appendLine(l, 'repl-stdout'); });

      /* Format traceback nicely */
      const msg = (stderr || err.message || String(err)).trim();
      msg.split('\n').forEach(l => appendLine(l, 'repl-error'));
    }
  }

  /* ── Handle Enter ─────────────────────────────────────────────────────── */
  async function handleSubmit() {
    if (!loaded) return;

    const raw = input.value;
    input.value = '';

    /* History */
    if (raw.trim()) {
      history.unshift(raw);
      if (history.length > 200) history.pop();
    }
    historyIndex = -1;

    const inMultiline = multilineBuffer.length > 0;

    /* Detect continuation: non-empty line ending with ':' or indented, or we're already buffering */
    const trimmed = raw.trimEnd();
    const isBlankLine = trimmed.trim() === '';

    if (inMultiline) {
      if (isBlankLine) {
        /* Blank line ends multiline block */
        echoInput('', true);
        const fullCode = multilineBuffer.join('\n');
        multilineBuffer = [];
        setPrompt(false);
        await runCode(fullCode);
      } else {
        echoInput(raw, true);
        multilineBuffer.push(raw);
        setPrompt(true);
      }
    } else {
      echoInput(raw, false);
      /* Start multiline if line ends with ':' or backslash */
      if (trimmed.endsWith(':') || trimmed.endsWith('\\')) {
        multilineBuffer = [raw];
        setPrompt(true);
      } else {
        await runCode(raw);
      }
    }
  }

  /* ── Snippet injection ────────────────────────────────────────────────── */
  function injectSnippet(code) {
    if (!loaded) return;
    /* Unescape \n literals in data-code attributes */
    const lines = code.replace(/\\n/g, '\n').split('\n');
    if (lines.length === 1) {
      input.value = lines[0];
      input.focus();
    } else {
      /* Multi-line snippet: run directly */
      const display = lines[0] + (lines.length > 1 ? ' …' : '');
      echoInput(display, false);
      runCode(lines.join('\n'));
    }
  }

  /* ── Keyboard navigation ──────────────────────────────────────────────── */
  input.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      await handleSubmit();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < history.length - 1) {
        historyIndex++;
        input.value = history[historyIndex];
        setTimeout(() => input.setSelectionRange(input.value.length, input.value.length), 0);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        historyIndex--;
        input.value = history[historyIndex];
      } else {
        historyIndex = -1;
        input.value = '';
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      clearOutput();
    } else if (e.key === 'c' && e.ctrlKey && input.value === '') {
      e.preventDefault();
      multilineBuffer = [];
      setPrompt(false);
      appendLine('KeyboardInterrupt', 'repl-error');
    }
  });

  /* ── Toolbar buttons ──────────────────────────────────────────────────── */
  function clearOutput() {
    Array.from(output.children).forEach(c => {
      if (c.id !== 'repl-boot-msg') c.remove();
    });
  }

  if (clearBtn) clearBtn.addEventListener('click', clearOutput);

  if (resetBtn) resetBtn.addEventListener('click', async () => {
    if (!loaded) return;
    clearOutput();
    multilineBuffer = [];
    setPrompt(false);
    /* Re-init namespace */
    pyodide.runPython(`
import sys, io
_stdout_capture._buf = ''
_stderr_capture._buf = ''
`);
    /* Clear user-defined names by resetting globals to a fresh dict */
    pyodide.runPython(`
_keep = {'__name__', '__doc__', '__package__', '__loader__', '__spec__',
         '__builtins__', '_stdout_capture', '_stderr_capture'}
for _k in list(globals().keys()):
    if _k not in _keep:
        del globals()[_k]
`);
    appendLine('Interpreter reset.', 'repl-hint');
  });

  /* ── Snippet buttons ──────────────────────────────────────────────────── */
  snippets.forEach(btn => {
    btn.addEventListener('click', () => injectSnippet(btn.dataset.code));
  });

  /* ── Lazy-load: only fetch Pyodide when section is visible ───────────── */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !loading && !loaded) {
        observer.disconnect();
        initPyodide();
      }
    });
  }, { threshold: 0.1 });

  observer.observe(section);

  /* ── Click on terminal focuses input ─────────────────────────────────── */
  const terminal = document.getElementById('repl-terminal');
  if (terminal) {
    terminal.addEventListener('click', (e) => {
      if (e.target !== clearBtn && e.target !== resetBtn) {
        input.focus();
      }
    });
  }
})();
