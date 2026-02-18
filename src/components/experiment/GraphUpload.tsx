import { useState } from "react";

interface GraphUploadProps {
  onUploadSuccess: () => void;
}

const GraphUpload = ({ onUploadSuccess }: GraphUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");

  const handleUpload = async () => {
    if (!file) {
      alert("Select a file first");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("studentId", "student123");
    formData.append("experimentId", "electrochemistry");

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        });



      const data = await response.json();

      if (data.fileUrl) {
        setImageUrl(data.fileUrl);
        onUploadSuccess();  // 🔥 marks tab completed
      }
    } catch (err) {
      console.error(err);
      alert("Upload failed.");
    }
  };

  return (
    <div>
      <input
        type="file"
        onChange={(e) => {
          if (e.target.files) {
            setFile(e.target.files[0]);
          }
        }}
      />

      <button onClick={handleUpload}>Upload</button>

      {imageUrl && (
        <img src={imageUrl} alt="Uploaded graph" width="300" />
      )}
    </div>
  );
};

export default GraphUpload;
