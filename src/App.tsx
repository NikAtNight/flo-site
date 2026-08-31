import { useEffect, useRef, useState } from 'react'

const DOWNLOAD_URL = 'https://github.com/NikAtNight/localflow/releases/latest'
const GITHUB_URL = 'https://github.com/NikAtNight/localflow'

const WAVE_BARS = [14, 26, 40, 58, 44, 70, 52, 82, 60, 88, 66, 90, 58, 76, 46, 64, 38, 52, 28, 40, 18, 30, 12]

const STEPS = [
  {
    title: 'Hold the hotkey',
    body: 'Hold Right Option by default. You can switch it to Right Command or Fn/Globe. LocalFlow stays in the menubar.',
  },
  {
    title: 'Speak',
    body: 'Audio is captured straight into memory. It is never written to disk.',
  },
  {
    title: 'Transcribed on-device',
    body: 'WhisperKit runs on-device through CoreML. LocalFlow ships with Large v3 Turbo, its most accurate model, ready to use.',
  },
  {
    title: 'Release',
    body: 'The text pastes into the focused app. LocalFlow snapshots your clipboard first and restores it 2.5 seconds later, unless you copy something in between.',
  },
]

const FEATURES = [
  {
    title: 'Nothing leaves your machine',
    body: 'No account, no server, no telemetry. The only things it ever phones home for are the one-time model download and the update check, which you can turn off.',
  },
  {
    title: 'Your choice of model',
    body: 'It ships on Large v3 Turbo, the most accurate option. Drop to Small English, about 500 MB, when speed matters more.',
  },
  {
    title: 'Optional cleanup',
    body: 'Cleanup is off by default. When you enable it, LocalFlow prefers Apple Intelligence and falls back to a local Ollama model.',
  },
  {
    title: 'Snippets and corrections',
    body: 'Fix a word once and it learns. LocalFlow diffs your edit against what it pasted, offers the correction, and biases the decoder so it doesn\'t happen again.',
  },
  {
    title: 'Overlapping dictations',
    body: 'Start another dictation while the last one transcribes. LocalFlow reassembles the results in the order you spoke them.',
  },
  {
    title: 'Writing style by app',
    body: 'Dictate into Slack and Mail and get different text. Profiles resolve from the app in front of you.',
  },
]

const REQUIREMENTS = [
  ['Mac', 'Apple Silicon (M1 or later)'],
  ['macOS', '14 Sonoma or later'],
  ['Memory', '8 GB minimum, 16 GB recommended'],
  ['Disk', '2 GB minimum, 4 GB comfortable'],
  ['Language', 'English only'],
  ['Network', 'For the model download and optional update checks'],
]

const SECTION_HEADING = 'font-display text-balance text-3xl font-bold tracking-tight sm:text-4xl'
const CARD = 'rounded-2xl border border-line bg-paper-deep/60 p-6'

function Waveform() {
  const waveformRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const center = (WAVE_BARS.length - 1) / 2

  useEffect(() => {
    const element = waveformRef.current
    if (!element) return

    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting))
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={waveformRef} className="waveform flex h-32 items-center justify-center gap-3" data-playing={isVisible} aria-hidden="true">
      {WAVE_BARS.map((height, i) => (
        <span
          key={i}
          className="wave-bar w-2.5 rounded-full bg-ink"
          style={{ height: `${height}%`, animationDelay: `${Math.abs(i - center) * 0.06}s`, opacity: 0.85 - Math.abs(i - center) * 0.045 }}
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
        large ? 'px-8 py-3.5 text-base' : 'px-4 py-2.5 text-sm sm:px-6'
      }`}
    >
      <span className="rec-dot inline-block h-2 w-2 rounded-full bg-paper" />
      <span className="sm:hidden">Download</span>
      <span className="hidden sm:inline">Download for macOS</span>
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
          <div className="flex items-center gap-3 text-sm text-ink-soft sm:gap-6">
            <a href="#how" className="hidden transition-colors hover:text-ink sm:block">How it works</a>
            <a href="#privacy" className="hidden transition-colors hover:text-ink sm:block">Privacy</a>
            <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="transition-colors hover:text-ink">
              GitHub
            </a>
            <DownloadButton />
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-6">
        {/* Hero */}
        <section id="top" className="scroll-mt-20 pt-40 pb-16 text-center">
          <p className="font-mono text-xs tracking-[0.3em] text-ink-faint uppercase">
            For Apple Silicon Macs
          </p>
          <h1 className="font-display mx-auto mt-6 max-w-3xl text-5xl font-bold tracking-tight text-balance sm:text-7xl">
            Hold Right Option. Speak. It&rsquo;s typed.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
            Fully local push-to-talk dictation. Whisper runs on-device through
            CoreML and the words land in whatever app has focus. No audio ever
            leaves your machine.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <DownloadButton large />
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-ink-faint bg-paper px-8 py-3.5 text-base font-medium transition-colors hover:border-ink"
            >
              View on GitHub
            </a>
          </div>
          <p className="mt-5 font-mono text-xs text-ink-faint">
            Free and open source · signed and notarized by Apple
          </p>
          <div className="mt-14">
            {/* TODO: Replace this slot with a real LocalFlow product capture when one is available. */}
            <Waveform />
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="scroll-mt-20 border-t border-line py-20">
          <h2 className={SECTION_HEADING}>
            Sub-second on release
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <div key={step.title} className={CARD}>
                <span className="font-mono text-xs text-rec">0{i + 1}</span>
                <h3 className="font-display mt-3 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="scroll-mt-20 border-t border-line py-20">
          <h2 className={SECTION_HEADING}>
            Built like a good Mac citizen
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div key={feature.title} className={CARD}>
                <h3 className="font-display text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{feature.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Command mode */}
        <section id="command-mode" className="scroll-mt-20 border-t border-line py-20">
          <h2 className={SECTION_HEADING}>Edit with your voice</h2>
          <p className="mt-6 max-w-2xl leading-relaxed text-ink-soft">
            Hold the second key and say "make this shorter" with text selected. LocalFlow rewrites it in place. With nothing selected, it generates at the cursor.
          </p>
        </section>

        {/* Privacy */}
        <section id="privacy" className="scroll-mt-20 border-t border-line py-20">
          <h2 className={`${SECTION_HEADING} max-w-2xl`}>
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
              runs static analysis on every push to main and every pull request.
              It asks for Microphone access to capture dictation and
              Accessibility access to paste into the focused app. More detail is in{' '}
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
        <section id="requirements" className="scroll-mt-20 border-t border-line py-20">
          <h2 className={SECTION_HEADING}>Requirements</h2>
          <dl className="mt-8 max-w-2xl divide-y divide-line border-y border-line">
            {REQUIREMENTS.map(([label, value]) => (
              <div key={label} className="flex items-baseline justify-between gap-6 py-3.5">
                <dt className="font-mono text-xs tracking-wider text-ink-faint uppercase">{label}</dt>
                <dd className="text-right text-sm">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 max-w-2xl text-sm text-ink-faint">
            On macOS 14 and 15, transcript cleanup and command mode use a local
            Ollama model instead. On macOS 26 with Apple Intelligence, they use
            Apple&rsquo;s on-device model.
          </p>
        </section>

        {/* Download band */}
        <section id="download" className="scroll-mt-20 border-t border-line py-20 text-center">
          <h2 className={SECTION_HEADING}>
            Your words never left.
          </h2>
          <div className="mt-8">
            <DownloadButton large />
          </div>
          <p className="mt-5 font-mono text-xs text-ink-faint">
            macOS 14+ · Apple Silicon · 4.4 MB download
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
