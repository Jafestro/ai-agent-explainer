// All explanatory text lives here so it is easy to edit without touching the 3D code.

export const CONCEPTS = {
  user: {
    name: 'You (the user)',
    label: 'You',
    kind: 'Person',
    tagline: 'The human who wants something done.',
    analogy: 'The manager handing a task to a new assistant.',
    what: 'You start everything by writing a request. You never talk to the LLM directly in an agent app: the agent sits in between and does the work on your behalf.',
    example: '"Summarize this week\'s open bugs and post it to our team Slack."',
  },

  prompt: {
    name: 'Prompt',
    label: 'Prompt',
    kind: 'Input',
    tagline: 'The message you send: what you want right now.',
    analogy: 'A sticky note with today\'s task that you hand to your assistant.',
    question: 'What do you want?',
    what: 'A prompt is simply text sent to the model. Your message is the <b>user prompt</b>. It changes every time you ask something. Good prompts are specific: goal, context, and the format you want back.',
    example: '"Translate this email into Spanish and keep it formal."',
    notTo: [
      ['system', 'is written by the app builder and is always there. Your prompt is per request.'],
      ['skills', 'are reusable how-to packages loaded when needed. A prompt is a one-off request.'],
    ],
  },

  system: {
    name: 'System prompt',
    label: 'System prompt',
    kind: 'Input',
    tagline: 'Hidden standing instructions that shape every answer.',
    analogy: 'The job description and house rules the assistant got on day one.',
    question: 'How should I behave?',
    what: 'Written once by whoever built the agent and silently added to the start of every conversation. It sets the role, tone, rules, and lists which tools and skills exist. Users usually never see it.',
    example: '"You are a support assistant for Acme. Be concise. Never share internal prices."',
    notTo: [
      ['prompt', 'is what <i>you</i> type each time. The system prompt is fixed by the builder.'],
      ['skills', 'are loaded only when relevant. The system prompt is always loaded, so it must stay short.'],
    ],
  },

  agent: {
    name: 'Agent',
    label: 'Agent (the loop)',
    kind: 'Orchestrator',
    tagline: 'A program that uses an LLM in a loop to actually get a job done.',
    analogy: 'The employee: has a brain (the LLM), hands (tools), manuals (skills), a library (RAG) and a notebook (memory).',
    question: 'What should I do next, and am I done yet?',
    what: 'The agent repeats a simple loop: <b>1.</b> send the context to the LLM, <b>2.</b> the LLM replies with either an answer or a request to use a tool, <b>3.</b> the agent runs that tool, <b>4.</b> adds the result to the context and goes back to step 1. It stops when the LLM says the task is finished.<br><br>Think &rarr; Act &rarr; Observe &rarr; Repeat.',
    example: 'GitHub Copilot agent mode, Claude Code, ChatGPT with tools, custom company assistants.',
    notTo: [
      ['llm', 'is only the brain that produces text. The agent is the whole worker around it that runs tools and loops.'],
    ],
  },

  llm: {
    name: 'LLM (the model)',
    label: 'LLM',
    kind: 'Brain',
    tagline: 'The model that reads text and predicts what text should come next.',
    analogy: 'A brilliant brain in a jar: knows a lot, but has no hands, no internet, and forgets you after the conversation.',
    question: 'What is the best next word or decision?',
    what: 'A Large Language Model (GPT, Claude, Gemini, Llama...). It only sees what is in its <b>context window</b> (system prompt + conversation + anything the agent pasted in). It cannot act on its own: when it "uses a tool", it really just writes text like <code>call search("bugs")</code> and the agent executes it.<br><br>Its built-in knowledge is frozen at training time.',
    example: 'Input: "The capital of France is" &rarr; Output: "Paris".',
    notTo: [
      ['agent', 'runs the loop and executes actions. The LLM only decides and writes.'],
      ['memory', 'is something the agent provides. The LLM itself is stateless between calls.'],
    ],
  },

  skills: {
    name: 'Skills',
    label: 'Skills',
    kind: 'Know-how',
    tagline: 'Packaged instructions (and sometimes scripts and templates) loaded only when a task needs them.',
    analogy: 'Recipe binders on a shelf. The assistant only reads the titles until a task needs one, then opens that binder.',
    question: 'How is this kind of task done here?',
    what: 'A skill is usually a folder with a <code>SKILL.md</code> file: a name, a short description, and detailed steps. The agent sees only the names and descriptions at first (cheap). When your request matches, it loads the full instructions into context. This keeps the agent focused and saves context space.',
    example: '"weekly-bug-report" skill: how to group bugs by severity + a message template + a helper script.',
    notTo: [
      ['tools', '<i>do</i> things (call an API, run code). Skills <i>teach</i> how to do a task, and may tell the agent which tools to use.'],
      ['rag', 'fetches <i>facts</i> from documents. Skills provide <i>procedures</i>.'],
      ['system', 'is always loaded. Skills are loaded on demand.'],
    ],
  },

  rag: {
    name: 'RAG',
    label: 'RAG (knowledge search)',
    kind: 'Knowledge',
    tagline: 'Retrieval-Augmented Generation: search your documents, paste the relevant bits into the context, then answer.',
    analogy: 'A librarian who, instead of handing you the whole library, brings back the 3 pages that answer your question.',
    question: 'What do our documents say about this?',
    what: 'Documents are split into small chunks and turned into <b>embeddings</b> (number lists that capture meaning), stored in a <b>vector database</b>. At question time, the query is embedded too and the most similar chunks are retrieved and added to the prompt. The model then answers using them, ideally with citations.<br><br>The model is <b>not</b> retrained. Update the documents and answers update instantly.',
    example: 'Asking an HR bot "How many vacation days do I get?" retrieves the matching paragraph from the 200-page policy.',
    notTo: [
      ['memory', 'stores things about <i>you and past conversations</i>. RAG searches a <i>document collection</i>.'],
      ['llm', 'training is permanent and expensive. RAG adds fresh knowledge at question time.'],
      ['skills', 'are how-to instructions. RAG returns facts.'],
    ],
  },

  tools: {
    name: 'Tools',
    label: 'Tools',
    kind: 'Action',
    tagline: 'Functions the model is allowed to ask the agent to run.',
    analogy: 'The assistant\'s hands and equipment: phone, calculator, keyboard, browser.',
    question: 'How do I act on the world or get live data?',
    what: 'Each tool has a name, a description, and input parameters. The LLM reads that list and, when useful, outputs a structured call like <code>get_weather(city="Paris")</code>. The <b>agent</b> executes it and gives the result back to the LLM. This is also called <b>function calling</b>.',
    example: '<code>read_file</code>, <code>web_search</code>, <code>run_python</code>, <code>send_email</code>.',
    notTo: [
      ['mcp', 'is not a tool. It is the standard <i>plug</i> for connecting tools that live in other programs.'],
      ['skills', 'are instructions. Tools are executable actions.'],
    ],
  },

  mcp: {
    name: 'MCP',
    label: 'MCP (the plug)',
    kind: 'Connector standard',
    tagline: 'Model Context Protocol: an open standard for plugging tools and data into any AI app.',
    analogy: 'USB-C for AI. One standard port, and any device (GitHub, Slack, a database) can plug into any compatible agent.',
    question: 'How do I connect to that app?',
    what: 'Before MCP, every AI app had to write its own integration for every service. With MCP, a service is wrapped once as an <b>MCP server</b> that exposes <b>tools</b> (actions), <b>resources</b> (data), and <b>prompts</b> (templates). Any MCP <b>client</b> (VS Code, Claude, Cursor, your agent) can connect and use them.<br><br>The agent discovers which tools a server offers, and the LLM calls them like any other tool.',
    example: 'Install the GitHub MCP server and your agent can now list issues, open PRs, and read code.',
    notTo: [
      ['tools', 'are the individual actions. MCP is the protocol that delivers tools from external servers.'],
      ['rag', 'is a technique for searching documents. An MCP server <i>could</i> offer a search tool, but MCP itself is just the connection standard.'],
    ],
  },

  github: {
    name: 'GitHub MCP server',
    label: 'GitHub server',
    kind: 'MCP server',
    tagline: 'A small program that exposes GitHub actions over MCP.',
    analogy: 'A device with a USB-C plug.',
    what: 'Offers tools like <code>list_issues</code>, <code>create_pull_request</code>, <code>get_file_contents</code>. The agent does not need to know the GitHub API: it only speaks MCP.',
    example: '<code>list_issues(state="open")</code>',
    notTo: [['mcp', 'is the standard. This is one server that implements it.']],
  },

  database: {
    name: 'Database MCP server',
    label: 'Database server',
    kind: 'MCP server',
    tagline: 'Lets an agent query a database through MCP.',
    analogy: 'Another device with the same USB-C plug.',
    what: 'Offers tools like <code>run_query</code> and <code>list_tables</code>, plus resources such as table schemas.',
    example: '<code>run_query("SELECT count(*) FROM orders")</code>',
    notTo: [['rag', 'searches documents by meaning. A database server runs exact queries on structured data.']],
  },

  slack: {
    name: 'Slack MCP server',
    label: 'Slack server',
    kind: 'MCP server',
    tagline: 'Lets an agent read and send Slack messages through MCP.',
    analogy: 'Yet another device with the same plug.',
    what: 'Offers tools like <code>post_message</code> and <code>search_messages</code>.',
    example: '<code>post_message(channel="#dev-team", text="...")</code>',
  },

  memory: {
    name: 'Memory',
    label: 'Memory',
    kind: 'State',
    tagline: 'What the agent remembers about you and past work.',
    analogy: 'The assistant\'s personal notebook.',
    question: 'What do I already know about this user or task?',
    what: '<b>Short-term memory</b> is the current conversation inside the context window, and it disappears when the chat ends or gets too long. <b>Long-term memory</b> is notes the agent saves to storage (files, a database) and reloads in future sessions: your preferences, facts, decisions.<br><br>The LLM itself remembers nothing. Memory is always provided by the agent.',
    example: '"User prefers bullet points. Team channel is #dev-team."',
    notTo: [
      ['rag', 'searches a shared document library. Memory is about <i>your</i> history and preferences (though it can use similar search tech).'],
      ['llm', 'does not learn from your chats. Nothing changes inside the model.'],
    ],
  },
};

