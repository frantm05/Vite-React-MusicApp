import { useState } from "react";
import type { AddTrackInput } from "../hooks/useCustomLibrary";

const MAX_AUDIO_BYTES = 50 * 1024 * 1024; // 50 MB
const MAX_IMG_BYTES = 5 * 1024 * 1024; // 5 MB

const stripExtension = (filename: string) => filename.replace(/\.[^/.]+$/, "");

const guessNameArtist = (filename: string) => {
  const base = stripExtension(filename);
  const parts = base.split(" - ");
  if (parts.length >= 2) {
    return { artist: parts[0].trim(), name: parts.slice(1).join(" - ").trim() };
  }
  return { artist: "", name: base.trim() };
};

interface AddTrackFormProps {
  onAdd: (input: AddTrackInput) => Promise<unknown>;
}

const AddTrackForm = ({ onAdd }: AddTrackFormProps) => {
  const [open, setOpen] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imgFile, setImgFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [artist, setArtist] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setOpen(false);
    setAudioFile(null);
    setImgFile(null);
    setName("");
    setArtist("");
    setError(null);
  };

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_AUDIO_BYTES) {
      setError("Zvukový soubor je příliš velký (limit 50 MB).");
      return;
    }
    setError(null);
    setAudioFile(file);
    const guess = guessNameArtist(file.name);
    setName(guess.name);
    setArtist(guess.artist);
  };

  const handleImgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file && file.size > MAX_IMG_BYTES) {
      setError("Obrázek je příliš velký (limit 5 MB).");
      return;
    }
    setError(null);
    setImgFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioFile || !name.trim()) return;
    setSaving(true);
    try {
      await onAdd({
        name: name.trim(),
        artist: artist.trim() || "Neznámý interpret",
        audioFile,
        imgFile,
      });
      reset();
    } catch {
      setError("Skladbu se nepodařilo uložit. Zkontroluj volné místo v prohlížeči.");
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <button type="button" className="add-track-btn" onClick={() => setOpen(true)}>
        <i className="fa-solid fa-plus"></i>
        <span>Přidat vlastní skladbu</span>
      </button>
    );
  }

  return (
    <form className="add-track-form" onSubmit={handleSubmit}>
      <label className="add-track-file">
        <i className="fa-solid fa-file-audio"></i>
        <span>{audioFile ? audioFile.name : "Vybrat zvukový soubor"}</span>
        <input type="file" accept="audio/*" onChange={handleAudioChange} required={!audioFile} />
      </label>

      {audioFile && (
        <>
          <input
            type="text"
            className="add-track-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Název skladby"
            aria-label="Název skladby"
            required
          />
          <input
            type="text"
            className="add-track-input"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            placeholder="Interpret (nepovinné)"
            aria-label="Interpret"
          />
          <label className="add-track-file add-track-file-secondary">
            <i className="fa-solid fa-image"></i>
            <span>{imgFile ? imgFile.name : "Obal alba (nepovinné)"}</span>
            <input type="file" accept="image/*" onChange={handleImgChange} />
          </label>
        </>
      )}

      {error && <p className="add-track-error">{error}</p>}

      <div className="add-track-actions">
        <button type="button" className="add-track-cancel" onClick={reset} disabled={saving}>
          Zrušit
        </button>
        {audioFile && (
          <button type="submit" className="add-track-save" disabled={saving}>
            {saving ? "Ukládám..." : "Přidat"}
          </button>
        )}
      </div>
    </form>
  );
};

export default AddTrackForm;
