import { useState } from "react";
import PropTypes from "prop-types";

const stripExtension = (filename) => filename.replace(/\.[^/.]+$/, "");

const guessNameArtist = (filename) => {
  const base = stripExtension(filename);
  const parts = base.split(" - ");
  if (parts.length >= 2) {
    return { artist: parts[0].trim(), name: parts.slice(1).join(" - ").trim() };
  }
  return { artist: "", name: base.trim() };
};

const AddTrackForm = ({ onAdd }) => {
  const [open, setOpen] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [imgFile, setImgFile] = useState(null);
  const [name, setName] = useState("");
  const [artist, setArtist] = useState("");
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setOpen(false);
    setAudioFile(null);
    setImgFile(null);
    setName("");
    setArtist("");
  };

  const handleAudioChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAudioFile(file);
    const guess = guessNameArtist(file.name);
    setName(guess.name);
    setArtist(guess.artist);
  };

  const handleSubmit = async (e) => {
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
        <input type="file" accept="audio/*" onChange={handleAudioChange} required />
      </label>

      {audioFile && (
        <>
          <input
            type="text"
            className="add-track-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Název skladby"
            required
          />
          <input
            type="text"
            className="add-track-input"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            placeholder="Interpret (nepovinné)"
          />
          <label className="add-track-file add-track-file-secondary">
            <i className="fa-solid fa-image"></i>
            <span>{imgFile ? imgFile.name : "Obal alba (nepovinné)"}</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImgFile(e.target.files?.[0] ?? null)}
            />
          </label>
          <div className="add-track-actions">
            <button type="button" className="add-track-cancel" onClick={reset} disabled={saving}>
              Zrušit
            </button>
            <button type="submit" className="add-track-save" disabled={saving}>
              {saving ? "Ukládám..." : "Přidat"}
            </button>
          </div>
        </>
      )}
    </form>
  );
};

AddTrackForm.propTypes = {
  onAdd: PropTypes.func.isRequired,
};

export default AddTrackForm;