export const CHEATSHEET_ORDER = ['prompt', 'system', 'llm', 'agent', 'tools', 'mcp', 'skills', 'rag', 'memory'];

export const QUIZ_OPTIONS = ['prompt', 'system', 'llm', 'agent', 'tools', 'mcp', 'skills', 'rag', 'memory'];

export const QUIZ = [
  {
    q: 'A company writes "Always answer politely and never reveal prices" once, and it applies to every single chat.',
    a: 'system',
    why: 'Fixed, always-on rules from the builder = system prompt.',
  },
  {
    q: 'You type: "Translate this email to Spanish."',
    a: 'prompt',
    why: 'A one-off request from you = the (user) prompt.',
  },
  {
    q: 'Before answering, the assistant searches 10,000 internal PDFs and pulls in the 3 most relevant paragraphs.',
    a: 'rag',
    why: 'Search documents, paste relevant pieces into context, then answer = RAG.',
  },
  {
    q: 'A standard that lets the same Jira connector work in VS Code, Claude, and any other compatible AI app.',
    a: 'mcp',
    why: 'A universal connection standard for tools and data = MCP.',
  },
  {
    q: 'A folder with step-by-step instructions and a template for writing release notes, opened only when the task is release notes.',
    a: 'skills',
    why: 'Reusable know-how loaded on demand = a skill.',
  },
  {
    q: 'The part that reads the text and predicts the answer, but cannot do anything by itself.',
    a: 'llm',
    why: 'Pure text-in, text-out reasoning = the LLM.',
  },
  {
    q: 'The thing that keeps going: think, call a tool, read the result, think again, until the job is finished.',
    a: 'agent',
    why: 'The think-act-observe loop = the agent.',
  },
  {
    q: 'A function send_email(to, subject, body) that the model can ask to have executed.',
    a: 'tools',
    why: 'An executable action the model can request = a tool.',
  },
  {
    q: 'Next week, the assistant still knows you like answers as bullet points.',
    a: 'memory',
    why: 'Remembering you across sessions = long-term memory.',
  },
];

