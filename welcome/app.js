// Welcome App Interactive Playground Client Logic
const PRESETS = {
  counter: `# Bedrock Canary Counter App
App CounterApp {
  theme: "dark"
}

State count = 0

Action increment {
  set count = count + 1
}

Action decrement {
  set count = count - 1
}

Screen MainScreen("Interactive Counter") {
  Card {
    Text("Current Count: {count}")
    Stack {
      Button("+ Increment Count") on click => increment
      Button("- Decrement Count") on click => decrement
    }
  }
}`,

  task: `# Bedrock Canary Task Planner
App TaskPlanner {
  theme: "dark"
}

State total_tasks = 3
State completed_tasks = 1

Action add_task {
  set total_tasks = total_tasks + 1
}

Action complete_task {
  set completed_tasks = completed_tasks + 1
}

Screen TaskDashboard("Task Dashboard") {
  Stack {
    Text("Total Tasks: {total_tasks}")
    Text("Completed Tasks: {completed_tasks}")
    Card {
      Text("⚡ Build Web & Mobile app with .bdc")
      Button("Mark Task Done") on click => complete_task
    }
    Button("+ Add New Task") on click => add_task
  }
}`,

  hello: `# Bedrock Canary Hello World
App HelloCanary {
  theme: "dark"
}

State user_name = "Bedrock Canary Developer"

Screen WelcomeScreen("Welcome App") {
  Card {
    Text("Hello, {user_name}!")
    Text("Welcome to the easiest language for Web & Mobile apps.")
    Button("Explore .bdc Features") on click => explore
  }
}`
};

// Client-side parser and transpiler engine for live interactive playground
class ClientBDCEngine {
  static parseAndRender(code, targetContainer) {
    targetContainer.innerHTML = '';

    // Extract state defaults
    const stateMap = {};
    const stateRegex = /State\s+([a-zA-Z0-9_]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([0-9.]+))/g;
    let match;
    while ((match = stateRegex.exec(code)) !== null) {
      const stateName = match[1];
      const val = match[2] ?? match[3] ?? Number(match[4]);
      stateMap[stateName] = val;
    }

    // Extract App Name
    const appMatch = code.match(/App\s+([a-zA-Z0-9_]+)/);
    const appName = appMatch ? appMatch[1] : 'BedrockApp';

    // App Header Component
    const headerEl = document.createElement('div');
    headerEl.className = 'bdc-app-header';
    headerEl.innerText = appName;
    targetContainer.appendChild(headerEl);

    // Extract Action definitions
    const actions = {};
    const actionBlockRegex = /Action\s+([a-zA-Z0-9_]+)\s*\{([^}]+)\}/g;
    while ((match = actionBlockRegex.exec(code)) !== null) {
      const actionName = match[1];
      const body = match[2];
      const setMatch = body.match(/set\s+([a-zA-Z0-9_]+)\s*=\s*([a-zA-Z0-9_]+)\s*([\+\-])\s*([0-9]+)/);
      if (setMatch) {
        actions[actionName] = {
          target: setMatch[1],
          op: setMatch[3],
          val: Number(setMatch[4])
        };
      }
    }

    // Function to re-render dynamic dynamic UI elements bound to state
    function renderStatefulElements() {
      // Remove previously rendered dynamic screens
      const oldScreen = targetContainer.querySelector('.bdc-screen-body');
      if (oldScreen) oldScreen.remove();

      const screenBody = document.createElement('div');
      screenBody.className = 'bdc-screen-body';
      screenBody.style.display = 'flex';
      screenBody.style.flexDirection = 'column';
      screenBody.style.gap = '12px';

      // Parse Screen elements line-by-line or token-by-token
      const textMatches = code.matchAll(/Text\(["']([^"']+)["']\)/g);
      for (const tMatch of textMatches) {
        let textContent = tMatch[1];
        Object.keys(stateMap).forEach(key => {
          textContent = textContent.replace(`{${key}}`, stateMap[key]);
        });
        const textEl = document.createElement('div');
        textEl.className = 'bdc-text';
        textEl.innerText = textContent;
        screenBody.appendChild(textEl);
      }

      const buttonMatches = code.matchAll(/Button\(["']([^"']+)["']\)(?:\s*on\s*click\s*=>\s*([a-zA-Z0-9_]+))?/g);
      for (const bMatch of buttonMatches) {
        const btnLabel = bMatch[1];
        const actionTarget = bMatch[2];
        const btnEl = document.createElement('button');
        btnEl.className = 'bdc-button';
        btnEl.innerText = btnLabel;

        if (actionTarget && actions[actionTarget]) {
          btnEl.onclick = () => {
            const act = actions[actionTarget];
            if (act.op === '+') stateMap[act.target] = (Number(stateMap[act.target]) || 0) + act.val;
            if (act.op === '-') stateMap[act.target] = (Number(stateMap[act.target]) || 0) - act.val;
            renderStatefulElements();
          };
        }
        screenBody.appendChild(btnEl);
      }

      targetContainer.appendChild(screenBody);
    }

    renderStatefulElements();
  }
}

// Initialize Interactive DOM Listeners
document.addEventListener('DOMContentLoaded', () => {
  const editor = document.getElementById('bdc-editor');
  const runBtn = document.getElementById('btn-run-code');
  const previewViewport = document.getElementById('preview-viewport');
  const statusEl = document.getElementById('compiler-status');
  const phoneDevice = document.getElementById('phone-device');

  const presetCounter = document.getElementById('btn-preset-counter');
  const presetTask = document.getElementById('btn-preset-task');
  const presetHello = document.getElementById('btn-preset-hello');

  const btnMobile = document.getElementById('btn-view-mobile');
  const btnWeb = document.getElementById('btn-view-web');

  // Load default preset
  editor.value = PRESETS.counter;
  compileCode();

  function compileCode() {
    try {
      ClientBDCEngine.parseAndRender(editor.value, previewViewport);
      statusEl.innerText = 'Status: Successfully compiled (.bdc)';
      statusEl.style.color = '#38bdf8';
    } catch (err) {
      statusEl.innerText = 'Compilation Error: ' + err.message;
      statusEl.style.color = '#ef4444';
    }
  }

  runBtn.addEventListener('click', compileCode);

  // Preset switchers
  function setActivePreset(selectedBtn, codeKey) {
    [presetCounter, presetTask, presetHello].forEach(btn => btn.classList.remove('active'));
    selectedBtn.classList.add('active');
    editor.value = PRESETS[codeKey];
    compileCode();
  }

  presetCounter.addEventListener('click', () => setActivePreset(presetCounter, 'counter'));
  presetTask.addEventListener('click', () => setActivePreset(presetTask, 'task'));
  presetHello.addEventListener('click', () => setActivePreset(presetHello, 'hello'));

  // Viewport Switchers
  btnMobile.addEventListener('click', () => {
    btnMobile.classList.add('active');
    btnWeb.classList.remove('active');
    phoneDevice.style.width = '320px';
    phoneDevice.style.height = '480px';
    phoneDevice.classList.remove('phone-stage-web');
  });

  btnWeb.addEventListener('click', () => {
    btnWeb.classList.add('active');
    btnMobile.classList.remove('active');
    phoneDevice.style.width = '100%';
    phoneDevice.style.height = '100%';
    phoneDevice.classList.add('phone-stage-web');
  });
});
