import React, { useState, useRef } from "react";
import { Camera, Loader2, Link2 } from "lucide-react";

/**
 * Resizes an image file client-side using canvas and returns a compressed data URL.
 * No server upload needed — works without integration credits.
 */
function resizeImage(file, maxSize = 256, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        if (width > height) {
          if (width > maxSize) { height = Math.round(height * maxSize / width); width = maxSize; }
        } else {
          if (height > maxSize) { width = Math.round(width * maxSize / height); height = maxSize; }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        // PNG if original is PNG (preserve transparency), else JPEG
        const isPng = file.type === "image/png";
        const dataUrl = canvas.toDataURL(isPng ? "image/png" : "image/jpeg", quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error("Image invalide"));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error("Lecture du fichier échouée"));
    reader.readAsDataURL(file);
  });
}

export default function ProfilePhotoUpload({ value, onChange, googlePhotoUrl }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Veuillez sélectionner une image.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("L'image dépasse 10 Mo.");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const dataUrl = await resizeImage(file, 256, 0.8);
      onChange(dataUrl);
      setShowUrlInput(false);
    } catch (err) {
      setError(err.message || "Échec du traitement de l'image.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-border bg-secondary flex items-center justify-center flex-shrink-0"
        >
          {value ? (
            <img src={value} alt="" className="w-full h-full object-cover" />
          ) : (
            <Camera className="w-6 h-6 text-muted-foreground" />
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            </div>
          )}
        </button>
        <div className="flex-1 min-w-0">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="text-sm text-primary font-medium hover:underline"
          >
            {value ? "Changer la photo" : "Télécharger une photo"}
          </button>
          <div className="flex items-center gap-3 mt-1">
            {googlePhotoUrl && !value && (
              <button
                type="button"
                onClick={() => onChange(googlePhotoUrl)}
                className="text-xs text-muted-foreground hover:text-primary"
              >
                Utiliser ma photo Google
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
            >
              <Link2 className="w-3 h-3" /> URL
            </button>
          </div>
          {showUrlInput && (
            <input
              type="url"
              placeholder="https://...image.jpg"
              value={value && !value.startsWith("data:") ? value : ""}
              onChange={(e) => onChange(e.target.value)}
              className="mt-2 w-full h-9 rounded-lg bg-background border border-border px-3 text-xs text-white"
            />
          )}
          {error && <p className="text-xs text-destructive mt-1">{error}</p>}
        </div>
      </div>
    </div>
  );
}