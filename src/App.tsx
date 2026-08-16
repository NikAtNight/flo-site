const DOWNLOAD_URL = 'https://github.com/NikAtNight/localflow/releases/latest'
const GITHUB_URL = 'https://github.com/NikAtNight/localflow'

const WAVE_BARS = [14, 26, 40, 58, 44, 70, 52, 82, 60, 88, 66, 90, 58, 76, 46, 64, 38, 52, 28, 40, 18, 30, 12]

const STEPS = [
  {
    title: 'Hold the hotkey',
    body: 'Works in any app. LocalFlow waits in the menubar, no window to find.',
  },
  {
    title: 'Speak',
    body: 'Audio is captured straight into memory. It is never written to disk.',
  },
  {
    title: 'Transcribed on-device',
    body: 'WhisperKit runs on the Neural Engine. An optional local LLM tidies it up.',
  },
  {
    title: 'Release',
    body: 'The text pastes into whatever had focus, like you typed it yourself.',
  },
]

const FEATURES = [
  {
    title: 'Nothing leaves your machine',
    body: 'No account, no server, no telemetry. The only network request LocalFlow ever makes on its own is the one-time Whisper model download.',
  },
  {
    title: 'Your choice of model',
    body: 'From Small English (about 500 MB) to Large v3 Turbo. Models download once and are cached locally.',
  },
  {
    title: 'Optional cleanup',
    body: 'A local Ollama model or Apple’s on-device intelligence fixes punctuation and filler words before the text lands.',
  },
  {
    title: 'Snippets and corrections',
    body: 'Teach it the words it gets wrong and expand shortcuts as you speak.',
  },
  {
    title: 'Set it and forget it',
    body: 'Menubar-only with no Dock icon. Starts at login and comes back on its own if it ever crashes.',
  },
  {
    title: 'Safe automatic updates',
    body: 'Sparkle updates verified by two independent signatures. Anything that fails the check is discarded, not installed.',
  },
]

const REQUIREMENTS = [
  ['Mac', 'Apple Silicon (M1 or later)'],
  ['macOS', '14 Sonoma or later'],
  ['Memory', '8 GB minimum, 16 GB recommended'],
  ['Disk', 'About 2 GB for the model cache'],
  ['Network', 'First launch only, to download the model'],
]

function Waveform() {
  return (
    <div className="flex h-24 items-center justify-center gap-1.5" aria-hidden="true">
      {WAVE_BARS.map((height, i) => (
        <span
          key={i}
          className="wave-bar w-1.5 rounded-full bg-ink"
          style={{ height: `${height}%`, animationDelay: `${(i % 7) * 0.13}s`, opacity: 0.85 - Math.abs(i - WAVE_BARS.length / 2) * 0.045 }}
        />
      ))}
    </div>
  )
}

function DownloadButton({ large = false }: { large?: boolean }) {
  return (
    <a
      href={DOWNLOAD_URL}
      className={`inline-flex items-center gap-2.5 rounded-full bg-rec font-medium text-paper shadow-[0_2px_12px_rgba(229,72,77,0.35)] transition hover:bg-rec-deep ${
        large ? 'px-8 py-3.5 text-base' : 'px-6 py-2.5 text-sm'
      }`}
    >
      <span className="rec-dot inline-block h-2 w-2 rounded-full bg-paper" />
      Download for macOS
    </a>
  )
}

