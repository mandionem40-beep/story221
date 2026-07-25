import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Camera, Loader2, Link2 } from "lucide-react";

export default function ProfilePhotoUpload({ value, onChange, googlePhotoUrl }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("L'image dépasse 5 Mo.");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      onChange(file_url);
      setShowUrlInput(false);
    } catch {
      setError("Upload indisponible, utilisez une URL d'image.");
      setShowUrlInput(true);
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
          className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-border bg-secondary flex items-center justify-center flex-shrink-0 group"
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