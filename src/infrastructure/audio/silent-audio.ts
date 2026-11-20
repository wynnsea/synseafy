/**
 * A looping, silent <audio> element.
 *
 * While real music plays inside the (cross-origin) YouTube iframe, playing this
 * in the top-level page tells the browser the app itself is playing media:
 * it keeps the Media Session (lock-screen controls) attached to our page and
 * makes the browser less likely to suspend the page in the background.
 */

let url: string | null = null;

/** 10 s of 8 kHz, 8-bit mono silence as a WAV blob URL (~80 KB, built once). */
function silentWavUrl(): string {
  if (url) return url;
  const sampleRate = 8000;
  const samples = sampleRate * 10;
  const buffer = new ArrayBuffer(44 + samples);
  const view = new DataView(buffer);
  const write = (offset: number, text: string) =>
    [...text].forEach((ch, i) => view.setUint8(offset + i, ch.charCodeAt(0)));

  write(0, "RIFF");
  view.setUint32(4, 36 + samples, true);
  write(8, "WAVE");
  write(12, "fmt ");
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate, true); // byte rate
  view.setUint16(32, 1, true); // block align
  view.setUint16(34, 8, true); // bits per sample
  write(36, "data");
  view.setUint32(40, samples, true);
  new Uint8Array(buffer, 44).fill(128); // 8-bit PCM silence

  url = URL.createObjectURL(new Blob([buffer], { type: "audio/wav" }));
  return url;
}

export function createSilentAudio(): HTMLAudioElement {
  const audio = new Audio(silentWavUrl());
  audio.loop = true;
  audio.preload = "auto";
  audio.setAttribute("playsinline", "");
  return audio;
}
