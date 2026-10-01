"""film/kit/sound.py: every sound in the three tests, synthesized from code. No samples, no stock, no models.

A test's score.py reads the cues its page exported (cues.json, the same list the picture was timed from), places
foley and music with Mix.add, and writes a 48 kHz stereo wav. kit/mux.py then sets the loudness and muxes it.

Foley is the site's own vocabulary: the pen on paper, paper handled, a peg biting a line, a pin into cork, a stamp.
Music is plucked and struck strings (Karplus-Strong and a few inharmonic partials), dry, with one small room.
"""
import json
import numpy as np
from scipy import signal

SR = 48000
rng = np.random.default_rng(20260929)


def secs(n):
    return int(round(n * SR))


def env_ad(n, a, d, curve=4.0):
    """attack a s linear, then exponential decay over d s (to about -35 dB)."""
    na, nd = max(1, secs(a)), max(1, n - secs(a))
    return np.concatenate([np.linspace(0, 1, na, endpoint=False), np.exp(-curve * np.linspace(0, 1, nd) * (1 if d <= 0 else (n / SR - a) / d))])[:n]


def bp(x, lo, hi, order=2):
    sos = signal.butter(order, [lo, hi], btype='band', fs=SR, output='sos')
    return signal.sosfilt(sos, x)


def lp(x, f, order=2):
    return signal.sosfilt(signal.butter(order, f, btype='low', fs=SR, output='sos'), x)


def hp(x, f, order=2):
    return signal.sosfilt(signal.butter(order, f, btype='high', fs=SR, output='sos'), x)


def noise(n):
    return rng.standard_normal(n)


def smooth_noise(n, rate):
    """a slow random wobble, rate Hz, 0-mean, about unit amplitude."""
    k = max(2, int(n / SR * rate) + 2)
    pts = rng.standard_normal(k)
    return np.interp(np.linspace(0, k - 1, n), np.arange(k), pts)


# ---------------------------------------------------------------- foley

def pen(dur, speed=None, bright=1.0):
    """a felt-tip / fine pen on paper: band-limited noise shaped by the paper's tooth and the stroke's speed."""
    n = secs(dur)
    x = noise(n)
    tooth = 0.55 + 0.45 * np.abs(smooth_noise(n, 90))       # paper grain under the nib
    x = bp(x, 1800 * bright, 7000, 2) * tooth + 0.35 * bp(noise(n), 500, 1400) * tooth
    if speed is None:
        speed = np.sin(np.linspace(0, np.pi, n)) ** 0.6
    else:
        speed = np.interp(np.linspace(0, 1, n), np.linspace(0, 1, len(speed)), speed)
    edge = np.minimum(1, np.minimum(np.arange(n), n - np.arange(n)) / secs(0.012))
    return 0.22 * x * speed * edge


def paper(dur, lo=600, hi=5200, grit=0.4):
    """paper moved through air or against paper: a soft swish with a little crackle."""
    n = secs(dur)
    shape = np.sin(np.linspace(0, np.pi, n)) ** 1.6
    x = bp(noise(n), lo, hi, 2) * shape
    cr = (rng.random(n) < 0.0016) * rng.standard_normal(n) * 3
    x += grit * bp(cr, 2000, 9000) * shape
    return 0.3 * x


def snap(gain=1.0):
    """a crease pressed / a sheet landing flat: a dry slap with a little body."""
    n = secs(0.18)
    t = np.arange(n) / SR
    x = hp(noise(n), 900) * np.exp(-t * 60)
    body = np.sin(2 * np.pi * 160 * t) * np.exp(-t * 38) * 0.6
    return gain * 0.55 * (x + body)


def click(f=3200, gain=1.0):
    """a small plastic / wooden click (a peg's jaws)."""
    n = secs(0.06)
    t = np.arange(n) / SR
    x = (np.sin(2 * np.pi * f * t) + 0.6 * np.sin(2 * np.pi * f * 1.73 * t)) * np.exp(-t * 180)
    x += hp(noise(n), 3000) * np.exp(-t * 400) * 0.8
    wood = np.sin(2 * np.pi * 620 * t) * np.exp(-t * 90) * 0.35
    return gain * 0.4 * (x + wood)


def pin(gain=1.0):
    """a pin pushed into cork: a soft click, a dull push, a tiny ring of the pin's head."""
    n = secs(0.35)
    t = np.arange(n) / SR
    push = lp(noise(n), 700) * np.exp(-t * 30) * 0.9
    tick = hp(noise(n), 2500) * np.exp(-t * 500)
    ring = np.sin(2 * np.pi * 3150 * t) * np.exp(-t * 28) * 0.05
    return gain * 0.5 * (push + tick + ring)


def stamp(gain=1.0):
    """a seal pressed into paper on a desk: a low thud, the stone's knock, the paper's short sigh."""
    n = secs(0.9)
    t = np.arange(n) / SR
    f = 55 + 70 * np.exp(-t * 22)
    thud = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7.5)
    knock = np.sin(2 * np.pi * 410 * t) * np.exp(-t * 55) * 0.35 + np.sin(2 * np.pi * 1130 * t) * np.exp(-t * 90) * 0.15
    air = lp(noise(n), 2200) * np.exp(-t * 26) * 0.35
    return gain * 0.8 * (thud + knock + air)