// Actions: ['fly', from, to, label] | ['think', nodeId, text, ms] | ['pulse', ...ids] | ['wait', ms]
export const SCENARIOS = {
  chat: {
    title: 'Plain chatbot',
    steps: [
      {
        title: 'You send a prompt',
        text: 'You type: <q>Summarize this week\'s open bugs and post it to our team Slack.</q> In a plain chatbot there is no agent loop, just a model in a chat window.',
        focus: ['user', 'prompt', 'llm'],
        actions: [['fly', 'user', 'prompt', 'Summarize this week\'s bugs...'], ['fly', 'prompt', 'llm', 'prompt']],
      },
      {
        title: 'The system prompt is added',
        text: 'The app silently adds its <b>system prompt</b> in front of your message.',
        focus: ['system', 'llm'],
        actions: [['fly', 'system', 'llm', 'You are a helpful assistant...']],
      },
      {
        title: 'The LLM can only think',
        text: 'The <b>LLM</b> predicts a reply using only what it learned during training plus the text in front of it.',
        focus: ['llm'],
        actions: [['think', 'llm', 'I have no access to GitHub or Slack. I can only write text...', 2800]],
      },
      {
        title: 'It can only talk',
        text: 'You get text back. No bugs were fetched, nothing was posted. Worse, a model may <b>hallucinate</b> plausible-looking bug numbers. And when the chat ends, it forgets everything.',
        focus: ['llm', 'user'],
        actions: [['fly', 'llm', 'user', '"Sorry, I can\'t access your bug tracker."']],
      },
      {
        title: 'What is missing?',
        text: 'No loop to work step by step (<b>agent</b>), no way to act (<b>tools</b> / <b>MCP</b>), no company knowledge (<b>RAG</b>), no how-to guides (<b>skills</b>), no <b>memory</b>. That is exactly what an agent adds. Press <b>Full agent run</b> to see the difference.',
        focus: ['agent', 'tools', 'mcp', 'rag', 'skills', 'memory'],
        actions: [['pulse', 'agent', 'tools', 'mcp', 'rag', 'skills', 'memory']],
      },
    ],
  },

  agent: {
    title: 'Full agent run',
    steps: [
      {
        title: '1. You send a prompt',
        text: 'You type: <q>Summarize this week\'s open bugs and post it to our team Slack.</q> This message is the <b>prompt</b>. It goes to the <b>agent</b>, not straight to the model.',
        focus: ['user', 'prompt', 'agent'],
        actions: [['fly', 'user', 'prompt', 'Summarize this week\'s bugs...'], ['fly', 'prompt', 'agent', 'prompt']],
      },
      {
        title: '2. The system prompt is added',
        text: 'The agent puts its <b>system prompt</b> first: role, rules, and the list of available tools and skills. You normally never see it.',
        focus: ['system', 'agent'],
        actions: [['fly', 'system', 'agent', 'You are an engineering assistant...']],
      },
      {
        title: '3. Memory is checked',
        text: 'The agent looks in <b>long-term memory</b> for anything useful about you. It finds: <q>team channel is #dev-team, prefers bullet points</q>.',
        focus: ['memory', 'agent'],
        actions: [['fly', 'agent', 'memory', 'lookup: user preferences'], ['fly', 'memory', 'agent', '#dev-team, bullet points']],
      },
      {
        title: '4. The LLM thinks',
        text: 'All of that together is the <b>context</b>, and it is sent to the <b>LLM</b>. The LLM does not do anything itself. It only decides what should happen next and writes that down as text.',
        focus: ['agent', 'llm'],
        actions: [['think', 'llm', 'Plan: get the bug-report how-to, get the bugs, count them, post to Slack.', 3000]],
      },
      {
        title: '5. A skill is loaded',
        text: 'The agent only knew skill <i>names</i> so far. One matches: <q>weekly-bug-report</q>. Now its full instructions and template are loaded into context. <b>Skills teach the agent how</b> a task is done.',
        focus: ['agent', 'skills'],
        actions: [['fly', 'agent', 'skills', 'need: bug report how-to'], ['fly', 'skills', 'agent', 'SKILL.md: weekly-bug-report']],
      },
      {
        title: '6. RAG fetches relevant knowledge',
        text: 'The skill says <q>sort by severity using the team triage policy</q>. That policy is buried in hundreds of wiki pages. <b>RAG</b> searches them by meaning and returns only the 3 most relevant paragraphs.',
        focus: ['agent', 'rag'],
        actions: [['fly', 'agent', 'rag', 'search: "triage severity policy"'], ['fly', 'rag', 'agent', '3 relevant paragraphs']],
      },
      {
        title: '7. A tool call through MCP',
        text: 'The LLM writes a tool call: <code>list_issues(state="open", since="7d")</code>. The agent does not know GitHub\'s API. It sends the call over <b>MCP</b> to the <b>GitHub MCP server</b>, which runs it and returns data.',
        focus: ['agent', 'mcp', 'github'],
        actions: [
          ['fly', 'agent', 'mcp', 'list_issues(open, 7d)'],
          ['fly', 'mcp', 'github', 'list_issues'],
          ['fly', 'github', 'mcp', '14 issues'],
          ['fly', 'mcp', 'agent', '14 issues (JSON)'],
        ],
      },
      {
        title: '8. A built-in tool',
        text: 'To count bugs per severity, the LLM calls <code>run_python</code>, a <b>tool</b> built into the agent itself. Tools are just functions the model may ask to run. MCP is only one way to plug in more of them.',
        focus: ['agent', 'tools'],
        actions: [['fly', 'agent', 'tools', 'run_python(count by severity)'], ['fly', 'tools', 'agent', 'critical 2 / high 5 / low 7']],
      },
      {
        title: '9. The loop continues',
        text: 'Every result goes back into the context and the LLM thinks again. <b>This loop (think, act, observe, repeat) is what makes it an agent</b> and not just a chatbot.',
        focus: ['agent', 'llm'],
        actions: [['think', 'llm', 'Data complete. Draft the summary with the skill template, then post to #dev-team.', 3000]],
      },
      {
        title: '10. Acting in the world',
        text: 'Another MCP call: <code>post_message(channel="#dev-team", ...)</code> to the <b>Slack MCP server</b>. Same plug, different service. The agent is now <i>doing</i> something, not just talking.',
        focus: ['agent', 'mcp', 'slack'],
        actions: [
          ['fly', 'agent', 'mcp', 'post_message(#dev-team)'],
          ['fly', 'mcp', 'slack', 'post_message'],
          ['fly', 'slack', 'mcp', 'ok'],
          ['fly', 'mcp', 'agent', 'posted'],
        ],
      },
      {
        title: '11. Remembering for next time',
        text: 'The agent saves a note to <b>memory</b>: <q>User wants this report every Friday.</q> Next week it already knows.',
        focus: ['agent', 'memory'],
        actions: [['fly', 'agent', 'memory', 'save: weekly report on Fridays']],
      },
      {
        title: '12. Done',
        text: '<b>Prompt</b> = what you asked. <b>System prompt</b> = house rules. <b>LLM</b> = the brain. <b>Agent</b> = the loop that uses the brain. <b>Skills</b> = how-to manuals. <b>RAG</b> = searching documents. <b>Tools</b> = actions. <b>MCP</b> = the standard plug for tools. <b>Memory</b> = the notebook.',
        focus: null,
        actions: [['fly', 'agent', 'user', 'Posted a 14-bug summary to #dev-team']],
      },
    ],
  },
};