export default function App() {
  return (
    <div className="min-h-screen">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-paper/80 backdrop-blur-md">
        <nav className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <a href="#top" className="font-display flex items-center gap-2 text-lg font-bold">
            LocalFlow
            <span className="rec-dot mt-0.5 inline-block h-2 w-2 rounded-full bg-rec" />
          </a>
          <div className="flex items-center gap-6 text-sm text-ink-soft">
            <a href="#how" className="hidden transition-colors hover:text-ink sm:block">How it works</a>
            <a href="#privacy" className="hidden transition-colors hover:text-ink sm:block">Privacy</a>
            <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="transition-colors hover:text-ink">
              GitHub
            </a>
            <DownloadButton />
          </div>
        </nav>
      </header>

      <main id="top" className="mx-auto max-w-5xl px-6">
        {/* Hero */}
        <section className="pt-40 pb-16 text-center">
          <p className="font-mono text-xs tracking-[0.3em] text-ink-faint uppercase">
            For Apple Silicon Macs
          </p>
          <h1 className="font-display mx-auto mt-6 max-w-3xl text-5xl font-bold tracking-tight text-balance sm:text-7xl">
            Hold a key. Speak. It&rsquo;s typed.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
            Fully local push-to-talk dictation. Whisper runs on your Mac&rsquo;s
            Neural Engine and the words land in whatever app has focus. No
            audio ever leaves your machine.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <DownloadButton large />
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-line bg-paper px-8 py-3.5 text-base font-medium transition-colors hover:border-ink-faint"
            >
              View on GitHub
            </a>
          </div>
          <p className="mt-5 font-mono text-xs text-ink-faint">
            v1.0.0 · free and open source · signed and notarized by Apple
          </p>
          <div className="mt-14">
            <Waveform />
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="scroll-mt-24 border-t border-line py-20">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Four seconds, start to finish
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <div key={step.title} className="rounded-2xl border border-line bg-paper-deep/60 p-6">
                <span className="font-mono text-xs text-rec">0{i + 1}</span>
                <h3 className="font-display mt-3 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-line py-20">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Built like a good Mac citizen
          </h2>
          <div className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div key={feature.title}>
                <h3 className="font-display text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{feature.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Privacy */}
        <section id="privacy" className="scroll-mt-24 border-t border-line py-20">
          <h2 className="font-display max-w-2xl text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            No account. No server. <span className="text-rec">No telemetry.</span>
          </h2>
          <div className="mt-8 grid max-w-3xl gap-5 text-ink-soft">
            <p>
              Dictation software hears everything you say and touches everything
              you type, so LocalFlow is built to be inspectable. Audio is
              transcribed on-device and never written to disk. The global
              hotkey listener observes modifier keys only, never characters.
            </p>
            <p>
              Every release is built in a public GitHub workflow with
              provenance you can verify with one command, and the repository
              runs static analysis on every push. The permissions it asks for,
              and exactly what they are used for, are written down in{' '}
              <a
                href="https://github.com/NikAtNight/localflow/blob/main/SECURITY.md"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-ink underline decoration-rec/40 underline-offset-4 hover:decoration-rec"
              >
                SECURITY.md
              </a>
              .
            </p>
          </div>
        </section>

        {/* Requirements */}
        <section className="border-t border-line py-20">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Requirements</h2>
          <dl className="mt-8 max-w-2xl divide-y divide-line border-y border-line">
            {REQUIREMENTS.map(([label, value]) => (
              <div key={label} className="flex items-baseline justify-between gap-6 py-3.5">
                <dt className="font-mono text-xs tracking-wider text-ink-faint uppercase">{label}</dt>
                <dd className="text-right text-sm">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 max-w-2xl text-sm text-ink-faint">
            On macOS 26 with Apple Intelligence, transcript cleanup and command
            mode run on Apple&rsquo;s own on-device model. Everything else works
            from macOS 14 up.
          </p>
        </section>

        {/* Download band */}
        <section className="border-t border-line py-24 text-center">
          <h2 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Your words never left.
          </h2>
          <div className="mt-8">
            <DownloadButton large />
          </div>
          <p className="mt-5 font-mono text-xs text-ink-faint">
            macOS 14+ · Apple Silicon · about 12 MB
          </p>
        </section>
      </main>

      <footer className="border-t border-line py-10">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 text-sm text-ink-faint">
          <span>© 2026 Nikhil Kapadia</span>
          <div className="flex gap-6">
            <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="transition-colors hover:text-ink">GitHub</a>
            <a href="https://github.com/NikAtNight/localflow/blob/main/SECURITY.md" target="_blank" rel="noreferrer" className="transition-colors hover:text-ink">Security</a>
            <a href="https://github.com/NikAtNight" target="_blank" rel="noreferrer" className="transition-colors hover:text-ink">More by NaN</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