def tick(gain=1.0):
    """a small mechanical tick (a clock's digit turning)."""
    n = secs(0.04)
    t = np.arange(n) / SR
    return gain * 0.25 * (np.sin(2 * np.pi * 2400 * t) * np.exp(-t * 300) + hp(noise(n), 4000) * np.exp(-t * 700) * 0.5)


def thrum(f=72, dur=1.2, gain=1.0):
    """a taut line knocked (the clothesline taking a print's weight)."""
    return gain * 0.5 * lp(ks(f, dur, 0.996, 0.35), 900)


def whoosh(dur=0.5, gain=1.0):
    """a sheet swept fast past the ear."""
    n = secs(dur)
    shape = np.sin(np.linspace(0, np.pi, n)) ** 2.2
    sweep = np.linspace(500, 2600, n)
    x = noise(n)
    out = np.zeros(n)
    # a moving band: four fixed bands crossfaded along the sweep
    for c in (600, 1100, 1800, 2600):
        w = np.exp(-((sweep - c) / 500) ** 2)
        out += bp(x, c * 0.7, c * 1.4) * w
    return gain * 0.35 * out * shape


# ---------------------------------------------------------------- music

def ks(f, dur, decay=0.996, bright=0.5):
    """Karplus-Strong plucked string."""
    n = secs(dur)
    p = max(2, int(SR / f))
    buf = lp(noise(p), 400 + 9000 * bright, 1) if p > 20 else noise(p)
    out = np.zeros(n)
    b = buf.copy()
    i = 0
    # vectorised by periods
    while i < n:
        k = min(p, n - i)
        out[i:i + k] = b[:k]
        b = decay * 0.5 * (b + np.roll(b, -1))
        i += p
    return out * np.exp(-np.arange(n) / SR * 0.8)


def felt(f, dur=2.5, vel=0.7):
    """a felted piano-ish note: a few slightly stretched partials, soft hammer, each partial decaying at its own rate."""
    n = secs(dur)
    t = np.arange(n) / SR
    x = np.zeros(n)
    for k, (a, d) in enumerate([(1, 1.6), (.42, 2.4), (.2, 3.4), (.11, 4.6), (.05, 6)], start=1):
        fk = f * k * (1 + 0.0006 * k * k)
        x += a * np.sin(2 * np.pi * fk * t + k) * np.exp(-t * d * (0.6 + 0.4 * (f / 440)))
    att = np.minimum(1, t / 0.006)
    hammer = lp(noise(n), 1400) * np.exp(-t * 90) * 0.06
    return vel * 0.28 * (x * att + hammer)


def marimba(f, dur=1.0, vel=0.7):
    n = secs(dur)
    t = np.arange(n) / SR
    x = np.sin(2 * np.pi * f * t) * np.exp(-t * 5) + 0.3 * np.sin(2 * np.pi * f * 3.93 * t) * np.exp(-t * 22) + 0.12 * np.sin(2 * np.pi * f * 9.2 * t) * np.exp(-t * 60)
    return vel * 0.3 * x * np.minimum(1, t / 0.002)


def bass(f, dur=0.8, vel=0.7):
    n = secs(dur)
    t = np.arange(n) / SR
    x = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 6)
    return vel * 0.4 * x * np.exp(-t * 3.2) * np.minimum(1, t / 0.008)


def hz(note):
    """'A3', 'F#4', 'Eb5' → Hz."""
    names = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}
    s = note[0].upper(); i = 1; semi = names[s]
    while i < len(note) and note[i] in '#b':
        semi += 1 if note[i] == '#' else -1; i += 1
    octv = int(note[i:])
    return 440.0 * 2 ** ((semi + 12 * (octv + 1) - 69) / 12)


# ---------------------------------------------------------------- mixing

class Mix:
    def __init__(self, dur):
        self.n = secs(dur) + SR  # a second of tail
        self.dry = np.zeros((2, self.n))
        self.wet = np.zeros((2, self.n))

    def add(self, x, at, gain=1.0, pan=0.0, verb=0.15):
        i = secs(at)
        if i >= self.n or len(x) == 0:
            return
        x = np.asarray(x) * gain
        k = min(len(x), self.n - i)
        l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        self.dry[0, i:i + k] += x[:k] * l * 1.414
        self.dry[1, i:i + k] += x[:k] * r * 1.414
        self.wet[0, i:i + k] += x[:k] * l * verb
        self.wet[1, i:i + k] += x[:k] * r * verb

    def room(self, rt=1.1, tone=5000):
        """one small room: a decaying, darkening noise impulse response, a little different per side."""
        n = secs(rt * 1.3)
        t = np.arange(n) / SR
        out = np.zeros_like(self.wet)
        for c in range(2):
            ir = lp(noise(n), tone) * np.exp(-t * 6.9 / rt)
            ir[:secs(0.012)] = 0
            ir /= np.sqrt(np.sum(ir ** 2))
            out[c] = signal.fftconvolve(self.wet[c], ir)[:self.n]
        return out

    def render(self, path, rt=1.1):
        y = self.dry + self.room(rt) * 0.9
        y = hp(y, 28)
        peak = np.max(np.abs(y)) or 1
        y = y / peak * 0.7   # headroom; mux.py sets the loudness
        write_wav(path, y)
        return y


def write_wav(path, y):
    import wave
    y = np.clip(y, -1, 1)
    data = (y.T * 32767).astype('<i2').tobytes()
    with wave.open(path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(data)


def cues(path):
    with open(path) as f:
        return json.load(f)
